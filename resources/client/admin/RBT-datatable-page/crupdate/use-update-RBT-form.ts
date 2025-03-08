import {useForm} from 'react-hook-form';
import {
  UpdateRBTPayload,
  UpdateRBTResponse,
  useUpdateRBT,
} from '@app/admin/RBT-datatable-page/requests/use-update-RBT';
import {RBT} from '@app/web-player/RBT/RBT';
import {CreateRBTPayload} from '@app/admin/RBT-datatable-page/requests/use-create-RBT';

interface Options {
  onRBTUpdated?: (response: UpdateRBTResponse) => void;
}

export function useUpdateRBTForm(
  RBT: UpdateRBTPayload | CreateRBTPayload | Omit<RBT, 'lyric'>,
  options: Options = {}
) {
  const form = useForm<UpdateRBTPayload>({
    defaultValues: {
      ...RBT,
      image: RBT.image || (RBT as RBT).album?.image,
    },
  });
  const updateRBT = useUpdateRBT(form, {onSuccess: options.onRBTUpdated});
  return {form, updateRBT};
}
