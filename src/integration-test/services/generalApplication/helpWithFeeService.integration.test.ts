process.env.NODE_ENV = 'test';
import '../../setup/testSetup';

jest.mock('../../../main/modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('client/civilServiceClient', () => ({
  CivilServiceClient: jest.fn().mockImplementation(() => ({
    retrieveClaimDetails: jest.fn(),
  })),
}));
jest.mock('../../../main/services/features/generalApplication/applicationFee/generalApplicationFeePaymentService', () => ({
  getGaFeePaymentRedirectInformation: jest.fn(),
  getGaFeePaymentStatus: jest.fn(),
}));
jest.mock('../../../main/services/features/generalApplication/generalApplicationService', () => ({
  getApplicationFromGAService: jest.fn(),
}));
jest.mock('../../../main/modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(() => 'redis-claim-key'),
  saveDraftClaim: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../main/modules/draft-store/gaHwFeesDraftStore', () => ({
  getDraftGAHWFDetails: jest.fn(),
  saveDraftGAHWFDetails: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../main/modules/draft-store/paymentSessionStoreService', () => ({
  saveUserId: jest.fn().mockResolvedValue(undefined),
}));

import {getRedirectUrl} from '../../../main/services/features/generalApplication/fee/helpWithFeeService';
import {YesNo} from '../../../main/common/form/models/yesNo';
import {FeeType} from '../../../main/common/form/models/helpWithFees/feeType';
import {GeneralApplication} from '../../../main/common/models/generalApplication/GeneralApplication';
import {ApplicationTypeOption} from '../../../main/common/models/generalApplication/applicationType';
import {Claim} from '../../../main/common/models/claim';
import {GenericYesNo} from '../../../main/common/form/models/genericYesNo';
import {getClaimById} from '../../../main/modules/utilityService';
import {getGaFeePaymentRedirectInformation, getGaFeePaymentStatus} from '../../../main/services/features/generalApplication/applicationFee/generalApplicationFeePaymentService';
import {saveDraftClaim} from '../../../main/modules/draft-store/draftStoreService';
import {getDraftGAHWFDetails, saveDraftGAHWFDetails} from '../../../main/modules/draft-store/gaHwFeesDraftStore';
import {getApplicationFromGAService} from '../../../main/services/features/generalApplication/generalApplicationService';
import {saveUserId} from '../../../main/modules/draft-store/paymentSessionStoreService';

const CLAIM_ID = '1640995200000000';
const APP_ID = 'GA-1001';
const USER_ID = 'ga-user';

const buildClaim = (): Claim => {
  const claim = new Claim();
  claim.id = CLAIM_ID;
  claim.generalApplication = Object.assign(new GeneralApplication(), {
    applicationTypes: [{option: ApplicationTypeOption.EXTEND_TIME}],
  });
  return claim;
};

type MinimalReq = {
  params: {id: string; appId: string};
  query: Record<string, unknown>;
  originalUrl: string;
  session: {user: {id: string}};
};

const buildReq = (overrides: Partial<MinimalReq> = {}) => ({
  params: {id: CLAIM_ID, appId: APP_ID},
  query: {},
  originalUrl: `/case/${CLAIM_ID}/general-application/${APP_ID}/apply-help-fee-selection`,
  session: {user: {id: USER_ID}},
  ...overrides,
}) as unknown as MinimalReq;

describe('Integration: GA helpWithFeeService routing branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns confirmation URL when payment status is Success', async () => {
    const claim = buildClaim();
    claim.generalApplication.applicationFeePaymentDetails = {paymentReference: 'REF-1', nextUrl: 'https://pay/old'} as unknown as never;
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    (getGaFeePaymentStatus as jest.Mock).mockResolvedValue({status: 'Success'});

    const url = await getRedirectUrl(CLAIM_ID, new GenericYesNo(YesNo.NO, ''), 'applyHelpWithFees', buildReq() as never);

    expect(url).toBe(`/general-application/payment-confirmation/${CLAIM_ID}/gaid/${APP_ID}`);
    expect(saveUserId).toHaveBeenCalledWith(CLAIM_ID, FeeType.GENERALAPPLICATION, USER_ID);
  });

  it('returns refreshed gateway URL when payment status is Failed', async () => {
    const claim = buildClaim();
    claim.generalApplication.applicationFeePaymentDetails = {paymentReference: 'REF-1', nextUrl: 'https://pay/old'} as unknown as never;
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    (getGaFeePaymentStatus as jest.Mock).mockResolvedValue({status: 'Failed'});
    (getGaFeePaymentRedirectInformation as jest.Mock).mockResolvedValue({paymentReference: 'REF-2', nextUrl: 'https://pay/new'});

    const url = await getRedirectUrl(CLAIM_ID, new GenericYesNo(YesNo.NO, ''), 'applyHelpWithFees', buildReq() as never);

    expect(url).toBe('https://pay/new');
    expect(saveDraftClaim).toHaveBeenCalled();
  });

  it('returns existing gateway URL for non-terminal statuses', async () => {
    const claim = buildClaim();
    claim.generalApplication.applicationFeePaymentDetails = {paymentReference: 'REF-1', nextUrl: 'https://pay/current'} as unknown as never;
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    (getGaFeePaymentStatus as jest.Mock).mockResolvedValue({status: 'Created'});

    const url = await getRedirectUrl(CLAIM_ID, new GenericYesNo(YesNo.NO, ''), 'applyHelpWithFees', buildReq() as never);

    expect(url).toBe('https://pay/current');
  });

  it('routes YES branch to apply-help-with-fees and persists HWF details (including additional fee)', async () => {
    const claim = buildClaim();
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    (getDraftGAHWFDetails as jest.Mock).mockResolvedValue({applyHelpWithFees: {}, applicationFee: '0'});
    (getApplicationFromGAService as jest.Mock).mockResolvedValue({
      case_data: {
        generalAppPBADetails: {
          additionalPaymentServiceRef: 'ADDITIONAL-REF',
          fee: {calculatedAmountInPence: '30300'},
        },
      },
    });
    const req = buildReq({query: {appFee: '303'}});

    const url = await getRedirectUrl(CLAIM_ID, new GenericYesNo(YesNo.YES, ''), 'applyHelpWithFees', req as never);

    expect(url).toBe(`/case/${CLAIM_ID}/general-application/${APP_ID}/apply-help-with-fees?additionalFeeTypeFlag=true`);
    expect(saveDraftGAHWFDetails).toHaveBeenCalled();
  });
});
