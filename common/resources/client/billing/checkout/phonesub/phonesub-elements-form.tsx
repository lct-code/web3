import {Button} from '../../../ui/buttons/button';
import {useForm} from 'react-hook-form';
import {Form} from '../../../ui/forms/form';
import {FormTextField} from '../../../ui/forms/input-field/text-field/text-field';
import {Trans} from '../../../i18n/trans';
import {ReactNode, useState, useRef, useEffect, useCallback} from 'react';
import {useAuth} from '../../../auth/use-auth';
import {usePhonesub, PhonesubPayload} from './use-phonesub';
import {Alert} from '../../../alerts/alert';
import {obfuscatePhone} from '../../../utils/string/obfuscate-phone';
import {toast} from '../../../ui/toast/toast';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {ProgressCircle} from '../../../ui/progress/progress-circle';
import { useBootstrapData } from '@common/core/bootstrap-data/bootstrap-data-context';
import { FormPhoneField } from '@common/ui/forms/input-field/phone-field/phone-field';

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
  const {phonesub, phonesubIsEnabled} = usePhonesub({
    type,
    priceId,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subStatus, setSubStatus] = useState<string>('start');
  const navigate = useNavigate();
  const {user} = useAuth();
  const {invalidateBootstrapData, data:{environment}} = useBootstrapData();
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [canResend, setCanResend] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const  paramsStatus = searchParams.get('status') 

  const form = useForm<{auth_code:string, phone:string}>({
    defaultValues: {
      phone: user?.phone || '', // Set default value for phone
    },
  });
  const authRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const isStateVerify = subStatus == 'verify' || subStatus == 'verified';
  const isStateError = subStatus == 'syncerror' || subStatus == 'expired';
  const isStateStart = subStatus == 'start';

  // disable upgrade button if phonesub is enabled, but not loaded yet
  const phonesubIsReady: boolean =
    !phonesubIsEnabled || (phonesub != null);

    const updateSearchParams = useCallback((status: string) => {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('status', status);
        return newParams;
      });
    },[setSearchParams]);

    useEffect(() => {
      if(paramsStatus === 'start' && subStatus !=='start')
      setSubStatus('start')
    // if( paramsStatus === 'OTPVerify' && subStatus!== 'verify'  ){
    // }
    
    }, [paramsStatus])
    
  
  useEffect(() => {

    if(subStatus === 'start'){
      updateSearchParams('start');
    }

    let timer: NodeJS.Timeout;

    if (subStatus === 'verify' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [subStatus, timeLeft,updateSearchParams]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResend = async () => {
    setCanResend(false);
    // setSubStatus('start');
    await handleSubmit({ phone: form.getValues('phone'),resend:true });
    setTimeLeft(90);
  };

  const handleSubmit = async (input: PhonesubPayload) => {
    // phonesub has not loaded yet
    if (!phonesub) return;

    setIsSubmitting(true);
    const {resend, ...payload} = input;
    try {
      const method = subStatus !== 'verify' || resend ? 'subscribeStart' : 'subscribeVerify';
      const result = await phonesub[method](payload);

      if (result.status == 'verify' ) {
        invalidateBootstrapData();
        if(result.phone && user) user.phone = result.phone;
        updateSearchParams('OTPVerify');
      }

      if (result.status == 'verified') {
        updateSearchParams('verified');
        setSyncTimeout();
        // invalidateBootstrapData();
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

  const setSyncTimeout = (syncTimeoutIdx: number = 0) => {
    return setTimeout(() => {
      phonesub.syncSubscriptionDetails().then((resp) => {
        if (resp?.data?.message) toast(resp?.data?.message);
        navigate(returnUrl+'?status=success&subscriptionId='+(resp?.data?.subscriptionId ?? 'null'));

      }, (err) => {
        if (syncTimeoutIdx > 15) {
          setSubStatus('syncerror');
        }
        else {
          setSyncTimeout(syncTimeoutIdx + 1);
        }
      });
    }, 1000);
  }


  return (
    <Form form={form} onSubmit={handleSubmit}>
      { subStatus === 'verify' && (
        <div>
          {/* <Alert
            title={<Trans message="Sending verification code" />}
            type="info"
            message={
              <Trans message="Please enter verification code sent to your phone number: :phone"
              values={{phone: obfuscatePhone(user?.phone)}}
              />
            }
            /> */}
          <div className="text-center mb-20">
            <div className="text-5xl font-semibold mb-10">
              {formatTime(timeLeft)}
            </div>
          </div>
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
      { subStatus === 'verified' && (
        <div>
          <div className="flex items-center justify-center flex-auto mb-8">
            <ProgressCircle isIndeterminate aria-label="Waiting for server response..." />
          </div>
          <Alert
            title={<Trans message="Verification successful" />}
            type="info"
            message={
              <Trans message="Waiting for Subscription server response..."/>
            }
            />
        </div>
      )}
      {isStateStart && (
        <div>
          {/* <Alert
            type="info"
            message={
              <Trans message="The subscription will be renewed automatically" />
            }
            /> */}
          <FormPhoneField
            className="mb-12"
            name="phone"
            type="text"
            label={<Trans message="Phone number" />}
            required
            dir='ltr'
            onlyCountries={environment.ONLY_COUNTRIES?.split(',')}
            excludeCountries={environment.EXCLUDED_COUNTRIES?.split(',')}
            initialCountry={environment.ONLY_COUNTRIES?.split(',')[0]}
            inputRef={phoneRef}
          />
        </div>
      )}
      { subStatus === 'syncerror' && (
        <div className="text-danger mb-8"><Trans message="Something went wrong. Please try again later."/></div>
      )}
      {errorMessage && !isSubmitting && (
        <div className="text-danger mb-8">{errorMessage}</div>
      )}

      <Button
        variant="flat"
        color="primary"
        size="md"
        className="w-full mt-12"
        type="submit"
        disabled={isSubmitting || !phonesubIsReady}
      >
        {isStateVerify ? verifyLabel : (isStateError ? resendLabel : submitLabel)}
      </Button>

      {canResend && subStatus === 'verify' && (
        <Button
          variant="text"
          color="primary"
          size="sm"
          className="w-full mt-8"
          onClick={handleResend}
          disabled={isSubmitting}
        >
          <Trans message="Resend code" />
        </Button>
      )}
    </Form>
  );
}

