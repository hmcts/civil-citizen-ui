import {assertHasData, EventSubmissionError} from '../../../../../../main/app/client/common/error/eventSubmissionError';
import {AxiosResponse} from 'axios';

describe('assertHasData', () => {
  const mockAxiosResponse = <T>(data: T | null | undefined, status = 200, url = 'http://example.com') : AxiosResponse<T | null | undefined> => {
    return ({
      data,
      status,
      statusText: 'OK',
      headers: {},
      config: {url},
    } as AxiosResponse);
  };

  it('should not throw an error if response has data', () => {
    const mockResponse = mockAxiosResponse({key: 'value'});

    expect(() => assertHasData(mockResponse)).not.toThrow();
  });

  it('should throw EventSubmissionError if response data is null', () => {
    const mockResponse = mockAxiosResponse(null);

    expect(() => assertHasData(mockResponse)).toThrow(EventSubmissionError);
    expect(() => assertHasData(mockResponse)).toThrow('Empty response body');
  });

  it('should throw EventSubmissionError if response data is undefined', () => {
    const mockResponse = mockAxiosResponse(undefined);

    expect(() => assertHasData(mockResponse)).toThrow(EventSubmissionError);
    expect(() => assertHasData(mockResponse)).toThrow('Empty response body');
  });

  it('should include action in the error message when meta.action is provided', () => {
    const mockResponse = mockAxiosResponse(null);

    expect(() =>
      assertHasData(mockResponse, {action: 'processing data'}),
    ).toThrow('Empty response body during: processing data');
  });

  it('should include event type in the error metadata when meta.event is provided', () => {
    const mockResponse = mockAxiosResponse(null);

    try {
      assertHasData(mockResponse, {event: 'TEST_EVENT'});
    } catch (err) {
      if (err instanceof EventSubmissionError) {
        expect(err.meta.event).toBe('TEST_EVENT');
      } else {
        throw err;
      }
    }
  });

  it('should use a default event name if meta.event is not provided', () => {
    const mockResponse = mockAxiosResponse(null);

    try {
      assertHasData(mockResponse);
    } catch (err) {
      if (err instanceof EventSubmissionError) {
        expect(err.meta.event).toBe('<event-name>');
      } else {
        throw err;
      }
    }
  });

  it('should include response status and URL in the error metadata', () => {
    const mockResponse = mockAxiosResponse(null, 404, 'http://test.com');

    try {
      assertHasData(mockResponse);
    } catch (err) {
      if (err instanceof EventSubmissionError) {
        expect(err.meta.status).toBe(404);
        expect(err.meta.url).toBe('http://test.com');
      } else {
        throw err;
      }
    }
  });
});

describe('EventSubmissionError', () => {
  it('should set the name to "EventSubmissionError"', () => {
    const error = new EventSubmissionError('An error occurred');
    expect(error.name).toBe('EventSubmissionError');
  });

  it('should set the message property correctly', () => {
    const errorMessage = 'Test error message';
    const error = new EventSubmissionError(errorMessage);
    expect(error.message).toBe(errorMessage);
  });

  it('should allow meta data to be optional', () => {
    const error = new EventSubmissionError('Error without meta');
    expect(error.meta).toBeUndefined();
  });

  it('should set meta properties when provided', () => {
    const meta = { status: 404, url: 'http://example.com', event: 'TEST_EVENT' };
    const error = new EventSubmissionError('Error with meta', meta);
    expect(error.meta).toEqual(meta);
  });

  it('should set only specific meta properties when partially provided', () => {
    const meta = { status: 500 };
    const error = new EventSubmissionError('Error with partial meta', meta);
    expect(error.meta?.status).toBe(500);
    expect(error.meta?.url).toBeUndefined();
    expect(error.meta?.event).toBeUndefined();
  });
});
