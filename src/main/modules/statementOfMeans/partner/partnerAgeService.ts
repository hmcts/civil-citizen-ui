import {PartnerAge} from '../../../common/form/models/statementOfMeans/partner/partnerAge';
import {getCaseDataFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {Claim} from '../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dependantsService');
const partnerAge = new PartnerAge();

export class PartnerAgeService {

  public async getPartnerAge(claimId: string) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (case_data && case_data.statementOfMeans && case_data.statementOfMeans.partnerAge) {
        partnerAge.option = case_data.statementOfMeans.partnerAge.option;
        return partnerAge;
      }
      return new PartnerAge();
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async savePartnerAge(claimId: string, partner: PartnerAge) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (case_data && case_data.statementOfMeans) {
        case_data.statementOfMeans.partnerAge = partner;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.partnerAge = partner;
        case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
