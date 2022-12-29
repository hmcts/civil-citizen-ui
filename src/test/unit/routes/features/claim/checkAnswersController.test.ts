import nock from 'nock';
import config from 'config';
import {getSummarySections} from 'services/features/claim/checkAnswers/checkAnswersService';
import {CLAIM_CHECK_ANSWERS_URL, CLAIM_CONFIRMATION_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import request from 'supertest';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {createClaimWithYourDetails} from '../../../../utils/mocks/claimDetailsMock';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {HelpWithFees} from 'form/models/claim/details/helpWithFees';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';

const {app} = require('../../../../../main/app');
const civilServiceUrl = config.get<string>('services.civilService.url');
const data = require('../../../../utils/mocks/defendantClaimsMock.json');

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/claimDetailsService');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/services/features/claim/checkAnswers/checkAnswersService');
jest.mock('../../../../../main/services/features/claim/submission/submitClaim');

const mockGetSummarySections = getSummarySections as jest.Mock;
const mockGetClaim = getCaseDataFromStore as jest.Mock;

describe('Claim - Check answers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  const checkYourAnswerEng = 'Check your answers';

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock(civilServiceUrl)
      .get('/cases/defendant/123')
      .reply(200, {data: data});
    nock(civilServiceUrl)
      .get('/cases/claimant/123')
      .reply(200, {data: data});
  });

  describe('on GET', () => {
    mockGetClaim.mockImplementation(() => {
      const claim = new Claim();
      claim.claimDetails = new ClaimDetails();
      claim.claimDetails.helpWithFees = new HelpWithFees();
      claim.claimDetails.helpWithFees.option = YesNo.YES;
      return claim;
    });
    it('should return check your answer page', async () => {
      await request(app).get(CLAIM_CHECK_ANSWERS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerEng);
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetSummarySections.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CLAIM_CHECK_ANSWERS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on Post', () => {
    it('should return errors when form is incomplete', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createClaimWithYourDetails();
      });
      const data = {signed: ''};
      await request(app)
        .post(CLAIM_CHECK_ANSWERS_URL)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Tell us if you believe the facts stated in this response are true');
        });
    });
    it('should return payment button when Fee is no', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createClaimWithYourDetails();
      });
      mockGetClaim.mockImplementation(() => {
        const claim = new Claim();
        claim.claimDetails = new ClaimDetails();
        claim.claimDetails.helpWithFees = new HelpWithFees();
        claim.claimDetails.helpWithFees.option = YesNo.NO;
        return claim;
      });
      const data = {signed: ''};
      await request(app)
        .post(CLAIM_CHECK_ANSWERS_URL)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Submit and continue to payment');
        });
    });
    it('should return submit button when Fee is yes', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createClaimWithYourDetails();
      });
      mockGetClaim.mockImplementation(() => {
        const claim = new Claim();
        claim.claimDetails = new ClaimDetails();
        claim.claimDetails.helpWithFees = new HelpWithFees();
        claim.claimDetails.helpWithFees.option = YesNo.YES;
        return claim;
      });
      const data = {signed: ''};
      await request(app)
        .post(CLAIM_CHECK_ANSWERS_URL)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Submit claim');
        });
    });
    it('should redirect to claim submitted confirmation page when help with fees is set to yes', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createClaimWithYourDetails();
      });
      mockGetClaim.mockImplementation(() => {
        const claim = new Claim();
        claim.claimDetails = new ClaimDetails();
        claim.claimDetails.helpWithFees = new HelpWithFees();
        claim.claimDetails.helpWithFees.option = YesNo.YES;
        return claim;
      });
      const data = {
        signed: 'Test',
        type: 'qualified',
        isFullAmountRejected: 'true',
        directionsQuestionnaireSigned: 'Test',
        signerRole: 'Test',
        signerName: 'Test',
      };
      await request(app)
        .post(CLAIM_CHECK_ANSWERS_URL)
        .send(data)
        .expect((res ) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_CONFIRMATION_URL);
        });
    });
    it('should redirect to claim confirmation page when Fee is no', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createClaimWithYourDetails();
      });
      mockGetClaim.mockImplementation(() => {
        const claim = new Claim();
        claim.claimDetails = new ClaimDetails();
        claim.claimDetails.helpWithFees = new HelpWithFees();
        claim.claimDetails.helpWithFees.option = YesNo.NO;
        return claim;
      });
      const data = {
        signed: 'Test',
        type: 'qualified',
        isFullAmountRejected: 'true',
        directionsQuestionnaireSigned: 'Test',
        signerRole: 'Test',
        signerName: 'Test',
      };
      await request(app)
        .post(CLAIM_CHECK_ANSWERS_URL)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain('https://www.payments.service.gov.uk/card_details/');
        });
    });
    it('should return 500 when error in service', async () => {
      mockGetSummarySections.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CLAIM_CHECK_ANSWERS_URL)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

