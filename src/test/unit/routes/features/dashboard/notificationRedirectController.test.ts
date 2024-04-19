import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/server';
import config from 'config';
import * as UtilityService from 'modules/utilityService';
import * as ApplyHelpFeeSelectionService from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionService';
import {Claim} from 'models/claim';
import {SystemGeneratedCaseDocuments} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';
import {DASHBOARD_NOTIFICATION_REDIRECT} from 'routes/urls';
import {CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL} from 'client/civilServiceUrls';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Notification Redirect Controller - Get', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const civilServiceUrl = config.get<string>('services.civilService.url');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('Redirect to view document page', async () => {
    //given
    const claim: Claim = new Claim();
    claim.id = '123';
    claim.systemGeneratedCaseDocuments = [
      {
        id: '789',
        value: {
          documentLink: {
            document_url: 'url',
            document_filename: 'name',
            document_binary_url: '/456/binary',
          },
          documentType: DocumentType.SEALED_CLAIM,
        },
      },
    ] as SystemGeneratedCaseDocuments[];

    nock(civilServiceUrl)
      .put(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', '321'))
      .reply(200, {});

    jest.spyOn(UtilityService, 'getClaimById').mockReturnValueOnce(Promise.resolve(claim));

    //when
    await request(app)
      .get(DASHBOARD_NOTIFICATION_REDIRECT
        .replace(':id', '123')
        .replace(':locationName', 'VIEW_ORDERS_AND_NOTICES')
        .replace(':notificationId', '321'))
      //then
      .expect((res: Response) => {
        expect(res.status).toBe(302);
        expect(res.text).toBe('Found. Redirecting to /#');
      });

  });

  it('Redirect to gov payment page', async () => {
    //given
    const claim: Claim = new Claim();
    claim.id = '123';

    nock(civilServiceUrl)
      .put(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', '321'))
      .reply(200, {});

    jest.spyOn(UtilityService, 'getClaimById').mockReturnValueOnce(Promise.resolve(claim));
    jest.spyOn(ApplyHelpFeeSelectionService, 'getRedirectUrl').mockReturnValueOnce(Promise.resolve('https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960'));

    //when
    await request(app)
      .get(DASHBOARD_NOTIFICATION_REDIRECT
        .replace(':id', '123')
        .replace(':locationName', 'PAY_HEARING_FEE_URL')
        .replace(':notificationId', '321'))
      //then
      .expect((res: Response) => {
        expect(res.status).toBe(302);
        expect(res.text).toBe('Found. Redirecting to https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960');
      });
  });

});
