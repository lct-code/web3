import { useEffect, useState } from 'react';
import {useSettings} from '@common/core/settings/use-settings';

export const usePaymentMethods = () => {
  const {
    billing: {stripe, phonesub, paypal, zain_sd},
  } = useSettings();

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'paypal', name: 'Paypal', enabled: paypal.enable },
    { id: 'stripe', name: 'Stripe', enabled: stripe.enable},
    { id: 'phonesub', name: 'Phonesub', enabled: phonesub.enable},
    { id: 'zain_sd', name: 'Zain SD', enabled: zain_sd?.enable},
  ]);

  return paymentMethods;
};