import {Price} from '../price';

export type UpsellBillingCycle = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

const intervalMultipliers = {
    'year': 1,
    'month': 12,
    'week': 52,
    'day': 365,
}

export function yearlyPriceAmount(price: Price) {
    if (!price) return;
    return price.amount * intervalMultipliers[price.interval] / price.interval_count;
}

export function findBestPrice(
  token: UpsellBillingCycle,
  prices: Price[]
): Price | undefined {
  if (token === 'daily') {
    const match = findDailyPrice(prices);
    if (match) return match;
  }

  if (token === 'weekly') {
    const match = findWeeklyPrice(prices);
    if (match) return match;
  }

  if (token === 'monthly') {
    const match = findMonthlyPrice(prices);
    if (match) return match;
  }

  if (token === 'quarterly') {
    const match = findQuarterlyPrice(prices);
    if (match) return match;
  }

  if (token === 'yearly') {
    const match = findYearlyPrice(prices);
    if (match) return match;
  }

  return;
  // return prices.sort((a,b) => yearlyPriceAmount(a) < yearlyPriceAmount(b) ? -1 : 1)[0];
}

function findYearlyPrice(prices: Price[]) {
  return prices.find(price => {
    if (price.interval === 'day' && price.interval_count >= 365) {
      return price;
    }
    if (price.interval === 'week' && price.interval_count >= 52) {
      return price;
    }
    if (price.interval === 'month' && price.interval_count >= 12) {
      return price;
    }
    if (price.interval === 'year' && price.interval_count >= 1) {
      return price;
    }
  });
}

function findQuarterlyPrice(prices: Price[]) {
  return prices.find(price => {
    if (price.interval === 'day' && price.interval_count >= 90) {
      return price;
    }
    if (price.interval === 'week' && price.interval_count >= 13) {
      return price;
    }
    if (price.interval === 'month' && price.interval_count >= 3) {
      return price;
    }
  });
}

function findMonthlyPrice(prices: Price[]) {
  return prices.find(price => {
    if (price.interval === 'day' && price.interval_count >= 30) {
      return price;
    }
    if (price.interval === 'week' && price.interval_count >= 4) {
      return price;
    }
    if (price.interval === 'month' && price.interval_count >= 1) {
      return price;
    }
  });
}

function findWeeklyPrice(prices: Price[]) {
  return prices.find(price => {
    if (price.interval === 'day' && price.interval_count >= 7) {
      return price;
    }
    if (price.interval === 'week' && price.interval_count >= 1) {
      return price;
    }
  });
}

function findDailyPrice(prices: Price[]) {
  return prices.find(price => {
    if (price.interval === 'day' && price.interval_count >= 1) {
      return price;
    }
  });
}

