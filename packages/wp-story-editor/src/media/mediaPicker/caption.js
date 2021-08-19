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
 * Internal dependencies
 */
/**
 * External dependencies
 */
import { __ } from '@web-stories-wp/i18n';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useMediaPicker from './useMediaPicker';

const useOpenCaptionMediaPicker = ({ pushUpdate, tracks }) => {
  const captionText = __('Upload a file', 'web-stories');

  const handleChangeTrack = useCallback(
    (attachment) => {
      const newTracks = {
        track: attachment?.url,
        trackId: attachment?.id,
        trackName: attachment?.filename,
        id: uuidv4(),
        kind: 'captions',
        srclang: '',
        label: '',
      };

      pushUpdate({ tracks: [...tracks, newTracks] }, true);
    },
    [tracks, pushUpdate]
  );

  return useMediaPicker({
    onSelect: handleChangeTrack,
    onSelectErrorMessage: __(
      'Please choose a VTT file to use as caption.',
      'web-stories'
    ),
    type: ['text/vtt'],
    title: captionText,
    buttonInsertText: __('Select caption', 'web-stories'),
  });
};

export default useOpenCaptionMediaPicker;
