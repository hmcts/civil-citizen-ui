import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  FIRST_CONTACT_PIN_URL,
  FIRST_CONTACT_ACCESS_DENIED_URL,
  FIRST_CONTACT_CLAIM_SUMMARY_URL,
} from '../../../../../../main/routes/urls';
import {t} from 'i18next';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {CIVIL_SERVICE_VALIDATE_PIN_URL} from '../../../../../../main/app/client/civilServiceUrls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

const mockFullClaim = { 'id': 1662129391355637, 'jurisdiction': 'CIVIL', 'case_type_id': 'CIVIL', 'created_date': '2022-09-02T14:36:31.305', 'last_modified': '2022-09-02T14:36:40.518', 'state': 'AWAITING_RESPONDENT_ACKNOWLEDGEMENT', 'case_data': { 'systemGeneratedCaseDocuments': [{ 'id': '1fb3e0aa-df2a-4c1a-96be-3d25897ca82d', 'value': { 'documentType': 'SEALED_CLAIM', 'createdBy': 'Civil', 'documentLink': { 'document_binary_url': 'http://dm-store:8080/documents/9cc38bf8-6521-4e0d-ab3a-8868c45114c3/binary', 'document_filename': 'sealed_claim_form_000MC058.pdf', 'document_url': 'http://dm-store:8080/documents/9cc38bf8-6521-4e0d-ab3a-8868c45114c3' }, 'createdDatetime': '2022-09-02T16:36:36', 'documentName': 'sealed_claim_form_000MC058.pdf', 'documentSize': 43911 } }], 'claimNotificationDate': '2022-09-02T15:36:38.440611', 'addRespondent2': 'No', 'legacyCaseReference': '000MC058', 'submittedDate': '2022-09-02T15:36:31.393061', 'paymentSuccessfulDate': '2022-09-02T15:36:35.319783', 'respondent1Represented': 'No', 'applicantSolicitor1ClaimStatementOfTruth': { 'role': 'Worker', 'name': 'Test' }, 'respondent1ResponseDeadline': '2022-09-16T16:00:00', 'businessProcess': { 'camundaEvent': 'CREATE_CLAIM_SPEC', 'status': 'FINISHED' }, 'solicitorReferences': { 'respondentSolicitor1Reference': 'Test 2', 'applicantSolicitor1Reference': 'Test' }, 'applicantSolicitor1UserDetails': { 'email': 'civilmoneyclaimsdemo@gmail.com' }, 'respondent1': { 'partyEmail': 'civilmoneyclaimsdemo@gmail.com', 'partyTypeDisplayValue': 'Company', 'companyName': 'Test Company 2', 'partyName': 'Test Company 2', 'primaryAddress': { 'AddressLine1': 'Test Company 2 Address', 'PostCode': 'BA12SS' }, 'type': 'COMPANY' }, 'respondent1PinToPostLRspec': { 'expiryDate': '2023-03-01', 'accessCode': 'C7NM3PCDJXKW', 'respondentCaseRole': '[RESPONDENTSOLICITORONESPEC]' }, 'addApplicant2': 'No', 'applicant1': { 'partyTypeDisplayValue': 'Company', 'companyName': 'Test Company 1', 'partyName': 'Test Company 1', 'primaryAddress': { 'AddressLine1': 'Test Company 1 Address', 'PostCode': 'BA12SS' }, 'type': 'COMPANY' }, 'timelineOfEvents': [{ 'id': 'aa9c73df-b0c4-466d-be88-eb3ebfa2dcf2', 'value': { 'timelineDate': '2021-11-11', 'timelineDescription': 'test' } }], 'applicant1OrganisationPolicy': { 'OrgPolicyCaseAssignedRole': '[APPLICANTSOLICITORONESPEC]', 'Organisation': { 'OrganisationID': 'Q1KOKP2' } }, 'claimNotificationDeadline': '2023-01-02T23:59:59', 'issueDate': '2022-09-02', 'claimIssuedPaymentDetails': { 'reference': 'RC-1234-1234-1234-1234', 'customerReference': 'Test', 'status': 'SUCCESS' }, 'detailsOfClaim': 'test', 'superClaimType': 'SPEC_CLAIM' }, 'security_classification': 'PUBLIC' };

describe('Respond to Claim - Pin Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });


  });

  describe('on GET', () => {
    it('should display page successfully', async () => {

      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(FIRST_CONTACT_PIN_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.PIN.TITLE'));
        });
    });
  });

  describe('on POST', () => {
    it('should show error messages when empty pin', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(FIRST_CONTACT_PIN_URL).send({ pin: '' }).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('ERRORS.ENTER_VALID_SECURITY_CODE'));
      });
    });

    it('should redirect to claim summary when pin and reference match', async () => {

      nock('http://localhost:4000')
        .post(CIVIL_SERVICE_VALIDATE_PIN_URL)
        .reply(200, mockFullClaim);

      app.locals.draftStoreClient = mockCivilClaim;
      app.request.cookies = { firstContact: { claimReference: '000MC000' } };
      await request(app).post(FIRST_CONTACT_PIN_URL).send({ pin: '0000' }).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(FIRST_CONTACT_CLAIM_SUMMARY_URL);
        expect(app.request.cookies.firstContact.claimReference).toBe('000MC000');
        expect(app.request.cookies.firstContact.pinVerified).toBe(YesNo.YES);
      });
    });

    it('should redirect unauthorized page', async () => {
      nock('http://localhost:4000')
        .post(CIVIL_SERVICE_VALIDATE_PIN_URL)
        .reply(401, {});

      app.locals.draftStoreClient = mockCivilClaim;
      app.request.cookies = { firstContact: { claimReference: '000MC000' } };
      await request(app).post(FIRST_CONTACT_PIN_URL).send({ pin: '1234' }).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
      });
    });

    it('should show error messages when receive 400 status', async () => {
      nock('http://localhost:4000')
        .post(CIVIL_SERVICE_VALIDATE_PIN_URL)
        .reply(400, {});

      app.locals.draftStoreClient = mockCivilClaim;
      app.request.cookies = { firstContact: { claimReference: '111MC111' } };
      await request(app).post(FIRST_CONTACT_PIN_URL).send({ pin: '1111' }).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('ERRORS.ENTER_VALID_SECURITY_CODE'));
      });
    });

    it('should catch the exceptions', async () => {
      nock('http://localhost:4000')
        .post(CIVIL_SERVICE_VALIDATE_PIN_URL)
        .reply(500, {});

      app.locals.draftStoreClient = mockRedisFailure;
      app.request.cookies = { firstContact: { claimReference: 'error' } };
      await request(app)
        .post(FIRST_CONTACT_PIN_URL)
        .send({ pin: 'error' })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
