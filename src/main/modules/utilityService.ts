import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {getCaseDataFromStore, saveDraftClaim} from '../modules/draft-store/draftStoreService';
import {CivilServiceClient} from '../app/client/civilServiceClient';
import {Claim} from '../../main/common/models/claim';
import * as express from 'express';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

/**
 * Gets the claim from draft store and if not existing then gets it from ccd.
 * @param claimId, req
 * @returns claim
 */
export const getClaimById = async (claimId: string, req: express.Request): Promise<Claim> => {
  let claim: Claim = await getCaseDataFromStore(claimId);
  if(claim.isEmpty()) {
    claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if(claim) {
      await saveDraftClaim(claimId, claim);
    } else {
      claim = new Claim();
      claim.legacyCaseReference = 'testCaseReference';
      claim.totalClaimAmount = 200;
      claim.detailsOfClaim = 'detailsOfClaimTest';
      claim.totalInterest = 15;
      claim.claimFee = {calculatedAmountInPence: '3500'};
    }
  }
  return claim;
};
