// app/(protected)/(admin)/admin/purchases/page.tsx
import PurchasesTableClient from "./purchases-table-client";
import { cookies } from "next/headers";

function baseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export default async function AdminPurchasesPage() {
  const limit = 25;
  const offset = 0;

  const cookieHeader = cookies().toString();

  const res = await fetch(
    `${baseUrl()}/api/admin/purchases?limit=${limit}&offset=${offset}`,
    {
      cache: "no-store",
      headers: { cookie: cookieHeader },
    }
  );

  const data = await res.json();

  if (!res.ok || !data?.ok) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-600">
        {data?.message ?? "Failed to load purchases."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl! font-semibold! text-grey-700! normal-case!">Purchases</h1>
        <p className="text-sm! text-grey-500!">Running log of purchases</p>
      </div>

      <PurchasesTableClient
        initialPurchases={data.purchases}
        initialTotals={data.totals}
        initialTotal={data.total}
        initialLimit={data.limit}
        initialOffset={data.offset}
      />
    </div>
  );
}
