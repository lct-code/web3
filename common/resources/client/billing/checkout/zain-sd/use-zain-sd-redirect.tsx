import {useSearchParams} from 'react-router-dom';
import {useEffect} from 'react';
import {apiClient} from '../../../http/query-client';
import {toast} from '../../../ui/toast/toast';
import {message} from '../../../i18n/message';
import {useNavigate} from 'react-router-dom';
import { useBootstrapData } from '@common/core/bootstrap-data/bootstrap-data-context';
import { invalidateBootstrapData } from '@common/core/bootstrap-data/use-backend-bootstrap-data';

export function useZainSdRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {data} = useBootstrapData();

  useEffect(() => {
    const msisdn = searchParams.get('msisdn');
    const productCode = data.environment.DEFAULT_REDIRECT_PRODUCT_CODE;
    
    if (msisdn) {
      // Clear the query parameters
      navigate('/', {replace: true});
      
      // Sync with backend
      apiClient
        .post('billing/zain-sd/sync-subscription-details', {
          phone: msisdn,
          product_code: productCode,
        })
        .then(response => {
          if (response.data.subscription) {
            toast(message('Subscription activated successfully'));
            invalidateBootstrapData();
          }
        })
        .catch(err => {
          // Error handling similar to other gateways
          console.log("🚀 ~ file: use-zain-sd-redirect.tsx:43 ~ useEffect ~ err:", err);
          if (err?.response?.data?.error?.message) {
            toast.danger(err.response.data.error.message);
          }
        });
    }
  }, [data.environment.DEFAULT_REDIRECT_PRODUCT_CODE, navigate, searchParams]);

  return null;
} 