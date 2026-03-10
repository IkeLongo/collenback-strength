const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

// Track pageviews
export const pageview = (url: string) => {
  if (!GA_ID) return;
  (window as any).gtag('config', GA_ID, {
    page_path: url,
  });
};

// Track custom events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category?: string;
  label?: string;
  value?: number;
}) => {
  if (!GA_ID) return;
  (window as any).gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
};

// GTM functions
export const gtmPageview = (url: string) => {
  if (!GTM_ID) return;
  (window as any).dataLayer?.push({
    event: 'page_view',
    page_path: url,
  });
};

export const gtmEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (!GTM_ID) return;
  (window as any).dataLayer?.push({
    event: eventName,
    ...parameters,
  });
};
