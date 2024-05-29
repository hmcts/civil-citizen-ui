import { CivilServiceClient } from 'client/civilServiceClient';
import { AppRequest } from 'common/models/AppRequest';
import { Claim } from 'common/models/claim';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { saveDraftClaim } from 'modules/draft-store/draftStoreService';
import { gaApplicationFeeDetails } from 'services/features/generalApplication/feeDetailsService';


jest.mock('../../../../../main/modules/draft-store/draftStoreService', () => ({
    generateRedisKey: jest.fn().mockReturnValueOnce('123'),
    saveDraftClaim: jest.fn((redis: string, claim: Claim) => { }),
}))


describe('GA fee details', () => {
    let claim: Claim
    beforeEach(() => {
        claim = new Claim();
        claim.generalApplication = new GeneralApplication();
    })
    it('should fetch the fee details and save data', async () => {
        const gaFeeDetails = {
            calculatedAmountInPence: 1400,
            code: 'Fe124',
            version: 0,
        }
        jest.spyOn(CivilServiceClient.prototype, 'getGeneralApplicationFee').mockResolvedValueOnce(gaFeeDetails)

        claim.generalApplication.applicationTypes = [{ option: ApplicationTypeOption.SET_ASIDE_JUDGEMENT, isOtherSelected: () => false }]
        const gaFeeData = await gaApplicationFeeDetails(claim, {} as AppRequest);
        expect(gaFeeDetails).toEqual(gaFeeData)
        expect(gaFeeDetails).toEqual(claim.generalApplication.applicationFee);
        expect(saveDraftClaim).toHaveBeenCalledWith('123', claim)
    })

    it('should throw an error when api throws error', async () => {
        const errMessage = new Error('unauthorized');
        jest.spyOn(CivilServiceClient.prototype, 'getGeneralApplicationFee').mockRejectedValueOnce(errMessage)
        gaApplicationFeeDetails(claim, {} as AppRequest).catch((err) => {
            expect(err).toEqual(errMessage)
        });

    })
});