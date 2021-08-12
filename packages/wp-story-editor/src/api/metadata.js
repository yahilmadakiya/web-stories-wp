import { addQueryArgs } from '@web-stories-wp/design-system';
import apiFetch from '@wordpress/api-fetch';

/**
 * Gets metadata (title, favicon, etc.) from
 * a provided URL.
 *
 * @param  {number} url
 * @param {string} link
 * @return {Promise} Result promise
 */
export function getLinkMetadata(url, link) {
  const path = addQueryArgs(link, { url });
  return apiFetch({
    path,
  });
}
