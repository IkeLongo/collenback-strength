import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extended User type to include role-based properties.
   */
  interface User {
    role?: string;
    roleId?: number;
    firstName?: string;
    lastName?: string;
    phone?: string;
    // Keep for backward compatibility
    is_admin?: boolean;
  }

  /**
   * Extended Session type to include the role-based user properties.
   */
  interface Session {
    user: {
      id: string;
      role: string;
      roleId: number;
      firstName: string;
      lastName: string;
      phone: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT type to include role-based properties.
   */
  interface JWT {
    role?: string;
    roleId?: number;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }
}
