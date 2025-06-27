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
    // Check if this is a JSON generation request
    const isJsonRequest = request.config?.responseMimeType === 'application/json';
    
    // Convert to Ollama format
    let messages = this.convertToOllamaMessages(request);
    
    // If JSON output is requested, add instructions to the last user message
    if (isJsonRequest && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        lastMessage.content += '\n\nIMPORTANT: Please respond ONLY with valid JSON. Do not include any explanatory text, markdown formatting, thinking tags (<think></think>), or other content. Your response must be pure JSON that can be parsed directly. Do not wrap the JSON in code blocks or add any additional text before or after the JSON.';
      }
    }

    // Make the request to Ollama
    const ollamaRequest = {
      model: this.model,
      messages,
      stream: false,
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

    const ollamaResponse = await response.json();
    let responseText = ollamaResponse.message?.content || '';
    
    // Clean thinking tokens from all responses
    responseText = this.cleanThinkingTokens(responseText);
    
    // If this was a JSON request, apply additional JSON-specific cleaning
    if (isJsonRequest) {
      responseText = this.cleanJsonResponse(responseText);
    }

    // Create response as a plain object, not using constructor
    const result: GenerateContentResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: responseText,
              },
            ],
            role: 'model',
          },
          index: 0,
          finishReason: ollamaResponse.done ? FinishReason.STOP : undefined,
        },
      ],
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
      result.usageMetadata = {
        promptTokenCount: ollamaResponse.prompt_eval_count || 0,
        candidatesTokenCount: ollamaResponse.eval_count || 0,
        totalTokenCount: (ollamaResponse.prompt_eval_count || 0) + (ollamaResponse.eval_count || 0),
      };
    }

    return result;
  }

  async generateContentStream(
    request: GenerateContentParameters,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    // For Ollama, we'll use non-streaming mode to get the complete response
    // and then yield it as a single clean result
    const messages = this.convertToOllamaMessages(request);
    const ollamaRequest = {
      model: this.model,
      messages,
      stream: false, // Use non-streaming mode for cleaner output
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

    // Get the complete response
    const ollamaResponse = await response.json();
    
    // Convert to Gemini format and yield as a single complete response
    return this.handleNonStreamingResponse(ollamaResponse);
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

  private async *handleNonStreamingResponse(ollamaResponse: any): AsyncGenerator<GenerateContentResponse> {
    let responseText = ollamaResponse.message?.content || '';
    
    // Clean thinking tokens and extract only the final answer
    responseText = this.cleanThinkingTokens(responseText);
    
    // Create a complete response
    const response: GenerateContentResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: responseText,
              },
            ],
            role: 'model',
          },
          index: 0,
          finishReason: FinishReason.STOP, // Always mark as complete since we waited for full response
        },
      ],
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

    // Yield the complete, clean response
    yield response;
  }

  private cleanThinkingTokens(text: string): string {
    // If the text is only thinking tokens, return empty string
    if (text.trim().match(/^<think>[\s\S]*<\/think>$/) || text.trim() === '<think>' || text.trim() === '</think>') {
      return '';
    }
    
    // Remove all thinking content - everything from <think> to </think>
    let cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '');
    
    // Remove any remaining incomplete thinking tags
    cleaned = cleaned.replace(/<think[^>]*>/g, '');
    cleaned = cleaned.replace(/<\/think>/g, '');
    
    // Clean up whitespace and return the result
    cleaned = cleaned.trim();
    
    return cleaned;
  }

  private cleanJsonResponse(text: string): string {
    // First clean thinking tokens
    let cleaned = this.cleanThinkingTokens(text);
    
    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/```json\s*|\s*```/g, '');
    cleaned = cleaned.replace(/```\s*|\s*```/g, '');
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    // Try to extract JSON object/array from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    
    return cleaned;
  }
} 