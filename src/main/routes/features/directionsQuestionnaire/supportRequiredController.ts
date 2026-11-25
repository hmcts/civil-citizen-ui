import {Router, Response} from 'express';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {
  DQ_COURT_LOCATION_URL,
  SUPPORT_REQUIRED_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {saveDirectionQuestionnaire} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {
  generatePeopleListWithSelectedValues,
  getSupportRequired,
  getSupportRequiredForm,
} from '../../../services/features/directionsQuestionnaire/supportRequiredService';
import {SupportRequiredList} from 'common/models/directionsQuestionnaire/supportRequired';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {isCarmEnabledForCase} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';

const supportRequiredController = Router();
const supportRequiredViewPath = 'features/directionsQuestionnaire/support-required-list';
const dqPropertyName = 'supportRequiredList';
const dqParentName = 'hearing';

async function renderView(form: GenericForm<SupportRequiredList>, req: AppRequest, lang: string, res: Response, carmEnabled: boolean) {
  const selectedNames = form.model?.items?.map(item => item.fullName);
  const claimId = getRouteParam(req, 'id');
  const peopleLists = await generatePeopleListWithSelectedValues(<AppRequest>req, selectedNames, lang);
  let claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
  if (!claim.isClaimantIntentionPending()) {
    claim = await getResponseClaimById(<AppRequest>req, claimId);
  }
  res.render(supportRequiredViewPath, { form, peopleLists, isDefendant: claim.isDefendantNotResponded(),
    pageTitle: 'PAGES.SUPPORT_REQUIRED.PAGE_TITLE', carmEnabled: carmEnabled});
}

supportRequiredController.get(SUPPORT_REQUIRED_URL, async (req, res, next) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const redisKey = generateRedisKey(req as unknown as AppRequest);
    const caseId = getRouteParam(<AppRequest>req, 'id');

    let claim = await getCaseDataFromStore(redisKey);
    if (!claim.isClaimantIntentionPending()) {
      claim = await getResponseClaimById(<AppRequest>req, caseId);
    }
    const carmApplicable = await isCarmEnabledForCase(claim.submittedDate) && claim.isSmallClaimsTrackDQ;
    const supportRequiredList = await getSupportRequired(<AppRequest>req);
    const form = new GenericForm(supportRequiredList);
    renderView(form, <AppRequest>req, lang, res, carmApplicable);
  } catch (error) {
    next(error);
  }
});

supportRequiredController.post(SUPPORT_REQUIRED_URL, async (req, res, next) => {
  try {
    const caseId = getRouteParam(<AppRequest>req, 'id');
    const redisKey = generateRedisKey(req as unknown as AppRequest);

    let claim = await getCaseDataFromStore(redisKey);
    if (!claim.isClaimantIntentionPending()) {
      claim = await getResponseClaimById(<AppRequest>req, caseId);
    }
    const carmApplicable = await isCarmEnabledForCase(claim.submittedDate) && claim.isSmallClaimsTrackDQ;
    const supportRequiredList = getSupportRequiredForm(req);
    const form = new GenericForm(supportRequiredList);
    form.validateSync();
    if (form.hasErrors()) {
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      renderView(form, <AppRequest>req, lang, res, carmApplicable);
    } else {
      await saveDirectionQuestionnaire(<AppRequest>req, form.model, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(caseId, DQ_COURT_LOCATION_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default supportRequiredController;
