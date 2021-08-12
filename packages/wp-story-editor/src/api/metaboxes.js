/**
 * External dependencies.
 */
import { flatternFormData } from '@web-stories-wp/story-editor/src/app/api/utils';
import apiFetch from '@wordpress/api-fetch';

// See https://github.com/WordPress/gutenberg/blob/148e2b28d4cdd4465c4fe68d97fcee154a6b209a/packages/edit-post/src/store/effects.js#L72-L126
export function saveMetaBoxes( metaboxes, story, formData) {
  // Additional data needed for backward compatibility.
  // If we do not provide this data, the post will be overridden with the default values.
  const additionalData = [
    story.comment_status ? ['comment_status', story.comment_status] : false,
    story.ping_status ? ['ping_status', story.ping_status] : false,
    story.sticky ? ['sticky', story.sticky] : false,
    story.author ? ['post_author', story.author.id] : false,
  ].filter(Boolean);

  Object.entries(additionalData).forEach(([key, value]) =>
    flatternFormData(formData, key, value)
  );

  return apiFetch({
    url: metaBoxes,
    method: 'POST',
    body: formData,
    parse: false,
  });
}
