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
} from '../../../../../main/modules/statementOfMeans/dependants/childrenDisabilityService';
import {CivilClaimResponse} from '../../../../../main/common/models/civilClaimResponse';
import {LoggerInstance} from 'winston';
import {NumberOfChildren} from '../../../../../main/common/form/models/statementOfMeans/dependants/numberOfChildren';
import {GenericForm} from '../../../../../main/common/form/models/genericForm';
import {mockClaim} from '../../../../utils/mockClaim';

const civilClaimResponseMock = require('../civilClaimResponseMock.json');
const civilClaimResponse: string = JSON.stringify(civilClaimResponseMock);
const noStatementOfMeansMock = require('../noStatementOfMeansMock.json');
const noStatementOfMeans: string = JSON.stringify(noStatementOfMeansMock);
const civilClaimResponseNoDefendantDisabilityOrSevereDisabilityMock = require('../civilClaimResponseNoDefendantDisabilityOrSevereDisabilityMock.json');
const noDefendantDisabilityOrSevereDisability: string = JSON.stringify(civilClaimResponseNoDefendantDisabilityOrSevereDisabilityMock);
const civilClaimResponseNoDefendantDisabilityOrSevereDisabilityOptionsMock = require('../civilClaimResponseNoDefendantDisabilityOrSevereDisabilityOptionsMock.json');
const noDefendantDisabilityOrSevereDisabilityOptions: string = JSON.stringify(civilClaimResponseNoDefendantDisabilityOrSevereDisabilityOptionsMock);
const civilClaimResponseNoPartnerMock = require('../civilClaimResponseNoPartnerMock.json');
const noPartner: string = JSON.stringify(civilClaimResponseNoPartnerMock);
const civilClaimResponseNoPartnerDisabilityMock = require('../civilClaimResponseNoPartnerDisabilityMock.json');
const noPartnerDisability: string = JSON.stringify(civilClaimResponseNoPartnerDisabilityMock);
const civilClaimResponseNoPartnerOrDisabilityMock = require('../civilClaimResponseNoPartnerOrDefendantSevereDisabilityMock.json');
const noPartnerOrDisability: string = JSON.stringify(civilClaimResponseNoPartnerOrDisabilityMock);

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
      const form: GenericForm<ChildrenDisability> = new GenericForm(childrenDisability);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(0);
    });
    test('should not raise any error if NO is selected', async () => {
      //Given
      const childrenDisability = new ChildrenDisability(YesNo.NO);
      //When
      const form: GenericForm<ChildrenDisability> = new GenericForm(childrenDisability);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(0);
    });
    test('should raise an error if nothing is selected', async () => {
      //Given
      const childrenDisability = new ChildrenDisability(undefined);
      //When
      const form: GenericForm<ChildrenDisability> = new GenericForm(childrenDisability);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('option');
      expect(form.getErrors()[0].constraints).toEqual({isDefined: VALID_YES_NO_OPTION});
    });
  });

  describe('get and save ChildrenDisability', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('should return empty ChildrenDisability when nothing retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return undefined;
      });
      //When
      const childrenDisability = await (getChildrenDisability('claimId'));
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(childrenDisability).not.toBeNull();
      expect(childrenDisability).toEqual(new ChildrenDisability());
    });
    test('should return empty ChildrenDisability when case_data, but no statementOfMeans, retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {case_data: {}};
      });
      //When
      const childrenDisability = await (getChildrenDisability('claimId'));
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(childrenDisability).not.toBeNull();
      expect(childrenDisability).toEqual(new ChildrenDisability());
    });
    test('should return empty ChildrenDisability when case_data and statementOfMeans, but no disability, retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {case_data: {statementOfMeans : {}}};
      });
      //When
      const childrenDisability = await (getChildrenDisability('claimId'));
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(childrenDisability).not.toBeNull();
      expect(childrenDisability).toEqual(new ChildrenDisability());
    });
    test('should return empty ChildrenDisability when no data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {case_data: {statementOfMeans : {childrenDisability : {}}}};
      });
      //When
      const childrenDisability = await (getChildrenDisability('claimId'));
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(childrenDisability).not.toBeNull();
      expect(childrenDisability).toEqual(new ChildrenDisability());
    });

    test('should return ChildrenDisability when data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return mockClaim;
      });
      //When
      const childrenDisability = await (getChildrenDisability('claimId'));
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(childrenDisability).not.toBeNull();
      expect(childrenDisability).toEqual(mockClaim?.statementOfMeans?.childrenDisability);
    });

    test('should save childrenDisability when nothing in Redis draft store', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return undefined;
      });
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveChildrenDisability('claimId', new ChildrenDisability());
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });

    test('should save childrenDisability when case_data, but no statementOfMeans, in Redis draft store', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {case_data: {}};
      });
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveChildrenDisability('claimId', new ChildrenDisability());
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });

    test('should save childrenDisability when case_data and statementOfMeans, but no childrenDisability, in Redis draft store', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {case_data: {statementOfMeans : {}}};
      });
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveChildrenDisability('claimId', new ChildrenDisability());
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });

    test('should save childrenDisability when case_data and statementOfMeans and childrenDisability, but no option, in Redis draft store', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {case_data: {statementOfMeans : {childrenDisability:{}}}};
      });
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveChildrenDisability('claimId', new ChildrenDisability());
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });

    test('should save childrenDisability when claim in Redis draft store', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return mockClaim;
      });
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveChildrenDisability('claimId', new ChildrenDisability());
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith('claimId', mockClaim);
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
        return mockClaim;
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
    test('should return false if no statement of means', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noStatementOfMeans));
      //Given
      //Then
      expect(claim.case_data.statementOfMeans).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    test('should return false if no disability', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noDefendantDisabilityOrSevereDisability));
      //Given
      //Then
      expect(claim.case_data.statementOfMeans).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.disability).toBe(undefined);
      expect(claim.case_data.statementOfMeans.severeDisability).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    test('should return false if disability and severeDisability but no options', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noDefendantDisabilityOrSevereDisabilityOptions));
      //Given
      //Then
      expect(claim.case_data.statementOfMeans).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.disability).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.disability.option).toBe(undefined);
      expect(claim.case_data.statementOfMeans.severeDisability).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.severeDisability.option).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    test('should return true if defendant disability NO, severe disability undefined', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noPartnerOrDisability));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      expect(claim.case_data.statementOfMeans.disability.option).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.disability.option).toBe(YesNo.NO);
      expect(claim.case_data.statementOfMeans.severeDisability).toBe(undefined);
      expect(claim.case_data.statementOfMeans.cohabiting).toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    test('should return true if defendant not disabled, no partner', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noPartner));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      // Expect severeDisability to still be YES unless you explicitly change it
      expect(claim.case_data.statementOfMeans.severeDisability.option).toBe(YesNo.YES);
      expect(claim.case_data.statementOfMeans.cohabiting).toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    test('should return true if defendant disabled, not severely, but partner options not existing', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noPartner));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      expect(claim.case_data.statementOfMeans.cohabiting).toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    test('should return true if defendant disabled, not severely, partner but no partnerDisability', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noPartner));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      expect(claim.case_data.statementOfMeans.cohabiting).toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    test('should return true if defendant disabled, not severely, partner but no partnerDisability', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noPartnerDisability));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      expect(claim.case_data.statementOfMeans.cohabiting).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.cohabiting.option).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.cohabiting.option).toBe(YesNo.YES);
      expect(claim.case_data.statementOfMeans.partnerDisability).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    test('should return true if defendant not disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.NO;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(claim.case_data.statementOfMeans.severeDisability.option).not.toBe(undefined);
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    test('should return false if no children, even if defendant not disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      const numberOfChildren = new NumberOfChildren(undefined, undefined, undefined);
      //Given
      claim.case_data.statementOfMeans.dependants.numberOfChildren.under11 = 0;
      claim.case_data.statementOfMeans.dependants.numberOfChildren.between11and15 = 0;
      claim.case_data.statementOfMeans.dependants.numberOfChildren.between16and19 = 0;
      claim.case_data.statementOfMeans.disability.option = YesNo.NO;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(0);
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    test('should return false if no children, even if defendant not severely disabled and no partner', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      const numberOfChildren = new NumberOfChildren(undefined, undefined, undefined);
      //Given
      claim.case_data.statementOfMeans.dependants.numberOfChildren.under11 = 0;
      claim.case_data.statementOfMeans.dependants.numberOfChildren.between11and15 = 0;
      claim.case_data.statementOfMeans.dependants.numberOfChildren.between16and19 = 0;
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(0);
      expect(claim.case_data.statementOfMeans.cohabiting).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.cohabiting.option).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability.option).not.toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    test('should return false if no children, even if defendant not severely disabled and partner not disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      const numberOfChildren = new NumberOfChildren(undefined, undefined, undefined);
      //Given
      claim.case_data.statementOfMeans.dependants.numberOfChildren.under11 = 0;
      claim.case_data.statementOfMeans.dependants.numberOfChildren.between11and15 = 0;
      claim.case_data.statementOfMeans.dependants.numberOfChildren.between16and19 = 0;
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
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
    test('should return true if defendant disabled, not severely, and no partner', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    test('should return true if defendant disabled, not severely, and no partner, even if disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    test('should return true if defendant disabled, not severely, and no partner, even if both disabled flags set', async () => {
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
    test('should return false if defendant severely disabled, even if no partner', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
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
    test('should return false if defendant severely disabled, and partner disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    test('should return false if defendant severely disabled, and partner severely disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.YES;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
  });
});
