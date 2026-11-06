import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CitizenTelephoneNumber,
} from 'form/models/citizenTelephoneNumber';
import {CITIZEN_PHONE_NUMBER_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {ClaimantOrDefendant} from 'models/partyType';
import {saveTelephoneToResponseDraft} from 'services/features/claim/yourDetails/phoneService';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'models/claim';
import {getResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {isCarmEnabledForCase} from '../../../../app/auth/launchdarkly/launchDarklyClient';
import {getRouteParam} from 'common/utils/routeParamUtils';

const citizenPhoneViewPath = 'features/response/citizenPhoneNumber/citizen-phone';
const citizenPhoneController = Router();

function renderView(form: GenericForm<CitizenTelephoneNumber>, res: Response, carmEnabled: boolean): void {
  res.render(citizenPhoneViewPath, {form, carmEnabled: carmEnabled});
}

const getClaimFromResponseDraft = async (req: AppRequest, caseId: string): Promise<Claim> => {
  const draftResult = await getResponseDraft(req, caseId);
  return Object.assign(new Claim(), draftResult?.claimResponse?.case_data as unknown as Claim);
};

citizenPhoneController.get(CITIZEN_PHONE_NUMBER_URL, (async (req, res, next: NextFunction) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getClaimFromResponseDraft(<AppRequest>req, caseId);
    const carmEnabled = await isCarmEnabledForCase(claim.submittedDate);
    const citizenTelephoneNumber = new CitizenTelephoneNumber(claim.respondent1?.partyPhone?.phone);
    renderView(new GenericForm<CitizenTelephoneNumber>(citizenTelephoneNumber), res, carmEnabled);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
citizenPhoneController.post(CITIZEN_PHONE_NUMBER_URL,
  (async (req, res, next: NextFunction) => {
    try {
      const caseId = getRouteParam(req, 'id');
      const appReq = <AppRequest>req;
      const claim = await getClaimFromResponseDraft(appReq, caseId);
      const carmEnabled = await isCarmEnabledForCase(claim.submittedDate);
      const model: CitizenTelephoneNumber = new CitizenTelephoneNumber(req.body.telephoneNumber === '' ? undefined : req.body.telephoneNumber, undefined, carmEnabled);
      const citizenTelephoneNumberForm = new GenericForm(model);
      citizenTelephoneNumberForm.validateSync();
      if (citizenTelephoneNumberForm.hasErrors()) {
        renderView(citizenTelephoneNumberForm, res, carmEnabled);
      } else {
        await saveTelephoneToResponseDraft(appReq, caseId, model, ClaimantOrDefendant.DEFENDANT);
        const redirectURL = constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL);
        res.redirect(redirectURL);
      }
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

export default citizenPhoneController;
