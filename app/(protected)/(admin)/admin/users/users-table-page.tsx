"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/app/lib/utils";
import { UserAvatar } from "@/app/ui/components/user/user-avatar";
import AdminUserModal from "@/app/ui/components/modal/AdminUserModal";

type RoleTab = "client" | "coach" | "admin";

type UserRow = {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  avatar_key: string | null;
  roles: string[];
};

type ListResponse = {
  ok: boolean;
  role: RoleTab;
  search: string;
  total: number;
  limit: number;
  offset: number;
  users: UserRow[];
  message?: string;
};

function name(first?: string | null, last?: string | null) {
  return [first, last].filter(Boolean).join(" ").trim() || "—";
}

function avatarUrlFromKey(key?: string | null) {
  if (!key) return null;
  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL!.replace(/\/$/, "")}/${key}`;
}

const TABS: { key: RoleTab; label: string }[] = [
  { key: "client", label: "Clients" },
  { key: "coach", label: "Coaches" },
  { key: "admin", label: "Admins" },
];

export default function UsersTablePage() {
  const [tab, setTab] = useState<RoleTab>("client");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);

  const [selected, setSelected] = useState<UserRow | null>(null);

  // Pagination
  const limit = 10;
  const [page, setPage] = useState(0);
  const offset = page * limit;

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total]);
  const canPrev = page > 0;
  const canNext = page + 1 < pageCount;

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  // reset page when tab/search changes
  useEffect(() => {
    setPage(0);
  }, [tab, debounced]);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const qs = new URLSearchParams({
        role: tab,
        limit: String(limit),
        offset: String(offset),
      });
      if (debounced) qs.set("search", debounced);

      const res = await fetch(`/api/admin/users?${qs.toString()}`, { cache: "no-store" });
      const data = (await res.json()) as ListResponse;
      if (!res.ok || !data.ok) throw new Error(data?.message || "Failed to load users.");

      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch (e: any) {
      setUsers([]);
      setTotal(0);
      setError(e?.message ?? "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, debounced, offset]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl! font-semibold! text-grey-700! normal-case!">Users</h1>
          <p className="text-sm! text-grey-500!">Manage clients, coaches, and admins.</p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="rounded-xl border border-grey-300 bg-white px-3 py-2 text-sm text-grey-700 shadow-sm hover:bg-grey-100 disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      {/* Tabs + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-2xl border border-grey-300 bg-white p-1 shadow-sm w-fit gap-1">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "px-3 py-2 text-sm font-semibold rounded-xl",
                  active ? "bg-grey-900 text-white" : "text-grey-700 hover:bg-grey-100"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone…"
            className="w-full sm:w-[340px] rounded-xl border border-grey-300 bg-white px-3 py-2 text-sm text-grey-700 shadow-sm outline-none focus:border-grey-500"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-grey-300 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[950px] w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[320px]" /> {/* User */}
              <col className="w-[280px]" /> {/* Email */}
              <col className="w-[180px]" /> {/* Phone */}
              <col className="w-[120px]" /> {/* Status */}
              <col className="w-[220px]" /> {/* Roles */}
            </colgroup>

            <thead className="bg-grey-100 text-grey-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Phone</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Roles</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-grey-500" colSpan={5}>
                    Loading…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-grey-500" colSpan={5}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const fullName = name(u.first_name, u.last_name);
                  return (
                    <tr
                      key={u.id}
                      className="border-t border-grey-300 hover:bg-grey-50 cursor-pointer"
                      onClick={() => setSelected(u)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            name={fullName}
                            avatarUrl={avatarUrlFromKey(u.avatar_key)}
                            size={40}
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-grey-700 truncate">{fullName}</div>
                            <div className="text-xs text-grey-500">User #{u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-grey-700 truncate">{u.email}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-grey-700 truncate">{u.phone ?? "—"}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                            u.is_active
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-grey-300 bg-white text-grey-700"
                          )}
                        >
                          {u.is_active ? "active" : "inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-grey-700 truncate">{u.roles.join(", ") || "—"}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between gap-2 border-t border-grey-300 bg-white px-4 py-3">
          <div className="text-sm text-grey-600">
            {total === 0 ? "0 results" : `Showing ${offset + 1}-${Math.min(offset + limit, total)} of ${total}`}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={!canPrev || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-xl border border-grey-300 bg-white px-3 py-2 text-sm font-semibold text-grey-700 hover:bg-grey-100 disabled:opacity-50"
            >
              Prev
            </button>
            <div className="text-sm text-grey-600">
              Page {page + 1} of {pageCount}
            </div>
            <button
              disabled={!canNext || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-grey-300 bg-white px-3 py-2 text-sm font-semibold text-grey-700 hover:bg-grey-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AdminUserModal
        open={!!selected}
        user={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
