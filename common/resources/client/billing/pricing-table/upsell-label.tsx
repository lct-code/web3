// find the highest percentage decrease between monthly and yearly prices of specified products
import {Product} from '../product';
import {findBestPrice, UpsellBillingCycleList, UpsellBillingCycle} from './find-best-price';
import {Fragment, memo} from 'react';
import {Trans} from '../../i18n/trans';

interface UpsellLabelProps {
  products: Product[];
  cycle: UpsellBillingCycle;
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

function calcHighestUpsellPercentage(products: Product[], cycle: UpsellBillingCycle) {
  if (!products?.length) return 0;
  if (!cycle) {
    cycle = 'yearly';
  }

  const decreases = products.map(product => {
    const bestPrice = {
      'daily': findBestPrice('daily', product.prices),
      'weekly': findBestPrice('weekly', product.prices),
      'monthly': findBestPrice('monthly', product.prices),
      'yearly': findBestPrice('yearly', product.prices),
    }

    if (!bestPrice[cycle]) return 0;

    // all plans per year amount
    const amountPerYear = {
      'daily': (bestPrice.daily?.amount ?? 0) * 365,
      'weekly': (bestPrice.weekly?.amount ?? 0) * 52,
      'monthly': (bestPrice.monthly?.amount ?? 0) * 12,
      'yearly': bestPrice.yearly?.amount ?? 0,
    }

    const worstAmount = Object.entries(amountPerYear).reduce((max, [key, current]) => Math.max(max, current), 0);

    const savingsPercentage = Math.round(
      ((worstAmount - amountPerYear[cycle]) / worstAmount) * 100
    );

    if (savingsPercentage > 0 && savingsPercentage <= 200) {
      return savingsPercentage;
    }

    return 0;
  });

  return Math.max(Math.max(...decreases), 0);
}
