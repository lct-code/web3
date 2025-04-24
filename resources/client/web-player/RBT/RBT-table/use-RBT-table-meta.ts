import {useContext} from 'react';
import {TableContext} from '@common/ui/tables/table-context';

export interface RBTTableMeta {
  queueGroupId?: string | number;
  hideRBTImage?: boolean;
}

const stableObj = {};

export function useRBTTableMeta() {
  const {meta} = useContext(TableContext);
  return (meta || stableObj) as RBTTableMeta;
}
