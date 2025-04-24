import {RBT} from '@app/web-player/RBT/RBT';
import {useContext, useMemo} from 'react';
import {TableContext} from '@common/ui/tables/table-context';
import {
  RBTContextDialog,
  RBTContextDialogProps,
} from '@app/web-player/RBT/context-dialog/RBT-context-dialog';

interface TableRBTContextDialogProps
  extends Omit<RBTContextDialogProps, 'RBT'> {}
export function TableRBTContextDialog({
  children,
  ...props
}: TableRBTContextDialogProps) {
  const {selectedRows, data} = useContext(TableContext);
  const RBT = useMemo(() => {
    return selectedRows
      .map(RBTId => data.find(RBT => RBT.id === RBTId))
      .filter(t => !!t) as RBT[];
  }, [selectedRows, data]);
  return (
    <RBTContextDialog {...props} RBT={RBT}>
      {children}
    </RBTContextDialog>
  );
}
