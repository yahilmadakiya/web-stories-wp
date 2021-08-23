/**
 * External dependencies.
 */
import { addQueryArgs } from '@web-stories-wp/design-system';
import apiFetch from '@wordpress/api-fetch';
import { flatternFormData } from '@web-stories-wp/story-editor/src/app/api/utils';

// Important: Keep in sync with REST API preloading definition.
export function getMedia( media, { mediaType, searchTerm, pagingNum, cacheBust }) {
  let apiPath = media;
  const perPage = 100;
  apiPath = addQueryArgs(apiPath, {
    context: 'edit',
    per_page: perPage,
    page: pagingNum,
    _web_stories_envelope: true,
    _fields: [
      'id',
      'date_gmt',
      'media_details',
      'mime_type',
      'featured_media',
      'featured_media_src',
      'alt_text',
      'source_url',
      'media_source',
      'is_muted',
      // _web_stories_envelope will add these fields, we need them too.
      'body',
      'status',
      'headers',
    ].join(','),
  });

  if (mediaType) {
    apiPath = addQueryArgs(apiPath, { media_type: mediaType });
  }

  if (searchTerm) {
    apiPath = addQueryArgs(apiPath, { search: searchTerm });
  }

  // cacheBusting is due to the preloading logic preloading and caching
  // some requests. (see preload_paths in Dashboard.php)
  // Adding cache_bust forces the path to look different from the preloaded
  // paths and hence skipping the cache. (cache_bust itself doesn't do
  // anything)
  if (cacheBust) {
    apiPath = addQueryArgs(apiPath, { cache_bust: true });
  }

  return apiFetch({ path: apiPath }).then((response) => {
    return { data: response.body, headers: response.headers };
  });
}

/**
 * Upload file to via REST API.
 *
 * @param {Object}  media
 * @param {File}    file           Media File to Save.
 * @param {?Object} additionalData Additional data to include in the request.
 * @return {Promise} Media Object Promise.
 */
export function uploadMedia( media, file, additionalData) {
  // Create upload payload
  const data = new window.FormData();
  data.append('file', file, file.name || file.type.replace('/', '.'));
  Object.entries(additionalData).forEach(([key, value]) =>
    flatternFormData(data, key, value)
  );

  // TODO: Intercept window.fetch here to support progressive upload indicator when uploading
  return apiFetch({
    path: media,
    body: data,
    method: 'POST',
  });
}
/**
 * Update Existing media.
 *
 * @param  {Object} media
 * @param  {number} mediaId
 * @param  {Object} data Object of properties to update on attachment.
 * @return {Promise} Media Object Promise.
 */
export function updateMedia( media, mediaId, data){
  return apiFetch({
    path: `${media}${mediaId}/`,
    data,
    method: 'POST',
  });
}

/**
 * Delete existing media.
 *
 * @param  {Object} media
 * @param  {number} mediaId
 * @return {Promise} Media Object Promise.
 */
export function deleteMedia( media, mediaId) {
  // `apiFetch` by default turns `DELETE` requests into `POST` requests
  // with `X-HTTP-Method-Override: DELETE` headers.
  // However, some Web Application Firewall (WAF) solutions prevent this.
  // `?_method=DELETE` is an alternative solution to override the request method.
  // See https://developer.wordpress.org/rest-api/using-the-rest-api/global-parameters/#_method-or-x-http-method-override-header
  return apiFetch({
    path: addQueryArgs(`${media}${mediaId}/`, { _method: 'DELETE' }),
    data: { force: true },
    method: 'POST',
  });
}
