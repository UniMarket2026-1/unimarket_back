import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly enabled = !!process.env.GEMINI_API_KEY;

  constructor() {
    if (!this.enabled) {
      this.logger.warn('Gemini API key not provided — using fallback AI responses.');
    }
  }

  async generateProductDescription(
    productName: string,
    category: string,
    condition: string,
    price: number,
  ): Promise<{
    description: string;
    conditionDetail: string;
  }> {
    // Lightweight fallback: return a templated description.
    // If you want real Gemini calls, replace this with an HTTP request using fetch
    // or re-introduce the official client when a compatible version is available.
    try {
      if (!this.enabled) {
        return {
          description: `${productName} — ${condition} ${category}. A great value for students.`,
          conditionDetail: `This ${condition.toLowerCase()} item is clean and functional; minor wear where expected.`,
        };
      }

      // Placeholder: when GEMINI_API_KEY is provided, we currently fallback as well.
      // Implement REST calls to the Generative API here if desired.
      return {
        description: `${productName} — ${condition} ${category}. A great value for students.`,
        conditionDetail: `This ${condition.toLowerCase()} item is clean and functional; minor wear where expected.`,
      };
    } catch (error) {
      this.logger.error('generateProductDescription error', error as any);
      return {
        description: `${productName} — ${condition} ${category}. A great value for students.`,
        conditionDetail: `This ${condition.toLowerCase()} item is clean and functional; minor wear where expected.`,
      };
    }
  }

  async generateChatSuggestion(context: string): Promise<string> {
    try {
      if (!this.enabled) {
        return 'Thanks for reaching out! How can I help?';
      }

      return 'Thanks for reaching out! How can I help?';
    } catch (error) {
      this.logger.error('generateChatSuggestion error', error as any);
      return 'Thanks for reaching out! How can I help?';
    }
  }

  async analyzeImage(imageUrl: string): Promise<{
    detectedItems: string[];
    suggestedCategory: string;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  }> {
    try {
      if (!this.enabled) {
        return {
          detectedItems: [],
          suggestedCategory: 'Otros',
          quality: 'good',
        };
      }

      return {
        detectedItems: [],
        suggestedCategory: 'Otros',
        quality: 'good',
      };
    } catch (error) {
      this.logger.error('analyzeImage error', error as any);
      return {
        detectedItems: [],
        suggestedCategory: 'Otros',
        quality: 'good',
      };
    }
  }
}
