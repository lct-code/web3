import {Radio} from '../../ui/forms/radio-group/radio';
import {UpsellBillingCycle} from './find-best-price';
import {Trans} from '../../i18n/trans';
import {
  RadioGroup,
  RadioGroupProps,
} from '../../ui/forms/radio-group/radio-group';
import {UpsellLabel} from './upsell-label';
import {Product} from '../product';
import {Price} from '../price';

interface BillingCycleRadioProps extends Omit<RadioGroupProps, 'children'> {
  selectedCycle: UpsellBillingCycle;
  onChange: (value: UpsellBillingCycle) => void;
  products?: Product[];
}
export function BillingCycleRadio({
  selectedCycle,
  onChange,
  products,
  ...radioGroupProps
}: BillingCycleRadioProps) {
  const cyclesHavingPlans = calculateCyclesHavingPlans(products);

  return (
    <RadioGroup {...radioGroupProps}>
      {cyclesHavingPlans.includes('yearly') && (
      <Radio
        value="yearly"
        checked={selectedCycle === 'yearly'}
        onChange={e => {
          onChange(e.target.value as UpsellBillingCycle);
        }}
      >
        <Trans message="Annual" />
        <UpsellLabel products={products} cycle="yearly" />
      </Radio>
      )}
      {cyclesHavingPlans.includes('quarterly') && (
      <Radio
        value="quarterly"
        checked={selectedCycle === 'quarterly'}
        onChange={e => {
          onChange(e.target.value as UpsellBillingCycle);
        }}
      >
        <Trans message="Quarterly" />
        <UpsellLabel products={products} cycle="quarterly" />
      </Radio>
      )}
      {cyclesHavingPlans.includes('monthly') && (
      <Radio
        value="monthly"
        checked={selectedCycle === 'monthly'}
        onChange={e => {
          onChange(e.target.value as UpsellBillingCycle);
        }}
      >
        <Trans message="Monthly" />
        <UpsellLabel products={products} cycle="monthly" />
      </Radio>
      )}
      {cyclesHavingPlans.includes('weekly') && (
      <Radio
        value="weekly"
        checked={selectedCycle === 'weekly'}
        onChange={e => {
          onChange(e.target.value as UpsellBillingCycle);
        }}
      >
        <Trans message="Weekly" />
        <UpsellLabel products={products} cycle="weekly" />
      </Radio>
      )}
      {cyclesHavingPlans.includes('daily') && (
      <Radio
        value="daily"
        checked={selectedCycle === 'daily'}
        onChange={e => {
          onChange(e.target.value as UpsellBillingCycle);
        }}
      >
        <Trans message="Daily" />
      </Radio>
      )}
    </RadioGroup>
  );
}

function calculateCyclesHavingPlans(products: Product[] = []) {
  return products.filter(product => !product.hidden).reduce((acc, product) => {
    const cycles = product.prices.map(getPriceCycleType);
    return acc.concat(cycles);
  }, [] as string[]);
}

function getPriceCycleType(price: Price) {
  switch (price.interval) {
    case 'day':
      return 'daily';
    case 'week':
      return 'weekly';
    case 'month':
      return price.interval_count == 3 ? 'quarterly' : 'monthly';
    case 'year':
      return 'yearly';
    default:
      return price.interval;
  }
}
