import {getCaseDataFromStore, saveDraftClaim} from '../../modules/draft-store/draftStoreService';

import {get} from 'lodash';
import {Respondent} from '../../common/models/respondent';
import {Disability} from "common/form/models/statementOfMeans/disability";
import {Claim} from "models/claim";
import {StatementOfMeans} from "models/statementOfMeans";


const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('residenceService');


export class CitizenDetailsService {

  async getRespondentInformation(claimId: string): Promise<Respondent> {
    try {
      const responseData = await getCaseDataFromStore(claimId);
      if (get(responseData, ['respondent1.primaryAddress', 'respondent1.correspondenceAddress'])) {
        return responseData.respondent1;
      }
      return new Respondent();
    } catch (error) {
      logger.error(error);
      throw new Error(error);
    }
  }

  async saveRespondent(claimId: string, respondent: Respondent) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (case_data && case_data.respondent1) {
        case_data.respondent1 = respondent;
      } else {
        const respondent = new Respondent();
        respondent. = respondent;
        case_data.respondent1 = statementOfMeans;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (err: unknown) {
      logger.error(`${(err as Error).stack || err}`);
    }
  }
}

/*  async getClaimDetails(claimId: string): Promise<Residence> {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans && civilClaimResponse.case_data.statementOfMeans.residence) {
        return civilClaimResponse.case_data.statementOfMeans.residence;
      }
      return new Residence();
    } catch (err: unknown) {
      logger.error(`${(err as Error).stack || err}`);
    }
  }

  public async saveResidence(claimId: string, residence: Residence) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans) {
        civilClaimResponse.case_data.statementOfMeans.residence = residence;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.residence = residence;
        civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, civilClaimResponse.case_data);
    } catch (err: unknown) {
      logger.error(`${(err as Error).stack || err}`);
    }
  }

  public buildResidence(type: ResidenceType, housingDetails: string): Residence {
    const residence = new Residence(type, housingDetails);
    if (residence.type !== ResidenceType.OTHER) {
      residence.housingDetails = '';
    }
    return residence;
  }

  public validateResidence(residence: Residence): GenericForm<Residence> {
    const form: GenericForm<Residence> = new GenericForm(residence);
    form.errors = validator.validateSync(form.model);
    return form;
  }
}

const residenceService = new ResidenceService();*/
