import {
  getCaseDataFromStore,
  saveDraftClaim,
} from '../../modules/draft-store/draftStoreService';
import {get} from 'lodash';
import {Respondent} from '../../common/models/respondent';
import {Claim} from '../../common/models/claim';
import {PrimaryAddress} from '../../common/models/primaryAddress';
import {CorrespondenceAddress} from '../../common/models/correspondenceAddress';
import {ResidenceType} from "common/form/models/statementOfMeans/residenceType";
import {Residence} from "common/form/models/statementOfMeans/residence";
import {CitizenAddress} from "common/form/models/citizenAddress";

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
      throw Error(error);
    }
  }

  async saveRespondent(claimId: string, primaryAddress: PrimaryAddress, correspondenceAddress : CorrespondenceAddress) {
    try {
      const caseData = await getCaseDataFromStore(claimId) || new Claim();
      if (get(caseData,'respondent1.primaryAddress')) {
        caseData.respondent1.primaryAddress = primaryAddress;
      } else if (get(caseData,'respondent1.correspondenceAddress')) {
        caseData.respondent1.correspondenceAddress = correspondenceAddress ;
      } else {
        const respondent = new Respondent();
        respondent.primaryAddress = primaryAddress;
        respondent.correspondenceAddress = correspondenceAddress;
        caseData.respondent1 = respondent;
      }
      await saveDraftClaim(claimId, caseData);
    } catch (error) {
      logger.error(error);
      throw Error(error);
    }
  }

  buildPrimaryAddress = (citizenAddress: CitizenAddress, citizenCorrespondenceAddress: CitizenCorrespondenceAddress): PrimaryAddress => {
/*    county: string;
    country: string;
    postCode: string;
    postTown: string;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    respondent.primaryAddress.AddressLine1 = citizenAddress.primaryAddressLine1;
    respondent.primaryAddress.AddressLine2 = citizenAddress.primaryAddressLine2;
    respondent.primaryAddress.AddressLine3 = citizenAddress.primaryAddressLine3;
    respondent.primaryAddress.PostTown = citizenAddress.primaryCity;
    respondent.primaryAddress.PostCode = citizenAddress.primaryPostCode;*/

    return {addressLine1: citizenAddress.primaryAddressLine1, addressLine2: citizenAddress.primaryAddressLine2, addressLine3: citizenAddress.primaryAddressLine3, country: "", county: "", postTown: citizenAddress.primaryCity, postCode: citizenAddress.primaryPostCode};
  };

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
