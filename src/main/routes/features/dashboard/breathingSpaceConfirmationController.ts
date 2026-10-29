import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  BREATHING_SPACE_CONFIRMATION_URL,
  DASHBOARD_CLAIMANT_URL,
} from '../../urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {AppRequest} from 'models/AppRequest';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {
  getBreathingSpaceConfirmationNextContent,
  getBreathingSpaceConfirmationPanelTitle,
} from 'services/features/dashboard/breathingSpaceEntryService';
import {getHelpSupportLinks, getHelpSupportTitle} from 'services/dashboard/dashboardService';

const confirmationViewPath = 'features/dashboard/breathing-space-confirmation';
const breathingSpaceConfirmationController = Router();

breathingSpaceConfirmationController.get(BREATHING_SPACE_CONFIRMATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);
    const lang = req.query.lang ? String(req.query.lang) : req.cookies.lang;
    const appliedType = req.session.breathingSpaceAppliedType;
    const appliedStart = req.session.breathingSpaceAppliedStart;
    delete req.session.breathingSpaceAppliedType;
    delete req.session.breathingSpaceAppliedStart;

    const claimNumber = claim.legacyCaseReference
      ? caseNumberPrettify(claim.legacyCaseReference)
      : caseNumberPrettify(claimId);

    const nextContent = getBreathingSpaceConfirmationNextContent(appliedType, appliedStart, lang);
    const content = new PageSectionBuilder()
      .addParagraph('PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.CONFIRMATION_EMAIL')
      .addTitle('COMMON.WHAT_HAPPENS_NEXT')
      .addParagraph(nextContent.key, nextContent.variables)
      .addButton(
        'PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.RETURN_TO_CASE_SUMMARY',
        constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
      )
      .build();

    res.render(confirmationViewPath, {
      claimNumber,
      noCrumbs: true,
      helpSupportTitle: getHelpSupportTitle(lang),
      helpSupportLinks: getHelpSupportLinks(lang),
      panel: {
        titleText: getBreathingSpaceConfirmationPanelTitle(appliedType),
      },
      content,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default breathingSpaceConfirmationController;
