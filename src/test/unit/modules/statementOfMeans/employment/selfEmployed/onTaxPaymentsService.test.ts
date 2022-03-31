import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {
  getOnTaxPaymentsForm,
  saveTaxPaymentsData,
} from '../../../../../../main/modules/statementOfMeans/employment/selfEmployed/onTaxPaymentsService';
import {Claim} from '../../../../../../main/common/models/claim';
import {StatementOfMeans} from '../../../../../../main/common/models/statementOfMeans';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {
  OnTaxPayments,
} from '../../../../../../main/common/form/models/statementOfMeans/employment/selfEmployed/onTaxPayments';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';


jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const OWED = true;
const AMOUNT_OWED = 22.2;
const REASON = 'reason';
describe('On Tax Payments Service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  describe('getOnTaxPaymentsForm', () => {
    it('should return an empty form when no data exists', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      //When
      const form = await getOnTaxPaymentsForm('123');
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(form.option).toBeUndefined();
      expect(form.reason).toBeUndefined();
      expect(form.amountYouOwe).toBeUndefined();
    });
    it('should return an empty form when taxPayments does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = new StatementOfMeans();
        return claim;
      });
      //When
      const form = await getOnTaxPaymentsForm('123');
      //Then
      expect(form.option).toBeUndefined();
      expect(form.reason).toBeUndefined();
      expect(form.amountYouOwe).toBeUndefined();
    });
    it('should return an empty form when when statement of means does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getOnTaxPaymentsForm('123');
      //Then
      expect(form.option).toBeUndefined();
      expect(form.reason).toBeUndefined();
      expect(form.amountYouOwe).toBeUndefined();
    });
    it('should return populated form when taxPayments exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return createClaimWithTaxPayments();
      });
      //When
      const form = await getOnTaxPaymentsForm('123');
      //Then
      expect(form.option).toBeTruthy();
      expect(form.reason).toBe(REASON);
      expect(form.amountYouOwe).toBe(AMOUNT_OWED);
    });
    it('should rethrow error when error occurs', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getOnTaxPaymentsForm('123')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
  describe('saveTaxPaymentsData', () => {
    it('should save tax payment data successfully when claim does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return undefined;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveTaxPaymentsData('123', new OnTaxPayments(YesNo.YES, AMOUNT_OWED, REASON));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should save tax payment data successfully when claim exists but no statement of means', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveTaxPaymentsData('123', new OnTaxPayments(YesNo.YES, AMOUNT_OWED, REASON));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should rethrow error when error occurs on get claim', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveTaxPaymentsData('123', new OnTaxPayments(YesNo.YES, AMOUNT_OWED, REASON))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
    it('should rethrow error when error occurs on save claim', async () => {
      //Given
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveTaxPaymentsData('123', new OnTaxPayments(YesNo.YES, AMOUNT_OWED, REASON))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});

function createClaimWithTaxPayments(): Claim {
  const claim = new Claim();
  const statementOfMeans = new StatementOfMeans();
  statementOfMeans.taxPayments = {owed: OWED, amountOwed: AMOUNT_OWED, reason: REASON};
  claim.statementOfMeans = statementOfMeans;
  return claim;
}
