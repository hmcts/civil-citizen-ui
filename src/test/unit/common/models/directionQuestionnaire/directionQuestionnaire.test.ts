import {YesNo} from 'common/form/models/yesNo';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {ExpertReportDetails} from 'common/models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
import {WhyUnavailableForHearing} from 'common/models/directionsQuestionnaire/hearing/whyUnavailableForHearing';
import {LanguageOptions} from 'common/models/directionsQuestionnaire/languageOptions';

describe('DirectionQuestionnaire', () => {

  describe('get expertReportDetailsAvailable', () => {
    const dq = new DirectionQuestionnaire();
    it('should return false with empty DQ object', () => {
      //When
      const result = dq.expertReportDetailsAvailable;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with empty experts object', () => {
      //Given
      dq.experts = {};
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
      dq.experts.expertReportDetails.option = YesNo.YES;
      //When
      const result = dq.expertReportDetailsAvailable;
      //Then
      expect(result).toBe(true);
    });
  });

  describe('get isUnavailabilityDatesCompleted', () => {
    const dq = new DirectionQuestionnaire();
    it('should return false with empty DQ object', () => {
      //When
      const result = dq.isUnavailabilityDatesCompleted;
      //Then
      expect(result).toBe(false);
    });
    it('should return false with empty hearing object', () => {
      //Given
      dq.hearing = {};
      //When
      const result = dq.isUnavailabilityDatesCompleted;
      //Then
      expect(result).toBe(false);
    });
    it('should return true with WhyUnavailableForHearing object', () => {
      //Given
      dq.hearing.whyUnavailableForHearing = new WhyUnavailableForHearing();
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
      dq.welshLanguageRequirements = {};
      //When
      const result = dq.isCommonDQJourneyCompleted;
      //Then
      expect(result).toBe(false);
    });

    it('should return true with all required information provided', () => {
      //Given
      dq.defendantYourselfEvidence = {option: YesNo.NO};
      dq.hearing.whyUnavailableForHearing = {reason: 'test'};
      dq.witnesses.otherWitnesses = {option: YesNo.NO};
      dq.hearing.phoneOrVideoHearing = {option: YesNo.NO};
      dq.vulnerabilityQuestions.vulnerability = {option: YesNo.NO};
      dq.hearing.supportRequiredList = {option: YesNo.NO};
      dq.hearing.specificCourtLocation = {option: YesNo.NO};
      dq.welshLanguageRequirements.language = {speakLanguage: LanguageOptions.WELSH, documentsLanguage: LanguageOptions.ENGLISH};
      //When
      const result = dq.isCommonDQJourneyCompleted;
      //Then
      expect(result).toBe(true);
    });
  });
});
