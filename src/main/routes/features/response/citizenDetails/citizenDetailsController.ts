import {NextFunction, Request, Response, Router} from 'express';
import {CITIZEN_DETAILS_URL, DOB_URL, CITIZEN_PHONE_NUMBER_URL} from '../../../urls';
import {Address} from '../../../../common/form/models/address';
import {CitizenCorrespondenceAddress} from '../../../../common/form/models/citizenCorrespondenceAddress';
import {Party} from '../../../../common/models/party';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {YesNo} from '../../../../common/form/models/yesNo';
import {
  getCorrespondenceAddressForm,
  getRespondentInformation,
  saveRespondent,
} from '../../../../services/features/response/citizenDetails/citizenDetailsService';
import {PartyType} from '../../../../common/models/partyType';
import {GenericForm} from '../../../../common/form/models/genericForm';

const citizenDetailsController = Router();

const CITIZEN_DETAILS_COMPANY_VIEW_PATH = 'features/response/citizenDetails/citizen-details-company';
const CITIZEN_DETAILS_VIEW_PATH = 'features/response/citizenDetails/citizen-details';

const getViewPathWithType = (type: PartyType) => {
  if (type === PartyType.ORGANISATION || type === PartyType.COMPANY) {
    return CITIZEN_DETAILS_COMPANY_VIEW_PATH;
  }
  return CITIZEN_DETAILS_VIEW_PATH;
};

function renderPage(res: Response, req: Request, party: GenericForm<Party>, citizenAddress: GenericForm<Address>, citizenCorrespondenceAddress: GenericForm<CitizenCorrespondenceAddress>, respondent: Party): void {

  res.render(getViewPathWithType(respondent.type), {
    respondent,
    citizenAddress,
    citizenCorrespondenceAddress,
    party,
  });
}

const redirect = (respondent: Party, req: Request, res: Response) => {
  if (respondent?.type === PartyType.SOLE_TRADER || respondent?.type === PartyType.INDIVIDUAL) {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, DOB_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PHONE_NUMBER_URL));
  }
};

citizenDetailsController.get(CITIZEN_DETAILS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const respondent: Party = await getRespondentInformation(req.params.id);
    const party = new GenericForm(respondent);
    const citizenAddress = new GenericForm<Address>(Address.fromJson(respondent?.primaryAddress));
    const citizenCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(CitizenCorrespondenceAddress.fromJson(respondent?.correspondenceAddress));
    renderPage(res, req, party, citizenAddress, citizenCorrespondenceAddress, respondent);
  } catch (error) {
    next(error);
  }
});

citizenDetailsController.post(CITIZEN_DETAILS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const respondent = await getRespondentInformation(req.params.id);
    const party = new GenericForm(new Party(req.body));
    const citizenAddress = new GenericForm<Address>(Address.fromObject(req.body));
    const citizenCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(getCorrespondenceAddressForm(req.body));

    party.validateSync();
    citizenAddress.validateSync();

    if (req.body.postToThisAddress === YesNo.YES) {
      citizenCorrespondenceAddress.validateSync();
      respondent.postToThisAddress = YesNo.YES;
    }
    if (party.hasErrors() || citizenAddress.hasErrors() || citizenCorrespondenceAddress.hasErrors()) {
      renderPage(res, req, party, citizenAddress, citizenCorrespondenceAddress, respondent);
    } else {
      await saveRespondent(req.params.id, citizenAddress.model, citizenCorrespondenceAddress.model, party.model);
      redirect(respondent, req, res);
    }
  } catch (error) {
    next(error);
  }
});

export default citizenDetailsController;
