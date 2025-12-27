import { LoginFormSchema } from '@/app/lib/definitions'
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Ensure credentials are defined and properly typed
        if (!credentials || typeof credentials.email !== "string" || typeof credentials.password !== "string") {
          throw new Error("Invalid credentials.");
        }

        // Validate credentials using signInSchema
        const { email, password } = await LoginFormSchema.parseAsync(credentials);

        // Debug: Log the submitted email and password
        // console.log("Submitted Email:", email);
        // console.log("Submitted Password (raw):", password);

        let user = null;

        // Call the login_user API endpoint
        try {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
          const response = await fetch(`${baseUrl}/api/login_user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.message || "Invalid credentials.");
          }

          // The API now handles password verification and returns full user info with role
          return {
            id: result.userId,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            phone: result.user.phone,
            role: result.role,
            roleId: result.roleId,
            avatarKey: result.user.avatarKey ?? null,
          };
        } catch (err) {
          // console.error('Error fetching user:', err);
          throw new Error("An error occurred while verifying credentials.");
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Attach user details to the session object
      if (token) {
        (session.user as any) = {
          ...session.user,
          id: token.sub as string,
          role: (token as any).role,
          roleId: (token as any).roleId,
          roles: (token as any).roles ?? [],
          roleIds: (token as any).roleIds ?? [],
          isAdmin: Boolean((token as any).isAdmin),
          firstName: token.firstName as string,
          lastName: token.lastName as string,
          phone: token.phone as string,
          avatarKey: (token as any).avatarKey ?? null,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role;
        (token as any).roleId = (user as any).roleId;

        const roles = (user as any).roles ?? [];
        const roleIds = (user as any).roleIds ?? [];
        (token as any).roles = roles;
        (token as any).roleIds = roleIds;

        // treat admin as either name match or id=3
        (token as any).isAdmin = roles.includes("admin") || roleIds.includes(3);

        (token as any).firstName = (user as any).firstName;
        (token as any).lastName = (user as any).lastName;
        (token as any).phone = (user as any).phone;
        (token as any).avatarKey = (user as any).avatarKey ?? null;
      }
      return token;
    },
  },
});
