import { IAiProvider } from '../types';
import { MockAiProvider } from './mock-provider';
import { GeminiAiProvider } from './gemini-provider';
import { OpenAiProvider } from './openai-provider';
import { AnthropicAiProvider } from './anthropic-provider';

export class AiProviderRegistry {
  private static providers: Map<string, IAiProvider> = new Map();
  private static isInitialized = false;

  public static initialize(): void {
    if (this.isInitialized) return;

    // Register built-in providers
    this.registerProvider(new MockAiProvider());
    this.registerProvider(new GeminiAiProvider());
    this.registerProvider(new OpenAiProvider());
    this.registerProvider(new AnthropicAiProvider());

    this.isInitialized = true;
  }

  public static registerProvider(provider: IAiProvider): void {
    this.providers.set(provider.name.toUpperCase(), provider);
  }

  public static getProvider(name?: string): IAiProvider {
    this.initialize();

    if (name) {
      const provider = this.providers.get(name.toUpperCase());
      if (provider) return provider;
    }

    // Default resolution order:
    // 1. Gemini if configured
    // 2. OpenAI if configured
    // 3. Anthropic if configured
    // 4. Mock fallback
    const gemini = this.providers.get('GEMINI');
    if (gemini?.isConfigured()) return gemini;

    const openai = this.providers.get('OPENAI');
    if (openai?.isConfigured()) return openai;

    const anthropic = this.providers.get('ANTHROPIC');
    if (anthropic?.isConfigured()) return anthropic;

    return this.providers.get('MOCK')!;
  }

  public static listProviders(): Array<{
    name: string;
    isConfigured: boolean;
    defaultModel: string;
    availableModels: string[];
  }> {
    this.initialize();
    return Array.from(this.providers.values()).map((p) => ({
      name: p.name,
      isConfigured: p.isConfigured(),
      defaultModel: p.defaultModel,
      availableModels: p.availableModels,
    }));
  }
}
