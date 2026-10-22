import {CitizenResponseType} from 'form/models/citizenResponseType';
import {PartyTypeSelection} from 'form/models/claim/partyTypeSelection';
import {ClaimType} from 'models/eligibility/claimType';
import {ClaimTypeOptions} from 'models/eligibility/claimTypeOptions';
import {RespondAddInfo} from 'models/generalApplication/response/respondAddInfo';
import {GenericForm} from 'form/models/genericForm';
import {PartyType} from 'models/partyType';
import {YesNo} from 'form/models/yesNo';

describe('Simple form models coverage', () => {
  describe('CitizenResponseType', () => {
    it('should construct and validate required response type', async () => {
      const form = new GenericForm(new CitizenResponseType());
      await form.validate();
      expect(form.errorFor('responseType')).toBe('ERRORS.VALID_CHOOSE');
    });

    it('should use custom messageName when provided', async () => {
      const form = new GenericForm(new CitizenResponseType(undefined, 'CUSTOM.RESPONSE'));
      await form.validate();
      expect(form.errorFor('responseType')).toBe('CUSTOM.RESPONSE');
    });

    it('should accept a response type value', async () => {
      const form = new GenericForm(new CitizenResponseType('FULL_DEFENCE'));
      await form.validate();
      expect(form.hasErrors()).toBeFalsy();
    });
  });

  describe('PartyTypeSelection', () => {
    it('should require an option with default message', async () => {
      const form = new GenericForm(new PartyTypeSelection());
      await form.validate();
      expect(form.errorFor('option')).toBe('ERRORS.VALID_CHOOSE');
    });

    it('should use custom messageName when provided', async () => {
      const form = new GenericForm(new PartyTypeSelection(undefined, 'CUSTOM.PARTY'));
      await form.validate();
      expect(form.errorFor('option')).toBe('CUSTOM.PARTY');
    });

    it('should accept a party type option', async () => {
      const form = new GenericForm(new PartyTypeSelection(PartyType.INDIVIDUAL));
      await form.validate();
      expect(form.hasErrors()).toBeFalsy();
    });
  });

  describe('ClaimType', () => {
    it('should require an option with default message', async () => {
      const form = new GenericForm(new ClaimType());
      await form.validate();
      expect(form.errorFor('option')).toBe('ERRORS.SELECT_AN_OPTION');
    });

    it('should use custom messageName when provided', async () => {
      const form = new GenericForm(new ClaimType(undefined, 'CUSTOM.CLAIM_TYPE'));
      await form.validate();
      expect(form.errorFor('option')).toBe('CUSTOM.CLAIM_TYPE');
    });

    it('should accept a claim type option', async () => {
      const form = new GenericForm(new ClaimType(ClaimTypeOptions.JUST_MYSELF));
      await form.validate();
      expect(form.hasErrors()).toBeFalsy();
    });
  });

  describe('RespondAddInfo', () => {
    it('should construct with option and text', () => {
      const model = new RespondAddInfo(YesNo.YES, 'details');
      expect(model.option).toBe(YesNo.YES);
      expect(model.additionalText).toBe('details');
    });

    it('should require additional text when option is NO and text empty', async () => {
      const form = new GenericForm(new RespondAddInfo(YesNo.NO, ''));
      await form.validate();
      expect(form.errorFor('additionalText')).toBe('ERRORS.GENERAL_APPLICATION.RESPONDENT_UPLOAD_OPTION.ERROR_INPUT');
    });

    it('should require additional text when option is NO and text null', async () => {
      const form = new GenericForm(new RespondAddInfo(YesNo.NO, null as unknown as string));
      await form.validate();
      expect(form.errorFor('additionalText')).toBe('ERRORS.GENERAL_APPLICATION.RESPONDENT_UPLOAD_OPTION.ERROR_INPUT');
    });

    it('should not require additional text when option is YES', async () => {
      const form = new GenericForm(new RespondAddInfo(YesNo.YES));
      await form.validate();
      expect(form.errorFor('additionalText')).toBeUndefined();
    });

    it('should accept NO with additional text provided', async () => {
      const form = new GenericForm(new RespondAddInfo(YesNo.NO, 'more info'));
      await form.validate();
      expect(form.errorFor('additionalText')).toBeUndefined();
    });
  });
});
