import { GlobalExceptionFilter } from '@api/filters/global-exception.filter';
import { ErrorEntity } from '@domain/abstractions/error.entity';
import { type ArgumentsHost, UnauthorizedException } from '@nestjs/common';

type ResponseBody = Record<string, unknown>;

type MockResponse = {
    status: jest.Mock<MockResponse, [number]>;
    json: jest.Mock<MockResponse, [ResponseBody]>;
};

const createResponse = (): MockResponse => {
    const response = {
        status: jest.fn<MockResponse, [number]>(),
        json: jest.fn<MockResponse, [ResponseBody]>(),
    };
    response.status.mockReturnValue(response);
    response.json.mockReturnValue(response);
    return response;
};

const createHost = (response: MockResponse): ArgumentsHost =>
    ({
        switchToHttp: () => ({
            getResponse: () => response,
        }),
    }) as unknown as ArgumentsHost;

describe('GlobalExceptionFilter', () => {
    it('should map unauthorized exceptions to authentication error', () => {
        const filter = new GlobalExceptionFilter();
        const response = createResponse();

        filter.catch(new UnauthorizedException(), createHost(response));

        expect(response.status.mock.calls).toEqual([[401]]);
        expect(response.json.mock.calls).toEqual([[{ ...ErrorEntity.AuthenticationError }]]);
    });

    it('should map unknown exceptions to internal server error', () => {
        const filter = new GlobalExceptionFilter();
        const response = createResponse();

        filter.catch(new Error('Unexpected'), createHost(response));

        expect(response.status.mock.calls).toEqual([[500]]);
        expect(response.json.mock.calls).toEqual([[{ ...ErrorEntity.InternalServerError }]]);
    });
});
