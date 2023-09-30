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
import {useContext} from 'react';
import {
  SiteConfigContext,
  SiteConfigContextValue,
} from '../../core/settings/site-config-context';
import {useSettings} from '../../core/settings/use-settings';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const {pathname} = useLocation();

  const isWorkspaceLogin = pathname.includes('workspace');
  const searchParamsPhone = searchParams.get('phone') || undefined;

  const {branding, registration, site} = useSettings();
  const siteConfig = useContext(SiteConfigContext);

  const demoDefaults =
    site.demo && !searchParamsPhone ? getDemoFormDefaults(siteConfig) : {};
  const form = useForm<LoginPayload>({
    defaultValues: {remember: true, phone: searchParamsPhone, ...demoDefaults},
  });
  const login = useLogin(form);

  const heading = isWorkspaceLogin ? (
    <Trans
      values={{siteName: branding?.site_name}}
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

  const isInvalid = !form.formState.isValid;

  return (
    <AuthLayout heading={heading} message={message}>
      <StaticPageTitle>
        <Trans message="Login" />
      </StaticPageTitle>
      <Form
        form={form}
        onSubmit={payload => {
          login.mutate(payload);
        }}
      >
        <FormTextField
          className="mb-32"
          name="phone"
          type="text"
          disabled={!!searchParamsPhone}
          label={<Trans message="Phone" />}
          invalid={isInvalid}
          required
        />
        <FormCheckbox name="remember" className="block mb-32">
          <Trans message="Stay signed in for a month" />
        </FormCheckbox>
        <Button
          className="block w-full"
          type="submit"
          variant="flat"
          color="primary"
          size="md"
          disabled={login.isLoading}
        >
          <Trans message="Continue" />
        </Button>
      </Form>
      <SocialAuthSection dividerMessage={<Trans message="Or sign in with" />} />
    </AuthLayout>
  );
}

function getDemoFormDefaults(siteConfig: SiteConfigContextValue) {
  if (siteConfig.demo.loginPageDefaults === 'randomAccount') {
    // random number between 0 and 10000000, padded to 7 digits
    const number = Math.floor(Math.random() * 10000000) + 1;
    const paddedNumber = String(number).padStart(7, '0');
    return {
      phone: `011${paddedNumber}`,
    };
  } else {
    return {
      phone: `0110000000`,
    };
  }
}
