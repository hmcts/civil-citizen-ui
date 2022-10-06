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

const defendantDetailsController = Router();
const defendantDetailsViewPath = 'features/claim/defendant/defendant-details';
const detailsURLs = [
  CLAIM_DEFENDANT_COMPANY_DETAILS_URL,
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL,
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL,
];

defendantDetailsController.get(detailsURLs, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const defendantType = getPartyTypeDependingOnRoute(req?.url);
    const userId = req.session?.user?.id;
    const defendantDetails = await getDefendantInformation(userId);
    // TODO: correspondence address needs refactoring as all attributes start as capitalised (AddressLine1) while
    //  we save camelcase (primaryAddressLine1) afterwards remove bellow attributes set
    let defendantAddress = Object.assign(defendantDetails?.primaryAddress);
    defendantAddress = {
      ...defendantAddress,
      AddressLine1: defendantAddress?.primaryAddressLine1,
      AddressLine2: defendantAddress?.primaryAddressLine2,
      AddressLine3: defendantAddress?.primaryAddressLine3,
      PostTown: defendantAddress?.primaryCity,
      PostCode: defendantAddress?.primaryPostCode,
    };

    // TODO: wrap in the conditional if not suitable for your defendantType (CIV-4300, 4299, 4286). Currently catering for ORGANISATION
    const form = new GenericForm(new CompanyOrOrganisationPartyDetails(defendantDetails?.partyName, defendantDetails?.contactPerson));
    const primaryAddressForm = new GenericForm(new Address(
      defendantAddress?.AddressLine1,
      defendantAddress?.AddressLine2,
      defendantAddress?.AddressLine3,
      defendantAddress?.PostTown,
      defendantAddress?.PostCode,
    ));

    res.render(defendantDetailsViewPath, {form, primaryAddressForm, defendantType});
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
      res.render(defendantDetailsViewPath, {form, primaryAddressForm, defendantType});
    } else {
      const partyDetailsAndPrimaryAddress = {
        ...form.model,
        primaryAddress: {
          ...primaryAddressForm.model,
        },
      };
      await saveDefendant(userId, undefined, partyDetailsAndPrimaryAddress, true);
      res.redirect(CLAIM_DEFENDANT_EMAIL_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default defendantDetailsController;
