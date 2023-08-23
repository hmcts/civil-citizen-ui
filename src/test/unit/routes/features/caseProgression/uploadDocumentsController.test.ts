import request from 'supertest';
import {
  mockCivilClaim, mockCivilClaimDocumentUploaded,
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
import {t} from 'i18next';
import {getTrialContent} from 'services/features/caseProgression/trialService';
import {getNextYearValue} from '../../../../utils/dateUtils';
import express from 'express';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {ClaimSummaryType} from 'form/models/claimSummarySection';

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
    app.locals.draftStoreClient = mockCivilClaim;

    const civilClaimDocumentUploaded = require('../../../../utils/mocks/civilClaimResponseMock.json');
    civilClaimDocumentUploaded.case_data.id = civilClaimDocumentUploaded.id;
    const claim: Claim = civilClaimDocumentUploaded.case_data as Claim;

    const spyDisclosure = jest.spyOn(DisclosureService, 'getDisclosureContent');

    await request(app).get(CP_UPLOAD_DOCUMENTS_URL).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.UPLOAD_DOCUMENTS.TITLE'));
      expect(res.text).not.toContain('Disclosure');
      expect(res.text).not.toContain('Witness');
      expect(spyDisclosure).toHaveBeenCalledWith(claim, null);
    });
  });

  it('should render page successfully with uploaded document section if document available in redis', async () => {
    app.locals.draftStoreClient = mockCivilClaimDocumentUploaded;

    const civilClaimDocumentUploaded = require('../../../../utils/mocks/civilClaimResponseDocumentUploadedMock.json');
    civilClaimDocumentUploaded.case_data.id = civilClaimDocumentUploaded.id;
    const claim: Claim = civilClaimDocumentUploaded.case_data as Claim;

    const disclosureUpload =
        {'documentsForDisclosure':
            [
              {'dateDay': '01', 'dateMonth': '01', 'dateYear': '2023', 'fileUpload':
                  {'fieldname': 'field name',
                    'mimetype': 'application/pdf',
                    'originalname': 'original name',
                    'size': 1234,
                  },
              'typeOfDocument': 'type',
              },
            ],
        } as UploadDocumentsUserForm;

    const formWithDisclosure = new GenericForm(disclosureUpload);

    const spyDisclosure = jest.spyOn(DisclosureService, 'getDisclosureContent');

    await request(app).get(CP_UPLOAD_DOCUMENTS_URL).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.UPLOAD_DOCUMENTS.TITLE'));
      expect(res.text).toContain('Disclosure');
      expect(res.text).not.toContain('Witness');
      expect(spyDisclosure).toHaveBeenCalledWith(claim, formWithDisclosure);
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
    const documentForDisclosureModel = {
      'documentsForDisclosure': [{
        'typeOfDocument': '',
        'dateInputFields': {
          'dateDay': '',
          'dateMonth': '',
          'dateYear': '',
        },
        'fileUpload': '',
      }],
    };

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(documentForDisclosureModel)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_TYPE_OF_DOCUMENT);
      });
  });

  it('File only section', async () => {
    const caseDoc = '{"documentLink":{"document_url":"http://test","document_binary_url":"http://test/binary","document_filename":"test.png","document_hash":"test"},"documentName":"test.png","documentSize":86349,"createdDatetime":"2023-06-27T11:32:29","createdBy":"test"}';
    const disclosureList = {'disclosureList': [{'file_upload': '', 'caseDocument': `${caseDoc}`}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(disclosureList)
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });

  it('should display documentForDisclosure validation error when Day month and year is invalid', async () => {
    const documentForDisclosureModel = {
      'documentsForDisclosure': [{
        'typeOfDocument': '',
        'dateInputFields': {
          'dateDay': '45',
          'dateMonth': '17',
          'dateYear': '202',
        },
        'fileUpload': '',
      }],
    };

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(documentForDisclosureModel)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_TYPE_OF_DOCUMENT);
        expect(res.text).toContain(TestMessages.VALID_REAL_DAY);
        expect(res.text).toContain(TestMessages.VALID_REAL_MONTH);
        expect(res.text).toContain(TestMessages.VALID_REAL_YEAR);
      });
  });

  it('should display documentForDisclosure validation error when day is blank', async () => {
    const documentForDisclosureModel = {
      'documentsForDisclosure': [{
        'typeOfDocument': '',
        'dateInputFields': {
          'dateDay': '',
          'dateMonth': '11',
          'dateYear': '2022',
        },
        'fileUpload': '',
      }],
    };

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
    const documentForDisclosureModel = {
      'documentsForDisclosure': [{
        'typeOfDocument': '',
        'dateInputFields': {
          'dateDay': '12',
          'dateMonth': '',
          'dateYear': '2022',
        },
        'fileUpload': '',
      }],
    };

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
    const documentForDisclosureModel = {
      'documentsForDisclosure': [{
        'typeOfDocument': '',
        'dateInputFields': {
          'dateDay': '12',
          'dateMonth': '11',
          'dateYear': '',
        },
        'fileUpload': '',
      }],
    };

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
    const documentForDisclosureModel = {
      'documentsForDisclosure': [{
        'typeOfDocument': '',
        'dateInputFields': {
          'dateDay': '12',
          'dateMonth': '11',
          'dateYear': mockFutureYear,
        },
        'fileUpload': '',
      }],
    };

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
    const documentForDisclosureModel = {
      'documentsForDisclosure': [{
        'typeOfDocument': '',
        'dateInputFields': {
          'dateDay': '12',
          'dateMonth': '11',
          'dateYear': '2022',
        },
        'fileUpload': '',
      }],
    };

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
    const model = {
      'witnessStatement': [{
        'witnessName': '',
        'dateInputFields': {
          'dateDay': '',
          'dateMonth': '',
          'dateYear': '',
        },
        'fileUpload': '',
      }],
    };

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
    const model = {
      'expertReport': [{
        'expertName': '',
        'fieldOfExpertise': '',
        'questionDocumentName': '',
        'otherPartyQuestionsDocumentName': '',
        'dateInputFields': {
          'dateDay': '',
          'dateMonth': '',
          'dateYear': '',
        },
      }],
    };

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

  it('should display all questions for other party\'s expert validation errors', async () => {
    const model = {'questionsForExperts':[{'expertName':'', 'otherPartyName':'', 'questionDocumentName':'', 'fileUpload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(model)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_EXPERT_NAME);
        expect(res.text).toContain(TestMessages.VALID_SELECT_OTHER_PARTY);
        expect(res.text).toContain(TestMessages.VALID_ENTER_DOCUMENT_QUESTIONS);
        expect(res.text).toContain(TestMessages.VALID_CHOOSE_THE_FILE);
      });
  });

  it('should display all answers to questions asked by other party validation errors', async () => {
    const model = {'answersForExperts':[{'expertName':'', 'otherPartyName':'', 'otherPartyQuestionsDocumentName':'', 'fileUpload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(model)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_EXPERT_NAME);
        expect(res.text).toContain(TestMessages.VALID_SELECT_OTHER_PARTY);
        expect(res.text).toContain(TestMessages.VALID_ENTER_DOCUMENT_QUESTIONS_OTHER_PARTY);
        expect(res.text).toContain(TestMessages.VALID_CHOOSE_THE_FILE);
      });
  });

  it('should redirect to the next page when inputs are validated', async () => {

    const documentForDisclosureModel = {
      'documentsForDisclosure': [{
        'typeOfDocument': 'Word',
        'dateInputFields': {
          'dateDay': '14',
          'dateMonth': '10',
          'dateYear': '2020',
        },
        'fileUpload': 'Evidence_01.pdf',
      }],
    };
    const disclosureList = {'disclosureList':[{'fileUpload':'Evidence_02.pdf'}]};

    const witnessStatement = {
      'witnessStatement': [{
        'witnessName': 'witness Name',
        'dateInputFields': {
          'dateDay': '10',
          'dateMonth': '11',
          'dateYear': '2020',
        },
        'fileUpload': 'Evidence_03.pdf',
      }],
    };
    const witnessSummary = {
      'witnessSummary': [{
        'witnessName': 'witness Name 1',
        'dateInputFields': {
          'dateDay': '11',
          'dateMonth': '11',
          'dateYear': '2020',
        },
        'fileUpload': 'Evidence_04.pdf',
      }],
    };
    const noticeOfIntention = {
      'noticeOfIntention': [{
        'witnessName': 'witness Name 2',
        'dateInputFields': {
          'dateDay': '12',
          'dateMonth': '11',
          'dateYear': '2020',
        },
        'fileUpload': 'Evidence_05.pdf',
      }],
    };
    const documentsReferred = {
      'documentsReferred': [{
        'typeOfDocument': 'Word',
        'dateInputFields': {
          'dateDay': '13',
          'dateMonth': '11',
          'dateYear': '2020',
        },
        'fileUpload': 'Evidence_06.pdf',
      }],
    };

    const expertReport = {
      'expertReport': [{
        'expertName': 'expert Name',
        'fieldOfExpertise': 'field Of Expertise',
        'questionDocumentName': 'question Document Name',
        'otherPartyQuestionsDocumentName': 'O. p. Document Name',
        'dateInputFields': {
          'dateDay': '11',
          'dateMonth': '12',
          'dateYear': '2020',
        },
        'fileUpload': 'Evidence_12.pdf',
      }],
    };
    const expertStatement = {'expertStatement':[{'expertName':'John Dhoe','fieldOfExpertise':'Architect','otherPartyName':'Mark Smith', 'questionDocumentName':'question Document Name', 'otherPartyQuestionsDocumentName':'O. p. Document Name', 'fileUpload':'Evidence_13.pdf'}]};
    const questionsForExperts = {
      'questionsForExperts': [{
        'expertName': 'expert Name 1',
        'fieldOfExpertise': 'field Of Expertise',
        'questionDocumentName': 'question Document Name',
        'otherPartyQuestionsDocumentName': 'O. p. Document Name',
        'dateInputFields': {
          'dateDay': '10',
          'dateMonth': '10',
          'dateYear': '2020',
        },
        'fileUpload': 'Evidence_14.pdf',
      }],
    };
    const answersForExperts = {
      'answersForExperts': [{
        'expertName': 'expert Name 2',
        'fieldOfExpertise': 'field Of Expertise',
        'questionDocumentName': 'question Document Name',
        'otherPartyQuestionsDocumentName': 'O. p. Document Name',
        'dateInputFields': {
          'dateDay': '11',
          'dateMonth': '10',
          'dateYear': '2020',
        },
        'fileUpload': 'Evidence_15.pdf',
      }],
    };

    const trialCaseSummary = {'trialCaseSummary':[{'fileUpload':'Evidence_07.pdf'}]};
    const trialSkeletonArgument = {'trialSkeletonArgument':[{'fileUpload':'Evidence_08.pdf'}]};
    const trialAuthorities = {'trialAuthorities':[{'fileUpload':'Evidence_09.pdf'}]};
    const trialCosts = {'trialCosts':[{'fileUpload':'Evidence_10.pdf'}]};
    const trialDocumentary = {
      'trialDocumentary': [{
        'typeOfDocument': 'Word',
        'dateInputFields': {
          'dateDay': '14',
          'dateMonth': '11',
          'dateYear': '2020',
        },
        'fileUpload': 'Evidence_11.pdf',
      }],
    };

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
