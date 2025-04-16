import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import {
  DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL,
  QM_VIEW_QUERY_URL
} from 'routes/urls';
import { Claim } from 'models/claim';
import { AppRequest } from 'models/AppRequest';
import config from 'config';
import { CivilServiceClient } from 'client/civilServiceClient';
import {
  getApplicantCitizenQueries,
  getRespondentCitizenQueries
} from 'services/features/queryManagement/queryManagementService';
import { CaseRole } from 'form/models/caseRoles';
import { dateTimeFormat } from 'common/utils/dateUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const qmViewQueriesController = Router();
const viewQueriesPath = 'features/queryManagement/qm-view-queries-template';

const renderView = async (res: Response, claimId: string, claim: Claim, lang: string): Promise<void> => {
  const queries = claim.caseRole === CaseRole.CLAIMANT
    ? await getApplicantCitizenQueries(claim)
    : await getRespondentCitizenQueries(claim);

  if (queries?.caseMessages) {
    queries.caseMessages.forEach(query => {
      query.value.createdOn = dateTimeFormat(new Date(query.value.createdOn).toISOString(), lang);
    });
  }

  res.render(viewQueriesPath, {
    queries,
    pageTitle: 'PAGES.QM.VIEW_QUERY.PAGE_TITLE',
    dashboardUrl: constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL),
  });
};

qmViewQueriesController.get(QM_VIEW_QUERY_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    renderView(res, claimId, claim, lang);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default qmViewQueriesController;
