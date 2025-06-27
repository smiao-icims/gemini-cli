/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { StreamingState } from '../types.js';
import { useTimer } from './useTimer.js';
import { usePhraseCycler } from './usePhraseCycler.js';
import { useState, useEffect, useRef } from 'react'; // Added useRef

export const useLoadingIndicator = (streamingState: StreamingState) => {
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [forceIdle, setForceIdle] = useState(false);
  
  // Override streaming state if we're forcing idle
  const effectiveStreamingState = forceIdle ? StreamingState.Idle : streamingState;
  const isTimerActive = effectiveStreamingState === StreamingState.Responding;

  const elapsedTimeFromTimer = useTimer(isTimerActive, timerResetKey);

  const isPhraseCyclingActive = effectiveStreamingState === StreamingState.Responding;
  const isWaiting = effectiveStreamingState === StreamingState.WaitingForConfirmation;
  const currentLoadingPhrase = usePhraseCycler(
    isPhraseCyclingActive,
    isWaiting,
  );

  const [retainedElapsedTime, setRetainedElapsedTime] = useState(0);
  const prevStreamingStateRef = useRef<StreamingState | null>(null);

  // Reset forceIdle when streaming state changes from external sources
  useEffect(() => {
    if (streamingState === StreamingState.Idle) {
      setForceIdle(false);
    }
  }, [streamingState]);

  useEffect(() => {
    if (
      prevStreamingStateRef.current === StreamingState.WaitingForConfirmation &&
      effectiveStreamingState === StreamingState.Responding
    ) {
      setTimerResetKey((prevKey) => prevKey + 1);
      setRetainedElapsedTime(0); // Clear retained time when going back to responding
    } else if (
      effectiveStreamingState === StreamingState.Idle &&
      prevStreamingStateRef.current === StreamingState.Responding
    ) {
      setTimerResetKey((prevKey) => prevKey + 1); // Reset timer when becoming idle from responding
      setRetainedElapsedTime(0);
    } else if (effectiveStreamingState === StreamingState.WaitingForConfirmation) {
      // Capture the time when entering WaitingForConfirmation
      // elapsedTimeFromTimer will hold the last value from when isTimerActive was true.
      setRetainedElapsedTime(elapsedTimeFromTimer);
    }

    prevStreamingStateRef.current = effectiveStreamingState;
  }, [effectiveStreamingState, elapsedTimeFromTimer]);

  return {
    elapsedTime:
      effectiveStreamingState === StreamingState.WaitingForConfirmation
        ? retainedElapsedTime
        : elapsedTimeFromTimer,
    currentLoadingPhrase,
    forceIdle: () => setForceIdle(true),
  };
};
