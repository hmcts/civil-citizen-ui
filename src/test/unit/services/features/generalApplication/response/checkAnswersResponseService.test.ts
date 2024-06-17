import { YesNo } from 'common/form/models/yesNo';
import { Claim } from 'common/models/claim';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { HearingArrangement, HearingTypeOptions } from 'common/models/generalApplication/hearingArrangement';
import { HearingContactDetails } from 'common/models/generalApplication/hearingContactDetails';
import { HearingSupport, SupportType } from 'common/models/generalApplication/hearingSupport';
import { GaResponse } from 'common/models/generalApplication/response/gaResponse';
import { RespondentAgreement } from 'common/models/generalApplication/response/respondentAgreement';
import { UnavailableDatePeriodGaHearing, UnavailableDateType, UnavailableDatesGaHearing } from 'common/models/generalApplication/unavailableDatesGaHearing';
import { getSummarySections } from 'services/features/generalApplication/response/checkAnswersResponseService';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const claimAndResponse = () => {
  const claim = new Claim();
  claim.generalApplication = new GeneralApplication();
  const response = new GaResponse();
  claim.generalApplication.response = response;
  return {claim, response};
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
      expect(getSummarySections('123', new Claim(), 'en')).toEqual([]);
    });

    it('returns no sections when general application is empty', () => {
      const {claim} = claimAndResponse();
      expect(getSummarySections('123', claim, 'en')).toEqual([]);
    });

    it('returns respondent agreement rows', () => {
      const {claim, response} = claimAndResponse();
      response.respondentAgreement = new RespondentAgreement(YesNo.YES);
      
      expect(getSummarySections('123', claim, 'en')).toEqual([{ 
        key: { text: 'PAGES.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.TITLE'}, 
        value: { html: 'COMMON.VARIATION.YES' },
        actions: {
          items: [{
            href: '/case/123/response/general-application/respondent-agreement',
            text: 'COMMON.BUTTONS.CHANGE',
            visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.TITLE',
          }],
        }},
      ]);
    });

    it('returns hearing arrangement sections', () => {
      const {claim, response} = claimAndResponse();
      response.hearingArrangement = new HearingArrangement(HearingTypeOptions.TELEPHONE, 'I prefer phone', 
        "Barnet Civil and Family Centre - St Mary's Court, Regents Park Road - N3 1BQ");

      const href = '/case/123/response/general-application/hearing-arrangement';
      expect(getSummarySections('123', claim, 'en')).toEqual([
        { 
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE'}, 
          value: { html: 'PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE.TELEPHONE' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE',
            }],
          }},
        { 
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER'}, 
          value: { html: 'I prefer phone' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER',
            }],
          }},
        { 
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PREFERRED_LOCATION'}, 
          value: { html: 'Barnet Civil and Family Centre' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PREFERRED_LOCATION',
            }],
          }},
      ]);
    });

    it('returns hearing arrangement sections - no location', () => {
      const {claim, response} = claimAndResponse();
      response.hearingArrangement = new HearingArrangement(HearingTypeOptions.TELEPHONE, 'I prefer phone');

      const href = '/case/123/response/general-application/hearing-arrangement';
      expect(getSummarySections('123', claim, 'en')).toEqual([
        { 
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE'}, 
          value: { html: 'PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE.TELEPHONE' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE',
            }],
          }},
        { 
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER'}, 
          value: { html: 'I prefer phone' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER',
            }],
          }},
      ]);
    });

    it('returns hearing contact details', () => {
      const {claim, response} = claimAndResponse();
      response.hearingContactDetails = new HearingContactDetails('077070707', 'email@addre.ss');

      const href = '/case/123/response/general-application/hearing-contact-details';
      expect(getSummarySections('123', claim, 'en')).toEqual([
        { 
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_TELEPHONE'}, 
          value: { html: '077070707' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_TELEPHONE',
            }],
          }},
        { 
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_EMAIL'}, 
          value: { html: 'email@addre.ss' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_EMAIL',
            }],
          }},
      ]);
    });

    it('returns unavailable dates - simple date', () => {
      const {claim, response} = claimAndResponse();
      response.unavailableDatesHearing = new UnavailableDatesGaHearing(
        [unavailableHearingDate(UnavailableDateType.SINGLE_DATE, '2024-01-01')]);

      const href = '/case/123/response/general-application/unavailable-dates';
      expect(getSummarySections('123', claim, 'en')).toEqual([
        { 
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES'}, 
          value: { html: '<ul class="no-list-style"><li>1 January 2024</li></ul>' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
            }],
          }},
      ]);
    });

    it('returns unavailable dates - longer period', () => {
      const {claim, response} = claimAndResponse();
      response.unavailableDatesHearing = new UnavailableDatesGaHearing(
        [unavailableHearingDate(UnavailableDateType.LONGER_PERIOD, '2024-01-01', '2024-02-29')]);

      const href = '/case/123/response/general-application/unavailable-dates';
      expect(getSummarySections('123', claim, 'en')).toEqual([
        { 
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES'}, 
          value: { html: '<ul class="no-list-style"><li>1 January 2024 - 29 February 2024</li></ul>' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
            }],
          }},
      ]);
    });

    it('returns unavailable dates - several', () => {
      const {claim, response} = claimAndResponse();
      response.unavailableDatesHearing = new UnavailableDatesGaHearing(
        [unavailableHearingDate(UnavailableDateType.LONGER_PERIOD, '2024-01-01', '2024-02-29'),
          unavailableHearingDate(UnavailableDateType.SINGLE_DATE, '2024-03-01'),
          unavailableHearingDate(UnavailableDateType.LONGER_PERIOD, '2024-05-01', '2024-06-01'),
        ]);

      const href = '/case/123/response/general-application/unavailable-dates';
      expect(getSummarySections('123', claim, 'en')).toEqual([
        { 
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES'}, 
          value: { html: '<ul class="no-list-style"><li>1 January 2024 - 29 February 2024</li><li>1 March 2024</li><li>1 May 2024 - 1 June 2024</li></ul>' },
          actions: {
            items: [{
              href,
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
            }],
          }},
      ]);
    });

    it('returns unavailable dates - empty list', () => {
      const {claim, response} = claimAndResponse();
      response.unavailableDatesHearing = new UnavailableDatesGaHearing([]);

      expect(getSummarySections('123', claim, 'en')).toEqual([]);
    });

    it('returns selected support options - one', () => {
      const {claim, response} = claimAndResponse();
      response.hearingSupport = new HearingSupport([SupportType.STEP_FREE_ACCESS]);

      expect(getSummarySections('123', claim, 'en')).toEqual([
        { 
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS'}, 
          value: { html: '<ul class="no-list-style"><li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.STEP_FREE_ACCESS</li></ul>' },
          actions: {
            items: [{
              href: '/case/123/response/general-application/hearing-support',
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
            }],
          }},
      ]);
    });

    it('returns selected support options - several', () => {
      const {claim, response} = claimAndResponse();
      response.hearingSupport = new HearingSupport([SupportType.HEARING_LOOP, SupportType.LANGUAGE_INTERPRETER, SupportType.OTHER_SUPPORT, SupportType.SIGN_LANGUAGE_INTERPRETER]);

      expect(getSummarySections('123', claim, 'en')).toEqual([
        { 
          key: { text: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS'}, 
          value: { html: '<ul class="no-list-style">'
            + '<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.HEARING_LOOP</li>'
            + '<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.SIGN_LANGUAGE_INTERPRETER</li>'
            + '<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.LANGUAGE_INTERPRETER</li>'
            + '<li>PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.OTHER</li>'
            + '</ul>' },
          actions: {
            items: [{
              href: '/case/123/response/general-application/hearing-support',
              text: 'COMMON.BUTTONS.CHANGE',
              visuallyHiddenText: 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
            }],
          }},
      ]);
    });

  });
});