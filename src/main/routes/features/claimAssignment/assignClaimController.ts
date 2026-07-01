import {Router} from 'express';
import {AxiosError} from 'axios';
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
const claimFinalisedViewPath = 'features/public/firstContact/claim-finalised';

assignClaimController.get(ASSIGN_CLAIM_URL, async ( req:AppRequest, res) => {
  const firstContact = getFirstContactData(req.session);
  const claimId = firstContact?.claimId;
  try{
    if (claimId) {
      const claim: Claim = await getClaimById(claimId, req, false);
      await civilServiceClient.assignDefendantToClaim(claimId, req, claim.respondent1PinToPostLRspec?.accessCode);
      await deleteDraftClaimFromStore(claimId);
      req.session.firstContact = {};
    }
    req.session.firstContact = {};
    res.redirect(DASHBOARD_URL);
  } catch (error: unknown) {
    req.session.firstContact = {};
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 409 && axiosError.response?.data === 'CLAIM_ALREADY_FINALISED') {
      return res.render(claimFinalisedViewPath);
    }
    const message = error instanceof Error ? error.message : String(error);
    const code = axiosError.code;
    logger.error(`Error Message: ${message}, http Code: ${code}`);
    res.redirect(DASHBOARD_URL);
  }
});

export default assignClaimController;
