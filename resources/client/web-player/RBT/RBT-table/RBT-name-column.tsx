import {NameWithAvatar} from '@common/datatable/column-templates/name-with-avatar';
import React from 'react';
import {RBT} from '@app/web-player/RBT/RBT';
import clsx from 'clsx';
import {useRBTTableMeta} from '@app/web-player/RBT/RBT-table/use-RBT-table-meta';
import {getRBTImageSrc} from '@app/web-player/RBT/RBT-image/RBT-image';
import {useIsRBTCued} from '@app/web-player/RBT/hooks/use-is-RBT-cued';

interface RBTNameColumnProps {
  RBT: RBT;
}
export function RBTNameColumn({RBT}: RBTNameColumnProps) {
  const {hideRBTImage, queueGroupId} = useRBTTableMeta();
  const isCued = useIsRBTCued(RBT.id, queueGroupId);

  return (
    <NameWithAvatar
      image={!hideRBTImage ? getRBTImageSrc(RBT) : undefined}
      label={RBT.name}
      avatarSize="w-40 h-40 md:w-32 md:h-32"
      description={
        <span className="md:hidden">
          {RBT.artists?.map(a => a.name).join(', ')}
        </span>
      }
      labelClassName={clsx(
        isCued && 'text-primary',
        'max-md:text-[15px] max-md:leading-6',
      )}
    />
  );
}
