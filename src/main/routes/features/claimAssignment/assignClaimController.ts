import {Router} from 'express';
import {ASSIGN_CLAIM_URL, DASHBOARD_URL} from 'routes/urls';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';

const assignClaimController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

assignClaimController.get(ASSIGN_CLAIM_URL, async ( req:AppRequest, res) => {
  const claimId = req.session?.assignClaimId;
  req.session.assignClaimId = undefined;
  try{
    if(claimId){
      await civilServiceClient.assignDefendantToClaim(claimId, req);
    }
  }finally {
    res.redirect(DASHBOARD_URL);
  }
});

export default assignClaimController;
