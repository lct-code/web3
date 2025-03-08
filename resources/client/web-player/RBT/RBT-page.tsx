import {IllustratedMessage} from '@common/ui/images/illustrated-message';
import {Trans} from '@common/i18n/trans';
import {RBTTable} from '@app/web-player/RBT/RBT-table/RBT-table';
import React, {Fragment} from 'react';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {
  actionButtonClassName,
  MediaPageHeaderLayout,
} from '@app/web-player/layout/media-page-header-layout';
import {AvatarGroup} from '@common/ui/images/avatar-group';
import {Avatar} from '@common/ui/images/avatar';
import {FormattedDuration} from '@common/i18n/formatted-duration';
import {PlaybackToggleButton} from '@app/web-player/playable-item/playback-toggle-button';
import {Album} from '@app/web-player/albums/album';
import {getSmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {FormattedDate} from '@common/i18n/formatted-date';
import {useSortableTableData} from '@common/ui/tables/use-sortable-table-data';
import {BulletSeparatedItems} from '@app/web-player/layout/bullet-separated-items';
import {CommentList} from '@common/comments/comment-list/comment-list';
import {useRBT} from '@app/web-player/RBT/requests/use-RBT';
import {useRBTPermissions} from '@app/web-player/RBT/hooks/use-RBT-permissions';
import {RBT} from '@app/web-player/RBT/RBT';
import {RBTImage} from '@app/web-player/RBT/RBT-image/RBT-image';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {useSettings} from '@common/core/settings/use-settings';
import {FormattedNumber} from '@common/i18n/formatted-number';
import {TruncatedDescription} from '@common/ui/truncated-description';
import {Waveform} from '@app/web-player/RBT/waveform/waveform';
import {CommentBarContextProvider} from '@app/web-player/RBT/waveform/comment-bar-context';
import {CommentBarNewCommentForm} from '@app/web-player/RBT/waveform/comment-bar-new-comment-form';
import {GenreLink} from '@app/web-player/genres/genre-link';
import {PageMetaTags} from '@common/http/page-meta-tags';
import {PageStatus} from '@common/http/page-status';
import {RBTActionsBar} from '@app/web-player/RBT/RBT-actions-bar';
import {Chip} from '@common/ui/forms/input-field/chip-field/chip';
import {ChipList} from '@common/ui/forms/input-field/chip-field/chip-list';
import {Link} from 'react-router-dom';
import {FocusScope} from '@react-aria/focus';
import {RBTIsLocallyUploaded} from '@app/web-player/RBT/utils/RBT-is-locally-uploaded';
import {AdHost} from '@common/admin/ads/ad-host';
import {useCommentPermissions} from '@app/web-player/RBT/hooks/use-comment-permissions';
import {useIsMobileMediaQuery} from '@common/utils/hooks/is-mobile-media-query';

export function RBTPage() {
  // Get permissions for viewing and creating comments
  const {canView: showComments, canCreate: allowCommenting} =
    useCommentPermissions();
  // Fetch RBT data using the useRBT hook
  const query = useRBT({loader: 'RBTPage'});
  // Check if the user has permission to edit the RBT
  const {canEdit} = useRBTPermissions([query.data?.RBT]);

  // If RBT data is available, render the page content
  if (query.data) {
    return (
      <div>
        {/* Context provider for managing comment bar state */}
        <CommentBarContextProvider>
          {/* Set meta tags for the page based on the query data */}
          <PageMetaTags query={query} />
          {/* Display an ad at the top of the page */}
          <AdHost slot="general_top" className="mb-44" />
          {/* Render the header for the RBT page */}
          <RBTPageHeader RBT={query.data.RBT} />
          {/* Render the comment form if commenting is allowed */}
          {allowCommenting ? (
            <CommentBarNewCommentForm
              className="mb-16"
              commentable={query.data.RBT}
            />
          ) : null}
        </CommentBarContextProvider>
        {/* Render tags if they exist */}
        {query.data.RBT.tags.length ? (
          <FocusScope>
            <ChipList className="mb-16" selectable>
              {query.data.RBT.tags.map(tag => (
                <Chip elementType={Link} to={`/tag/${tag.name}`} key={tag.id}>
                  #{tag.display_name || tag.name}
                </Chip>
              ))}
            </ChipList>
          </FocusScope>
        ) : null}
        {/* Display a truncated description of the RBT */}
        <TruncatedDescription
          description={query.data.RBT.description}
          className="mt-24 text-sm"
        />
        {/* Render the comment list if comments can be viewed */}
        {showComments ? (
          <CommentList
            className="mt-34"
            commentable={query.data.RBT}
            canDeleteAllComments={canEdit}
          />
        ) : null}
        {/* Render the album RBT table if an album is associated with the RBT */}
        {query.data.RBT.album && (
          <AlbumRBTTable album={query.data.RBT.album} />
        )}
        {/* Display an ad at the bottom of the page */}
        <AdHost slot="general_bottom" className="mt-44" />
      </div>
    );
  }

  // Render the page status component if no data is available
  return (
    <PageStatus
      query={query}
      loaderIsScreen={false}
      loaderClassName="absolute inset-0 m-auto"
    />
  );
}

// Props interface for AlbumRBTTable component
interface AlbumRBTTableProps {
  album: Album; // The album associated with the RBT
}

// Component to display RBTs in a table format for a specific album
function AlbumRBTTable({album}: AlbumRBTTableProps) {
  // Use the hook to manage sortable table data
  const {data, sortDescriptor, onSortChange} = useSortableTableData(
    album.RBT,
  );
  return (
    <div className="mt-44">
      {/* Display album information */}
      <div className="mb-14 flex items-center gap-16 overflow-hidden rounded bg-hover">
        <AlbumImage
          album={album}
          className="flex-shrink-0 rounded"
          size="w-70 h-70"
        />
        <div className="flex-auto">
          <div className="text-sm">
            <Trans message="From the album" />
          </div>
          <div className="text-sm font-semibold">{album.name}</div>
        </div>
      </div>
      {/* Render the RBT table with the album's RBT data */}
      <RBTTable
        queueGroupId={queueGroupId(album)}
        RBT={data}
        sortDescriptor={sortDescriptor}
        onSortChange={onSortChange}
        hideRBTImage
        hideArtist
        hideAlbum
        hidePopularity={false}
      />
      {/* Display a message if there are no RBTs to show */}
      {!album.RBT?.length ? (
        <IllustratedMessage
          className="mt-34"
          title={<Trans message="Nothing to display" />}
          description={
            <Trans message="This album does not have any RBT yet" />
          }
        />
      ) : null}
    </div>
  );
}

// Props interface for RBTPageHeader component
interface RBTPageHeaderProps {
  RBT: RBT; // The RBT object to display in the header
}

// Component to display the header section of the RBT page
function RBTPageHeader({RBT}: RBTPageHeaderProps) {
  const isMobile = useIsMobileMediaQuery(); // Check if the user is on a mobile device
  const {player} = useSettings(); // Get user settings related to the player
  const releaseDate = RBT.album?.release_date || RBT.created_at; // Get the release date of the album or the creation date of the RBT
  const genre = RBT.genres?.[0]; // Get the first genre of the RBT

  // Determine if the waveform should be shown based on conditions
  const showWave =
    !isMobile &&
    player?.seekbar_type === 'waveform' &&
    RBTIsLocallyUploaded(RBT);

  return (
    <Fragment>
      {/* Layout for the media page header */}
      <MediaPageHeaderLayout
        className="mb-28"
        image={<RBTImage RBT={RBT} />} // Display the RBT image
        title={RBT.name} // Display the RBT title
        subtitle={
          <AvatarGroup>
            {RBT.artists?.map(artist => (
              <Avatar
                key={artist.id}
                circle
                src={getSmallArtistImage(artist)} // Display the artist's image
                label={artist.name} // Set the label for the avatar
                link={getArtistLink(artist)} // Link to the artist's profile
              />
            ))}
          </AvatarGroup>
        }
        description={
          <BulletSeparatedItems className="text-sm text-muted">
            {RBT.duration ? (
              <FormattedDuration ms={RBT.duration} verbose /> // Display the formatted duration
            ) : null}
            {releaseDate && <FormattedDate date={releaseDate} />} // Display the formatted release date
            {genre && <GenreLink genre={genre} />} // Link to the genre page
            {RBT.plays && !player?.enable_repost ? (
              <Trans
                message=":count plays"
                values={{count: <FormattedNumber value={RBT.plays} />}} // Display the number of plays
              />
            ) : null}
          </BulletSeparatedItems>
        }
        actionButtons={
          <RBTActionsBar
            item={RBT} // Pass the RBT item to the actions bar
            managesItem={false}
            buttonGap={undefined}
            buttonSize="sm"
            buttonRadius="rounded-full"
            buttonClassName={actionButtonClassName()} // Set the button class name
          >
            <PlaybackToggleButton
              buttonType="text" // Set the button type
              RBT={RBT} // Pass the RBT to the playback toggle button
              RBT={
                RBT.album?.RBT?.length ? RBT.album.RBT : undefined // Pass the album's RBT if available
              }
              className={actionButtonClassName({isFirst: true})} // Set the class name for the button
              queueId={queueGroupId(RBT.album || RBT)} // Set the queue ID
            />
          </RBTActionsBar>
        }
        footer={
          showWave ? (
            <Waveform RBT={RBT} className="max-md:hidden" /> // Display the waveform if conditions are met
          ) : undefined
        }
      />
    </Fragment>
  );
}
