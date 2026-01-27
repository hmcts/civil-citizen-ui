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
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {
  getUploadDocumentsForm,
  readDateParts,
  toNonEmptyTrimmedString,
  addAnother,
} from 'services/features/caseProgression/caseProgressionService';
import {
  DateInputFields, ExpertSection, FileOnlySection, ReferredToInTheStatementSection,
  TypeOfDocumentSection,
  UploadDocumentsUserForm, WitnessSection, WitnessSummarySection,
} from 'models/caseProgression/uploadDocumentsUserForm';
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;

const REDIS_FAILURE = 'Redis DraftStore failure.';
const MOCK_REQUEST = { params: { id: '12345' } } as unknown as AppRequest;

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
    caseData.applicant1 = new Party();
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
      const claimId = MOCK_REQUEST.params.id;

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.id = claimId;
        claim.caseProgression = new CaseProgression();
        claim.caseProgression.defendantDocuments = getMockFullUploadDocumentsUserForm();
        claim.caseProgression.defendantUploadDocuments = getMockUploadDocumentsSelected(true);

        return claim;
      });
      //when
      const spySave = jest.spyOn(caseProgressionService, 'saveCaseProgression');
      await caseProgressionService.deleteUntickedDocumentsFromStore(MOCK_REQUEST, false);

      //then
      expect(spySave).toHaveBeenCalledWith(MOCK_REQUEST, getMockFullUploadDocumentsUserForm(), 'defendantDocuments');

    });
    it('should save Draftclaim with pre-existing files of unselected documents removed', async() => {
      //given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.id = MOCK_REQUEST.params.id;
        claim.caseProgression = new CaseProgression();
        claim.caseProgression.defendantDocuments = getMockEmptyUploadDocumentsUserForm();
        claim.caseProgression.defendantUploadDocuments = getMockUploadDocumentsSelected(false);

        return claim;
      });

      //when
      const spySave = jest.spyOn(caseProgressionService, 'saveCaseProgression');
      await caseProgressionService.deleteUntickedDocumentsFromStore(MOCK_REQUEST, false);

      //then
      expect(spySave).toHaveBeenCalledWith(MOCK_REQUEST, getMockEmptyUploadDocumentsUserForm(), 'defendantDocuments');
    });

    it('should save Draftclaim without pre-existing files as empty arrays for selected documents', async() => {
      //given
      const claimId = MOCK_REQUEST.params.id;

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.id = claimId;
        claim.caseProgression = new CaseProgression();
        claim.caseProgression.defendantDocuments = getMockEmptyUploadDocumentsUserForm();
        claim.caseProgression.defendantUploadDocuments = getMockUploadDocumentsSelected(true);

        return claim;
      });
      //when
      const spySave = jest.spyOn(caseProgressionService, 'saveCaseProgression');
      await caseProgressionService.deleteUntickedDocumentsFromStore(MOCK_REQUEST, false);

      //then
      expect(spySave).toHaveBeenCalledWith(MOCK_REQUEST, getMockEmptyUploadDocumentsUserForm(), 'defendantDocuments');
    });
  });
  describe('saveDocumentUpload', () => {
    const uploadDocuments = new UploadDocuments();
    uploadDocuments.expert = [];
    uploadDocuments.expert.push(new UploadDocumentTypes(true,undefined,EvidenceUploadExpert.ANSWERS_FOR_EXPERTS));

    it('should save defendantUploadDocuments expert successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.caseProgression = new CaseProgression();
        claim.caseProgression.defendantUploadDocuments = new UploadDocuments();

        return claim;
      });
      mockGenerateRedisKey.mockReturnValue('12345');
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const documentUploadToSave  = new Claim();
      documentUploadToSave.applicant1 = new Party();
      documentUploadToSave.caseProgression = new CaseProgression();
      documentUploadToSave.caseProgression.defendantUploadDocuments = new UploadDocuments();
      documentUploadToSave.caseProgression.defendantUploadDocuments.expert = [];
      documentUploadToSave.caseProgression.defendantUploadDocuments.expert.push(new UploadDocumentTypes(true,undefined,EvidenceUploadExpert.ANSWERS_FOR_EXPERTS));
      //'validClaimId'
      await caseProgressionService.saveCaseProgression(MOCK_REQUEST, uploadDocuments, 'defendantUploadDocuments');
      expect(spySave).toHaveBeenCalledWith('12345', documentUploadToSave);
    });
    it('should save claimantUploadDocuments expert successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.caseProgression = new CaseProgression();
        claim.caseProgression.claimantUploadDocuments = new UploadDocuments();

        return claim;
      });
      mockGenerateRedisKey.mockReturnValue('12345');

      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const documentUploadToSave  = new Claim();
      documentUploadToSave.applicant1 = new Party();
      documentUploadToSave.caseProgression = new CaseProgression();
      documentUploadToSave.caseProgression.claimantUploadDocuments = new UploadDocuments();
      documentUploadToSave.caseProgression.claimantUploadDocuments.expert = [];
      documentUploadToSave.caseProgression.claimantUploadDocuments.expert.push(new UploadDocumentTypes(true,undefined,EvidenceUploadExpert.ANSWERS_FOR_EXPERTS));
      //'validClaimId'
      await caseProgressionService.saveCaseProgression(MOCK_REQUEST, uploadDocuments, 'claimantUploadDocuments');
      expect(spySave).toHaveBeenCalledWith('12345', documentUploadToSave);
    });

    it('should save defendantTrialArrangements successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = getClaimWithDefendantTrialArrangements();
        return claim;
      });
      mockGenerateRedisKey.mockReturnValue('12345');
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const claimToSave  = getClaimWithDefendantTrialArrangements();
      //'validClaimId'
      await caseProgressionService.saveCaseProgression(MOCK_REQUEST, claimToSave.caseProgression.defendantTrialArrangements, 'defendantTrialArrangements');
      expect(spySave).toHaveBeenCalledWith('12345', claimToSave);
    });

    it('should save claimantTrialArrangements successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = getClaimWithClaimantTrialArrangements();
        return claim;
      });
      mockGenerateRedisKey.mockReturnValue('12345');
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      const claimToSave  = getClaimWithClaimantTrialArrangements();
      //'validClaimId'
      await caseProgressionService.saveCaseProgression(MOCK_REQUEST, claimToSave.caseProgression.claimantTrialArrangements, 'claimantTrialArrangements');
      expect(spySave).toHaveBeenCalledWith('12345', claimToSave);
    });

    it('should save defendantTrialArrangements successfully, when no Trial arrangements', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockGenerateRedisKey.mockReturnValue('12345');
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const claimToSave  = getClaimWithDefendantTrialArrangements();

      await caseProgressionService.saveCaseProgression(MOCK_REQUEST, claimToSave.caseProgression.defendantTrialArrangements, 'defendantTrialArrangements');
      expect(spySave).toHaveBeenCalledWith('12345', claimToSave);
    });

    it('should save claimantTrialArrangements successfully, when no Trial arrangements', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockGenerateRedisKey.mockReturnValue('12345');
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const claimToSave  = getClaimWithClaimantTrialArrangements();
      //'validClaimId'
      await caseProgressionService.saveCaseProgression(MOCK_REQUEST, claimToSave.caseProgression.claimantTrialArrangements, 'claimantTrialArrangements');
      expect(spySave).toHaveBeenCalledWith('12345', claimToSave);
    });

    it('should return an error on redis failure', async () => {
      mockGenerateRedisKey.mockReturnValue('12345');
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(REDIS_FAILURE);
      });

      await expect(caseProgressionService.saveCaseProgression(MOCK_REQUEST, mockGetCaseDataFromDraftStore, ''))
        .rejects.toThrow(REDIS_FAILURE);
    });
  });

  describe('getUploadDocumentsForm', () => {
    it('should correctly map sections from request body to UploadDocumentsUserForm object', () => {
      const mockRequest = {
        body: {
          documentsForDisclosure: [{name: 'doc1',dateInputFields: {dateDay:'1', dateMonth:'2', dateYear:'2003'} as DateInputFields}],
          disclosureList: [{file: 'file1',dateInputFields: {dateDay:'1', dateMonth:'2', dateYear:'2003'} as DateInputFields}],
          witnessStatement: [{witnessName: 'statement1',dateInputFields: {dateDay:'1', dateMonth:'2', dateYear:'2003'} as DateInputFields}],
          trialCaseSummary: [{file: 'caseSummary1'}],

        },
      } as any;

      const result = getUploadDocumentsForm(mockRequest);

      expect(result).toBeInstanceOf(UploadDocumentsUserForm);
      expect(result.documentsForDisclosure).toEqual([{
        'dateInputFields': {
          'date': new Date('2003-02-01T00:00:00.000Z'),
          'dateDay': '1',
          'dateMonth': '2',
          'dateYear': '2003',
        },
        'typeOfDocument': null,
      }]);
      expect(result.disclosureList).toEqual([{}]);
      expect(result.witnessStatement).toEqual([{
        'dateInputFields': {
          'date': new Date('2003-02-01T00:00:00.000Z'),
          'dateDay': '1',
          'dateMonth': '2',
          'dateYear': '2003',
        },
        'witnessName': 'statement1',
      }]);
      expect(result.trialCaseSummary).toEqual([{}]);
    });

    it('should return an empty UploadDocumentsUserForm object when request body is empty', () => {
      const mockRequest = {body: {}} as any;

      const result = getUploadDocumentsForm(mockRequest);

      expect(result).toBeInstanceOf(UploadDocumentsUserForm);
      expect(result.documentsForDisclosure).toBeDefined();
      expect(result.disclosureList).toBeDefined();
      expect(result.witnessStatement).toBeDefined();
      expect(result.witnessSummary).toBeDefined();
      expect(result.trialCaseSummary).toBeDefined();
    });

    it('should handle undefined sections gracefully in the request body', () => {
      const mockRequest = {
        body: {
          witnessSummary: undefined,
          expertReport: [{report: 'report1'}],
        },
      } as any;

      const result = getUploadDocumentsForm(mockRequest);

      expect(result).toBeInstanceOf(UploadDocumentsUserForm);
      expect(result.witnessSummary).toBeDefined();
      expect(result.expertReport).toEqual([{
        'dateInputFields': {},
        'expertName': null,
        'fieldOfExpertise': null,
        'multipleExpertsName': null,
        'otherPartyName': null,
        'otherPartyQuestionsDocumentName': null,
        'questionDocumentName': null}]);
    });

    it('should not mutate the original request object', () => {
      const mockRequest = {
        body: {
          expertStatement: [{statement: 'expertStatement'}],
        },
      } as any;

      const mockRequestClone = JSON.parse(JSON.stringify(mockRequest));

      getUploadDocumentsForm(mockRequest);
      expect(mockRequest.body).toEqual(mockRequestClone.body);
    });
  });

  describe('toNonEmptyTrimmedString', () => {
    it('trims leading and trailing spaces', () => {
      expect(toNonEmptyTrimmedString('  hello  ')).toBe('hello');
    });

    it('trims tabs and newlines', () => {
      expect(toNonEmptyTrimmedString('\t\nhello\n\t')).toBe('hello');
    });

    it('returns the same string when no trimming is needed', () => {
      expect(toNonEmptyTrimmedString('hello')).toBe('hello');
    });

    it('returns empty string when input is empty string', () => {
      expect(toNonEmptyTrimmedString('')).toBe('');
    });

    it('returns empty string when input is whitespace only', () => {
      expect(toNonEmptyTrimmedString('   \t\n  ')).toBe('');
    });

    it.each([
      0,
      42,
      true,
      false,
      null,
      undefined,
      {},
      [],
      Symbol('x'),
      BigInt(0),
    ])('returns empty string for non-string input: %p', (value) => {
      expect(toNonEmptyTrimmedString(value as unknown)).toBe(null);
    });
  });

  describe('readDateParts', () => {
    it('returns strings when numeric values are provided', () => {
      const request = {
        dateInputFields: { dateDay: 1, dateMonth: 2, dateYear: 2003 },
      };

      const result = readDateParts(request as unknown);

      expect(result).toEqual({ day: '1', month: '2', year: '2003' });
    });

    it('returns provided string values unchanged', () => {
      const request = {
        dateInputFields: { dateDay: '01', dateMonth: '02', dateYear: '1980' },
      };

      const result = readDateParts(request as unknown);

      expect(result).toEqual({ day: '01', month: '02', year: '1980' });
    });

    it('returns undefined for missing fields', () => {
      const request = {
        dateInputFields: { dateDay: '15' },
      };

      const result = readDateParts(request as unknown);

      expect(result).toEqual({ day: '15', month: undefined, year: undefined });
    });

    it('returns all undefined when dateInputFields is missing', () => {
      const request = {};
      const result = readDateParts(request as unknown);
      expect(result).toEqual({ day: undefined, month: undefined, year: undefined });
    });

    it('returns all undefined when request is null', () => {
      const result = readDateParts(null as unknown);
      expect(result).toEqual({ day: undefined, month: undefined, year: undefined });
    });

    it('returns undefined when a field is explicitly undefined', () => {
      const request = {
        dateInputFields: { dateMonth: '12', dateYear: '2025' },
      };

      const result = readDateParts(request as unknown);

      expect(result).toEqual({ day: undefined, month: '12', year: '2025' });
    });

    it('ignores extra fields and only returns day, month, year', () => {
      const request = {
        dateInputFields: {
          dateDay: '7',
          dateMonth: '8',
          dateYear: '2024',
          someOtherField: 'ignored',
        },
      };

      const result = readDateParts(request as unknown);

      expect(result).toEqual({ day: '7', month: '8', year: '2024' });
    });
  });

  describe('addAnother', () => {
    it.each([
      ['action-disclosure', 'documentsForDisclosure', TypeOfDocumentSection],
      ['action-disclosureList', 'disclosureList', FileOnlySection],
      ['action-witness', 'witnessStatement', WitnessSection],
      ['action-witnessSummary', 'witnessSummary', WitnessSummarySection],
      ['action-noticeOfIntention', 'noticeOfIntention', WitnessSection],
      ['action-documentsReferred', 'documentsReferred', ReferredToInTheStatementSection],
      ['action-expertReport', 'expertReport', ExpertSection],
      ['action-expertStatement', 'expertStatement', ExpertSection],
      ['action-questionsForExperts', 'questionsForExperts', ExpertSection],
      ['action-answersForExperts', 'answersForExperts', ExpertSection],
      ['action-trialCaseSummary', 'trialCaseSummary', FileOnlySection],
      ['action-trialSkeletonArgument', 'trialSkeletonArgument', FileOnlySection],
      ['action-trialAuthorities', 'trialAuthorities', FileOnlySection],
      ['action-trialCosts', 'trialCosts', FileOnlySection],
      ['action-trialDocumentary', 'trialDocumentary', TypeOfDocumentSection],
    ])(
      'adds %p to %p',
      (action, property, ExpectedClass) => {
        const uploadDocuments = new UploadDocumentsUserForm();
        (uploadDocuments as any)[property] = [];

        addAnother(uploadDocuments, action);

        const list = (uploadDocuments as any)[property];
        expect(list).toHaveLength(1);
        expect(list[0]).toBeInstanceOf(ExpectedClass);
      });

    it('creates a new instance on each call', () => {
      const uploadDocuments = new UploadDocumentsUserForm();
      uploadDocuments.documentsForDisclosure = [];

      addAnother(uploadDocuments, 'action-disclosure');
      addAnother(uploadDocuments, 'action-disclosure');

      expect(uploadDocuments.documentsForDisclosure).toHaveLength(2);
      expect(uploadDocuments.documentsForDisclosure[0]).not.toBe(uploadDocuments.documentsForDisclosure[1]);
    });

    it('does nothing for an unknown action', () => {
      const uploadDocuments = new UploadDocumentsUserForm();
      uploadDocuments.documentsForDisclosure = [];

      addAnother(uploadDocuments, 'action-unknown');

      expect(uploadDocuments.documentsForDisclosure).toHaveLength(0);
    });
  });
});
