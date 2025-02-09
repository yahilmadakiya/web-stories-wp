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
 * Internal dependencies
 */
import { styles, useHighlights } from '../../app/highlights';
import useLibrary from './useLibrary';
import { Pane, getTabId } from './panes/shared';
import {
  MEDIA,
  MEDIA3P,
  SHAPES,
  TEXT,
  ELEMS,
  PAGE_TEMPLATES,
} from './constants';
import { MediaPane } from './panes/media/local';
import { Media3pPane } from './panes/media/media3p';
import { ShapesPane } from './panes/shapes';
import { TextPane } from './panes/text';
import { ElementsPane } from './panes/elements';
import { PageTemplatesPane } from './panes/pageTemplates';

function LibraryPanes() {
  const { tab, tabs } = useLibrary((state) => ({
    tab: state.state.tab,
    tabs: state.data.tabs,
  }));

  const highlighted = useHighlights(({ ...highlighted }) => highlighted);

  const mediaHighlights = highlighted[MEDIA.id];
  const media3pHighlights = highlighted[MEDIA3P.id];
  const textHighlights = highlighted[TEXT.id];

  return tabs.map(({ id }) => {
    const isActive = id === tab;
    const paneProps = {
      key: id,
      isActive,
      'aria-labelledby': getTabId(id),
    };

    if (!isActive) {
      return <Pane key={id} {...paneProps} />;
    }

    switch (id) {
      case MEDIA.id:
        return (
          <MediaPane
            css={mediaHighlights?.showEffect && styles.FLASH}
            {...paneProps}
          />
        );
      case MEDIA3P.id:
        return (
          <Media3pPane
            {...paneProps}
            css={media3pHighlights?.showEffect && styles.FLASH}
          />
        );
      case SHAPES.id:
        return <ShapesPane {...paneProps} />;
      case TEXT.id:
        return (
          <TextPane
            css={textHighlights?.showEffect && styles.FLASH}
            {...paneProps}
          />
        );
      case ELEMS.id:
        return <ElementsPane {...paneProps} />;
      case PAGE_TEMPLATES.id:
        return <PageTemplatesPane {...paneProps} />;
      default:
        return null;
    }
  });
}

export default LibraryPanes;
