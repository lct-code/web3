import {Fragment, ReactElement, useEffect} from 'react';
import {Navbar} from '../../ui/navigation/navbar/navbar';
import {CustomMenu} from '../../menus/custom-menu';
import {LocaleSwitcher} from '../../i18n/locale-switcher';
import {removeFromLocalStorage} from '../../utils/hooks/local-storage';
import {StaticPageTitle} from '../../seo/static-page-title';
import {Trans} from '../../i18n/trans';

interface CheckoutLayoutProps {
  children: [ReactElement, ReactElement];
}

const customProductSummaryLayout = true;

export function CheckoutLayout({children}: CheckoutLayoutProps) {
  const [upper, lower] = children;

  useEffect(() => {
    removeFromLocalStorage('be.onboarding.selected');
  }, []);

  return customProductSummaryLayout? (
    <div className='flex flex-col bg-gradient-to-r from-primary-light to-primary-dark pb-24 min-h-screen'>
      <StaticPageTitle>
        <Trans message="Checkout" />
      </StaticPageTitle>
      <Navbar
        size="sm"
        color="transparent"
        className="z-10 mb-20 md:mb-0"
        textColor="text-main"
        logoColor="dark"
        darkModeColor="transparent"
        menuPosition="checkout-page-navbar"
      />
      <div className="flex items-center grow w-full">
      <div className=" bg dark:bg-alt mx-12 md:mx-auto py-24 px-4 md:max-w-[90%]   lg:max-w-[900px] w-full h-full">
        <div className="flex flex-col items-center gap-20 w-full mx-auto justify-between px-20 md:px-0 md:max-w-950">
          <div className="self-end mb-4">
            {/* <LocaleSwitcher /> */}
          </div>
          {/* <div className="hidden md:block fixed right-0 top-0 w-1/2 h-full bg-alt shadow-[15px_0_30px_0_rgb(0_0_0_/_18%)]" /> */}
          <div className="overflow-hidden">
            {upper}
          </div>
          <div className="md:block max-w-384">
            <div className="relative z-10">{lower}</div>
            <CustomMenu
              menu="checkout-page-footer"
              className="text-xs mt-50 text-muted overflow-x-auto"
            />
            <div className="mt-40">
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  ):
  (
    <Fragment>
      <StaticPageTitle>
        <Trans message="Checkout" />
      </StaticPageTitle>
      <Navbar
        size="sm"
        color="transparent"
        className="z-10 mb-20 md:mb-0"
        textColor="text-main"
        logoColor="dark"
        darkModeColor="transparent"
        menuPosition="checkout-page-navbar"
      />
      <div className="md:flex w-full mx-auto justify-between px-20 md:px-0 md:pt-128 md:max-w-950">
        <div className="hidden md:block fixed right-0 top-0 w-1/2 h-full bg-alt shadow-[15px_0_30px_0_rgb(0_0_0_/_18%)]" />
        <div className="md:w-400 overflow-hidden">
          {lower}
          <CustomMenu
            menu="checkout-page-footer"
            className="text-xs mt-50 text-muted overflow-x-auto"
          />
          <div className="mt-40">
            <LocaleSwitcher />
          </div>
        </div>
        <div className="hidden md:block w-384">
          <div className="relative z-10">{upper}</div>
        </div>
      </div>
    </Fragment>
  );
}
