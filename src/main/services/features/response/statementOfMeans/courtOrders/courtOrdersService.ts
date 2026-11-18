import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {CourtOrders} from 'common/form/models/statementOfMeans/courtOrders/courtOrders';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('courtOrdersService');

class CourtOrdersService {

  public async getCourtOrders(req: AppRequest): Promise<CourtOrders> {
    try {
      const caseId = getRouteParam(req, 'id');
      const claim = await getResponseClaimById(req, caseId);

      if (claim.statementOfMeans?.courtOrders) {
        return claim.statementOfMeans.courtOrders;
      }
      return new CourtOrders();
    } catch (error) {
      logger.error(`${(error as Error).stack || error}`);
      throw error;
    }
  }

  public async saveCourtOrders(req: AppRequest, courtOrders: CourtOrders) {
    try {
      const caseId = getRouteParam(req, 'id');
      const draftResult = await getResponseDraft(req, caseId);
      if (!draftResult) {
        throw new Error('[courtOrdersService] no response draft found');
      }
      const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
      const draftId = draftResult.rawResponse?.draftId;

      if (!claim.statementOfMeans) {
        claim.statementOfMeans = new StatementOfMeans();
      }
      claim.statementOfMeans.courtOrders = courtOrders;
      if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
        claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
      await updateResponseDraft(req, caseId, claim, draftId);
    } catch (error) {
      logger.error(`${(error as Error).stack || error}`);
      throw error;
    }
  }

  public buildCourtOrders(value: unknown): CourtOrders {
    return CourtOrders.fromObject(value as Record<string, object>);
  }

  public removeEmptyCourtOrders(courtOrders: CourtOrders): void {
    courtOrders.rows = courtOrders.rows.filter(item => !item.isEmpty());
  }
}

export const courtOrdersService = new CourtOrdersService();
