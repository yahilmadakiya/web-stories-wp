/**
 * External dependencies.
 */
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@web-stories-wp/design-system';

export function getAuthors(search = null, users) {
  return apiFetch({
    path: addQueryArgs(users, { per_page: '100', who: 'authors', search }),
  });
}
