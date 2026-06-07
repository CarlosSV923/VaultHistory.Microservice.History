import { GenerateHistoryUseCase } from '@application/use-cases/generate-history.use-case';
import { ErrorCodes, ErrorEntity } from '@domain/abstractions/error.entity';
import { ResultEntity } from '@domain/abstractions/result.entity';
import { type AIServicePort } from '@domain/histories/ports/ai-service.port';
import { type HistoryRepositoryPort } from '@domain/histories/ports/history-repository.port';

describe('GenerateHistoryUseCase', () => {
    let useCase: GenerateHistoryUseCase;
    let mockAIService: jest.Mocked<AIServicePort>;
    let mockHistoryRepository: jest.Mocked<HistoryRepositoryPort>;

    beforeEach(() => {
        mockAIService = {
            generateContent: jest.fn(),
        };

        mockHistoryRepository = {
            saveHistory: jest.fn(),
            getHistoriesByFilter: jest.fn(),
            deactivateByUserId: jest.fn(),
            deactivateById: jest.fn(),
        };

        useCase = new GenerateHistoryUseCase(mockHistoryRepository, mockAIService);
    });

    it('should generate content, save history and return generated content', async () => {
        const params = {
            userId: 'user123',
            date: '2024-01-01',
            theme: 'Adventure',
            character: 'Hero',
        };
        const generatedContent = 'Generated history content';

        mockAIService.generateContent.mockResolvedValue(ResultEntity.success(generatedContent));
        mockHistoryRepository.saveHistory.mockResolvedValue(ResultEntity.success());

        const result = await useCase.execute(params);

        expect(result.isSuccess).toBe(true);
        expect(result.Value).toBe(generatedContent);
        expect(mockAIService.generateContent.mock.calls).toEqual([[params]]);
        expect(mockHistoryRepository.saveHistory.mock.calls).toHaveLength(1);

        const savedHistory = mockHistoryRepository.saveHistory.mock.calls[0]?.[0];
        expect(savedHistory?.userId).toBe(params.userId);
        expect(savedHistory?.content).toBe(generatedContent);
        expect(savedHistory?.date).toBe(params.date);
        expect(savedHistory?.theme).toBe(params.theme);
        expect(savedHistory?.character).toBe(params.character);
        expect(savedHistory?.isActive).toBe(true);
    });

    it('should return failure when AI service fails', async () => {
        const params = {
            userId: 'user123',
        };
        const error = ErrorEntity.SDKError('Failed to generate content');

        mockAIService.generateContent.mockResolvedValue(ResultEntity.failure(error));

        const result = await useCase.execute(params);

        expect(result.isFailure).toBe(true);
        expect(result.error).toBe(error);
        expect(result.error.code).toBe(ErrorCodes.SDKError);
        expect(mockHistoryRepository.saveHistory.mock.calls).toHaveLength(0);
    });

    it('should return failure when repository save fails', async () => {
        const params = {
            userId: 'user123',
            theme: 'Science Fiction',
        };
        const generatedContent = 'Generated sci-fi content';
        const error = ErrorEntity.DatabaseError('Failed to save history');

        mockAIService.generateContent.mockResolvedValue(ResultEntity.success(generatedContent));
        mockHistoryRepository.saveHistory.mockResolvedValue(ResultEntity.failure(error));

        const result = await useCase.execute(params);

        expect(result.isFailure).toBe(true);
        expect(result.error).toBe(error);
        expect(result.error.code).toBe(ErrorCodes.DatabaseError);
        expect(mockHistoryRepository.saveHistory.mock.calls).toHaveLength(1);
    });
});
