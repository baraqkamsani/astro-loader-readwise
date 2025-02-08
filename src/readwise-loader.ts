import type { Loader } from 'astro/loaders';
import { HighlightSchema } from './schema.js';
import type { Book, Highlight } from './schema.js';

interface ReadwiseResponse {
	results: {
		highlights: Highlight[];
		[key: string]: unknown;
	}[];
}

export interface ReadwiseLoaderOptions {
	/** Readwise API access token */
	READWISE_ACCESS_TOKEN: string;
	/** Tags to filter highlights by. Defaults to ['astro-loader'] */
	filterTags?: string[];
	/** Keys to omit from highlight objects */
	omitHighlightKeys?: string[];
	/** Keys to omit from book objects. Defaults to ['highlights'] */
	omitBookKeys?: string[];
}

export function readwiseLoader({
	READWISE_ACCESS_TOKEN = undefined,
	filterTags = ['astro-loader'],
	omitHighlightKeys = [],
	omitBookKeys = ['highlights']
}: ReadwiseLoaderOptions): Loader {
	return {
		name: 'readwise-loader',
		schema: HighlightSchema,

		async load({ store, logger, parseData }) {
			logger.info('Fetching highlights from Readwise');

			if (READWISE_ACCESS_TOKEN === undefined) {
				logger.error('READWISE_ACCESS_TOKEN is undefined.')
			}
			if (READWISE_ACCESS_TOKEN === null) {
				logger.error('READWISE_ACCESS_TOKEN is null.')
			}
			if (READWISE_ACCESS_TOKEN === '') {
				logger.error('READWISE_ACCESS_TOKEN is empty string.')
			}

			try {
				const response = await fetch('https://readwise.io/api/v2/export/', {
					headers: {
						'Authorization': `Token ${READWISE_ACCESS_TOKEN}`
					}
				});

				if (!response.ok) {
					throw new Error(`Failed to fetch from Readwise: ${response.statusText}`);
				}
				if (!omitBookKeys.includes('highlights')) {
					logger.warn('The "highlights" key is not included in `omitBookKeys`, you may see duplicate data.')
				}

				const data = await response.json() as ReadwiseResponse;
				store.clear();

				// Process each book and its highlights
				for (const book of data.results) {
					// Filter highlights that have any of the specified tags
					const matchingHighlights = book.highlights.filter(highlight =>
						highlight.tags?.some(tag => filterTags.includes(tag.name))
					);

					for (const highlight of matchingHighlights) {
						// Create filtered copies of both highlight and book objects
						const filteredHighlight = Object.fromEntries(
							Object.entries(highlight).filter(([key]) => !omitHighlightKeys.includes(key))
						) as Omit<Highlight, keyof typeof omitHighlightKeys>;

						const filteredBook = Object.fromEntries(
							Object.entries(book).filter(([key]) => !omitBookKeys.includes(key))
						);

						const highlightWithBook = {
							...filteredHighlight,
							book: filteredBook
						};

						const id = highlight!.id!.toString();

						try {
							const parsedData = await parseData({
								id,
								data: highlightWithBook
							});

							store.set({
								id,
								data: parsedData
							});
						} catch (error) {
							logger.error(`Failed to parse highlight ${id}: ${error}`);
							/* continue; */
						}
					}
				}

				logger.info('Successfully loaded highlights from Readwise');
			} catch (error) {
				logger.error(`Failed to load highlights from Readwise: ${error}`);
				throw error;
			}
		}
	};
}
