import { LoginFormSchema } from '@/app/lib/definitions'
import { verifyCredentials } from '@/app/lib/auth/verifyCredentials'
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
        if (!credentials || typeof credentials.email !== "string" || typeof credentials.password !== "string") {
          throw new Error("Invalid credentials.");
        }

        const { email, password } = await LoginFormSchema.parseAsync(credentials);

        const user = await verifyCredentials(email, password);
        if (!user) throw new Error("Invalid credentials.");

        return user;
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
