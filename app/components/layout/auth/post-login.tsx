import { getSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const getDashboardUrl = (role: string | undefined): string => {
  if (!role) return '/client/dashboard';
  switch (role.toLowerCase()) {
    case 'client':
      return '/client/dashboard';
    case 'coach':
      return '/coach/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/client/dashboard';
  }
}

export default function PostLoginPage() {
  const router = useRouter();

  useEffect(() => {
    async function redirectToDashboard() {
      const session = await getSession();
      const role = session?.user?.role;
      const dashboardUrl = getDashboardUrl(role);
      router.replace(dashboardUrl);
    }
    redirectToDashboard();
  }, [router]);

  return <div>Redirecting to your dashboard...</div>;
}