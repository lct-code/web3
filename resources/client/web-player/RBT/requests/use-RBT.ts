import {useQuery} from '@tanstack/react-query';
import {apiClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {useAuth} from '@common/auth/use-auth';
import { RBT } from '@app/web-player/RBT/RBT';

interface GetRBTResponse extends BackendResponse {
  RBTs: RBT[];
}

export function useRBT() {
  const {isLoggedIn, user} = useAuth();
  return useQuery({
    queryKey: ['RBT'],
    queryFn: () => fetchRBT(),
  });
}

function fetchRBT(): Promise<GetRBTResponse> {
  return apiClient
    .get('RBT', {params: {perPage: 100}} )
    .then(response => {
    console.log(response)
      return {RBTs: response.data.pagination.data};
    });
}
