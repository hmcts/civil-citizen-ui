import {Claim} from 'models/claim';
import {getDocuments, saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {ClaimantOrDefendant} from 'models/partyType';
import {UploadDocuments, UploadDocumentTypes} from 'models/caseProgression/uploadDocumentsType';
import {EvidenceUploadExpert, EvidenceUploadTrial} from 'models/document/documentType';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
const REDIS_FAILURE = 'Redis DraftStore failure.';
describe('case Progression service', () => {
  describe('getBreathingSpace', () => {

    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    mockGetCaseDataFromDraftStore.mockImplementation(async () => {
      return mockClaim.case_data;
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
      const claimantDocuments = await getDocuments(mockClaimId, ClaimantOrDefendant.CLAIMANT);
      //Then
      expect(claimantDocuments.trial[0].selected).toEqual(caseData.caseProgression.claimantUploadDocuments.trial[0].selected);
      expect(claimantDocuments.trial[0].documentType).toEqual(caseData.caseProgression.claimantUploadDocuments.trial[0].documentType);
      expect(claimantDocuments.trial[1].selected).toEqual(caseData.caseProgression.claimantUploadDocuments.trial[1].selected);
      expect(claimantDocuments.trial[1].documentType).toEqual(caseData.caseProgression.claimantUploadDocuments.trial[1].documentType);
    });
    it('should return defendantDocuments content', async () => {
      //when
      const claimantDocuments = await getDocuments(mockClaimId, ClaimantOrDefendant.DEFENDANT);
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

      await expect(getDocuments('claimId', ClaimantOrDefendant.DEFENDANT)).rejects.toThrow(REDIS_FAILURE);
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

      await saveCaseProgression('validClaimId', uploadDocuments, 'defendantUploadDocuments');
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

      await saveCaseProgression('validClaimId', uploadDocuments, 'claimantUploadDocuments');
      expect(spySave).toHaveBeenCalledWith('validClaimId', documentUploadToSave);
    });
    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(REDIS_FAILURE);
      });
      await expect(saveCaseProgression('claimId', mockGetCaseDataFromDraftStore, ''))
        .rejects.toThrow(REDIS_FAILURE);
    });
  });
});
