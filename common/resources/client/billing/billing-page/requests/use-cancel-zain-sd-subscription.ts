import {useMutation} from '@tanstack/react-query';
import {apiClient} from '../../../http/query-client';
import {useTrans} from '../../../i18n/use-trans';
import {BackendResponse} from '../../../http/backend-response/backend-response';
import {toast} from '../../../ui/toast/toast';
import {message} from '../../../i18n/message';
import {showHttpErrorToast} from '../../../utils/http/show-http-error-toast';
import {invalidateBootstrapData} from '../../../core/bootstrap-data/use-backend-bootstrap-data';
import {invalidateBillingUserQuery} from '../use-billing-user';

interface Response extends BackendResponse {
  success: boolean;
  message: string;
}

interface Payload {
  subscription_id: string;
}

export function useCancelZainSdSubscription() {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (props: Payload) => cancelSubscription(props),
    onSuccess: () => {
      toast(trans(message('Subscription cancelled successfully.')));
      invalidateBootstrapData();
      invalidateBillingUserQuery();
    },
    onError: err => showHttpErrorToast(err, undefined, 'message'),
  });
}

function cancelSubscription(payload: Payload): Promise<Response> {
  return apiClient
    .post('billing/zain-sd/cancel-subscription', payload)
    .then(r => r.data);
} 