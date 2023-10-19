import {CheckoutLayout} from '../checkout-layout';
import {useParams, useSearchParams} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {message} from '@common/i18n/message';
import {CheckoutProductSummary} from '../checkout-product-summary';
import {
  BillingRedirectMessage,
  BillingRedirectMessageConfig,
} from '../../billing-redirect-message';
import {apiClient} from '@common/http/query-client';
import {useBootstrapData} from '@common/core/bootstrap-data/bootstrap-data-context';
import {useLocalStorage} from '@common/utils/hooks/local-storage';

export function CheckoutPhonesubDone() {
  const {invalidateBootstrapData} = useBootstrapData();
  const {productId, priceId} = useParams();
  const [params] = useSearchParams();

  const [messageConfig, setMessageConfig] =
    useState<BillingRedirectMessageConfig>();

  const [syncInterval, setSyncInterval] =
    useState<ReturnType<typeof setInterval>>();

  const [redirectedFrom, setRedirectedFrom] = useLocalStorage<string>('redirectedFrom');

  useEffect(() => {
    const subscriptionId = params.get('subscriptionId');
    const status = params.get('status');
    setMessageConfig(getRedirectMessageConfig(status, productId, priceId, redirectedFrom));

    if (subscriptionId && status === 'verified') {
      console.log('verified', syncInterval);
      syncInterval || setSyncInterval(setInterval(() => {
        syncSubscriptionDetails(subscriptionId).then((resp) => {
          console.log('sync succ', resp);
          clearInterval(syncInterval);
          setMessageConfig(getRedirectMessageConfig('success', productId, priceId, redirectedFrom));
        }, (err) => {
          console.log('sync err', err);
        });
      }, 1000));

      setTimeout(() => {
        clearInterval(syncInterval);
        setMessageConfig(getRedirectMessageConfig('error', productId, priceId, redirectedFrom));
      }, 15000);
    }
    if (subscriptionId && status === 'success') {
      storeSubscriptionDetailsLocally(subscriptionId).then(() => {
        invalidateBootstrapData();
      });
    }
  }, [priceId, productId, params, invalidateBootstrapData]);

  return (
    <CheckoutLayout>
      <BillingRedirectMessage config={messageConfig} />
      <CheckoutProductSummary showBillingLine={false} />
    </CheckoutLayout>
  );
}

function getRedirectMessageConfig(
  status?: string | null,
  productId?: string,
  priceId?: string,
  link?: string
): BillingRedirectMessageConfig {
  switch (status) {
    case 'success':
      return {
        message: message('Subscription successful!'),
        status: 'success',
        buttonLabel: message('Return to site'),
        link: link ?? '/billing',
      };
    case 'verified':
      return {
        message: message('Verification complete, waiting for subscription server...'),
        status: 'pending',
        buttonLabel: message('Return to site'),
        link: link ?? '/billing',
      };
    default:
      return {
        message: message('Something went wrong. Please try again.'),
        status: 'error',
        buttonLabel: message('Go back'),
        link: errorLink(productId, priceId),
      };
  }
}

function errorLink(productId?: string, priceId?: string): string {
  return productId && priceId ? `/checkout/${productId}/${priceId}` : '/';
}

function syncSubscriptionDetails(subscriptionId: string) {
  return apiClient.post('billing/phonesub/sync-subscription-details', {
    phonesub_subscription_id: subscriptionId,
  });
}

function storeSubscriptionDetailsLocally(subscriptionId: string) {
  return apiClient.post('billing/phonesub/store-subscription-details-locally', {
    phonesub_subscription_id: subscriptionId,
  });
}

