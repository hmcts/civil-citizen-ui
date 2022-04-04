import {getDraftClaimFromStore, saveDraftClaim} from '../../../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../../common/models/statementOfMeans';
import {Validator} from 'class-validator';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {CourtOrders} from '../../../../../common/form/models/statementOfMeans/courtOrders/courtOrders';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('courtOrdersService');
const validator = new Validator();

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
    return CourtOrders.fromObject(value);
  }

  public validateCourtOrders(courtOrders: CourtOrders): GenericForm<CourtOrders> {
    const form: GenericForm<CourtOrders> = new GenericForm(courtOrders);
    form.errors = validator.validateSync(form.model);
    return form;
  }
}

const courtOrdersService = new CourtOrdersService();
export default courtOrdersService;
