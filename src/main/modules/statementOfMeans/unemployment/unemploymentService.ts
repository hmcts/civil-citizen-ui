import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {Unemployment} from '../../../common/form/models/statementOfMeans/unemployment/unemployment';
import {UnemploymentDetails} from '../../../common/form/models/statementOfMeans/unemployment/unemploymentDetails';
import {OtherDetails} from '../../../common/form/models/statementOfMeans/unemployment/otherDetails';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {UnemploymentCategory} from '../../../common/form/models/statementOfMeans/unemployment/unemploymentCategory';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('employmentService');
const unemployment = new Unemployment();

export class UnemploymentService {

  public async getUnemployment(claimId: string) {
    try {
      const claim = await getCaseDataFromStore(claimId);
      if (claim.statementOfMeans?.unemployment) {
        unemployment.option = claim.statementOfMeans.unemployment.option;
        if (unemployment.option === UnemploymentCategory.UNEMPLOYED) {
          unemployment.unemploymentDetails
            = new UnemploymentDetails(claim.statementOfMeans.unemployment.unemploymentDetails.years.toString(),
              claim.statementOfMeans.unemployment.unemploymentDetails.months.toString());
        }
        if (unemployment.option === UnemploymentCategory.OTHER) {
          unemployment.otherDetails = new OtherDetails(claim.statementOfMeans.unemployment.otherDetails.details);
        }
        return unemployment;
      }
      return new Unemployment();
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveUnemployment(claimId: string, unemploymentToSave: Unemployment) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (!case_data.statementOfMeans) {
        case_data.statementOfMeans = new StatementOfMeans();
      }
      case_data.statementOfMeans.unemployment = unemploymentToSave;
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
