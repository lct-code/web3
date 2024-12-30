import {useAuth} from '../use-auth';
import {ReactElement} from 'react';
import {Navigate, Outlet, useParams} from 'react-router-dom';

interface GuestRouteProps {
  children: ReactElement;
}
export function NotSubscribedRoute({children}: GuestRouteProps) {
  const {isLoggedIn, isSubscribed} = useAuth();
  const {paymentMethodId} = useParams();
  const noLogin = paymentMethodId === 'zain_sd' || paymentMethodId === 'phonesub';
  if (!isLoggedIn && !noLogin) {
    return <Navigate to="/register" replace />;
  }

  if (isLoggedIn && isSubscribed) {
    return <Navigate to="/billing" replace />;
  }

  return children || <Outlet />;
}
