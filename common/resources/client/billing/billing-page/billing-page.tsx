import {useBillingUser} from './use-billing-user';
import {CancelledPlanPanel} from './panels/cancelled-plan-panel';
import {ActivePlanPanel} from './panels/active-plan-panel';
import {PaymentMethodPanel} from './panels/payment-method-panel';
import {InvoiceHistoryPanel} from './panels/invoice-history-panel';

export function BillingPage() {
  const {subscription} = useBillingUser();
  if (!subscription?.price || !subscription?.product) return null;

  const planPanel = subscription.ends_at ? (
    <CancelledPlanPanel />
  ) : (
    <ActivePlanPanel />
    );

  let showInvoiceHistoryPanel = false;

  return (
    <div>
      {planPanel}
      <PaymentMethodPanel />
      {showInvoiceHistoryPanel && (<InvoiceHistoryPanel />)}
    </div>
  );
}
