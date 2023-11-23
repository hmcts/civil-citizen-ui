import {Claim} from 'models/claim';
import * as caseProgressionService from 'services/features/caseProgression/caseProgressionService';
import {UploadDocuments, UploadDocumentTypes} from 'models/caseProgression/uploadDocumentsType';
import {EvidenceUploadExpert, EvidenceUploadTrial} from 'models/document/documentType';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {
  getMockEmptyUploadDocumentsUserForm,
  getMockFullUploadDocumentsUserForm,
  getMockUploadDocumentsSelected,
} from '../../../../utils/caseProgression/mockEvidenceUploadSections';
import {
  getClaimWithClaimantTrialArrangements,
  getClaimWithDefendantTrialArrangements,
} from '../../../../utils/mockClaimForCheckAnswers';

jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
const REDIS_FAILURE = 'Redis DraftStore failure.';
describe('case Progression service', () => {
  describe('getBreathingSpace', () => {

    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      case_data: {
        ...mockClaim.case_data,
        isClaimant: jest.fn(),
      },
    };
    mockGetCaseDataFromDraftStore.mockImplementation(async () => {
      return testClaim.case_data;
    });
    const mockClaimId = '1645882162449409';
    const caseData = new Claim();
    caseData.caseProgression = new CaseProgression();
    caseData.caseProgression.claimantUploadDocuments = new UploadDocuments();
    caseData.caseProgression.defendantUploadDocuments = new UploadDocuments();
    caseData.caseProgression.claimantUploadDocuments.trial = [];
    caseData.caseProgression.defendantUploadDocuments.trial = [];
    caseData.caseProgression.claimantUploadDocuments.trial.push(new UploadDocumentTypes(true, undefined, EvidenceUploadTrial.CASE_SUMMARY));
    caseData.caseProgression.claimantUploadDocuments.trial.push(new UploadDocumentTypes(true, undefined, EvidenceUploadTrial.SKELETON_ARGUMENT));
    caseData.caseProgression.defendantUploadDocuments.trial.push(new UploadDocumentTypes(true, undefined, EvidenceUploadTrial.CASE_SUMMARY));
    caseData.caseProgression.defendantUploadDocuments.trial.push(new UploadDocumentTypes(true, undefined, EvidenceUploadTrial.SKELETON_ARGUMENT));

    it('should return claimantDocuments content', async () => {
      //when
      const claimantDocuments = await caseProgressionService.getDocuments(mockClaimId);
      //Then
      expect(claimantDocuments.trial[0].selected).toEqual(caseData.caseProgression.claimantUploadDocuments.trial[0].selected);
      expect(claimantDocuments.trial[0].documentType).toEqual(caseData.caseProgression.claimantUploadDocuments.trial[0].documentType);
      expect(claimantDocuments.trial[1].selected).toEqual(caseData.caseProgression.claimantUploadDocuments.trial[1].selected);
      expect(claimantDocuments.trial[1].documentType).toEqual(caseData.caseProgression.claimantUploadDocuments.trial[1].documentType);
    });
    it('should return defendantDocuments content', async () => {
      //when
      const claimantDocuments = await caseProgressionService.getDocuments(mockClaimId);
      //Then
      expect(claimantDocuments.trial[0].selected).toEqual(caseData.caseProgression.defendantUploadDocuments.trial[0].selected);
      expect(claimantDocuments.trial[0].documentType).toEqual(caseData.caseProgression.defendantUploadDocuments.trial[0].documentType);
      expect(claimantDocuments.trial[1].selected).toEqual(caseData.caseProgression.defendantUploadDocuments.trial[1].selected);
      expect(claimantDocuments.trial[1].documentType).toEqual(caseData.caseProgression.defendantUploadDocuments.trial[1].documentType);
    });
    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(REDIS_FAILURE);
      });

      await expect(caseProgressionService.getDocuments('claimId')).rejects.toThrow(REDIS_FAILURE);
    });
  });
  describe('deleteUntickedDocumentsFromStore', () => {
    it('should save Draftclaim with existing files for all selected documents', async() => {
      //given
      const claimId = 'claimId';
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.id = claimId;
        claim.caseProgression = new CaseProgression();
        claim.caseProgression.defendantDocuments = getMockFullUploadDocumentsUserForm();
        claim.caseProgression.defendantUploadDocuments = getMockUploadDocumentsSelected(true);

        return claim;
      });

      //when
      const spySave = jest.spyOn(caseProgressionService, 'saveCaseProgression');
      await caseProgressionService.deleteUntickedDocumentsFromStore(claimId, false);

      //then
      expect(spySave).toHaveBeenCalledWith(claimId, getMockFullUploadDocumentsUserForm(), 'defendantDocuments');

    });
    it('should save Draftclaim with pre-existing files of unselected documents removed', async() => {
      //given
      const claimId = 'claimId';
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.id = claimId;
        claim.caseProgression = new CaseProgression();
        claim.caseProgression.defendantDocuments = getMockFullUploadDocumentsUserForm();
        claim.caseProgression.defendantUploadDocuments = getMockUploadDocumentsSelected(false);

        return claim;
      });

      //when
      const spySave = jest.spyOn(caseProgressionService, 'saveCaseProgression');
      await caseProgressionService.deleteUntickedDocumentsFromStore(claimId, false);

      //then
      expect(spySave).toHaveBeenCalledWith(claimId, getMockEmptyUploadDocumentsUserForm(), 'defendantDocuments');
    });

    it('should save Draftclaim without pre-existing files as empty arrays for selected documents', async() => {
      //given
      const claimId = 'claimId';
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.id = claimId;
        claim.caseProgression = new CaseProgression();
        claim.caseProgression.defendantDocuments = getMockEmptyUploadDocumentsUserForm();
        claim.caseProgression.defendantUploadDocuments = getMockUploadDocumentsSelected(true);

        return claim;
      });

      //when
      const spySave = jest.spyOn(caseProgressionService, 'saveCaseProgression');
      await caseProgressionService.deleteUntickedDocumentsFromStore(claimId, false);

      //then
      expect(spySave).toHaveBeenCalledWith(claimId, getMockEmptyUploadDocumentsUserForm(), 'defendantDocuments');
    });
  });
  describe('saveDocumentUpload', () => {
    const uploadDocuments = new UploadDocuments();
    uploadDocuments.expert = [];
    uploadDocuments.expert.push(new UploadDocumentTypes(true,undefined,EvidenceUploadExpert.ANSWERS_FOR_EXPERTS));

    it('should save defendantUploadDocuments expert successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.caseProgression = new CaseProgression();
        claim.caseProgression.defendantUploadDocuments = new UploadDocuments();

        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      const documentUploadToSave  = new Claim();
      documentUploadToSave.caseProgression = new CaseProgression();
      documentUploadToSave.caseProgression.defendantUploadDocuments = new UploadDocuments();
      documentUploadToSave.caseProgression.defendantUploadDocuments.expert = [];
      documentUploadToSave.caseProgression.defendantUploadDocuments.expert.push(new UploadDocumentTypes(true,undefined,EvidenceUploadExpert.ANSWERS_FOR_EXPERTS));

      await caseProgressionService.saveCaseProgression('validClaimId', uploadDocuments, 'defendantUploadDocuments');
      expect(spySave).toHaveBeenCalledWith('validClaimId', documentUploadToSave);
    });
    it('should save claimantUploadDocuments expert successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.caseProgression = new CaseProgression();
        claim.caseProgression.claimantUploadDocuments = new UploadDocuments();

        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      const documentUploadToSave  = new Claim();
      documentUploadToSave.caseProgression = new CaseProgression();
      documentUploadToSave.caseProgression.claimantUploadDocuments = new UploadDocuments();
      documentUploadToSave.caseProgression.claimantUploadDocuments.expert = [];
      documentUploadToSave.caseProgression.claimantUploadDocuments.expert.push(new UploadDocumentTypes(true,undefined,EvidenceUploadExpert.ANSWERS_FOR_EXPERTS));

      await caseProgressionService.saveCaseProgression('validClaimId', uploadDocuments, 'claimantUploadDocuments');
      expect(spySave).toHaveBeenCalledWith('validClaimId', documentUploadToSave);
    });

    it('should save defendantTrialArrangements successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = getClaimWithDefendantTrialArrangements();
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      const claimToSave  = getClaimWithDefendantTrialArrangements();

      await caseProgressionService.saveCaseProgression('validClaimId', claimToSave.caseProgression.defendantTrialArrangements, 'defendantTrialArrangements');
      expect(spySave).toHaveBeenCalledWith('validClaimId', claimToSave);
    });

    it('should save claimantTrialArrangements successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = getClaimWithClaimantTrialArrangements();
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      const claimToSave  = getClaimWithClaimantTrialArrangements();

      await caseProgressionService.saveCaseProgression('validClaimId', claimToSave.caseProgression.claimantTrialArrangements, 'claimantTrialArrangements');
      expect(spySave).toHaveBeenCalledWith('validClaimId', claimToSave);
    });

    it('should save defendantTrialArrangements successfully, when no Trial arrangements', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      const claimToSave  = getClaimWithDefendantTrialArrangements();

      await caseProgressionService.saveCaseProgression('validClaimId', claimToSave.caseProgression.defendantTrialArrangements, 'defendantTrialArrangements');
      expect(spySave).toHaveBeenCalledWith('validClaimId', claimToSave);
    });

    it('should save claimantTrialArrangements successfully, when no Trial arrangements', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      const claimToSave  = getClaimWithClaimantTrialArrangements();

      await caseProgressionService.saveCaseProgression('validClaimId', claimToSave.caseProgression.claimantTrialArrangements, 'claimantTrialArrangements');
      expect(spySave).toHaveBeenCalledWith('validClaimId', claimToSave);
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(REDIS_FAILURE);
      });
      await expect(caseProgressionService.saveCaseProgression('claimId', mockGetCaseDataFromDraftStore, ''))
        .rejects.toThrow(REDIS_FAILURE);
    });
  });
});
