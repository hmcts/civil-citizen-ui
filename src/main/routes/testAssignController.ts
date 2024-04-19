import {NextFunction, RequestHandler, Router} from 'express';
import {getClaimById} from 'modules/utilityService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import { deleteDraftClaimFromStore, generateRedisKey } from 'modules/draft-store/draftStoreService';
import { TEST_ASSIGN_URL } from './urls';
const testAssignController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

testAssignController.get(TEST_ASSIGN_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    claim.issueDate = new Date();
    // TODO: Need to create a separate service when we do the fee and pay page
    await deleteDraftClaimFromStore(generateRedisKey(<AppRequest>req));
    await civilServiceClient.submitClaimAfterPayment(claimId, claim, <AppRequest>req);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default testAssignController;
