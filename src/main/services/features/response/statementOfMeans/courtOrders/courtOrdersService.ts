import {getDraftClaimFromStore, saveDraftClaim} from '../../../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../../common/models/statementOfMeans';
import {CourtOrders} from '../../../../../common/form/models/statementOfMeans/courtOrders/courtOrders';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('courtOrdersService');

class CourtOrdersService {

  public async getCourtOrders(claimId: string): Promise<CourtOrders> {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse?.case_data?.statementOfMeans?.courtOrders) {
        return civilClaimResponse.case_data.statementOfMeans.courtOrders;
      }
      return new CourtOrders();
    } catch (error) {
      logger.error(`${(error as Error).stack || error}`);
      throw error;
    }
  }

  public async saveCourtOrders(claimId: string, courtOrders: CourtOrders) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse?.case_data?.statementOfMeans) {
        civilClaimResponse.case_data.statementOfMeans.courtOrders = courtOrders;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.courtOrders = courtOrders;
        civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, civilClaimResponse.case_data);
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
