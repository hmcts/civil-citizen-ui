import {NextFunction, RequestHandler, Response, Router} from 'express';
import {CLAIMANT_PARTY_TYPE_SELECTION_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {PartyTypeSelection} from 'form/models/claim/partyTypeSelection';
import {ClaimantOrDefendant, PartyType} from 'models/partyType';
import {redirectToPage} from 'services/features/claim/partyTypeService';
import {AppRequest} from 'models/AppRequest';
import {getClaimantInformation, saveClaimantProperty} from 'services/features/claim/yourDetails/claimantDetailsService';
import {Party} from 'models/party';

const claimantPartyTypeViewPath = 'features/claim/claimant-party-type';
const claimantPartyTypeController = Router();

claimantPartyTypeController.get(CLAIMANT_PARTY_TYPE_SELECTION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const claimant: Party = await getClaimantInformation(userId);
    const form = new GenericForm(new PartyTypeSelection(claimant?.type));
    res.render(claimantPartyTypeViewPath, {form});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

claimantPartyTypeController.post(CLAIMANT_PARTY_TYPE_SELECTION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const reqBody = req.body as Record<string, string>;
    const form = new GenericForm(new PartyTypeSelection(reqBody.option as PartyType));
    form.validateSync();
    if (form.hasErrors()) {
      res.render(claimantPartyTypeViewPath, {form});
    } else {
      await saveClaimantProperty(userId, 'type', form.model.option);
      redirectToPage(form.model.option, res, ClaimantOrDefendant.CLAIMANT);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantPartyTypeController;
