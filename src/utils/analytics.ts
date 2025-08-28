// src/utils/analytics.ts

export const sendAnalyticsEvent = (
  eventName: string,
  params: Record<string, any> = {},
  isAdmin: boolean = false
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Jeśli to admin, dodajemy specjalne flagi
    if (isAdmin) {
      params = {
        ...params,
        traffic_type: 'internal',
        debug_mode: true,
      };
    }

    // Wysyłamy event tylko jeśli to nie admin lub jesteśmy w trybie debug
    if (!isAdmin || process.env.NODE_ENV === 'development') {
      window.gtag('event', eventName, params);
    }
  }
};

// Funkcja pomocnicza do sprawdzania czy użytkownik jest adminem
export const isUserAdmin = (user: any) => {
  return user?.role === 'admin';
};

// Predefiniowane eventy z obsługą admina
export const analyticsEvents = {
  // Rejestracja
  registerStart: (isAdmin = false) =>
    sendAnalyticsEvent('register_start', {}, isAdmin),

  registerSuccess: (userId: string, isAdmin = false) =>
    sendAnalyticsEvent(
      'register_complete',
      {
        user_id: userId,
      },
      isAdmin
    ),

  registerError: (errorMessage: string, isAdmin = false) =>
    sendAnalyticsEvent(
      'register_error',
      { error_message: errorMessage },
      isAdmin
    ),

  // Logowanie
  loginSuccess: (userId: string, isAdmin = false) =>
    sendAnalyticsEvent('login', { method: 'email', user_id: userId }, isAdmin),

  loginError: (errorMessage: string, isAdmin = false) =>
    sendAnalyticsEvent('login_error', { error_message: errorMessage }, isAdmin),

  // Zamówienia
  orderStart: (isAdmin = false) =>
    sendAnalyticsEvent('begin_checkout', {}, isAdmin),

  orderComplete: (
    orderId: string,
    value: number,
    items: number,
    isAdmin = false
  ) =>
    sendAnalyticsEvent(
      'purchase',
      {
        transaction_id: orderId,
        value: value,
        items_count: items,
        currency: 'PLN',
      },
      isAdmin
    ),

  // Doładowania
  topUpStart: (amount: number, isAdmin = false) =>
    sendAnalyticsEvent(
      'top_up_start',
      {
        value: amount,
        currency: 'PLN',
      },
      isAdmin
    ),

  topUpComplete: (amount: number, isAdmin = false) =>
    sendAnalyticsEvent(
      'top_up_complete',
      {
        value: amount,
        currency: 'PLN',
      },
      isAdmin
    ),
};
