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
import styled from 'styled-components';
import {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useFocusOut,
} from '@web-stories-wp/react';
import { useGridViewKeys } from '@web-stories-wp/design-system';
import { __ } from '@web-stories-wp/i18n';
import { useVirtual } from 'react-virtual';
/**
 * Internal dependencies
 */
import { CardGrid } from '../../../../../components';
import {
  StoriesPropType,
  StoryMenuPropType,
  PageSizePropType,
  RenameStoryPropType,
} from '../../../../../types';
import {
  PAGE_WRAPPER,
  STORY_CONTEXT_MENU_ACTIONS,
} from '../../../../../constants';
import { useConfig } from '../../../../config';
import StoryGridItem from '../storyGridItem';

const StoryGrid = styled(CardGrid)`
  width: calc(100% - ${PAGE_WRAPPER.GUTTER}px);
`;

const StoryGridView = ({
  stories,
  pageSize,
  storyMenu,
  renameStory,
  returnStoryFocusId,
}) => {
  const { isRTL } = useConfig();
  const containerRef = useRef();
  const gridRef = useRef();
  const itemRefs = useRef({});
  const [activeGridItemId, setActiveGridItemId] = useState();
  const activeGridItemIdRef = useRef();
  const gridItemIds = useMemo(() => stories.map(({ id }) => id), [stories]);

  // useGridViewKeys({
  //   containerRef,
  //   gridRef,
  //   itemRefs,
  //   isRTL,
  //   currentItemId: activeGridItemId,
  //   items: stories,
  // });

  console.log({
    pageHeight: containerRef.current?.getBoundingClientRect().height,
    storyHeight: pageSize.height,
  });
  const numColumns = Math.floor(
    containerRef.current?.getBoundingClientRect().width / pageSize.width || 1
  );
  const numRows = Math.ceil(
    containerRef.current?.getBoundingClientRect().height / pageSize.height
  );
  console.log({ numRows, numColumns });
  const rowVirtualizer = useVirtual({
    size: numRows,
    parentRef: containerRef,
  });

  const columnVirtualizer = useVirtual({
    horizontal: true,
    size: numColumns,
    parentRef: containerRef,
  });

  console.log({
    initialLength: stories.length,
    newLength: numColumns * numRows,
    rowVirtualizer,
    columnVirtualizer,
  });

  // We only want to force focus when returning to the grid from a dialog
  // By checking to see if the active grid item no longer exists
  // in tandem with the returnStoryFocusId being present from the parent
  // AND that the activeGridItemIdRef.current is null we know that
  // the user is coming from a dialog not just moving grid items
  useEffect(() => {
    if (
      !activeGridItemId &&
      returnStoryFocusId?.value &&
      !activeGridItemIdRef.current
    ) {
      const newFocusId = returnStoryFocusId?.value;
      setActiveGridItemId(newFocusId);
      // grab the menu button and refocus
      const firstFocusableElement = itemRefs.current?.[
        newFocusId
      ]?.querySelectorAll(['button', 'a'])?.[0];

      firstFocusableElement?.focus();
    }
  }, [activeGridItemId, returnStoryFocusId]);

  // when keyboard focus changes through FocusableGridItem
  // immediately focus the edit preview layer on top of preview
  useEffect(() => {
    if (activeGridItemId) {
      activeGridItemIdRef.current = activeGridItemId;
    }
  }, [activeGridItemId]);

  // Additional functionality needed when closing context menus to maintain grid item focus
  const handleMenuToggle = useCallback(
    (evt, id) => {
      storyMenu.handleMenuToggle(id);
      // Conditionally return the focus to the grid when menu is closed using `tab`
      if (id < 0 && evt?.keyCode === 9) {
        // Menu is closing.
        const isNext = !evt?.shiftKey;
        const idToFocus = isNext
          ? gridItemIds[gridItemIds.indexOf(activeGridItemId) + 1]
          : activeGridItemId;
        returnStoryFocusId.set(idToFocus);
        activeGridItemIdRef.current = null;
        setActiveGridItemId(null);
      }
    },
    [activeGridItemId, gridItemIds, returnStoryFocusId, storyMenu]
  );

  // if keyboard is used instead of mouse the useFocusOut doesn't get triggered
  // that is where we are setting active grid item ID to null
  // by doing this here as well we are ensuring consistent functionality
  const manuallySetFocusOut = useCallback(() => {
    activeGridItemIdRef.current = null;
    setActiveGridItemId(null);
    returnStoryFocusId.set(null);
  }, [returnStoryFocusId]);

  useFocusOut(containerRef, () => setActiveGridItemId(null), []);

  const modifiedStoryMenu = useMemo(() => {
    return {
      ...storyMenu,
      handleMenuToggle,
      menuItemActions: {
        ...storyMenu.menuItemActions,
        [STORY_CONTEXT_MENU_ACTIONS.DELETE]: (story) => {
          manuallySetFocusOut();
          storyMenu.menuItemActions[STORY_CONTEXT_MENU_ACTIONS.DELETE](story);
        },
        [STORY_CONTEXT_MENU_ACTIONS.DUPLICATE]: (story) => {
          manuallySetFocusOut();
          storyMenu.menuItemActions[STORY_CONTEXT_MENU_ACTIONS.DUPLICATE](
            story
          );
        },
        [STORY_CONTEXT_MENU_ACTIONS.COPY_STORY_LINK]: (story) => {
          manuallySetFocusOut();
          storyMenu.menuItemActions[STORY_CONTEXT_MENU_ACTIONS.COPY_STORY_LINK](
            story
          );
        },
      },
    };
  }, [handleMenuToggle, manuallySetFocusOut, storyMenu]);

  // const memoizedStoryGrid = useMemo(
  //   () =>
  //     stories.map((story) => {
  //       return (
  //         <StoryGridItem
  //           onFocus={() => setActiveGridItemId(story.id)}
  //           isActive={activeGridItemId === story.id}
  //           ref={(el) => {
  //             itemRefs.current[story.id] = el;
  //           }}
  //           key={story.id}
  //           pageSize={pageSize}
  //           renameStory={renameStory}
  //           story={story}
  //           storyMenu={modifiedStoryMenu}
  //         />
  //       );
  //     }),
  //   [activeGridItemId, modifiedStoryMenu, pageSize, renameStory, stories]
  // );

  return (
    <div style={{ height: '100%' }} ref={containerRef}>
      <StoryGrid
        pageSize={pageSize}
        ref={gridRef}
        role="list"
        ariaLabel={__('Viewing stories', 'web-stories')}
      >
        {rowVirtualizer.virtualItems.map((virtualRow) =>
          columnVirtualizer.virtualItems.map((virtualColumn) => {
            const gridIndex =
              numColumns * virtualRow.index + virtualColumn.index;

            if (gridIndex > stories.length - 1) {
              return null;
            }

            const story = stories[gridIndex];

            return (
              <StoryGridItem
                onFocus={() => setActiveGridItemId(story.id)}
                isActive={activeGridItemId === story.id}
                ref={(el) => {
                  itemRefs.current[story.id] = el;
                }}
                key={story.id}
                pageSize={pageSize}
                renameStory={renameStory}
                story={story}
                storyMenu={modifiedStoryMenu}
              />
            );
          })
        )}
      </StoryGrid>
    </div>
  );
};

StoryGridView.propTypes = {
  stories: StoriesPropType,
  pageSize: PageSizePropType.isRequired,
  storyMenu: StoryMenuPropType,
  renameStory: RenameStoryPropType,
  returnStoryFocusId: PropTypes.shape({
    value: PropTypes.number,
    set: PropTypes.func,
  }),
};

export default StoryGridView;
