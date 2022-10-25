import {NextFunction, Response, Router} from 'express';
import {AppRequest} from '../../../../common/models/AppRequest';
import {
  CLAIM_DEFENDANT_COMPANY_DETAILS_URL,
  CLAIM_DEFENDANT_EMAIL_URL,
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL,
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL,
} from '../../../urls';
import {getDefendantInformation, saveDefendant} from '../../../../services/features/claim/yourDetails/defendantDetailsService';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {Address} from '../../../../common/form/models/address';
import {CompanyOrOrganisationPartyDetails} from '../../../../common/form/models/companyOrOrganisationPartyDetails';
import {convertToPrimaryAddress} from '../../../../common/models/primaryAddress';
import {PartyType} from '../../../../common/models/partyType';
import {PartyDetails} from '../../../../common/form/models/partyDetails';

const defendantDetailsController = Router();
const defendantDetailsCompanyOrOrganisationViewPath = 'features/claim/defendant/defendant-details-company-or-organisation';
const defendantDetailsIndividualOrSoleTraderViewPath = 'features/claim/defendant/defendant-details-individual-or-sole-trader';
const detailsURLs = [
  CLAIM_DEFENDANT_COMPANY_DETAILS_URL,
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL,
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL,
];

function renderView(res: Response, form: GenericForm<PartyDetails | CompanyOrOrganisationPartyDetails>, primaryAddressForm: GenericForm<Address>, defendantType: PartyType) {
  if (defendantType === PartyType.COMPANY || defendantType === PartyType.ORGANISATION) {
    res.render(defendantDetailsCompanyOrOrganisationViewPath, {form, primaryAddressForm, defendantType});
  } else {
    res.render(defendantDetailsIndividualOrSoleTraderViewPath, {form, primaryAddressForm, defendantType});
  }
}

defendantDetailsController.get(detailsURLs, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const defendantDetails = await getDefendantInformation(userId);
    // TODO: correspondence address needs refactoring as all attributes start as capitalised (AddressLine1) while
    //  we save camelcase (primaryAddressLine1) afterwards remove bellow Object.assign
    let defendantAddress = (defendantDetails.primaryAddress) ? Object.assign(defendantDetails.primaryAddress) : {};
    defendantAddress = convertToPrimaryAddress(defendantAddress);

    let form: GenericForm<PartyDetails | CompanyOrOrganisationPartyDetails>;
    if (defendantDetails.type === PartyType.COMPANY || defendantDetails.type === PartyType.ORGANISATION) {
      form = new GenericForm(new CompanyOrOrganisationPartyDetails(defendantDetails.partyName, defendantDetails.contactPerson));
    } else {
      form = new GenericForm<PartyDetails>(new PartyDetails(defendantDetails));
    }
    const primaryAddressForm = new GenericForm(Address.fromJson(defendantAddress));
    renderView(res, form, primaryAddressForm, defendantDetails.type);
  } catch (error) {
    next(error);
  }
});

defendantDetailsController.post(detailsURLs, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const defendantDetails = await getDefendantInformation(userId);
    const body = req.body as Record<string, string>;
    let form: GenericForm<PartyDetails | CompanyOrOrganisationPartyDetails> ;
    if (defendantDetails.type === PartyType.COMPANY || defendantDetails.type === PartyType.ORGANISATION) {
      form = new GenericForm(new CompanyOrOrganisationPartyDetails(body.partyName, body.contactPerson));
    } else {
      form = new GenericForm<PartyDetails>(new PartyDetails(body));
    }
    const primaryAddressForm = new GenericForm(Address.fromObject(body));
    primaryAddressForm.validateSync();
    form.validateSync();

    if (form.hasErrors() || primaryAddressForm.hasErrors()) {
      renderView(res, form, primaryAddressForm, defendantDetails.type);
    } else {
      const partyDetailsAndPrimaryAddress = {
        ...form.model,
        primaryAddress: {
          ...primaryAddressForm.model,
        },
      };
      await saveDefendant(userId, '', partyDetailsAndPrimaryAddress, true);
      res.redirect(CLAIM_DEFENDANT_EMAIL_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default defendantDetailsController;
