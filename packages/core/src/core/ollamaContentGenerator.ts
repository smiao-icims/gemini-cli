/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CountTokensResponse,
  GenerateContentResponse,
  GenerateContentParameters,
  CountTokensParameters,
  EmbedContentResponse,
  EmbedContentParameters,
  FinishReason,
  Content,
} from '@google/genai';
import { ContentGenerator, ContentGeneratorConfig } from './contentGenerator.js';

interface HttpOptions {
  headers?: Record<string, string>;
}

export class OllamaContentGenerator implements ContentGenerator {
  private baseUrl: string;
  private model: string;
  private httpOptions: HttpOptions;

  constructor(config: ContentGeneratorConfig, httpOptions: HttpOptions = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.model = config.model;
    this.httpOptions = httpOptions;
  }

  async generateContent(
    request: GenerateContentParameters,
  ): Promise<GenerateContentResponse> {
    // For now, convert streaming response to single response
    const streamGenerator = await this.generateContentStream(request);
    let finalResponse: GenerateContentResponse | undefined;
    
    for await (const response of streamGenerator) {
      finalResponse = response;
    }
    
    if (!finalResponse) {
      throw new Error('No response received from Ollama');
    }
    
    return finalResponse;
  }

  async generateContentStream(
    request: GenerateContentParameters,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    const messages = this.convertToOllamaMessages(request);
    const ollamaRequest = {
      model: this.model,
      messages,
      stream: true,
    };

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.httpOptions.headers,
      },
      body: JSON.stringify(ollamaRequest),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    return this.handleStreamingResponse(response);
  }

  async countTokens(request: CountTokensParameters): Promise<CountTokensResponse> {
    // Ollama doesn't provide token counting, so we'll provide a rough estimate
    // This is a stub implementation
    const text = this.extractTextFromRequest(request);
    const estimatedTokens = Math.ceil(text.length / 4); // Rough estimate: 4 chars per token
    
    return {
      totalTokens: estimatedTokens,
    };
  }

  async embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse> {
    // This is a stub implementation - embeddings will be implemented later if needed
    throw new Error('Embeddings not yet implemented for Ollama');
  }

  private extractTextFromRequest(request: CountTokensParameters | GenerateContentParameters): string {
    // Extract text content from the request for token estimation
    // This is a simplified implementation - just return a default for now
    return JSON.stringify(request).length > 0 ? 'sample text' : '';
  }

  private convertToOllamaMessages(request: GenerateContentParameters): Array<{role: string; content: string}> {
    const messages: Array<{role: string; content: string}> = [];
    
    // Add system instruction if present
    if (request.config?.systemInstruction) {
      const systemContent = this.extractContentText(request.config.systemInstruction);
      if (systemContent) {
        messages.push({
          role: 'system',
          content: systemContent,
        });
      }
    }
    
    // Convert contents to messages
    const contents = Array.isArray(request.contents) ? request.contents : [request.contents];
    for (const content of contents) {
      if (typeof content === 'object' && content !== null && 'role' in content) {
        const role = content.role === 'model' ? 'assistant' : content.role || 'user';
        const text = this.extractContentText(content);
        if (text) {
          messages.push({
            role,
            content: text,
          });
        }
      }
    }
    
    return messages;
  }

  private extractContentText(content: any): string {
    if (typeof content === 'string') {
      return content;
    }
    
    if (content?.parts) {
      return content.parts
        .filter((part: any) => part.text)
        .map((part: any) => part.text)
        .join('');
    }
    
    return '';
  }

  private async *handleStreamingResponse(response: Response): AsyncGenerator<GenerateContentResponse> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const ollamaResponse = JSON.parse(line);
              const geminiResponse = this.convertToGeminiResponse(ollamaResponse);
              yield geminiResponse;
            } catch (error) {
              console.warn('Failed to parse Ollama response line:', line, error);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private convertToGeminiResponse(ollamaResponse: any): GenerateContentResponse {
    // Create response as a plain object, not using constructor
    const response: GenerateContentResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: ollamaResponse.message?.content || '',
              },
            ],
            role: 'model',
          },
          index: 0,
          finishReason: ollamaResponse.done ? FinishReason.STOP : undefined,
        },
      ],
      // Add required properties that are typically present
      promptFeedback: {
        safetyRatings: [],
      },
      text: undefined,
      data: undefined,
      functionCalls: undefined,
      executableCode: undefined,
      codeExecutionResult: undefined,
    };

    // Add usage metadata if available
    if (ollamaResponse.eval_count || ollamaResponse.prompt_eval_count) {
      response.usageMetadata = {
        promptTokenCount: ollamaResponse.prompt_eval_count || 0,
        candidatesTokenCount: ollamaResponse.eval_count || 0,
        totalTokenCount: (ollamaResponse.prompt_eval_count || 0) + (ollamaResponse.eval_count || 0),
      };
    }

    return response;
  }
} 