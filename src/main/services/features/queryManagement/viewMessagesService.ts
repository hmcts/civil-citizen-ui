import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {iWantToLinks} from 'models/dashboard/iWantToLinks';
import {QM_VIEW_QUERY_URL} from 'routes/urls';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRouteParam} from 'common/utils/routeParamUtils';

export const getViewMessagesLink = async (req: AppRequest, claim: Claim, lng: string): Promise<iWantToLinks> => {
  const messages = claim.queries;
  if (messages && messages.caseMessages.length > 0) {
    return {
      text: t('PAGES.DASHBOARD.SUPPORT_LINKS.VIEW_ALL_MESSAGES', {lng}),
      url: constructResponseUrlWithIdParams(getRouteParam(req, 'id'), QM_VIEW_QUERY_URL),
    };
  }
};
