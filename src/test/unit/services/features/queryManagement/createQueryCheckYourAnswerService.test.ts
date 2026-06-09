import {
  buildQuerySubmissionPayload,
  corruptQuerySubmissionPayload,
  createQuery,
  getSummarySections,
  isCivilServiceDebugEnabled,
  submitCorruptedQueryFromCheckYourAnswers,
} from 'services/features/queryManagement/createQueryCheckYourAnswerService';
import {AxiosError} from 'axios';
import config from 'config';
import {Claim} from 'models/claim';
import {QueryManagement} from 'form/models/queryManagement/queryManagement';
import {CreateQuery, UploadQMAdditionalFile} from 'models/queryManagement/createQuery';
import {Document} from 'models/document/document';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {SendFollowUpQuery} from 'models/queryManagement/sendFollowUpQuery';

const req = {params: {id: '123'}, session: {user: {id: '12345667'}}} as unknown as AppRequest;
describe('Check Answers response service', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('getSummarySections', () => {
    it('getSummarySections', () => {
      const claim = new Claim();
      claim.queryManagement = new QueryManagement();
      const date = new Date();
      claim.queryManagement.createQuery = new CreateQuery('message subject', 'message details', 'yes', (date.getFullYear() + 1).toString(), date.getMonth().toString(), date.getDay().toString());
      claim.queryManagement.createQuery.uploadedFiles = [{
        caseDocument: {
          documentName: 'abc',
          documentLink: {document_binary_url: 'http://dm-store:8080/documents/bf4a2ac9-a036-4d7d-b999-dcccc4d92197/binary'} as Document,
        },
      } as UploadQMAdditionalFile];
      const summaryRows = getSummarySections('123455', claim,'en', false);
      expect(summaryRows.length).toBe(5);
    });
  });

  describe('getSummarySections for follow up query', () => {
    it('getSummarySections', () => {
      const claim = new Claim();
      claim.queryManagement = new QueryManagement();
      claim.queryManagement.sendFollowUpQuery = new SendFollowUpQuery();
      claim.queryManagement.sendFollowUpQuery.uploadedFiles = [{
        caseDocument: {
          documentName: 'abc',
          documentLink: {document_binary_url: 'http://dm-store:8080/documents/bf4a2ac9-a036-4d7d-b999-dcccc4d92197/binary'} as Document,
        },
      } as UploadQMAdditionalFile];
      const summaryRows = getSummarySections('123455', claim,'en', true);
      expect(summaryRows.length).toBe(2);
    });
  });

  describe('createQuery', () => {
    it('should submit the create query for claimant', async () => {

      const submitQueryManagementRaiseQuery = jest.spyOn(CivilServiceClient.prototype, 'submitQueryManagementRaiseQuery').mockResolvedValueOnce(undefined);
      const claim = new Claim();
      const updated = new Claim();
      claim.queryManagement = new QueryManagement();
      const date = new Date();
      claim.queryManagement.createQuery = new CreateQuery('message subject', 'message details', 'yes', (date.getFullYear() + 1).toString(), date.getMonth().toString(), date.getDay().toString());
      claim.queryManagement.createQuery.uploadedFiles = [];
      await createQuery(claim, updated, req, false);
      expect(submitQueryManagementRaiseQuery).toHaveBeenCalled();
    });

    it('should submit and append the follow up query for claimant query', async () => {

      const submitQueryManagementRaiseQuery = jest.spyOn(CivilServiceClient.prototype, 'submitQueryManagementRaiseQuery').mockResolvedValueOnce(undefined);
      const claim = new Claim();
      const updated = new Claim();
      claim.queryManagement = new QueryManagement();
      updated.queries = {
        'partyName': 'claimant',
        'caseMessages': [{
          'value': {
            'id':'12345',
            'body': 'message details',
            'name': 'claimant',
            'subject': 'Message Subject',
            'createdBy': 'andndbnbd',
            createdOn: new Date().toISOString(),
            'attachments': [],
            'isHearingRelated': YesNoUpperCamelCase.YES,
            'hearingDate': '2025-04-04',
          },
        }],
      };
      claim.queryManagement.sendFollowUpQuery = new SendFollowUpQuery();
      claim.queryManagement.sendFollowUpQuery.uploadedFiles = [];
      claim.queryManagement.sendFollowUpQuery.parentId = '12345';
      await createQuery(claim, updated, req, true);
      expect(submitQueryManagementRaiseQuery).toHaveBeenCalled();
    });

    it('should append the data to Existing Details', async () => {
      const submitQueryManagementRaiseQuery = jest.spyOn(CivilServiceClient.prototype, 'submitQueryManagementRaiseQuery').mockResolvedValueOnce(undefined);
      const claim = new Claim();
      const updated = new Claim();
      updated.qmApplicantCitizenQueries = {
        'partyName': 'defendant',
        'caseMessages': [{
          'value': {
            'body': 'message details',
            'name': 'defendant',
            'subject': 'Message Subject',
            'createdBy': 'andndbnbd',
            createdOn: new Date().toISOString(),
            'attachments': [],
            'isHearingRelated': YesNoUpperCamelCase.YES,
            'hearingDate': '2025-04-04',
          },
        }],
      };
      claim.queryManagement = new QueryManagement();
      claim.queryManagement.createQuery = new CreateQuery('message subject', 'message details', 'yes', '2025', '4', '4');
      claim.queryManagement.createQuery.uploadedFiles = [];
      await createQuery(claim, updated, req, false);
      expect(submitQueryManagementRaiseQuery).toHaveBeenCalled();
    });
  });

  it('should submit and append the follow up query for defendant query', async () => {

    const submitQueryManagementRaiseQuery = jest.spyOn(CivilServiceClient.prototype, 'submitQueryManagementRaiseQuery').mockResolvedValueOnce(undefined);
    const claim = new Claim();
    const updated = new Claim();
    claim.queryManagement = new QueryManagement();
    updated.queries = {
      'partyName': 'defendant',
      'caseMessages': [{
        'value': {
          'id':'78945',
          'body': 'message details',
          'name': 'defendant',
          'subject': 'Message Subject',
          'createdBy': 'andndbnbd',
          createdOn: new Date().toISOString(),
          'attachments': [],
          'isHearingRelated': YesNoUpperCamelCase.YES,
          'hearingDate': '2025-04-04',
        },
      }],
    };
    claim.queryManagement.sendFollowUpQuery = new SendFollowUpQuery();
    claim.queryManagement.sendFollowUpQuery.uploadedFiles = [];
    claim.queryManagement.sendFollowUpQuery.parentId = '78945';
    await createQuery(claim, updated, req, true);
    expect(submitQueryManagementRaiseQuery).toHaveBeenCalled();
  });

  it('should return error when no corresponding parent query found', async () => {
    const claim = new Claim();
    const updated = new Claim();
    claim.queryManagement = new QueryManagement();
    updated.qmRespondentCitizenQueries = {
      'partyName': 'defendant',
      'caseMessages': [{
        'value': {
          'id':'78945999',
          'body': 'message details',
          'name': 'defendant',
          'subject': 'Message Subject',
          'createdBy': 'andndbnbd',
          createdOn: new Date().toISOString(),
          'attachments': [],
          'isHearingRelated': YesNoUpperCamelCase.YES,
          'hearingDate': '2025-04-04',
        },
      }],
    };
    claim.queryManagement.sendFollowUpQuery = new SendFollowUpQuery();
    claim.queryManagement.sendFollowUpQuery.uploadedFiles = [];
    claim.queryManagement.sendFollowUpQuery.parentId = '78945';
    await expect(createQuery(claim, updated, req, true))
      .rejects
      .toThrow('Parent query with ID 78945 not found.');
  });

  describe('createQuery', () => {
    it('should submit the create query for defendant', async () => {

      const submitQueryManagementRaiseQuery = jest.spyOn(CivilServiceClient.prototype, 'submitQueryManagementRaiseQuery').mockResolvedValueOnce(undefined);
      const claim = new Claim();
      const updated = new Claim();
      updated.qmRespondentCitizenQueries = {
        'partyName': 'defendant',
        'caseMessages': [{
          'value': {
            'body': 'message details',
            'name': 'defendant',
            'subject': 'Message Subject',
            'createdBy': 'andndbnbd',
            createdOn: new Date().toISOString(),
            'attachments': [],
            'isHearingRelated': YesNoUpperCamelCase.YES,
            'hearingDate': '2025-05-05',
          },
        }],
      };
      claim.queryManagement = new QueryManagement();
      claim.queryManagement.createQuery = new CreateQuery('message subject', 'message details', 'yes', '2025', '5', '5');
      claim.queryManagement.createQuery.uploadedFiles = [];
      await createQuery(claim, updated, req, false);
      expect(submitQueryManagementRaiseQuery).toHaveBeenCalled();
    });
  });

  describe('isCivilServiceDebugEnabled', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
      jest.restoreAllMocks();
    });

    it('should be enabled when civil service debug feature toggle is on', () => {
      process.env.NODE_ENV = 'production';
      jest.spyOn(config, 'get').mockImplementation((key: string) =>
        key === 'featureToggles.civilServiceDebugEnabled' ? true : config.get(key),
      );

      expect(isCivilServiceDebugEnabled()).toBe(true);
    });
  });

  describe('submitCorruptedQueryFromCheckYourAnswers', () => {
    it('should corrupt the built payload before submitting to civil-service', async () => {
      const claim = new Claim();
      const updated = new Claim();
      claim.queryManagement = new QueryManagement();
      const date = new Date();
      claim.queryManagement.createQuery = new CreateQuery(
        'message subject',
        'message details',
        'yes',
        (date.getFullYear() + 1).toString(),
        date.getMonth().toString(),
        date.getDay().toString(),
      );
      claim.queryManagement.createQuery.uploadedFiles = [];

      const validPayload = buildQuerySubmissionPayload(claim, updated, req, false);
      const corruptedPayload = corruptQuerySubmissionPayload(validPayload);
      expect(corruptedPayload.queries.partyName).toBe(12345);
      expect(corruptedPayload.queries.caseMessages[0].value.body).toBe('');

      const submitSpy = jest.spyOn(CivilServiceClient.prototype, 'submitQueryManagementRaiseQuery');
      const axiosError = new AxiosError(
        'Request failed with status code 400',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 400,
          data: {message: 'Validation failed'},
          statusText: 'Bad Request',
          headers: {},
          config: {},
        },
      );
      submitSpy.mockRejectedValueOnce(axiosError);

      const result = await submitCorruptedQueryFromCheckYourAnswers(claim, updated, req, false);

      expect(result.status).toBe(400);
      expect(result.message).toBe('Request failed with status code 400');
      expect(result.responseBody).toEqual({message: 'Validation failed'});
      expect(submitSpy).toHaveBeenCalledWith('123', expect.objectContaining({
        queries: expect.objectContaining({
          partyName: 12345,
          caseMessages: expect.arrayContaining([
            expect.objectContaining({
              value: expect.objectContaining({
                body: '',
                subject: null,
                isHearingRelated: 'MAYBE',
              }),
            }),
          ]),
        }),
      }), req);
    });
  });
});
