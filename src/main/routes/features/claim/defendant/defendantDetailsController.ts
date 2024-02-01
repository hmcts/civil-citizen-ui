import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {AppRequest} from '../../../../common/models/AppRequest';
import {
  CLAIM_DEFENDANT_COMPANY_DETAILS_URL,
  CLAIM_DEFENDANT_EMAIL_URL,
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL,
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL,
} from '../../../urls';
import {
  getDefendantInformation,
  saveDefendantProperty,
} from '../../../../services/features/common/defendantDetailsService';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {PartyType} from '../../../../common/models/partyType';
import {PartyDetails} from '../../../../common/form/models/partyDetails';
import {Party} from '../../../../common/models/party';

const defendantDetailsController = Router();
const defendantDetailsCompanyOrOrganisationViewPath = 'features/claim/defendant/defendant-details-company-or-organisation';
const defendantDetailsIndividualOrSoleTraderViewPath = 'features/claim/defendant/defendant-details-individual-or-sole-trader';
const detailsURLs = [
  CLAIM_DEFENDANT_COMPANY_DETAILS_URL,
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL,
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL,
];

function renderView(res: Response, form: GenericForm<PartyDetails>, defendantType: PartyType) {
  if (defendantType === PartyType.COMPANY || defendantType === PartyType.ORGANISATION) {
    res.render(defendantDetailsCompanyOrOrganisationViewPath, {form, defendantType});
  } else {
    res.render(defendantDetailsIndividualOrSoleTraderViewPath, {form, defendantType});
  }
}

defendantDetailsController.get(detailsURLs, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const defendantDetails = await getDefendantInformation(userId);
    const partyDetails = new GenericForm<PartyDetails>(defendantDetails.partyDetails);

    renderView(res, partyDetails, defendantDetails.type);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

defendantDetailsController.post(detailsURLs, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  const userId = (<AppRequest>req).session?.user?.id;

  try {
    const defendant: Party = await getDefendantInformation(userId);
    const partyDetails = new GenericForm(new PartyDetails(req.body));
    partyDetails.validateSync();

    if (partyDetails.hasErrors()) {
      renderView(res, partyDetails, defendant.type);
    } else {
      await saveDefendantProperty(userId, 'partyDetails', partyDetails.model);
      res.redirect(CLAIM_DEFENDANT_EMAIL_URL);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default defendantDetailsController;
