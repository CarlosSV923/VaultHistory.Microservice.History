import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { GeminiAdapter } from '@infrastructure/services/gemini.adapter';
import { type GenerateContentParams } from '@domain/histories/ports/ai-service.port';
import { ErrorCodes } from '@domain/abstractions/error.entity';

jest.mock('@google/genai');

type GeminiResponse = {
    text?: string | null;
};

const expectStringContaining = (value: string): unknown =>
    expect.stringContaining(value) as unknown;

describe('GeminiAdapter', () => {
    let adapter: GeminiAdapter;
    let mockConfigService: jest.Mocked<ConfigService>;
    let mockAIGenerateContent: jest.Mock<Promise<GeminiResponse>, [unknown]>;
    const MockedGoogleGenAI = jest.mocked(GoogleGenAI);

    beforeEach(() => {
        mockConfigService = {
            get: jest.fn().mockReturnValue('test-api-key'),
        } as unknown as jest.Mocked<ConfigService>;

        const mockAI = {
            models: {
                generateContent: jest.fn<Promise<GeminiResponse>, [unknown]>(),
            },
        };

        mockAIGenerateContent = mockAI.models.generateContent;
        MockedGoogleGenAI.mockImplementation(() => mockAI as unknown as GoogleGenAI);
    });

    describe('constructor', () => {
        it('should throw error if API key is not provided', () => {
            mockConfigService.get.mockReturnValue(undefined);

            expect(() => {
                new GeminiAdapter(mockConfigService);
            }).toThrow('Google API key is not configured');
        });

        it('should initialize GeminiAdapter with valid API key', () => {
            const moduleBuilder = Test.createTestingModule({
                providers: [
                    GeminiAdapter,
                    {
                        provide: ConfigService,
                        useValue: mockConfigService,
                    },
                ],
            });

            expect(() => {
                new GeminiAdapter(mockConfigService);
            }).not.toThrow();
            expect(moduleBuilder).toBeDefined();
        });
    });

    describe('generateContent', () => {
        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    GeminiAdapter,
                    {
                        provide: ConfigService,
                        useValue: mockConfigService,
                    },
                ],
            }).compile();

            adapter = module.get<GeminiAdapter>(GeminiAdapter);
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should generate content with all parameters', async () => {
            // Arrange
            const params: GenerateContentParams = {
                userId: 'user123',
                date: '2024-01-01',
                theme: 'Adventure',
                character: 'Hero',
            };

            const expectedResponse = {
                text: 'Generated story content',
            };

            mockAIGenerateContent.mockResolvedValue(expectedResponse);

            // Act
            const result = await adapter.generateContent(params);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.Value).toBe(expectedResponse.text);
            expect(mockAIGenerateContent).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: 'gemini-2.5-flash',
                    contents: expectStringContaining('2024-01-01'),
                }),
            );
        });

        it('should generate content with only userId and date', async () => {
            // Arrange
            const params: GenerateContentParams = {
                userId: 'user123',
                date: '2024-01-01',
            };

            const expectedResponse = {
                text: 'Generated content',
            };

            mockAIGenerateContent.mockResolvedValue(expectedResponse);

            // Act
            const result = await adapter.generateContent(params);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.Value).toBe(expectedResponse.text);
            expect(mockAIGenerateContent).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: 'gemini-2.5-flash',
                    contents: expectStringContaining('2024-01-01'),
                }),
            );
        });

        it('should generate content with random date when not provided', async () => {
            // Arrange
            const params: GenerateContentParams = {
                userId: 'user123',
            };

            const expectedResponse = {
                text: 'Generated content with random date',
            };

            mockAIGenerateContent.mockResolvedValue(expectedResponse);

            // Act
            const result = await adapter.generateContent(params);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.Value).toBe(expectedResponse.text);
            expect(mockAIGenerateContent).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: 'gemini-2.5-flash',
                    contents: expectStringContaining('aleatoria'),
                }),
            );
        });

        it('should include theme in prompt when provided', async () => {
            // Arrange
            const params: GenerateContentParams = {
                userId: 'user123',
                theme: 'Science Fiction',
            };

            const expectedResponse = {
                text: 'Generated sci-fi content',
            };

            mockAIGenerateContent.mockResolvedValue(expectedResponse);

            // Act
            const result = await adapter.generateContent(params);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(mockAIGenerateContent).toHaveBeenCalledWith(
                expect.objectContaining({
                    contents: expectStringContaining('Science Fiction'),
                }),
            );
        });

        it('should include character in prompt when provided', async () => {
            // Arrange
            const params: GenerateContentParams = {
                userId: 'user123',
                character: 'Batman',
            };

            const expectedResponse = {
                text: 'Generated content with Batman',
            };

            mockAIGenerateContent.mockResolvedValue(expectedResponse);

            // Act
            const result = await adapter.generateContent(params);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(mockAIGenerateContent).toHaveBeenCalledWith(
                expect.objectContaining({
                    contents: expectStringContaining('Batman'),
                }),
            );
        });

        it('should return failure when response is empty', async () => {
            // Arrange
            const params: GenerateContentParams = {
                userId: 'user123',
            };

            mockAIGenerateContent.mockResolvedValue({ text: null });

            // Act
            const result = await adapter.generateContent(params);

            // Assert
            expect(result.isSuccess).toBe(false);
            expect(result.isFailure).toBe(true);
            expect(result.error.code).toBe(ErrorCodes.SDKError);
        });

        it('should return failure when response is undefined', async () => {
            // Arrange
            const params: GenerateContentParams = {
                userId: 'user123',
            };

            mockAIGenerateContent.mockResolvedValue({});

            // Act
            const result = await adapter.generateContent(params);

            // Assert
            expect(result.isSuccess).toBe(false);
            expect(result.isFailure).toBe(true);
            expect(result.error.code).toBe(ErrorCodes.SDKError);
        });

        it('should return failure when Gemini API throws an error', async () => {
            // Arrange
            jest.useFakeTimers();
            const params: GenerateContentParams = {
                userId: 'user123',
            };

            const error = new Error('API error');
            mockAIGenerateContent.mockRejectedValue(error);

            // Act
            const resultPromise = adapter.generateContent(params);
            await jest.runAllTimersAsync();
            const result = await resultPromise;

            // Assert
            expect(result.isSuccess).toBe(false);
            expect(result.isFailure).toBe(true);
            expect(result.error.code).toBe(ErrorCodes.SDKError);
            expect(mockAIGenerateContent).toHaveBeenCalledTimes(4);
        });

        it('should handle non-Error objects thrown by API', async () => {
            // Arrange
            jest.useFakeTimers();
            const params: GenerateContentParams = {
                userId: 'user123',
            };

            mockAIGenerateContent.mockRejectedValue('Unknown error');

            // Act
            const resultPromise = adapter.generateContent(params);
            await jest.runAllTimersAsync();
            const result = await resultPromise;

            // Assert
            expect(result.isSuccess).toBe(false);
            expect(result.isFailure).toBe(true);
            expect(result.error.code).toBe(ErrorCodes.SDKError);
            expect(mockAIGenerateContent).toHaveBeenCalledTimes(4);
        });

        it('should retry failed Gemini API calls and return success when a retry succeeds', async () => {
            // Arrange
            jest.useFakeTimers();
            const params: GenerateContentParams = {
                userId: 'user123',
            };

            const expectedResponse = {
                text: 'Generated content after retry',
            };

            mockAIGenerateContent
                .mockRejectedValueOnce(new Error('Rate limit exceeded'))
                .mockRejectedValueOnce('Community overload')
                .mockResolvedValueOnce(expectedResponse);

            // Act
            const resultPromise = adapter.generateContent(params);
            await jest.runAllTimersAsync();
            const result = await resultPromise;

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.Value).toBe(expectedResponse.text);
            expect(mockAIGenerateContent).toHaveBeenCalledTimes(3);
        });

        it('should retry three times before returning failure when Gemini API keeps failing', async () => {
            // Arrange
            jest.useFakeTimers();
            const params: GenerateContentParams = {
                userId: 'user123',
            };

            mockAIGenerateContent.mockRejectedValue(new Error('Gemini unavailable'));

            // Act
            const resultPromise = adapter.generateContent(params);
            await jest.runAllTimersAsync();
            const result = await resultPromise;

            // Assert
            expect(result.isSuccess).toBe(false);
            expect(result.isFailure).toBe(true);
            expect(result.error.code).toBe(ErrorCodes.SDKError);
            expect(mockAIGenerateContent).toHaveBeenCalledTimes(4);
        });
    });
});
