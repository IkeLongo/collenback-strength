export const LEGAL = {
  companyLegalName: process.env.NEXT_PUBLIC_LEGAL_COMPANY_NAME ?? "Collenback Strength LLC",
  dbaName: process.env.NEXT_PUBLIC_DBA_NAME ?? "Collenback Strength",
  businessEmail: process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? "cade@collenbackstrength.com",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? "210-701-2655",

  address: {
    line1: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS_LINE1 ?? "13875 Riggs Rd",
    city: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS_CITY ?? "Helotes",
    state: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS_STATE ?? "TX",
    zip: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS_ZIP ?? "78023",
    country: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS_COUNTRY ?? "United States of America",
  },

  lastUpdatedPrivacy: process.env.NEXT_PUBLIC_PRIVACY_LAST_UPDATED ?? "March 5, 2026",
  lastUpdatedCookies: process.env.NEXT_PUBLIC_COOKIES_LAST_UPDATED ?? "March 5, 2026",
};