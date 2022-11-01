import {NextFunction, Request, Response, Router} from 'express';
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
  saveDefendantParty,
} from '../../../../services/features/claim/yourDetails/defendantDetailsService';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {Address} from '../../../../common/form/models/address';
import {CompanyOrOrganisationPartyDetails} from '../../../../common/form/models/companyOrOrganisationPartyDetails';
import {PartyType} from '../../../../common/models/partyType';
import {PartyDetails} from '../../../../common/form/models/partyDetails';
import {Party} from '../../../../common/models/party';
import {getCorrespondenceAddressForm} from '../../../../services/features/claim/yourDetails/claimantDetailsService';
import {CitizenCorrespondenceAddress} from '../../../../common/form/models/citizenCorrespondenceAddress';
import {YesNo} from '../../../../common/form/models/yesNo';

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
    const defendantAddress = (defendantDetails?.primaryAddress) ? Object.assign(defendantDetails?.primaryAddress) : {};

    let form: GenericForm<PartyDetails | CompanyOrOrganisationPartyDetails>;
    if (defendantDetails.type === PartyType.COMPANY || defendantDetails.type === PartyType.ORGANISATION) {
      form = new GenericForm(new CompanyOrOrganisationPartyDetails(defendantDetails?.partyName, defendantDetails?.contactPerson));
    } else {
      form = new GenericForm<PartyDetails>(new PartyDetails(defendantDetails));
    }
    const primaryAddressForm = new GenericForm(new Address(
      defendantAddress?.AddressLine1,
      defendantAddress?.AddressLine2,
      defendantAddress?.AddressLine3,
      defendantAddress?.PostTown,
      defendantAddress?.PostCode,
    ));
    renderView(res, form, primaryAddressForm, defendantDetails.type);
  } catch (error) {
    next(error);
  }
});

defendantDetailsController.post(detailsURLs, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  const userId = (<AppRequest>req).session?.user?.id;
  let party = new GenericForm(new Party());
  try {
    const defendant: Party = await getDefendantInformation(userId);
    const defendantIndividualAddress = new GenericForm<Address>(Address.fromObject(req.body));
    const defendantIndividualCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(getCorrespondenceAddressForm(req.body));
    party = new GenericForm(new Party(req.body));
    party.model.type = defendant.type;
    if (defendant.type === PartyType.COMPANY || defendant.type === PartyType.ORGANISATION) {
      party.validateSync();
    }
    const defendantDetails = new GenericForm<PartyDetails>(new PartyDetails(req.body));
    defendantDetails.validateSync();
    defendantIndividualAddress.validateSync();

    if (req.body.provideCorrespondenceAddress === YesNo.YES) {
      defendantIndividualCorrespondenceAddress.validateSync();
      defendant.provideCorrespondenceAddress = YesNo.YES;
    }
    if (defendantDetails.hasErrors() || party.hasErrors() || defendantIndividualAddress.hasErrors() || defendantIndividualCorrespondenceAddress.hasErrors()) {
      renderView(res, defendantDetails, defendantIndividualAddress, defendant.type);
    } else {
      await saveDefendantParty(userId, defendantIndividualAddress.model, defendantIndividualCorrespondenceAddress.model, req.body.provideCorrespondenceAddress, party.model);
      res.redirect(CLAIM_DEFENDANT_EMAIL_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default defendantDetailsController;
