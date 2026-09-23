import { IAiProvider, AiModelConfig, AiPromptContext } from '../types';

export abstract class BaseAiProvider implements IAiProvider {
  abstract readonly name: string;
  abstract readonly defaultModel: string;
  abstract readonly availableModels: string[];

  abstract isConfigured(): boolean;

  abstract generateContent(
    sanitizedPrompt: string,
    context: AiPromptContext,
    config?: Partial<AiModelConfig>
  ): Promise<{
    text: string;
    tokensPrompt: number;
    tokensCompletion: number;
    modelUsed: string;
  }>;

  protected estimateTokenCount(text: string): number {
    if (!text) return 0;
    // Standard approximation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}
