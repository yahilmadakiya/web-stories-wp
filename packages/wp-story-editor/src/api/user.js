/**
 * External dependencies.
 */
import apiFetch from '@wordpress/api-fetch';

export function getCurrentUser( currentUser ) {
  return apiFetch({
    path: currentUser,
  });
}
export function updateCurrentUser(data, currentUser) {
  return apiFetch({
    path: currentUser,
    method: 'POST',
    data,
  });
}
