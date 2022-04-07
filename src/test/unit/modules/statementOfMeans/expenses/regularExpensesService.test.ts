import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {
  getRegularExpenses,
  saveRegularExpenses,
} from '../../../../../main/modules/statementOfMeans/expenses/regularExpensesService';
import {Claim} from '../../../../../main/common/models/claim';
import {StatementOfMeans} from '../../../../../main/common/models/statementOfMeans';
import Expense from '../../../../../main/common/form/models/statementOfMeans/expenses/expense';
import {ScheduledExpenses} from '../../../../../main/common/form/models/statementOfMeans/expenses/scheduledExpenses';
import {RegularExpenses} from '../../../../../main/common/form/models/statementOfMeans/expenses/regularExpenses';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('regularExpenses service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  describe('getRegularExpenses', () => {
    it('should get empty form when statement of means  does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getRegularExpenses('123');
      //Then
      expect(form.mortgage?.declared).toBeUndefined();
    });
    it('should get empty form when no regular expenses data exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = new StatementOfMeans();
        return claim;
      });
      //When
      const form = await getRegularExpenses('123');
      //Then
      expect(form.mortgage?.declared).toBeUndefined();
    });
    it('should return populated form when regular expenses data exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = new StatementOfMeans();
        claim.statementOfMeans.regularExpenses = new RegularExpenses({mortgage: Expense.buildPopulatedForm('mortgage', '2000', ScheduledExpenses.MONTH)});
        return claim;
      });
      //When
      const form = await getRegularExpenses('123');
      //Then
      expect(form.mortgage?.declared).toBeTruthy();
      expect(form.mortgage?.expenseSource?.amount).toBe(2000);
      expect(form.mortgage?.expenseSource?.schedule).toBe(ScheduledExpenses.MONTH);
    });
    it('should throw error when error is thrown from redis', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getRegularExpenses('123')).rejects.toThrow(TestMessages.REDIS_FAILURE);
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
      await saveRegularExpenses('123', new RegularExpenses({mortgage: Expense.buildPopulatedForm('mortgage', '2000', ScheduledExpenses.MONTH)}));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should get empty form when no regular expenses data exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = new StatementOfMeans();
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveRegularExpenses('123', new RegularExpenses({mortgage: Expense.buildPopulatedForm('mortgage', '2000', ScheduledExpenses.MONTH)}));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should throw an error when redis throws an error', async () => {
      //Given
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveRegularExpenses('123', new RegularExpenses({mortgage: Expense.buildPopulatedForm('mortgage', '2000', ScheduledExpenses.MONTH)}))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
