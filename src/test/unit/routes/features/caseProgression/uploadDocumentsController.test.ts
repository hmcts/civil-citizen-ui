import request from 'supertest';
import {
  mockCivilClaim,
  mockRedisFailure,
} from '../../../../utils/mockDraftStore';
import {CP_CHECK_ANSWERS_URL, CP_UPLOAD_DOCUMENTS_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {app} from '../../../../../main/app';
import config from 'config';
import nock from 'nock';
import {getDisclosureContent} from 'services/features/caseProgression/disclosureService';
import {getWitnessContent} from 'services/features/caseProgression/witnessService';
import {getExpertContent} from 'services/features/caseProgression/expertService';

const getDisclosureContentMock = getDisclosureContent as jest.Mock;
const getWitnessContentMock = getWitnessContent as jest.Mock;
const getExpertContentMock = getExpertContent as jest.Mock;
import {t} from 'i18next';
import {getTrialContent} from 'services/features/caseProgression/trialService';
import {getNextYearValue} from '../../../../utils/dateUtils';
import express from 'express';

const getTrialContentMock = getTrialContent as jest.Mock;

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('services/features/caseProgression/disclosureService');
jest.mock('services/features/caseProgression/witnessService');
jest.mock('services/features/caseProgression/expertService');
jest.mock('services/features/caseProgression/trialService');

describe('Upload document- upload document controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    getDisclosureContentMock.mockReturnValue([]);
    getWitnessContentMock.mockReturnValue([]);
    getExpertContentMock.mockReturnValue([]);
    getTrialContentMock.mockReturnValue([]);
  });

  it('should render page successfully if cookie has correct values', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app).get(CP_UPLOAD_DOCUMENTS_URL).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.UPLOAD_DOCUMENTS.TITLE'));
    });
  });

  it('should return 500 error page for redis failure', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .get(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});

describe('on POST', () => {
  const mockFutureYear = getNextYearValue().toString();
  beforeEach(() => {
    app.locals.draftStoreClient = mockCivilClaim;
  });
  it('should display documentForDisclosure validation error when invalid', async () => {
    const documentForDisclosureModel = {'documentsForDisclosure':[{'typeOfDocument':'', 'dateDay':'','dateMonth':'','dateYear':'','fileUpload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(documentForDisclosureModel)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_TYPE_OF_DOCUMENT);
      });
  });

  it('should display disclosureList validation error when invalid', async () => {
    const disclosureList = {'disclosureList':[{'fileUpload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(disclosureList)
      .expect((res) => {
        expect(res.status).toBe(200);
      });
  });

  it('should display documentForDisclosure validation error when Day month and year is invalid', async () => {
    const documentForDisclosureModel = {'documentsForDisclosure':[{'typeOfDocument':'', 'dateDay':'45','dateMonth':'17','dateYear':'202','fileUpload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(documentForDisclosureModel)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_TYPE_OF_DOCUMENT);
        expect(res.text).toContain(TestMessages.VALID_REAL_DATE);
      });
  });

  it('should display documentForDisclosure validation error when day is blank', async () => {
    const documentForDisclosureModel = {'documentsForDisclosure':[{'typeOfDocument':'', 'dateDay':'','dateMonth':'11','dateYear':'2022','fileUpload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(documentForDisclosureModel)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_TYPE_OF_DOCUMENT);
        expect(res.text).toContain(TestMessages.VALID_DATE_OF_DOC_MUST_INCLUDE_DAY);
      });
  });

  it('should display documentForDisclosure validation error when month is blank', async () => {
    const documentForDisclosureModel = {'documentsForDisclosure':[{'typeOfDocument':'', 'dateDay':'12','dateMonth':'','dateYear':'2022','fileUpload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(documentForDisclosureModel)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_TYPE_OF_DOCUMENT);
        expect(res.text).toContain(TestMessages.VALID_DATE_OF_DOC_MUST_INCLUDE_MONTH);
      });
  });

  it('should display documentForDisclosure validation error when year is blank', async () => {
    const documentForDisclosureModel = {'documentsForDisclosure':[{'typeOfDocument':'', 'dateDay':'12','dateMonth':'11','dateYear':'','fileUpload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(documentForDisclosureModel)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_TYPE_OF_DOCUMENT);
        expect(res.text).toContain(TestMessages.VALID_DATE_OF_DOC_MUST_INCLUDE_YEAR);
      });
  });

  it('should display documentForDisclosure validation error when date is in future', async () => {
    const documentForDisclosureModel = {'documentsForDisclosure':[{'typeOfDocument':'', 'dateDay':'12','dateMonth':'11','dateYear':mockFutureYear,'fileUpload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(documentForDisclosureModel)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_TYPE_OF_DOCUMENT);
        expect(res.text).toContain(TestMessages.VALID_DATE_NOT_FUTURE);
      });
  });

  it('should not display documentForDisclosure validation error when date is valid', async () => {
    const documentForDisclosureModel = {'documentsForDisclosure':[{'typeOfDocument':'', 'dateDay':'12','dateMonth':'11','dateYear':'2022','fileUpload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(documentForDisclosureModel)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_TYPE_OF_DOCUMENT);
        expect(res.text).not.toContain(TestMessages.VALID_ENTER_DATE_DOC_ISSUED);
      });
  });

  it('should display witness validation error when invalid', async () => {
    const model = {'witnessStatement':[{'witnessName':'', 'dateDay':'','dateMonth':'','dateYear':'','fileUpload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(model)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_WITNESS_NAME);
        expect(res.text).toContain(TestMessages.VALID_ENTER_DATE_DOC_ISSUED);
      });
  });

  it('should display all expert validation errors', async () => {
    const model = {'expertReport':[{'expertName':'', 'fieldOfExpertise':'', 'questionDocumentName':'', 'otherPartyQuestionsDocumentName':'', 'dateDay':'','dateMonth':'','dateYear':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(model)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_EXPERT_NAME);
        expect(res.text).toContain(TestMessages.VALID_ENTER_EXPERTISE);
        expect(res.text).toContain(TestMessages.VALID_ENTER_DOCUMENT_QUESTIONS);
        expect(res.text).toContain(TestMessages.VALID_ENTER_DOCUMENT_QUESTIONS_OTHER_PARTY);
        expect(res.text).toContain(TestMessages.VALID_ENTER_DATE_DOC_ISSUED);
      });
  });

  it('should redirect to the next page when inputs are validated', async () => {

    const documentForDisclosureModel = {'documentsForDisclosure':[{'typeOfDocument':'Word', 'dateDay':'14','dateMonth':'10','dateYear':'2020','fileUpload':'Evidence_01.pdf'}]};
    const disclosureList = {'disclosureList':[{'fileUpload':'Evidence_02.pdf'}]};

    const witnessStatement = {'witnessStatement':[{'witnessName':'witness Name', 'dateDay':'10','dateMonth':'11','dateYear':'2020','fileUpload':'Evidence_03.pdf'}]};
    const witnessSummary = {'witnessSummary':[{'witnessName':'witness Name 1', 'dateDay':'11','dateMonth':'11','dateYear':'2020','fileUpload':'Evidence_04.pdf'}]};
    const noticeOfIntention = {'noticeOfIntention':[{'witnessName':'witness Name 2', 'dateDay':'12','dateMonth':'11','dateYear':'2020','fileUpload':'Evidence_05.pdf'}]};
    const documentsReferred = {'documentsReferred':[{'typeOfDocument':'Word', 'dateDay':'13','dateMonth':'11','dateYear':'2020','fileUpload':'Evidence_06.pdf'}]};

    const expertReport = {'expertReport':[{'expertName':'expert Name', 'fieldOfExpertise':'field Of Expertise', 'questionDocumentName':'question Document Name', 'otherPartyQuestionsDocumentName':'O. p. Document Name', 'dateDay':'11','dateMonth':'12','dateYear':'2020', 'fileUpload':'Evidence_12.pdf'}]};
    const expertStatement = {'expertStatement':[{'expertName':'John Dhoe','fieldOfExpertise':'Architect','otherPartyName':'Mark Smith', 'questionDocumentName':'question Document Name', 'otherPartyQuestionsDocumentName':'O. p. Document Name', 'fileUpload':'Evidence_13.pdf'}]};
    const questionsForExperts = {'questionsForExperts':[{'expertName':'expert Name 1', 'fieldOfExpertise':'field Of Expertise', 'questionDocumentName':'question Document Name', 'otherPartyQuestionsDocumentName':'O. p. Document Name', 'dateDay':'10','dateMonth':'10','dateYear':'2020', 'fileUpload':'Evidence_14.pdf'}]};
    const answersForExperts = {'answersForExperts':[{'expertName':'expert Name 2', 'fieldOfExpertise':'field Of Expertise', 'questionDocumentName':'question Document Name', 'otherPartyQuestionsDocumentName':'O. p. Document Name', 'dateDay':'11','dateMonth':'10','dateYear':'2020', 'fileUpload':'Evidence_15.pdf'}]};

    const trialCaseSummary = {'trialCaseSummary':[{'fileUpload':'Evidence_07.pdf'}]};
    const trialSkeletonArgument = {'trialSkeletonArgument':[{'fileUpload':'Evidence_08.pdf'}]};
    const trialAuthorities = {'trialAuthorities':[{'fileUpload':'Evidence_09.pdf'}]};
    const trialCosts = {'trialCosts':[{'fileUpload':'Evidence_10.pdf'}]};
    const trialDocumentary = {'trialDocumentary':[{'typeOfDocument':'Word', 'dateDay':'14','dateMonth':'11','dateYear':'2020','fileUpload':'Evidence_11.pdf'}]};

    const sections = Object.assign(documentForDisclosureModel, disclosureList, witnessStatement, witnessSummary, noticeOfIntention,
      documentsReferred, expertReport, expertStatement, questionsForExperts, answersForExperts, trialCaseSummary, trialSkeletonArgument,
      trialAuthorities, trialCosts, trialDocumentary);

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(sections)
      .expect((res: express.Response) => {
        expect(res.status).toBe(302);
        expect(res.get('location')).toBe(CP_CHECK_ANSWERS_URL);
      });
  });

  it('should return 500 error page for failure', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .get(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});
