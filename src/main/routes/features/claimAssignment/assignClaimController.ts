import {Router} from 'express';
import {ASSIGN_CLAIM_URL, DASHBOARD_URL} from 'routes/urls';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {deleteDraftClaimFromStore} from 'modules/draft-store/draftStoreService';
import { getFirstContactData } from 'services/firstcontact/firstcontactService';
import { getClaimById } from 'modules/utilityService';
import { Claim } from 'common/models/claim';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantRoleAssignmentService');
const assignClaimController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

assignClaimController.get(ASSIGN_CLAIM_URL, async ( req:AppRequest, res) => {
  const firstContact = getFirstContactData(req.session);
  const claimId = firstContact?.claimId;
  try{
    if (claimId) {
      const claim: Claim = await getClaimById(claimId, req);
      await civilServiceClient.assignDefendantToClaim(claimId, req, claim.respondent1PinToPostLRspec?.accessCode);
      await deleteDraftClaimFromStore(claimId);
      req.session.firstContact = {};
    }
  } catch (error) {
    logger.error(`Error Message: ${error.message}, http Code: ${error.code}`);
  } finally {
    req.session.firstContact = {};
    res.redirect(DASHBOARD_URL);
  }
});

export default assignClaimController;
