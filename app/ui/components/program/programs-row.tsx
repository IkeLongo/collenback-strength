"use client";

export default function CategoryCard({
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
      {/* Section Title */}
      <h2 className="text-xl! sm:text-2xl! font-extrabold! text-gold-600! mb-4!">
        {title}
      </h2>

      <div className="flex gap-5 overflow-x-auto overflow-visible py-3 pb-6 px-1 items-stretch">
        {services.map((service) => (
          <div
            key={service._id}
            onClick={() => onServiceClick(service)}
            className="
              group
              min-w-[300px]
              max-w-xs
              w-full
              h-96
              rounded-2xl
              bg-white
              border
              border-grey-200
              shadow-sm
              cursor-pointer
              transition
              hover:shadow-xl
              hover:border-gold-500
              hover:-translate-y-1
              flex flex-col
            "
          >
            {/* Image Section (≈65%) */}
            <div className="relative h-44 sm:h-48 w-full overflow-hidden">
              {/* SCALE THIS WRAPPER */}
              <div className="absolute inset-0 transition-transform! duration-500! group-hover:scale-105!">
                <img
                  src={
                    service.image?.asset?.url
                      ? service.image.asset.url
                      : "/logo-stamp.png"
                  }
                  alt={service.title}
                  className="h-full! w-full! object-cover!"
                />

                {/* Gradient overlay (now scales with image) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent!" />
              </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-1 gap-2 p-4">
              <div className="flex-1 flex flex-col gap-2">
                <h3 className="text-base! font-bold! text-grey-700! leading-tight! line-clamp-2!">
                  {service.title}
                </h3>

                <p className="text-sm! text-grey-500! line-clamp-2!">
                  {service.shortDescription}
                </p>

                {/* Price + Meta */}
                <div className="mt-2! flex! items-center! justify-between!">
                  {service.priceCents ? (
                    <span className="text-gold-600! font-semibold! text-sm!">
                      ${(service.priceCents / 100).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-xs! text-grey-400!">
                      Contact for pricing
                    </span>
                  )}

                  {service.sessionsIncluded && (
                    <span className="text-xs! bg-grey-100! text-grey-700! px-2! py-0.5! rounded-full!">
                      {service.sessionsIncluded} sessions
                    </span>
                  )}
                </div>
              </div>
              {/* Learn More */}
              <span className="
                mt-3!
                text-sm!
                font-semibold!
                text-gold-600!
                flex!
                items-center!
                gap-1!
                opacity-80!
                group-hover:opacity-100!
                transition!
              ">
                Learn more
                <span className="transition-transform! group-hover:translate-x-1!">→</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
