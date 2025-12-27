/**
 * Represents a service fetched from Sanity.
 */
export interface Service {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  category: string;
  shortDescription: string;
  longDescription: string;
  image: any; // Replace 'any' with a more specific type if available
  sessionsIncluded: number;
  priceCents: number;
  currency: string;
  stripePriceId: string;
}
/**
 * Represents a user in the application.
 */
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  password_hash: string;
  phone?: string;
  role?: string;
  roleId?: number;
  // Keep is_admin for backward compatibility
  is_admin?: boolean;
}

/**
 * Represents a generic API response structure.
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

/**
 * Represents a session user object.
 */
export interface SessionUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  roleId: number;
  phone: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: any; // Replace 'any' with a more specific type if available
  sku: string; // Add this
  currency: string; // Add this, e.g., "usd"
  [key: string]: any;
}