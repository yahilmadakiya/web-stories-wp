/**
 * External dependencies.
 */
import apiFetch from '@wordpress/api-fetch';
import base64Encode from '@web-stories-wp/story-editor/src/utils/base64Encode';

/**
 * Status check, submit html string.
 *
 * @param {string} content string.
 * @param {string} statusCheck
 * @param {string} encodeMarkup
 *
 * @return {Promise} Result promise
 */
export function getStatusCheck(content, statusCheck, encodeMarkup) {
  return apiFetch({
    path: statusCheck,
    data: { content: encodeMarkup ? base64Encode(content) : content },
    method: 'POST',
  });
}
