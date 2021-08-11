/**
 * External dependencies.
 */
import { addQueryArgs } from '@web-stories-wp/design-system';
import apiFetch from '@wordpress/api-fetch';

export function getStoryLockById( stories, storyId ) {
  const path = addQueryArgs(`${stories}${storyId}/lock`, {
    _embed: 'author',
  });

  return apiFetch({ path });
}

export function setStoryLockById( stories, storyId ) {
  const path = `${stories}${storyId}/lock`;

  return apiFetch({ path, method: 'POST' });
}

export function deleteStoryLockById( storyId, nonce, storyLocking ) {
  const data = new window.FormData();
  data.append('_wpnonce', nonce);

  const url = addQueryArgs(storyLocking, { _method: 'DELETE' });

  window.navigator.sendBeacon?.(url, data);
}
