import * as draftStoreService from '../../../../../../../main/modules/draft-store/draftStoreService';
import {
  getRegularIncome,
  saveRegularIncome,
} from '../../../../../../../main/services/features/response/statementOfMeans/income/regularIncomeService';
import {Claim} from '../../../../../../../main/common/models/claim';
import {StatementOfMeans} from '../../../../../../../main/common/models/statementOfMeans';
import Transaction from '../../../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/transaction';
import {
  TransactionSchedule,
} from '../../../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import RegularIncome
  from '../../../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/regularIncome';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');

describe('regularIncome service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  describe('getRegularIncome', () => {
    it('should get empty form when statement of means  does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getRegularIncome('123');
      //Then
      expect(form.job?.declared).toBeUndefined();
    });
    it('should get empty form when no regular income data exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = new StatementOfMeans();
        return claim;
      });
      //When
      const form = await getRegularIncome('123');
      //Then
      expect(form.job?.declared).toBeUndefined();
    });
    it('should return populated form when regular income data exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = new StatementOfMeans();
        claim.statementOfMeans.regularIncome = new RegularIncome({job: Transaction.buildPopulatedForm('job', '2000', TransactionSchedule.MONTH, true)});
        return claim;
      });
      //When
      const form = await getRegularIncome('123');
      //Then
      expect(form.job?.declared).toBeTruthy();
      expect(form.job?.transactionSource?.amount).toBe(2000);
      expect(form.job?.transactionSource?.schedule).toBe(TransactionSchedule.MONTH);
    });
    it('should throw error when error is thrown from redis', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getRegularIncome('123')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
  describe('saveRegularExpenses', () => {
    it('should save successfully when statement of means  does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveRegularIncome('123', new RegularIncome({job: Transaction.buildPopulatedForm('job', '2000', TransactionSchedule.MONTH, true)}));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should get empty form when no regular income data exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = new StatementOfMeans();
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveRegularIncome('123', new RegularIncome({job: Transaction.buildPopulatedForm('job', '2000', TransactionSchedule.MONTH, true)}));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should throw an error when redis throws an error', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveRegularIncome('123', new RegularIncome({job: Transaction.buildPopulatedForm('job', '2000', TransactionSchedule.MONTH, true)}))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
