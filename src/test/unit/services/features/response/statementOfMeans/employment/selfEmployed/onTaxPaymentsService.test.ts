import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {
  getOnTaxPaymentsForm,
  saveTaxPaymentsData,
} from '../../../../../../../../main/services/features/response/statementOfMeans/employment/selfEmployed/onTaxPaymentsService';
import {Claim} from '../../.common/models/claim';
import {StatementOfMeans} from '../../.common/models/statementOfMeans';
import {YesNo} from '../../.common/form/models/yesNo';
import {
  OnTaxPayments,
} from '../../.common/form/models/statementOfMeans/employment/selfEmployed/onTaxPayments';
import {TestMessages} from '../../../../../../../utils/errorMessageTestConstants';
import {GenericForm} from '../../.common/form/models/genericForm';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');

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
      expect(form.model.option).toBeUndefined();
      expect(form.model.reason).toBeUndefined();
      expect(form.model.amountYouOwe).toBeUndefined();
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
      expect(form.model.option).toBeUndefined();
      expect(form.model.reason).toBeUndefined();
      expect(form.model.amountYouOwe).toBeUndefined();
    });
    it('should return an empty form when when statement of means does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getOnTaxPaymentsForm('123');
      //Then
      expect(form.model.option).toBeUndefined();
      expect(form.model.reason).toBeUndefined();
      expect(form.model.amountYouOwe).toBeUndefined();
    });
    it('should return populated form when taxPayments exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return createClaimWithTaxPayments();
      });
      //When
      const form = await getOnTaxPaymentsForm('123');
      //Then
      expect(form.model.option).toBeTruthy();
      expect(form.model.reason).toBe(REASON);
      expect(form.model.amountYouOwe).toBe(AMOUNT_OWED);
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
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveTaxPaymentsData('123', new GenericForm(new OnTaxPayments(YesNo.YES, AMOUNT_OWED, REASON)));
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
      await saveTaxPaymentsData('123', new GenericForm(new OnTaxPayments(YesNo.YES, AMOUNT_OWED, REASON)));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should remove the existing reason and amountOwed values when option changed to no', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const savedMockClaim = new Claim();
      savedMockClaim.statementOfMeans = new StatementOfMeans();
      savedMockClaim.statementOfMeans.taxPayments = {owed: false, reason: undefined, amountOwed: undefined};
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveTaxPaymentsData('123', new GenericForm(new OnTaxPayments(YesNo.NO, AMOUNT_OWED, REASON)));
      //Then
      expect(spySave).toBeCalled();
      expect(spySave).toBeCalledWith('123', savedMockClaim);
    });
    it('should rethrow error when error occurs on get claim', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveTaxPaymentsData('123', new GenericForm(new OnTaxPayments(YesNo.YES, AMOUNT_OWED, REASON))))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
    it('should rethrow error when error occurs on save claim', async () => {
      //Given
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveTaxPaymentsData('123', new GenericForm(new OnTaxPayments(YesNo.YES, AMOUNT_OWED, REASON))))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
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
