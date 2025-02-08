import { z } from 'astro/zod';

/**
 * Fields marked as (the "source") are from Readwise API's documentation.
 *
 * @see {@link https://readwise.io/api_deets Readwise API - Highlight CREATE}
 */
export const BookSchemaSmall = z.object({
	title: z.string()
		.describe('Title of the book/article/podcast (the "source")')
		.max(511, 'Title cannot exceed 511 characters')
		.optional(),

	readable_title: z.string()
		.optional(),

	author: z.string()
		.describe('Author of the book/article/podcast (the "source")')
		.max(1024, 'Author name cannot exceed 1024 characters')
		.optional(),

	source_url: z.coerce.string().url()
		.describe('The url of the article/podcast (the "source")')
		.max(2047, 'Source url cannot exceed 2047 characters')
		.nullable()
		.optional(),
});
export type BookSmall = z.infer<typeof BookSchemaSmall>;

export const BookSchema = BookSchemaSmall.extend({
	asin: z.string()
		.nullable()
		.optional(),
	book_tags: z.array(z.unknown())
		.optional(),
	category: z.enum(['books', 'articles', 'tweets', 'podcasts'])
		.optional(),
	cover_image_url: z.coerce.string().url()
		.optional(),
	document_note: z.string()
		.nullable()
		.optional(),
	highlights: z.any()
		.optional(),
	is_deleted: z.boolean()
		.optional(),
	readwise_url: z.coerce.string().url()
		.optional(),
	source: z.string()
		.optional(),
	summary: z.string()
		.nullable()
		.optional(),
	unique_url: z.coerce.string().url()
		.optional(),

	// Same as HighlightSchema's book_id.
	user_book_id: z.number().optional(),
});
export type Book = z.infer<typeof BookSchema>;

export const HighlightSchema = z.object({
	// The only field required in a highlight object.
	text: z.string()
		.max(8191, 'Highlight text cannot exceed 8191 characters'),

	id: z.number()
		.optional(),
	is_deleted: z.boolean()
		.optional(),
	note: z.string()
		.max(8191, 'Note cannot exceed 8191 characters')
		.nullable()
		.optional(),
	location: z.number()
		.optional(),
	location_type: z.string()
		.optional(),

	highlighted_at: z.coerce.string().datetime()
		.optional(),
	created_at: z.coerce.string().datetime()
		.optional(),
	updated_at: z.coerce.string().datetime()
		.optional(),
	external_id: z.string()
		.optional(),
	end_location: z.number()
		.nullable()
		.optional(),

	// For Readwise Reader: read.readwise.io/read/${external_id}
	url: z.coerce.string().url()
		.nullable()
		.optional(),

	tags: z.array(z.object({ id: z.number(), name: z.string() }))
		.optional(),
	is_favorite: z.boolean()
		.optional(),
	is_discard: z.boolean()
		.optional(),

	// readwise.io/bookreview/${book_id}
	readwise_url: z.coerce.string().url()
		.optional(),

	color: z.string()
		.optional(),
	book: z.lazy(() => BookSchema)
		.optional(),

	// Same as BookSchema's user_book_id.
	book_id: z.number().optional(),
});

export default HighlightSchema;
export type Highlight = z.infer<typeof HighlightSchema>;
