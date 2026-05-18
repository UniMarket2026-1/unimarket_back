import { Controller, Get, Param } from '@nestjs/common';
import { AiService } from '@/services/ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('models')
  async list() {
    const models = await this.aiService.listModels();
    return { models };
  }

  @Get('select/:kind')
  async select(@Param('kind') kind: 'vision' | 'text') {
    const selected = await this.aiService.selectModelFor(kind as any);
    const available = await this.aiService.listModels();
    return { kind, selected, available };
  }
}
