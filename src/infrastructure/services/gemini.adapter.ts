import { Injectable, Logger } from '@nestjs/common';
import { ResultEntity } from '@domain/abstractions/result.entity';
import { AIServicePort, GenerateContentParams } from 'src/domain/histories/ports/ai-service.port';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { ErrorEntity } from 'src/domain/abstractions/error.entity';

@Injectable()
export class GeminiAdapter implements AIServicePort {
    private readonly ai: GoogleGenAI;
    private readonly logger = new Logger(GeminiAdapter.name);

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('GOOGLE_API_KEY');

        if (!apiKey) {
            throw new Error('Google API key is not configured');
        }

        this.ai = new GoogleGenAI({ apiKey });
    }

    async generateContent(data: GenerateContentParams): Promise<ResultEntity<string>> {
        const { date, theme, character } = data;

        let prompt =
            'Eres un narrador e historiador brillante y entretenido. Tu tarea es escribir una historia corta o dato curioso basado en las siguientes restricciones:\n';

        if (date) {
            prompt += `- Debe estar ambientada o directamente relacionada con la fecha: "${date}".\n`;
        } else {
            prompt += `- La fecha o época debe ser completamente aleatoria, elije un momento interesante de la historia de la humanidad.\n`;
        }

        if (theme) {
            prompt += `- El tema central o género de la historia debe ser: "${theme}".\n`;
        }

        if (character) {
            prompt += `- El protagonista o un personaje clave involucrado debe ser: "${character}".\n`;
        }

        prompt +=
            '\nFormato: Mantén la historia concisa (máximo 3 párrafos), atractiva y con un tono amigable.';

        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            if (!response?.text) {
                this.logger.warn(
                    `User ${data.userId} - Received empty response from Gemini - response: ` +
                        JSON.stringify(response),
                );
                return ResultEntity.failure(
                    ErrorEntity.SDKError('Received empty response from Gemini'),
                );
            }
            this.logger.log(
                `User ${data.userId} - Content generated successfully with Gemini - response: ` +
                    JSON.stringify(response),
            );
            return ResultEntity.success(response.text);
        } catch (error) {
            this.logger.error(
                `User ${data.userId} - Error generating content with Gemini - Message: ` +
                    (error instanceof Error ? error.message : 'Unknown error'),
                error instanceof Error ? error.stack : null,
            );
            return ResultEntity.failure(ErrorEntity.SDKError('Failed to generate content'));
        }
    }
}
