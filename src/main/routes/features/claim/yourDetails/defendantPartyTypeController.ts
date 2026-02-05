import {NextFunction, RequestHandler, Response, Router} from 'express';
import {CLAIM_DEFENDANT_PARTY_TYPE_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {PartyTypeSelection} from 'form/models/claim/partyTypeSelection';
import {redirectToPage} from 'services/features/claim/partyTypeService';
import {ClaimantOrDefendant, PartyType} from 'models/partyType';
import {
  getDefendantInformation,
  saveDefendantProperty,
} from 'services/features/common/defendantDetailsService';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {deleteDelayedFlight} from 'services/features/claim/delayedFlightService';

const defendantPartyTypeViewPath = 'features/claim/defendant-party-type';
const defendantPartyTypeController = Router();
const pageTitle= 'PAGES.DEFENDANT_PARTY_TYPE.PAGE_TITLE';

defendantPartyTypeController.get(CLAIM_DEFENDANT_PARTY_TYPE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const caseId = req.session?.user?.id;
    const defendant: Party = await getDefendantInformation(caseId);
    const defendantPartyType = defendant?.type;
    const form = new GenericForm(new PartyTypeSelection(defendantPartyType, 'ERRORS.DEFENDANT_PARTY_TYPE_REQUIRED'));
    res.render(defendantPartyTypeViewPath, {form, pageTitle});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

defendantPartyTypeController.post(CLAIM_DEFENDANT_PARTY_TYPE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const caseId = req.session?.user?.id;
    const form = new GenericForm(new PartyTypeSelection(Object.assign(req.body).option, 'ERRORS.DEFENDANT_PARTY_TYPE_REQUIRED'));
    form.validateSync();

    if (form.hasErrors()) {
      res.render(defendantPartyTypeViewPath, {form, pageTitle});
    } else {
      if (form.model.option !== PartyType.COMPANY) {
        await deleteDelayedFlight(caseId);
      }
      await saveDefendantProperty(caseId, 'type', form.model.option);
      redirectToPage(form.model.option, res, ClaimantOrDefendant.DEFENDANT);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default defendantPartyTypeController;
