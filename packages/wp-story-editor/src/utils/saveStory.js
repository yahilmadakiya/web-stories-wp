/**
 * External dependencies.
 */
import { addQueryArgs } from '@web-stories-wp/design-system';
import apiFetch from '@wordpress/api-fetch';

/**
 * Fire REST API call to save story.
 *
 * @param {import('@web-stories-wp/story-editor').StoryPropTypes.story} story Story object.
 * @param {Object} stories Stories
 * @param {Function} getStorySaveData
 * @return {Promise} Return apiFetch promise.
 */
export function saveStoryById( story, stories, getStorySaveData ) {
  const { storyId } = story;

  // Only require these fields in the response as used by useSaveStory()
  // to reduce response size.
  const path = addQueryArgs(`${stories}${storyId}/`, {
    _fields: [
      'status',
      'slug',
      'link',
      'featured_media_url',
      'preview_link',
      'edit_link',
      'embed_post_link',
    ].join(','),
  });

  return apiFetch({
    path,
    data: getStorySaveData(story),
    method: 'POST',
  } );
}

/**
 * Fire REST API call to save story.
 *
 * @param {Object} stories Stories
 * @param {import('@web-stories-wp/story-editor').StoryPropTypes.story} story Story object.
 * @param {Function} getStorySaveData
 * @return {Promise} Return apiFetch promise.
 */
export function autoSaveById( stories, story, getStorySaveData ) {
  const { storyId } = story;
  return apiFetch({
    path: `${stories}${storyId}/autosaves/`,
    data: getStorySaveData(story),
    method: 'POST',
  });
}
