import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {Claim} from '../../../../../../main/common/models/claim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import { HelpWithFees } from '../../../../../../main/common/form/models/claim/details/helpWithFees';
import { getHelpWithFees, saveHelpWithFees } from '../../../../../../main/services/features/claim/details/helpWithFeesService';
import { ClaimDetails } from '../../../../../../main/common/form/models/claim/details/claimDetails';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
const CASE_ID = '123';

const claimWithHelpWithFeesNo = new Claim();
claimWithHelpWithFeesNo.claimDetails = new ClaimDetails();
claimWithHelpWithFeesNo.claimDetails.helpWithFees = new HelpWithFees(YesNo.NO, '');

const claimWithHelpWithFeesYes = new Claim();
claimWithHelpWithFeesYes.claimDetails = new ClaimDetails();
claimWithHelpWithFeesYes.claimDetails.helpWithFees = new HelpWithFees(YesNo.YES, 'test');

const helpWithFeesNo = new HelpWithFees(YesNo.NO, '');
const helpWithFeesYes = new HelpWithFees(YesNo.YES, 'test');

describe('Claim - Help With Fees service', () => {
  describe('getHelpWithFees', () => {
    it('should return an empty helpWithFees when claimDetails don´t exist', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');

      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });

      //When
      const result = await getHelpWithFees(CASE_ID);

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toEqual(new HelpWithFees());
    });

    it('should return an empty helpWithFees when no data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');

      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimDetails = new ClaimDetails();
        return claim;
      });

      //When
      const result = await getHelpWithFees(CASE_ID);

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toEqual(new HelpWithFees());
    });

    it('should return a helpWithFees object with value when data is retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');

      mockGetCaseData.mockImplementation(async () => {
        return claimWithHelpWithFeesYes;
      });

      //When
      const result = await getHelpWithFees(CASE_ID);

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result.option).not.toBeNull();
      expect(result.referenceNumber).not.toBeNull();
      expect(result).toMatchObject(new HelpWithFees(YesNo.YES, 'test'));
    });

    it('should throw an error when error is thrown from draft store', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getHelpWithFees(CASE_ID)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveHelpWithFees', () => {
    it('should save claim with helpWithFees when option is No', async () => {
      //Given
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');

      mockGetCaseData.mockImplementation(async () => {
        return claimWithHelpWithFeesNo;
      });

      //When
      await saveHelpWithFees(CASE_ID, helpWithFeesNo);

      //Then
      expect(spySaveDraftClaim).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CASE_ID, claimWithHelpWithFeesNo);
    });

    it('should save claim with HelpWithFees when option is Yes and has reference number', async () => {
      //Given
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');

      mockGetCaseData.mockImplementation(async () => {
        return claimWithHelpWithFeesYes;
      });

      //When
      await saveHelpWithFees(CASE_ID, helpWithFeesYes);

      //Then
      expect(spySaveDraftClaim).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CASE_ID, claimWithHelpWithFeesYes);
    });

    it('should throw error when draft store get method throws error', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      //Then
      await expect(saveHelpWithFees(CASE_ID, helpWithFeesYes)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should throw error when draft store save method throws error', async () => {
      //When
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      //Then
      await expect(saveHelpWithFees(CASE_ID, helpWithFeesYes)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
