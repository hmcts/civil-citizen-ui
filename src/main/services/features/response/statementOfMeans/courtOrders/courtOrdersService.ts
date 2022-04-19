import {
  getCaseDataFromStore,
  saveDraftClaim,
} from '../../../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../../common/models/statementOfMeans';
import {CourtOrders} from '../../../../../common/form/models/statementOfMeans/courtOrders/courtOrders';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('courtOrdersService');

class CourtOrdersService {

  public async getCourtOrders(claimId: string): Promise<CourtOrders> {
    try {
      const claim = await getCaseDataFromStore(claimId);
      if (claim?.statementOfMeans?.courtOrders) {
        return claim.statementOfMeans.courtOrders;
      }
      return new CourtOrders();
    } catch (error) {
      logger.error(`${(error as Error).stack || error}`);
      throw error;
    }
  }

  public async saveCourtOrders(claimId: string, courtOrders: CourtOrders) {
    try {
      const claim = await getCaseDataFromStore(claimId);

      if (!claim.statementOfMeans) {
        claim.statementOfMeans = new StatementOfMeans();
      }
      claim.statementOfMeans.courtOrders = courtOrders;
      await saveDraftClaim(claimId, claim);
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

const courtOrdersService = new CourtOrdersService();
export default courtOrdersService;
