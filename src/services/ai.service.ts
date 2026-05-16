import { Injectable, Logger } from '@nestjs/common';

type ProductAnalysis = {
  name: string;
  description: string;
  category: string;
  condition: string;
  conditionDetail: string;
};

const ALLOWED_CATEGORIES = [
  'Libros',
  'Tecnología',
  'Muebles',
  'Ropa',
  'Electrónica',
  'Deportes',
  'Arte',
  'Instrumentos Musicales',
  'Cocina',
  'Accesorios',
  'Otros',
];

const ALLOWED_CONDITIONS = ['Nuevo', 'Poco usado', 'Usado'];

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
    const safeCategory = this.normalizeCategory(category, 'Otros');
    const safeCondition = this.normalizeCondition(condition, 'Poco usado');

    return {
      name: safeName,
      description: `${safeName} en ${safeCondition.toLowerCase()} estado, ideal para estudiantes y listo para usarse.`,
      category: safeCategory,
      condition: safeCondition,
      conditionDetail: `El artículo se encuentra ${safeCondition.toLowerCase()}. Tiene un uso normal acorde a su categoría y está listo para entrega o reventa.`,
    };
  }

  private normalizeCategory(value: unknown, fallback = 'Otros') {
    if (typeof value !== 'string') return fallback;

    const direct = ALLOWED_CATEGORIES.find((cat) => cat.toLowerCase() === value.toLowerCase());
    if (direct) return direct;

    const normalized = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (normalized.includes('electronic')) return 'Electrónica';
    if (normalized.includes('tecnolog')) return 'Tecnología';
    if (normalized.includes('deport')) return 'Deportes';
    if (normalized.includes('instrument')) return 'Instrumentos Musicales';
    if (normalized.includes('cocin')) return 'Cocina';
    if (normalized.includes('accesor')) return 'Accesorios';
    if (normalized.includes('libro')) return 'Libros';
    if (normalized.includes('mueble')) return 'Muebles';
    if (normalized.includes('ropa')) return 'Ropa';
    if (normalized.includes('arte')) return 'Arte';

    return fallback;
  }

  private normalizeCondition(value: unknown, fallback = 'Poco usado') {
    if (typeof value !== 'string') return fallback;
    const direct = ALLOWED_CONDITIONS.find((cond) => cond.toLowerCase() === value.toLowerCase());
    if (direct) return direct;

    const normalized = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (normalized.includes('nuevo') || normalized.includes('new')) return 'Nuevo';
    if (normalized.includes('usado') || normalized.includes('used')) return 'Usado';
    if (normalized.includes('poco') || normalized.includes('semi')) return 'Poco usado';
    return fallback;
  }

  private normalizeAnalysis(parsed: any, hints?: { productName?: string; category?: string; condition?: string }): ProductAnalysis {
    const fallback = this.getFallbackAnalysis(hints?.productName, hints?.category, hints?.condition);

    return {
      name: (parsed?.name || '').toString().trim() || fallback.name,
      description: (parsed?.description || '').toString().trim() || fallback.description,
      category: this.normalizeCategory(parsed?.category, fallback.category),
      condition: this.normalizeCondition(parsed?.condition, fallback.condition),
      conditionDetail: (parsed?.conditionDetail || '').toString().trim() || fallback.conditionDetail,
    };
  }

  private extractJson(text: string) {
    if (!text) return null;

    const tryParse = (candidate: string) => {
      try {
        return JSON.parse(candidate);
      } catch {
        return null;
      }
    };

    const direct = tryParse(text.trim());
    if (direct) return direct;

    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      const parsed = tryParse(fenced[1].trim());
      if (parsed) return parsed;
    }

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const objectBlock = match[0];
    const strict = tryParse(objectBlock);
    if (strict) return strict;

    const withQuotedKeys = objectBlock.replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)/g, '$1"$2"$3');
    return tryParse(withQuotedKeys);
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
- Provide concise, factual descriptions suitable for a university marketplace.
- Avoid pricing information.
- Keep description to 2-3 sentences.
- Write in Spanish when the product appears to be for a Spanish-speaking audience.

Hints:
- productName: ${productName || ''}
- category: ${category || ''}
- condition: ${condition || ''}`;

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
- suggestedCategory must be one of: Libros, Tecnología, Muebles, Ropa, Electrónica, Deportes, Arte, Instrumentos Musicales, Cocina, Accesorios, Otros.
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
          suggestedCategory: this.normalizeCategory(parsed.suggestedCategory, 'Otros'),
          quality: ['poor', 'fair', 'good', 'excellent'].includes(parsed.quality)
            ? parsed.quality
            : 'good',
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
    - Infer the concrete item from the image; avoid generic names like "Producto" unless the image is unusable.
    - Do not include price.
    - description should be 2-3 sentences and mention useful details (material, size, usage context, included parts) when visible.
    - conditionDetail should mention visible wear, missing parts, and cosmetic state if inferable.
- category must be one of: Libros, Tecnología, Muebles, Ropa, Electrónica, Deportes, Arte, Instrumentos Musicales, Cocina, Accesorios, Otros.
- condition must be one of: Nuevo, Poco usado, Usado.
- Write in Spanish.
    - If confidence is low, still return the most likely category and keep the text honest (e.g., "no se observan daños evidentes").

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
        return this.normalizeAnalysis(parsed, hints);
      }

      return this.getFallbackAnalysis(hints?.productName, hints?.category, hints?.condition);
    } catch (error) {
      this.logger.error('analyzeProductImage error', error as any);
      return this.getFallbackAnalysis(hints?.productName, hints?.category, hints?.condition);
    }
  }
}
