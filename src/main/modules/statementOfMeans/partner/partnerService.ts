import {Partner} from '../../../common/form/models/statementOfMeans/partner';
import {getDraftClaimFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import { get } from 'lodash';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerService');

export class PartnerService {

  public async getPartnerAge(claimId: string) {
    try {

      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      logger.info(civilClaimResponse);
      if (get(civilClaimResponse, 'case_data.statementOfMeans.partnerAge')) {
        return civilClaimResponse.case_data.statementOfMeans.partnerAge;
      }
      return new Partner('');
    } catch (err) {
      logger.error(`${err.stack || err}`);
      throw new Error(err);
    }
  }

  public async savePartnerAge(claimId: string, partner: Partner) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (get(civilClaimResponse, 'case_data.statementOfMeans.partnerAge')) {
        civilClaimResponse.case_data.statementOfMeans.partnerAge = partner;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.partnerAge = partner;
        civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, civilClaimResponse.case_data);
    } catch (err) {
      logger.error(`${err.stack || err}`);
    }
  }
}
