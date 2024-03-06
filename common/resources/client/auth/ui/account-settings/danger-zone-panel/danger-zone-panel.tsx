import {AccountSettingsPanel} from '../account-settings-panel';
import {Button} from '../../../../ui/buttons/button';
import {DialogTrigger} from '../../../../ui/overlays/dialog/dialog-trigger';
import {ConfirmationDialog} from '../../../../ui/overlays/dialog/confirmation-dialog';
import {useDeleteAccount} from './delete-account';
import {Trans} from '../../../../i18n/trans';
import {User} from '../../../user';

interface Props {
  user: User;
}
export function DangerZonePanel({user}: Props) {
  const deleteAccount = useDeleteAccount();

  const hasSubscription = (user?.subscriptions ?? []).filter((sub) => sub.active ?? false).length > 0;

  return (
    <AccountSettingsPanel title={<Trans message="Danger zone" />}>
      <DialogTrigger
        type="modal"
        onClose={isConfirmed => {
          if (isConfirmed) {
            deleteAccount.mutate();
          }
        }}
      >
        <Button
          variant="flat"
          color="danger"
          disabled={hasSubscription}>

          <Trans message="Delete account" />
        </Button>

        <ConfirmationDialog
          isDanger
          title={<Trans message="Delete account?" />}
          body={
            <Trans message="Your account will be deleted immediately and permanently. Once deleted, accounts can not be restored." />
          }
          confirm={<Trans message="Delete" />}
        />
      </DialogTrigger>

      {hasSubscription && (
        <div className="text-muted text-sm pt-16 pb-6">
          <Trans message="You cannot delete your account with an active subscription." />
        </div>
      )}
    </AccountSettingsPanel>
  );
}
