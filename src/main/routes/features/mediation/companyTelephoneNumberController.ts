import {NextFunction, Response, Router} from 'express';
import {GenericForm} from '../../../common/form/models/genericForm';
import {CompanyTelephoneNumber} from '../../../common/form/models/mediation/companyTelephoneNumber';
import {CAN_WE_USE_COMPANY_URL, CLAIMANT_RESPONSE_TASK_LIST_URL, RESPONSE_TASK_LIST_URL} from '../../urls';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {
  getCompanyTelephoneNumberData,
  saveCompanyTelephoneNumberData,
} from '../../../services/features/response/mediation/companyTelephoneNumberService';
import {YesNo} from '../../../common/form/models/yesNo';
import {getMediation, saveMediation} from '../../../services/features/response/mediation/mediationService';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';

const companyTelephoneNumberController = Router();

function renderForm(form: GenericForm<CompanyTelephoneNumber>, res: Response, contactPerson?: string) {
  res.render('features/mediation/company-telephone-number', {form, contactPerson});
}

companyTelephoneNumberController.get(CAN_WE_USE_COMPANY_URL, async (req, res, next: NextFunction) => {
  try {
    const [contactPerson, telephoneNumberData] = await getCompanyTelephoneNumberData(req.params.id);
    const form = new GenericForm(telephoneNumberData);
    renderForm(form, res, contactPerson);
  } catch (error) {
    next(error);
  }
});

companyTelephoneNumberController.post(CAN_WE_USE_COMPANY_URL, async (req, res, next: NextFunction) => {
  const {
    option,
    mediationContactPerson,
    mediationPhoneNumber,
    mediationPhoneNumberConfirmation,
    contactPerson,
  } = req.body;
  const companyTelephoneNumber: CompanyTelephoneNumber = contactPerson ?
    new CompanyTelephoneNumber(option, mediationPhoneNumber, mediationContactPerson, mediationPhoneNumberConfirmation) :
    new CompanyTelephoneNumber(YesNo.NO, mediationPhoneNumber, mediationContactPerson, mediationPhoneNumberConfirmation);
  const form = new GenericForm(companyTelephoneNumber);
  try {
    const mediation = await getMediation(req.params.id);
    await form.validate();
    if (form.hasErrors()) {
      renderForm(form, res, contactPerson);
    } else {
      if (mediation?.mediationDisagreement) {
        await saveMediation(req.params.id, new GenericYesNo(), 'mediationDisagreement');
      }
      await saveCompanyTelephoneNumberData(req.params.id, form.model);
      const claim: Claim = await getCaseDataFromStore(req.params.id);
      const redirectUrl = constructResponseUrlWithIdParams(req.params.id, claim.isClaimantIntentionPending() ? CLAIMANT_RESPONSE_TASK_LIST_URL : RESPONSE_TASK_LIST_URL);
      res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
});

export default companyTelephoneNumberController;
