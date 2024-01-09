import {YesNo} from 'common/form/models/yesNo';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {ExpertReportDetails} from 'common/models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {Hearing} from 'common/models/directionsQuestionnaire/hearing/hearing';
import {UnavailableDateType} from 'common/models/directionsQuestionnaire/hearing/unavailableDates';
import {WhyUnavailableForHearing} from 'common/models/directionsQuestionnaire/hearing/whyUnavailableForHearing';
import {LanguageOptions} from 'common/models/directionsQuestionnaire/languageOptions';
import {VulnerabilityQuestions} from 'common/models/directionsQuestionnaire/vulnerabilityQuestions/vulnerabilityQuestions';
import {Witnesses} from 'common/models/directionsQuestionnaire/witnesses/witnesses';
import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';
import {WelshLanguageRequirements} from 'models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {ConfirmYourDetailsEvidence} from 'form/models/confirmYourDetailsEvidence';

describe('DirectionQuestionnaire', () => {
  const moreThan30DaysPeriodMockDates = {
    type: UnavailableDateType.LONGER_PERIOD,
    from: new Date('2023-05-05T00:00:00.000Z'),
    until: new Date('2023-12-30T00:00:00.000Z'),
  };

  describe('get expertReportDetailsAvailable', () => {
    let dq: DirectionQuestionnaire;
    beforeEach(() => {
      dq = new DirectionQuestionnaire();
      dq.experts = new Experts();
    });
    it('should return false with empty DQ object', () => {
      //Given
      dq.experts = undefined;
      //When
      const result = dq.expertReportDetailsAvailable;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with empty experts object', () => {
      //When
      const result = dq.expertReportDetailsAvailable;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with empty expertReportDetails object', () => {
      //Given
      dq.experts.expertReportDetails = new ExpertReportDetails();
      //When
      const result = dq.expertReportDetailsAvailable;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with option No', () => {
      //Given
      dq.experts.expertReportDetails = {option: YesNo.NO};
      //When
      const result = dq.expertReportDetailsAvailable;
      //Then
      expect(result).toBe(false);
    });

    it('should return true with option Yes', () => {
      //Given
      dq.experts.expertReportDetails = {option: YesNo.YES};
      //When
      const result = dq.expertReportDetailsAvailable;
      //Then
      expect(result).toBe(true);
    });
  });

  describe('get isUnavailabilityDatesCompleted', () => {
    let dq: DirectionQuestionnaire;
    beforeEach(() => {
      dq = new DirectionQuestionnaire();
      dq.hearing = new Hearing();
    });
    it('should return false with empty DQ object', () => {
      //Given
      dq.hearing = undefined;
      //When
      const result = dq.isUnavailabilityDatesCompleted;
      //Then
      expect(result).toBe(false);
    });
    it('should return false with empty hearing object', () => {
      //When
      const result = dq.isUnavailabilityDatesCompleted;
      //Then
      expect(result).toBe(false);
    });
    it('should return true if no option is selected for unavailability', () => {
      //Given
      dq.hearing.cantAttendHearingInNext12Months = {option: YesNo.NO};
      //When
      const result = dq.isUnavailabilityDatesCompleted;
      //Then
      expect(result).toBe(true);
    });

    it('should return false if yes option is selected but no dates provided', () => {
      //Given
      dq.hearing.cantAttendHearingInNext12Months = {option: YesNo.YES};
      //When
      const result = dq.isUnavailabilityDatesCompleted;
      //Then
      expect(result).toBe(false);
    });

    it('should return true if yes option is selected and unavailability is less than 30 days', () => {
      //Given
      dq.hearing.cantAttendHearingInNext12Months = {option: YesNo.YES};
      dq.hearing.unavailableDatesForHearing = {
        items: [
          {
            type: UnavailableDateType.SINGLE_DATE,
            from: new Date('2023-12-30T00:00:00.000Z'),
          },
        ]};
      //When
      const result = dq.isUnavailabilityDatesCompleted;
      //Then
      expect(result).toBe(true);
    });

    it('should return false if yes option is selected but no reason provided when unavailability is more than 30 days', () => {
      //Given
      dq.hearing.cantAttendHearingInNext12Months = {option: YesNo.YES};
      dq.hearing.unavailableDatesForHearing = {
        items: [moreThan30DaysPeriodMockDates],
      };
      //When
      const result = dq.isUnavailabilityDatesCompleted;
      //Then
      expect(result).toBe(false);
    });

    it('should return true with reason when unavailability is more than 30 days', () => {
      //Given
      dq.hearing.cantAttendHearingInNext12Months = {option: YesNo.YES};
      dq.hearing.unavailableDatesForHearing = {
        items: [moreThan30DaysPeriodMockDates],
      };
      dq.hearing.whyUnavailableForHearing = new WhyUnavailableForHearing('test');
      //When
      const result = dq.isUnavailabilityDatesCompleted;
      //Then
      expect(result).toBe(true);
    });
  });

  describe('get isCommonDQJourneyCompleted', () => {
    const dq = new DirectionQuestionnaire();
    it('should return false without empty DQ object', () => {
      //When
      const result = dq.isCommonDQJourneyCompleted;
      //Then
      expect(result).toBe(false);
    });

    it('should return false without otherWitnesses object', () => {
      //Given
      dq.witnesses = {};
      //When
      const result = dq.isCommonDQJourneyCompleted;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with empty hearing object', () => {
      //Given
      dq.hearing = {};
      //When
      const result = dq.isCommonDQJourneyCompleted;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with empty vulnerabilityQuestions', () => {
      //Given
      dq.vulnerabilityQuestions = {};
      //When
      const result = dq.isCommonDQJourneyCompleted;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with empty welshLanguageRequirements', () => {
      //Given
      dq.welshLanguageRequirements = <WelshLanguageRequirements>{};
      //When
      const result = dq.isCommonDQJourneyCompleted;
      //Then
      expect(result).toBe(false);
    });

    it('should return true with all required information provided', () => {
      //Given
      dq.hearing = new Hearing();
      dq.witnesses = new Witnesses();
      dq.vulnerabilityQuestions = new VulnerabilityQuestions();
      dq.welshLanguageRequirements = new WelshLanguageRequirements();
      dq.defendantYourselfEvidence = {option: YesNo.NO};
      dq.hearing.whyUnavailableForHearing = {reason: 'test'};
      dq.witnesses.otherWitnesses = {option: YesNo.NO};
      dq.hearing.phoneOrVideoHearing = {option: YesNo.NO};
      dq.vulnerabilityQuestions.vulnerability = {option: YesNo.NO};
      dq.hearing.supportRequiredList = {option: YesNo.NO};
      dq.hearing.specificCourtLocation = <SpecificCourtLocation>{option: YesNo.NO};
      dq.welshLanguageRequirements.language = {speakLanguage: LanguageOptions.WELSH, documentsLanguage: LanguageOptions.ENGLISH};
      dq.hearing.cantAttendHearingInNext12Months = {option: YesNo.YES};
      dq.hearing.unavailableDatesForHearing = {
        items: [moreThan30DaysPeriodMockDates],
      };
      dq.hearing.whyUnavailableForHearing = new WhyUnavailableForHearing('test');
      dq.confirmYourDetailsEvidence = new ConfirmYourDetailsEvidence('John', 'Doe',
        'test@test.com', 600000000, 'Doctor');
      //When
      const result = dq.isCommonDQJourneyCompleted;
      //Then
      expect(result).toBe(true);
    });
  });
});
