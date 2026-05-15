import { Injectable, Logger } from '@nestjs/common';

type ProductAnalysis = {
  name: string;
  description: string;
  category: string;
  condition: string;
  conditionDetail: string;
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly enabled = !!process.env.GEMINI_API_KEY;

  constructor() {
    if (!this.enabled) {
      this.logger.warn('Gemini API key not provided — using fallback AI responses.');
    }
  }

  private getFallbackAnalysis(
    productName?: string,
    category?: string,
    condition?: string,
  ): ProductAnalysis {
    const safeName = productName?.trim() || 'Producto';
    const safeCategory = category?.trim() || 'Otros';
    const safeCondition = condition?.trim() || 'Poco usado';

    return {
      name: safeName,
      description: `${safeName} en ${safeCondition.toLowerCase()} estado, ideal para estudiantes y listo para usarse.`,
      category: safeCategory,
      condition: safeCondition,
      conditionDetail: `El artículo se encuentra ${safeCondition.toLowerCase()}. Tiene un uso normal acorde a su categoría y está listo para entrega o reventa.`,
    };
  }

  private extractJson(text: string) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
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
    try {
      if (!this.enabled) {
        const fallback = this.getFallbackAnalysis(productName, category, condition);
        return {
          description: fallback.description,
          conditionDetail: fallback.conditionDetail,
        };
      }

      const prompt = `You are helping a university marketplace seller fill out a listing form.

Return JSON only with keys: name, description, category, condition, conditionDetail.

Rules:
- Infer the product from the photo and optional hints.
- Do not include price.
- Write in Spanish.
- description should be 2-3 natural sentences.
- conditionDetail should be specific and useful for a buyer.
- category must be one of: Libros, Tecnología, Muebles, Ropa, Otros.
- condition must be one of: Nuevo, Poco usado, Usado.

Hints:
- productName: ${productName}
- category: ${category}
- condition: ${condition}
- price: ${price}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json',
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini request failed with ${response.status}`);
      }

      const payload = await response.json();
      const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const parsed = this.extractJson(text) ?? this.getFallbackAnalysis(productName, category, condition);

      return {
        description: parsed.description,
        conditionDetail: parsed.conditionDetail,
      };
    } catch (error) {
      this.logger.error('generateProductDescription error', error as any);
      const fallback = this.getFallbackAnalysis(productName, category, condition);
      return {
        description: fallback.description,
        conditionDetail: fallback.conditionDetail,
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

      const base64 = imageUrl.startsWith('data:') ? imageUrl.split(',')[1] : imageUrl;
      const mimeTypeMatch = imageUrl.match(/^data:(.*?);base64,/);
      const mimeType = mimeTypeMatch?.[1] || 'image/jpeg';

      const prompt = `Analyze the product image and return JSON only with keys: detectedItems, suggestedCategory, quality.

Rules:
- detectedItems must be an array of short strings.
- suggestedCategory must be one of: Libros, Tecnología, Muebles, Ropa, Otros.
- quality must be one of: poor, fair, good, excellent.
- Focus on what a university marketplace seller should fill in for a listing.
- Do not return price.
- If the image is blurry or unclear, still make a best effort.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini image request failed with ${response.status}`);
      }

      const payload = await response.json();
      const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const parsed = this.extractJson(text);

      if (parsed) {
        return {
          detectedItems: Array.isArray(parsed.detectedItems) ? parsed.detectedItems : [],
          suggestedCategory: parsed.suggestedCategory || 'Otros',
          quality: parsed.quality || 'good',
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

  async analyzeProductImage(imageData: string, hints?: { productName?: string; category?: string; condition?: string; }): Promise<ProductAnalysis> {
    try {
      if (!this.enabled) {
        return this.getFallbackAnalysis(hints?.productName, hints?.category, hints?.condition);
      }

      const base64 = imageData.startsWith('data:') ? imageData.split(',')[1] : imageData;
      const mimeTypeMatch = imageData.match(/^data:(.*?);base64,/);
      const mimeType = mimeTypeMatch?.[1] || 'image/jpeg';

      const prompt = `You are helping a student seller create a marketplace listing from a photo.

Return JSON only with keys: name, description, category, condition, conditionDetail.

Rules:
- Infer the item from the image.
- Do not include price.
- description should be 2-3 sentences.
- conditionDetail should mention visible wear or state if it can be inferred.
- category must be one of: Libros, Tecnología, Muebles, Ropa, Otros.
- condition must be one of: Nuevo, Poco usado, Usado.
- Write in Spanish.

Hints:
- productName: ${hints?.productName || ''}
- category: ${hints?.category || ''}
- condition: ${hints?.condition || ''}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.5,
              responseMimeType: 'application/json',
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini analysis request failed with ${response.status}`);
      }

      const payload = await response.json();
      const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const parsed = this.extractJson(text);

      if (parsed) {
        return {
          name: parsed.name || hints?.productName || 'Producto',
          description: parsed.description || this.getFallbackAnalysis(hints?.productName, hints?.category, hints?.condition).description,
          category: parsed.category || hints?.category || 'Otros',
          condition: parsed.condition || hints?.condition || 'Poco usado',
          conditionDetail: parsed.conditionDetail || this.getFallbackAnalysis(hints?.productName, hints?.category, hints?.condition).conditionDetail,
        };
      }

      return this.getFallbackAnalysis(hints?.productName, hints?.category, hints?.condition);
    } catch (error) {
      this.logger.error('analyzeProductImage error', error as any);
      return this.getFallbackAnalysis(hints?.productName, hints?.category, hints?.condition);
    }
  }
}
