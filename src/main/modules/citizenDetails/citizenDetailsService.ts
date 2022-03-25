import {
  getCaseDataFromStore,
  saveDraftClaim,
} from '../../modules/draft-store/draftStoreService';
import {get} from 'lodash';
import {Respondent} from '../../common/models/respondent';
import {Claim} from '../../common/models/claim';
import {PrimaryAddress} from '../../common/models/primaryAddress';
import {CorrespondenceAddress} from '../../common/models/correspondenceAddress';
import {CitizenAddress} from '../../common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from '../../common/form/models/citizenCorrespondenceAddress';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('CitizenDetailsService');

export const CitizenDetailsService  = new class {

  public async getRespondentInformation(claimId: string): Promise<Respondent> {
    try {
      const responseData = await getCaseDataFromStore(claimId);
      if (get(responseData, 'respondent1')) {
        return responseData.respondent1;
      }
      return new Respondent();
    } catch (error) {
      logger.error(error);
      throw Error(error);
    }
  }

  public async saveRespondent(claimId: string, citizenAddress: CitizenAddress, citizenCorrespondenceAddress: CitizenCorrespondenceAddress) : Promise<void> {
    const responseData = await getCaseDataFromStore(claimId) || new Claim();
    if (get(responseData, 'respondent1.primaryAddress')) {
      responseData.respondent1.primaryAddress = this.buildPrimaryAddress(citizenAddress);
    }
    if (get(responseData, 'respondent1.correspondenceAddress')) {
      responseData.respondent1.correspondenceAddress = this.buildCorrespondenceAddress(citizenCorrespondenceAddress);
    }
    if (!(get(responseData, 'respondent1.primaryAddress') && get(responseData, 'respondent1.correspondenceAddress'))) {
      const respondent = new Respondent();
      respondent.primaryAddress = this.buildPrimaryAddress(citizenAddress);
      respondent.correspondenceAddress = this.buildCorrespondenceAddress(citizenCorrespondenceAddress);
      responseData.respondent1 = respondent;
    }
    await saveDraftClaim(claimId, responseData);
  }

  private buildPrimaryAddress = (citizenAddress: CitizenAddress): PrimaryAddress => {
    return {
      addressLine1: citizenAddress.primaryAddressLine1,
      addressLine2: citizenAddress.primaryAddressLine2,
      addressLine3: citizenAddress.primaryAddressLine3,
      postTown: citizenAddress.primaryCity,
      postCode: citizenAddress.primaryPostCode,
    };
  };

  private buildCorrespondenceAddress = (citizenCorrespondenceAddress: CitizenCorrespondenceAddress): CorrespondenceAddress => {
    return {
      addressLine1: citizenCorrespondenceAddress.correspondenceAddressLine1,
      addressLine2: citizenCorrespondenceAddress.correspondenceAddressLine2,
      addressLine3: citizenCorrespondenceAddress.correspondenceAddressLine3,
      postTown: citizenCorrespondenceAddress.correspondenceCity,
      postCode: citizenCorrespondenceAddress.correspondencePostCode,
    };
  };

};
