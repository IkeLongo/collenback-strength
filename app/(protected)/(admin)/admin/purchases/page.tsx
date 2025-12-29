// app/(protected)/(admin)/admin/purchases/page.tsx
import PurchasesTableClient from "./purchases-table-client";
import { getAdminPurchases } from "@/app/lib/auth/getPurchases";

export default async function AdminPurchasesPage() {
  const limit = 25;
  const offset = 0;

  const data = await getAdminPurchases({ limit, offset });

  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-600">
        {(data as any).message ?? "Failed to load purchases."}
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
        initialPurchases={(data as any).purchases}
        initialTotals={(data as any).totals}
        initialTotal={(data as any).total}
        initialLimit={(data as any).limit}
        initialOffset={(data as any).offset}
      />
    </div>
  );
}
