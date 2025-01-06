import {Navigate, useParams} from 'react-router-dom';
import {Trans} from '../../i18n/trans';
import {CheckoutLayout} from './checkout-layout';
import {CheckoutProductSummary} from './checkout-product-summary';
import {usePaypal} from './paypal/use-paypal';
import {StripeElementsForm} from './stripe/stripe-elements-form';
import {PhonesubElementsForm} from './phonesub/phonesub-elements-form';
import {Fragment} from 'react';
import {useProducts} from '../pricing-table/use-products';
import {FullPageLoader} from '../../ui/progress/full-page-loader';
import {useSettings} from '../../core/settings/use-settings';
import {Button} from '../../ui/buttons/button';
import {useNavigate} from '../../utils/hooks/use-navigate';

export function Checkout() {
  const {productId, priceId, paymentMethodId} = useParams();
  const productQuery = useProducts();
  const {paypalElementRef} = usePaypal({
    productId,
    priceId,
  });
  const {
    base_url,
    billing: {stripe, phonesub, paypal, zain_sd},
  } = useSettings();
  const navigate = useNavigate();

  if (productQuery.isLoading) {
    return <FullPageLoader screen />;
  }

  const product = productQuery.data?.products.find(
    p => p.id === parseInt(productId!)
  );
  const price = product?.prices.find(p => p.id === parseInt(priceId!));

  // make sure product and price exists in backend
  if (!product || !price || productQuery.status === 'error') {
    return <Navigate to="/pricing" replace />;
  }

  const paymentMethodComponents = [
    {
      key: 'phonesub',
      component: (
        <PhonesubElementsForm
          productId={productId}
          priceId={priceId}
          submitLabel={<Trans message="Send code" />}
          verifyLabel={<Trans message="Verify code" />}
          resendLabel={<Trans message="Resend code" />}
          type="subscription"
          returnUrl={`/checkout/${productId}/${priceId}/phonesub/done`}
        />
      ),
      enable: phonesub.enable && (price?.paymentMethods || []).includes('phonesub'),
    },
    {
      key: 'stripe',
      component: (
        <StripeElementsForm
          productId={productId}
          priceId={priceId}
          submitLabel={<Trans message="Upgrade" />}
          type="subscription"
          returnUrl={`${base_url}/checkout/${productId}/${priceId}/stripe/done`}
        />
      ),
      enable: stripe.enable && (price?.paymentMethods || []).includes('stripe'),
    },
    {
      key: 'paypal',
      component: <div ref={paypalElementRef} />,
      enable: paypal.enable && (price?.paymentMethods || []).includes('paypal'),
    },
    {
      key: 'zain_sd',
      component: (
        <Button 
          variant="flat"
          color="primary"
          size="md"
          className="w-full"
          onClick={() => {
            const zainSdProductId = price?.zain_sd_product_code;
            if (zainSdProductId) {
              window.location.href = `https://dsplp.sd.zain.com/?p=${zainSdProductId}`;
            }
          }}
        >
          <Trans message="Pay with Zain SD" />
        </Button>
      ),
      enable: zain_sd?.enable && (price?.paymentMethods || []).includes('zain_sd'),
    },
    {
      key: 'go-back',
      component: (
        <Button
          variant="flat"
          color="chip"
          size="md"
          className="w-full"
          type="button"
          onClick={() => {
            navigate('/pricing');
          }}
        >
          <Trans message="Go back" />
        </Button>
      ),
      enable: true,
    }
  ];

  paymentMethodComponents.sort((a, b) => {
    if (a.key === paymentMethodId) return -1;
    if (b.key === paymentMethodId) return 1;
    return 0;
  });

  const enabledComponents = paymentMethodComponents.filter(
    component => component.enable
  );

  return (
    <CheckoutLayout>
      {price.custom_summary?
      <div dangerouslySetInnerHTML={{__html:price.custom_summary}}></div>
      :
      // <CheckoutProductSummary /> 
      <></>
      }
      <Fragment>
        {enabledComponents.map((component, index) => (
          <Fragment key={component.key}>
            {component.component}
            {index < enabledComponents.length - 1 && <Separator />}
          </Fragment>
        ))}
        <div className="mt-30 text-xs text-muted">
          <Trans message="You’ll be charged until you cancel your subscription. Previous charges won’t be refunded when you cancel unless it’s legally required. Your payment data is encrypted and secure. By subscribing your agree to our terms of service and privacy policy." />
        </div>
      </Fragment>
    </CheckoutLayout>
  );
}

function Separator() {
  return (
    <div className="relative my-20 text-center before:absolute before:left-0 before:top-1/2 before:h-1 before:w-full before:-translate-y-1/2 before:bg-divider">
      <span className="relative z-10 bg px-10 text-sm text-muted">
        <Trans message="or" />
      </span>
    </div>
  );
}
