/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OllamaContentGenerator } from './ollamaContentGenerator.js';
import { FinishReason } from '@google/genai';

// Mock fetch globally
global.fetch = vi.fn();

describe('OllamaContentGenerator', () => {
  let ollamaGenerator: OllamaContentGenerator;
  const mockFetch = vi.mocked(fetch);

  beforeEach(() => {
    vi.resetAllMocks();
    ollamaGenerator = new OllamaContentGenerator({
      model: 'test-model',
      baseUrl: 'http://localhost:11434',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('cleanThinkingTokens', () => {
    it('should remove complete thinking tags and content', () => {
      const input = 'Before <think>internal reasoning here</think> After';
      // Access private method for testing
      const result = (ollamaGenerator as any).cleanThinkingTokens(input);
      expect(result).toBe('Before  After');
    });

    it('should remove multiple thinking tag blocks', () => {
      const input = '<think>first</think> middle <think>second</think> end';
      const result = (ollamaGenerator as any).cleanThinkingTokens(input);
      expect(result).toBe('middle  end');
    });

    it('should remove incomplete thinking tags', () => {
      const input = 'Start <think> incomplete tag content';
      const result = (ollamaGenerator as any).cleanThinkingTokens(input);
      expect(result).toBe('Start  incomplete tag content');
    });

    it('should return empty string for text that is only thinking tokens', () => {
      const input = '<think>only thinking content</think>';
      const result = (ollamaGenerator as any).cleanThinkingTokens(input);
      expect(result).toBe('');
    });

    it('should handle text with no thinking tokens', () => {
      const input = 'This is normal text without thinking tokens';
      const result = (ollamaGenerator as any).cleanThinkingTokens(input);
      expect(result).toBe('This is normal text without thinking tokens');
    });

    it('should preserve mathematical answers after thinking tokens', () => {
      const input = '<think>Let me calculate 2+2</think>4';
      const result = (ollamaGenerator as any).cleanThinkingTokens(input);
      expect(result).toBe('4');
    });

    it('should preserve complete explanations after thinking tokens', () => {
      const input = '<think>How to explain this</think>Photosynthesis is the process by which plants convert sunlight into energy.';
      const result = (ollamaGenerator as any).cleanThinkingTokens(input);
      expect(result).toBe('Photosynthesis is the process by which plants convert sunlight into energy.');
    });
  });

  describe('generateContentStream', () => {
    it('should use non-streaming mode and return clean response', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          message: {
            content: '<think>Let me think about this</think>The answer is 42'
          },
          done: true
        })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const request = {
        model: 'test-model',
        contents: [{ parts: [{ text: 'What is the answer?' }], role: 'user' as const }],
        config: {}
      };

      const streamGenerator = await ollamaGenerator.generateContentStream(request);
      const results = [];
      for await (const result of streamGenerator) {
        results.push(result);
      }

      expect(results).toHaveLength(1);
      expect(results[0].candidates?.[0]?.content?.parts?.[0]?.text).toBe('The answer is 42');
      expect(results[0].candidates?.[0]?.finishReason).toBe(FinishReason.STOP);
    });

    it('should handle responses with only thinking tokens', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          message: {
            content: '<think>Just thinking, no actual answer</think>'
          },
          done: true
        })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const request = {
        model: 'test-model',
        contents: [{ parts: [{ text: 'What is the answer?' }], role: 'user' as const }],
        config: {}
      };

      const streamGenerator = await ollamaGenerator.generateContentStream(request);
      const results = [];
      for await (const result of streamGenerator) {
        results.push(result);
      }

      expect(results).toHaveLength(1);
      expect(results[0].candidates?.[0]?.content?.parts?.[0]?.text).toBe('');
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as any);

      const request = {
        model: 'test-model',
        contents: [{ parts: [{ text: 'What is the answer?' }], role: 'user' as const }],
        config: {}
      };

      await expect(async () => {
        const streamGenerator = await ollamaGenerator.generateContentStream(request);
        for await (const result of streamGenerator) {
          // Should throw before yielding results
        }
      }).rejects.toThrow('Ollama API error: 500 Internal Server Error');
    });
  });

  describe('generateContent', () => {
    it('should handle JSON requests with thinking tokens', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          message: {
            content: '<think>Let me format this as JSON</think>{"answer": "42"}'
          },
          done: true
        })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const request = {
        model: 'test-model',
        contents: [{ parts: [{ text: 'Return JSON' }], role: 'user' as const }],
        config: { responseMimeType: 'application/json' }
      };

      const result = await ollamaGenerator.generateContent(request);
      expect(result.candidates?.[0]?.content?.parts?.[0]?.text).toBe('{"answer": "42"}');
    });

    it('should handle regular content requests', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          message: {
            content: '<think>How to answer this</think>This is a regular response'
          },
          done: true
        })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const request = {
        model: 'test-model',
        contents: [{ parts: [{ text: 'Tell me something' }], role: 'user' as const }],
        config: {}
      };

      const result = await ollamaGenerator.generateContent(request);
      expect(result.candidates?.[0]?.content?.parts?.[0]?.text).toBe('This is a regular response');
    });
  });

  describe('convertToOllamaMessages', () => {
    it('should convert Gemini format to Ollama format', () => {
      const request = {
        model: 'test-model',
        contents: [
          { parts: [{ text: 'Hello' }], role: 'user' as const },
          { parts: [{ text: 'Hi there' }], role: 'model' as const },
          { parts: [{ text: 'How are you?' }], role: 'user' as const }
        ],
        config: {}
      };

      const result = (ollamaGenerator as any).convertToOllamaMessages(request);
      
      expect(result).toEqual([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
        { role: 'user', content: 'How are you?' }
      ]);
    });

    it('should handle empty parts by filtering out empty content', () => {
      const request = {
        model: 'test-model',
        contents: [
          { parts: [], role: 'user' as const },
          { parts: [{ text: 'Hello' }], role: 'user' as const }
        ],
        config: {}
      };

      const result = (ollamaGenerator as any).convertToOllamaMessages(request);
      // Empty parts should be filtered out in the actual implementation
      expect(result).toEqual([
        { role: 'user', content: 'Hello' }
      ]);
    });
  });
}); 