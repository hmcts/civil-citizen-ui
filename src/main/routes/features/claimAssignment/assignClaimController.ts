import {Router} from 'express';
import {ASSIGN_CLAIM_URL, DASHBOARD_URL} from 'routes/urls';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {deleteDraftClaimFromStore} from 'modules/draft-store/draftStoreService';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantRoleAssignmentService');
const assignClaimController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

assignClaimController.get(ASSIGN_CLAIM_URL, async ( req:AppRequest, res) => {
  const claimId = req.cookies?.firstContact?.claimId;
  console.log('*******assign defendant*****************');
  console.log(claimId);
  try{
    if (claimId || claimId != 'undefined') {
      await civilServiceClient.assignDefendantToClaim(claimId, req);
      deleteDraftClaimFromStore(claimId);
      res.clearCookie('firstContact');
    }
  } catch (error) {
    logger.error(`Error Message: ${error.message}, http Code: ${error.code}`);
  } finally {
    res.redirect(DASHBOARD_URL);
  }
});

export default assignClaimController;
