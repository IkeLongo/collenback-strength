"use client";

import type { LineItem, ProgramLineItem } from "@/app/types/entitlements";
import { urlFor } from "@/sanity/lib/image";
import DownloadButton from "../components/button/DownloadButton";

function formatDate(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function isProgram(item: LineItem): item is ProgramLineItem {
  return item.kind === "program";
}

export default function ProgramCards({
  items,
  title = "Your Programs",
}: {
  items: LineItem[];
  title?: string;
}) {
  const programs = items.filter(isProgram);

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-grey-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm! font-semibold! text-grey-700!">{title}</div>
            <div className="text-xs! text-grey-500!">
              {programs.length === 0 ? "No programs found." : `${programs.length} program(s)`}
            </div>
          </div>
        </div>
      </div>

      {programs.length === 0 ? null : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => {
            const downloadHref = `/api/programs/${p.program_entitlement_id}/download`;
            // console.log("[ProgramCards] program", {
            //   id: p.program_entitlement_id,
            //   title: p.service_title,
            //   cover_image_url: p.cover_image_url,
            //   cover_image_alt: p.cover_image_alt,
            // });

            return (
              <div
                key={`program-${p.program_entitlement_id}`}
                className="bg-white rounded-2xl border border-grey-200 shadow-sm overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-wide text-grey-500">
                        Purchased {formatDate(p.purchased_at)}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-grey-900 truncate">
                        {p.service_title ?? "Program"}
                      </div>
                    </div>

                    <span className="shrink-0 inline-flex items-center rounded-full border border-grey-200 bg-grey-50 px-2.5 py-1 text-[11px] font-semibold text-grey-700">
                      PDF
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                      {p.program_version ? `Version ${p.program_version}` : "Version —"}
                    </span>

                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border",
                        p.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-grey-100 text-grey-700 border-grey-200",
                      ].join(" ")}
                    >
                      {p.status === "active" ? "Active" : p.status}
                    </span>
                  </div>
                </div>

                {/* Image */}
                <div className="px-4">
                  <div className="relative w-full overflow-hidden rounded-xl border border-grey-200 bg-grey-50">
                    <div className="aspect-[16/9]">
                      {p.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={urlFor(p.cover_image_url)
                            .width(400)
                            .height(225)
                            .fit("crop")
                            .auto("format")
                            .url()
                          }
                          alt={p.cover_image_alt ?? p.service_title ?? "Program cover"}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <div className="text-xs text-grey-500 px-4 text-center">
                            Add a cover image in Sanity to make this card pop.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description / notes */}
                  <div className="mt-3 text-xs text-grey-600 line-clamp-2">
                    {p.program_notes ?? "Download your purchased program PDF anytime from here."}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto p-4 pt-3">
                  <DownloadButton
                    href={downloadHref}
                    className="bg-grey-900 text-white rounded-lg px-3 py-2 text-xs font-semibold"
                  />

                  <div className="mt-3 pt-3 border-t border-grey-200 text-[11px] text-grey-500">
                    Version-locked to your purchase
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
