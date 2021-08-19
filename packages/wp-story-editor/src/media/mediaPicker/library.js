/*
 * Copyright 2021 Google LLC
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
import { getResourceFromMediaPicker } from '@web-stories-wp/story-editor';
import { useSnackbar } from '@web-stories-wp/design-system';
import { __, sprintf, translateToExclusiveList } from '@web-stories-wp/i18n';

/**
 * Internal dependencies
 */
import useMediaPicker from './useMediaPicker';

const useOpenLibraryMediaPicker = ({
  optimizeVideo,
  isTranscodingEnabled,
  transcodableMimeTypes,
  optimizeGif,
  insertMediaElement,
  allowedVideoMimeTypes,
  uploadVideoPoster,
  updateVideoIsMuted,
  allowedFileTypes,
  allowedMimeTypes,
  resetWithFetch,
  setIsPermissionDialogOpen,
}) => {
  const { showSnackbar } = useSnackbar();
  const onClose = resetWithFetch;

  /**
   * Callback of select in media picker to insert media element.
   *
   * @param {Object} mediaPickerEl Object coming from backbone media picker.
   */
  const onSelect = (mediaPickerEl) => {
    const resource = getResourceFromMediaPicker(mediaPickerEl);
    try {
      if (isTranscodingEnabled) {
        if (transcodableMimeTypes.includes(resource.mimeType)) {
          optimizeVideo({ resource });
        }

        if (resource.mimeType === 'image/gif') {
          optimizeGif({ resource });
        }
      }
      // WordPress media picker event, sizes.medium.url is the smallest image
      insertMediaElement(
        resource,
        mediaPickerEl.sizes?.medium?.url || mediaPickerEl.url
      );

      if (
        !resource.posterId &&
        !resource.local &&
        (allowedVideoMimeTypes.includes(resource.mimeType) ||
          resource.type === 'gif')
      ) {
        // Upload video poster and update media element afterwards, so that the
        // poster will correctly show up in places like the Accessibility panel.
        uploadVideoPoster(resource.id, mediaPickerEl.url);
      }

      if (
        !resource.local &&
        allowedVideoMimeTypes.includes(resource.mimeType) &&
        !resource.isMuted
      ) {
        updateVideoIsMuted(resource.id, resource.src);
      }
    } catch (e) {
      showSnackbar({
        message: e.message,
        dismissable: true,
      });
    }
  };

  let onSelectErrorMessage = __(
    'No file types are currently supported.',
    'web-stories'
  );

  if (allowedFileTypes.length) {
    onSelectErrorMessage = sprintf(
      /* translators: %s: list of allowed file types. */
      __('Please choose only %s to insert into page.', 'web-stories'),
      translateToExclusiveList(allowedFileTypes)
    );
  }

  return useMediaPicker({
    onSelect,
    onSelectErrorMessage,
    onClose,
    type: allowedMimeTypes,
    onPermissionError: () => setIsPermissionDialogOpen(true),
  });
};

export default useOpenLibraryMediaPicker;
