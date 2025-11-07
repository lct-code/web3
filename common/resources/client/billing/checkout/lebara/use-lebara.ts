import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../auth/use-auth';
import { apiClient } from '../../../http/query-client';
import { useSelectedLocale } from '../../../i18n/selected-locale';
import { useSettings } from '../../../core/settings/use-settings';
import { useIsDarkMode } from '../../../ui/themes/use-is-dark-mode';
import { Button } from '../../../ui/buttons/button';

interface UseLebaraProps {
    type?: string;
    priceId?: string;
}

export interface LebaraResponse {
    status?: string;
    phone?: string;
    message?: string;
    error?: {
        message: string;
        type: string;
    };
    subscriptionId?: string;
}

export interface LebaraPayload {
    auth_code?: string
    phone?: string;
    resend?: boolean;
}

export function useLebara({ priceId }: UseLebaraProps) {
    const { user } = useAuth();
    const isDarkMode = useIsDarkMode();
    const isInitiatedRef = useRef<boolean>(false);
    const { localeCode } = useSelectedLocale();
    const {
        branding: { site_name },
        billing: {
            lebara: { enable },
        },
    } = useSettings();

    const subscribeStart = async ({ phone }: LebaraPayload): Promise<LebaraResponse> => {
        const response = await apiClient.post('billing/lebara/subscribe-start', { price_id: priceId, phone: phone });

        return response.data;
    }

    const subscribeVerify = async ({ auth_code }: LebaraPayload): Promise<LebaraResponse> => {
        const response = await apiClient.post('billing/lebara/subscribe-verify', { price_id: priceId, auth_code });

        return response.data;
    }

    const syncSubscriptionDetails = () => {
        return apiClient.post('billing/lebara/sync-subscription-details', {
            price_id: priceId,
        });
    }

    return {
        lebara: { subscribeStart, subscribeVerify, syncSubscriptionDetails },
        lebaraIsEnabled: enable,
    };
}







