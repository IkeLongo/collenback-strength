import { defineField, defineType } from "sanity";

export const service = defineType({
  name: "service",
  title: "Service / Offering",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "In-Person Coaching", value: "in_person" },
          { title: "Online Coaching", value: "online" },
          { title: "Strength Program", value: "program" },
          { title: "Nutrition Coaching", value: "nutrition" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "program",
      title: "Program Delivery",
      type: "object",
      hidden: ({ document }) => document?.category !== "program",
      fields: [
        defineField({
          name: "pdf",
          title: "Program PDF",
          type: "file",
          options: { storeOriginalFilename: true },
          validation: (Rule) =>
            Rule.required().custom((v) => {
              const mime = (v as any)?.asset?._ref ? null : null; // mime isn't always available here
              return true;
            }),
        }),
        defineField({
          name: "coverImage",
          title: "Cover Image",
          type: "image",
          options: { hotspot: true },
          description: "Shown on the Programs card in the client dashboard.",
        }),
        defineField({
          name: "coverImageAlt",
          title: "Cover Image Alt Text",
          type: "string",
          validation: rule => rule.custom((value, context) => {
            const parent = context?.parent as {asset?: {_ref?: string}}

            return !value && parent?.asset?._ref ? 'Alt text is required when an image is present' : true
          }),
        }),
        defineField({
          name: "version",
          title: "Version",
          type: "string",
          description: "Optional (e.g. v1.2). Useful if you want to communicate updates.",
        }),
        defineField({
          name: "notes",
          title: "Download Notes",
          type: "text",
          rows: 3,
          description: "Optional message shown on the Programs tab + included in email.",
        }),
      ],
    }),
    defineField({ name: "shortDescription", title: "Short Description", type: "text", rows: 3 }),
    defineField({ name: "longDescription", title: "Detailed Description", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "image", title: "Hero Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "isActive", title: "Active", type: "boolean", initialValue: true }),

    /**
     * ✅ NEW: Pricing model
     */
    defineField({
      name: "pricingModel",
      title: "Pricing Model",
      type: "string",
      initialValue: "one_time",
      options: {
        list: [
          { title: "One-time purchase (pack)", value: "one_time" },
          { title: "Membership (recurring)", value: "membership" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),

    /**
     * Existing pack field (keep it, but only relevant for one_time)
     */
    defineField({
      name: "sessionsIncluded",
      title: "Sessions Included (Pack)",
      type: "number",
      description: "Used for one-time packs (e.g., 10-session pack).",
      hidden: ({ document }) => document?.pricingModel !== "one_time",
    }),

    /**
     * ✅ NEW: Membership fields
     */
    defineField({
      name: "membership",
      title: "Membership Settings",
      type: "object",
      hidden: ({ document }) => document?.pricingModel !== "membership",
      fields: [
        defineField({
          name: "interval",
          title: "Billing Interval",
          type: "string",
          initialValue: "month",
          options: {
            list: [
              { title: "Monthly", value: "month" },
              { title: "Weekly", value: "week" },
              { title: "Yearly", value: "year" },
            ],
          },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "intervalCount",
          title: "Interval Count",
          type: "number",
          initialValue: 1,
          description: "Usually 1 (every 1 month).",
          validation: (Rule) => Rule.required().integer().min(1),
        }),
        defineField({
          name: "autoRenew",
          title: "Auto-renew",
          type: "boolean",
          initialValue: true,
          description: "If false, treat as a fixed-length membership.",
        }),
        defineField({
          name: "durationDays",
          title: "Duration (days)",
          type: "number",
          description: "If you sell a 1-month membership as a fixed term, set 30 (or 31). Leave blank for auto-renew.",
        }),
        defineField({
          name: "sessionsPerPeriod",
          title: "Sessions per billing period",
          type: "number",
          description: "For 2x/week monthly membership, you might set 8.",
        }),
      ],
    }),

    /**
     * Pricing
     */
    defineField({
      name: "priceCents",
      title: "Price (in cents)",
      type: "number",
      validation: (Rule) => Rule.positive().integer(),
    }),
    defineField({ name: "currency", title: "Currency", type: "string", initialValue: "USD" }),

    /**
     * Stripe reference
     * - for one_time: Stripe Price can be one-time price_data (like you're doing now)
     * - for membership: should be a recurring Stripe Price ID
     */
    defineField({
      name: "stripePriceId",
      title: "Stripe Price ID",
      type: "string",
      description: "For memberships, this should be a recurring Stripe Price ID.",
    }),
  ],
});