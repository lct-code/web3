import clsx from 'clsx';
import {Button} from '../../../ui/buttons/button';
import {useForm} from 'react-hook-form';
import {Form} from '../../../ui/forms/form';
import {FormTextField} from '../../../ui/forms/input-field/text-field/text-field';
import {Trans} from '../../../i18n/trans';
import {Fragment, ReactNode, useState, useRef} from 'react';
import {useAuth} from '../../../auth/use-auth';
import {usePhonesub, PhonesubPayload} from './use-phonesub';
import {Alert} from '../../../alerts/alert';
import {obfuscatePhone} from '../../../utils/string/obfuscate-phone';
import {toast} from '../../../ui/toast/toast';
import {useNavigate} from '../../../utils/hooks/use-navigate';

interface PhonesubElementsFormProps {
  productId?: string;
  priceId?: string;
  type: 'setupIntent' | 'subscription';
  submitLabel: ReactNode;
  verifyLabel: ReactNode;
  resendLabel: ReactNode;
  returnUrl: string;
}
export function PhonesubElementsForm({
  priceId,
  type = 'subscription',
  submitLabel,
  verifyLabel,
  resendLabel,
  returnUrl,
}: PhonesubElementsFormProps) {
  const {phonesub, paymentElementRef, phonesubIsEnabled} = usePhonesub({
    type,
    priceId,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subStatus, setSubStatus] = useState<string>('start');
  const navigate = useNavigate();

  const form = useForm<{auth_code:string}>();
  const authRef = useRef<HTMLInputElement>(null);
  const {user} = useAuth();

  // disable upgrade button if phonesub is enabled, but not loaded yet
  const phonesubIsReady: boolean =
    !phonesubIsEnabled || (phonesub != null);

  const handleSubmit = async (payload: PhonesubPayload) => {
    // phonesub has not loaded yet
    if (!phonesub) return;

    setIsSubmitting(true);

    try {
      const method = subStatus !== 'verify' ? 'subscribeStart' : 'subscribeVerify';
      const result = await phonesub[method](payload);

      if (result.status == 'subscribed') {
        if (result.message) toast(result.message);
        navigate(returnUrl+'?status=success&subscriptionId='+(result?.subscriptionId ?? 'null'));
        return;
      }

      if (result.status) {
        setSubStatus(result.status);
      }

      // don't show validation error as it will be shown already by phonesub payment element
      if (result.error?.type !== 'validation_error' && result.error?.message) {
        setErrorMessage(result.error.message);
      }
      else {
        setErrorMessage(null);
      }
    } catch {}

    setIsSubmitting(false);
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      { subStatus === 'verify' && (
        <div>
          <Alert
            title={<Trans message="Sending verification code" />}
            message={
              <Trans message="Please enter verification code sent to your phone number: :phone"
              values={{phone: obfuscatePhone(user?.phone)}}
              />
            }
            />
          <FormTextField
            className="mb-32"
            name="auth_code"
            type="text"
            label={<Trans message="Verification code" />}
            required
            inputRef={authRef}
          />
        </div>
      )}
      {errorMessage && !isSubmitting && (
        <div className="text-danger mt-20">{errorMessage}</div>
      )}
      <Button
        variant="flat"
        color="primary"
        size="md"
        className="w-full mt-40"
        type="submit"
        disabled={isSubmitting || !phonesubIsReady}
      >
        {subStatus == 'verify' ? verifyLabel : (subStatus == 'expired' ? resendLabel : submitLabel)}
      </Button>
    </Form>
  );
}

