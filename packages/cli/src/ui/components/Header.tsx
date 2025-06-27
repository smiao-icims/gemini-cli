/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import { Colors } from '../colors.js';
import { getAsciiArt } from './AsciiArt.js';
import { getAsciiArtWidth } from '../utils/textUtils.js';
import { AuthType } from '@google/gemini-cli-core';

interface HeaderProps {
  customAsciiArt?: string; // For user-defined ASCII art
  terminalWidth: number; // For responsive logo
  authType?: AuthType; // Auth type to determine which banner to show
  useAlternativeLogo?: boolean; // Whether to use the alternative llama-themed logo
}

export const Header: React.FC<HeaderProps> = ({
  customAsciiArt,
  terminalWidth,
  authType,
  useAlternativeLogo = false,
}) => {
  let displayTitle;

  if (customAsciiArt) {
    displayTitle = customAsciiArt;
  } else {
    displayTitle = getAsciiArt(authType, terminalWidth, useAlternativeLogo);
  }

  const artWidth = getAsciiArtWidth(displayTitle);

  return (
    <Box
      marginBottom={1}
      alignItems="flex-start"
      width={artWidth}
      flexShrink={0}
    >
      {Colors.GradientColors ? (
        <Gradient colors={Colors.GradientColors}>
          <Text>{displayTitle}</Text>
        </Gradient>
      ) : (
        <Text>{displayTitle}</Text>
      )}
    </Box>
  );
};
