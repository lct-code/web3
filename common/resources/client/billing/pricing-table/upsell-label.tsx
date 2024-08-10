// find the highest percentage decrease between monthly and yearly prices of specified products
import {Product} from '../product';
import {findBestPrice, yearlyPriceAmount, UpsellBillingCycle} from './find-best-price';
import {Fragment, memo} from 'react';
import {Trans} from '../../i18n/trans';

interface UpsellLabelProps {
  products?: Product[];
  cycle?: UpsellBillingCycle;
}

export const UpsellLabel = memo(({products, cycle}: UpsellLabelProps) => {
  const upsellPercentage = calcHighestUpsellPercentage(products, cycle);

  if (upsellPercentage <= 0) {
    return null;
  }

  return (
    <Fragment>
      <span className="text-positive-darker font-medium">
        {' '}
        (
        <Trans
          message="Save up to :percentage%"
          values={{percentage: upsellPercentage}}
        />
        )
      </span>
    </Fragment>
  );
});

function calcHighestUpsellPercentage(products?: Product[], cycle?: UpsellBillingCycle) {
  if (!products?.length) return 0;
  if (!cycle) {
    cycle = 'yearly';
  }

  const decreases = products.map(product => {
    if (product.hidden) return 0;

    const bestPrice = {
      'daily': findBestPrice('daily', product.prices),
      'weekly': findBestPrice('weekly', product.prices),
      'monthly': findBestPrice('monthly', product.prices),
      'quarterly': findBestPrice('quarterly', product.prices),
      'yearly': findBestPrice('yearly', product.prices),
    }

    if (!bestPrice[cycle]) return 0;

    // all plans per year amount
    const amountPerYear = {
      'daily': yearlyPriceAmount(bestPrice.daily),
      'weekly': yearlyPriceAmount(bestPrice.weekly),
      'monthly': yearlyPriceAmount(bestPrice.monthly),
      'quarterly': yearlyPriceAmount(bestPrice.quarterly),
      'yearly': yearlyPriceAmount(bestPrice.yearly),
    }
    if (!amountPerYear[cycle]) return 0;

    //const worstAmount = Object.values(amountPerYear).filter(Boolean).reduce((max, current) => Math.max(max, current??0), 0);
    //const worstAmount = Math.max(...Object.values(amountPerYear).filter(Boolean));
    //
    // find the worst (highest) amount
    let worstAmount = 0;
    for (const [key, value] of Object.entries(amountPerYear)) {
      if (!value) continue;
      if (value > worstAmount) {
        worstAmount = value;
      }
    }
    if (!worstAmount) return 0;

    const savingsPercentage = Math.round(
      ((worstAmount - (amountPerYear[cycle] ?? worstAmount)) / worstAmount) * 100
    );

    if (savingsPercentage > 0 && savingsPercentage <= 200) {
      return savingsPercentage;
    }

    return 0;
  });

  return Math.max(Math.max(...decreases), 0);
}

