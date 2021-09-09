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
import { InterfaceSkeleton, useConfig } from '@web-stories-wp/story-editor';
import styled from 'styled-components';
/**
 * Internal dependencies
 */
import { MetaBoxes, MetaBoxesProvider } from '../metaBoxes';
import Header from '../header';

const Area = styled.div`
  grid-area: ${({ area }) => area};
  position: relative;
  overflow: hidden;
  z-index: 2;
`;

const MetaBoxesArea = styled(Area).attrs({
  area: 'metaboxes',
})`
  overflow-y: auto;
`;

function Layout() {
  const {
    metaBoxes,
    api: { metaBoxes: apiUrl },
  } = useConfig();

  return (
    <MetaBoxesProvider metaBoxes={metaBoxes} apiUrl={apiUrl}>
      <InterfaceSkeleton header={<Header />}>
        <MetaBoxesArea>
          <MetaBoxes />
        </MetaBoxesArea>
      </InterfaceSkeleton>
    </MetaBoxesProvider>
  );
}

export default Layout;
