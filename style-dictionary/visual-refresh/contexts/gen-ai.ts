// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { StyleDictionary } from '../../utils/interfaces';
import { tokens as parentColorTokens } from '../shadows';
import merge from 'lodash/merge';
import { expandColorDictionary } from '../../utils';

const genAIButtonTokens: StyleDictionary.ColorsDictionary = {
  colorBorderButtonNormalDefault: '{colorGenAiPrimary600}',
  colorBorderButtonNormalHover: '{colorGenAiPrimary600}',
  colorBorderButtonNormalActive: '{colorGenAiPrimary800}',
  colorTextButtonNormalDefault: { light: '{colorGenAiPrimary800}', dark: '{colorGenAiPrimary100}' },
  colorTextButtonNormalHover: '{colorGenAiPrimary800}',
  colorTextButtonNormalActive: '{colorGenAiPrimary800}',
  colorBackgroundButtonNormalHover: '{colorGenAiPrimary100}',
  colorBackgroundButtonNormalActive: '{colorGenAiPrimary100}',

  colorBackgroundButtonPrimaryDefault: '{colorGenAiPrimary600}',
  colorBackgroundButtonPrimaryHover: '{colorGenAiPrimary800}',
  colorBackgroundButtonPrimaryActive: '{colorGenAiPrimary800}',
  colorTextButtonPrimaryDefault: '{colorWhite}',

  colorBackgroundButtonLinkHover: '{colorGenAiPrimary100}',
};

const expandedTokens: StyleDictionary.ExpandedColorScopeDictionary = expandColorDictionary(
  merge({}, parentColorTokens, genAIButtonTokens)
);

export const mode: StyleDictionary.ModeIdentifier = 'color';
export default expandedTokens;
