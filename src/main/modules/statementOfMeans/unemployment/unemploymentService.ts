import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../common/models/claim';
import {Unemployment} from '../../../common/form/models/statementOfMeans/unemployment/unemployment';
import {UnemploymentDetails} from '../../../common/form/models/statementOfMeans/unemployment/unemploymentDetails';
import {OtherDetails} from '../../../common/form/models/statementOfMeans/unemployment/otherDetails';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('employmentService');
const unemployment = new Unemployment();

export class UnemploymentService {

  public async getUnemployment(claimId: string) {
    try {
      const claim = await getCaseDataFromStore(claimId);
      if (claim?.statementOfMeans?.unemployment) {
        unemployment.option = claim.statementOfMeans.unemployment.option;
        unemployment.unemploymentDetails = new UnemploymentDetails(claim.statementOfMeans.unemployment.unemploymentDetails.years.toString(), claim.statementOfMeans.unemployment.unemploymentDetails.months.toString());
        unemployment.otherDetails = new OtherDetails(claim.statementOfMeans.unemployment.otherDetails.details);
        return unemployment;
      }
      return new Unemployment();
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveUnemployment(claimId: string, unemployment: Unemployment) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (!case_data?.statementOfMeans) {
        case_data.statementOfMeans = new StatementOfMeans();
        case_data.statementOfMeans.unemployment = new Unemployment();
      }
      case_data.statementOfMeans.unemployment = unemployment;
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
