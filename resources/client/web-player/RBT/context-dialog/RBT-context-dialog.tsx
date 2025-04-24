import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {Trans} from '@common/i18n/trans';
import {RBT} from '@app/web-player/RBT/RBT';
import {
  ContextDialogLayout,
  ContextMenuButton,
  ContextMenuLayoutProps,
} from '@app/web-player/context-dialog/context-dialog-layout';
import {PlaylistPanelButton} from '@app/web-player/context-dialog/playlist-panel';
import {CopyLinkMenuButton} from '@app/web-player/context-dialog/copy-link-menu-button';
import {getRBTLink, RBTLink} from '@app/web-player/RBT/RBT-link';
import {RBTImage} from '@app/web-player/RBT/RBT-image/RBT-image';
import {useRBTPermissions} from '@app/web-player/RBT/hooks/use-RBT-permissions';
import {AddToQueueButton} from '@app/web-player/context-dialog/add-to-queue-menu-button';
import React, {Fragment, ReactNode, useCallback} from 'react';
import {ToggleInLibraryMenuButton} from '@app/web-player/context-dialog/toggle-in-library-menu-button';
import {ToggleRepostMenuButton} from '@app/web-player/context-dialog/toggle-repost-menu-button';
import {getRadioLink} from '@app/web-player/radio/get-radio-link';
import {useShouldShowRadioButton} from '@app/web-player/RBT/context-dialog/use-should-show-radio-button';
import {useDialogContext} from '@common/ui/overlays/dialog/dialog-context';
import {openDialog} from '@common/ui/overlays/store/dialog-store';
import {ConfirmationDialog} from '@common/ui/overlays/dialog/confirmation-dialog';
import {useDeleteRBT} from '@app/web-player/RBT/requests/use-delete-RBT';
import {useIsMobileMediaQuery} from '@common/utils/hooks/is-mobile-media-query';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {getAlbumLink} from '@app/web-player/albums/album-link';
import {ShareMediaButton} from '@app/web-player/context-dialog/share-media-button';
import {useSettings} from '@common/core/settings/use-settings';
import {RBTIsLocallyUploaded} from '@app/web-player/RBT/utils/RBT-is-locally-uploaded';
import {useAuth} from '@common/auth/use-auth';
import {downloadFileFromUrl} from '@common/uploads/utils/download-file-from-url';
import {useNavigate} from '@common/utils/hooks/use-navigate';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {RBTToMediaItem} from '@app/web-player/RBT/utils/RBT-to-media-item';

export interface RBTContextDialogProps {
  RBT: RBT[];
  children?: (RBT: RBT[]) => ReactNode;
  showAddToQueueButton?: boolean;
}
export function RBTContextDialog({
  children,
  RBT,
  showAddToQueueButton = true,
}: RBTContextDialogProps) {
  const isMobile = useIsMobileMediaQuery();
  const firstRBT = RBT[0];
  const {canEdit, canDelete} = useRBTPermissions(RBT);
  const shouldShowRadio = useShouldShowRadioButton();
  const {player} = useSettings();
  const {close} = useDialogContext();
  const navigate = useNavigate();
  const cuedRBT = usePlayerStore(s => s.cuedMedia?.meta as RBT | undefined);
  const {play} = usePlayerActions();

  const loadRBT = useCallback(() => {
    return Promise.resolve(RBT);
  }, [RBT]);

  const headerProps: Partial<ContextMenuLayoutProps> =
    RBT.length === 1
      ? {
          image: <RBTImage RBT={firstRBT} />,
          title: <RBTLink RBT={firstRBT} />,
          description: <ArtistLinks artists={firstRBT.artists} />,
        }
      : {};

  return (
    <ContextDialogLayout {...headerProps} loadRBT={loadRBT}>
      {showAddToQueueButton && (
        <AddToQueueButton item={RBT} loadRBT={loadRBT} />
      )}
      <ToggleInLibraryMenuButton items={RBT} />
      {children?.(RBT)}
      <PlaylistPanelButton />
      {RBT.length === 1 ? (
        <Fragment>
          {shouldShowRadio && (
            <ContextMenuButton type="link" to={getRadioLink(firstRBT)}>
              <Trans message="Go to song radio" />
            </ContextMenuButton>
          )}
          {isMobile && (
            <Fragment>
              {firstRBT.artists?.[0] && (
                <ContextMenuButton
                  type="link"
                  to={getArtistLink(firstRBT.artists[0])}
                >
                  <Trans message="Go to artist" />
                </ContextMenuButton>
              )}
              {firstRBT.album && (
                <ContextMenuButton
                  type="link"
                  to={getAlbumLink(firstRBT.album)}
                >
                  <Trans message="Go to album" />
                </ContextMenuButton>
              )}
              <ContextMenuButton type="link" to={getRBTLink(firstRBT)}>
                <Trans message="Go to RBT" />
              </ContextMenuButton>
            </Fragment>
          )}
          {!player?.hide_lyrics && RBT.length === 1 && (
            <ContextMenuButton
              onClick={async () => {
                close();
                if (cuedRBT?.id !== firstRBT.id) {
                  await play(RBTToMediaItem(firstRBT));
                }
                navigate('/lyrics');
              }}
            >
              <Trans message="View lyrics" />
            </ContextMenuButton>
          )}
          {!isMobile && (
            <CopyLinkMenuButton
              link={getRBTLink(firstRBT, {absolute: true})}
            >
              <Trans message="Copy song link" />
            </CopyLinkMenuButton>
          )}
          {RBT.length === 1 && <ShareMediaButton item={firstRBT} />}
          {RBT.length === 1 && <DownloadRBTButton RBT={firstRBT} />}
          {RBT.length === 1 ? (
            <ToggleRepostMenuButton item={RBT[0]} />
          ) : null}
          {RBT.length === 1 && canEdit && (
            <ContextMenuButton
              type="link"
              to={`/backstage/RBT/${firstRBT.id}/insights`}
            >
              <Trans message="Insights" />
            </ContextMenuButton>
          )}
          {RBT.length === 1 && canEdit && (
            <ContextMenuButton
              type="link"
              to={`/backstage/RBT/${firstRBT.id}/edit`}
            >
              <Trans message="Edit" />
            </ContextMenuButton>
          )}
        </Fragment>
      ) : null}
      {canDelete && !isMobile && <DeleteButton RBT={RBT} />}
    </ContextDialogLayout>
  );
}

interface DownloadRBTButtonProps {
  RBT: RBT;
}
function DownloadRBTButton({RBT}: DownloadRBTButtonProps) {
  const {player, base_url} = useSettings();
  const {close: closeMenu} = useDialogContext();
  const {hasPermission} = useAuth();

  if (
    !player?.enable_download ||
    !RBT ||
    !RBTIsLocallyUploaded(RBT) ||
    !hasPermission('music.download')
  ) {
    return null;
  }

  return (
    <ContextMenuButton
      onClick={() => {
        closeMenu();
        downloadFileFromUrl(`${base_url}/api/v1/RBT/${RBT.id}/download`);
      }}
    >
      <Trans message="Download" />
    </ContextMenuButton>
  );
}

function DeleteButton({RBT}: RBTContextDialogProps) {
  const {close: closeMenu} = useDialogContext();
  const {canDelete} = useRBTPermissions(RBT);

  if (!canDelete) {
    return null;
  }

  return (
    <ContextMenuButton
      onClick={() => {
        closeMenu();
        openDialog(DeleteRBTDialog, {
          RBT,
        });
      }}
    >
      <Trans message="Delete" />
    </ContextMenuButton>
  );
}

interface DeleteRBTDialogProps {
  RBT: RBT[];
}
function DeleteRBTDialog({RBT}: DeleteRBTDialogProps) {
  const deleteRBT = useDeleteRBT();
  const {close} = useDialogContext();
  return (
    <ConfirmationDialog
      isDanger
      title={<Trans message="Delete RBT" />}
      body={
        <Trans message="Are you sure you want to delete selected RBT?" />
      }
      isLoading={deleteRBT.isPending}
      confirm={<Trans message="Delete" />}
      onConfirm={() => {
        deleteRBT.mutate(
          {RBTIds: RBT.map(t => t.id)},
          {
            onSuccess: () => close(),
          },
        );
      }}
    />
  );
}
