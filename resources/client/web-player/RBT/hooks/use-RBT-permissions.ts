import {useMemo} from 'react';
import {useAuth} from '@common/auth/use-auth';
import {RBT} from '@app/web-player/RBT/RBT';

export function useRBTPermissions(RBT: (RBT | undefined)[]) {
  const {user, hasPermission} = useAuth();

  return useMemo(() => {
    const permissions = {
      canEdit: true,
      canDelete: true,
      managesRBT: true,
    };
    RBT.every(RBT => {
      if (!RBT) {
        permissions.canEdit = false;
        permissions.canDelete = false;
        permissions.managesRBT = false;
        return;
      }

      const RBTArtistIds = RBT.artists?.map(a => a.id);
      const managesRBT =
        RBT.owner_id === user?.id ||
        !!user?.artists?.find(a => RBTArtistIds?.includes(a.id as number));

      if (!managesRBT) {
        permissions.managesRBT = false;
      }

      if (
        !hasPermission('RBT.update') &&
        !hasPermission('music.update') &&
        !managesRBT
      ) {
        permissions.canEdit = false;
      }

      if (
        !hasPermission('RBT.delete') &&
        !hasPermission('music.delete') &&
        !managesRBT
      ) {
        permissions.canDelete = false;
      }
    });
    return permissions;
  }, [user, RBT, hasPermission]);
}
