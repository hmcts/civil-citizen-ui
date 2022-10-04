import * as express from 'express';
import {CLAIMANT_PHONE_URL, CLAIM_CLAIMANT_SOLE_TRADER_DETAILS_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {CitizenAddress} from '../../../common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from '../../../common/form/models/citizenCorrespondenceAddress';
import {YesNo} from '../../../common/form/models/yesNo';
import {
  getClaimantInformation,
  getCorrespondenceAddressForm,
  saveClaimant,
} from '../../../services/features/claim/claimantDetailsService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {PartyDetails} from '../../../common/form/models/partyDetails';
import {Party} from '../../../common/models/claim';
import {AppRequest} from 'common/models/AppRequest';

const claimantSoleTraderDetailsController = express.Router();
const claimantSoleTraderDetailsPath = 'features/claim/claimant-sole-trader-details';

function renderPage(res: express.Response, req: express.Request, claimant: Party,  claimantSoleTraderAddress: GenericForm<CitizenAddress>, claimantSoleTraderCorrespondenceAddress: GenericForm<CitizenCorrespondenceAddress>, claimantDetails: GenericForm<PartyDetails>): void {
  const partyName = claimant?.partyName;
  const type = claimant?.type;

  res.render(claimantSoleTraderDetailsPath, {
    claimant,
    claimantSoleTraderAddress,
    claimantSoleTraderCorrespondenceAddress,
    claimantDetails,
    partyName,
    type,
  });
}

claimantSoleTraderDetailsController.get(CLAIM_CLAIMANT_SOLE_TRADER_DETAILS_URL, async (req:AppRequest, res:express.Response, next: express.NextFunction) => {
  try {
    const caseId = req.session?.user?.id;
    const claimant: Party = await getClaimantInformation(caseId);

    const claimantSoleTraderAddress = new GenericForm<CitizenAddress>(CitizenAddress.fromJson(claimant.primaryAddress));
    const claimantSoleTraderCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(CitizenCorrespondenceAddress.fromJson(claimant.correspondenceAddress));
    const claimantDetails = new GenericForm<PartyDetails>(PartyDetails.fromJson(claimant));

    renderPage(res, req, claimant, claimantSoleTraderAddress, claimantSoleTraderCorrespondenceAddress, claimantDetails);
  } catch (error) {
    next(error);
  }
});

claimantSoleTraderDetailsController.post(CLAIM_CLAIMANT_SOLE_TRADER_DETAILS_URL, async (req: any, res: express.Response, next: express.NextFunction) => {
  const caseId = req.session?.user?.id;
  const claimant: Party = await getClaimantInformation(caseId);
  try {
    const claimantSoleTraderlAddress = new GenericForm<CitizenAddress>(CitizenAddress.fromObject(req.body));
    const claimantSoleTraderCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(getCorrespondenceAddressForm(req.body));
    const claimantDetails = new GenericForm<PartyDetails>(PartyDetails.fromObject(req.body));

    claimantDetails.validateSync();
    claimantSoleTraderlAddress.validateSync();

    if (req.body.provideCorrespondenceAddress === YesNo.YES) {
      claimantSoleTraderCorrespondenceAddress.validateSync();
      claimant.provideCorrespondenceAddress = YesNo.YES;
    }

    if (claimantDetails.hasErrors() || claimantSoleTraderlAddress.hasErrors() || claimantSoleTraderCorrespondenceAddress.hasErrors()) {
      renderPage(res, req, claimant, claimantSoleTraderlAddress, claimantSoleTraderCorrespondenceAddress, claimantDetails);
    } else {
      await saveClaimant(caseId, claimantSoleTraderlAddress.model, claimantSoleTraderCorrespondenceAddress.model, req.body.provideCorrespondenceAddress, claimantDetails.model);
      res.redirect(constructResponseUrlWithIdParams(caseId, CLAIMANT_PHONE_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default claimantSoleTraderDetailsController;
