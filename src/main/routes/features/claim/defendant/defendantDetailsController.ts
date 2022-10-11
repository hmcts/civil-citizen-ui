import {NextFunction, Response, Router} from 'express';
import {AppRequest} from '../../../../common/models/AppRequest';
import {
  CLAIM_DEFENDANT_COMPANY_DETAILS_URL,
  CLAIM_DEFENDANT_EMAIL_URL,
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL,
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL,
} from '../../../urls';
import {getPartyTypeDependingOnRoute} from '../../../../services/features/claim/claimantOrDefendantTypeService';
import {getDefendantInformation, saveDefendant} from '../../../../services/features/claim/defendantDetailsService';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {Address} from '../../../../common/form/models/address';
import {CompanyOrOrganisationPartyDetails} from '../../../../common/form/models/companyOrOrganisationPartyDetails';
import {convertToPrimaryAddress} from '../../../../common/models/primaryAddress';
import {PartyType} from '../../../../common/models/partyType';

const defendantDetailsController = Router();
const defendantDetailsCompanyOrOrganisationViewPath = 'features/claim/defendant/defendant-details-company-or-organisation';
const defendantDetailsIndividualOrSoleTraderViewPath = 'features/claim/defendant/defendant-details-individual-or-sole-trader';
const detailsURLs = [
  CLAIM_DEFENDANT_COMPANY_DETAILS_URL,
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL,
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL,
];

function renderView(res: Response, form: GenericForm<CompanyOrOrganisationPartyDetails>, primaryAddressForm: GenericForm<Address>, defendantType: PartyType) {
  if (defendantType === PartyType.COMPANY || defendantType === PartyType.ORGANISATION) {
    res.render(defendantDetailsCompanyOrOrganisationViewPath, {form, primaryAddressForm, defendantType});
  } else {
    res.render(defendantDetailsIndividualOrSoleTraderViewPath, {form, primaryAddressForm, defendantType});
  }
}

defendantDetailsController.get(detailsURLs, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const defendantType = getPartyTypeDependingOnRoute(req?.url);
    const userId = req.session?.user?.id;
    const defendantDetails = await getDefendantInformation(userId);
    // TODO: correspondence address needs refactoring as all attributes start as capitalised (AddressLine1) while
    //  we save camelcase (primaryAddressLine1) afterwards remove bellow Object.assign
    let defendantAddress = (defendantDetails?.primaryAddress) ? Object.assign(defendantDetails?.primaryAddress) : {};
    defendantAddress = convertToPrimaryAddress(defendantAddress);

    const form = new GenericForm(new CompanyOrOrganisationPartyDetails(defendantDetails?.partyName, defendantDetails?.contactPerson));
    const primaryAddressForm = new GenericForm(new Address(
      defendantAddress?.AddressLine1,
      defendantAddress?.AddressLine2,
      defendantAddress?.AddressLine3,
      defendantAddress?.PostTown,
      defendantAddress?.PostCode,
    ));
    renderView(res, form, primaryAddressForm, defendantType);
  } catch (error) {
    next(error);
  }
});

defendantDetailsController.post(detailsURLs, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const defendantType = getPartyTypeDependingOnRoute(req?.url);
    const userId = req.session?.user?.id;
    const body = Object.assign(req.body);
    const form = new GenericForm(new CompanyOrOrganisationPartyDetails(body.partyName, body.contactPerson));
    const primaryAddressForm = new GenericForm(new Address(
      body.primaryAddressLine1,
      body.primaryAddressLine2,
      body.primaryAddressLine3,
      body.primaryCity,
      body.primaryPostCode,
    ));
    primaryAddressForm.validateSync();
    form.validateSync();

    if (form.hasErrors() || primaryAddressForm.hasErrors()) {
      renderView(res, form, primaryAddressForm, defendantType);
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
