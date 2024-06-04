import { CivilServiceClient } from 'client/civilServiceClient';
import { YesNo } from 'common/form/models/yesNo';
import { AppRequest } from 'common/models/AppRequest';
import { CaseProgressionHearing } from 'common/models/caseProgression/caseProgressionHearing';
import { Claim } from 'common/models/claim';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { saveDraftClaim } from 'modules/draft-store/draftStoreService';
import { gaApplicationFeeDetails } from 'services/features/generalApplication/feeDetailsService';

jest.mock('../../../../../main/modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn().mockReturnValueOnce('123'),
  saveDraftClaim: jest.fn(),
}));

describe('GA fee details', () => {
  let claim: Claim;
  beforeEach(() => {
    claim = new Claim();
    claim.generalApplication = new GeneralApplication();
  });

  it('should fetch the fee details and save data', async () => {
    const gaFeeDetails = {
      calculatedAmountInPence: 1400,
      code: 'Fe124',
      version: 0,
    };
    jest.spyOn(CivilServiceClient.prototype, 'getGeneralApplicationFee').mockResolvedValueOnce(gaFeeDetails);

    claim.generalApplication.applicationTypes = [{ option: ApplicationTypeOption.SET_ASIDE_JUDGEMENT, isOtherSelected: () => false }];
    const gaFeeData = await gaApplicationFeeDetails(claim, {} as AppRequest);
    expect(gaFeeDetails).toEqual(gaFeeData);
    expect(gaFeeDetails).toEqual(claim.generalApplication.applicationFee);
    expect(saveDraftClaim).toHaveBeenCalledWith('123', claim);
  });
  it('should fetch the fee details with consent and  agreement and hearing save data', async () => {
    const gaFeeDetails = {
      calculatedAmountInPence: 0,
      code: 'Free',
      version: 0,
    };
    jest.spyOn(CivilServiceClient.prototype, 'getGeneralApplicationFee').mockResolvedValueOnce(gaFeeDetails);

    claim.generalApplication.applicationTypes = [{ option: ApplicationTypeOption.ADJOURN_HEARING, isOtherSelected: () => false }];
    claim.generalApplication.agreementFromOtherParty = YesNo.YES;
    claim.generalApplication.informOtherParties = { option: YesNo.YES };
    claim.caseProgressionHearing = new CaseProgressionHearing();
    claim.caseProgressionHearing.hearingDate = new Date('2028-08-28');
    const gaFeeData = await gaApplicationFeeDetails(claim, {} as AppRequest);
    expect(gaFeeDetails).toEqual(gaFeeData);
    expect(gaFeeDetails).toEqual(claim.generalApplication.applicationFee);
  });

  it('should throw an error when api throws error', async () => {
    const errMessage = new Error('unauthorized');
    jest.spyOn(CivilServiceClient.prototype, 'getGeneralApplicationFee').mockRejectedValueOnce(errMessage);
    gaApplicationFeeDetails(claim, {} as AppRequest).catch((err) => {
      expect(err).toEqual(errMessage);
    });
  });
});