import {NextFunction, Response, Router} from 'express';
import {CLAIM_DEFENDANT_PARTY_TYPE_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {PartyTypeSelection} from 'form/models/claim/partyTypeSelection';
import {redirectToPage} from 'services/features/claim/partyTypeService';
import {ClaimantOrDefendant} from 'models/partyType';
import {
  getDefendantInformation,
  saveDefendantProperty,
} from 'services/features/common/defendantDetailsService';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';

const defendantPartyTypeViewPath = 'features/claim/defendant-party-type';
const defendantPartyTypeController = Router();

defendantPartyTypeController.get(CLAIM_DEFENDANT_PARTY_TYPE_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const caseId = req.session?.user?.id;
    const defendant: Party = await getDefendantInformation(caseId);
    const defendantPartyType = defendant?.type;
    const form = new GenericForm(new PartyTypeSelection(defendantPartyType));
    res.render(defendantPartyTypeViewPath, {form});
  } catch (error) {
    next(error);
  }
});

defendantPartyTypeController.post(CLAIM_DEFENDANT_PARTY_TYPE_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const caseId = req.session?.user?.id;
    const form = new GenericForm(new PartyTypeSelection(Object.assign(req.body).option));
    form.validateSync();

    if (form.hasErrors()) {
      res.render(defendantPartyTypeViewPath, {form});
    } else {
      await saveDefendantProperty(caseId, 'type', form.model.option);
      redirectToPage(form.model.option, res, ClaimantOrDefendant.DEFENDANT);
    }
  } catch (error) {
    next(error);
  }
});

export default defendantPartyTypeController;
