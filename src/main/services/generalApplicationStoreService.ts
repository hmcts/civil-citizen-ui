import { AppRequest } from 'common/models/AppRequest';
import { Claim } from 'common/models/claim';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { getClaimById, getGeneralApplicationById } from 'modules/utilityService';



export const getclaimGaDetails = async (claimId: string, gaId: string, req: AppRequest) => {
    let claim: Claim;
    let gaApplicationDetails: GeneralApplication
    if (claimId) {
        claim = await getClaimById(claimId, req); 
    }
    if (gaId) {
        gaApplicationDetails = await getGeneralApplicationById(gaId, req, true)
    }//genral application details
    return { claim, gaApplicationDetails }

}

// const getGACaseData = (gaId: string, req: AppRequest) => {

//   // const redisKey = generateRedisKeyForGA(req);
//     let claim: Claim = await getGeneralApplicationById(redisKey, true);
// }

