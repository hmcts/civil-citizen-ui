import {Partner} from '../../../common/form/models/statementOfMeans/partner';
import {getDraftClaimFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import _ from 'lodash';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerService');

export class GenericPartnerService {

  public async getPartnerProperty(claimId: string, property: string) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      logger.info(civilClaimResponse);
      if (_.get(civilClaimResponse, civilClaimResponse.case_data.statementOfMeans[property])) {
        return civilClaimResponse.case_data.statementOfMeans[property];
      }
      return new Partner('');
    } catch (err) {
      logger.error(`${err.stack || err}`);
    }
  }

  public async savePartnerProperty(claimId: string, partner: Partner, property: string) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (_.get(civilClaimResponse, 'civilClaimResponse.case_data.statementOfMeans')) {
        civilClaimResponse.case_data.statementOfMeans[property] = partner;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.[property] = partner;
        civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, civilClaimResponse.case_data);
    } catch (err) {
      logger.error(`${err.stack || err}`);
    }
  }
}
