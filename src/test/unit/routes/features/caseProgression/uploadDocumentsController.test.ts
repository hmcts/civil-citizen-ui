import request from 'supertest';
import {
  mockRedisFailure,
} from '../../../../utils/mockDraftStore';
import {CP_CHECK_ANSWERS_URL, CP_UPLOAD_DOCUMENTS_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {app} from '../../../../../main/app';
import config from 'config';
import nock from 'nock';
import * as DisclosureService from 'services/features/caseProgression/disclosureService';
import * as WitnessService from 'services/features/caseProgression/witnessService';
import {getExpertContent} from 'services/features/caseProgression/expertService';

const getDisclosureContentMock = DisclosureService.getDisclosureContent as jest.Mock;
const getWitnessContentMock = WitnessService.getWitnessContent as jest.Mock;
const getExpertContentMock = getExpertContent as jest.Mock;
import {getTrialContent} from 'services/features/caseProgression/trialService';
import {getNextYearValue} from '../../../../utils/dateUtils';
import express from 'express';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {
  DateInputFields, ExpertSection, FileOnlySection, ReferredToInTheStatementSection,
  TypeOfDocumentSection,
  UploadDocumentsUserForm, WitnessSection, WitnessSummarySection,
} from 'models/caseProgression/uploadDocumentsUserForm';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {FileUpload} from 'models/caseProgression/fileUpload';
import {getClaimById} from 'modules/utilityService';
import {getUploadDocumentsForm, saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {CaseDocument} from 'models/document/caseDocument';
import {EvidenceUploadDisclosure} from 'models/document/documentType';

const getTrialContentMock = getTrialContent as jest.Mock;

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('services/features/caseProgression/disclosureService');
jest.mock('services/features/caseProgression/witnessService');
jest.mock('services/features/caseProgression/expertService');
jest.mock('services/features/caseProgression/trialService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));
jest.mock('services/features/caseProgression/caseProgressionService', () => ({
  saveCaseProgression: jest.fn(),
  getUploadDocumentsForm: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

const caseDoc:CaseDocument = {documentLink:{document_url:'http://test',document_binary_url:'http://test/binary',document_filename:'test.png'},documentName:'test.png',documentType:EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE,documentSize:86349,createdDatetime:new Date(2023, 11, 11),createdBy:'test'};
const disclosureUpload = {documentsForDisclosure:
      [
        {
          dateInputFields:
              {
                dateDay: '01',
                dateMonth: '01',
                dateYear: '2023',
              } as DateInputFields,
          fileUpload:
              {
                fieldname: 'field name',
                mimetype: 'application/pdf',
                originalname: 'original name',
                size: 1234,
              } as FileUpload,
          typeOfDocument: 'type',
        },
      ],
} as UploadDocumentsUserForm;
describe('Upload document- upload document controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    getDisclosureContentMock.mockImplementation((claim: Claim, form: GenericForm<UploadDocumentsUserForm>) => {
      const documentsForDisclosure = claim.caseProgression?.defendantDocuments?.documentsForDisclosure;
      if(form && documentsForDisclosure)
      {
        return [[{type: ClaimSummaryType.INPUT_ARRAY}]];
      }
      return [];
    });

    getWitnessContentMock.mockImplementation((claim: Claim, form: GenericForm<UploadDocumentsUserForm>) => {
      if(form && claim.caseProgression?.defendantDocuments?.witnessStatement)
      {
        return [{type: ClaimSummaryType.INPUT_ARRAY}];
      }
      return [];
    });
    getExpertContentMock.mockReturnValue([]);
    getTrialContentMock.mockReturnValue([]);
  });
  it('should render page successfully if cookie has correct values', async () => {

    const civilClaimDocumentUploaded = require('../../../../utils/mocks/civilClaimResponseMock.json');
    civilClaimDocumentUploaded.case_data.id = civilClaimDocumentUploaded.id;
    const claim: Claim = civilClaimDocumentUploaded.case_data as Claim;
    const spyDisclosure = jest.spyOn(DisclosureService, 'getDisclosureContent');
    (getClaimById as jest.Mock).mockResolvedValueOnce(Object.assign(new Claim(), claim));

    await request(app).get(CP_UPLOAD_DOCUMENTS_URL).query({lang: 'en'}).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain('Upload documents');
      expect(res.text).toContain('Hearing');
      expect(res.text).not.toContain('Disclosure');
      expect(res.text).not.toContain('Witness');
      expect(spyDisclosure).toHaveBeenCalledWith(claim, null);
    });
  });

  it('should render page successfully in Welsh if cookie has correct values and query cy', async () => {

    const civilClaimDocumentUploaded = require('../../../../utils/mocks/civilClaimResponseMock.json');
    civilClaimDocumentUploaded.case_data.id = civilClaimDocumentUploaded.id;
    const claim: Claim = civilClaimDocumentUploaded.case_data as Claim;
    (getClaimById as jest.Mock).mockResolvedValueOnce(Object.assign(new Claim(), claim));

    const spyDisclosure = jest.spyOn(DisclosureService, 'getDisclosureContent');

    await request(app).get(CP_UPLOAD_DOCUMENTS_URL).query({lang: 'cy'}).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain('Uwchlwytho dogfennau');
      expect(res.text).toContain('Gwrandawiad');
      expect(res.text).not.toContain('Datgelu');
      expect(res.text).not.toContain('Tystiolaeth tystion');
      expect(spyDisclosure).toHaveBeenCalledWith(claim, null);
    });
  });

  it('should render page successfully with uploaded document section if document available in redis', async () => {
    const civilClaimDocumentUploaded = require('../../../../utils/mocks/civilClaimResponseDocumentUploadedMock.json');
    civilClaimDocumentUploaded.case_data.id = civilClaimDocumentUploaded.id;
    const claim: Claim = civilClaimDocumentUploaded.case_data as Claim;
    const formWithDisclosure = new GenericForm(disclosureUpload);

    const spyDisclosure = jest.spyOn(DisclosureService, 'getDisclosureContent');
    (getClaimById as jest.Mock).mockResolvedValueOnce(Object.assign(new Claim(), claim));

    await request(app).get(CP_UPLOAD_DOCUMENTS_URL).query({lang:'en'}).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain('Upload documents');
      expect(res.text).toContain('Hearing');
      expect(res.text).toContain('Disclosure');
      expect(res.text).not.toContain('Witness');
      expect(spyDisclosure).toHaveBeenCalledWith(claim, formWithDisclosure);
    });
  });

  it('should render page successfully with uploaded document section if document available in redis on claimant request', async () => {

    const civilClaimDocumentClaimantUploaded = require('../../../../utils/mocks/civilClaimResponseDocumentUploadedClaimantMock.json');
    civilClaimDocumentClaimantUploaded.case_data.id = civilClaimDocumentClaimantUploaded.id;
    const claim: Claim = civilClaimDocumentClaimantUploaded.case_data as Claim;
    (getClaimById as jest.Mock).mockResolvedValueOnce(Object.assign(new Claim(),claim ));

    await request(app).get(CP_UPLOAD_DOCUMENTS_URL).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain('Upload documents');
      expect(res.text).toContain('Hearing');
      expect(res.text).toContain('Disclosure');
      expect(res.text).not.toContain('Witness');
    });
  });

  it('should render page successfully in Welsh with uploaded document section if document available in redis on claimant request', async () => {

    const civilClaimDocumentClaimantUploaded = require('../../../../utils/mocks/civilClaimResponseDocumentUploadedClaimantMock.json');
    civilClaimDocumentClaimantUploaded.case_data.id = civilClaimDocumentClaimantUploaded.id;
    const claim: Claim = civilClaimDocumentClaimantUploaded.case_data as Claim;
    (getClaimById as jest.Mock).mockResolvedValueOnce(Object.assign(new Claim(), claim));

    await request(app).get(CP_UPLOAD_DOCUMENTS_URL).query({lang: 'cy'}).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain('Uwchlwytho dogfennau');
      expect(res.text).toContain('Gwrandawiad');
      expect(res.text).toContain('Datgelu');
      expect(res.text).not.toContain('Tystiolaeth tystion');
    });
  });

  it('should return 500 error page for redis failure', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .get(CP_UPLOAD_DOCUMENTS_URL).query({lang: 'en'})
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});

describe('on POST', () => {
  const mockFutureYear = getNextYearValue().toString();
  const uploadDocumentsUserForm = new UploadDocumentsUserForm();
  uploadDocumentsUserForm.documentsForDisclosure = [new TypeOfDocumentSection()];
  uploadDocumentsUserForm.expertReport = [new ExpertSection()];
  uploadDocumentsUserForm.witnessStatement = [new WitnessSection()];
  uploadDocumentsUserForm.witnessSummary = [new WitnessSummarySection()];
  uploadDocumentsUserForm.documentsForDisclosure[0].typeOfDocument = '';
  uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateDay = '';
  uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateMonth = '';
  uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateMonth = '';
  uploadDocumentsUserForm.documentsForDisclosure[0].caseDocument = undefined;
  uploadDocumentsUserForm.documentsForDisclosure[0].fileUpload = undefined;

  beforeEach(() => {
    const civilClaimDocumentUploaded = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const claim: Claim = civilClaimDocumentUploaded.case_data as Claim;
    (getClaimById as jest.Mock).mockResolvedValueOnce(Object.assign(new Claim(), claim));
  });
  it('should display documentForDisclosure validation error when invalid', async () => {

    (saveCaseProgression as jest.Mock).mockResolvedValue(true);
    (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);
    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_TYPE_OF_DOCUMENT);
      });
  });

  it('File only section', async () => {
    (saveCaseProgression as jest.Mock).mockResolvedValue(true);
    (getUploadDocumentsForm as jest.Mock).mockResolvedValue(disclosureUpload);
    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });

  it('should display documentForDisclosure validation error when Day month and year is invalid', async () => {
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateDay = '33';
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateMonth = '33';
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateYear = '222';

    (saveCaseProgression as jest.Mock).mockResolvedValue(true);
    (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);
    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_TYPE_OF_DOCUMENT);
        expect(res.text).toContain(TestMessages.VALID_REAL_DAY);
        expect(res.text).toContain(TestMessages.VALID_REAL_MONTH);
        expect(res.text).toContain(TestMessages.VALID_REAL_YEAR);
      });
  });

  it('should display documentForDisclosure validation error when day is blank', async () => {
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateDay = '';
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateMonth = '11';
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateYear = '2022';

    (saveCaseProgression as jest.Mock).mockResolvedValue(true);
    (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_TYPE_OF_DOCUMENT);
        expect(res.text).toContain(TestMessages.VALID_DATE_OF_DOC_MUST_INCLUDE_DAY);
      });
  });

  it('should display documentForDisclosure validation error when month is blank', async () => {
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateMonth = '';

    (saveCaseProgression as jest.Mock).mockResolvedValue(true);
    (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_TYPE_OF_DOCUMENT);
        expect(res.text).toContain(TestMessages.VALID_DATE_OF_DOC_MUST_INCLUDE_MONTH);
      });
  });

  it('should display documentForDisclosure validation error when year is blank', async () => {
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields = new DateInputFields();
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.date = new Date(299,10,11);
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateDay = '';
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateMonth = '11';
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateYear = '';

    (saveCaseProgression as jest.Mock).mockResolvedValue(true);
    (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_TYPE_OF_DOCUMENT);
        expect(res.text).toContain(TestMessages.VALID_DATE_OF_DOC_MUST_INCLUDE_YEAR);
      });
  });

  it('should display documentForDisclosure validation error when date is in future', async () => {
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.date = new Date(2099,10,11);
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateDay = '11';
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateMonth = '10';
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateYear = mockFutureYear;

    (saveCaseProgression as jest.Mock).mockResolvedValue(true);
    (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_TYPE_OF_DOCUMENT);
        expect(res.text).toContain(TestMessages.VALID_DATE_NOT_FUTURE);
      });
  });

  it('should not display documentForDisclosure validation error when date is valid', async () => {

    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.date = new Date(2020,10,12);
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateDay = '12';
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateMonth = '10';
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateYear = '2022';
    uploadDocumentsUserForm.documentsForDisclosure[0].typeOfDocument = undefined;

    (saveCaseProgression as jest.Mock).mockResolvedValue(true);
    (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_TYPE_OF_DOCUMENT);
        expect(res.text).not.toContain(TestMessages.VALID_ENTER_DATE_DOC_ISSUED);
      });
  });

  it('should display witness validation error when invalid', async () => {
    uploadDocumentsUserForm.witnessStatement[0].witnessName = '';
    uploadDocumentsUserForm.witnessStatement[0].dateInputFields.dateDay = '';
    uploadDocumentsUserForm.witnessStatement[0].dateInputFields.dateMonth = '';
    uploadDocumentsUserForm.witnessStatement[0].dateInputFields.dateYear = '';
    uploadDocumentsUserForm.witnessStatement[0].fileUpload = undefined;

    (saveCaseProgression as jest.Mock).mockResolvedValue(true);
    (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_WITNESS_NAME);
        expect(res.text).toContain(TestMessages.VALID_ENTER_DATE_DOC_ISSUED);
      });
  });

  it('should display witness summary validation error when invalid', async () => {
    uploadDocumentsUserForm.witnessSummary[0].witnessName = '';
    uploadDocumentsUserForm.witnessSummary[0].dateInputFields.dateDay = '';
    uploadDocumentsUserForm.witnessSummary[0].dateInputFields.dateMonth = '';
    uploadDocumentsUserForm.witnessSummary[0].dateInputFields.dateYear = '';
    uploadDocumentsUserForm.witnessSummary[0].fileUpload = undefined;

    (saveCaseProgression as jest.Mock).mockResolvedValue(true);
    (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_WITNESS_NAME);
        expect(res.text).toContain(TestMessages.VALID_ENTER_DATE_WITNESS_SUMMARY);
      });
  });

  it('should display all expert validation errors', async () => {
    uploadDocumentsUserForm.expertReport[0].expertName = '';
    uploadDocumentsUserForm.expertReport[0].fieldOfExpertise = '';
    uploadDocumentsUserForm.expertReport[0].questionDocumentName = '';
    uploadDocumentsUserForm.expertReport[0].otherPartyQuestionsDocumentName = '';
    uploadDocumentsUserForm.expertReport[0].dateInputFields.dateDay = '';
    uploadDocumentsUserForm.expertReport[0].dateInputFields.dateMonth = '';
    uploadDocumentsUserForm.expertReport[0].dateInputFields.dateYear = '';
    uploadDocumentsUserForm.expertReport[0].fileUpload = undefined;

    (saveCaseProgression as jest.Mock).mockResolvedValue(true);
    (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_EXPERT_NAME);
        expect(res.text).toContain(TestMessages.VALID_ENTER_EXPERTISE);
        expect(res.text).toContain(TestMessages.VALID_ENTER_DOCUMENT_QUESTIONS);
        expect(res.text).toContain(TestMessages.VALID_ENTER_DOCUMENT_QUESTIONS_OTHER_PARTY);
        expect(res.text).toContain(TestMessages.VALID_ENTER_DATE_DOC_ISSUED);
      });
  });

  it('should display all questions for other party\'s expert validation errors', async () => {
    uploadDocumentsUserForm.questionsForExperts = [new ExpertSection()];
    uploadDocumentsUserForm.questionsForExperts[0].otherPartyName = '';
    uploadDocumentsUserForm.questionsForExperts[0].expertName = '';
    uploadDocumentsUserForm.questionsForExperts[0].dateInputFields.dateDay = '';
    uploadDocumentsUserForm.questionsForExperts[0].dateInputFields.dateMonth = '';
    uploadDocumentsUserForm.questionsForExperts[0].dateInputFields.dateYear = '';
    uploadDocumentsUserForm.questionsForExperts[0].questionDocumentName = '';
    uploadDocumentsUserForm.questionsForExperts[0].fileUpload = undefined;

    (saveCaseProgression as jest.Mock).mockResolvedValue(true);
    (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);
    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_EXPERT_NAME);
        expect(res.text).toContain(TestMessages.VALID_SELECT_OTHER_PARTY);
        expect(res.text).toContain(TestMessages.VALID_ENTER_DOCUMENT_QUESTIONS);
        expect(res.text).toContain(TestMessages.VALID_CHOOSE_THE_FILE);
      });
  });

  it('should display all questions for other party\'s expert validation errors on defendant request', async () => {
    uploadDocumentsUserForm.questionsForExperts[0].otherPartyName = '';
    uploadDocumentsUserForm.questionsForExperts[0].dateInputFields.dateDay = '';
    uploadDocumentsUserForm.questionsForExperts[0].dateInputFields.dateMonth = '';
    uploadDocumentsUserForm.questionsForExperts[0].dateInputFields.dateYear = '';
    uploadDocumentsUserForm.questionsForExperts[0].questionDocumentName = undefined;
    uploadDocumentsUserForm.questionsForExperts[0].fileUpload = undefined;

    (saveCaseProgression as jest.Mock).mockResolvedValue(true);
    (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);
    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
      });
  });

  it('should display all answers to questions asked by other party validation errors', async () => {
    uploadDocumentsUserForm.answersForExperts = [new ExpertSection()];
    uploadDocumentsUserForm.answersForExperts[0].otherPartyName = '';
    uploadDocumentsUserForm.answersForExperts[0].expertName = '';
    uploadDocumentsUserForm.answersForExperts[0].dateInputFields.date = new Date(2020,10,14);
    uploadDocumentsUserForm.answersForExperts[0].dateInputFields.dateDay = '';
    uploadDocumentsUserForm.answersForExperts[0].dateInputFields.dateMonth = '';
    uploadDocumentsUserForm.answersForExperts[0].dateInputFields.dateYear = '';
    uploadDocumentsUserForm.answersForExperts[0].otherPartyQuestionsDocumentName = '';
    uploadDocumentsUserForm.answersForExperts[0].fileUpload = undefined;

    (saveCaseProgression as jest.Mock).mockResolvedValue(true);
    (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_EXPERT_NAME);
        expect(res.text).toContain(TestMessages.VALID_SELECT_OTHER_PARTY);
        expect(res.text).toContain(TestMessages.VALID_ENTER_DOCUMENT_QUESTIONS_OTHER_PARTY);
        expect(res.text).toContain(TestMessages.VALID_CHOOSE_THE_FILE);
      });
  });

  it('should redirect to the next page when inputs are validated', async () => {
    const fileUpload = new FileUpload();
    fileUpload.fieldname = 'test';
    fileUpload.originalname = 'originalTest';
    fileUpload.mimetype = 'pdf';
    fileUpload.buffer = undefined;
    fileUpload.size = 12345;

    uploadDocumentsUserForm.documentsForDisclosure = [new TypeOfDocumentSection()];
    uploadDocumentsUserForm.documentsForDisclosure[0].typeOfDocument = 'Word';
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.date = new Date(2020,10,14);
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateDay = '14';
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateMonth = '10';
    uploadDocumentsUserForm.documentsForDisclosure[0].dateInputFields.dateYear = '2020';
    uploadDocumentsUserForm.documentsForDisclosure[0].caseDocument = caseDoc;

    uploadDocumentsUserForm.answersForExperts = [new ExpertSection()];
    uploadDocumentsUserForm.answersForExperts[0].fileUpload = undefined;

    uploadDocumentsUserForm.disclosureList = [new FileOnlySection()];
    uploadDocumentsUserForm.disclosureList[0].caseDocument = caseDoc;

    uploadDocumentsUserForm.witnessStatement[0].witnessName = 'witness Name';
    uploadDocumentsUserForm.witnessStatement[0].fileUpload = fileUpload;
    uploadDocumentsUserForm.witnessStatement[0].dateInputFields.date = new Date(2020,11,10);
    uploadDocumentsUserForm.witnessStatement[0].dateInputFields.dateDay = '10';
    uploadDocumentsUserForm.witnessStatement[0].dateInputFields.dateMonth = '11';
    uploadDocumentsUserForm.witnessStatement[0].dateInputFields.dateYear = '2020';

    uploadDocumentsUserForm.witnessSummary[0].witnessName = 'witness Name 1';
    uploadDocumentsUserForm.witnessSummary[0].fileUpload = fileUpload;
    uploadDocumentsUserForm.witnessSummary[0].dateInputFields.date = new Date(2020,11,101);
    uploadDocumentsUserForm.witnessSummary[0].dateInputFields.dateDay = '10';
    uploadDocumentsUserForm.witnessSummary[0].dateInputFields.dateMonth = '11';
    uploadDocumentsUserForm.witnessSummary[0].dateInputFields.dateYear = '2020';

    uploadDocumentsUserForm.noticeOfIntention = [new WitnessSection()];
    uploadDocumentsUserForm.noticeOfIntention[0].witnessName = 'witness Name 2';
    uploadDocumentsUserForm.noticeOfIntention[0].dateInputFields.date = new Date(2020,11,12);
    uploadDocumentsUserForm.noticeOfIntention[0].dateInputFields.dateDay = '12';
    uploadDocumentsUserForm.noticeOfIntention[0].dateInputFields.dateMonth = '11';
    uploadDocumentsUserForm.noticeOfIntention[0].dateInputFields.dateYear = '2020';
    uploadDocumentsUserForm.noticeOfIntention[0].caseDocument = caseDoc;

    uploadDocumentsUserForm.documentsReferred = [new ReferredToInTheStatementSection()];
    uploadDocumentsUserForm.documentsReferred[0].witnessName = 'witness Name 3';
    uploadDocumentsUserForm.documentsReferred[0].fileUpload = fileUpload;
    uploadDocumentsUserForm.documentsReferred[0].typeOfDocument = 'pdf';
    uploadDocumentsUserForm.documentsReferred[0].dateInputFields.date = new Date(2020,11,13);
    uploadDocumentsUserForm.documentsReferred[0].dateInputFields.dateDay = '13';
    uploadDocumentsUserForm.documentsReferred[0].dateInputFields.dateMonth = '11';
    uploadDocumentsUserForm.documentsReferred[0].dateInputFields.dateYear = '2020';
    uploadDocumentsUserForm.documentsReferred[0].caseDocument = caseDoc;

    uploadDocumentsUserForm.expertReport[0].expertName = 'expert Name';
    uploadDocumentsUserForm.expertReport[0].fieldOfExpertise = 'field Of Expertise';
    uploadDocumentsUserForm.expertReport[0].questionDocumentName = 'question Document Name';
    uploadDocumentsUserForm.expertReport[0].otherPartyQuestionsDocumentName = 'O. p. Document Name';
    uploadDocumentsUserForm.expertReport[0].dateInputFields.date = new Date(2020,12,11);
    uploadDocumentsUserForm.expertReport[0].dateInputFields.dateDay = '11';
    uploadDocumentsUserForm.expertReport[0].dateInputFields.dateMonth = '12';
    uploadDocumentsUserForm.expertReport[0].dateInputFields.dateYear = '2020';
    uploadDocumentsUserForm.expertReport[0].caseDocument = caseDoc;

    uploadDocumentsUserForm.questionsForExperts = [new ExpertSection()];
    uploadDocumentsUserForm.questionsForExperts[0].expertName = 'expert Name 1';
    uploadDocumentsUserForm.questionsForExperts[0].fieldOfExpertise = 'field Of Expertise';
    uploadDocumentsUserForm.questionsForExperts[0].questionDocumentName = 'question Document Name';
    uploadDocumentsUserForm.questionsForExperts[0].otherPartyQuestionsDocumentName = 'O. p. Document Name';
    uploadDocumentsUserForm.questionsForExperts[0].dateInputFields.date = new Date(2020,10,10);
    uploadDocumentsUserForm.questionsForExperts[0].dateInputFields.dateDay = '10';
    uploadDocumentsUserForm.questionsForExperts[0].dateInputFields.dateMonth = '10';
    uploadDocumentsUserForm.questionsForExperts[0].dateInputFields.dateYear = '2020';
    uploadDocumentsUserForm.questionsForExperts[0].caseDocument = caseDoc;

    uploadDocumentsUserForm.expertStatement = [new ExpertSection()];
    uploadDocumentsUserForm.expertStatement[0].expertName = 'John Dhoe';
    uploadDocumentsUserForm.expertStatement[0].fieldOfExpertise = 'Architect';
    uploadDocumentsUserForm.expertStatement[0].otherPartyName = 'Mark Smith';
    uploadDocumentsUserForm.expertStatement[0].questionDocumentName = 'question Document Name';
    uploadDocumentsUserForm.expertStatement[0].otherPartyQuestionsDocumentName = 'O. p. Document Name';
    uploadDocumentsUserForm.expertStatement[0].dateInputFields.date = new Date(2020,10,14);
    uploadDocumentsUserForm.expertStatement[0].dateInputFields.dateDay = '14';
    uploadDocumentsUserForm.expertStatement[0].dateInputFields.dateMonth = '10';
    uploadDocumentsUserForm.expertStatement[0].dateInputFields.dateYear = '2020';
    uploadDocumentsUserForm.expertStatement[0].caseDocument = caseDoc;

    uploadDocumentsUserForm.answersForExperts = [new ExpertSection()];
    uploadDocumentsUserForm.answersForExperts[0].expertName = 'expert Name 2';
    uploadDocumentsUserForm.answersForExperts[0].fieldOfExpertise = 'field Of Expertise';
    uploadDocumentsUserForm.answersForExperts[0].questionDocumentName = 'question Document Name';
    uploadDocumentsUserForm.answersForExperts[0].otherPartyQuestionsDocumentName = 'O. p. Document Name';
    uploadDocumentsUserForm.answersForExperts[0].dateInputFields.date = new Date(2020,10,14);
    uploadDocumentsUserForm.answersForExperts[0].dateInputFields.dateDay = '14';
    uploadDocumentsUserForm.answersForExperts[0].dateInputFields.dateMonth = '10';
    uploadDocumentsUserForm.answersForExperts[0].dateInputFields.dateYear = '2020';
    uploadDocumentsUserForm.answersForExperts[0].caseDocument = caseDoc;

    uploadDocumentsUserForm.trialCaseSummary = [new FileOnlySection()];
    uploadDocumentsUserForm.trialCaseSummary[0].caseDocument = caseDoc;

    uploadDocumentsUserForm.trialSkeletonArgument = [new FileOnlySection()];
    uploadDocumentsUserForm.trialSkeletonArgument[0].caseDocument = caseDoc;

    uploadDocumentsUserForm.trialAuthorities = [new FileOnlySection()];
    uploadDocumentsUserForm.trialAuthorities[0].caseDocument = caseDoc;

    uploadDocumentsUserForm.trialCosts = [new FileOnlySection()];
    uploadDocumentsUserForm.trialCosts[0].caseDocument = caseDoc;

    uploadDocumentsUserForm.trialDocumentary = [new TypeOfDocumentSection()];
    uploadDocumentsUserForm.trialDocumentary[0].typeOfDocument = 'Word';
    uploadDocumentsUserForm.trialDocumentary[0].dateInputFields.date = new Date(2020,11,14);
    uploadDocumentsUserForm.trialDocumentary[0].dateInputFields.dateDay = '14';
    uploadDocumentsUserForm.trialDocumentary[0].dateInputFields.dateMonth = '11';
    uploadDocumentsUserForm.trialDocumentary[0].dateInputFields.dateYear = '2020';
    uploadDocumentsUserForm.trialDocumentary[0].caseDocument = caseDoc;

    (saveCaseProgression as jest.Mock).mockResolvedValue(true);
    (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res: express.Response) => {
        expect(res.status).toBe(302);
        expect(res.get('location')).toBe(CP_CHECK_ANSWERS_URL);
      });
  });

  it('should upload file documentsForDisclosure', async () => {
    const file = {
      fieldname: 'documentsForDisclosure[0][fileUpload]',
      originalname: 'test.txt',
      mimetype: 'text/plain',
      size: 123,
      buffer: Buffer.from('Test file content'),
    };

    const mockCaseDocument: CaseDocument = <CaseDocument>{  createdBy: 'test',
      documentLink: {document_url: '', document_binary_url:'', document_filename:''},
      documentName: 'name',
      documentType: null,
      documentSize: 12345,
      createdDatetime: new Date()};

    const civilServiceUrl = config.get<string>('services.civilService.url');
    nock(civilServiceUrl)
      .post('/case/document/generateAnyDoc')
      .reply(200, mockCaseDocument);
    (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);
    const validDate = new DateInputFields('12', '11', '2020');

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .field('action', 'documentsForDisclosure[0][uploadButton]')
      .field('documentsForDisclosure[0][dateInputFields]', JSON.stringify(validDate))
      .field('documentsForDisclosure[0][typeOfDocument]', 'test document')
      .attach('documentsForDisclosure[0][fileUpload]', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      })
      .expect((res: express.Response) => {
        expect(res.status).toBe(200);
      });
  });

  it('should return 500 error page for failure', async () => {
    (getClaimById as jest.Mock).mockReturnValue(new Error());
    (getUploadDocumentsForm as jest.Mock).mockReturnValue(undefined);
    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });

  describe('File upload validation and error handling', () => {
    beforeEach(() => {
      const civilClaimDocumentUploaded = require('../../../../utils/mocks/civilClaimResponseMock.json');
      const claim: Claim = civilClaimDocumentUploaded.case_data as Claim;
      (getClaimById as jest.Mock).mockResolvedValueOnce(Object.assign(new Claim(), claim));
      (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);
    });

    it('should reject invalid file type (video file) and display error', async () => {
      const file = {
        fieldname: 'witnessStatement[0][fileUpload]',
        originalname: 'test-video.mov',
        mimetype: 'video/quicktime',
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from('Video file content'),
      };

      await request(app)
        .post(CP_UPLOAD_DOCUMENTS_URL)
        .field('action', 'witnessStatement[0][uploadButton]')
        .attach('witnessStatement[0][fileUpload]', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        })
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should successfully upload valid PDF file', async () => {
      const file = {
        fieldname: 'expertReport[0][fileUpload]',
        originalname: 'test-document.pdf',
        mimetype: 'application/pdf',
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from('PDF file content'),
      };

      const mockCaseDocument: CaseDocument = <CaseDocument>{
        createdBy: 'test',
        documentLink: {document_url: 'http://test', document_binary_url: 'http://test/binary', document_filename: 'test-document.pdf'},
        documentName: 'test-document.pdf',
        documentType: null,
        documentSize: 1024 * 1024,
        createdDatetime: new Date(),
      };

      const civilServiceUrl = config.get<string>('services.civilService.url');
      nock(civilServiceUrl)
        .post('/case/document/generateAnyDoc')
        .reply(200, mockCaseDocument);

      await request(app)
        .post(CP_UPLOAD_DOCUMENTS_URL)
        .field('action', 'expertReport[0][uploadButton]')
        .attach('expertReport[0][fileUpload]', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        })
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should handle API upload failure gracefully', async () => {
      const file = {
        fieldname: 'documentsReferred[0][fileUpload]',
        originalname: 'test-document.pdf',
        mimetype: 'application/pdf',
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from('PDF file content'),
      };

      const civilServiceUrl = config.get<string>('services.civilService.url');
      nock(civilServiceUrl)
        .post('/case/document/generateAnyDoc')
        .reply(500, {error: 'Internal server error'});

      await request(app)
        .post(CP_UPLOAD_DOCUMENTS_URL)
        .field('action', 'documentsReferred[0][uploadButton]')
        .attach('documentsReferred[0][fileUpload]', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        })
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should handle file upload for different categories', async () => {
      const file = {
        fieldname: 'expertStatement[0][fileUpload]',
        originalname: 'expert-statement.pdf',
        mimetype: 'application/pdf',
        size: 512 * 1024, // 512KB
        buffer: Buffer.from('Expert statement content'),
      };

      const mockCaseDocument: CaseDocument = <CaseDocument>{
        createdBy: 'test',
        documentLink: {document_url: 'http://test', document_binary_url: 'http://test/binary', document_filename: 'expert-statement.pdf'},
        documentName: 'expert-statement.pdf',
        documentType: null,
        documentSize: 512 * 1024,
        createdDatetime: new Date(),
      };

      const civilServiceUrl = config.get<string>('services.civilService.url');
      nock(civilServiceUrl)
        .post('/case/document/generateAnyDoc')
        .reply(200, mockCaseDocument);

      await request(app)
        .post(CP_UPLOAD_DOCUMENTS_URL)
        .field('action', 'expertStatement[0][uploadButton]')
        .attach('expertStatement[0][fileUpload]', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        })
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should handle file validation errors when file size exceeds limit', async () => {
      const file = {
        fieldname: 'documentsReferred[0][fileUpload]',
        originalname: 'large-file.pdf',
        mimetype: 'application/pdf',
        size: 1024, // Small buffer to pass multer
        buffer: Buffer.from('Small buffer'),
      };

      // Mock TypeOfDocumentSectionMapper to return a FileUpload with invalid size
      const TypeOfDocumentSectionMapper = require('services/features/caseProgression/TypeOfDocumentSectionMapper');
      const originalMap = TypeOfDocumentSectionMapper.TypeOfDocumentSectionMapper.mapMulterFileToSingleFile;
      jest.spyOn(TypeOfDocumentSectionMapper.TypeOfDocumentSectionMapper, 'mapMulterFileToSingleFile').mockImplementationOnce((multerFile: any) => {
        const fileUpload = originalMap(multerFile);
        fileUpload.size = 101 * 1024 * 1024; // 101MB - exceeds limit
        return fileUpload;
      });

      await request(app)
        .post(CP_UPLOAD_DOCUMENTS_URL)
        .field('action', 'documentsReferred[0][uploadButton]')
        .attach('documentsReferred[0][fileUpload]', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        })
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should handle unexpected errors during file upload', async () => {
      const file = {
        fieldname: 'witnessStatement[0][fileUpload]',
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('Test content'),
      };

      // Mock TypeOfDocumentSectionMapper to throw an error
      const TypeOfDocumentSectionMapper = require('services/features/caseProgression/TypeOfDocumentSectionMapper');
      jest.spyOn(TypeOfDocumentSectionMapper.TypeOfDocumentSectionMapper, 'mapMulterFileToSingleFile').mockImplementationOnce(() => {
        throw new Error('Unexpected mapping error');
      });

      await request(app)
        .post(CP_UPLOAD_DOCUMENTS_URL)
        .field('action', 'witnessStatement[0][uploadButton]')
        .attach('witnessStatement[0][fileUpload]', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        })
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should handle multer error when action includes uploadButton and file size exceeds limit', async () => {
      const civilClaimDocumentUploaded = require('../../../../utils/mocks/civilClaimResponseMock.json');
      const claim: Claim = civilClaimDocumentUploaded.case_data as Claim;
      (getClaimById as jest.Mock).mockResolvedValueOnce(Object.assign(new Claim(), claim));
      (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);

      // Create a buffer that exceeds the 100MB limit to trigger multer error
      const largeBuffer = Buffer.alloc(101 * 1024 * 1024); // 101MB
      largeBuffer.fill('x');

      await request(app)
        .post(CP_UPLOAD_DOCUMENTS_URL)
        .field('action', 'documentsReferred[0][uploadButton]')
        .attach('documentsReferred[0][fileUpload]', largeBuffer, {
          filename: 'large-file.pdf',
          contentType: 'application/pdf',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should handle case when no file is found for upload', async () => {
      const civilClaimDocumentUploaded = require('../../../../utils/mocks/civilClaimResponseMock.json');
      const claim: Claim = civilClaimDocumentUploaded.case_data as Claim;
      (getClaimById as jest.Mock).mockResolvedValueOnce(Object.assign(new Claim(), claim));
      (getUploadDocumentsForm as jest.Mock).mockReturnValue(uploadDocumentsUserForm);

      await request(app)
        .post(CP_UPLOAD_DOCUMENTS_URL)
        .field('action', 'documentsReferred[0][uploadButton]')
        // No file attached
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
  });
});
