import {AxiosError} from 'axios';

export type CallbackValidationPayload = {
  callbackErrors: string[];
  callbackWarnings: string[];
};

export type GovUkErrorListItem = { text: string };

export class CallbackValidationError extends Error {
  constructor(
    public readonly callbackErrors: string[],
    public readonly callbackWarnings: string[] = [],
    message = 'Event submission failed due to callback validation errors',
  ) {
    super(message);
    this.name = 'CallbackValidationError';
  }
}

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
};

export const parseCallbackValidationBody = (data: unknown): CallbackValidationPayload | null => {
  if (data == null) {
    return null;
  }

  let parsed: unknown = data;
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data);
    } catch {
      return null;
    }
  }

  if (Array.isArray(parsed)) {
    parsed = parsed.length > 0 ? parsed[0] : null;
  }

  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const record = parsed as Record<string, unknown>;
  const callbackErrors = toStringArray(record.callbackErrors);
  const callbackWarnings = toStringArray(record.callbackWarnings);

  if (callbackErrors.length === 0 && callbackWarnings.length === 0) {
    return null;
  }

  return {callbackErrors, callbackWarnings};
};

export const parseCallbackValidationFromAxiosError = (error: AxiosError): CallbackValidationPayload | null => {
  return parseCallbackValidationBody(error.response?.data);
};

export const toGovUkErrorList = (messages: string[]): GovUkErrorListItem[] =>
  messages.map((text) => ({text}));

export const isCallbackValidationError = (error: unknown): error is CallbackValidationError =>
  error instanceof CallbackValidationError;
