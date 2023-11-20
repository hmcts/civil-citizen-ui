import {NextFunction, RequestHandler, Router} from 'express';

import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {AVAILABILITY_FOR_MEDIATION, TRIAL_ARRANGEMENTS_HEARING_DURATION} from 'routes/urls';
import {t} from 'i18next';

import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const availabilityForMediationViewPath = 'features/carm/availability-for-mediation.njk';
const availabilityForMediationController = Router();
const PAGES = 'PAGES.AVAILABILITY_FOR_MEDIATION.';

const availabilityForMediationContent = (claimId: string, lang:string) => {
  return new PageSectionBuilder()
    .addMainTitle(`${PAGES}PAGE_TITLE`)
    .addParagraph(`${PAGES}IF_THE_CLAIMANT_DISAGREES`)
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

    .build();
};

availabilityForMediationController.get(AVAILABILITY_FOR_MEDIATION, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    res.render(availabilityForMediationViewPath, {availabilityForMediationContent:availabilityForMediationContent(claimId, lang)});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

availabilityForMediationController.post(AVAILABILITY_FOR_MEDIATION, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    await saveCaseProgression(claimId, form.model, dqPropertyName, parentPropertyName);
    res.redirect(constructResponseUrlWithIdParams(claimId, TRIAL_ARRANGEMENTS_HEARING_DURATION));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default availabilityForMediationController;
