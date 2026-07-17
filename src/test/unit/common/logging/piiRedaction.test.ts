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

  it('retains case IDs and redacts other identifiers and financial values', () => {
    const message = redactString(
      'caseId=1234567890123456, caseReference=ABC-123, claimId=1234567890123456, amount=250, paymentReference=RC-123',
    );
    const value = {
      caseId: '1234567890123456',
      caseReference: 'ABC-123',
      claimId: '1234567890123456',
      userId: 'abc-123',
      amount: 250,
      paymentReference: 'RC-123',
      status: 'success',
    };

    expect(message).toContain('caseId=1234567890123456');
    expect(message).toContain('caseReference=ABC-123');
    expect(message).toContain('claimId=1234567890123456');
    expect(message).not.toContain('250');
    expect(message).not.toContain('RC-123');
    expect(redactLogValue(value)).toEqual({
      caseId: '1234567890123456',
      caseReference: 'ABC-123',
      claimId: '1234567890123456',
      userId: '[REDACTED]',
      amount: '[REDACTED]',
      paymentReference: '[REDACTED]',
      status: 'success',
    });
  });

  it('handles circular structured metadata', () => {
    const value: Record<string, unknown> = {};
    value.self = value;

    expect(redactLogValue(value)).toEqual({self: '[CIRCULAR]'});
  });
});
