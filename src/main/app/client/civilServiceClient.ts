import {Claim} from '../../common/models/claim';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {AssertionError} from 'assert';
import {AppRequest} from '../../common/models/AppRequest';
import {CivilClaimResponse} from '../../common/models/civilClaimResponse';
import {
  CIVIL_SERVICE_CASES_URL,
  CIVIL_SERVICE_FEES_RANGES,
  CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL,
} from './civilServiceUrls';
import {FeeRange, FeeRanges} from '../../common/models/feeRange';
import {plainToInstance} from 'class-transformer';
import {CaseDocument} from 'common/models/document/caseDocument';
import {
  CLAIM_DETAILS_NOT_AVAILBALE,
  DOCUMENT_NOT_AVAILABLE,
} from './errorMessageContants';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('civilServiceClient');

export class CivilServiceClient {
  client: AxiosInstance;

  constructor(baseURL: string, isDocumentInstance? : boolean) {
    if (isDocumentInstance) {
      this.client = Axios.create({
        baseURL,
        responseType: 'arraybuffer',
        responseEncoding: 'binary',
      });
    } else {
      this.client = Axios.create({
        baseURL,
      });
    }
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
        throw new AssertionError({message: CLAIM_DETAILS_NOT_AVAILBALE});
      }
      return Object.assign(new Claim(), response.data);
    } catch (err: unknown) {
      logger.error(err);
    }
  }

  async getFeeRanges(req: AppRequest): Promise<FeeRanges> {
    const config = this.getConfig(req);
    try{
      const response: AxiosResponse<object> = await this.client.get(CIVIL_SERVICE_FEES_RANGES, config);
      return new FeeRanges(plainToInstance(FeeRange, response.data as object[]));
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async retrieveDocument(documentDetails : CaseDocument, req: AppRequest): Promise<Buffer> {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.post(CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL, documentDetails, config);
      if (!response.data) {
        throw new AssertionError({message: DOCUMENT_NOT_AVAILABLE});
      }
      return response.data as Buffer;
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async getSubmitDefendantResponseEventToken(claimId: string, req: AppRequest): Promise<string> {
    const config = this.getConfig(req);
    const userId = req.session?.user?.id;
    try{
      const response: AxiosResponse<object> = await this.client.get('/cases/defendant/' + userId + '/response/submit/' + claimId +'/token/', config);
      console.log('event token ' + response.data);
      return response.data as unknown as string;
    }catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

}
