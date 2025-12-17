import { auth } from "@/app/actions/nextauth";
import { cookies } from "next/headers";

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

// Next passes searchParams into server components
export default async function DebugSessionsPage({
  searchParams,
}: {
  searchParams?: { bucket?: string; limit?: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Debug: /api/sessions/mine</h1>
        <p className="mt-2 text-sm text-red-700">
          No session / no session.user.id. You are not authenticated on the server.
        </p>
      </div>
    );
  }

  const cookieHeader = cookies().toString();

  // ✅ Always produce a valid absolute base URL
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const bucket = searchParams?.bucket ?? "upcoming"; // upcoming | past | all
  const limit = searchParams?.limit ?? "50";

  const url = `${baseUrl}/api/sessions/mine?bucket=${encodeURIComponent(
    bucket
  )}&limit=${encodeURIComponent(limit)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  const raw = await res.text();
  const parsed = safeJson(raw);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold text-black!">Debug: /api/sessions/mine</h1>

      <div className="text-sm text-black/70">
        Logged in as user id:{" "}
        <span className="font-semibold">{String(session.user.id)}</span>
      </div>

      <div className="text-sm text-black/70">
        Requesting:{" "}
        <span className="font-mono text-black">{`bucket=${bucket} limit=${limit}`}</span>
      </div>

      <pre className="rounded-lg border bg-white text-black p-4 text-xs overflow-auto">
        {JSON.stringify(
          {
            status: res.status,
            ok: res.ok,
            body: parsed ?? raw,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}
