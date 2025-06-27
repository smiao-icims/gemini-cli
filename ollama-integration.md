# Integrating Ollama with Gemini CLI

This document outlines the feasibility and plan for extending the Gemini CLI to support locally hosted LLMs via Ollama.

## Feasibility Analysis

Integrating Ollama is highly feasible. The existing codebase, particularly in `packages/core`, uses a `ContentGenerator` interface (`packages/core/src/core/contentGenerator.ts`) which abstracts the communication with the language model. This design allows for adding new LLM providers like Ollama without significant refactoring of the core application logic.

By implementing a new `OllamaContentGenerator` that adheres to the `ContentGenerator` interface, we can seamlessly plug Ollama into the existing chat and tool infrastructure.

## Integration Plan

The integration will be performed in the following steps:

1.  **Add an `AuthType` for Ollama**:
    *   Modify the `AuthType` enum in `packages/core/src/core/contentGenerator.ts` to include a new `OLLAMA` member. This will allow the application to recognize and handle Ollama-specific configurations.

2.  **Update Configuration Handling**:
    *   Update the `createContentGeneratorConfig` function in `packages/core/src/core/contentGenerator.ts` to handle `AuthType.OLLAMA`.
    *   This will involve reading Ollama-specific settings, such as `OLLAMA_BASE_URL` and `OLLAMA_MODEL`, from environment variables or a new `ollama` section in the `settings.json` file.

3.  **Implement `OllamaContentGenerator`**:
    *   Create a new file: `packages/core/src/core/ollamaContentGenerator.ts`.
    *   Define an `OllamaContentGenerator` class within this file that implements the `ContentGenerator` interface.
    *   **`generateContentStream`**: This will be the primary method. It will make a streaming `fetch` request to the Ollama API's `POST /api/chat` or `POST /api/generate` endpoint. It will need to transform Ollama's streaming JSON response into the `GenerateContentResponse` stream expected by the Gemini CLI.
    *   **`generateContent`**: This method will make a non-streaming request to Ollama.
    *   **`countTokens` and `embedContent`**: These methods will be initially stubbed out, as they are not essential for basic chat functionality and may not be directly supported by all Ollama models in the same way as the Gemini API. They can be implemented later if needed.

4.  **Update `createContentGenerator` Factory**:
    *   Modify the `createContentGenerator` function in `packages/core/src/core/contentGenerator.ts` to instantiate and return an `OllamaContentGenerator` when `config.authType` is `AuthType.OLLAMA`.

5.  **Document the New Configuration**:
    *   Update the relevant documentation (e.g., `docs/cli/configuration.md`) to explain how to configure the Gemini CLI to use Ollama.
    *   This will include examples of the required `settings.json` configuration:

    ```json
    {
      "auth": {
        "authType": "ollama"
      },
      "ollama": {
        "model": "llama3",
        "baseUrl": "http://localhost:11434"
      }
    }
    ```
    * It will also require adding logic to `packages/cli/src/config/config.ts` to correctly load these new settings.

This plan ensures a modular and low-risk integration of Ollama into the Gemini CLI.

### Feature Gap Analysis: Gemini API vs. Ollama

While integrating Ollama is feasible, it's important to understand the feature differences that will arise. The Gemini API is a mature, cloud-hosted service, whereas Ollama provides access to a diverse range of open-source models that are typically self-hosted.

Here's a summary of the key feature gaps:

| Feature | Gemini API | Ollama | Gap & Impact |
| :--- | :--- | :--- | :--- |
| **Tool/Function Calling** | Native, robust, and a core part of the API. The `gemini-cli` is built around this for all its tools. | Supported by newer models (e.g., Llama 3.1) via a specific API format. Support and performance vary by model. | **High Impact.** The `OllamaContentGenerator` must translate the CLI's tool definitions into the format Ollama expects. The reliability of tool use will depend heavily on the specific Ollama model being used. Some models may not support it at all. |
| **Embeddings** | Provides high-performance, dedicated embedding models (`text-embedding-` family). | Provides access to various open-source embedding models (`nomic-embed-text`, `mxbai-embed-large`). The API is straightforward. | **Medium Impact.** An `embedContent` method can be implemented for Ollama. However, the quality, dimensionality, and performance of embeddings will differ. This could affect any RAG or memory-related features that rely on semantic similarity. |
| **Token Counting** | Provides a precise, server-side `countTokens` API call. | No direct API for token counting. | **Medium Impact.** The `countTokens` method in the `OllamaContentGenerator` will need to be implemented using a client-side tokenizer library (e.g., one compatible with the model in use). This can lead to slight inaccuracies in token counting, potentially causing issues with context window management. |
| **Multimodality** | Supports multimodal input (e.g., images, PDFs) with models like Gemini Pro Vision. | Support is model-dependent. While some multimodal models exist (e.g., LLaVA), most popular models are text-only. | **High Impact.** Features that rely on analyzing images or other non-text inputs will not work with most Ollama models. The integration would need to be adapted for specific multimodal models if this is a requirement. |
| **System Prompts** | Well-supported and documented for controlling model behavior. | Effectiveness and formatting can vary significantly between models. | **Low-to-Medium Impact.** The core system prompt of the CLI might need to be adjusted or templated differently depending on the Ollama model to achieve the desired behavior and persona. |
| **Advanced Features**| "Thinking" process introspection with some models (Gemini 2.5), server-side grounding with Google Search. | These specific features are not available. | **Low Impact.** The absence of these advanced, provider-specific features is expected. The built-in `web-search` tool can serve as a client-side alternative to grounding, though the user experience will differ. |
| **API Consistency**| Stable and well-defined API contract, response formats, and error codes. | API is consistent for Ollama itself, but the *content* of the model's response (e.g., quality of JSON in tool calls) varies by model. | **Medium Impact.** The `OllamaContentGenerator` will need robust error handling and response parsing to gracefully handle inconsistencies between different local models. |

### Conclusion

Switching to Ollama introduces a trade-off: you gain the flexibility, privacy, and cost-effectiveness of running local models at the expense of the consistent, feature-rich, and highly-performant ecosystem of the Gemini API. The most significant challenges will be ensuring reliable tool use and managing the variability between different open-source models. The proposed `OllamaContentGenerator` abstraction is the correct approach to manage these differences.

### Impact on Model Context Protocol (MCP)

Using MCP servers is a key architectural feature that significantly mitigates the challenges of switching to Ollama for tool-dependent workflows.

*   **MCP is LLM-Agnostic**: MCP is an independent protocol that operates between the Gemini CLI and external tool servers. The LLM (whether Gemini or an Ollama model) does not interact with MCP servers directly. The CLI acts as the central orchestrator.
*   **How it Works**:
    1.  The CLI discovers tools from MCP servers at startup.
    2.  It registers these tools in its internal `ToolRegistry` alongside built-in tools.
    3.  It presents the *entire list* of available tools to the LLM.
    4.  When the LLM requests a tool call, the CLI routes the request either to its internal implementation or to the appropriate MCP server.
*   **Conclusion**: MCP support itself is not impacted by the switch to Ollama. The only dependency is on the chosen Ollama model's ability to reliably generate a valid tool call request based on the provided tool descriptions. As long as the model is proficient at function calling, the complex tool logic remains safely encapsulated within the MCP server, and the system will function as expected. There is no specific version of the Ollama server that enables MCP; rather, it depends on the capabilities of the LLM being served. 