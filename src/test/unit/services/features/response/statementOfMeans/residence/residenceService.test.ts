import {
  getResidence,
  getResidenceForm,
  saveResidence,
} from '../../../../../../../main/services/features/response/statementOfMeans/residence/residenceService';
import * as draftStoreService from '../.modules/draft-store/draftStoreService';
import {Claim} from '../.common/models/claim';
import {StatementOfMeans} from '../.common/models/statementOfMeans';
import {Residence} from '../.common/form/models/statementOfMeans/residence/residence';
import {ResidenceType} from '../.common/form/models/statementOfMeans/residence/residenceType';

jest.mock('../.modules/draft-store/draftStoreService');

const claimId = '123';

describe('Residence service', () => {
  describe('get residence form model', () => {
    it('should return an empty form model when no data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const result = await getResidence(claimId);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).toEqual(new Residence());
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
      const result = await getResidence(claimId);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result.type).toEqual(ResidenceType.OWN_HOME);
    });
  });

  describe('save residence data', () => {
    it('should save residence data successfully', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveResidence(claimId, new Residence(ResidenceType.JOINT_OWN_HOME, ''));
      //Then
      expect(spySave).toBeCalled();
    });

    it('should save residence data if statementOfMeans does´t exist', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      await saveResidence(claimId, new Residence(ResidenceType.JOINT_OWN_HOME, ''));
      //Then
      expect(spySave).toBeCalled();
    });
  });

  describe('get residence form', () => {
    it('should get residence form successfully', async () => {
      //When
      const result = await getResidenceForm(ResidenceType.JOINT_OWN_HOME, '');
      //Then
      expect(result).toEqual(new Residence(ResidenceType.JOINT_OWN_HOME, ''));
    });

    it('should get residence form successfully when it is other with details', async () => {
      //When
      const result = await getResidenceForm(ResidenceType.OTHER, 'details');
      //Then
      expect(result).toEqual(new Residence(ResidenceType.OTHER, 'details'));
    });

    it('should get residence form successfully when it is not other with details', async () => {
      //When
      const result = await getResidenceForm(ResidenceType.JOINT_OWN_HOME, 'details');
      //Then
      expect(result).toEqual(new Residence(ResidenceType.JOINT_OWN_HOME, ''));
    });
  });
});

function createClaim() {
  const claim = new Claim();
  const statementOfMeans = new StatementOfMeans();
  statementOfMeans.residence = new Residence(ResidenceType.OWN_HOME, '');
  claim.statementOfMeans = statementOfMeans;
  return claim;
}
