import {
  getForm,
  saveFormToDraftStore,
} from '../../../../../../../main/services/features/response/statementOfMeans/dependants/betweenSixteenAndNineteenService';
import * as draftStoreService from '../.modules/draft-store/draftStoreService';
import {
  BetweenSixteenAndNineteenDependants,
} from '../.common/form/models/statementOfMeans/dependants/betweenSixteenAndNineteenDependants';
import {Claim} from '../.common/models/claim';
import {StatementOfMeans} from '../.common/models/statementOfMeans';
import {
  NumberOfChildren,
} from '../.common/form/models/statementOfMeans/dependants/numberOfChildren';
import {Dependants} from '../.common/form/models/statementOfMeans/dependants/dependants';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {GenericForm} from '../.common/form/models/genericForm';

jest.mock('../.modules/draft-store');
jest.mock('../.modules/draft-store/draftStoreService');

describe('dependent teenagers service test', () => {
  describe('saveFormToDraftStore', () => {
    it('should save data successfully', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveFormToDraftStore('123', new GenericForm(new BetweenSixteenAndNineteenDependants(3, 4)));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should throw error when error occurs', async () => {
      //When
      const mockGetCaseData = draftStoreService.saveDraftClaim as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveFormToDraftStore('123', new GenericForm(new BetweenSixteenAndNineteenDependants(3, 4))))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
  describe('getForm', () => {
    it('should get empty form when no data exists', async () => {
      //Given
      const spy = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      //When
      const form = await getForm('123');
      //Then
      expect(form.model.value).toBeUndefined();
      expect(spy).toBeCalled();
    });
    it('should get form with maxValue set from data when data from previous page exists', async () => {
      //Given
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return createClaim(4, undefined);
      });
      //When
      const form = await getForm('123');
      //Then
      expect(form.model.value).toBeUndefined();
      expect(form.model.maxValue).toBe(4);
    });
    it('should get form with maxValue and value set from data when data exists', async () => {
      //Given
      const spy = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return createClaim(4, 3);
      });
      //When
      const form = await getForm('123');
      //Then
      expect(form.model.value).toBe(3);
      expect(form.model.maxValue).toBe(4);
      expect(spy).toBeCalled();
    });
    it('should rethrow error when error occurs', async () => {
      //When
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getForm('123')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});

function createClaim(between1819: number, numberOfChildrenLivingWithYou: number | undefined) {
  const claim = new Claim();
  const statementOfMeans = new StatementOfMeans();
  statementOfMeans.dependants = new Dependants(true, new NumberOfChildren(undefined, undefined, between1819));
  statementOfMeans.numberOfChildrenLivingWithYou = numberOfChildrenLivingWithYou;
  claim.statementOfMeans = statementOfMeans;
  return claim;
}
