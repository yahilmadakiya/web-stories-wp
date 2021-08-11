/**
 * External dependencies.
 */
import { addQueryArgs } from '@web-stories-wp/design-system';
import apiFetch from '@wordpress/api-fetch';

// Important: Keep in sync with REST API preloading definition.
const STORY_FIELDS = [
  'id',
  'title',
  'status',
  'slug',
  'date',
  'modified',
  'excerpt',
  'link',
  'story_data',
  'preview_link',
  'edit_link',
  'embed_post_link',
  'publisher_logo_url',
  'permalink_template',
  'style_presets',
  'password',
].join(',');

export function getStoryById( stories, storyId ) {
  const path = addQueryArgs(`${stories}${storyId}/`, {
    context: 'edit',
    _embed: 'wp:featuredmedia,wp:lockuser,author',
    web_stories_demo: false,
    _fields: STORY_FIELDS,
  });

  return apiFetch({ path });
}

export function getDemoStoryById( stories, storyId ) {
  const path = addQueryArgs(`${stories}${storyId}/`, {
    context: 'edit',
    _embed: 'wp:featuredmedia,author',
    web_stories_demo: true,
    _fields: STORY_FIELDS,
  });

  return apiFetch({ path });
}
