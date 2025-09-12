import request from 'supertest';
import {app} from '../../../../../../main/app';
import config from 'config';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {civilClaimResponseMock, mockCivilClaimUndefined} from '../../../../../utils/mockDraftStore';
import CivilClaimResponseMock from '../../../../../utils/mocks/civilClaimResponseMock.json';
import {dateFilter} from 'modules/nunjucks/filters/dateFilter';
import currencyFormat, {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {CaseRole} from 'form/models/caseRoles';
import {getTotalAmountWithInterestAndFees} from 'modules/claimDetailsService';
import {CivilServiceClient} from 'client/civilServiceClient';
import civilClaimResponsePDFTimeline from '../../../../../utils/mocks/civilClaimResponsePDFTimelineMock.json';
import * as launchDarklyClient from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {CaseState} from 'form/models/claimDetails';
import {DocumentType} from 'models/document/documentType';
import {t} from 'i18next';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
const nock = require('nock');

const civilServiceUrl = config.get<string>('services.civilService.url');
const isWelshEnabledForMainCase = launchDarklyClient.isWelshEnabledForMainCase as jest.Mock;

describe('Claim details page', () => {
  const idamUrl: string = config.get('idamUrl');
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const mockClaim = new Claim();
  const now = new Date();
  mockClaim.legacyCaseReference = '000MC009';
  mockClaim.respondent1ResponseDate = new Date(now.setDate(now.getDate() - 1));
  mockClaim.applicant1 = new Party();
  mockClaim.applicant1 = {
    type: PartyType.INDIVIDUAL,
    partyDetails: {
      partyName: 'Joe Bloggs',
    },
  };
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    isWelshEnabledForMainCase.mockResolvedValue(false);
  });

  describe('on Get', () => {
    it('should return 500 if the case is not found in ccd and redis', async () => {
      const error = new Error('Test error');
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockRejectedValueOnce(error);
      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
    it('should return your claim details page with values from civil-service', async () => {
      isWelshEnabledForMainCase.mockResolvedValue(false);
      nock(civilServiceUrl)
        .post('/fees/claim/calculate-interest')
        .times(3)
        .reply(200, '0');
      const claim = Object.assign(new Claim(), civilClaimResponseMock.case_data);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);
      const totalClaimAmount = currencyFormat(await getTotalAmountWithInterestAndFees(Object.assign(new Claim(),
        CivilClaimResponseMock.case_data)));
      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('1111'); // case number
          expect(res.text).toContain(totalClaimAmount); // tottal claim amount
          expect(res.text).toContain('House repair'); // claim reason
          expect(res.text).toContain('200'); // claim amount
          expect(res.text).toContain('15'); // total interest
          expect(res.text).toContain('70'); // claim fee
          expect(res.text).toContain('House repair'); // details of claim
          expect(res.text).toContain('I noticed a leak on the landing and told Mr Smith about this.'); // timeline description
          expect(res.text).toContain('1 January 2022'); // timeline date
        });
    });
    it('should retrieve claim from redis when claim exists in redis', async () => {
      nock(civilServiceUrl)
        .post('/fees/claim/calculate-interest')
        .times(2)
        .reply(200, '0');
      const claim = Object.assign(new Claim(), civilClaimResponseMock.case_data);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);
      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(claim?.claimAmountBreakup[0].value.claimReason);
          expect(res.text).toContain(claim?.claimAmountBreakup[0].value.claimAmount);
          expect(res.text).toContain(claim?.totalInterest.toString());
          expect(res.text).toContain(convertToPoundsFilter(claim?.claimFee.calculatedAmountInPence).toString());
          expect(res.text).toContain(claim?.claimDetails.reason.text);
          expect(res.text).toContain(claim?.timelineOfEvents[0].value.timelineDescription);
          expect(res.text).toContain(dateFilter(claim?.timelineOfEvents[0].value.timelineDate));
        });
    });
    it('should display Download and view their Timeline', async () => {
      nock(civilServiceUrl)
        .post('/fees/claim/calculate-interest')
        .times(2)
        .reply(200, '0');
      const claim = Object.assign(new Claim(), civilClaimResponsePDFTimeline.case_data);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);
      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Download and view timeline');
        });
    });
    it('should return 500 status when there is error', async () => {
      const error = new Error('Test error');
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockRejectedValueOnce(error);
      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return your new claim details page with values from civil-service', async () => {
      nock(civilServiceUrl)
        .get('/cases/1713273393110043')
        .reply(200, CivilClaimResponseMock);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + 1713273393110043 + '/userCaseRoles')
        .reply(200, [CaseRole.CLAIMANT]);
      nock(civilServiceUrl)
        .post('/fees/claim/calculate-interest')
        .times(3)
        .reply(200, '0');
      isWelshEnabledForMainCase.mockResolvedValue(true);
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      const totalClaimAmount = currencyFormat(await getTotalAmountWithInterestAndFees(Object.assign(new Claim(),
        CivilClaimResponseMock.case_data)));

      await request(app)
        .get('/case/1713273393110043/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('View the claim');
          expect(res.text).toContain('Reason for claim');
          expect(res.text).toContain('If you cannot find a document that you are looking for in this section');
          expect(res.text).toContain('View the claim (PDF)');
          expect(res.text).toContain('1713273393110043'); // case number
          expect(res.text).toContain(totalClaimAmount); // total claim amount
          expect(res.text).toContain('House repair'); // claim reason
          expect(res.text).toContain('200'); // claim amount
          expect(res.text).toContain('15'); // total interest
          expect(res.text).toContain('70'); // claim fee
          expect(res.text).toContain('House repair'); // details of claim
          expect(res.text).toContain('I noticed a leak on the landing and told Mr Smith about this.'); // timeline description
          expect(res.text).toContain('1 January 2022'); // timeline date
        });
    });

    it('Should Get the Warning Message when Claim is under translation', async () => {
      nock(civilServiceUrl)
        .post('/fees/claim/calculate-interest')
        .times(2)
        .reply(200, '0');
      const claim = Object.assign(new Claim(), civilClaimResponseMock.case_data);
      claim.ccdState = CaseState.PENDING_CASE_ISSUED;
      claim.preTranslationDocuments = [{
        id: '1234',
        value: {
          createdBy: 'some one',
          documentLink: {
            document_url: 'url',
            document_filename: 'filename',
            document_binary_url: 'http://dm-store:8080/documents/77121e9b-e83a-440a-9429-e7f0fe89e518/binary',
          },
          documentName: 'some name',
          documentType: DocumentType.SEALED_CLAIM,
          documentSize: 123,
          createdDatetime: new Date(),
        },
      }];

      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);
      isWelshEnabledForMainCase.mockResolvedValue(true);
      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.DOCUMENTS_BEING_TRANSLATED'));
          expect(res.text).toContain(claim?.claimAmountBreakup[0].value.claimReason);
          expect(res.text).toContain(claim?.claimAmountBreakup[0].value.claimAmount);
          expect(res.text).toContain(claim?.totalInterest.toString());
          expect(res.text).toContain(convertToPoundsFilter(claim?.claimFee.calculatedAmountInPence).toString());
          expect(res.text).toContain(claim?.claimDetails.reason.text);
          expect(res.text).toContain(claim?.timelineOfEvents[0].value.timelineDescription);
          expect(res.text).toContain(dateFilter(claim?.timelineOfEvents[0].value.timelineDate));
        });
    });
  });
});
