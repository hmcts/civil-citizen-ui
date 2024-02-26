import {
  getExpertReportDetails,
  getExpertReportDetailsForm,
} from '../../../../../main/services/features/directionsQuestionnaire/expertReportDetailsService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {
  ExpertReportDetails,
} from '../../../../../main/common/models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
import {
  ReportDetail,
} from '../../../../../main/common/models/directionsQuestionnaire/experts/expertReportDetails/reportDetail';
import {Claim} from '../../../../../main/common/models/claim';
import {GenericForm} from '../../../../../main/common/form/models/genericForm';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import CivilClaimResponseMock from '../../../../utils/mocks/civilClaimResponseMock.json';
import {
  saveDirectionQuestionnaire,
} from '../../../../../main/services/features/directionsQuestionnaire/directionQuestionnaireService';
import {DirectionQuestionnaire} from '../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {Experts} from '../../../../../main/common/models/directionsQuestionnaire/experts/experts';
import {CaseState} from 'common/form/models/claimDetails';
import {ClaimantResponse} from 'models/claimantResponse';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Expert Report Details service', () => {
  describe('Serialisation', () => {
    const mockReportDetails = [{
      expertName: 'John Doe',
      day: '1',
      month: '1',
      year: '2022',
    }];
    it('should set option to yes when "yes" option is selected', async () => {
      //Given
      const value = {
        option: YesNo.YES,
        reportDetails: mockReportDetails,
      };
      //When
      const expertReportDetails = getExpertReportDetailsForm(value.option, value.reportDetails);
      //Then
      if (expertReportDetails.reportDetails) {
        expect(expertReportDetails.option).toBe('yes');
        expect(expertReportDetails.reportDetails[0].expertName).toBe('John Doe');
        expect(expertReportDetails.reportDetails[0].reportDate?.toDateString()).toBe('Sat Jan 01 2022');
      }
    });
    it('should set option to no and remove existing reportDetails when "no" option is selected', async () => {
      //Given
      const value = {
        option: YesNo.NO,
        reportDetails: mockReportDetails,
      };
      //When
      const expertReportDetails = getExpertReportDetailsForm(value.option, value.reportDetails);
      //Then
      expect(expertReportDetails.option).toBe('no');
      expect(expertReportDetails?.reportDetails).toBeUndefined();
    });
    it('should set option to undefined when no option is selected', async () => {
      //When
      const expertReportDetails = getExpertReportDetailsForm(undefined, undefined);
      //Then
      expect(expertReportDetails.option).toBeUndefined();
    });
  });

  describe('Validation', () => {
    it('should raise select yes/no option error if option is unspecified', async () => {
      //Given
      const expertReportDetails = new ExpertReportDetails(undefined);
      const form = new GenericForm(expertReportDetails);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.errorFor('option')).toBe('ERRORS.VALID_YES_NO_SELECTION');
      expect(form.errorFor('reportDetails')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][expertName]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][reportDate]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][year]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][month]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][day]')).toBeUndefined();
    });
    it('should not raise any error if option is "no" and reportDetails unspecified', async () => {
      //Given
      const expertReportDetails = new ExpertReportDetails(YesNo.NO, undefined);
      const form = new GenericForm(expertReportDetails);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(0);
    });
    it('should raise at least error if option "yes" and reportDetails are empty', async () => {
      //Given
      const expertReportDetails = new ExpertReportDetails(YesNo.YES, []);
      const form = new GenericForm(expertReportDetails);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.errorFor('option')).toBeUndefined();
      expect(form.errorFor('reportDetails')).toBe('ERRORS.ENTER_AT_LEAST_ONE_REPORT');
      expect(form.errorFor('reportDetails[0][expertName]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][reportDate]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][year]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][month]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][day]')).toBeUndefined();
    });
    it('should raise enter a date error if option "yes" and expert name is provided but no date input', async () => {
      //Given
      const reportDetails = [
        new ReportDetail('John Doe'),
      ];
      const expertReportDetails = new ExpertReportDetails(YesNo.YES, reportDetails);
      const form = new GenericForm(expertReportDetails);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('option')).toBeUndefined();
      expect(form.errorFor('reportDetails')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][expertName]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][reportDate]')).toBe('ERRORS.DATE_REQUIRED');
      expect(form.errorFor('reportDetails[0][year]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][month]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][day]')).toBeUndefined();
    });
    it('should raise enter expert\'s name error if option "yes" and no input for name field ', async () => {
      //Given
      const reportDetails = [
        new ReportDetail(undefined, '2022', '1', '1'),
      ];
      const expertReportDetails = new ExpertReportDetails(YesNo.YES, reportDetails);
      const form = new GenericForm(expertReportDetails);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('option')).toBeUndefined();
      expect(form.errorFor('reportDetails')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][expertName]')).toBe('ERRORS.EXPERT_NAME_REQUIRED');
      expect(form.errorFor('reportDetails[0][reportDate]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][year]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][month]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][day]')).toBeUndefined();
    });
    it('should raise Enter a valid day error if option "yes" and no input for day field ', async () => {
      //Given
      const reportDetails = [
        new ReportDetail('John Doe', '2022', '1', undefined),
      ];
      const expertReportDetails = new ExpertReportDetails(YesNo.YES, reportDetails);
      const form = new GenericForm(expertReportDetails);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('option')).toBeUndefined();
      expect(form.errorFor('reportDetails')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][expertName]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][reportDate]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][year]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][month]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][day]')).toBe('ERRORS.VALID_DAY');
    });
    it('should raise Enter a valid day error if option "yes" and invalid input for day field ', async () => {
      //Given
      const reportDetails = [
        new ReportDetail('John Doe', '2022', '1', '32'),
      ];
      const expertReportDetails = new ExpertReportDetails(YesNo.YES, reportDetails);
      const form = new GenericForm(expertReportDetails);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('option')).toBeUndefined();
      expect(form.errorFor('reportDetails')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][expertName]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][reportDate]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][year]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][month]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][day]')).toBe('ERRORS.VALID_DAY');
    });
    it('should raise Enter a valid month error if option "yes" and no input for month field ', async () => {
      //Given
      const reportDetails = [
        new ReportDetail('John Doe', '2022', undefined, '1'),
      ];
      const expertReportDetails = new ExpertReportDetails(YesNo.YES, reportDetails);
      const form = new GenericForm(expertReportDetails);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('option')).toBeUndefined();
      expect(form.errorFor('reportDetails')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][expertName]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][reportDate]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][year]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][month]')).toBe('ERRORS.VALID_MONTH');
      expect(form.errorFor('reportDetails[0][day]')).toBeUndefined();
    });
    it('should raise Enter a valid month error if option "yes" and invalid input for month field ', async () => {
      //Given
      const reportDetails = [
        new ReportDetail('John Doe', '2022', '13', '1'),
      ];
      const expertReportDetails = new ExpertReportDetails(YesNo.YES, reportDetails);
      const form = new GenericForm(expertReportDetails);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('option')).toBeUndefined();
      expect(form.errorFor('reportDetails')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][expertName]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][reportDate]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][year]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][month]')).toBe('ERRORS.VALID_MONTH');
      expect(form.errorFor('reportDetails[0][day]')).toBeUndefined();
    });
    it('should raise Enter a valid year error if option "yes" and no input for year field ', async () => {
      //Given
      const reportDetails = [
        new ReportDetail('John Doe', undefined, '1', '1'),
      ];
      const expertReportDetails = new ExpertReportDetails(YesNo.YES, reportDetails);
      const form = new GenericForm(expertReportDetails);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('option')).toBeUndefined();
      expect(form.errorFor('reportDetails')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][expertName]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][reportDate]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][year]')).toBe('ERRORS.VALID_YEAR');
      expect(form.errorFor('reportDetails[0][month]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][day]')).toBeUndefined();
    });
    it('should raise Enter 4 digit year error if option "yes" and less than 4 digit for year field', async () => {
      //Given
      const reportDetails = [
        new ReportDetail('John Doe', '222', '1', '1'),
      ];
      const expertReportDetails = new ExpertReportDetails(YesNo.YES, reportDetails);
      const form = new GenericForm(expertReportDetails);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('option')).toBeUndefined();
      expect(form.errorFor('reportDetails')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][expertName]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][reportDate]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][year]')).toBe('ERRORS.VALID_FOUR_DIGIT_YEAR');
      expect(form.errorFor('reportDetails[0][month]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][day]')).toBeUndefined();
    });
    it('should raise future date error if option "yes" and future date for year field', async () => {
      //Given
      const reportDetails = [
        new ReportDetail('John Doe', '3023', '1', '1'),
      ];
      const expertReportDetails = new ExpertReportDetails(YesNo.YES, reportDetails);
      const form = new GenericForm(expertReportDetails);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('option')).toBeUndefined();
      expect(form.errorFor('reportDetails')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][expertName]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][reportDate]')).toBe('ERRORS.CORRECT_DATE_NOT_IN_FUTURE');
      expect(form.errorFor('reportDetails[0][year]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][month]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][day]')).toBeUndefined();
    });
    it('should not raise any error if option "yes" and valid expert report details provided', async () => {
      //Given
      const reportDetails = [
        new ReportDetail('John Doe', '2022', '1', '1'),
      ];
      const expertReportDetails = new ExpertReportDetails(YesNo.YES, reportDetails);
      const form = new GenericForm(expertReportDetails);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('option')).toBeUndefined();
      expect(form.errorFor('reportDetails')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][expertName]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][reportDate]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][year]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][month]')).toBeUndefined();
      expect(form.errorFor('reportDetails[0][day]')).toBeUndefined();
    });
  });

  describe('Remove Empty Expert Report details ', () => {
    it('should remove empty expert report details from submitted form', async () => {
      //Given
      const reportDetail: ReportDetail = new ReportDetail('John Doe', '2022', '1', '1');
      const emptyReportDetail: ReportDetail = new ReportDetail(undefined, '', '', '');
      const reportDetails = [
        emptyReportDetail,
        reportDetail,
        emptyReportDetail,
      ];
      const expertReportDetails = new ExpertReportDetails(YesNo.YES, reportDetails);
      //When
      const filteredExpertReportDetails = ExpertReportDetails.removeEmptyReportDetails(expertReportDetails);
      //Then
      if (filteredExpertReportDetails.reportDetails) {
        expect(filteredExpertReportDetails.reportDetails.length).toBe(1);
        expect(filteredExpertReportDetails.reportDetails[0].expertName).toBe('John Doe');
        expect(filteredExpertReportDetails.reportDetails[0].reportDate?.toDateString()).toBe('Sat Jan 01 2022');
      }
    });
  });

  describe('Get Expert Report Details', () => {
    it('should return expert report details from draft store if present', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return Object.assign(new Claim, CivilClaimResponseMock.case_data);
      });
      //When
      const expertReportDetails = await getExpertReportDetails('1234');
      //Then
      if (expertReportDetails.reportDetails) {
        expect(expertReportDetails).toBeTruthy();
        expect(expertReportDetails.reportDetails.length).toBe(1);
        expect(expertReportDetails.option).toBe('yes');
        expect(expertReportDetails.reportDetails[0]?.expertName).toEqual('John Doe');
        expect(expertReportDetails.reportDetails[0].reportDate?.toDateString()).toEqual('Tue Mar 01 2022');
        expect(expertReportDetails.reportDetails[0].year).toBe(2022);
        expect(expertReportDetails.reportDetails[0].month).toBe(3);
        expect(expertReportDetails.reportDetails[0].day).toBe(1);
      }
    });
    it('should return claimant expert report details from draft store if present', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const reportDetail = new ReportDetail('John Doe', '2022', '1', '1');
        const mockDetails = new ExpertReportDetails(YesNo.YES, [reportDetail]);
        const mockDQ = {
          experts: {
            expertReportDetails: mockDetails,
          },
        };
        const claim = new Claim();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        claim.claimantResponse = <ClaimantResponse>{directionQuestionnaire : mockDQ};
        return claim;
      });
      //When
      const expertReportDetails = await getExpertReportDetails('1234');
      //Then
      if (expertReportDetails.reportDetails) {
        expect(expertReportDetails).toBeTruthy();
        expect(expertReportDetails.reportDetails.length).toBe(1);
        expect(expertReportDetails.option).toBe('yes');
        expect(expertReportDetails.reportDetails[0]?.expertName).toEqual('John Doe');
        expect(expertReportDetails.reportDetails[0].reportDate?.toDateString()).toEqual('Sat Jan 01 2022');
        expect(expertReportDetails.reportDetails[0].year).toBe(2022);
        expect(expertReportDetails.reportDetails[0].month).toBe(1);
        expect(expertReportDetails.reportDetails[0].day).toBe(1);
      }
    });
    it('should return new form when claimant DQ is empty', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        return claim;
      });
      //When
      const expertReportDetails = await getExpertReportDetails('1234');
      //Then
      expect(expertReportDetails).toBeTruthy();
      expect(expertReportDetails.option).toBeUndefined();
      expect(expertReportDetails.reportDetails).toBeUndefined();
    });
    it('should return new form when defendant DQ is empty', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const expertReportDetails = await getExpertReportDetails('1234');
      //Then
      expect(expertReportDetails).toBeTruthy();
      expect(expertReportDetails.option).toBeUndefined();
      expect(expertReportDetails.reportDetails).toBeUndefined();
    });
    it('should return new form when option is empty', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return createClaimWithExpertReportDetails();
      });
      //When
      const expertReportDetails = await getExpertReportDetails('1234');
      //Then
      expect(expertReportDetails).toBeTruthy();
      expect(expertReportDetails.option).toBeUndefined();
      expect(expertReportDetails.reportDetails).toEqual([]);
    });
    it('should return new form when option is undefined', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const expertReportDetails = await getExpertReportDetails('1234');
      //Then
      expect(expertReportDetails).toBeTruthy();
      expect(expertReportDetails.option).toBeUndefined();
      expect(expertReportDetails.reportDetails).toBeUndefined();
    });
    it('should throw an error when error is thrown from draft store', async () => {
      //When
      mockGetCaseDataFromStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getExpertReportDetails('1234')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Save Expert Report Details', () => {
    it('should save expert report details successfully with existing claim', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.experts = new Experts();
        return claim;
      });
      const expertReportDetails = new ExpertReportDetails(YesNo.NO, []);
      //When
      await saveDirectionQuestionnaire('1234', expertReportDetails, 'expertReportDetails', 'experts');
      //Then
      expect(spySave).toBeCalled();
    });
    it('should throw error when draft store throws error', async () => {
      //Given
      const expertReportDetails = new ExpertReportDetails(YesNo.NO, []);
      //When
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then

      await expect(saveDirectionQuestionnaire('1234', expertReportDetails, 'expertReportDetails', 'experts')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});

function createClaimWithExpertReportDetails(): Claim {
  const claim = new Claim();
  const mockDetails = new ExpertReportDetails(undefined, []);
  claim.directionQuestionnaire = <DirectionQuestionnaire>{
    experts: {
      expertReportDetails: mockDetails,
    },
  };
  return claim;
}
