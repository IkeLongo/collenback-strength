import Stripe from "stripe";
import Link from "next/link";
import ClearCartOnSuccess from "@/app/ui/components/stripe/clear-cart-on-success";

interface ResultPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

function formatMoney(cents: number | null | undefined, currency: string | null | undefined) {
  const value = (cents ?? 0) / 100;
  const cur = (currency ?? "usd").toUpperCase();
  return value.toLocaleString(undefined, { style: "currency", currency: cur });
}

function formatDate(unixSeconds: number | null | undefined) {
  if (!unixSeconds) return "—";
  return new Date(unixSeconds * 1000).toLocaleString();
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const sessionIdRaw = searchParams?.session_id;
  const sessionId = Array.isArray(sessionIdRaw) ? sessionIdRaw[0] : sessionIdRaw;

  if (!sessionId) {
    return (
      <main className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-10">
        <div className="rounded-2xl border border-grey-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl! font-extrabold! text-grey-900!">Missing session</h1>
          <p className="mt-2 text-grey-600! text-sm!">
            We couldn’t find your checkout session. Please return to the dashboard.
          </p>
          <Link href="/client" className="inline-block mt-4">
            <span className="rounded-xl bg-gold-500 px-4 py-2 font-extrabold text-black shadow-md transition hover:shadow-xl">
              Back to Dashboard
            </span>
          </Link>
        </div>
      </main>
    );
  }

  // Pull key info + line items
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: [
      "payment_intent",
      "subscription",
      "subscription.latest_invoice.payment_intent"
    ],
  });

  const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
    limit: 20,
  });

  const currency = session.currency ?? "usd";
  const customerName = session.customer_details?.name ?? "there";
  const customerEmail = session.customer_details?.email ?? "your email";
  const paid = session.payment_status === "paid";
  const total = formatMoney(session.amount_total, currency);
  const createdAt = formatDate(session.created);

  // PaymentIntent status (works for both one-time and subscription)
  const sub = session.subscription as Stripe.Subscription | null;
  let invoicePI: Stripe.PaymentIntent | null = null;
  if (sub?.latest_invoice && typeof sub.latest_invoice !== "string") {
  const invoice = sub.latest_invoice as Stripe.Invoice & { payment_intent?: Stripe.PaymentIntent | string };
    invoicePI = invoice.payment_intent as Stripe.PaymentIntent | null;
  }
  const pi = (session.payment_intent as Stripe.PaymentIntent | null) || invoicePI;
  const piStatus = pi?.status ?? "—";

  const shouldClear = session.payment_status === "paid";

  return (
    <main className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-8 sm:py-12">
      <ClearCartOnSuccess shouldClear={shouldClear} />
      {/* Hero */}
      <div className="rounded-2xl border border-grey-200 bg-white shadow-sm overflow-hidden">
        <div className="relative">
          {/* subtle header gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gold-500/80 via-grey-900/80 to-grey-950/95" />
          <div className="relative px-6 py-7 sm:px-8 sm:py-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl! sm:text-3xl! font-extrabold! text-white!">
                  {paid ? "Payment confirmed" : "Checkout received"}
                </h1>
                <p className="mt-1 text-white/85 text-sm! sm:text-base!">
                  Thank you, <span className="font-semibold!">{customerName}</span>. We sent a confirmation to{" "}
                  <span className="font-semibold!">{customerEmail}</span>.
                </p>
              </div>

              <span
                className={`
                  inline-flex items-center rounded-full px-3 py-1 text-xs! font-bold!
                  ${paid ? "bg-green-700 text-white" : "bg-grey-200 text-grey-900"}
                `}
              >
                {paid ? "PAID" : (session.payment_status ?? "STATUS").toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Order details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-grey-200 bg-white p-4">
                <p className="text-xs! text-grey-500!">Total</p>
                <p className="mt-1 text-lg! font-bold! text-grey-900!">{total}</p>
              </div>

              <div className="rounded-2xl border border-grey-200 bg-white p-4">
                <p className="text-xs! text-grey-500!">Order ID</p>
                <p className="mt-1 text-sm! font-bold! text-grey-900! break-all!">
                  {session.id}
                </p>
              </div>

              <div className="rounded-2xl border border-grey-200 bg-white p-4">
                <p className="text-xs! text-grey-500!">Created</p>
                <p className="mt-1 text-sm! font-bold! text-grey-900!">{createdAt}</p>
              </div>
            </div>

            {/* Line items */}
            <div className="rounded-2xl border border-grey-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-grey-200">
                <h2 className="text-lg! font-extrabold! text-grey-900!">Items</h2>
                <p className="text-sm! text-grey-500!">Here’s what you purchased.</p>
              </div>

              <div className="p-4 space-y-3">
                {lineItems.data.length === 0 ? (
                  <p className="text-sm! text-grey-500!">No line items found.</p>
                ) : (
                  lineItems.data.map((li) => {
                    const name = li.description ?? "Item";
                    const qty = li.quantity ?? 1;
                    const amount = li.amount_total ?? li.amount_subtotal ?? 0;

                    return (
                      <div
                        key={li.id}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-grey-200 p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm! font-semibold! text-grey-900! line-clamp-2!">
                            {name}
                          </p>
                          <p className="text-xs! text-grey-500! mt-1">
                            Qty: <span className="font-semibold!">{qty}</span>
                          </p>
                        </div>

                        <p className="text-sm! font-extrabold! text-grey-600! whitespace-nowrap">
                          {formatMoney(amount, currency)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right: Status + Actions */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-grey-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-grey-200">
                <h2 className="text-lg! font-extrabold! text-grey-900!">Next steps</h2>
                <p className="text-sm! text-grey-500!">What would you like to do?</p>
              </div>

              <div className="p-5 space-y-3">
                <div className="rounded-xl border border-grey-200 bg-grey-50 p-3">
                  <p className="text-xs! text-grey-500!">Payment intent status</p>
                  <p className="text-sm! font-bold! text-grey-900!">
                    {piStatus}
                  </p>
                </div>

                <Link href="/client/dashboard" className="block">
                  <span className="block w-full text-center rounded-xl border border-grey-200 py-3 text-sm font-semibold text-grey-700 hover:bg-grey-50 transition">
                    Back to Dashboard
                  </span>
                </Link>

                <Link href="/client/programs" className="block">
                  <span className="block w-full text-center rounded-xl border border-grey-200 py-3 text-sm font-semibold text-grey-700 hover:bg-grey-50 transition">
                    Browse Programs
                  </span>
                </Link>

                <p className="pt-2 text-xs! text-grey-500! text-center">
                  Secure checkout powered by{" "}
                  <span className="font-semibold! text-grey-700!">Stripe</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
