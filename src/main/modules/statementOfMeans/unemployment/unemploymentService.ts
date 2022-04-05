import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../common/models/claim';
import {Unemployment} from '../../../common/form/models/statementOfMeans/unemployment/unemployment';
import {UnemploymentDetails} from '../../../common/form/models/statementOfMeans/unemployment/unemploymentDetails';
import {OtherDetails} from '../../../common/form/models/statementOfMeans/unemployment/otherDetails';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('employmentService');
const unemployment = new Unemployment();

export const getUnemployment = async (claimId: string): Promise<Unemployment> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim?.statementOfMeans?.unemployment) {
      unemployment.option = claim.statementOfMeans.unemployment.option;
      if (claim?.statementOfMeans?.unemployment?.unemploymentDetails) {
        unemployment.unemploymentDetails = new UnemploymentDetails(claim.statementOfMeans.unemployment.unemploymentDetails.years, claim.statementOfMeans.unemployment.unemploymentDetails.months);
      }
      if (claim?.statementOfMeans?.unemployment?.otherDetails) {
        unemployment.otherDetails = new OtherDetails(claim.statementOfMeans.unemployment.otherDetails.details);
      }
      return unemployment;
    }
    return new Unemployment();
  } catch (error) {
    logger.error(`${error.stack || error}`);
    throw error;
  }
}
;

export const saveUnemployment = async (claimId: string, unemployment: Unemployment) => {
  try {
    const case_data = await getCaseDataFromStore(claimId) || new Claim();
    if (!case_data?.statementOfMeans?.unemployment) {
      const statementOfMeans = new StatementOfMeans();
      case_data.statementOfMeans = statementOfMeans;
      case_data.statementOfMeans.unemployment = new Unemployment();
    }
    /*if (unemployment.option == UnemploymentCategory.UNEMPLOYED) {
      case_data.statementOfMeans.unemployment.unemploymentDetails.years = unemployment.unemploymentDetails.years;
      case_data.statementOfMeans.unemployment.unemploymentDetails.months = unemployment.unemploymentDetails.months;
    } else if (unemployment.option == UnemploymentCategory.OTHER) {
      case_data.statementOfMeans.unemployment.otherDetails.details = unemployment.otherDetails.details;
    }*/
    case_data.statementOfMeans.unemployment = unemployment;
    await saveDraftClaim(claimId, case_data);
  } catch (error) {
    logger.error(`${error.stack || error}`);
    throw error;
  }
};
