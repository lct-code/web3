import {Link, Navigate, useLocation, useSearchParams} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {FormTextField} from '../../ui/forms/input-field/text-field/text-field';
import {Button} from '../../ui/buttons/button';
import {Form} from '../../ui/forms/form';
import {LinkStyle} from '../../ui/buttons/external-link';
import {RegisterPayloadPhone, useRegisterPhone} from '../requests/use-register-phone';
import {SocialAuthSection} from './social-auth-section';
import {AuthLayout} from './auth-layout/auth-layout';
import {Trans} from '../../i18n/trans';
import {FormCheckbox} from '../../ui/forms/toggle/checkbox';
import {FormComboBox} from '../../ui/forms/combobox/form-combobox';
import {Item} from '../../ui/forms/listbox/item';
import {CustomMenuItem} from '../../menus/custom-menu';
import {useRecaptcha} from '../../recaptcha/use-recaptcha';
import {StaticPageTitle} from '../../seo/static-page-title';
import {useSettings} from '../../core/settings/use-settings';
import {Alert} from '../../alerts/alert';

export function RegisterPage() {
  const {
    branding,
    registration: {disable},
  } = useSettings();
  const {verify, isVerifying} = useRecaptcha('register');

  const {pathname} = useLocation();
  const [searchParams] = useSearchParams();

  const isWorkspaceRegister = pathname.includes('workspace');
  const isBillingRegister = searchParams.get('redirectFrom') === 'pricing';
  const searchParamsPhone = searchParams.get('phone') || undefined;

  const form = useForm<RegisterPayloadPhone>({
    defaultValues: {phone: searchParamsPhone},
  });
  const register = useRegisterPhone(form);
  const watchFields = form.watch();

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

  type SubOption = {
    id: string,
    label: string,
    price: number,
  }
  const subOptions: SubOption[] = [
    /*
    {id: "", label: 'No Subscription',   price: 0},
    {id: "1000045459", label: "Daily",   price: 1.5},
    {id: "1000045461", label: "Weekly",  price: 5},
    {id: "1000045179", label: "Monthly", price: 10},
    */
  ]
  const subSelected = subOptions.filter(opts => opts.id === watchFields?.subscription).shift()

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
        <Trans message="Login" />
      </StaticPageTitle>
      <Form
      form={form}
        onSubmit={async payload => {
          const isValid = await verify();
          if (isValid) {
            register.mutate(payload);
          }
        }}
      >
        <FormTextField
          className="mb-32"
          name="phone"
          type="text"
          disabled={!!searchParamsPhone}
          label={<Trans message="Phone" />}
          required
        />
        {subOptions.length > 0 && (
            <FormComboBox
              className="mb-32"
              items={subOptions.map(opt => {return {id:opt.id,label:opt.label}})}
              name="subscription"
              openMenuOnFocus
              useOptionLabelAsInputValue={true}
              label={<Trans message="Subscription" />}
            >
              {item => (
                <Item value={item.id} key={item.id}>
                  {item.label}
                </Item>
              )}
            </FormComboBox>
        )}
        {watchFields?.phone && watchFields?.subscription && (
          <Alert
            title={<Trans message="Heads up" />}
            type="info"
            message={
              <Trans message="You are about to subscribe to the daily Dohaty service using your saved phone number: :phone for :amount SR"
              values={{phone: watchFields?.phone, amount: subSelected?.price}}
              />
            }
            />
        )}
        <PolicyCheckboxes />
        <Button
          className="block w-full"
          type="submit"
          variant="flat"
          color="primary"
          size="md"
          disabled={register.isLoading || isVerifying}
        >
          <Trans message="Create account" />
        </Button>
        <SocialAuthSection
          dividerMessage={<Trans message="Or sign up with" />}
        />
      </Form>
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
          className="block mb-4"
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
