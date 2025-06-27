/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi } from 'vitest';
import { createContentGenerator, AuthType } from './contentGenerator.js';
import { createCodeAssistContentGenerator } from '../code_assist/codeAssist.js';
import { GoogleGenAI } from '@google/genai';

vi.mock('../code_assist/codeAssist.js');
vi.mock('@google/genai');

describe('contentGenerator', () => {
  it('should create a CodeAssistContentGenerator', async () => {
    const mockGenerator = {} as unknown;
    vi.mocked(createCodeAssistContentGenerator).mockResolvedValue(
      mockGenerator as never,
    );
    const generator = await createContentGenerator({
      model: 'test-model',
      authType: AuthType.LOGIN_WITH_GOOGLE_PERSONAL,
    });
    expect(createCodeAssistContentGenerator).toHaveBeenCalled();
    expect(generator).toBe(mockGenerator);
  });

  it('should create a GoogleGenAI content generator', async () => {
    const mockGenerator = {
      models: {},
    } as unknown;
    vi.mocked(GoogleGenAI).mockImplementation(() => mockGenerator as never);
    const generator = await createContentGenerator({
      model: 'test-model',
      apiKey: 'test-api-key',
      authType: AuthType.USE_GEMINI,
    });
    expect(GoogleGenAI).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      vertexai: undefined,
      httpOptions: {
        headers: {
          'User-Agent': expect.any(String),
        },
      },
    });
    expect(generator).toBe((mockGenerator as GoogleGenAI).models);
  });

  it('should create an OllamaContentGenerator for Ollama auth type', async () => {
    const generator = await createContentGenerator({
      model: 'qwen3:1.7b',
      authType: AuthType.OLLAMA,
      baseUrl: 'http://localhost:11434',
    });
    
    // Check that it returns an OllamaContentGenerator instance
    expect(generator).toBeDefined();
    expect(generator.constructor.name).toBe('OllamaContentGenerator');
  });

  it('should use default baseUrl for Ollama when not provided', async () => {
    const generator = await createContentGenerator({
      model: 'qwen3:1.7b',
      authType: AuthType.OLLAMA,
    });
    
    expect(generator).toBeDefined();
    expect(generator.constructor.name).toBe('OllamaContentGenerator');
  });
});
