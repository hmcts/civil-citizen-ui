import {GenericForm} from 'common/form/models/genericForm';
import {summaryRow} from 'common/models/summaryList/summaryList';
import {SummarySection} from 'common/models/summaryList/summarySections';
import {
  applyCcdFieldErrorsToCya,
  applyCcdFieldErrorsToForm,
  applyCcdFieldErrorsToSummarySections,
  canonicalizeCcdFieldErrorId,
  toCcdFieldErrorAnchorId,
} from 'common/utils/checkYourAnswer/ccdFieldErrorsOnCya';

describe('ccdFieldErrorsOnCya', () => {
  const errorLabel = 'Error';
  const displayMessage = 'Enter a valid answer before submitting';

  describe('toCcdFieldErrorAnchorId', () => {
    it('sanitises CCD field ids for use as HTML anchors', () => {
      expect(toCcdFieldErrorAnchorId('respondent1.partyEmail'))
        .toBe('ccd-field-respondent1-partyEmail');
      expect(toCcdFieldErrorAnchorId('generalAppType.types'))
        .toBe('ccd-field-generalAppType-types');
    });
  });

  describe('canonicalizeCcdFieldErrorId', () => {
    it('maps legacy witness collection ids onto DQWitnesses.details row ids', () => {
      expect(canonicalizeCcdFieldErrorId('respondent1Witnesses.0.email'))
        .toBe('respondent1DQWitnesses.details.0.emailAddress');
      expect(canonicalizeCcdFieldErrorId('applicant1Witnesses.2.phone'))
        .toBe('applicant1DQWitnesses.details.2.phoneNumber');
      expect(canonicalizeCcdFieldErrorId('respondent1.partyPhone'))
        .toBe('respondent1.partyPhone');
    });
  });

  describe('applyCcdFieldErrorsToForm', () => {
    it('adds FormValidationErrors with the UCD message key and matching hrefs', () => {
      const form = new GenericForm({});
      const fieldErrors = [
        {id: 'respondent1.partyEmail', message: 'notanemail is not a valid Email address'},
        {id: 'respondent1.partyPhone', message: 'bad phone'},
      ];

      applyCcdFieldErrorsToForm(form, fieldErrors);

      expect(form.hasErrors()).toBe(true);
      const errors = form.getErrors();
      expect(errors).toHaveLength(2);
      expect(errors[0].text).toBe('ERRORS.ENTER_VALID_ANSWER_BEFORE_SUBMITTING');
      expect(errors[0].href).toBe('#ccd-field-respondent1-partyEmail');
      expect(errors[1].href).toBe('#ccd-field-respondent1-partyPhone');
    });

    it('canonicalises and dedupes legacy witness ids so the GDS summary has one link', () => {
      const form = new GenericForm({});
      applyCcdFieldErrorsToForm(form, [
        {id: 'respondent1Witnesses.0.email', message: 'bad'},
        {id: 'respondent1DQWitnesses.details.0.emailAddress', message: 'bad'},
      ]);

      const errors = form.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].href).toBe('#ccd-field-respondent1DQWitnesses-details-0-emailAddress');
    });

    it('preserves existing form errors', () => {
      const form = new GenericForm({}, [{
        property: 'signed',
        constraints: {isNotEmpty: 'ERRORS.STATEMENT_OF_TRUTH_REQUIRED_MESSAGE'},
      }]);

      applyCcdFieldErrorsToForm(form, [{id: 'respondent1.partyEmail', message: 'bad'}]);

      expect(form.getErrors()).toHaveLength(2);
      expect(form.errorFor('signed')).toBe('ERRORS.STATEMENT_OF_TRUTH_REQUIRED_MESSAGE');
      expect(form.errorFor('ccd-field-respondent1-partyEmail'))
        .toBe('ERRORS.ENTER_VALID_ANSWER_BEFORE_SUBMITTING');
    });
  });

  describe('applyCcdFieldErrorsToSummarySections', () => {
    const emailRow = summaryRow('Email', 'notanemail@example.com');
    emailRow.ccdFieldId = 'respondent1.partyEmail';
    const phoneRow = summaryRow('Phone', '07123456789');
    phoneRow.ccdFieldId = 'respondent1.partyPhone';

    const sections: SummarySection[] = [{
      title: 'Their details',
      summaryList: {rows: [emailRow, phoneRow]},
    }];

    it('attaches inline errors to matching rows and returns unmapped errors', () => {
      const fieldErrors = [
        {id: 'respondent1.partyEmail', message: 'notanemail is not a valid Email address'},
        {id: 'unknown.field', message: 'Something else'},
      ];

      const unmapped = applyCcdFieldErrorsToSummarySections(
        sections,
        fieldErrors,
        errorLabel,
        displayMessage,
      );

      expect(emailRow.value.html).toContain('id="ccd-field-respondent1-partyEmail"');
      expect(emailRow.value.html).toContain(displayMessage);
      expect(emailRow.value.html).toContain('notanemail@example.com');
      expect(phoneRow.value.html).toBe('07123456789');
      expect(unmapped).toEqual([{
        id: 'unknown.field',
        message: 'Something else',
        anchorId: 'ccd-field-unknown-field',
      }]);
      expect(unmapped[0].anchorId).toBe(toCcdFieldErrorAnchorId('unknown.field'));
    });

    it('matches when CCD sends a shorter field id suffix', () => {
      const row = summaryRow('Email', 'a@b.com');
      row.ccdFieldId = 'respondent1.partyEmail';
      const localSections: SummarySection[] = [{
        title: 'Details',
        summaryList: {rows: [row]},
      }];

      const unmapped = applyCcdFieldErrorsToSummarySections(
        localSections,
        [{id: 'partyEmail', message: 'bad'}],
        errorLabel,
        displayMessage,
      );

      expect(unmapped).toEqual([]);
      expect(row.value.html).toContain('id="ccd-field-partyEmail"');
    });

    it('matches real CCD collection ids for witnesses and experts (details.0.field)', () => {
      const witnessPhone = summaryRow('Phone', '07000000000');
      witnessPhone.ccdFieldId = 'respondent1DQWitnesses.details.0.phoneNumber';
      const expertEmail = summaryRow('Email', 'notanemail');
      expertEmail.ccdFieldId = 'applicant1DQExperts.details.1.emailAddress';
      const localSections: SummarySection[] = [{
        title: 'Hearing',
        summaryList: {rows: [witnessPhone, expertEmail]},
      }];

      const unmapped = applyCcdFieldErrorsToSummarySections(
        localSections,
        [
          {id: 'respondent1DQWitnesses.details.0.phoneNumber', message: 'bad phone'},
          {id: 'applicant1DQExperts.details.1.emailAddress', message: 'bad email'},
        ],
        errorLabel,
        displayMessage,
      );

      expect(unmapped).toEqual([]);
      expect(witnessPhone.value.html).toContain('id="ccd-field-respondent1DQWitnesses-details-0-phoneNumber"');
      expect(expertEmail.value.html).toContain('id="ccd-field-applicant1DQExperts-details-1-emailAddress"');
    });

    it('aliases legacy respondent1Witnesses.N.email onto the DQ witness email row and dedupes', () => {
      const witnessEmail = summaryRow('Email', 'bad@example.com');
      witnessEmail.ccdFieldId = 'respondent1DQWitnesses.details.0.emailAddress';
      const localSections: SummarySection[] = [{
        title: 'Hearing',
        summaryList: {rows: [witnessEmail]},
      }];

      const unmapped = applyCcdFieldErrorsToSummarySections(
        localSections,
        [
          {id: 'respondent1Witnesses.0.email', message: 'bad email'},
          {id: 'respondent1DQWitnesses.details.0.emailAddress', message: 'bad email'},
        ],
        errorLabel,
        displayMessage,
      );

      expect(unmapped).toEqual([]);
      expect(witnessEmail.value.html).toContain('id="ccd-field-respondent1DQWitnesses-details-0-emailAddress"');
      expect(witnessEmail.value.html.match(/govuk-error-message/g)).toHaveLength(1);
    });

    it('matches real CCD id for GA application type (generalAppType.types)', () => {
      const applicationTypeRow = summaryRow('Application type', 'Ask to set aside');
      applicationTypeRow.ccdFieldId = 'generalAppType.types';
      const localSections: SummarySection[] = [{
        title: 'Application',
        summaryList: {rows: [applicationTypeRow]},
      }];

      const unmapped = applyCcdFieldErrorsToSummarySections(
        localSections,
        [{id: 'generalAppType.types', message: 'Enter a valid application type'}],
        errorLabel,
        displayMessage,
      );

      expect(unmapped).toEqual([]);
      expect(applicationTypeRow.value.html).toContain('id="ccd-field-generalAppType-types"');
    });

    it('returns all field errors as unmapped when there are no rows', () => {
      expect(applyCcdFieldErrorsToSummarySections(
        undefined,
        [{id: 'respondent1.partyEmail', message: 'bad'}],
        errorLabel,
        displayMessage,
      )).toEqual([{
        id: 'respondent1.partyEmail',
        message: 'bad',
        anchorId: 'ccd-field-respondent1-partyEmail',
      }]);
    });

    it('returns an empty array when there are no field errors', () => {
      expect(applyCcdFieldErrorsToSummarySections(sections, [], errorLabel, displayMessage)).toEqual([]);
    });
  });

  describe('applyCcdFieldErrorsToCya', () => {
    it('applies errors to both the form and matching summary rows', () => {
      const form = new GenericForm({});
      const row = summaryRow('Email', 'a@b.com');
      row.ccdFieldId = 'respondent1.partyEmail';
      const sections: SummarySection[] = [{
        title: 'Details',
        summaryList: {rows: [row]},
      }];
      const fieldErrors = [{id: 'respondent1.partyEmail', message: 'bad email'}];

      const unmapped = applyCcdFieldErrorsToCya(
        form,
        sections,
        fieldErrors,
        errorLabel,
        displayMessage,
      );

      expect(unmapped).toEqual([]);
      expect(form.errorFor('ccd-field-respondent1-partyEmail'))
        .toBe('ERRORS.ENTER_VALID_ANSWER_BEFORE_SUBMITTING');
      expect(row.value.html).toContain(displayMessage);
      expect(row.value.html).toContain('id="ccd-field-respondent1-partyEmail"');
    });

    it('orders GDS summary links by CYA row order, not CCD field_errors order', () => {
      const form = new GenericForm({});
      const partyPhone = summaryRow('Contact number', '07000000000');
      partyPhone.ccdFieldId = 'respondent1.partyPhone';
      const mediationEmail = summaryRow('Contact email', 'no^gmail.com');
      mediationEmail.ccdFieldId = 'respondent1LiPResponseCarm.alternativeMediationEmail';
      const witnessEmail = summaryRow('Email', 'bad@example.com');
      witnessEmail.ccdFieldId = 'respondent1DQWitnesses.details.0.emailAddress';
      const sections: SummarySection[] = [
        {title: 'Your details', summaryList: {rows: [partyPhone]}},
        {title: 'Mediation', summaryList: {rows: [mediationEmail]}},
        {title: 'Hearing', summaryList: {rows: [witnessEmail]}},
      ];

      applyCcdFieldErrorsToCya(
        form,
        sections,
        [
          {id: 'respondent1LiPResponseCarm.alternativeMediationEmail', message: 'bad'},
          {id: 'respondent1Witnesses.0.email', message: 'bad'},
          {id: 'respondent1.partyPhone', message: 'bad'},
          {id: 'respondent1DQWitnesses.details.0.emailAddress', message: 'bad'},
        ],
        errorLabel,
        displayMessage,
      );

      const hrefs = form.getErrors().map(error => error.href);
      expect(hrefs).toEqual([
        '#ccd-field-respondent1-partyPhone',
        '#ccd-field-respondent1LiPResponseCarm-alternativeMediationEmail',
        '#ccd-field-respondent1DQWitnesses-details-0-emailAddress',
      ]);
    });
  });
});
