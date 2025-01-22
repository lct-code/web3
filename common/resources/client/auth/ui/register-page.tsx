import {Link, Navigate, useLocation, useSearchParams} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {FormTextField} from '../../ui/forms/input-field/text-field/text-field';
import {Button} from '../../ui/buttons/button';
import {Form} from '../../ui/forms/form';
import {LinkStyle} from '../../ui/buttons/external-link';
import {RegisterPayload, useRegister} from '../requests/use-register';
import {SocialAuthSection} from './social-auth-section';
import {AuthLayout} from './auth-layout/auth-layout';
import {Trans} from '../../i18n/trans';
import {FormCheckbox} from '../../ui/forms/toggle/checkbox';
import {CustomMenuItem} from '../../menus/custom-menu';
import {useRecaptcha} from '../../recaptcha/use-recaptcha';
import {StaticPageTitle} from '../../seo/static-page-title';
import {useSettings} from '../../core/settings/use-settings';
import {useContext, useState} from 'react';
import {SiteConfigContext} from '@common/core/settings/site-config-context';
import { EmailIcon } from '@common/icons/material/Email';
import { PhoneIcon } from '@common/icons/material/Phone';
import { FormPhoneField } from '@common/ui/forms/input-field/phone-field/phone-field';

export function RegisterPage() {
  const {
    branding,
    registration: {disable},
    social,
    mobile_login,
  } = useSettings();
  const {auth} = useContext(SiteConfigContext);
  const {verify, isVerifying} = useRecaptcha('register');

  const {pathname} = useLocation();
  const [searchParams] = useSearchParams();

  const isWorkspaceRegister = pathname.includes('workspace');
  const isBillingRegister = searchParams.get('redirectFrom') === 'pricing';
  const searchParamsEmail = searchParams.get('email') || undefined;
  const searchParamsPhone = searchParams.get('phone') || undefined;

  const form = useForm<RegisterPayload>({
    defaultValues: {phone: searchParamsPhone, email: searchParamsEmail},
  });

  const [showEmailForm, setShowEmailForm] = useState(!!searchParamsEmail);
  const isInvalid = !!Object.keys(form.formState.errors).length;
  const register = useRegister(form);

  if (disable) {
    return <Navigate to="/login" replace />;
  }

  let heading = <Trans message="Create a new account" />;
  if (isWorkspaceRegister) {
    heading = (
      <Trans
        values={{siteName: branding?.site_name}}
        message="To join your team on :siteName, create an account"
      />
    );
  } else if (isBillingRegister) {
    heading = <Trans message="First, let's create your account" />;
  }

  const message = (
    <Trans
      values={{
        a: parts => (
          <Link className={LinkStyle} to="/login">
            {parts}
          </Link>
        ),
      }}
      message="Already have an account? <a>Sign in.</a>"
    />
  );

  return (
    <AuthLayout heading={heading} message={message}>
      <StaticPageTitle>
        <Trans message="Register" />
      </StaticPageTitle>

      {mobile_login && !showEmailForm ? (
      <Form
        form={form}
        onSubmit={async payload => {
          payload.email = undefined;
          payload.password = undefined;
          payload.password_confirmation = undefined;
          const isValid = await verify();
          if (isValid) {
            register.mutate(payload);
          }
        }}
      >
          <FormPhoneField
            className="mb-32"
            name="phone"
            type="tel"
            label={<Trans message="Phone" />}
            invalid={isInvalid}
            required={!showEmailForm}
          />
          {auth?.registerFields ? <auth.registerFields /> : null}
          <PolicyCheckboxes />
          <Button
            className="block w-full"
            type="submit"
            variant="flat"
            color="primary"
            size="md"
            disabled={register.isPending || isVerifying}
          >
            <Trans message="Create account" />
          </Button>
        </Form>
      ) : <></>}

      {showEmailForm && (
        <Form
          form={form}
          className='mt-20'
          onSubmit={async payload => {
            payload.phone = undefined;
            const isValid = await verify();
            if (isValid) {
              register.mutate(payload);
            }
          }}
        >
            <FormTextField
              className="mb-32"
              name="email"
              type="email"
              label={<Trans message="Email" />}
              disabled={!!searchParamsEmail}
              invalid={isInvalid}
              required
            />
            <FormTextField
              className="mb-12"
              name="password"
              type="password"
              label={<Trans message="Password" />}
              invalid={isInvalid}
              required
            />
            <FormTextField
              className="mb-12"
              name="password_confirmation"
              type="password"
              label={<Trans message="Confirm Password" />}
              invalid={isInvalid}
              required
            />
        {auth?.registerFields ? <auth.registerFields /> : null}
        <PolicyCheckboxes />
        <Button
          className="block w-full"
          type="submit"
          variant="flat"
          color="primary"
          size="md"
          disabled={register.isPending || isVerifying}
        >
          <Trans message="Create account" />
        </Button>
        </Form>
      )}

      
<SocialAuthSection
        dividerMessage={
          !mobile_login ? ''
            : social.compact_buttons ? (
              <Trans message="Or sign up with" />
            ) : (
              <Trans message="OR" />
            )
        }
        />


        {
        social?.email?.enable &&
        <Button
          variant="outline"
          className="mt-20 min-h-42 w-full"
          startIcon={
            showEmailForm && mobile_login ?
              <PhoneIcon />
              : <EmailIcon />
          }
          onClick={() => setShowEmailForm(prev => !prev)}
        >
          <span className="min-w-160 text-start">
          {showEmailForm && mobile_login ?
              <Trans message="Continue with phone" />
              : <Trans message="Continue with email" />
            }
          </span>
        </Button>
        }

    </AuthLayout>
  );
}

function PolicyCheckboxes() {
  const {
    registration: {policies},
  } = useSettings();

  if (!policies) return null;

  return (
    <div className="mb-32">
      {policies.map(policy => (
        <FormCheckbox
          key={policy.id}
          name={policy.id}
          className="mb-4 block"
          required
        >
          <Trans
            message="I accept the :name"
            values={{
              name: (
                <CustomMenuItem
                  unstyled
                  className={() => LinkStyle}
                  item={policy}
                />
              ),
            }}
          />
        </FormCheckbox>
      ))}
    </div>
  );
}
