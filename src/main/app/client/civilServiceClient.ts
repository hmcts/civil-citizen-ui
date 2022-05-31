import {Claim} from '../../common/models/claim';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {AssertionError} from 'assert';
import {AppRequest} from '../../common/models/AppRequest';
import {CivilClaimResponse} from '../../common/models/civilClaimResponse';
import {CIVIL_SERVICE_CASES_URL} from './civilServiceUrls';
import {FeeRange} from '../../common/models/feeRange';
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
        throw new AssertionError({message: 'Claim details not available.'});
      }
      return response.data as Claim;
    } catch (err: unknown) {
      logger.error(err);
    }
  }

  async getRangeFeesMock(): Promise<FeeRange[]> {
    const feesRanges: FeeRange[] = [
      { claimAmountRange: '£0.01 to £300', fee: '£35' },
      { claimAmountRange: '£300.01 to £500', fee: '£50' },
      { claimAmountRange: '£500.01 to £1,000', fee: '£70' },
      { claimAmountRange: '£1,000.01 to £1,500', fee: '£80' },
      { claimAmountRange: '£1,500.01 to £3,000', fee: '£115' },
      { claimAmountRange: '£3,000.01 to £5,000', fee: '£205' },
      { claimAmountRange: '£5,000.01 to £10,000', fee: '£455' },
    ];
    return feesRanges;
  }

}
