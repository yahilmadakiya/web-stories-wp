/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useCallback, useRef } from 'react';
import { DATA_VERSION } from '@web-stories-wp/migration';
import getAllTemplates from '@web-stories-wp/templates';

/**
 * Internal dependencies
 */
import base64Encode from '../../utils/base64Encode';
import { useConfig } from '../config';
import { useStoryEditor } from '../storyEditor';
import Context from './context';
import { removeImagesFromPageTemplates } from './utils';

function APIProvider({ children }) {
  const {
    api: {
      stories,
      media,
      link,
      users,
      statusCheck,
      metaBoxes,
      currentUser,
      storyLocking,
      pageTemplates: customPageTemplates,
    },
    encodeMarkup,
    cdnURL,
    assetsURL,
  } = useConfig();
  const {
    config: {
      getStoryById,
      getStoryLockById,
      setStoryLockById,
      deleteStoryLockById,
      getDemoStoryById,
      saveStoryById,
      autoSaveById,
      getMedia,
      uploadMedia,
      updateMedia,
      deleteMedia,
      getLinkMetadata,
      getAuthors,
      getCurrentUser,
      updateCurrentUser,
      saveMetaBoxes,
      getStatusCheck,
      getCustomPageTemplates,
      addPageTemplate,
      deletePageTemplate,
    },
  } = useStoryEditor();

  const pageTemplates = useRef({
    base: [],
    withoutImages: [],
  });

  const getStorySaveData = useCallback(
    ({
      pages,
      featuredMedia,
      globalStoryStyles,
      publisherLogo,
      autoAdvance,
      defaultPageDuration,
      currentStoryStyles,
      content,
      author,
      ...rest
    }) => ({
      story_data: {
        version: DATA_VERSION,
        pages,
        autoAdvance,
        defaultPageDuration,
        currentStoryStyles,
      },
      featured_media: featuredMedia.id,
      style_presets: globalStoryStyles,
      publisher_logo: publisherLogo,
      content: encodeMarkup ? base64Encode(content) : content,
      author: author.id,
      ...rest,
    }),
    [encodeMarkup]
  );

  const actions = {};

  actions.getPageTemplates = useCallback(
    async ({ showImages = false } = {}) => {
      // check if pageTemplates have been loaded yet
      if (pageTemplates.current.base.length === 0) {
        pageTemplates.current.base = await getAllTemplates({ cdnURL });
        pageTemplates.current.withoutImages = removeImagesFromPageTemplates({
          templates: pageTemplates.current.base,
          assetsURL,
        });
      }

      return pageTemplates.current[showImages ? 'base' : 'withoutImages'];
    },
    [cdnURL, assetsURL]
  );

  actions.getStoryById = useCallback(
    (storyId) => getStoryById(stories, storyId),
    [stories, getStoryById]
  );
  actions.getStoryLockById = useCallback(
    (storyId) => getStoryLockById(stories, storyId),
    [stories, getStoryLockById]
  );
  actions.setStoryLockById = useCallback(
    (storyId) => setStoryLockById(stories, storyId),
    [stories, setStoryLockById]
  );
  actions.deleteStoryLockById = useCallback(
    (storyId, nonce) => deleteStoryLockById(storyId, nonce, storyLocking),
    [storyLocking, deleteStoryLockById]
  );
  actions.getDemoStoryById = useCallback(
    (storyId) => getDemoStoryById(stories, storyId),
    [stories, getDemoStoryById]
  );
  actions.saveStoryById = useCallback(
    (story) => saveStoryById(story, stories, getStorySaveData),
    [stories, getStorySaveData, saveStoryById]
  );
  actions.autoSaveById = useCallback(
    (story) => autoSaveById(stories, story, getStorySaveData),
    [stories, getStorySaveData, autoSaveById]
  );
  actions.getMedia = useCallback(
    ({ mediaType, searchTerm, pagingNum, cacheBust }) =>
      getMedia(media, { mediaType, searchTerm, pagingNum, cacheBust }),
    [media, getMedia]
  );
  actions.uploadMedia = useCallback(
    (file, additionalData) => uploadMedia(media, file, additionalData),
    [media, uploadMedia]
  );
  actions.updateMedia = useCallback(
    (mediaId, data) => updateMedia(media, mediaId, data),
    [media, updateMedia]
  );
  actions.deleteMedia = useCallback(
    (mediaId) => deleteMedia(media, mediaId),
    [media, deleteMedia]
  );
  actions.getLinkMetadata = useCallback(
    (url) => getLinkMetadata(url, link),
    [link, getLinkMetadata]
  );
  actions.getAuthors = useCallback(
    (search = null) => getAuthors(search, users),
    [users, getAuthors]
  );
  actions.getCurrentUser = useCallback(
    () => getCurrentUser(currentUser),
    [currentUser, getCurrentUser]
  );
  actions.updateCurrentUser = useCallback(
    (data) => updateCurrentUser(data, currentUser),
    [currentUser, updateCurrentUser]
  );
  actions.saveMetaBoxes = useCallback(
    (story, formData) => saveMetaBoxes(metaBoxes, story, formData),
    [metaBoxes, saveMetaBoxes]
  );
  actions.getStatusCheck = useCallback(
    (content) => getStatusCheck(content, statusCheck, encodeMarkup),
    [statusCheck, encodeMarkup, getStatusCheck]
  );
  actions.getCustomPageTemplates = useCallback(
    (page = 1) => getCustomPageTemplates(page, customPageTemplates),
    [customPageTemplates, getCustomPageTemplates]
  );
  actions.addPageTemplate = useCallback(
    (page) => addPageTemplate(page, customPageTemplates),
    [customPageTemplates, addPageTemplate]
  );
  actions.deletePageTemplate = useCallback(
    (id) => deletePageTemplate(id, customPageTemplates),
    [customPageTemplates, deletePageTemplate]
  );

  return <Context.Provider value={{ actions }}>{children}</Context.Provider>;
}

APIProvider.propTypes = {
  children: PropTypes.node,
};

export default APIProvider;
