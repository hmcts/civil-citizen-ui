import {GenericForm} from 'form/models/genericForm';
import {CancelUnissuedClaimSpecReason} from 'form/models/cancelUnissuedClaimSpec/cancelUnissuedClaimSpecReason';

const TOO_LONG = 'ERRORS.CANCEL_UNISSUED_CLAIM_SPEC_REASON_TOO_LONG';
const INVALID_CHARACTERS = 'ERRORS.CANCEL_UNISSUED_CLAIM_SPEC_REASON_INVALID_CHARACTERS';

const validate = async (reason?: string) => {
  const form = new GenericForm(new CancelUnissuedClaimSpecReason(reason));
  await form.validate();
  return form;
};

describe('CancelUnissuedClaimSpecReason', () => {
  it.each([undefined, '', 'Settled outside the portal'])('should accept an optional reason: %p', async (reason) => {
    expect((await validate(reason)).hasErrors()).toBe(false);
  });

  it('should accept letters, numbers, new lines and standard punctuation', async () => {
    const form = await validate('We agreed £500 (50%) - paid on 01/02/2026.\nIt\'s done; thanks: "ok"! Why? A&B ’quoted’ “text”'
      + ' email@test.com #1 $20 +5 =ok – — …');

    expect(form.hasErrors()).toBe(false);
  });

  it('should accept exactly 200 characters', async () => {
    expect((await validate('a'.repeat(200))).hasErrors()).toBe(false);
  });

  it('should reject more than 200 characters', async () => {
    const form = await validate('a'.repeat(201));

    expect(form.errorFor('cancelReason')).toBe(TOO_LONG);
  });

  it.each(['<script>', 'a*b', '{x}', '[x]', 'a~b', 'a^b', 'a`b', 'a|b', 'a\\b', '😀'])(
    'should reject non-standard characters: %p', async (reason) => {
      const form = await validate(reason);

      expect(form.errorFor('cancelReason')).toBe(INVALID_CHARACTERS);
    });

  it('should show the length error first when both rules fail', async () => {
    const form = await validate('*'.repeat(201));

    expect(form.errorFor('cancelReason')).toBe(TOO_LONG);
    expect(form.getErrors()).toHaveLength(1);
  });
});
