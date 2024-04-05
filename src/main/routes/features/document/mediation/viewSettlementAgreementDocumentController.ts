import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';

const viewMediationSettlementAgreementDocument = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);
const viewDocuments = 'features/common/viewDocuments';

const renderView = (res: Response): void => {
  res.render(viewDocuments, {

  });
};

viewMediationSettlementAgreementDocument.get(VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    //const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    console.log(claim);
    renderView(res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default viewMediationSettlementAgreementDocument;
