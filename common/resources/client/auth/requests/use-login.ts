import {useMutation} from '@tanstack/react-query';
import {UseFormReturn} from 'react-hook-form';
import {BackendResponse} from '../../http/backend-response/backend-response';
import {onFormQueryError} from '../../errors/on-form-query-error';
import {useNavigate} from '../../utils/hooks/use-navigate';
import {apiClient} from '../../http/query-client';
import {useAuth} from '../use-auth';
import {useBootstrapData} from '../../core/bootstrap-data/bootstrap-data-context';
import {toast} from '../../ui/toast/toast';

interface Response extends BackendResponse {
  bootstrapData: string;
}

export interface LoginPayload {
  email?: string;
  password?: string;
  phone: string;
  remember: boolean;
  token_name: string;
}

export function useLogin(form: UseFormReturn<LoginPayload>) {
  const navigate = useNavigate();
  const {getRedirectUri} = useAuth();
  const {setBootstrapData} = useBootstrapData();
  return useMutation(login, {
    onSuccess: response => {
      setBootstrapData(response.bootstrapData);
      navigate(getRedirectUri(), {replace: true});
    },
    onError: (r: any) => {
      if (r?.response?.data?.redirectMessage) {
        toast.positive(r?.response?.data?.redirectMessage);
      }
      if (r?.response?.data?.redirectUri) {
        navigate(r?.response?.data?.redirectUri);
      }
      return onFormQueryError(r, form);
    }
  });
}

function login(payload: LoginPayload): Promise<Response> {
  let phone_token = (payload.phone.match(/^\+/) ? '' : '966') + payload.phone.replace(/[^0-9]/,'');
  payload.email = phone_token + '@dohaty-sa.com';
  payload.password = phone_token + '-secret';
  return apiClient.post('auth/login', payload).then(response => response.data);
}
