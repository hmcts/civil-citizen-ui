import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_VIEW_APPLICATION_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import * as launchDarkly from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {getApplicationSections , getRespondentDocuments, getCourtDocuments, getApplicantDocuments, getResponseFromCourtSection} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import mockApplication from '../../../../../utils/mocks/applicationMock.json';
import { DocumentInformation, DocumentLinkInformation, DocumentsViewComponent } from 'common/form/models/documents/DocumentsViewComponent';
import { ApplicationState } from 'common/models/generalApplication/applicationSummary';
import { SummaryRow, summaryRow } from 'common/models/summaryList/summaryList';
import { CourtResponseSummaryList, ResponseButton } from 'common/models/generalApplication/CourtResponseSummary';
import { YesNoUpperCamelCase } from 'common/form/models/yesNo';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {getApplicationIndex} from 'services/features/generalApplication/generalApplicationService';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/services/features/generalApplication/viewApplication/viewApplicationService');
jest.mock('../../../../../../main/services/features/generalApplication/generalApplicationService');

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

const mockedSummaryRows = getApplicationSections as jest.Mock;
const mockRespondentDocs = getRespondentDocuments as jest.Mock;
const mockApplicantDocs = getApplicantDocuments as jest.Mock;
const mockCourtDocs = getCourtDocuments as jest.Mock;
const mockResponseFromCourt = getResponseFromCourtSection as jest.Mock;
const mockGetApplicationIndex = getApplicationIndex as jest.Mock;

describe('General Application - View application', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const orderDocument = new DocumentInformation(
    'Document',
    '1 August 2024',
    new DocumentLinkInformation('/case/1718105701451856/view-documents/4feaa073-c310-4096-979d-cd5b12ebddf8', '000MC039-settlement-agreement.pdf'),
  );

  let application : ApplicationResponse;

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(application);
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  beforeEach(() => {
    const claim = new Claim();
    application = Object.assign(new ApplicationResponse(), mockApplication);
    application.state = ApplicationState.AWAITING_APPLICATION_PAYMENT;
    mockRespondentDocs.mockImplementation(() => []);
    mockedSummaryRows.mockImplementation(() => []);
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(application);
    (getClaimById as jest.Mock).mockResolvedValue(claim);
  });

  describe('on GET', () => {
    it('should return View application page', async () => {
      mockedSummaryRows.mockImplementation(() => []);
      application.state = ApplicationState.AWAITING_APPLICATION_PAYMENT;
      await request(app)
        .get(GA_VIEW_APPLICATION_URL)
        .query({index: '1'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE'));
        });
    });

    it('should return View application page when index is undefined', async () => {
      mockGetApplicationIndex.mockImplementation(() => 1);
      mockedSummaryRows.mockImplementation(() => []);
      await request(app)
        .get(GA_VIEW_APPLICATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE'));
        });
    });

    it('should return view application page with pay application fee button, no upload additional document link', async () => {
      mockedSummaryRows.mockImplementation(() => []);
      application.state = ApplicationState.AWAITING_APPLICATION_PAYMENT;
      application.case_data.generalAppPBADetails.paymentDetails = {
        'status': 'FAIL',
        'reference' : '123-REF',
      };
      await request(app)
        .get(GA_VIEW_APPLICATION_URL)
        .query({index: '1'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE'));
          expect(res.text).toContain(t('COMMON.BUTTONS.PAY_APPLICATION_FEE'));
          expect(res.text).not.toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.UPLOAD_DOCUMENTS_2'));
        });
    });

    it('should return view application page with upload additional document', async () => {
      mockedSummaryRows.mockImplementation(() => []);
      application.state = ApplicationState.AWAITING_RESPONDENT_RESPONSE;
      await request(app)
        .get(GA_VIEW_APPLICATION_URL)
        .query({index: '1'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.UPLOAD_DOCUMENTS_2'));
        });
    });

    it('should return View application page without application documents section', async () => {
      await request(app)
        .get(GA_VIEW_APPLICATION_URL)
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
        .get(GA_VIEW_APPLICATION_URL)
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
        .get(GA_VIEW_APPLICATION_URL)
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
        .get(GA_VIEW_APPLICATION_URL)
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
        .get(GA_VIEW_APPLICATION_URL)
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

    it('should show case progression text when case progression state', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.CASE_PROGRESSION;
      (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
      mockedSummaryRows.mockImplementation(() => []);
      await request(app)
        .get(GA_VIEW_APPLICATION_URL)
        .query({index: '1'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.UPLOAD_DOCUMENTS_TRIAL_3'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockedSummaryRows.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_VIEW_APPLICATION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  it('should return response from court section', async () => {
    mockResponseFromCourt.mockImplementation(() => {
      const judgeDirectionRows : SummaryRow[] = [];
      const responseFromCourt : CourtResponseSummaryList[] = [];
      const hearingNoticeRows : SummaryRow[] = [];
      const judgeDirections = new CourtResponseSummaryList(judgeDirectionRows, new Date(), new ResponseButton('Judge Direction', ''));

      judgeDirectionRows.push(
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE'), '1 Aug 2024'),
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE'), 'Judge has made order'),
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE'), '<a href="#">Judge Order</a>'));

      const hearingNotices = new CourtResponseSummaryList(hearingNoticeRows);
      hearingNoticeRows.push(
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE'), '2 Aug 2024'),
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE'), 'Hearing Notice has been generated'),
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE'), '<a href="#">Hearing Notice</a>'));

      responseFromCourt.push(judgeDirections);
      responseFromCourt.push(hearingNotices);

      return Promise.resolve(responseFromCourt);
    });

    await request(app)
      .get(GA_VIEW_APPLICATION_URL)
      .query({index: '1'})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE_COURT'));
        expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE'));
        expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE'));
        expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE'));
        expect(res.text).toContain('Judge has made order');
        expect(res.text).toContain('1 Aug 2024');
        expect(res.text).toContain('<a href="#">Judge Order</a>');
        expect(res.text).toContain('Hearing Notice has been generated');
        expect(res.text).toContain('2 Aug 2024');
        expect(res.text).toContain('<a href="#">Hearing Notice</a>');
      });
  });

  it('should return response from court section for defendant', async () => {
    mockResponseFromCourt.mockImplementation(() => {
      const responseFromCourt : CourtResponseSummaryList[] = [];
      const hearingNoticeRows : SummaryRow[] = [];

      const hearingNotices = new CourtResponseSummaryList(hearingNoticeRows);
      hearingNoticeRows.push(
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE'), '2 Aug 2024'),
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE'), 'Hearing Notice has been generated'),
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE'), '<a href="#">Hearing Notice</a>'));

      responseFromCourt.push(hearingNotices);
      return Promise.resolve(responseFromCourt);
    });
    application.case_data.parentClaimantIsApplicant = YesNoUpperCamelCase.NO;

    await request(app)
      .get(GA_VIEW_APPLICATION_URL)
      .query({index: '1'})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE_COURT'));
        expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE'));
        expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE'));
        expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE'));
        expect(res.text).toContain('Hearing Notice has been generated');
        expect(res.text).toContain('2 Aug 2024');
        expect(res.text).toContain('<a href="#">Hearing Notice</a>');
      });
  });

  it('should not display response from court section', async () => {

    mockResponseFromCourt.mockImplementation(() => {
      return Promise.resolve([]);
    });

    await request(app)
      .get(GA_VIEW_APPLICATION_URL)
      .query({index: '1'})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).not.toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE_COURT'));
      });
  });
});

