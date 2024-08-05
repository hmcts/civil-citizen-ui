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
import {getApplicationSections} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import mockApplication from '../../../../../utils/mocks/applicationMock.json';
import { ApplicationState } from 'common/models/generalApplication/applicationSummary';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import {DocumentType} from 'models/document/documentType';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/services/features/generalApplication/viewApplication/viewApplicationService');
jest.mock('../../../../../../main/app/client/gaServiceClient');

const mockedSummaryRows = getApplicationSections as jest.Mock;

describe('General Application - View application', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let application : ApplicationResponse;
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  beforeEach(() => {
    application = Object.assign(new ApplicationResponse(), mockApplication);
    jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValue(application);
  });

  describe('on GET', () => {
    it('should return view application page with close and return to dashboard button', async () => {
      mockedSummaryRows.mockImplementation(() => []);
      application.state = ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION;
      application.case_data.generalAppPBADetails.paymentDetails = {
        'status': 'SUCCESS',
        'reference' : '123-REF',
      };

      await request(app)
        .get(GA_VIEW_APPLICATION_URL)
        .query({applicationId: '1718105701451856'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE'));
          expect(res.text).toContain(t('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_DASHBOARD'));
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
        .query({applicationId: '1718105701451856'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE'));
          expect(res.text).toContain(t('COMMON.BUTTONS.PAY_APPLICATION_FEE'));
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
                  createdBy: 'test',
                  documentLink: {
                    document_url: 'test',
                    document_binary_url: binary_url,
                    document_filename: fileName,
                    category_id: '1',
                  },
                  documentName: 'test',
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
});

