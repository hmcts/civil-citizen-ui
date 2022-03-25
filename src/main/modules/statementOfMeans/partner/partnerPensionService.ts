import { PartnerPension } from '../../../common/form/models/statementOfMeans/partner/partnerPension';
import { getCaseDataFromStore, saveDraftClaim } from '../../draft-store/draftStoreService';
import { StatementOfMeans } from '../../../common/models/statementOfMeans';
import { Claim } from '../../../common/models/claim';

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
    } catch (error) {
      throw new Error(error.message);
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
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
