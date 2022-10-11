import express from 'express';
import {CLAIM_DEFENDANT_PARTY_TYPE_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {PartyTypeSelection} from '../../../common/form/models/claim/partyTypeSelection';
import {redirectToPage} from '../../../services/features/claim/partyTypeService';
import {ClaimantOrDefendant} from '../../../common/models/partyType';
import {getDefendantInformation, saveDefendant} from '../../../services/features/claim/defendantDetailsService';
import {Party} from '../../../common/models/claim';
import {AppRequest} from '../../../common/models/AppRequest';

const defendantPartyTypeViewPath = 'features/claim/defendant-party-type';
const defendantPartyTypeController = express.Router();

defendantPartyTypeController.get(CLAIM_DEFENDANT_PARTY_TYPE_URL, async (req: AppRequest, res: express.Response, next: express.NextFunction) => {
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

defendantPartyTypeController.post(CLAIM_DEFENDANT_PARTY_TYPE_URL, async (req: AppRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const caseId = req.session?.user?.id;
    const form = new GenericForm(new PartyTypeSelection(Object.assign(req.body).option));
    form.validateSync();

    if (form.hasErrors()) {
      res.render(defendantPartyTypeViewPath, {form});
    } else {
      await saveDefendant(caseId, 'type', form.model.option);
      redirectToPage(form.model.option, res, ClaimantOrDefendant.DEFENDANT);
    }
  } catch (error) {
    next(error);
  }
});

export default defendantPartyTypeController;
