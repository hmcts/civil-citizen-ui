import {Router, NextFunction} from 'express';
import {ASSIGN_CLAIM_URL, DASHBOARD_URL} from 'routes/urls';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';

const assignClaimController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

assignClaimController.get(ASSIGN_CLAIM_URL, async ( req:AppRequest, res, next: NextFunction) => {
  const claimId = req.params.id;
  try{
    await civilServiceClient.assignDefendantToClaim(claimId, req);
    res.redirect(DASHBOARD_URL);
  }catch (error){
    next();
  }
});
