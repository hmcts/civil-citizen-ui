import {NextFunction, RequestHandler, Router} from 'express';

import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {RESPONSE_TASK_LIST_URL, TELEPHONE_MEDIATION_URL} from 'routes/urls';
import {t} from 'i18next';

import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {saveMediationCarm} from 'services/features/response/mediation/mediationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';

const availabilityForMediationViewPath = 'features/mediation/telephone-mediation.njk';
const telephoneMediationController = Router();
const PAGES = 'PAGES.TELEPHONE_FOR_MEDIATION.';

const HAS_TELEPHONE_MEDITATION_ACCESSED_PROPERTY_NAME = 'hasTelephoneMeditationAccessed';

const telephoneMediationContent = (claimId: string, lang:string) => {
  return new PageSectionBuilder()
    .addMainTitle(t(`${PAGES}PAGE_TITLE`, {lng: lang}))
    .addParagraph(t(`${PAGES}IF_THE_CLAIMANT_DISAGREES`, {lng: lang}))
    .addParagraph(t(`${PAGES}A_TELEPHONE_MEDIATION_APPOINTMENT`, {lng: lang}))
    .addParagraph(t(`${PAGES}AN_IMPARTIAL_MEDIATOR`, {lng: lang}))
    .addParagraph(t(`${PAGES}MEDIATION_WILL_LAST`, {lng: lang}))
    .addTitle(t(`${PAGES}WHAT_HAPPENS`, {lng: lang}))
    .addParagraph(t(`${PAGES}WE_WILL_ARRANGE`, {lng: lang}))
    .addRawHtml(
      `<ul class="govuk-list govuk-list--bullet">
                <li>${t(PAGES+'BULLET_LIST_ITEM1', {lng: lang})}</li>
                <li>${t(PAGES+'BULLET_LIST_ITEM2', {lng: lang})}</li>
                <li>${t(PAGES+'BULLET_LIST_ITEM3', {lng: lang})}</li>
            </ul>`)
    .addTitle(t(`${PAGES}WHAT_HAPPENS_IF`, {lng: lang}))
    .addParagraph(t(`${PAGES}IF_YOU_DO_NOT_ATTEND`, {lng: lang}))
    .addTitle(t(`${PAGES}AFTER_THE_PHONE_CALL`, {lng: lang}))
    .addParagraph(t(`${PAGES}IF_MEDIATION_IS_SUCCESSFUL`, {lng: lang}))
    .addParagraph(t(`${PAGES}IF_EITHER_PARTY`, {lng: lang}))
    .addParagraph(t(`${PAGES}IF_YOU_DO_NOT_REACH`, {lng: lang}))
    .addButton(`${t('COMMON.BUTTONS.CONTINUE', {lng: lang})}`,'')
    .build();
};

telephoneMediationController.get(TELEPHONE_MEDIATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    res.render(availabilityForMediationViewPath, {telephoneMediationContent:telephoneMediationContent(claimId, lang)});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

telephoneMediationController.post(TELEPHONE_MEDIATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    await saveMediationCarm(redisKey, true, HAS_TELEPHONE_MEDITATION_ACCESSED_PROPERTY_NAME);
    res.redirect(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default telephoneMediationController;
