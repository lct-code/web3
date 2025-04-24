import {RBTImage} from '@app/web-player/RBT/RBT-image/RBT-image';
import {PlaybackToggleButton} from '@app/web-player/playable-item/playback-toggle-button';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {Waveform} from '@app/web-player/RBT/waveform/waveform';
import {RBT} from '@app/web-player/RBT/RBT';
import {useSettings} from '@common/core/settings/use-settings';
import {RBTeekbar} from '@app/web-player/player-controls/seekbar/RBT-seekbar';
import {RBTIsLocallyUploaded} from '@app/web-player/RBT/utils/RBT-is-locally-uploaded';
import {FormattedRelativeTime} from '@common/i18n/formatted-relative-time';
import {
  CommentBarContext,
  CommentBarContextProvider,
} from '@app/web-player/RBT/waveform/comment-bar-context';
import {CommentBarNewCommentForm} from '@app/web-player/RBT/waveform/comment-bar-new-comment-form';
import React, {Fragment, memo, useContext} from 'react';
import {AnimatePresence} from 'framer-motion';
import {Chip} from '@common/ui/forms/input-field/chip-field/chip';
import {GenreLink} from '@app/web-player/genres/genre-link';
import {RepeatIcon} from '@common/icons/material/Repeat';
import {RBTLink} from '@app/web-player/RBT/RBT-link';
import {useRBTPermissions} from '@app/web-player/RBT/hooks/use-RBT-permissions';
import {User} from '@common/auth/user';
import {UserProfileLink} from '@app/web-player/users/user-profile-link';
import {RBTActionsBar} from '@app/web-player/RBT/RBT-actions-bar';
import clsx from 'clsx';

interface RBTListItemProps {
  RBT: RBT;
  queue?: RBT[];
  reposter?: User;
  className?: string;
  hideArtwork?: boolean;
  hideActions?: boolean;
  linksInNewTab?: boolean;
}
export const RBTListItem = memo(
  ({
    RBT,
    queue,
    reposter,
    className,
    hideArtwork = false,
    hideActions = false,
    linksInNewTab = false,
  }: RBTListItemProps) => {
    const {player} = useSettings();
    const {managesRBT} = useRBTPermissions([RBT]);

    const showWave =
      player?.seekbar_type === 'waveform' && RBTIsLocallyUploaded(RBT);

    return (
      <div
        className={clsx(
          'overflow-hidden',
          !hideArtwork && 'md:flex md:gap-24',
          className,
        )}
      >
        {!hideArtwork && (
          <RBTImage
            RBT={RBT}
            className="flex-shrink-0 rounded max-md:hidden"
            size="w-184 h-184"
          />
        )}
        <div className="min-w-0 flex-auto">
          <div className="flex items-center gap-14">
            <PlaybackToggleButton
              RBT={RBT}
              RBT={queue}
              buttonType="icon"
              color="primary"
              variant="flat"
              radius="rounded-full"
              equalizerColor="white"
            />
            <div>
              <div className="flex items-center gap-6 text-sm text-muted">
                <ArtistLinks
                  artists={RBT.artists}
                  target={linksInNewTab ? '_blank' : undefined}
                />
                {reposter && (
                  <Fragment>
                    <RepeatIcon size="xs" />
                    <UserProfileLink
                      user={reposter}
                      target={linksInNewTab ? '_blank' : undefined}
                    />
                  </Fragment>
                )}
              </div>
              <div>
                <RBTLink
                  RBT={RBT}
                  target={linksInNewTab ? '_blank' : undefined}
                />
              </div>
            </div>
            <div className="ml-auto text-sm">
              <FormattedRelativeTime date={RBT.created_at} />
              {RBT.genres?.length ? (
                <Chip className="mt-6 w-max" size="xs">
                  <GenreLink
                    genre={RBT.genres[0]}
                    target={linksInNewTab ? '_blank' : undefined}
                  />
                </Chip>
              ) : null}
            </div>
          </div>
          <div className="mt-20">
            {showWave ? (
              <CommentBarContextProvider disableCommenting={hideActions}>
                <WaveformWithComments RBT={RBT} queue={queue} />
              </CommentBarContextProvider>
            ) : (
              <RBTeekbar RBT={RBT} queue={queue} />
            )}
          </div>
          {!hideActions && (
            <RBTActionsBar
              item={RBT}
              managesItem={managesRBT}
              className="mt-20"
            />
          )}
        </div>
      </div>
    );
  },
);

interface WaveformWithCommentsProps {
  RBT: RBT;
  queue?: RBT[];
}
export function WaveformWithComments({
  RBT,
  queue,
}: WaveformWithCommentsProps) {
  const {markerIsVisible} = useContext(CommentBarContext);
  return (
    <Fragment>
      <Waveform RBT={RBT} queue={queue} />
      <AnimatePresence mode="wait">
        {markerIsVisible && (
          <CommentBarNewCommentForm
            className="mb-8 mt-28"
            commentable={RBT}
          />
        )}
      </AnimatePresence>
    </Fragment>
  );
}
