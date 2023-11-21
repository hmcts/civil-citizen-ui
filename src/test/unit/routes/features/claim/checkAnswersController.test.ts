import nock from 'nock';
import config from 'config';
import {getSummarySections} from 'services/features/claim/checkAnswers/checkAnswersService';
import {CLAIM_CHECK_ANSWERS_URL, CLAIM_CONFIRMATION_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getElementsByXPath} from '../../../../utils/xpathExtractor';
import {createClaimWithBasicDetails} from '../../../../utils/mocks/claimDetailsMock';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {HelpWithFees} from 'form/models/claim/details/helpWithFees';
import {Response} from 'supertest';
import {submitClaim} from 'services/features/claim/submission/submitClaim';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {isPcqShutterOn} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {Email} from 'models/Email';
import axios from 'axios';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const request = require('supertest');

const {app} = require('../../../../../main/app');
const session = require('supertest-session');
const civilServiceUrl = config.get<string>('services.civilService.url');
const data = require('../../../../utils/mocks/defendantClaimsMock.json');

jest.mock('axios');
jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/claimDetailsService');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/services/features/claim/checkAnswers/checkAnswersService');
jest.mock('../../../../../main/services/features/claim/submission/submitClaim');
jest.mock('../../../../../main/routes/guards/checkYourAnswersGuard', () => ({
  checkYourAnswersClaimGuard: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockGetSummarySections = getSummarySections as jest.Mock;
const mockGetClaim = getCaseDataFromStore as jest.Mock;
const mockSubmitClaim = submitClaim as jest.Mock;

const PARTY_NAME = 'Mrs. Mary Richards';

const isPcqShutterOnMock = isPcqShutterOn as jest.Mock;
const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockClaimWithPcqId = new Claim();
mockClaimWithPcqId.pcqId = '123';

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
    it('should return check answers page', async () => {
      mockGetClaim.mockImplementation(() => {
        const claim = new Claim();
        claim.claimDetails = new ClaimDetails();
        return claim;
      });

      const response = await session(app).get(CLAIM_CHECK_ANSWERS_URL);
      expect(response.status).toBe(200);

      const dom = new JSDOM(response.text);
      const htmlDocument = dom.window.document;
      const header = getElementsByXPath("//h1[@class='govuk-heading-l']", htmlDocument);

      expect(header.length).toBe(1);
      expect(header[0].textContent).toBe(checkYourAnswerEng);

    });
    it('should return check answers page with Your details and their details sections', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createClaimWithBasicDetails();
      });
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return mockClaimWithPcqId;
      });

      const response = await session(app).get(CLAIM_CHECK_ANSWERS_URL);
      expect(response.status).toBe(200);

      const dom = new JSDOM(response.text);
      const htmlDocument = dom.window.document;
      const header = getElementsByXPath("//h1[@class='govuk-heading-l']", htmlDocument);
      const fullName = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Full name')]]",
        htmlDocument);
      const address = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Address')]]",
        htmlDocument);
      const correspondence = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Correspondence address')]]",
        htmlDocument);
      const contact = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Contact number (optional)')]]",
        htmlDocument);
      const email = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Email')]]",
        htmlDocument);

      expect(header.length).toBe(1);
      expect(header[0].textContent).toBe(checkYourAnswerEng);
      expect(fullName.length).toBe(2);
      expect(fullName[0].textContent?.trim()).toBe(PARTY_NAME);
      expect(fullName[1].textContent?.trim()).toBe(PARTY_NAME);
      expect(address.length).toBe(2);
      expect(address[0].textContent?.trim()).toBe('54 avenue');
      expect(address[1].textContent?.trim()).toBe('Simon street');
      expect(correspondence.length).toBe(1);
      expect(correspondence[0].textContent?.trim()).toBe('Same as address');
      expect(contact.length).toBe(2);
      expect(contact[0].textContent?.trim()).toBe('12345');
      expect(contact[1].textContent?.trim()).toBe('98765');
      expect(email.length).toBe(1);
      expect(email[0].textContent?.trim()).toBe('contact@gmail.com');
    });
    it('should redirect to PCQ jouney', async () => {
      isPcqShutterOnMock.mockResolvedValue(false);
      axios.get = jest.fn().mockResolvedValue({ data: { status: 'UP' } });
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const mockClaimToRedirectToPcq = new Claim();
        mockClaimToRedirectToPcq.respondent1 = new Party();
        mockClaimToRedirectToPcq.respondent1.type = PartyType.INDIVIDUAL;
        mockClaimToRedirectToPcq.respondent1.emailAddress = new Email('test@test.com');
        return mockClaimToRedirectToPcq;
      });

      await session(app).get(CLAIM_CHECK_ANSWERS_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(302);
        });
    });
    it('should return check your answer page', async () => {
      await request(app).get(CLAIM_CHECK_ANSWERS_URL)
        .expect((res: Response) => {
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
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on Post', () => {

    beforeAll(() => {
      mockGetSummarySections.mockReset();
    });
    const spyClearcookie = jest.spyOn(app.response, 'clearCookie');

    it('should return errors when form is incomplete', async () => {
      mockGetClaim.mockImplementation(() => {
        const claim = new Claim();
        claim.claimDetails = new ClaimDetails();
        claim.claimDetails.helpWithFees = new HelpWithFees();
        claim.claimDetails.helpWithFees.option = YesNo.NO;
        return claim;
      });
      const data = {
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
          expect(res.status).toBe(200);
          expect(res.text).toContain('Tell us if you believe the facts stated in this response are true');
        });
    });
    it('should return submit button when Fee is no', async () => {
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
          expect(res.text).toContain('Submit claim');
        });
    });
    it('should return submit button when Fee is yes', async () => {
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
      mockSubmitClaim.mockImplementation(() => {
        const submittedClaim = new Claim();
        submittedClaim.id = ':id';
        return submittedClaim;
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
        .expect((res: Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_CONFIRMATION_URL);
        });
      expect(spyClearcookie).toBeCalledWith('eligibilityCompleted');
      expect(spyClearcookie).toBeCalledWith('eligibility');
    });
    it('should redirect to claim confirmation page when Fee is no', async () => {
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
        acceptNoChangesAllowed: 'true',
      };
      await request(app)
        .post(CLAIM_CHECK_ANSWERS_URL)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_CONFIRMATION_URL);
        });
      expect(spyClearcookie).toBeCalledWith('eligibilityCompleted');
      expect(spyClearcookie).toBeCalledWith('eligibility');
    });
    it('should return 500 when error in service', async () => {
      mockGetSummarySections.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CLAIM_CHECK_ANSWERS_URL)
        .send()
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
