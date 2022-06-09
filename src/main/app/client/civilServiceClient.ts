import {Claim} from '../../common/models/claim';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {AssertionError} from 'assert';
import {AppRequest} from '../../common/models/AppRequest';
import {CivilClaimResponse} from '../../common/models/civilClaimResponse';
import {CIVIL_SERVICE_CASES_URL,
  CIVIL_SERVICE_FEES_RANGES} from './civilServiceUrls';
import {FeeRange} from '../../common/models/feeRange';
import {plainToInstance} from 'class-transformer';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('ciivilServiceClient');

export class CivilServiceClient {
  client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = Axios.create({
      baseURL,
    });
  }

  getConfig(req: AppRequest) {
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.session?.user?.accessToken}`,
      },
    };
  }

  async retrieveByDefendantId(req: AppRequest): Promise<CivilClaimResponse[]> {
    const config = this.getConfig(req);
    let claims: CivilClaimResponse[] = [];
    await this.client.post(CIVIL_SERVICE_CASES_URL, {match_all: {}}, config)
      .then(response => {
        claims = response.data.cases.map((claim: CivilClaimResponse) => {
          const caseData = Object.assign(new Claim(), claim.case_data);
          return new CivilClaimResponse(claim.id, caseData);
        });
      }).catch(error => {
        console.log(error.message);
      });
    return claims;
  }

  async retrieveClaimDetails(claimId: string, req: AppRequest): Promise<Claim> {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.get(`/cases/${claimId}`, config);// nosonar

      if (!response.data) {
        throw new AssertionError({message: 'Claim details not available!'});
      }
      return Object.assign(new Claim(), response.data);
    } catch (err: unknown) {
      logger.error(err);
    }
  }

  async getFeeRanges(req: AppRequest): Promise<FeeRange[]> {
    const config = this.getConfig(req);
    try{
      const response: AxiosResponse<object> = await this.client.get(CIVIL_SERVICE_FEES_RANGES, config);
      return plainToInstance(FeeRange, response.data as object[]);
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }
}
