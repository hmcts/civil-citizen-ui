import {NextFunction, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {CompanyTelephoneNumber} from 'form/models/mediation/companyTelephoneNumber';
import {CAN_WE_USE_COMPANY_URL, CLAIMANT_RESPONSE_TASK_LIST_URL, RESPONSE_TASK_LIST_URL} from '../../urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  getCompanyTelephoneNumberData,
  saveCompanyTelephoneNumberData,
} from 'services/features/response/mediation/companyTelephoneNumberService';
import {YesNo} from 'form/models/yesNo';
import {getMediation, saveMediation} from 'services/features/response/mediation/mediationService';
import {GenericYesNo} from 'form/models/genericYesNo';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const companyTelephoneNumberController = Router();

function renderForm(form: GenericForm<CompanyTelephoneNumber>, res: Response, contactPerson?: string) {
  res.render('features/mediation/company-telephone-number', {form, contactPerson});
}

companyTelephoneNumberController.get(CAN_WE_USE_COMPANY_URL, (async (req, res, next: NextFunction) => {
  try {
    const [contactPerson, telephoneNumberData] = await getCompanyTelephoneNumberData(generateRedisKey(<AppRequest>req));
    const form = new GenericForm(telephoneNumberData);
    renderForm(form, res, contactPerson);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

companyTelephoneNumberController.post(CAN_WE_USE_COMPANY_URL, (async (req, res, next: NextFunction) => {
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
    const redisKey = generateRedisKey(<AppRequest>req);
    const mediation = await getMediation(redisKey);
    await form.validate();
    if (form.hasErrors()) {
      renderForm(form, res, contactPerson);
    } else {
      if (mediation?.mediationDisagreement) {
        await saveMediation(redisKey, new GenericYesNo(), 'mediationDisagreement');
      }
      await saveCompanyTelephoneNumberData(redisKey, form.model);
      const claim: Claim = await getCaseDataFromStore(redisKey);
      const redirectUrl = constructResponseUrlWithIdParams(req.params.id, claim.isClaimantIntentionPending() ? CLAIMANT_RESPONSE_TASK_LIST_URL : RESPONSE_TASK_LIST_URL);
      res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default companyTelephoneNumberController;
