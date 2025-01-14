import {Link, useLocation, useSearchParams} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {FormTextField} from '../../ui/forms/input-field/text-field/text-field';
import {Button} from '../../ui/buttons/button';
import {Form} from '../../ui/forms/form';
import {LoginPayload, useLogin} from '../requests/use-login';
import {FormCheckbox} from '../../ui/forms/toggle/checkbox';
import {LinkStyle} from '../../ui/buttons/external-link';
import {SocialAuthSection} from './social-auth-section';
import {AuthLayout} from './auth-layout/auth-layout';
import {Trans} from '../../i18n/trans';
import {StaticPageTitle} from '../../seo/static-page-title';
import { useContext, useState } from 'react';
import {
  SiteConfigContext,
  SiteConfigContextValue,
} from '../../core/settings/site-config-context';
import {useSettings} from '../../core/settings/use-settings';

interface Props {
  onTwoFactorChallenge: () => void;
}
export function LoginPage({ onTwoFactorChallenge }: Props) {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();

  const isWorkspaceLogin = pathname.includes('workspace');
  const searchParamsEmail = searchParams.get('email') || undefined;
  const searchParamsPhone = searchParams.get('phone') || undefined;
  const searchParamsForceEmail = searchParams.get('user') === 'admin';

  const { branding, registration, site, social, mobile_login, base_url } = useSettings();
  const siteConfig = useContext(SiteConfigContext);

  const demoDefaults =
    site.demo && !searchParamsEmail ? getDemoFormDefaults(siteConfig) : {};
  const form = useForm<LoginPayload>({
    defaultValues: {
      remember: true,
      email: searchParamsEmail,
      phone: searchParamsPhone,
      baseURL: base_url,
    },
  });
  const login = useLogin(form);

  const heading = isWorkspaceLogin ? (
    <Trans
      values={{ siteName: branding?.site_name }}
      message="To join your team on :siteName, login to your account"
    />
  ) : (
    <Trans message="Sign in to your account" />
  );

  const message = !registration.disable && (
    <Trans
      values={{
        a: parts => (
          <Link className={LinkStyle} to="/register">
            {parts}
          </Link>
        ),
      }}
      message="Don't have an account? <a>Sign up.</a>"
    />
  );

  const isInvalid = !!Object.keys(form.formState.errors).length;

  const [showEmailForm, setShowEmailForm] = useState(!!searchParamsEmail || searchParamsForceEmail);

  return (
    <AuthLayout heading={heading} message={message}>
      <StaticPageTitle>
        <Trans message="Login" />
      </StaticPageTitle>

        {mobile_login ? (
        <Form
          form={form}
          onSubmit={payload => {
            login.mutate(payload, {
              onSuccess: response => {
                if (response.two_factor) {
                  onTwoFactorChallenge();
                }
              },
            });
          }}
        >
          <FormTextField
            className="mb-32"
            name="phone"
            type="tel"
            label={<Trans message="Phone Number" />}
            invalid={isInvalid}
            required={!showEmailForm}
          />
          <Button
            className="block w-full"
            type="submit"
            variant="flat"
            color="primary"
            size="md"
            disabled={login.isPending}
          >
            <Trans message="Continue" />
          </Button>
        </Form>
        ) : <></>}

      <SocialAuthSection
        dividerMessage={
          !mobile_login ? ''
            : social.compact_buttons ? (
              <Trans message="Or sign in with" />
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
          startIcon={<EmailIcon />}
          onClick={() => setShowEmailForm(prev => !prev)}
        >
          <span className="min-w-160 text-start">
            <Trans message="Continue with email" />
          </span>
        </Button>
      }

      {showEmailForm && (

        <Form
          form={form}
          className='mt-20'
          onSubmit={payload => {
            payload.phone = undefined;
            login.mutate(payload, {
              onSuccess: response => {
                if (response.two_factor) {
                  onTwoFactorChallenge();
                }
              },
            });
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
            className="mb-32"
            name="password"
            type="password"
            label={<Trans message="Password" />}
            invalid={isInvalid}
            required
          />
          <Button
            className="block w-full"
            type="submit"
            variant="flat"
            color="primary"
            size="md"
            disabled={login.isPending}
          >
            <Trans message="Continue" />
          </Button>
        </Form>
      )}
    </AuthLayout>
  );
}

function getDemoFormDefaults(siteConfig: SiteConfigContextValue) {
  if (siteConfig.demo.loginPageDefaults === 'randomAccount') {
    // random number between 0 and 100, padded to 3 digits
    const number = Math.floor(Math.random() * 100) + 1;
    const paddedNumber = String(number).padStart(3, '0');
    return {
      email: `admin@demo${paddedNumber}.com`,
      password: 'admin',
    };
  } else {
    return {
      email: siteConfig.demo.email ?? 'admin@admin.com',
      password: siteConfig.demo.password ?? 'admin',
    };
  }
}

function EmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24">
      <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
      <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
    </svg>
  );
}
