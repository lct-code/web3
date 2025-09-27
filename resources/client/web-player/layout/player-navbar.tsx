import { useSettings } from '@common/core/settings/use-settings';
import { useAuth } from '@common/auth/use-auth';
import React, { Fragment, useMemo } from 'react';
import { Button } from '@common/ui/buttons/button';
import { Link } from 'react-router-dom';
import { Trans } from '@common/i18n/trans';
import { useNavigate } from '@common/utils/hooks/use-navigate';
import { usePrimaryArtistForCurrentUser } from '@app/web-player/backstage/use-primary-artist-for-current-user';
import { MenuItem } from '@common/ui/navigation/menu/menu-trigger';
import { MicIcon } from '@common/icons/material/Mic';
import { getArtistLink } from '@app/web-player/artists/artist-link';
import { Navbar } from '@common/ui/navigation/navbar/navbar';
import { SearchAutocomplete } from '@app/web-player/search/search-autocomplete';
import clsx from 'clsx';
import { getBootstrapData } from '@common/core/bootstrap-data/use-backend-bootstrap-data';
import { useCancelZainSdSubscription } from '@common/billing/billing-page/requests/use-cancel-zain-sd-subscription';
import { DialogTrigger } from '@common/ui/overlays/dialog/dialog-trigger';
import { ConfirmationDialog } from '@common/ui/overlays/dialog/confirmation-dialog';

interface Props {
  className?: string;
}
export function PlayerNavbar({ className }: Props) {
  const navigate = useNavigate();
  const primaryArtist = usePrimaryArtistForCurrentUser();
  const { player } = useSettings();
  const menuItems = useMemo(() => {
    if (primaryArtist) {
      return [
        <MenuItem
          value="author"
          key="author"
          startIcon={<MicIcon />}
          onSelected={() => {
            navigate(getArtistLink(primaryArtist));
          }}
        >
          <Trans message="Artist profile" />
        </MenuItem>,
      ];
    }
    if (player?.show_become_artist_btn) {
      return [
        <MenuItem
          value="author"
          key="author"
          startIcon={<MicIcon />}
          onSelected={() => {
            navigate('/backstage/requests');
          }}
        >
          <Trans message="Become an author" />
        </MenuItem>,
      ];
    }

    return [];
  }, [primaryArtist, navigate, player?.show_become_artist_btn]);

  return (
    <Navbar
      hideLogo
      color="bg"
      darkModeColor="bg"
      size="sm"
      authMenuItems={menuItems}
      className={clsx('dashboard-grid-header', className)}
    >
      <SearchAutocomplete />
      <ActionButtons />
    </Navbar>
  );
}

function ActionButtons() {
  const { player, billing } = useSettings();
  const { isLoggedIn, hasPermission, isSubscribed } = useAuth();
  const showUploadButton =
    player?.show_upload_btn && isLoggedIn && hasPermission('music.create');
  const showTryProButton =
    billing?.enable && hasPermission('plans.view') && !isSubscribed;
  const { environment, user } = getBootstrapData();
  let subscriptionRedirectUrl = '';
  if (environment.DEFAULT_REDIRECT_GATEWAY === 'zainSD')
    subscriptionRedirectUrl = `https://dsplp.sd.zain.com/?p=${environment.DEFAULT_REDIRECT_PRODUCT_CODE}`
  else if (environment.DEFAULT_REDIRECT_GATEWAY?.startsWith('/'))
    subscriptionRedirectUrl = environment.DEFAULT_REDIRECT_GATEWAY;
  else
    subscriptionRedirectUrl = '/pricing';

  const cancelZainSdSubscription = useCancelZainSdSubscription();

  const showCancelSubscriptionButton = user?.subscriptions?.find(sub => sub.valid && sub.gateway_name === 'zain_sd') ? true : false;

  const handleCancelSubscription = () => {
    const subscription_id = user?.subscriptions?.find(sub => sub.valid && sub.gateway_name === 'zain_sd')?.id.toString();
    if (subscription_id) {
      if (environment.DEFAULT_REDIRECT_GATEWAY === 'zainSD') {
        cancelZainSdSubscription.mutate(
          { subscription_id },
        );
      }
    }
  };

  return (
    <Fragment>
      {showTryProButton ? (
        <Button
          variant="outline"
          size="xs"
          color="primary"
          elementType={Link}
          to={subscriptionRedirectUrl}
        >
          <Trans message="Try Pro" />
        </Button>
      ) : null}
      {showUploadButton ? (
        <Button
          variant={showTryProButton ? 'text' : 'outline'}
          size="xs"
          color={showTryProButton ? undefined : 'primary'}
          elementType={Link}
          to="/backstage/upload"
        >
          <Trans message="Upload" />
        </Button>
      ) : null}
      <DialogTrigger
        type="modal"
        onClose={confirmed => {
          if (confirmed) {
            handleCancelSubscription();
          }
        }}
      >
        <Button
          variant="outline"
          size="xs"
          color="danger"
          disabled={cancelZainSdSubscription.isPending}
          className={showCancelSubscriptionButton ? '' : 'hidden'}
        >
          <Trans message="Cancel Subscription" />
        </Button>
        <ConfirmationDialog
          isDanger
          title={<Trans message="Cancel subscription" />}
          body={
            <div>
              <Trans message="Are you sure you want to cancel your subscription?" />
              <div className="mt-10 text-sm font-semibold">
                <Trans message="This will permanently cancel your subscription." />
              </div>
            </div>
          }
          confirm={<Trans message="Cancel subscription" />}
        />
      </DialogTrigger>
    </Fragment>
  );
}
