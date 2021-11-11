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
import styled from 'styled-components';

/**
 * Internal dependencies
 */
import { getMaskByType } from '../../masks';
import { elementWithBackgroundColor } from '../shared';
import StoryPropTypes from '../../types';

const PREVIEW_SIZE = 16;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 21px;
  width: 21px;
  border-radius: ${({ theme }) => theme.borders.radius.small};
  background-color: ${({ theme }) => theme.colors.opacity.black10};
  padding: 0 0.5px 0.5px;
`;

// Shape width and height is the set PREVIEW_SIZE (16px) * maskDef.ratio
// this keeps the available space a square.
// Clip paths don't do overflow so any time a path comes right to
// the edge of the element it will appear cut off.
// To avoid this, give the ShapePreview a container that controls the width/height
// as outlined above. Set the position to relative to control the child absolutely,
// and account for the negative positioning in the opposite directions of x and y to recenter.
// Then in the ShapePreview, tell the shape to be 100% + 1px so that
// we can bump it absolutely up -0.5px and to the right by -1px (this is recentered in the container parent),
// now we can see that pixel that was getting cut off and all our clip paths appear centered.
// So let's say 16x16px container, clip path is given 17x17px space, positioned absolutely.
// the container is nudging the clip path's margins negatively to give the clip path space to overflow absolutely
// which prevents it getting cut off.
// The clip path is positioning itself to the top -0.5px right -1px - the container's margin recoops this space
// and now all of the shapes are centered and visible.
// response to #9558

const ShapeContainer = styled.div`
  position: relative;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  margin: 0 -1px -0.5px -2px;
`;
const ShapePreview = styled.div`
  ${elementWithBackgroundColor}
  width: calc(100% + 1px);
  height: calc(100% + 1px);
  position: absolute;
  top: -0.5px;
  right: -1px;
`;

function ShapeLayerIcon({
  element: { id, mask, backgroundColor, isDefaultBackground },
  currentPage,
}) {
  const maskDef = getMaskByType(mask.type);

  const maskId = `mask-${maskDef.type}-${id}-layer-preview`;
  if (isDefaultBackground) {
    backgroundColor = currentPage.backgroundColor;
  }
  return (
    <Container>
      <ShapeContainer
        width={PREVIEW_SIZE * maskDef.ratio}
        height={PREVIEW_SIZE * maskDef.ratio}
      >
        <ShapePreview
          style={{
            clipPath: `url(#${maskId})`,
          }}
          backgroundColor={backgroundColor}
        >
          <svg width={0} height={0}>
            <defs>
              <clipPath
                id={maskId}
                transform={`scale(1 ${maskDef.ratio})`}
                clipPathUnits="objectBoundingBox"
              >
                <path d={maskDef.path} />
              </clipPath>
            </defs>
          </svg>
        </ShapePreview>
      </ShapeContainer>
    </Container>
  );
}

ShapeLayerIcon.propTypes = {
  element: StoryPropTypes.element.isRequired,
  currentPage: StoryPropTypes.page,
};

export default ShapeLayerIcon;
