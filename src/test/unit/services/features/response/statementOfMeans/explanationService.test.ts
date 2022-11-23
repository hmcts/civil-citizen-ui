import {getExplanation, saveExplanation} from 'services/features/response/statementOfMeans/explanationService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {Explanation} from 'form/models/statementOfMeans/explanation';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/draft-store');

const claimId = '123';

describe('Explanation service', () => {
  describe('get explanation form model', () => {
    it('should return an empty form model when no data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const result = await getExplanation(claimId);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).toEqual(new Explanation());
    });
    it('should return populated form model when data exists', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return createClaim();
      });
      //When
      const result = await getExplanation(claimId);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result.text).toContain('test');
    });
  });

  describe('save explanation data', () => {
    it('should save data successfully', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveExplanation(claimId, new Explanation('test'));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should save explanation data if statementOfMeans does´t exist', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      await saveExplanation(claimId, new Explanation('test'));
      //Then
      expect(spySave).toBeCalled();
    });
  });
});

function createClaim() {
  const claim = new Claim();
  const statementOfMeans = new StatementOfMeans();
  statementOfMeans.explanation = new Explanation('test');
  claim.statementOfMeans = statementOfMeans;
  return claim;
}
