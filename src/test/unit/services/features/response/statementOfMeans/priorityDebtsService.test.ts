import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Transaction} from 'common/form/models/statementOfMeans/expensesAndIncome/transaction';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {PriorityDebts} from 'common/form/models/statementOfMeans/priorityDebts';
import {Claim} from 'common/models/claim';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {getPriorityDebts, savePriorityDebts} from 'services/features/response/statementOfMeans/priorityDebtsService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

describe('priority Debts service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  describe('getPriorityDebts', () => {
    it('should get empty form when statement of means  does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getPriorityDebts('123');
      //Then
      expect(form.mortgage?.declared).toBeUndefined();
    });
    it('should get empty form when no priority debts data exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = new StatementOfMeans();
        return claim;
      });
      //When
      const form = await getPriorityDebts('123');
      //Then
      expect(form.mortgage?.declared).toBeUndefined();
    });
    it('should return populated form when priority debts data exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = new StatementOfMeans();
        claim.statementOfMeans.priorityDebts = new PriorityDebts({mortgage: Transaction.buildPopulatedForm('Mortgage', '2000', TransactionSchedule.MONTH)});
        return claim;
      });
      //When
      const form = await getPriorityDebts('123');
      //Then
      expect(form.mortgage?.declared).toBeTruthy();
      expect(form.mortgage?.transactionSource?.amount).toBe(2000);
      expect(form.mortgage?.transactionSource?.schedule).toBe(TransactionSchedule.MONTH);
    });
    it('should throw error when error is thrown from redis', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getPriorityDebts('123')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
  describe('savePriorityDebts', () => {
    it('should save successfully when statement of means  does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await savePriorityDebts('123', new PriorityDebts({mortgage: Transaction.buildPopulatedForm('mortgage', '2000', TransactionSchedule.MONTH)}));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should get empty form when no oriority debts data exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = new StatementOfMeans();
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await savePriorityDebts('123', new PriorityDebts({mortgage: Transaction.buildPopulatedForm('mortgage', '2000', TransactionSchedule.MONTH)}));
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
      await expect(savePriorityDebts('123', new PriorityDebts({mortgage: Transaction.buildPopulatedForm('mortgage', '2000', TransactionSchedule.MONTH)}))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
