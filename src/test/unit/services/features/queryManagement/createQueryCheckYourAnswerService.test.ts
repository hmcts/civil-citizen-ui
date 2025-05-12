import {
  createApplicantCitizenQuery, createRespondentCitizenQuery,
  getSummarySections,
} from 'services/features/queryManagement/createQueryCheckYourAnswerService';
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

  describe('createApplicantCitizenQuery', () => {
    it('should submit the create query for claimant', async () => {

      const submitQueryManagementRaiseQuery = jest.spyOn(CivilServiceClient.prototype, 'submitQueryManagementRaiseQuery').mockResolvedValueOnce(undefined);
      const claim = new Claim();
      const updated = new Claim();
      claim.queryManagement = new QueryManagement();
      const date = new Date();
      claim.queryManagement.createQuery = new CreateQuery('message subject', 'message details', 'yes', (date.getFullYear() + 1).toString(), date.getMonth().toString(), date.getDay().toString());
      claim.queryManagement.createQuery.uploadedFiles = [];
      await createApplicantCitizenQuery(claim, updated, req, false);
      expect(submitQueryManagementRaiseQuery).toHaveBeenCalled();
    });

    it('should submit and append the follow up query for claimant query', async () => {

      const submitQueryManagementRaiseQuery = jest.spyOn(CivilServiceClient.prototype, 'submitQueryManagementRaiseQuery').mockResolvedValueOnce(undefined);
      const claim = new Claim();
      const updated = new Claim();
      claim.queryManagement = new QueryManagement();
      updated.qmApplicantCitizenQueries = {
        'partyName': 'claimant',
        'roleOnCase': '[CLAIMANT]',
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
      await createApplicantCitizenQuery(claim, updated, req, true);
      expect(submitQueryManagementRaiseQuery).toHaveBeenCalled();
    });

    it('should append the data to Existing Details', async () => {
      const submitQueryManagementRaiseQuery = jest.spyOn(CivilServiceClient.prototype, 'submitQueryManagementRaiseQuery').mockResolvedValueOnce(undefined);
      const claim = new Claim();
      const updated = new Claim();
      updated.qmApplicantCitizenQueries = {
        'partyName': 'defendant',
        'roleOnCase': '[CLAIMANT]',
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
      await createApplicantCitizenQuery(claim, updated, req, false);
      expect(submitQueryManagementRaiseQuery).toHaveBeenCalled();
    });
  });

  it('should submit and append the follow up query for defendant query', async () => {

    const submitQueryManagementRaiseQuery = jest.spyOn(CivilServiceClient.prototype, 'submitQueryManagementRaiseQuery').mockResolvedValueOnce(undefined);
    const claim = new Claim();
    const updated = new Claim();
    claim.queryManagement = new QueryManagement();
    updated.qmRespondentCitizenQueries = {
      'partyName': 'defendant',
      'roleOnCase': '[DEFENDANT]',
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
    await createRespondentCitizenQuery(claim, updated, req, true);
    expect(submitQueryManagementRaiseQuery).toHaveBeenCalled();
  });

  it('should return error when no corresponding parent query found', async () => {
    const claim = new Claim();
    const updated = new Claim();
    claim.queryManagement = new QueryManagement();
    updated.qmRespondentCitizenQueries = {
      'partyName': 'defendant',
      'roleOnCase': '[DEFENDANT]',
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
    await expect(createRespondentCitizenQuery(claim, updated, req, true))
      .rejects
      .toThrow('Parent query with ID 78945 not found.');
  });

  describe('createRespondentCitizenQuery', () => {
    it('should submit the create query for defendant', async () => {

      const submitQueryManagementRaiseQuery = jest.spyOn(CivilServiceClient.prototype, 'submitQueryManagementRaiseQuery').mockResolvedValueOnce(undefined);
      const claim = new Claim();
      const updated = new Claim();
      updated.qmRespondentCitizenQueries = {
        'partyName': 'defendant',
        'roleOnCase': '[DEFENDANT]',
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
      await createRespondentCitizenQuery(claim, updated, req, false);
      expect(submitQueryManagementRaiseQuery).toHaveBeenCalled();
    });
  });
});
