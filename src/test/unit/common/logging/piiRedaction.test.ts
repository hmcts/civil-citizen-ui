import {redactLogValue, redactString} from 'common/logging/piiRedaction';

describe('PII logging redaction', () => {
  it('redacts email addresses in strings', () => {
    expect(redactString('Sending to jane.doe@example.com')).toBe('Sending to [REDACTED]');
  });

  it('redacts JSON and object-style PII fields in strings', () => {
    const value = '{"firstName":"Jane","dateOfBirth":"1990-01-01","postcode":"SW1A 1AA"}';

    const redacted = redactString(value);

    expect(redacted).not.toContain('Jane');
    expect(redacted).not.toContain('1990-01-01');
    expect(redacted).not.toContain('SW1A 1AA');
  });

  it('redacts each line without consuming later stack frames', () => {
    const value = 'Request failed\nclaimAmount=250\nat Example.method';

    expect(redactString(value)).toBe('Request failed\nclaimAmount=[REDACTED]\nat Example.method');
  });

  it('recursively redacts sensitive properties in structured log metadata', () => {
    const value = {
      claimant: {
        firstName: 'Jane',
        address: {postCode: 'SW1A 1AA'},
        contact: 'jane.doe@example.com',
      },
      caseId: '1234',
    };

    expect(redactLogValue(value)).toEqual({
      claimant: {
        firstName: '[REDACTED]',
        address: '[REDACTED]',
        contact: '[REDACTED]',
      },
      caseId: '1234',
    });
  });

  it('retains operational identifiers and redacts financial values', () => {
    const message = redactString([
      'caseId=1234567890123456, caseReference=ABC-123, claimId=1234567890123456',
      'userId=user-123, taskId=task-123, documentId=document-123, notificationId=notification-123',
      'amount=250, totalClaimAmount=500, claimFeeInPence=7000, interestAmount=15',
      'paymentReference=RC-123',
    ].join(', '));
    const value = {
      caseId: '1234567890123456',
      caseReference: 'ABC-123',
      claimId: '1234567890123456',
      userId: 'user-123',
      taskId: 'task-123',
      documentId: 'document-123',
      notificationId: 'notification-123',
      amount: 250,
      totalClaimAmount: 500,
      claimFeeInPence: 7000,
      interestAmount: 15,
      paymentReference: 'RC-123',
      status: 'success',
    };

    expect(message).toContain('caseId=1234567890123456');
    expect(message).toContain('caseReference=ABC-123');
    expect(message).toContain('claimId=1234567890123456');
    expect(message).toContain('userId=user-123');
    expect(message).toContain('taskId=task-123');
    expect(message).toContain('documentId=document-123');
    expect(message).toContain('notificationId=notification-123');
    expect(message).not.toContain('250');
    expect(message).not.toContain('500');
    expect(message).not.toContain('7000');
    expect(message).not.toContain('15');
    expect(message).not.toContain('RC-123');
    expect(redactLogValue(value)).toEqual({
      caseId: '1234567890123456',
      caseReference: 'ABC-123',
      claimId: '1234567890123456',
      userId: 'user-123',
      taskId: 'task-123',
      documentId: 'document-123',
      notificationId: 'notification-123',
      amount: '[REDACTED]',
      totalClaimAmount: '[REDACTED]',
      claimFeeInPence: '[REDACTED]',
      interestAmount: '[REDACTED]',
      paymentReference: '[REDACTED]',
      status: 'success',
    });
  });

  it('handles circular structured metadata', () => {
    const value: Record<string, unknown> = {};
    value.self = value;

    expect(redactLogValue(value)).toEqual({self: '[CIRCULAR]'});
  });

  it('handles repeated references and special object types', () => {
    const shared = {firstName: 'Jane'};
    const createdAt = new Date('2026-07-17T00:00:00.000Z');

    expect(redactLogValue({primary: shared, secondary: shared, createdAt, payload: Buffer.from('data')})).toEqual({
      primary: {firstName: '[REDACTED]'},
      secondary: {firstName: '[REDACTED]'},
      createdAt,
      payload: '[BINARY DATA]',
    });
  });

  it('redacts errors while retaining safe diagnostic information', () => {
    const error = new Error('Unable to notify jane.doe@example.com');
    error.name = 'NotificationError';
    error.stack = 'NotificationError: emailAddress=jane.doe@example.com\n    at notify';

    expect(redactLogValue(error)).toEqual({
      name: 'NotificationError',
      message: 'Unable to notify [REDACTED]',
      stack: 'NotificationError: emailAddress=[REDACTED]\n    at notify',
    });
  });

  it('redacts arrays and preserves non-sensitive values and regular expressions', () => {
    const pattern = /case-reference/i;

    expect(redactLogValue([
      'Contact jane.doe@example.com',
      {fullName: 'Jane Doe', caseId: '1234'},
      null,
      42,
      pattern,
    ])).toEqual([
      'Contact [REDACTED]',
      {fullName: '[REDACTED]', caseId: '1234'},
      null,
      42,
      pattern,
    ]);
  });

  it('installs redaction on loggers once and redacts their arguments', () => {
    jest.isolateModules(() => {
      const info = jest.fn();
      const logger = {
        error: jest.fn(),
        warn: jest.fn(),
        info,
        verbose: jest.fn(),
        debug: jest.fn(),
        silly: jest.fn(),
      };
      const getLogger = jest.fn().mockReturnValue(logger);
      jest.doMock('@hmcts/nodejs-logging', () => ({Logger: {getLogger}}));
      const {installPiiLoggingRedaction} = require('common/logging/piiRedaction');
      const {Logger} = require('@hmcts/nodejs-logging');

      installPiiLoggingRedaction();
      installPiiLoggingRedaction();
      const wrappedLogger = Logger.getLogger('test');
      expect(Logger.getLogger('test')).toBe(wrappedLogger);

      wrappedLogger.info('Contact jane.doe@example.com', {amount: 250, caseId: '1234'});

      expect(info).toHaveBeenCalledWith(
        'Contact [REDACTED]',
        {amount: '[REDACTED]', caseId: '1234'},
      );
      expect(getLogger).toHaveBeenCalledTimes(2);
    });
  });
});
