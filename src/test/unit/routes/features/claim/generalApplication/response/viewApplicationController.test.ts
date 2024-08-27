import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_RESPONSE_VIEW_APPLICATION_URL} from 'routes/urls';
import {t} from 'i18next';
import {GaServiceClient} from 'client/gaServiceClient';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {getApplicantDocuments, getApplicationSections, getCourtDocuments, getRespondentDocuments} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import mockApplication from '../../../../../../utils/mocks/applicationMock.json';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {app} from '../../../../../../../main/app';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import { DocumentInformation, DocumentLinkInformation, DocumentsViewComponent } from 'common/form/models/documents/DocumentsViewComponent';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/services/features/generalApplication/viewApplication/viewApplicationService');
jest.mock('../../../../../../../main/app/client/gaServiceClient');

const mockedSummaryRows = getApplicationSections as jest.Mock;
const mockRespondentDocs = getRespondentDocuments as jest.Mock;
const mockApplicantDocs = getApplicantDocuments as jest.Mock;
const mockCourtDocs = getCourtDocuments as jest.Mock;

describe('General Application - View application', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let application : ApplicationResponse;
  const orderDocument = new DocumentInformation(
    'Document',
    '1 August 2024',
    new DocumentLinkInformation('/case/1718105701451856/view-documents/4feaa073-c310-4096-979d-cd5b12ebddf8', '000MC039-settlement-agreement.pdf'),
  );
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  beforeEach(() => {
    application = Object.assign(new ApplicationResponse(), mockApplication);
    mockRespondentDocs.mockImplementation(() => []);
    jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValue(application);
  });

  describe('on GET', () => {
    it('should return Application view page', async () => {
      mockedSummaryRows.mockImplementation(() => []);
      await request(app)
        .get(constructResponseUrlWithIdAndAppIdParams('123','1718105701451856',GA_RESPONSE_VIEW_APPLICATION_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE'));
        });
    });

    it('should return View application page without application documents section', async () => {
      await request(app)
        .get(GA_RESPONSE_VIEW_APPLICATION_URL)
        .query({index: '1'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).not.toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_DOCUMENTS'));
        });
    });

    it('should return View application page with respondent documents section', async () => {
      const respondentDocs =  new DocumentsViewComponent('RespondentDocuments',[orderDocument]);
      mockRespondentDocs.mockImplementation(() => respondentDocs);
      mockCourtDocs.mockImplementation(() => new DocumentsViewComponent('court',[]));
      mockApplicantDocs.mockImplementation(() => new DocumentsViewComponent('applicant',[]));

      await request(app)
        .get(GA_RESPONSE_VIEW_APPLICATION_URL)
        .query({index: '1'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_DOCUMENTS'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONDENTS_DOCUMENTS'));
          expect(res.text).toContain('Document');
          expect(res.text).toContain('1 August 2024');
          expect(res.text).toContain('000MC039-settlement-agreement.pdf');
          expect(res.text).not.toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICANTS_DOCUMENTS'));
          expect(res.text).not.toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DOCUMENTS_FROM_COURT'));
        });
    });

    it('should return View application page with applicant documents section', async () => {
    
      const applicantDocs =  new DocumentsViewComponent('ApplicantDocuments',[orderDocument]);
      mockApplicantDocs.mockImplementation(() => applicantDocs);
      mockCourtDocs.mockImplementation(() => new DocumentsViewComponent('court',[]));
      mockRespondentDocs.mockImplementation(() => new DocumentsViewComponent('respondent',[]));

      await request(app)
        .get(GA_RESPONSE_VIEW_APPLICATION_URL)
        .query({index: '1'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_DOCUMENTS'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICANTS_DOCUMENTS'));
          expect(res.text).toContain('Document');
          expect(res.text).toContain('1 August 2024');
          expect(res.text).toContain('000MC039-settlement-agreement.pdf');
          expect(res.text).not.toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONDENTS_DOCUMENTS'));
          expect(res.text).not.toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DOCUMENTS_FROM_COURT'));
        });
    });

    it('should return View application page with court documents section', async () => {
      const courtDocs =  new DocumentsViewComponent('courtDocuments',[orderDocument]);
      mockCourtDocs.mockImplementation(() => courtDocs);
      mockRespondentDocs.mockImplementation(() => new DocumentsViewComponent('respondent',[]));
      mockApplicantDocs.mockImplementation(() => new DocumentsViewComponent('applicant',[]));

      await request(app)
        .get(GA_RESPONSE_VIEW_APPLICATION_URL)
        .query({index: '1'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_DOCUMENTS'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DOCUMENTS_FROM_COURT'));
          expect(res.text).toContain('Document');
          expect(res.text).toContain('1 August 2024');
          expect(res.text).toContain('000MC039-settlement-agreement.pdf');
          expect(res.text).not.toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICANTS_DOCUMENTS'));
          expect(res.text).not.toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONDENTS_DOCUMENTS'));
        });
    });

    it('should return View application page with applicant , respondent and court documents sections', async () => {
      const applicantDocument = new DocumentInformation(
        'Applicant-Document',
        '1 August 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/4feaa073-c310-4096-979d-cd5b12ebddf8', '000MC039-applicant-doc.pdf'),
      );
      
      const respondentDocument = new DocumentInformation(
        'Respondent-Document',
        '4 August 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/4feaa073-c310-4096-979d-cd5b12ebddf8', '000MC039-respondent-doc.pdf'),
      );

      const courtDocument = new DocumentInformation(
        'Court-Document',
        '5 August 2024',
        new DocumentLinkInformation('/case/1718105701451856/view-documents/4feaa073-c310-4096-979d-cd5b12ebddf8', '000MC039-court-doc.pdf'),
      );
      
      const applicantDocs =  new DocumentsViewComponent('ApplicantDocuments',[applicantDocument]);
      const courtDocs =  new DocumentsViewComponent('courtDocuments',[courtDocument]);
      const respondentDocs =  new DocumentsViewComponent('RespondentDocuments',[respondentDocument]);
      mockApplicantDocs.mockImplementation(() => applicantDocs);
      mockCourtDocs.mockImplementation(() => courtDocs);
      mockRespondentDocs.mockImplementation(() => respondentDocs);

      await request(app)
        .get(GA_RESPONSE_VIEW_APPLICATION_URL)
        .query({index: '1'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_DOCUMENTS'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICANTS_DOCUMENTS'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DOCUMENTS_FROM_COURT'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONDENTS_DOCUMENTS'));
          expect(res.text).toContain('Applicant-Document');
          expect(res.text).toContain('1 August 2024');
          expect(res.text).toContain('000MC039-applicant-doc.pdf');
          expect(res.text).toContain('Respondent-Document');
          expect(res.text).toContain('4 August 2024');
          expect(res.text).toContain('000MC039-respondent-doc.pdf');
          expect(res.text).toContain('Court-Document');
          expect(res.text).toContain('5 August 2024');
          expect(res.text).toContain('000MC039-court-doc.pdf');
        });
    });

    it('should include respond button', async () => {
      const respondentDocs =  new DocumentsViewComponent('RespondentDocuments',[orderDocument]);
      mockRespondentDocs.mockImplementation(() => respondentDocs);
      mockCourtDocs.mockImplementation(() => new DocumentsViewComponent('court',[]));
      mockApplicantDocs.mockImplementation(() => new DocumentsViewComponent('applicant',[]));

      await request(app)
        .get(constructResponseUrlWithIdAndAppIdParams('123','456',GA_RESPONSE_VIEW_APPLICATION_URL))
        .expect(({status,text}) => {
          expect(status).toBe(200);
          expect(text).toContain('<a href="/case/123/response/general-application/456/accept-defendant-offer"');
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockedSummaryRows.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_RESPONSE_VIEW_APPLICATION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

