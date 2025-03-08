import {BackendResponse} from '@common/http/backend-response/backend-response';
import {useMutation} from '@tanstack/react-query';
import {toast} from '@common/ui/toast/toast';
import {message} from '@common/i18n/message';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/utils/http/show-http-error-toast';
import {useLocation} from 'react-router-dom';
import {useNavigate} from '@common/utils/hooks/use-navigate';
import {useAuth} from '@common/auth/use-auth';

interface Response extends BackendResponse {}

interface Payload {
  RBTIds: number[];
}

export function useDeleteRBT() {
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const {getRedirectUri} = useAuth();

  return useMutation({
    mutationFn: (payload: Payload) => deleteRBT(payload),
    onSuccess: async (response, {RBTIds}) => {
      await queryClient.invalidateQueries({queryKey: ['RBT']});
      await queryClient.invalidateQueries({queryKey: ['channel']});
      toast(
        message('[one RBT|other :count RBT] deleted', {
          values: {count: RBTIds.length},
        }),
      );
      // navigate to homepage if we are on this RBT page currently
      if (RBTIds.some(RBTId => pathname.startsWith(`/RBT/${RBTId}`))) {
        navigate(getRedirectUri());
      }
    },
    onError: r => showHttpErrorToast(r),
  });
}

function deleteRBT({RBTIds}: Payload): Promise<Response> {
  return apiClient.delete(`RBT/${RBTIds.join(',')}`).then(r => r.data);
}
