import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_VIEW_APPLICATION_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import * as launchDarkly from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {GaServiceClient} from 'client/gaServiceClient';
import {ApplicationResponse, JudicialDecisionMakeAnOrderOptions} from 'models/generalApplication/applicationResponse';
import {getApplicationSections , getRespondentDocuments, getCourtDocuments, getApplicantDocuments, getResponseFromCourtSection} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import mockApplication from '../../../../../utils/mocks/applicationMock.json';
import { DocumentInformation, DocumentLinkInformation, DocumentsViewComponent } from 'common/form/models/documents/DocumentsViewComponent';
import { ApplicationState } from 'common/models/generalApplication/applicationSummary';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import {DocumentType} from 'models/document/documentType';
import { SummaryRow, summaryRow } from 'common/models/summaryList/summaryList';
import { CourtResponseSummaryList, ResponseButton } from 'common/models/generalApplication/CourtResponseSummary';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/services/features/generalApplication/viewApplication/viewApplicationService');
jest.mock('../../../../../../main/app/client/gaServiceClient');

const mockedSummaryRows = getApplicationSections as jest.Mock;
const mockRespondentDocs = getRespondentDocuments as jest.Mock;
const mockApplicantDocs = getApplicantDocuments as jest.Mock;
const mockCourtDocs = getCourtDocuments as jest.Mock;
const mockResponseFromCourt = getResponseFromCourtSection as jest.Mock;

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
    jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValue(application);
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  beforeEach(() => {
    application = Object.assign(new ApplicationResponse(), mockApplication);
    mockRespondentDocs.mockImplementation(() => []);
    jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValue(application);
  });

  describe('on GET', () => {
    it('should return View application page', async () => {
      mockedSummaryRows.mockImplementation(() => []);
      await request(app)
        .get(GA_VIEW_APPLICATION_URL)
        .query({index: '1'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE'));
        });
    });

    it('should return view application page with pay application fee button', async () => {
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

    describe('on Judges Direction', () => {
      it('should return Check your answers page for judges direction', async () => {
        const fileName = 'Name of file';
        const binary = '77121e9b-e83a-440a-9429-e7f0fe89e518';
        const binary_url = `http://dm-store:8080/documents/${binary}/binary`;
        const applicationResponse: ApplicationResponse = {
          case_data: {
            applicationTypes: undefined,
            generalAppType: undefined,
            generalAppRespondentAgreement: undefined,
            generalAppInformOtherParty: undefined,
            generalAppAskForCosts: undefined,
            generalAppDetailsOfOrder: undefined,
            generalAppReasonsOfOrder: undefined,
            generalAppEvidenceDocument: undefined,
            gaAddlDoc: undefined,
            generalAppHearingDetails: undefined,
            generalAppStatementOfTruth: undefined,
            generalAppPBADetails: {
              fee: undefined,
              paymentDetails: undefined,
              serviceRequestReference: undefined,
            },
            applicationFeeAmountInPence: undefined,
            parentClaimantIsApplicant: undefined,
            judicialDecision: undefined,
            judicialDecisionMakeOrder: {
              directionsResponseByDate: new Date('2024-01-01').toString(),
              makeAnOrder: JudicialDecisionMakeAnOrderOptions.GIVE_DIRECTIONS_WITHOUT_HEARING,
            },
            directionOrderDocument: [
              {
                id: '1',
                value: {
                  documentLink: {
                    document_url: 'test',
                    document_binary_url: binary_url,
                    document_filename: fileName,
                    category_id: '1',
                  },
                  documentType: DocumentType.DIRECTION_ORDER,
                  createdDatetime: new Date('2024-01-01'),
                },
              },
            ],
          },
          created_date: '',
          id: '',
          last_modified: '',
          state: undefined,
        };

        mockedSummaryRows.mockImplementation(() => []);
        jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);

        await request(app)
          .get(GA_VIEW_APPLICATION_URL)
          .query({applicationId: '1718105701451856'})
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE'));
          });
      });
    });

    describe('on Judges Approve or Edit', () => {
      it('should return Check your answers page for judges direction', async () => {
        const fileName = 'Name of file';
        const binary = '77121e9b-e83a-440a-9429-e7f0fe89e518';
        const binary_url = `http://dm-store:8080/documents/${binary}/binary`;
        const applicationResponse: ApplicationResponse = {
          case_data: {
            applicationTypes: undefined,
            generalAppType: undefined,
            generalAppRespondentAgreement: undefined,
            generalAppInformOtherParty: undefined,
            generalAppAskForCosts: undefined,
            generalAppDetailsOfOrder: undefined,
            generalAppReasonsOfOrder: undefined,
            generalAppEvidenceDocument: undefined,
            gaAddlDoc: undefined,
            generalAppHearingDetails: undefined,
            generalAppStatementOfTruth: undefined,
            generalAppPBADetails: {
              fee: undefined,
              paymentDetails: undefined,
              serviceRequestReference: undefined,
            },
            applicationFeeAmountInPence: undefined,
            parentClaimantIsApplicant: undefined,
            judicialDecision: undefined,
            judicialDecisionMakeOrder: {
              directionsResponseByDate: new Date('2024-01-01').toString(),
              makeAnOrder: JudicialDecisionMakeAnOrderOptions.APPROVE_OR_EDIT,
            },
            generalOrderDocument: [
              {
                id: '1',
                value: {
                  documentLink: {
                    document_url: 'test',
                    document_binary_url: binary_url,
                    document_filename: fileName,
                    category_id: '1',
                  },
                  documentType: DocumentType.GENERAL_ORDER,
                  createdDatetime: new Date('2024-01-01'),
                },
              },
            ],
          },
          created_date: '',
          id: '',
          last_modified: '',
          state: undefined,
        };

        mockedSummaryRows.mockImplementation(() => []);
        jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);

        await request(app)
          .get(GA_VIEW_APPLICATION_URL)
          .query({applicationId: '1718105701451856'})
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE'));
          });
      });
    });

    describe('on Judges Dismissal', () => {
      it('should return Check your answers page for judges direction', async () => {
        const fileName = 'Name of file';
        const binary = '77121e9b-e83a-440a-9429-e7f0fe89e518';
        const binary_url = `http://dm-store:8080/documents/${binary}/binary`;
        const applicationResponse: ApplicationResponse = {
          case_data: {
            applicationTypes: undefined,
            generalAppType: undefined,
            generalAppRespondentAgreement: undefined,
            generalAppInformOtherParty: undefined,
            generalAppAskForCosts: undefined,
            generalAppDetailsOfOrder: undefined,
            generalAppReasonsOfOrder: undefined,
            generalAppEvidenceDocument: undefined,
            gaAddlDoc: undefined,
            generalAppHearingDetails: undefined,
            generalAppStatementOfTruth: undefined,
            generalAppPBADetails: {
              fee: undefined,
              paymentDetails: undefined,
              serviceRequestReference: undefined,
            },
            applicationFeeAmountInPence: undefined,
            parentClaimantIsApplicant: undefined,
            judicialDecision: undefined,
            judicialDecisionMakeOrder: {
              directionsResponseByDate: new Date('2024-01-01').toString(),
              makeAnOrder: JudicialDecisionMakeAnOrderOptions.DISMISS_THE_APPLICATION,
            },
            dismissalOrderDocument: [
              {
                id: '1',
                value: {
                  documentLink: {
                    document_url: 'test',
                    document_binary_url: binary_url,
                    document_filename: fileName,
                    category_id: '1',
                  },
                  documentType: DocumentType.DISMISSAL_ORDER,
                  createdDatetime: new Date('2024-01-01'),
                },
              },
            ],
          },
          created_date: '',
          id: '',
          last_modified: '',
          state: undefined,
        };

        mockedSummaryRows.mockImplementation(() => []);
        jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);

        await request(app)
          .get(GA_VIEW_APPLICATION_URL)
          .query({applicationId: '1718105701451856'})
          .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE'));
          });
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
    const judgeDirectionRows : SummaryRow[] = [];
    const responseFromCourt : CourtResponseSummaryList[] = [];
    const hearinNoticeRows : SummaryRow[] = [];

    mockResponseFromCourt.mockImplementation(() => {
      const judgeDirections = new CourtResponseSummaryList(judgeDirectionRows, new ResponseButton('Judge Direction', ''));
      judgeDirectionRows.push(
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE'), '1 Aug 2024'),
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE'), 'Judge has made order'),
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE'), '<a href="#">Judge Order</a>'));
      
      const hearinNotices = new CourtResponseSummaryList(hearinNoticeRows);
      hearinNoticeRows.push(
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE'), '2 Aug 2024'),
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE'), 'Hearing Notice has been generated'),
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE'), '<a href="#">Hearing Notice</a>'));
      
      responseFromCourt.push(judgeDirections); 
      responseFromCourt.push(hearinNotices); 
  
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

