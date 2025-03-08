import {useForm} from 'react-hook-form';
import {
  CreateRBTPayload,
  CreateRBTResponse,
  useCreateRBT,
} from '@app/admin/RBT-datatable-page/requests/use-create-RBT';

interface Props {
  onRBTCreated?: (response: CreateRBTResponse) => void;
  defaultValues?: Partial<CreateRBTPayload>;
}

export function useCreateRBTForm({
  onRBTCreated,
  defaultValues,
}: Props = {}) {
  const form = useForm<CreateRBTPayload>({
    defaultValues,
  });
  const createRBT = useCreateRBT(form, {onSuccess: onRBTCreated});
  return {form, createRBT};
}
