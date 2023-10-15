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
  bootstrapData?: string;
  message?: string;
  status: 'success' | 'needs_subscription';
  redirectUri?: string;
}

export interface RegisterPayloadPhone {
  phone: string;
  subscription?: string;
  password?: string;
  password_confirmation?: string;
}

export function useRegisterPhone(form: UseFormReturn<RegisterPayloadPhone>) {
  const navigate = useNavigate();
  const {getRedirectUri} = useAuth();
  const {setBootstrapData} = useBootstrapData();

  return useMutation(register, {
    onSuccess: response => {
      setBootstrapData(response.bootstrapData!);
      if (response.message) {
        toast.positive(response.message);
      }
      if (response.redirectUri) {
        navigate(response.redirectUri);
      } else {
        navigate(getRedirectUri(), {replace: true});
      }
    },
    onError: r => onFormQueryError(r, form),
  });
}

function register(payload: RegisterPayloadPhone): Promise<Response> {
  return apiClient
    .post('auth/register', payload)
    .then(response => response.data);
}

