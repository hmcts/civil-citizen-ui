import {NextFunction, Response, Router} from 'express';
import {CLAIMANT_PARTY_TYPE_SELECTION_URL} from '../../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {PartyTypeSelection} from 'common/form/models/claim/partyTypeSelection';
import {ClaimantOrDefendant, PartyType} from 'common/models/partyType';
import {redirectToPage} from '../../../../services/features/claim/partyTypeService';
import {AppRequest} from 'common/models/AppRequest';
import {getClaimantInformation, saveClaimantProperty} from '../../../../../main/services/features/claim/yourDetails/claimantDetailsService';
import {Party} from 'common/models/party';

const claimantPartyTypeViewPath = 'features/claim/claimant-party-type';
const claimantPartyTypeController = Router();

claimantPartyTypeController.get(CLAIMANT_PARTY_TYPE_SELECTION_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const claimant: Party = await getClaimantInformation(userId);
    const form = new GenericForm(new PartyTypeSelection(claimant?.type));
    res.render(claimantPartyTypeViewPath, {form});
  } catch (error) {
    next(error);
  }
});

claimantPartyTypeController.post(CLAIMANT_PARTY_TYPE_SELECTION_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
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
});

export default claimantPartyTypeController;
