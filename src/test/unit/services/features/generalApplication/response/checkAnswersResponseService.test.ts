import { YesNo } from 'common/form/models/yesNo';
import { HearingArrangement, HearingTypeOptions } from 'common/models/generalApplication/hearingArrangement';
import { HearingContactDetails } from 'common/models/generalApplication/hearingContactDetails';
import { HearingSupport, SupportType } from 'common/models/generalApplication/hearingSupport';
import {
  AcceptDefendantOffer,
  ProposedPaymentPlanOption,
} from 'common/models/generalApplication/response/acceptDefendantOffer';
import { GaResponse } from 'common/models/generalApplication/response/gaResponse';
import { RespondentAgreement } from 'common/models/generalApplication/response/respondentAgreement';
import {
  UnavailableDatePeriodGaHearing,
  UnavailableDateType,
  UnavailableDatesGaHearing,
} from 'common/models/generalApplication/unavailableDatesGaHearing';
import { getSummarySections } from 'services/features/generalApplication/response/checkAnswersResponseService';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {CaseDocument} from 'models/document/caseDocument';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const claimAndResponse = () => {
  const response = new GaResponse();
  return { response };
};

const unavailableHearingDate = (dateType: UnavailableDateType, from: string, until?: string) => {
  const unavailableDate = new UnavailableDatePeriodGaHearing(dateType);
  unavailableDate.from = new Date(from);
  unavailableDate.until = new Date(until);
  return unavailableDate;
};

describe('Check Answers response service', () => {

  describe('getSummarySections', () => {

    it('returns no sections when no general application', () => {
      expect(getSummarySections('123', '345', new GaResponse(), 'en')).toEqual([{
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
        },
        'value': {
          'html': ' ',
        },
        'actions': {
          'items': [
            {
              'href': '/case/123/response/general-application/345/unavailable-dates',
              'text': 'COMMON.BUTTONS.CHANGE',
              'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
            },
          ],
        },
      }]);
    });

    it('returns no sections when general application is empty', () => {
      expect(getSummarySections('123', '345', new GaResponse(), 'en')).toEqual([{
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
        },
        'value': {
          'html': ' ',
        },
        'actions': {
          'items': [
            {
              'href': '/case/123/response/general-application/345/unavailable-dates',
              'text': 'COMMON.BUTTONS.CHANGE',
              'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
            },
          ],
        },
      }]);
    });

    it('returns accept offer rows - yes', () => {
      const { response } = claimAndResponse();
      response.acceptDefendantOffer = new AcceptDefendantOffer(YesNo.YES);

      expect(getSummarySections('123', '345', response, 'en')).toEqual([{
        key: { text: 'PAGES.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.TITLE' },
        value: { html: 'COMMON.VARIATION_2.YES' },
        actions: {
          items: [{
            href: '/case/123/response/general-application/345/accept-defendant-offer',
            text: 'COMMON.BUTTONS.CHANGE',
            visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.TITLE',
          }],
        },
      },
      {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
        },
        'value': {
          'html': ' ',
        },
        'actions': {
          'items': [
            {
              'href': '/case/123/response/general-application/345/unavailable-dates',
              'text': 'COMMON.BUTTONS.CHANGE',
              'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
            },
          ],
        },
      },
      ]);
    });

    it('returns accept offer rows - yes (ignoring other fields)', () => {
      const { response } = claimAndResponse();
      response.acceptDefendantOffer = new AcceptDefendantOffer(YesNo.YES, ProposedPaymentPlanOption.ACCEPT_INSTALMENTS, '500', 'reason');

      expect(getSummarySections('123', '345', response, 'en')).toEqual([{
        key: { text: 'PAGES.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.TITLE' },
        value: { html: 'COMMON.VARIATION_2.YES' },
        actions: {
          items: [{
            href: '/case/123/response/general-application/345/accept-defendant-offer',
            text: 'COMMON.BUTTONS.CHANGE',
            visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.TITLE',
          }],
        },
      },
      {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
        },
        'value': {
          'html': ' ',
        },
        'actions': {
          'items': [
            {
              'href': '/case/123/response/general-application/345/unavailable-dates',
              'text': 'COMMON.BUTTONS.CHANGE',
              'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
            },
          ],
        },
      },
      ]);
    });

    it('returns accept offer rows - no - installments', () => {
      const { response } = claimAndResponse();
      response.acceptDefendantOffer = new AcceptDefendantOffer(YesNo.NO, ProposedPaymentPlanOption.ACCEPT_INSTALMENTS, '500.05', 'Reason Proposed Instalments');

      const expectedPaymentHtml = '<ul class="no-list-style">'
        + '<li class="govuk-summary-list__key">PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PROPOSED_INSTALMENTS</li>'
        + '<li>£500.05</li>'
        + '<li class="govuk-summary-list__key">PAGES.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.WHY_NOT_ACCEPT</li>'
        + '<li>Reason Proposed Instalments</li>'
        + '</ul>';
      expect(getSummarySections('123', '345', response, 'en')).toEqual([{
        key: { text: 'PAGES.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.TITLE' },
        value: { html: 'COMMON.VARIATION_2.NO' },
        actions: {
          items: [{
            href: '/case/123/response/general-application/345/accept-defendant-offer',
            text: 'COMMON.BUTTONS.CHANGE',
            visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.TITLE',
          }],
        },
      },
      {
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PROPOSED_PAYMENT_PLAN' },
        value: { html: expectedPaymentHtml },
        actions: {
          items: [{
            href: '/case/123/response/general-application/345/accept-defendant-offer',
            text: 'COMMON.BUTTONS.CHANGE',
            visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PROPOSED_PAYMENT_PLAN',
          }],
        },
      },
      {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
        },
        'value': {
          'html': ' ',
        },
        'actions': {
          'items': [
            {
              'href': '/case/123/response/general-application/345/unavailable-dates',
              'text': 'COMMON.BUTTONS.CHANGE',
              'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
            },
          ],
        },
      },
      ]);
    });

    it('returns accept offer rows - no - set date', () => {
      const { response } = claimAndResponse();
      response.acceptDefendantOffer = Object.assign(new AcceptDefendantOffer(), {
        option: YesNo.NO,
        type: ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE,
        proposedSetDate: new Date('2024-02-29'),
        reasonProposedSetDate: 'reason for set day proposal',
      } as AcceptDefendantOffer);

      const expectedPaymentHtml = '<ul class="no-list-style">'
        + '<li class="govuk-summary-list__key">PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PROPOSED_SET_DATE</li>'
        + '<li>29/02/2024</li>'
        + '<li class="govuk-summary-list__key">PAGES.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.WHY_NOT_ACCEPT</li>'
        + '<li>reason for set day proposal</li>'
        + '</ul>';
      const responseData = getSummarySections('123', '345', response, 'en');
      expect(responseData).toEqual([{
        key: { text: 'PAGES.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.TITLE' },
        value: { html: 'COMMON.VARIATION_2.NO' },
        actions: {
          items: [{
            href: '/case/123/response/general-application/345/accept-defendant-offer',
            text: 'COMMON.BUTTONS.CHANGE',
            visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.TITLE',
          }],
        },
      },
      {
        key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PROPOSED_PAYMENT_PLAN' },
        value: { html: expectedPaymentHtml },
        actions: {
          items: [{
            href: '/case/123/response/general-application/345/accept-defendant-offer',
            text: 'COMMON.BUTTONS.CHANGE',
            visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PROPOSED_PAYMENT_PLAN',
          }],
        },
      },
      {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
        },
        'value': {
          'html': ' ',
        },
        'actions': {
          'items': [
            {
              'href': '/case/123/response/general-application/345/unavailable-dates',
              'text': 'COMMON.BUTTONS.CHANGE',
              'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
            },
          ],
        },
      },
      ]);
    });

    it('returns respondent agreement rows', () => {
      const { response } = claimAndResponse();
      response.respondentAgreement = new RespondentAgreement(YesNo.YES);

      expect(getSummarySections('123', '345', response, 'en')).toEqual([{
        key: { text: 'PAGES.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.TITLE' },
        value: { html: 'COMMON.VARIATION_2.YES' },
        actions: {
          items: [{
            href: '/case/123/response/general-application/345/respondent-agreement',
            text: 'COMMON.BUTTONS.CHANGE',
            visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.TITLE',
          }],
        },
      },
      {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
        },
        'value': {
          'html': ' ',
        },
        'actions': {
          'items': [
            {
              'href': '/case/123/response/general-application/345/unavailable-dates',
              'text': 'COMMON.BUTTONS.CHANGE',
              'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
            },
          ],
        },
      },
      ]);
    });

    it('returns respondent agreement rows - disagree', () => {
      const { response } = claimAndResponse();
      response.respondentAgreement = new RespondentAgreement(YesNo.NO, 'reason for disagreement');

      expect(getSummarySections('123', '345', response, 'en')).toEqual(
        [{
          key: { text: 'PAGES.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.TITLE' },
          value: { html: 'COMMON.VARIATION_2.NO<br/>reason for disagreement' },
          actions: {
            items: [{
              href: '/case/123/response/general-application/345/respondent-agreement',
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.TITLE',
            }],
          },
        },
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
          },
          'value': {
            'html': ' ',
          },
          'actions': {
            'items': [
              {
                'href': '/case/123/response/general-application/345/unavailable-dates',
                'text': 'COMMON.BUTTONS.CHANGE',
                'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
              },
            ],
          },
        },
        ],
      );
    });

    it('returns hearing arrangement sections', () => {
      const { response } = claimAndResponse();
      response.hearingArrangement = new HearingArrangement(HearingTypeOptions.TELEPHONE, 'I prefer phone',
        "Barnet Civil and Family Centre - St Mary's Court, Regents Park Road - N3 1BQ");

      const href = '/case/123/response/general-application/345/hearing-arrangement';
      expect(getSummarySections('123', '345', response, 'en')).toEqual([
        {
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE' },
          value: { html: 'PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE.TELEPHONE' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE',
            }],
          },
        },
        {
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER' },
          value: { html: 'I prefer phone' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER',
            }],
          },
        },
        {
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PREFERRED_LOCATION' },
          value: { html: 'Barnet Civil and Family Centre' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PREFERRED_LOCATION',
            }],
          },
        },
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
          },
          'value': {
            'html': ' ',
          },
          'actions': {
            'items': [
              {
                'href': '/case/123/response/general-application/345/unavailable-dates',
                'text': 'COMMON.BUTTONS.CHANGE',
                'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
              },
            ],
          },
        },
      ]);
    });

    it('returns agree to order rows', () => {
      const { response } = claimAndResponse();
      response.agreeToOrder = (YesNo.YES);

      expect(getSummarySections('123', '345', response, 'en')).toEqual(
        [{
          key: { text: 'PAGES.GENERAL_APPLICATION.AGREE_TO_ORDER.TITLE' },
          value: { html: 'COMMON.VARIATION_4.YES' },
          actions: {
            items: [{
              href: '/case/123/response/general-application/345/agree-to-order',
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.AGREE_TO_ORDER.TITLE',
            }],
          },
        },
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
          },
          'value': {
            'html': ' ',
          },
          'actions': {
            'items': [
              {
                'href': '/case/123/response/general-application/345/unavailable-dates',
                'text': 'COMMON.BUTTONS.CHANGE',
                'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
              },
            ],
          },
        },
        ]);
    });

    it('returns hearing arrangement sections - no location', () => {
      const { response } = claimAndResponse();
      response.hearingArrangement = new HearingArrangement(HearingTypeOptions.TELEPHONE, 'I prefer phone');

      const href = '/case/123/response/general-application/345/hearing-arrangement';
      expect(getSummarySections('123', '345', response, 'en')).toEqual([
        {
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE' },
          value: { html: 'PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE.TELEPHONE' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE',
            }],
          },
        },
        {
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER' },
          value: { html: 'I prefer phone' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER',
            }],
          },
        },
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
          },
          'value': {
            'html': ' ',
          },
          'actions': {
            'items': [
              {
                'href': '/case/123/response/general-application/345/unavailable-dates',
                'text': 'COMMON.BUTTONS.CHANGE',
                'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
              },
            ],
          },
        },
      ]);
    });

    it('return upload document details', () => {
      const {response} = claimAndResponse();
      const html = '<p class="govuk-border-colour-border-bottom-1 govuk-!-padding-bottom-2 govuk-!-margin-top-0">COMMON.VARIATION_2.YES</p><ul class="no-list-style"><li>abc</li></ul>';
      response.wantToUploadDocuments = YesNo.YES;
      const uploadedFiles = new UploadGAFiles();
      uploadedFiles.caseDocument = {
        documentLink: {
          document_url: 'abc.com',
          document_filename: 'abc',
          document_binary_url: '1234',
        },
        documentName: 'abc',
      } as CaseDocument;
      response.uploadEvidenceDocuments = [uploadedFiles];
      expect(getSummarySections('123', '345', response, 'en')).toEqual([
        {
          'actions': {
            'items': [
              {
                'href': '/case/123/response/general-application/345/want-to-upload-document',
                'text': 'COMMON.BUTTONS.CHANGE',
                'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.UPLOAD_DOCUMENTS_RESPONSE',
              },
            ],
          },
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.UPLOAD_DOCUMENTS_RESPONSE',
          },
          'value': {
            'html': html,
          },
        },
        {
          'actions': {
            'items': [
              {
                'href': '/case/123/response/general-application/345/unavailable-dates',
                'text': 'COMMON.BUTTONS.CHANGE',
                'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
              },
            ],
          },
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
          },
          'value': {
            'html': ' ',
          },
        },
      ]);
    });

    it('return upload document empty', () => {
      const {response} = claimAndResponse();
      response.wantToUploadDocuments = YesNo.NO;
      expect(getSummarySections('123', '345', response, 'en')[0].value.html).toContain('COMMON.VARIATION_2.NO');
    });

    it('returns hearing contact details', () => {
      const { response } = claimAndResponse();
      response.hearingContactDetails = new HearingContactDetails('077070707', 'email@addre.ss');

      const href = '/case/123/response/general-application/345/hearing-contact-details';
      expect(getSummarySections('123', '345', response, 'en')).toEqual([
        {
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_TELEPHONE' },
          value: { html: '077070707' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_TELEPHONE',
            }],
          },
        },
        {
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_EMAIL' },
          value: { html: 'email@addre.ss' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_EMAIL',
            }],
          },
        },
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
          },
          'value': {
            'html': ' ',
          },
          'actions': {
            'items': [
              {
                'href': '/case/123/response/general-application/345/unavailable-dates',
                'text': 'COMMON.BUTTONS.CHANGE',
                'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
              },
            ],
          },
        },
      ]);
    });

    it('returns unavailable dates - simple date', () => {
      const { response } = claimAndResponse();
      response.unavailableDatesHearing = new UnavailableDatesGaHearing(
        [unavailableHearingDate(UnavailableDateType.SINGLE_DATE, '2024-01-01')]);

      const href = '/case/123/response/general-application/345/unavailable-dates';
      expect(getSummarySections('123', '345', response, 'en')).toEqual([
        {
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES' },
          value: { html: '<ul class="no-list-style"><li>1 January 2024</li></ul>' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
            }],
          },
        },
      ]);
    });

    it('returns unavailable dates - longer period', () => {
      const { response } = claimAndResponse();
      response.unavailableDatesHearing = new UnavailableDatesGaHearing(
        [unavailableHearingDate(UnavailableDateType.LONGER_PERIOD, '2024-01-01', '2024-02-29')]);

      const href = '/case/123/response/general-application/345/unavailable-dates';
      expect(getSummarySections('123', '345', response, 'en')).toEqual([
        {
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES' },
          value: { html: '<ul class="no-list-style"><li>1 January 2024 - 29 February 2024</li></ul>' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
            }],
          },
        },
      ]);
    });

    it('returns unavailable dates - several', () => {
      const { response } = claimAndResponse();
      response.unavailableDatesHearing = new UnavailableDatesGaHearing(
        [unavailableHearingDate(UnavailableDateType.LONGER_PERIOD, '2024-01-01', '2024-02-29'),
          unavailableHearingDate(UnavailableDateType.SINGLE_DATE, '2024-03-01'),
          unavailableHearingDate(UnavailableDateType.LONGER_PERIOD, '2024-05-01', '2024-06-01'),
        ]);

      const href = '/case/123/response/general-application/345/unavailable-dates';
      expect(getSummarySections('123', '345', response, 'en')).toEqual([
        {
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES' },
          value: { html: '<ul class="no-list-style"><li>1 January 2024 - 29 February 2024</li><li>1 March 2024</li><li>1 May 2024 - 1 June 2024</li></ul>' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
            }],
          },
        },
      ]);
    });

    it('returns unavailable dates - empty list', () => {
      const { response } = claimAndResponse();
      response.unavailableDatesHearing = new UnavailableDatesGaHearing([]);

      expect(getSummarySections('123', '345', response, 'en')).toEqual([{
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
        },
        'value': {
          'html': ' ',
        },
        'actions': {
          'items': [
            {
              'href': '/case/123/response/general-application/345/unavailable-dates',
              'text': 'COMMON.BUTTONS.CHANGE',
              'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
            },
          ],
        },
      }]);
    });

    it('returns selected support options - one', () => {
      const { response } = claimAndResponse();
      response.hearingSupport = new HearingSupport([SupportType.STEP_FREE_ACCESS]);

      expect(getSummarySections('123', '345', response, 'en')).toEqual([
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
          },
          'value': {
            'html': ' ',
          },
          'actions': {
            'items': [
              {
                'href': '/case/123/response/general-application/345/unavailable-dates',
                'text': 'COMMON.BUTTONS.CHANGE',
                'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
              },
            ],
          },
        }, {
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS' },
          value: { html: '<ul class="no-list-style"><li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.STEP_FREE_ACCESS</li></ul>' },
          actions: {
            items: [{
              href: '/case/123/response/general-application/345/hearing-support',
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
            }],
          },
        },
      ]);
    });

    it('returns selected support options - several', () => {
      const { response } = claimAndResponse();
      response.hearingSupport = new HearingSupport([SupportType.HEARING_LOOP, SupportType.LANGUAGE_INTERPRETER, SupportType.OTHER_SUPPORT, SupportType.SIGN_LANGUAGE_INTERPRETER], 'reason A', 'reason B', 'reason C');

      expect(getSummarySections('123', '345', response, 'en')).toEqual([
        {
          'key': {
            'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
          },
          'value': {
            'html': ' ',
          },
          'actions': {
            'items': [
              {
                'href': '/case/123/response/general-application/345/unavailable-dates',
                'text': 'COMMON.BUTTONS.CHANGE',
                'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
              },
            ],
          },
        },
        {
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS' },
          value: {
            html: '<ul class="no-list-style">'
              + '<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.HEARING_LOOP</li>'
              + "<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.SIGN_LANGUAGE_INTERPRETER - 'reason A'</li>"
              + "<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.LANGUAGE_INTERPRETER - 'reason B'</li>"
              + "<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.OTHER - 'reason C'</li>"
              + '</ul>',
          },
          actions: {
            items: [{
              href: '/case/123/response/general-application/345/hearing-support',
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
            }],
          },
        },
      ]);
    });

    it('returns selected support options - none', () => {
      const { response } = claimAndResponse();
      response.hearingSupport = new HearingSupport([]);
      expect(getSummarySections('123', '345', response, 'en')).toEqual([{
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
        },
        'value': {
          'html': ' ',
        },
        'actions': {
          'items': [
            {
              'href': '/case/123/response/general-application/345/unavailable-dates',
              'text': 'COMMON.BUTTONS.CHANGE',
              'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
            },
          ],
        },
      }, {
        'key': {
          'text': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
        },
        'value': {
          'html': 'COMMON.VARIATION.NO',
        },
        'actions': {
          'items': [
            {
              'href': '/case/123/response/general-application/345/hearing-support',
              'text': 'COMMON.BUTTONS.CHANGE',
              'visuallyHiddenText': 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
            },
          ],
        },
      }]);
    });

  });
});
