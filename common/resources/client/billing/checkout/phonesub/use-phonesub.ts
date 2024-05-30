import {useEffect, useRef, useState} from 'react';
import {useAuth} from '../../../auth/use-auth';
import {apiClient} from '../../../http/query-client';
import {useSelectedLocale} from '../../../i18n/selected-locale';
import {useSettings} from '../../../core/settings/use-settings';
import {useIsDarkMode} from '../../../ui/themes/use-is-dark-mode';
import {Button} from '../../../ui/buttons/button';

interface UsePhonesubProps {
  type?:    string;
  priceId?: string;
}

export interface PhonesubResponse {
  status?: string;
  message?: string;
  error?: {
    message: string;
    type:    string;
  };
  subscriptionId?: string;
}

export interface PhonesubPayload {
  auth_code?: string
}

export function usePhonesub({type, priceId}: UsePhonesubProps) {
  const {user} = useAuth();
  const isDarkMode = useIsDarkMode();
  const isInitiatedRef = useRef<boolean>(false);
  const paymentElementRef = useRef<HTMLDivElement>(null);
  const {localeCode} = useSelectedLocale();
  const {
    branding: {site_name},
    billing: {
      phonesub: {enable},
    },
  } = useSettings();

  const subscribeStart = async (): Promise<PhonesubResponse> => {
    const response = await apiClient.post('billing/phonesub/subscribe-start', {price_id:priceId});

    return response.data;
  }

  const subscribeVerify = async ({auth_code}: PhonesubPayload): Promise<PhonesubResponse> => {
    const response = await apiClient.post('billing/phonesub/subscribe-verify', {price_id:priceId, auth_code});

    return response.data;
  }

  const syncSubscriptionDetails = () => {
    return apiClient.post('billing/phonesub/sync-subscription-details', {
      price_id: priceId,
    });
  }

  return {
    phonesub: {subscribeStart, subscribeVerify, syncSubscriptionDetails},
    paymentElementRef,
    phonesubIsEnabled: enable,
  };
}
