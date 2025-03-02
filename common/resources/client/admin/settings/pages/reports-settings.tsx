import {useFormContext} from 'react-hook-form';
import {SettingsPanel} from '../settings-panel';
import {SettingsErrorGroup} from '../settings-error-group';
import {FormTextField} from '@common/ui/forms/input-field/text-field/text-field';
import {FormFileField} from '@common/ui/forms/input-field/file-field';
import {Trans} from '@common/i18n/trans';
import {Fragment} from 'react';

export function ReportsSettings() {
  return (
    <SettingsPanel
      title={<Trans message="Analytics" />}
      description={
        <Trans message="Configure google analytics integration and credentials." />
      }
    >
      <AnalyticsSection />
    </SettingsPanel>
  );
}

function AnalyticsSection() {
  const {clearErrors} = useFormContext();
  return (
    <SettingsErrorGroup
      separatorTop={false}
      separatorBottom={false}
      name="analytics_group"
    >
      {isInvalid => (
        <Fragment>
          <FormFileField
            className="mb-30"
            onChange={() => {
              clearErrors();
            }}
            invalid={isInvalid}
            name="files.certificate"
            accept=".json"
            label={<Trans message="Google service account key file (.json)" />}
          />
          <FormTextField
            className="mb-30"
            onChange={() => {
              clearErrors();
            }}
            invalid={isInvalid}
            name="server.analytics_property_id"
            type="number"
            label={<Trans message="Google analytics property ID" />}
          />
          <FormTextField
            className="mb-30"
            onChange={() => {
              clearErrors();
            }}
            invalid={isInvalid}
            name="client.analytics.tracking_code"
            placeholder="G-******"
            min="1"
            max="20"
            description={
              <Trans message="Google analytics measurement ID only, not the whole javascript snippet." />
            }
            label={<Trans message="Google tag manager measurement ID" />}
          />
          <FormTextField
            className="mb-30"
            name="client.analytics.gchart_api_key"
            label={<Trans message="Google maps javascript API key" />}
            description={
              <Trans message="Only required in order to show world geochart on integrated analytics pages." />
            }
          />
          
          {/*google tag code */}
          <FormTextField
            className="mb-30"
            onChange={() => {
              clearErrors();
            }}
            invalid={isInvalid}
            name="client.analytics.googletag_code"
            min="1"
            max="20"
            label={<Trans message="Google Tag Code " />}
          />
          {/*Meta pixle Code*/}
          <FormTextField
            className="mb-30"
            onChange={() => {
              clearErrors();
            }}
            invalid={isInvalid}
            name="client.analytics.pixel_code"
            placeholder=""
            min="1"
            max="20"
            description={
              <Trans message="track Facebook ad-driven visitor activity on your website." />
            }
            label={<Trans message="Meta Pixle_code" />}
          />
        </Fragment>
      )}
    </SettingsErrorGroup>
  );
}
