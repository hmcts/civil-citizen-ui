import {getCarer, saveCarer} from 'services/features/response/statementOfMeans/carerService';
import * as draftStoreService from '.modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {YesNo} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';

jest.mock('.modules/draft-store/draftStoreService');
jest.mock('.modules/draft-store');

const claimId = '123';

describe('Carer service', () => {
  describe('get carer form model', () => {
    it('should return an empty form model when no data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const result = await getCarer(claimId);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).toEqual(new GenericYesNo());
    });
    it('should return populated form model when data exists', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const claim = createClaim();
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const result = await getCarer(claimId);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result.option).toBeTruthy();
    });
  });

  describe('save carer data', () => {
    it('should save data successfully', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveCarer(claimId, new GenericYesNo(YesNo.YES));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should save carer data if statementOfMeans does´t exist', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      await saveCarer(claimId, new GenericYesNo(YesNo.YES));
      //Then
      expect(spySave).toBeCalled();
    });
  });
});

function createClaim() {
  const claim = new Claim();
  const statementOfMeans = new StatementOfMeans();
  statementOfMeans.carer = new GenericYesNo(YesNo.YES);
  claim.statementOfMeans = statementOfMeans;
  return claim;
}
