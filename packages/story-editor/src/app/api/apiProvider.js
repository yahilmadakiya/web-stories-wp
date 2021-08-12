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
import Context from './context';
import { removeImagesFromPageTemplates } from './utils';

function APIProvider({ children, config }) {
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

  const getPageTemplates = useCallback(
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

  const getStoryById = useCallback( (storyId) => config.getStoryById( stories, storyId ), [stories] );
  const getStoryLockById = useCallback( (storyId) => config.getStoryLockById( stories, storyId ), [stories] );
  const setStoryLockById = useCallback( (storyId) => config.setStoryLockById( stories, storyId ), [stories] );
  const deleteStoryLockById = useCallback( (storyId, nonce) => config.deleteStoryLockById( storyId, nonce, storyLocking ), [storyLocking] );
  const getDemoStoryById = useCallback( (storyId) => config.getDemoStoryById( stories, storyId ), [stories] );
  const saveStoryById = useCallback( (story) => config.saveStoryById( story, stories, getStorySaveData ), [stories, getStorySaveData] );
  const autoSaveById = useCallback( (story) => config.autoSaveById( stories, story, getStorySaveData ), [stories, getStorySaveData] );
  const getMedia = useCallback( ({ mediaType, searchTerm, pagingNum, cacheBust }) => config.getMedia( media, { mediaType, searchTerm, pagingNum, cacheBust } ), [media] );
  const uploadMedia = useCallback( (file, additionalData) => config.uploadMedia( media, file, additionalData ), [media] );
  const updateMedia = useCallback( (mediaId, data) => config.updateMedia( media, mediaId, data ), [media] );
  const deleteMedia = useCallback( (mediaId) => config.deleteMedia( media, mediaId ), [media] );
  const getLinkMetadata = useCallback( (url) => config.getLinkMetadata( url, link ), [link] );
  const getAuthors = useCallback( (search = null) => config.getAuthors( search, users ), [users] );
  const getCurrentUser = useCallback( () => config.getCurrentUser( currentUser ), [currentUser] );
  const updateCurrentUser = useCallback( ( data ) => config.updateCurrentUser( data, currentUser ), [currentUser] );
  const saveMetaBoxes = useCallback( ( story, formData ) => config.saveMetaBoxes( metaboxes, story, formData ), [metaBoxes] );
  const getStatusCheck = useCallback( ( content ) => config.getStatusCheck( content, statusCheck, encodeMarkup ), [statusCheck, encodeMarkup] );
  const getCustomPageTemplates = useCallback( (page = 1) => config.getCustomPageTemplates( page, customPageTemplates ), [customPageTemplates] );
  const addPageTemplate = useCallback( (page) => config.addPageTemplate( page, customPageTemplates ), [customPageTemplates] );
  const deletePageTemplate = useCallback( (id) => config.deletePageTemplate( id, customPageTemplates ), [customPageTemplates] );

  const state = {
    actions: {
      autoSaveById,
      getStoryById,
      getDemoStoryById,
      getStoryLockById,
      setStoryLockById,
      deleteStoryLockById,
      getMedia,
      getLinkMetadata,
      saveStoryById,
      getAuthors,
      uploadMedia,
      updateMedia,
      deleteMedia,
      saveMetaBoxes,
      getStatusCheck,
      addPageTemplate,
      getCustomPageTemplates,
      deletePageTemplate,
      getPageTemplates,
      getCurrentUser,
      updateCurrentUser,
    },
  };

  return <Context.Provider value={state}>{children}</Context.Provider>;
}

APIProvider.propTypes = {
  children: PropTypes.node,
  config: PropTypes.object,
};

export default APIProvider;
