import {AxiosResponse, HttpStatusCode} from 'axios';

export class EventSubmissionError extends Error {
  constructor(
    message: string,
    public meta?: { status?: number; url?: string; event?: string },
  ) {
    super(message);
    this.name = 'EventSubmissionError';
  }
}
export function assertHasData<T>(res: AxiosResponse<T | null | undefined>, meta?: { action?: string; event?: string }): asserts res is AxiosResponse<T> {
  if (res.status !== HttpStatusCode.Ok || res.data == null) {
    throw new EventSubmissionError(`Empty response body ${meta?.action ? ` during: ${meta.action}` : ''}`, {
      status: res.status,
      url: res.config?.url,
      event: meta?.event ?? '<event-name>',
    });
  }
}
