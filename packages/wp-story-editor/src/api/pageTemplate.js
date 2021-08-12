/**
 * External dependencies.
 */
import { addQueryArgs } from '@web-stories-wp/design-system';
import apiFetch from '@wordpress/api-fetch';

export function getCustomPageTemplates(page = 1, customPageTemplates) {
  let apiPath = customPageTemplates;
  const perPage = 100;
  apiPath = addQueryArgs(apiPath, {
    context: 'edit',
    per_page: perPage,
    page,
    _web_stories_envelope: true,
  });
  return apiFetch({ path: apiPath }).then(({ headers, body }) => {
    const totalPages = parseInt(headers['X-WP-TotalPages']);
    const templates = body.map((template) => {
      return { ...template['story_data'], templateId: template.id };
    });
    return {
      templates,
      hasMore: totalPages > page,
    };
  });
}

export function addPageTemplate(page, customPageTemplates) {
  return apiFetch({
    path: `${customPageTemplates}/`,
    data: {
      story_data: page,
      status: 'publish',
    },
    method: 'POST',
  }).then((response) => {
    return { ...response['story_data'], templateId: response.id };
  });
}

export function deletePageTemplate(id, customPageTemplates) {
  // `?_method=DELETE` is an alternative solution to override the request method.
  // See https://developer.wordpress.org/rest-api/using-the-rest-api/global-parameters/#_method-or-x-http-method-override-header
  return apiFetch({
    path: addQueryArgs(`${customPageTemplates}${id}/`, {
      _method: 'DELETE',
    }),
    data: { force: true },
    method: 'POST',
  });
}
