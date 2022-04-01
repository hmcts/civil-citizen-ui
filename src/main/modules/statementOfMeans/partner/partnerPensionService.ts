import {PartnerPension} from '../../../common/form/models/statementOfMeans/partner/partnerPension';
import {getCaseDataFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {Claim} from '../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerPensionService');

export class PartnerPensionService {

  public async getPartnerPension(claimId: string) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (case_data?.statementOfMeans?.partnerPension) {
        const partnerPension = new PartnerPension();
        partnerPension.option = case_data.statementOfMeans.partnerPension.option;
        return partnerPension;
      }
      return new PartnerPension();
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async savePartnerPension(claimId: string, partnerPension: PartnerPension) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (case_data?.statementOfMeans) {
        case_data.statementOfMeans.partnerPension = partnerPension;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.partnerPension = partnerPension;
        case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
