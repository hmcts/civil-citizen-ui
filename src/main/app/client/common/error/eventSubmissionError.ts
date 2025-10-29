export class EventSubmissionError extends Error {
  constructor(
    message: string,
    public meta?: { status?: number; url?: string; event?: string },
  ) {
    super(message);
    this.name = 'EventSubmissionError';
  }
}
