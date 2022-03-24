import {
  getForm,
  saveFormToDraftStore,
} from '../../../../../main/modules/statementOfMeans/dependants/dependantTeenagersService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {
  DependantTeenagers,
} from '../../../../../main/common/form/models/statementOfMeans/dependants/dependantTeenagers';
import {Claim} from '../../../../../main/common/models/claim';
import {StatementOfMeans} from '../../../../../main/common/models/statementOfMeans';
import {NumberOfChildren} from '../../../../../main/common/form/models/statementOfMeans/dependants/numberOfChildren';
import {Dependants} from '../../../../../main/common/form/models/statementOfMeans/dependants/dependants';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
describe('dependent teenagers service test', () => {
  const ERROR_MESSAGE = 'error with redis';
  const EXPECTED_ERROR_MESSAGE = 'Error: error with redis';
  describe('saveFormToDraftStore', () => {
    it('should save data successfully', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveFormToDraftStore('123', new DependantTeenagers(3, 4));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should throw error when error occurs', async () => {
      //Given
      const mockGetCaseData = draftStoreService.saveDraftClaim as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(ERROR_MESSAGE);
      });
      expect.assertions(1);
      //When
      try {
        await saveFormToDraftStore('123', new DependantTeenagers(3, 4));
      } catch (error) {
        //Then
        expect(error.message).toBe('Error: error with redis');
      }
    });
  });
  describe('getForm', () => {
    it('should get empty form when no data exists', async () => {
      //Given
      const spy = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      //When
      const form = await getForm('123');
      //Then
      expect(form.value).toBeUndefined();
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
      expect(form.value).toBeUndefined();
      expect(form.maxValue).toBe(4);
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
      expect(form.value).toBe(3);
      expect(form.maxValue).toBe(4);
      expect(spy).toBeCalled();
    });
    it('should rethrow error when error occurs', async () => {
      //Given
      expect.assertions(1);
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        throw new Error('error with redis');
      });
      //When
      try {
        await getForm('123');
      } catch (error) {
        //Then
        expect(error.message).toBe(EXPECTED_ERROR_MESSAGE);
      }
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
