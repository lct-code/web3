import {useQuery} from '@tanstack/react-query';
import {apiClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {useParams} from 'react-router-dom';
import {RBT} from '@app/web-player/RBT/RBT';
import {assignAlbumToRBT} from '@app/web-player/albums/assign-album-to-RBT';
import {getBootstrapData} from '@common/core/bootstrap-data/use-backend-bootstrap-data';

export interface getRBTResponse extends BackendResponse {
  RBT: RBT;
  loader: Params['loader'];
}

interface Params {
  loader: 'RBT' | 'RBTPage' | 'editRBTPage';
}

export function useRBT(params: Params) {
  const {RBTId} = useParams();
  return useQuery({
    queryKey: ['RBT', +RBTId!, params],
    queryFn: () => fetchRBT(RBTId!, params),
    initialData: () => {
      const data = getBootstrapData().loaders?.[params.loader];
      if (data?.RBT?.id == RBTId && data?.loader === params.loader) {
        return data;
      }
      return undefined;
    },
  });
}

function fetchRBT(RBTId: number | string, params: Params) {
  return apiClient
    .get<getRBTResponse>(`RBT/${RBTId}`, {params})
    .then(response => {
      if (response.data.RBT.album) {
        response.data.RBT = {
          ...response.data.RBT,
          album: assignAlbumToRBT(response.data.RBT.album),
        };
      }
      return response.data;
    });
}
