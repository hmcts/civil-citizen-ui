import {
  createApplicantCitizenQuery, createRespondentCitizenQuery,
  getSummarySections
} from 'services/features/queryManagement/createQueryCheckYourAnswerService.';
import {Claim} from 'models/claim';
import {QueryManagement} from 'form/models/queryManagement/queryManagement';
import {CreateQuery, UploadQMAdditionalFile} from 'models/queryManagement/createQuery';
import {Document} from 'models/document/document';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

const req = {params: {id: '123'}, session: {user: {id: '12345667'}}} as unknown as AppRequest;
describe('Check Answers response service', () => {

  describe('getSummarySections', () => {
    it('getSummarySections', () => {
      const claim = new Claim();
      claim.queryManagement = new QueryManagement();
      claim.queryManagement.createQuery = new CreateQuery('message subject', 'message details', 'yes');
      claim.queryManagement.createQuery.uploadedFiles = [{
        caseDocument: {
          documentName: 'abc',
          documentLink: {document_binary_url: 'http://dm-store:8080/documents/bf4a2ac9-a036-4d7d-b999-dcccc4d92197/binary'} as Document
        }
      } as UploadQMAdditionalFile];
      const summaryRows = getSummarySections('123455', claim);
      expect(summaryRows.length).toBe(4);
    })
  })

  describe('createApplicantCitizenQuery', () => {
    it('should submit the create query for claimant', async () => {

      const submitQueryManagementRaiseQuery = jest.spyOn(CivilServiceClient.prototype, 'submitQueryManagementRaiseQuery').mockResolvedValueOnce(undefined);
      const claim = new Claim();
      const updated = new Claim();
      claim.queryManagement = new QueryManagement();
      claim.queryManagement.createQuery = new CreateQuery('message subject', 'message details', 'yes');
      claim.queryManagement.createQuery.uploadedFiles = [];
      await createApplicantCitizenQuery(claim, updated, req);
      expect(submitQueryManagementRaiseQuery).toHaveBeenCalled();
    })

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
          }
        }]
      }
      claim.queryManagement = new QueryManagement();
      claim.queryManagement.createQuery = new CreateQuery('message subject', 'message details', 'yes');
      claim.queryManagement.createQuery.uploadedFiles = [];
      await createApplicantCitizenQuery(claim, updated, req);
      expect(submitQueryManagementRaiseQuery).toHaveBeenCalled();
    })
  })

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
          }
        }]
      }
      claim.queryManagement = new QueryManagement();
      claim.queryManagement.createQuery = new CreateQuery('message subject', 'message details', 'yes');
      claim.queryManagement.createQuery.uploadedFiles = [];
      await createRespondentCitizenQuery(claim, updated, req);
      expect(submitQueryManagementRaiseQuery).toHaveBeenCalled();
    })
  })
})
