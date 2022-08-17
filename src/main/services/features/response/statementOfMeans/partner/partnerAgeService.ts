import {PartnerAge} from '../../../../../common/form/models/statementOfMeans/partner/partnerAge';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../../common/models/statementOfMeans';
import {Claim} from '../../../../../common/models/claim';
import {GenericForm} from '../../../../../common/form/models/genericForm';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerAgeService');

export class PartnerAgeService {

  public async getPartnerAge(claimId: string) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      return (case_data?.statementOfMeans?.partnerAge)
        ? new GenericForm(new PartnerAge(case_data.statementOfMeans.partnerAge.option))
        : new GenericForm(new PartnerAge());
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async savePartnerAge(claimId: string, partner: GenericForm<PartnerAge>) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (case_data?.statementOfMeans) {
        case_data.statementOfMeans.partnerAge = partner.model;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.partnerAge = partner.model;
        case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
