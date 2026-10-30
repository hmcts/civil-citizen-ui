import {Response} from 'express';
import {t} from 'i18next';
import submitConfirmationController from 'routes/features/response/submitConfirmationController';
import {CONFIRMATION_URL} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {isCarmEnabledForCase} from 'app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {ResponseType} from 'form/models/responseType';
import {FullAdmission} from 'models/fullAdmission';
import {PartialAdmission} from 'models/partialAdmission';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {
    retrieveClaimDetails: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isCarmEnabledForCase: jest.fn(),
}));

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveClaimDetails: jest.Mock;
};

const viewPath = 'features/response/submit-confirmation';
const claimId = '12345';
const responseDate = new Date('2023-11-06');

const namedClaim = (): Claim => {
  const claim = new Claim();
  claim.legacyCaseReference = '000MC009';
  claim.respondent1ResponseDate = responseDate;
  claim.applicant1 = {
    type: PartyType.INDIVIDUAL,
    partyDetails: {
      partyName: 'Joe Bloggs',
      firstName: 'Joe',
      lastName: 'Bloggs',
    },
  };
  claim.respondent1 = new Party();
  claim.respondent1.type = PartyType.INDIVIDUAL;
  return claim;
};

const fullAdmissionClaim = (): Claim => {
  const claim = namedClaim();
  claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
  return claim;
};

const partAdmissionClaim = (): Claim => {
  const claim = namedClaim();
  claim.respondent1.responseType = ResponseType.PART_ADMISSION;
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
  return claim;
};

const invoke = async () => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(submitConfirmationController, 'get', CONFIRMATION_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Submit confirmation controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(fullAdmissionClaim());
  });

  it('should render full admission pay immediately confirmation', async () => {
    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      claimNumber: '000MC009',
      responseSubmitDate: formatDateToFullDate(responseDate, undefined),
    }));
    expect(res.render.mock.calls[0][1].confirmationContent[0].data.text).toBe(
      t('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.WE_EMAILED_CLAIMANT_YOUR_INTENTION'),
    );
  });

  it('should render part admission pay immediately confirmation', async () => {
    const claim = partAdmissionClaim();
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke();

    expect(res.render.mock.calls[0][1].confirmationContent[0].data.text).toBe(
      t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.YOU_HAVE_SAID_YOU_OWW', {
        claimantName: claim.getClaimantFullName(),
        partialAmount: undefined,
      }),
    );
  });

  it('should return the error when the submitted claim cannot be retrieved', async () => {
    const error = new Error('ccd failure');
    civilServiceMethods.retrieveClaimDetails.mockRejectedValue(error);

    const {next} = await invoke();

    expect(next).toHaveBeenCalledWith(error);
  });
});
