"use client";

import { createDataAttribute, stegaClean } from "next-sanity";
import { client } from "@/sanity/lib/client";

const { projectId, dataset, stega } = client.config();
const dataConfig = {
  projectId,
  dataset,
  baseUrl: typeof stega?.studioUrl === "string" ? stega.studioUrl : "",
};

function sanityAttr(service: any, path: string) {
  return createDataAttribute({
    ...dataConfig,
    id: service._id,
    type: service._type ?? "service",
    path,
  }).toString();
}

export default function AdminProgramsRow({
  title,
  services,
  onServiceClick,
}: {
  title: string;
  services: any[];
  onServiceClick: (service: any) => void;
}) {
  return (
    <div className="mb-10">
      <h2 className="text-xl! sm:text-2xl! font-extrabold! text-gold-600! mb-4!">
        {stegaClean(title)}
      </h2>

      <div className="flex gap-5 overflow-x-auto overflow-visible py-3 pb-6 px-1 items-stretch">
        {services.map((service: any) => (
          <div
            key={service._id}
            onClick={() => onServiceClick(service)}
            // ✅ either omit document-level mapping, OR attach to a real field:
            data-sanity={sanityAttr(service, "title")}
            className="group min-w-[300px] max-w-xs w-full h-96 rounded-2xl bg-white border border-grey-200 shadow-sm cursor-pointer transition hover:shadow-xl hover:border-gold-500 hover:-translate-y-1 flex flex-col"
          >
            <div className="relative h-44 sm:h-48 w-full rounded-t-2xl overflow-hidden">
              <img
                src={service.imageUrl ?? "/logo-stamp.png"}
                alt={stegaClean(service.title ?? "Service")}
                data-sanity={sanityAttr(service, "image")}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
            </div>

            <div className="flex flex-col flex-1 gap-2 p-4">
              <h3 className="text-base! text-grey-700! leading-tight! line-clamp-2!" data-sanity={sanityAttr(service, "title")}>
                {stegaClean(service.title)}
              </h3>

              <p className="text-sm! text-grey-500! line-clamp-2!" data-sanity={sanityAttr(service, "shortDescription")}>
                {stegaClean(service.shortDescription)}
              </p>

              <div className="mt-2! flex! items-center! justify-between!">
                {service.priceCents ? (
                  <span className="text-gold-600! font-semibold! text-sm!" data-sanity={sanityAttr(service, "priceCents")}>
                    ${(service.priceCents / 100).toFixed(2)}
                  </span>
                ) : (
                  <span className="text-xs! text-grey-400!">Contact for pricing</span>
                )}

                {service.sessionsIncluded ? (
                  <span className="text-xs! bg-grey-100! text-grey-700! px-2! py-0.5! rounded-full!" data-sanity={sanityAttr(service, "sessionsIncluded")}>
                    {service.sessionsIncluded} sessions
                  </span>
                ) : null}
              </div>

              <span className="mt-3! text-sm! font-semibold! text-gold-600! flex! items-center! gap-1! opacity-80! group-hover:opacity-100! transition!">
                Learn more <span className="transition-transform! group-hover:translate-x-1!">→</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
