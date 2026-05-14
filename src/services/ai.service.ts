import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(apiKey);
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
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `You are a helpful assistant for an online marketplace. Generate a professional and appealing product description for a listing.

Product Details:
- Name: ${productName}
- Category: ${category}
- Condition: ${condition}
- Price: $${price}

Please provide:
1. A compelling 2-3 sentence product description that highlights key features and appeal
2. A detailed condition statement (2-3 sentences) that explains the item's state, any wear/tear, and usage history

Format your response as JSON with keys "description" and "conditionDetail".`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        description: `${productName} - ${condition} ${category}. Great item for students.`,
        conditionDetail: `This ${condition.toLowerCase()} item is in good condition and ready to use.`,
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        description: `${productName} - ${condition} ${category}. Great item for students.`,
        conditionDetail: `This ${condition.toLowerCase()} item is in good condition and ready to use.`,
      };
    }
  }

  async generateChatSuggestion(context: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `You are a helpful assistant for student marketplace chats. Generate a short, friendly message suggestion based on this context:

Context: ${context}

Provide only one short message (1-2 sentences) that continues the conversation naturally. Be friendly and helpful.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text().slice(0, 500); // Limit response length
    } catch (error) {
      console.error('AI Service Error:', error);
      return 'Thanks for reaching out! How can I help you?';
    }
  }

  async analyzeImage(imageUrl: string): Promise<{
    detectedItems: string[];
    suggestedCategory: string;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

      const prompt = `Analyze this product image and provide:
1. A list of detected items/objects in the image
2. A suggested product category (Libros, Tecnología, Muebles, Ropa, Otros)
3. Image quality rating (poor, fair, good, excellent)

Format as JSON with keys: detectedItems (array), suggestedCategory (string), quality (string)`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: Buffer.from(imageUrl).toString('base64'),
          },
        },
      ]);

      const response = result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        detectedItems: ['Product'],
        suggestedCategory: 'Otros',
        quality: 'good',
      };
    } catch (error) {
      console.error('AI Image Analysis Error:', error);
      return {
        detectedItems: [],
        suggestedCategory: 'Otros',
        quality: 'good',
      };
    }
  }
}
