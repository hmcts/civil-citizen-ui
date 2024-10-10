import {NextFunction, RequestHandler, Router} from 'express';

import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {CLAIMANT_RESPONSE_TASK_LIST_URL, RESPONSE_TASK_LIST_URL, TELEPHONE_MEDIATION_URL} from 'routes/urls';
import {t} from 'i18next';

import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {saveMediationCarm} from 'services/features/response/mediation/mediationService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';

const availabilityForMediationViewPath = 'features/mediation/telephone-mediation.njk';
const telephoneMediationController = Router();
const PAGES = 'PAGES.TELEPHONE_FOR_MEDIATION.';

const HAS_TELEPHONE_MEDITATION_ACCESSED_PROPERTY_NAME = 'hasTelephoneMeditationAccessed';

const telephoneMediationContent = (lang:string, isClaimant: boolean) => {
  return new PageSectionBuilder()
    .addMainTitle(`${PAGES}PAGE_TITLE`)
    .addParagraph(isClaimant?`${PAGES}YOU_WISH_TO_PROCEED_WITH_THE_CLAIM` : `${PAGES}IF_THE_CLAIMANT_DISAGREES`)
    .addParagraph(`${PAGES}A_TELEPHONE_MEDIATION_APPOINTMENT`)
    .addParagraph(`${PAGES}AN_IMPARTIAL_MEDIATOR`)
    .addParagraph(`${PAGES}MEDIATION_WILL_LAST`)
    .addTitle(`${PAGES}WHAT_HAPPENS`)
    .addParagraph(`${PAGES}WE_WILL_ARRANGE`)
    .addRawHtml(
      `<ul class="govuk-list govuk-list--bullet">
                <li>${t(PAGES+'BULLET_LIST_ITEM1', {lng: lang})}</li>
                <li>${t(PAGES+'BULLET_LIST_ITEM2', {lng: lang})}</li>
                <li>${t(PAGES+'BULLET_LIST_ITEM3', {lng: lang})}</li>
            </ul>`)
    .addTitle(`${PAGES}WHAT_HAPPENS_IF`)
    .addParagraph(`${PAGES}IF_YOU_DO_NOT_ATTEND`)
    .addTitle(`${PAGES}AFTER_THE_PHONE_CALL`)
    .addParagraph(`${PAGES}IF_MEDIATION_IS_SUCCESSFUL`)
    .addParagraph(`${PAGES}IF_EITHER_PARTY`)
    .addParagraph(`${PAGES}IF_YOU_DO_NOT_REACH`)
    .addButton('COMMON.BUTTONS.CONTINUE','')
    .build();
};

telephoneMediationController.get(TELEPHONE_MEDIATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    res.render(availabilityForMediationViewPath, {telephoneMediationContent:telephoneMediationContent(lang, claim.isClaimant()), isCarm: true});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

telephoneMediationController.post(TELEPHONE_MEDIATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const isClaimantResponse = claim.isClaimantIntentionPending();
    const url = isClaimantResponse ? CLAIMANT_RESPONSE_TASK_LIST_URL : RESPONSE_TASK_LIST_URL;
    await saveMediationCarm(redisKey, true, HAS_TELEPHONE_MEDITATION_ACCESSED_PROPERTY_NAME);
    res.redirect(constructResponseUrlWithIdParams(claimId, url));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default telephoneMediationController;
