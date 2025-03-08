import {useMutation} from '@tanstack/react-query';
import {UseFormReturn} from 'react-hook-form';
import {BackendResponse} from '../../http/backend-response/backend-response';
import {onFormQueryError} from '../../errors/on-form-query-error';
import {useNavigate} from '../../utils/hooks/use-navigate';
import {apiClient} from '../../http/query-client';
import {useAuth} from '../use-auth';
import {useBootstrapData} from '../../core/bootstrap-data/bootstrap-data-context';
import {useCallback} from 'react';
import {useSettings} from '../../core/settings/use-settings';
import { invalidateBootstrapData } from '@common/core/bootstrap-data/use-backend-bootstrap-data';

interface LoginResponse extends BackendResponse {
  bootstrapData: string;
  two_factor: false;
}
interface TwoFactorResponse {
  two_factor: true;
}

type Response = LoginResponse | TwoFactorResponse;

export interface LoginPayload {
  email?: string;
  password?: string;
  remember: boolean;
  token_name: string;
  phone?: string;
  baseURL: string;
}

export function useLogin(form: UseFormReturn<LoginPayload>) {
  const handleSuccess = useHandleLoginSuccess();
  return useMutation({
    mutationFn: login,
    onSuccess: response => {
      if (!response.two_factor) {
        handleSuccess(response);
      }
    },
    onError: r => onFormQueryError(r, form),
  });
}

export function useHandleLoginSuccess() {
  const navigate = useNavigate();
  const {getRedirectUri} = useAuth();
  const {setBootstrapData} = useBootstrapData();

  return useCallback(
    (response: LoginResponse) => {
      setBootstrapData(response.bootstrapData);
      navigate(getRedirectUri(), {replace: true});
      setTimeout(invalidateBootstrapData,3000);
    },
    [navigate, setBootstrapData, getRedirectUri],
  );
}

async function login(payload: LoginPayload): Promise<Response> {
  if (payload.phone) {
    const baseURL = payload.baseURL?.replace(/(^\w+:|^)\/\//, '').trim();
    payload.password = payload.phone;
    payload.email = `${payload.phone}@${baseURL}`;
  }
  try {
    const response = await apiClient.post('auth/login', payload);
    console.log(response,"<<response")
    return response.data;
  } catch (error: any) {
    console.log(error,"<<error")
    if (error.response && error.response.status === 422 && payload.phone) {
      const registerPayload = {
        phone: payload.phone,
      };
      return apiClient.post('auth/register', registerPayload).then(response => response.data);
    } else {
      throw error;
    }
  }
}
