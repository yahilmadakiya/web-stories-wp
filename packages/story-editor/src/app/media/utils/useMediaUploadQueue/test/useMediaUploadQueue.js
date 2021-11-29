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
import { renderHook, act } from '@testing-library/react-hooks';
import { isAnimatedGif } from '@web-stories-wp/media';

/**
 * Internal dependencies
 */
import useMediaUploadQueue from '..';
import useFFmpeg from '../../useFFmpeg';

const canTranscodeFile = (file) => {
  return ['video/mp4'].includes(file.type);
};

const waitfor100 = async () => {
  await new Promise((res) => setTimeout(res, 100));
};

jest.mock('../../useFFmpeg', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    isTranscodingEnabled: true,
    canTranscodeFile,
    isFileTooLarge: jest.fn(),
    transcodeVideo: waitfor100,
    stripAudioFromVideo: waitfor100,
    trimVideo: waitfor100,
    getFirstFrameOfVideo: jest.fn(),
    convertGifToVideo: waitfor100,
  })),
}));

jest.mock('@web-stories-wp/media', () => ({
  ...jest.requireActual('@web-stories-wp/media'),
  isAnimatedGif: jest.fn(),
}));

// todo: update to be resource object.
const mockResource = {
  id: 123,
  guid: {
    rendered: 'guid-123',
  },
  media_details: {
    width: 1080,
    height: 720,
  },
  source_url: 'http://localhost:9876/__static__/asteroid.ogg',
  title: {
    raw: 'Title',
  },
  description: {
    raw: 'Description',
  },
  featured_media_src: {},
  meta: {
    web_stories_is_poster: false,
    web_stories_poster_id: 0,
    web_stories_trim_data: {},
  },
  web_stories_is_muted: false,
};

const mockUploadFile = jest
  .fn()
  .mockImplementation(() => Promise.resolve(mockResource));

jest.mock('../../../../uploader', () => ({
  useUploader: jest.fn(() => ({
    actions: {
      uploadFile: mockUploadFile,
    },
    state: {
      isTranscoding: false,
    },
  })),
}));

describe('useMediaUploadQueue', () => {
  beforeEach(() => {
    isAnimatedGif.mockReturnValue(false);
  });
  afterEach(() => {
    useFFmpeg.mockClear();
  });

  it('sets initial state for upload queue', async () => {
    const { result, waitFor } = renderHook(() => useMediaUploadQueue());

    await waitFor(() =>
      expect(result.current.state).toStrictEqual({
        pending: [],
        failures: [],
        uploaded: [],
        progress: [],
        isUploading: false,
        isTranscoding: false,
        isMuting: false,
        isTrimming: false,
        isResourceMuting: expect.any(Function),
        isCurrentResourceMuting: expect.any(Function),
        isResourceProcessing: expect.any(Function),
        isCurrentResourceProcessing: expect.any(Function),
        isResourceTranscoding: expect.any(Function),
        isCurrentResourceTranscoding: expect.any(Function),
        isResourceTrimming: expect.any(Function),
        isCurrentResourceTrimming: expect.any(Function),
        isCurrentResourceUploading: expect.any(Function),
      })
    );
  });

  it('should set isUploading state when adding an item to the queue', async () => {
    const file = new File(['foo'], 'foo.jpg', {
      type: 'image/jpeg',
      size: 1000,
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useMediaUploadQueue()
    );

    expect(result.current.state.isUploading).toBeFalse();

    act(() => result.current.actions.addItem({ file, resource: mockResource }));

    expect(result.current.state.isUploading).toBeTrue();

    const { id: itemId } = result.current.state.progress[0];
    expect(result.current.state.isCurrentResourceProcessing(itemId)).toBeTrue();
    expect(result.current.state.isCurrentResourceUploading(itemId)).toBeTrue();

    await waitForNextUpdate();

    expect(result.current.state.isUploading).toBeFalse();
    expect(result.current.state.uploaded).toHaveLength(1);

    const { id } = result.current.state.uploaded[0];

    act(() => result.current.actions.removeItem({ id }));

    expect(result.current.state.isUploading).toBeFalse();
    expect(result.current.state.uploaded).toHaveLength(0);
  });

  it('should set isUploading state when adding a gif item to the queue', async () => {
    isAnimatedGif.mockReturnValue(true);
    const file = {
      type: 'image/gif',
      size: 1000,
      arrayBuffer: () => true,
    };

    const resource = {
      id: 123,
      mimeType: 'image/gif',
    };

    const { result, waitFor } = renderHook(() => useMediaUploadQueue());

    expect(result.current.state.isUploading).toBeFalse();

    act(() => result.current.actions.addItem({ file, resource }));

    const { id: itemId } = result.current.state.pending[0];

    await waitFor(() => expect(result.current.state.isTranscoding).toBeTrue());

    expect(result.current.state.isCurrentResourceProcessing(itemId)).toBeTrue();
    expect(
      result.current.state.isCurrentResourceTranscoding(itemId)
    ).toBeTrue();
  });

  it('should set isTrancoding state when adding an item to the queue', async () => {
    const file = new File(['foo'], 'foo.mp4', {
      type: 'video/mp4',
      size: 5000,
    });

    const { result, waitFor } = renderHook(() => useMediaUploadQueue());

    expect(result.current.state.isUploading).toBeFalse();

    act(() => result.current.actions.addItem({ file, resource: mockResource }));

    const { id: itemId } = result.current.state.progress[0];

    await waitFor(() => expect(result.current.state.isTranscoding).toBeTrue());

    expect(result.current.state.isCurrentResourceProcessing(itemId)).toBeTrue();
    expect(
      result.current.state.isCurrentResourceTranscoding(itemId)
    ).toBeTrue();

    expect(result.current.state.isResourceProcessing(123)).toBeTrue();
    expect(result.current.state.isResourceTranscoding(123)).toBeTrue();
  });

  it('should set isMuting state when adding an item to the queue', async () => {
    const file = new File(['foo'], 'foo.mp4', {
      type: 'video/mp4',
      size: 5000,
    });

    const { result, waitFor } = renderHook(() => useMediaUploadQueue());

    expect(result.current.state.isUploading).toBeFalse();

    act(() =>
      result.current.actions.addItem({
        file,
        resource: mockResource,
        muteVideo: true,
      })
    );

    const { id: itemId } = result.current.state.progress[0];
    await waitFor(() => expect(result.current.state.isMuting).toBeTrue());

    expect(result.current.state.isCurrentResourceProcessing(itemId)).toBeTrue();
    expect(result.current.state.isCurrentResourceMuting(itemId)).toBeTrue();

    expect(result.current.state.isResourceProcessing(123)).toBeTrue();
    expect(result.current.state.isResourceMuting(123)).toBeTrue();
  });

  it('should set isTrimming state when adding an item to the queue', async () => {
    const file = new File(['foo'], 'foo.mp4', {
      type: 'video/mp4',
      size: 5000,
    });

    const { result, waitFor } = renderHook(() => useMediaUploadQueue());

    expect(result.current.state.isUploading).toBeFalse();

    act(() =>
      result.current.actions.addItem({
        file,
        resource: mockResource,
        trimData: { start: 100 },
      })
    );

    const { id: itemId } = result.current.state.progress[0];

    await waitFor(() => expect(result.current.state.isTrimming).toBeTrue());

    expect(result.current.state.isCurrentResourceProcessing(itemId)).toBeTrue();
    expect(result.current.state.isCurrentResourceTrimming(itemId)).toBeTrue();

    expect(result.current.state.isResourceProcessing(123)).toBeTrue();
    expect(result.current.state.isResourceTrimming(123)).toBeTrue();
  });

  it('allows removing items from the queue', async () => {
    const file = new File(['foo'], 'foo.jpg', {
      type: 'image/jpeg',
      size: 1000,
    });

    const { result, waitFor, waitForNextUpdate } = renderHook(() =>
      useMediaUploadQueue()
    );

    act(() => result.current.actions.addItem({ file, resource: mockResource }));

    await waitForNextUpdate();

    expect(result.current.state.failures).toHaveLength(0);
    expect(result.current.state.uploaded).toHaveLength(1);

    act(() =>
      result.current.actions.removeItem({
        id: result.current.state.uploaded[0].id,
      })
    );

    await waitFor(() =>
      expect(result.current.state).toStrictEqual({
        pending: [],
        failures: [],
        uploaded: [],
        progress: [],
        isUploading: false,
        isTranscoding: false,
        isMuting: false,
        isTrimming: false,
        isResourceMuting: expect.any(Function),
        isCurrentResourceMuting: expect.any(Function),
        isResourceProcessing: expect.any(Function),
        isCurrentResourceProcessing: expect.any(Function),
        isResourceTranscoding: expect.any(Function),
        isCurrentResourceTranscoding: expect.any(Function),
        isResourceTrimming: expect.any(Function),
        isCurrentResourceTrimming: expect.any(Function),
        isCurrentResourceUploading: expect.any(Function),
      })
    );
  });
});
