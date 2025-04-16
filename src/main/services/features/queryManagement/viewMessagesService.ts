import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {iWantToLinks} from 'models/dashboard/iWantToLinks';
import {QM_VIEW_MESSAGES} from 'routes/urls';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {isQueryManagementEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';

export const getViewMessagesLink = async (req: AppRequest, claim: Claim, lng: string): Promise<iWantToLinks> => {
  const isQueryManagementLipEnabled = await isQueryManagementEnabled(claim.submittedDate);
  if (isQueryManagementLipEnabled) {
    const messages = claim.isClaimant() ? claim.qmApplicantCitizenQueries : claim.qmRespondentCitizenQueries;
    if (messages && messages.caseMessages.length > 0) {
      return {
        text: t('PAGES.DASHBOARD.SUPPORT_LINKS.VIEW_ALL_MESSAGES', {lng}),
        url: constructResponseUrlWithIdParams(req.params.id, QM_VIEW_MESSAGES),
      };
    }
  }
};
