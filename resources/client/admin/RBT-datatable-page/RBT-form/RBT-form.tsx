import React, {ReactNode} from 'react';
import {FormTextField} from '@common/ui/forms/input-field/text-field/text-field';
import {Trans} from '@common/i18n/trans';
import {FormImageSelector} from '@common/ui/images/image-selector';
import {FormNormalizedModelField} from '@common/ui/forms/normalized-model-field';
import {FormArtistPicker} from '@app/web-player/artists/artist-picker/form-artist-picker';
import {FormNormalizedModelChipField} from '@common/tags/form-normalized-model-chip-field';
import {useTrans} from '@common/i18n/use-trans';
import {message} from '@common/i18n/message';
import {TAG_MODEL} from '@common/tags/tag';
import {GENRE_MODEL} from '@app/web-player/genres/genre';
import {useFormContext} from 'react-hook-form';
import {CreateRBTPayload} from '@app/admin/RBT-datatable-page/requests/use-create-RBT';
import {FormattedDuration} from '@common/i18n/formatted-duration';
import {useSettings} from '@common/core/settings/use-settings';
import {RBTFormUploadButton} from '@app/admin/RBT-datatable-page/RBT-form/RBT-form-upload-button';
import {useIsMobileMediaQuery} from '@common/utils/hooks/is-mobile-media-query';

interface RBTFormProps {
  showExternalIdFields?: boolean;
  showAlbumField?: boolean;
  uploadButton?: ReactNode;
}
export function RBTForm({
  showExternalIdFields,
  showAlbumField = true,
  uploadButton,
}: RBTFormProps) {
  const {trans} = useTrans();
  const isMobile = useIsMobileMediaQuery();

  return (
    <div className="gap-24 md:flex">
      <div className="flex-shrink-0">
        <FormImageSelector
          name="image"
          diskPrefix="RBT_image"
          variant={isMobile ? 'input' : 'square'}
          label={isMobile ? <Trans message="Image" /> : null}
          previewSize={isMobile ? undefined : 'w-full md:w-224 aspect-square'}
          stretchPreview
        />
        <div className="mt-24">
          {uploadButton ? uploadButton : <RBTFormUploadButton />}
        </div>
      </div>
      <div className="mt-24 flex-auto md:mt-0">
        <FormTextField
          name="name"
          label={<Trans message="Name" />}
          className="mb-24"
          required
          autoFocus
        />
        <FormTextField
          name="artist"
          label={<Trans message="Artist" />}
          className="mb-24"
          required
        />
        <FormTextField
          name="description"
          label={<Trans message="Description" />}
          className="mb-24"
          multiline
          minRows={2}
          maxRows={6}
        />
        <DurationField />
        {showExternalIdFields && <SourceField />}
        {showExternalIdFields && <SpotifyIdField />}
      </div>
    </div>
  );
}

function SourceField() {
  return (
    <FormTextField
      name="src"
      label={<Trans message="Playback source" />}
      className="mb-24"
      minLength={1}
      maxLength={230}
      description={
        <Trans message="Supports audio, video, hls/dash stream and youtube video url. If left empty, best matching youtube video will be found automatically." />
      }
    />
  );
}

function SpotifyIdField() {
  const {spotify_is_setup} = useSettings();
  if (!spotify_is_setup) {
    return null;
  }
  return (
    <FormTextField
      name="spotify_id"
      label={<Trans message="Spotify ID" />}
      className="mb-24"
      minLength={22}
      maxLength={22}
    />
  );
}

function DurationField() {
  const {watch} = useFormContext<CreateRBTPayload>();
  return (
    <FormTextField
      required
      name="duration"
      label={<Trans message="Duration (in milliseconds)" />}
      className="mb-24"
      type="number"
      min={1}
      max={86400000}
      description={
        <Trans
          message="Will appear on the site as: :preview"
          values={{preview: <FormattedDuration ms={watch('duration')} />}}
        />
      }
    />
  );
}
