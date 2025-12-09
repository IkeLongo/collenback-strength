// sanity/schemas/service.ts
import { defineField, defineType } from 'sanity';

export const service = defineType({
  name: 'service',
  title: 'Service / Offering',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'In-Person Training', value: 'in_person' },
          { title: 'Online Coaching', value: 'online' },
          { title: 'Strength Program', value: 'program' },
          { title: 'Nutrition Coaching', value: 'nutrition' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'longDescription',
      title: 'Detailed Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'image',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sessionsIncluded',
      title: 'Sessions Included',
      type: 'number',
      description: 'Number of sessions in this pack (leave empty for memberships / unlimited).',
    }),
    defineField({
      name: 'priceCents',
      title: 'Price (in cents)',
      type: 'number',
      validation: (Rule) => Rule.positive().integer(),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'USD',
    }),
    defineField({
      name: 'stripePriceId',
      title: 'Stripe Price ID',
      type: 'string',
      description: 'Optional: link this service to a Stripe Price.',
    }),
  ],
});
