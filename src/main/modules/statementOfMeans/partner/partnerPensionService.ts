import {PartnerPension} from '../../../common/form/models/statementOfMeans/partner/partnerPension';
import {getCaseDataFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {Claim} from '../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerPensionService');
const partnerPension = new PartnerPension();

export class PartnerPensionService {

  public async getPartnerPension(claimId: string) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (case_data && case_data.statementOfMeans && case_data.statementOfMeans.partnerPension) {
        partnerPension.option = case_data.statementOfMeans.partnerPension.option;
        return partnerPension;
      }
      return new PartnerPension();
    } catch (err: unknown) {
      logger.error(`${err as Error || err}`);
    }
  }

  public async savePartnerPension(claimId: string, partnerPension: PartnerPension) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (case_data && case_data.statementOfMeans) {
        case_data.statementOfMeans.partnerPension = partnerPension;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.partnerPension = partnerPension;
        case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (err: unknown) {
      logger.error(`${err as Error || err}`);
    }
  }
}
