import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {VALID_YES_NO_OPTION} from '../../../../../main/common/form/validationErrors/errorMessageConstants';
import {
  ChildrenDisability,
} from '../../../../../main/common/form/models/statementOfMeans/dependants/childrenDisability';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {
  getChildrenDisability,
  hasDisabledChildren,
  saveChildrenDisability,
  setChildrenDisabilityServiceLogger,
  validateChildrenDisability,
} from '../../../../../main/modules/statementOfMeans/dependants/childrenDisabilityService';
import {CivilClaimResponse} from '../../../../../main/common/models/civilClaimResponse';
import {LoggerInstance} from 'winston';
import {NumberOfChildren} from '../../../../../main/common/form/models/statementOfMeans/dependants/numberOfChildren';

const civilClaimResponseMock = require('../civilClaimResponseMock.json');
const civilClaimResponse: string = JSON.stringify(civilClaimResponseMock);

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

const DRAFT_STORE_GET_ERROR = 'draft store get error';
const DRAFT_STORE_SAVE_ERROR = 'draft store save error';

const mockLogger = {
  error: jest.fn().mockImplementation((message: string) => message),
  info: jest.fn().mockImplementation((message: string) => message),
} as unknown as LoggerInstance;

describe('Children Disability service', () => {
  describe('Validation', () => {
    test('should not raise any error if YES is selected', async () => {
      //Given
      const childrenDisability = new ChildrenDisability(YesNo.YES);
      //When
      const form = validateChildrenDisability(childrenDisability);
      //Then
      expect(form.getErrors().length).toBe(0);
    });
    test('should not raise any error if NO is selected', async () => {
      //Given
      const childrenDisability = new ChildrenDisability(YesNo.NO);
      //When
      const form = validateChildrenDisability(childrenDisability);
      //Then
      expect(form.getErrors().length).toBe(0);
    });
    test('should raise an error if nothing is selected', async () => {
      //Given
      const childrenDisability = new ChildrenDisability(undefined);
      //When
      const form = validateChildrenDisability(childrenDisability);
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('option');
      expect(form.getErrors()[0].constraints).toEqual({isDefined: VALID_YES_NO_OPTION});
    });
  });
  describe('Exception Handling', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should throw error when retrieving data from draft store fails', async () => {
      //When
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(DRAFT_STORE_GET_ERROR);
      });
      setChildrenDisabilityServiceLogger(mockLogger);
      //Then
      await expect(getChildrenDisability('claimId')).rejects.toThrow(DRAFT_STORE_GET_ERROR);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    test('should throw error when saving data to draft store fails', async () => {
      //When
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {case_data: {statementOfMeans: {}}};
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(DRAFT_STORE_SAVE_ERROR);
      });
      setChildrenDisabilityServiceLogger(mockLogger);
      //Then
      await expect(saveChildrenDisability('claimId', new ChildrenDisability())).rejects.toThrow(DRAFT_STORE_SAVE_ERROR);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('isCheckChildrenDisabled', () => {
    test('should return true if defendant not disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.NO;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    test('should return false if no children, even if defendant not disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      const numberOfChildren = new NumberOfChildren(undefined, undefined, undefined);
      //Given
      claim.case_data.statementOfMeans.dependants.numberOfChildren.under11 = 0;
      claim.case_data.statementOfMeans.dependants.numberOfChildren.between16and19 = 0;
      claim.case_data.statementOfMeans.disability.option = YesNo.NO;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(0);
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    test('should return true if defendant disabled, not severely, and partner not disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    test('should return true if defendant disabled, not severely, and no partner, even if disabled flags set', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.YES;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    test('should return false if defendant disabled, not severely, and partner disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    test('should return false if defendant disabled, not severely, and partner severely disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.YES;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    test('should return false if defendant severely disabled, even if partner not', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
  });
});
