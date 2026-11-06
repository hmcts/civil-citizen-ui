import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {CitizenDob} from 'form/models/citizenDob';
import {AGE_ELIGIBILITY_URL, CITIZEN_PHONE_NUMBER_URL, DOB_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {Party} from 'models/party';
import {Claim} from 'models/claim';
import {AgeEligibilityVerification} from 'common/utils/ageEligibilityVerification';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {CitizenDate} from 'form/models/claim/claimant/citizenDate';
import {AppRequest} from 'common/models/AppRequest';
import {getResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {saveDefendantPropertyToResponseDraft} from 'services/features/common/defendantDetailsService';
import {getRouteParam} from 'common/utils/routeParamUtils';

const citizenDobController = Router();

function renderView(form: GenericForm<CitizenDob>, res: Response): void {
  res.render('features/response/citizenDob/citizen-dob', {form: form, today: new Date()});
}

function getDateOfBirth(dateOfBirth: unknown): Date | undefined {
  if (!dateOfBirth) {
    return undefined;
  }

  const storedDate = typeof dateOfBirth === 'object' && 'date' in dateOfBirth
    ? (dateOfBirth as CitizenDate).date
    : dateOfBirth;
  const parsedDate = new Date(storedDate as string | Date);

  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
}

const getClaimFromResponseDraft = async (req: AppRequest, caseId: string): Promise<Claim> => {
  const draftResult = await getResponseDraft(req, caseId);
  return Object.assign(new Claim(), draftResult?.claimResponse?.case_data as unknown as Claim);
};

function redirectToNextPage(req: Request, res: Response, dob: Date, respondent: Party) {
  if (!AgeEligibilityVerification.isOverEighteen(dob)) {
    return res.redirect(constructResponseUrlWithIdParams(req.params.id, AGE_ELIGIBILITY_URL));
  }
  if (respondent?.partyPhone?.phone && respondent?.partyPhone?.ccdPhoneExist) {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
  } else {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PHONE_NUMBER_URL));
  }
}

citizenDobController.get(DOB_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getClaimFromResponseDraft(<AppRequest>req, caseId);
    const citizenDob = new GenericForm(new CitizenDob());
    const dateOfBirth = getDateOfBirth(claim?.respondent1?.dateOfBirth);
    if (dateOfBirth) {
      citizenDob.model.day = dateOfBirth.getDate();
      citizenDob.model.month = (dateOfBirth.getMonth() + 1);
      citizenDob.model.year = dateOfBirth.getFullYear();
    }
    renderView(citizenDob, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

citizenDobController.post(DOB_URL, (async (req, res, next: NextFunction) => {
  const {year, month, day} = req.body;
  try {
    const caseId = getRouteParam(req, 'id');
    const appReq = <AppRequest>req;
    const citizenDob = new GenericForm(new CitizenDob(year, month, day));
    await citizenDob.validate();

    if (citizenDob.hasErrors()) {
      renderView(citizenDob, res);
      return;
    }

    const dateOfBirth = new CitizenDate(day, month, year);
    await saveDefendantPropertyToResponseDraft(appReq, caseId, 'dateOfBirth', dateOfBirth);

    const claim = await getClaimFromResponseDraft(appReq, caseId);
    const respondent = Object.assign(new Party(), claim.respondent1);
    redirectToNextPage(req, res, dateOfBirth.date, respondent);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default citizenDobController;
