import {Claim} from 'common/models/claim';
import Axios, {AxiosError, AxiosHeaderValue, AxiosInstance, AxiosResponse} from 'axios';
import {AssertionError} from 'assert';
import {AppRequest, AppSession} from 'common/models/AppRequest';
import {CivilClaimResponse, ClaimFeeData} from 'common/models/civilClaimResponse';
import {
  ASSIGN_CLAIM_TO_DEFENDANT,
  CIVIL_SERVICE_AGREED_RESPONSE_DEADLINE_DATE,
  CIVIL_SERVICE_CALCULATE_DEADLINE,
  CIVIL_SERVICE_CASES_URL,
  CIVIL_SERVICE_CHECK_DEFENDENT_LINKED_URL,
  CIVIL_SERVICE_CLAIM_AMOUNT_URL,
  CIVIL_SERVICE_AIRLINES_URL,
  CIVIL_SERVICE_COURT_DECISION,
  CIVIL_SERVICE_COURT_LOCATIONS,
  CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL,
  CIVIL_SERVICE_FEES_PAYMENT_STATUS_URL,
  CIVIL_SERVICE_FEES_PAYMENT_URL,
  CIVIL_SERVICE_FEES_RANGES,
  CIVIL_SERVICE_HEARING_URL,
  CIVIL_SERVICE_SUBMIT_EVENT,
  CIVIL_SERVICE_UPLOAD_DOCUMENT_URL,
  CIVIL_SERVICE_USER_CASE_ROLE,
  CIVIL_SERVICE_VALIDATE_OCMC_PIN_URL,
  CIVIL_SERVICE_VALIDATE_PIN_URL,
  CIVIL_SERVICE_DASHBOARD_TASKLIST_URL,
  CIVIL_SERVICE_NOTIFICATION_LIST_URL,
  CIVIL_SERVICE_CREATE_SCENARIO_DASHBOARD_URL,
  CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL,
  CIVIL_SERVICE_UPDATE_TASK_STATUS_URL,
  CIVIL_SERVICE_GENERAL_APPLICATION_FEE_URL,
  CIVIL_SERVICE_GA_NOTIFICATION_LIST_URL,
  CIVIL_SERVICE_CLAIM_CALCULATE_INTEREST, CIVIL_SERVICE_CALCULATE_TOTAL_CLAIM_AMOUNT_URL,
} from './civilServiceUrls';
import {FeeRange, FeeRanges} from 'common/models/feeRange';
import {plainToInstance} from 'class-transformer';
import {CaseDocument} from 'common/models/document/caseDocument';
import {DashboardClaimantItem, DashboardDefendantItem} from 'models/dashboard/dashboardItem';
import {ClaimUpdate, EventDto} from 'models/events/eventDto';
import {CaseEvent} from 'models/events/caseEvent';
import {CourtLocation} from 'models/courts/courtLocations';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {translateCCDCaseDataToCUIModel} from 'services/translation/convertToCUI/cuiTranslation';
import {FileResponse} from 'common/models/FileResponse';
import {FileUpload} from 'models/caseProgression/fileUpload';
import {
  DashboardClaimantResponse,
  DashboardDefendantResponse,
} from 'common/models/dashboard/dashboarddefendantresponse';
import {CaseRole} from 'form/models/caseRoles';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {CCDClaimantProposedPlan} from 'models/claimantResponse/ClaimantProposedPlan';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {HearingFee} from 'models/caseProgression/hearingFee/hearingFee';
import {ClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD} from 'services/translation/claimantResponse/ccdRequestJudgementTranslation';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';
import {Dashboard} from 'models/dashboard/dashboard';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';
import {CivilServiceDashboardTask} from 'models/dashboard/taskList/civilServiceDashboardTask';
import {DashboardNotification} from 'models/dashboard/dashboardNotification';
import {TaskStatusColor} from 'models/dashboard/taskList/dashboardTaskStatus';
import { GAFeeRequestBody } from 'services/features/generalApplication/feeDetailsService';
import {CCDGeneralApplication} from 'models/gaEvents/eventDto';
import {roundOffTwoDecimals} from 'common/utils/dateUtils';
import {syncCaseReferenceCookie} from 'modules/cookie/caseReferenceCookie';
import {assertHasData, assertNonEmpty} from 'client/common/error/eventSubmissionError';
import {
  buildAuthenticatedConfig,
  buildAuthorizationOnlyConfig,
  buildJsonOnlyConfig,
  executeRequest,
  RequestErrorHandler,
} from 'client/common/civilServiceRequest';
import {normalizeRouteParam, RouteParam} from 'common/utils/routeParamUtils';
import {ClassConstructor} from 'class-transformer/types/interfaces';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('civilServiceClient');

const getResponseHeaderValue = (header: AxiosHeaderValue | undefined): string => {
  if (typeof header === 'string') {
    return header;
  }
  if (typeof header === 'number' || typeof header === 'boolean') {
    return header.toString();
  }
  if (Array.isArray(header)) {
    return header.join(', ');
  }
  return '';
};

const convertCaseToClaim = (caseDetails: CivilClaimResponse): Claim => {
  const claim: Claim = translateCCDCaseDataToCUIModel(caseDetails.case_data);
  claim.ccdState = caseDetails.state;
  claim.id = caseDetails.id?.toString();
  claim.lastModifiedDate = caseDetails.last_modified;
  return claim;
};

export class CivilServiceClient {
  client: AxiosInstance;

  constructor(baseURL: string, isDocumentInstance?: boolean) {
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

  private getClaimDetailsRequestCache(req: AppRequest): Map<string, Promise<Claim>> {
    const requestWithLocals = req as AppRequest & { locals?: AppRequest['locals'] };
    const requestLocals = requestWithLocals.locals ?? (requestWithLocals.locals = {env: '', lang: ''});
    if (requestLocals.claimDetailsRequestCache) {
      return requestLocals.claimDetailsRequestCache;
    }

    const newCache = new Map<string, Promise<Claim>>();
    requestLocals.claimDetailsRequestCache = newCache;
    return newCache;
  }

  private getUserCaseRolesRequestCache(req: AppRequest): Map<string, Promise<CaseRole>> {
    const requestWithLocals = req as AppRequest & { locals?: AppRequest['locals'] };
    const requestLocals = requestWithLocals.locals ?? (requestWithLocals.locals = {env: '', lang: ''});
    if (requestLocals.userCaseRolesRequestCache) {
      return requestLocals.userCaseRolesRequestCache;
    }

    const newCache = new Map<string, Promise<CaseRole>>();
    requestLocals.userCaseRolesRequestCache = newCache;
    return newCache;
  }

  getConfig(req: AppRequest) {
    return buildAuthenticatedConfig(req);
  }

  private authenticatedGet<T>(url: string, req: AppRequest, onError: RequestErrorHandler): Promise<AxiosResponse<T>> {
    return executeRequest(() => this.client.get<T>(url, this.getConfig(req)), onError);
  }

  private authenticatedPost<T>(url: string, data: unknown, req: AppRequest, onError: RequestErrorHandler): Promise<AxiosResponse<T>> {
    return executeRequest(() => this.client.post<T>(url, data, this.getConfig(req)), onError);
  }

  private authenticatedPut<T>(url: string, data: unknown, req: AppRequest, onError: RequestErrorHandler): Promise<AxiosResponse<T>> {
    return executeRequest(() => this.client.put<T>(url, data, this.getConfig(req)), onError);
  }

  private async getPaginatedDashboardClaims<T>(
    role: 'claimant' | 'defendant',
    pageQueryKey: 'claimantPage' | 'defendantPage',
    itemClass: ClassConstructor<T>,
    req: AppRequest,
    onError: (submitterId: string | undefined, err: unknown) => string,
  ): Promise<{claims: T[]; totalPages: number}> {
    const submitterId = req.session?.user?.id;
    const currentPage = req.query?.[pageQueryKey] ?? 1;
    const response = await executeRequest(
      () => this.client.get(`/cases/${role}/${submitterId}?page=${currentPage}`, this.getConfig(req)),
      (err) => logger.error(onError(submitterId, err)),
    );
    return {
      claims: plainToInstance(itemClass, response.data.claims as object[]),
      totalPages: response.data.totalPages,
    };
  }

  async getClaimsForClaimant(req: AppRequest): Promise<DashboardClaimantResponse> {
    return this.getPaginatedDashboardClaims(
      'claimant',
      'claimantPage',
      DashboardClaimantItem,
      req,
      (submitterId, err) => `Error when getting claims for claimant - submitterId - ${submitterId}, error - ${(err as Error).message}`,
    );
  }

  async getClaimsForDefendant(req: AppRequest): Promise<DashboardDefendantResponse> {
    return this.getPaginatedDashboardClaims(
      'defendant',
      'defendantPage',
      DashboardDefendantItem,
      req,
      (submitterId, err) => `Error when getting claims for defendant -submitterId - ${submitterId}, error - ${(err as Error).message}`,
    );
  }

  async retrieveByDefendantId(req: AppRequest): Promise<CivilClaimResponse[]> {
    const response = await this.authenticatedPost<{cases: CivilClaimResponse[]}>(
      CIVIL_SERVICE_CASES_URL,
      {match_all: {}},
      req,
      (err) => `Error when retrieving by defendant id - error - ${(err as Error).message} `,
    );
    return response.data.cases.map((claim: CivilClaimResponse) => {
      //TODO Maybe we need to convert also CCD to CUI
      const caseData = Object.assign(new Claim(), claim.case_data);
      return new CivilClaimResponse(claim.id, caseData);
    });
  }

  async retrieveClaimDetails(claimId: RouteParam, req: AppRequest): Promise<Claim> {
    const requestCache = this.getClaimDetailsRequestCache(req);
    const normalizedClaimId = normalizeRouteParam(claimId);
    const requestUserId = req.session?.user?.id ?? '';
    const cacheKey = `${normalizedClaimId}|${requestUserId}`;
    const cachedClaimDetailsPromise = requestCache.get(cacheKey);
    if (cachedClaimDetailsPromise !== undefined) {
      return cachedClaimDetailsPromise;
    }

    const claimDetailsPromise = this.retrieveClaimDetailsFromCivilService(normalizedClaimId, req)
      .catch((error) => {
        requestCache.delete(cacheKey);
        throw error;
      });
    requestCache.set(cacheKey, claimDetailsPromise);
    return claimDetailsPromise;
  }

  private async retrieveClaimDetailsFromCivilService(normalizedClaimId: string, req: AppRequest): Promise<Claim> {
    const response = await executeRequest(
      () => this.client.get(`/cases/${normalizedClaimId}`, this.getConfig(req)),// nosonar
      () => logger.error(`Error when retrieving claim details for claim id - ${normalizedClaimId} `),
    );
    if (!response.data) {
      throw new AssertionError({message: 'Claim details not available!'});
    }
    const caseDetails: CivilClaimResponse = response.data;

    caseDetails.case_data.caseRole = await this.getUserCaseRoles(normalizedClaimId, req);
    const caseId = caseDetails.id?.toString();
    if (caseId) {
      const session = req.session as AppSession | undefined;
      if (session) {
        session.caseReference = caseId;
        syncCaseReferenceCookie(req);
      }
    }
    return convertCaseToClaim(caseDetails);
  }

  async getFeeRanges(req: AppRequest): Promise<FeeRanges> {
    const response = await this.authenticatedGet(
      CIVIL_SERVICE_FEES_RANGES,
      req,
      `Error when getting fee ranges, req.params.id - ${req.params.id}`,
    );
    return new FeeRanges(plainToInstance(FeeRange, response.data as object[]));
  }

  async getHearingAmount(amount: number, req: AppRequest): Promise<HearingFee> {
    const response = await this.authenticatedGet<HearingFee>(
      `${CIVIL_SERVICE_HEARING_URL}/${amount}`,
      req,
      `Error when getting hearing amount, req.params.id - ${req.params.id}`,
    );
    return response.data;
  }

  async getClaimAmountFee(amount: number, req: AppRequest): Promise<number> {
    const claimFeeData = await this.getClaimFeeData(amount, req);
    return convertToPoundsFilter(claimFeeData?.calculatedAmountInPence.toString());
  }

  async getClaimFeeData(amount: number, req: AppRequest): Promise<ClaimFeeData> {
    const userid = (<AppRequest>req).session.user?.id;
    logger.info(`Total Claim Amount before Round off for user ${userid}, amount: ${amount}`);
    amount = roundOffTwoDecimals(amount);
    logger.info(`Total Claim Amount before Round off for user ${userid}, amount: ${amount}`);
    const response = await this.authenticatedGet<ClaimFeeData>(
      `${CIVIL_SERVICE_CLAIM_AMOUNT_URL}/${amount}`,
      req,
      `Error when getting claim fee data, req.params.id - ${req.params.id}`,
    );
    const claimFeeInPence = response.data.calculatedAmountInPence;
    logger.info(`Claim fee of ${claimFeeInPence} calculated for user ${userid} based on claim amount ${amount}`);
    return response.data;
  }

  async getGeneralApplicationFee(feeRequestBody: GAFeeRequestBody, req: AppRequest): Promise<ClaimFeeData> {
    const response = await this.authenticatedPost<ClaimFeeData>(
      CIVIL_SERVICE_GENERAL_APPLICATION_FEE_URL,
      feeRequestBody,
      req,
      `Error when getting general application fee data - req.params.id - ${req.params.id}`,
    );
    return response.data;
  }

  async getAirlines(req: AppRequest): Promise<any> {
    const response = await this.authenticatedGet(
      `${CIVIL_SERVICE_AIRLINES_URL}`,
      req,
      `Error when getting airline list - req.params.id - ${req.params.id}`,
    );
    return response.data;
  }

  async verifyPin(req: AppRequest, pin: string, caseReference: string): Promise<Claim> {
    const response = await executeRequest(
      () => this.client.post(
        CIVIL_SERVICE_VALIDATE_PIN_URL.replace(':caseReference', caseReference),//nosonar
        {pin: pin},
        buildJsonOnlyConfig(),
      ),// nosonar
      `Error when verifying pin - req.params.id - ${req.params.id}`,
    );
    if (!response.data) {
      return new Claim();
    }
    const caseDetails: CivilClaimResponse = response.data;
    return convertCaseToClaim(caseDetails);
  }

  async verifyOcmcPin(pin: string, caseReference: string): Promise<string> {
    const response = await executeRequest(
      () => this.client.post(
        CIVIL_SERVICE_VALIDATE_OCMC_PIN_URL.replace(':caseReference', caseReference),//nosonar
        {pin: pin},
        buildJsonOnlyConfig(),
      ),// no-sonar
      `Error when verifying OCMC pin -caseReference - ${caseReference}`,
    );
    if (!response.data) {
      return null;
    }
    return response.data as string;
  }

  async isDefendantLinked(caseReference: string): Promise<boolean> {
    try {
      const response = await this.client.get(
        CIVIL_SERVICE_CHECK_DEFENDENT_LINKED_URL.replace(':caseReference', caseReference),//nosonar
        buildJsonOnlyConfig(),
      );// no-sonar
      if (!response.data) {
        return false;
      }
      return response.data as boolean;
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      if (axiosError.response?.status === 404) {
        logger.info(`Claim ${caseReference} not found or not linked, returning false`);
        return false;
      }
      logger.error(`Error when checking a claim ${caseReference} is linked to a defendant,caseReference - ${caseReference}`);
      throw err;
    }
  }

  async uploadDocument(req: AppRequest, file: FileUpload): Promise<CaseDocument> {
    const formData = new FormData();
    const binaryContent: ArrayBuffer = file.buffer instanceof Buffer
      ? Uint8Array.from(file.buffer).buffer
      : file.buffer as ArrayBuffer;
    formData.append('file', new Blob([binaryContent]), file.originalname);
    const response = await executeRequest(
      () => this.client.post(CIVIL_SERVICE_UPLOAD_DOCUMENT_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${req.session?.user?.accessToken}`,
        },
      }),
      `Error when uploading document, error - req.params.id - ${req.params.id}`,
    );
    if (!response.data) {
      throw new AssertionError({message: 'Document upload unsuccessful.'});
    }
    if (response.data instanceof Uint8Array) {
      const decoder = new TextDecoder('utf-8');
      const decodedString = decoder.decode(response.data);
      return JSON.parse(decodedString) as CaseDocument;
    }
    return response.data as CaseDocument;
  }

  async retrieveDocument(req: AppRequest, documentId: string ) {
    const response = await this.authenticatedGet(
      CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL.replace(':documentId', documentId),
      req,
      `Error when retrieving document, - documentId- ${documentId}`,
    );

    return new FileResponse(getResponseHeaderValue(response.headers['content-type']),
      getResponseHeaderValue(response.headers['original-file-name']),
      response.data as Buffer);
  }

  async submitDefendantResponseEvent(claimId: RouteParam, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.DEFENDANT_RESPONSE_CUI, claimId, updatedClaim, req);
  }

  async submitClaimantResponseEvent(claimId: RouteParam, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.CLAIMANT_RESPONSE_CUI, claimId, updatedClaim, req);
  }

  async submitAgreedResponseExtensionDateEvent(claimId: RouteParam, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.INFORM_AGREED_EXTENSION_DATE_SPEC, claimId, updatedClaim, req);
  }

  async submitDraftClaim(updatedClaim: ClaimUpdate, req: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.CREATE_LIP_CLAIM, 'draft', updatedClaim, req);
  }

  async submitClaimAfterPayment(claimId: RouteParam, claim: Claim, req: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.CREATE_CLAIM_SPEC_AFTER_PAYMENT, claimId,
      {
        issueDate : claim.issueDate,
        respondent1ResponseDeadline: claim.respondent1ResponseDeadline,
      }
      , req);
  }

  async submitClaimantResponseDJEvent(claimId: RouteParam, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.DEFAULT_JUDGEMENT_SPEC, claimId, updatedClaim, req);
  }

  async submitTrialArrangement(claimId: RouteParam, updatedClaim: ClaimUpdate, req?: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.TRIAL_ARRANGEMENTS, claimId, updatedClaim, req);
  }

  async submitClaimantResponseForRequestJudgementAdmission(claimId: RouteParam, updatedClaim: ClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.REQUEST_JUDGEMENT_ADMISSION_SPEC, claimId, updatedClaim, req);
  }

  async submitClaimSettled(claimId: RouteParam, updatedClaim: ClaimUpdate, req: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.LIP_CLAIM_SETTLED,  claimId, updatedClaim, req);
  }

  async submitDefendantSignSettlementAgreementEvent(claimId: RouteParam, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.DEFENDANT_SIGN_SETTLEMENT_AGREEMENT, claimId, updatedClaim, req);
  }

  async submitCreateServiceRequestEvent(claimId: RouteParam, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.CREATE_SERVICE_REQUEST_CUI, claimId, {}, req);
  }

  async submitJudgmentPaidInFull(claimId: RouteParam, updatedClaim: ClaimUpdate, req?: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.JUDGMENT_PAID_IN_FULL, claimId, updatedClaim, req);
  }

  async submitInitiateGeneralApplicationEvent(claimId: RouteParam, updatedApplication: CCDGeneralApplication, req?: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.INITIATE_GENERAL_APPLICATION, claimId, updatedApplication, req);
  }

  async submitInitiateGeneralApplicationEventForCosc(claimId: RouteParam, updatedApplication: CCDGeneralApplication, req?: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.INITIATE_GENERAL_APPLICATION_COSC, claimId, updatedApplication, req);
  }

  async submitRequestForReconsideration(claimId: RouteParam, updatedClaim: ClaimUpdate, req?: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.REQUEST_FOR_RECONSIDERATION, claimId, updatedClaim, req);
  }

  async submitEvent(event: CaseEvent, claimId: RouteParam, updatedClaim?: ClaimUpdate, req?: AppRequest): Promise<Claim> {
    const normalizedClaimId = normalizeRouteParam(claimId);
    const userId = req.session?.user?.id;
    const data: EventDto = {
      event: event,
      caseDataUpdate: updatedClaim,
    };
    assertNonEmpty(userId, 'User id is undefined');
    assertNonEmpty(normalizedClaimId, 'Claim id is undefined');
    const response = await executeRequest(
      () => this.client.post(
        CIVIL_SERVICE_SUBMIT_EVENT
          .replace(':submitterId', userId)
          .replace(':caseId', normalizedClaimId),
        data,
        this.getConfig(req),
      ),// nosonar
      (e: unknown) => {
        const err = e as AxiosError;
        const status = err.response?.status;
        const body = err.response?.data;
        logger.error(`Submit event failed (event=${event}, claimId=${normalizedClaimId}, status=${status})`, { body });
      },
    );
    assertHasData(response, { action: 'submit event', event });
    const claimResponse = response.data as CivilClaimResponse;
    return convertCaseToClaim(claimResponse);
  }

  async calculateClaimInterest(claim: ClaimUpdate): Promise<number> {
    logger.info('calculateClaimInterest');
    const response = await executeRequest(
      () => this.client.post(CIVIL_SERVICE_CLAIM_CALCULATE_INTEREST, claim, buildJsonOnlyConfig()),
      'Error when calculating interest',
    );
    logger.info(`calculateClaimInterest response: ${response.data}` );
    return response.data as number;
  }

  async calculateClaimTotalAmount(claim: ClaimUpdate): Promise<number> {
    const response = await executeRequest(
      () => this.client.post(CIVIL_SERVICE_CALCULATE_TOTAL_CLAIM_AMOUNT_URL, claim, buildJsonOnlyConfig()),
      'Error when calculating claim total amount',
    );
    return response.data as number;
  }

  async submitQueryManagementRaiseQuery(claimId: RouteParam, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.QUERY_MANAGEMENT_RAISE_QUERY, claimId, updatedClaim, req);
  }

  async calculateExtendedResponseDeadline(extendedDeadline: Date, plusDays: number, req: AppRequest): Promise<Date> {
    const response = await this.authenticatedPost(
      CIVIL_SERVICE_CALCULATE_DEADLINE,
      {
        responseDate: extendedDeadline,
        plusDays: plusDays,
      },
      req,
      `Error when calculating extended response deadline - req.params.id - ${req.params.id}`,
    );
    return response.data as Date;
  }

  async getCourtLocations(req: AppRequest): Promise<CourtLocation[]> {
    const response = await this.authenticatedGet(
      CIVIL_SERVICE_COURT_LOCATIONS,
      req,
      'Error when getting court location',
    );
    return plainToInstance(CourtLocation, response.data as object[]);
  }

  async assignDefendantToClaim(claimId: RouteParam, req: AppRequest, pin:string): Promise<void> {
    const normalizedClaimId = normalizeRouteParam(claimId);
    await executeRequest(
      () => this.client.post(
        ASSIGN_CLAIM_TO_DEFENDANT.replace(':claimId', normalizedClaimId),
        { pin: pin },
        buildAuthorizationOnlyConfig(req),
      ), // nosonar
      `Error when assigning defendant to claim ${normalizedClaimId}`,
    );
  }

  async getAgreedDeadlineResponseDate(claimId: RouteParam, req: AppRequest): Promise<Date> {
    const normalizedClaimId = normalizeRouteParam(claimId);
    const response = await this.authenticatedGet(
      CIVIL_SERVICE_AGREED_RESPONSE_DEADLINE_DATE.replace(':claimId', normalizedClaimId),
      req,
      `Error when getting agreed deadline response date for claimId: ${normalizedClaimId}`,
    );
    if(response.data)
      return new Date(response.data.toString());
  }

  async getUserCaseRoles(claimId: RouteParam, req: AppRequest) {
    const requestCache = this.getUserCaseRolesRequestCache(req);
    const normalizedClaimId = normalizeRouteParam(claimId);
    const requestUserId = req.session?.user?.id ?? '';
    const cacheKey = `${normalizedClaimId}|${requestUserId}`;
    const cachedCaseRolePromise = requestCache.get(cacheKey);
    if (cachedCaseRolePromise !== undefined) {
      return cachedCaseRolePromise;
    }

    const userCaseRolePromise = this.getUserCaseRolesFromCivilService(normalizedClaimId, req)
      .catch((error) => {
        requestCache.delete(cacheKey);
        throw error;
      });
    requestCache.set(cacheKey, userCaseRolePromise);
    return userCaseRolePromise;
  }

  private async getUserCaseRolesFromCivilService(normalizedClaimId: string, req: AppRequest): Promise<CaseRole> {
    const userCaseRolesUrl = (new URL(`${this.client.defaults.baseURL}${CIVIL_SERVICE_USER_CASE_ROLE.replace(':claimId', normalizedClaimId)}`));
    const response = await executeRequest(
      () => this.client.get(userCaseRolesUrl.toString(), buildAuthorizationOnlyConfig(req)),
      'Error when getting user case roles',
    );
    const responseRoles = response.data as string[];
    return responseRoles
      .map(role => Object.values(CaseRole).find(enumValue => enumValue === role))
      .at(0);
  }

  async getCalculatedDecisionOnClaimantProposedRepaymentPlan(claimId: RouteParam, req: AppRequest, claimantProposedPlan: CCDClaimantProposedPlan) :Promise<RepaymentDecisionType> {
    const response = await this.authenticatedPost(
      CIVIL_SERVICE_COURT_DECISION.replace(':claimId', normalizeRouteParam(claimId)),
      claimantProposedPlan,
      req,
      'Error when getting calculated decision on claimant proposed repayment plan',
    );
    return response.data as unknown as RepaymentDecisionType;
  }
  async getFeePaymentRedirectInformation(claimId: RouteParam, feeType: string,  req: AppRequest): Promise<PaymentInformation> {
    const response = await this.authenticatedPost(
      CIVIL_SERVICE_FEES_PAYMENT_URL.replace(':feeType', feeType).replace(':claimId', normalizeRouteParam(claimId)),
      '',
      req,
      'Error when getting fee payment redirect information',
    );
    return plainToInstance(PaymentInformation, response.data);
  }

  async getFeePaymentStatus(claimId: RouteParam, paymentReference: string, feeType: string,  req: AppRequest): Promise<PaymentInformation> {
    const response = await this.authenticatedGet(
      CIVIL_SERVICE_FEES_PAYMENT_STATUS_URL.replace(':claimId', normalizeRouteParam(claimId)).replace(':feeType', feeType).replace(':paymentReference', paymentReference),
      req,
      'Error when getting fee payment status',
    );

    return plainToInstance(PaymentInformation, response.data);
  }

  filterDashboardNotificationItems(dashboardNotifications: DashboardNotification[], req: AppRequest): DashboardNotification[] {
    return dashboardNotifications.filter((notification) => {

      const session = req?.session;
      const actionUser = notification?.notificationAction?.createdBy;
      const sessionUser = session.user?.givenName + ' ' + session.user?.familyName;
      const sessionStart = new Date(session.issuedAt * 1000);
      const actionPerformed = notification?.notificationAction?.actionPerformed;
      const actionPerformedTime = new Date(notification?.notificationAction?.createdAt);
      const timeToLive = notification.timeToLive;

      return !(actionUser === sessionUser && actionPerformed === 'Click'
          && (timeToLive === 'Click'
              || (timeToLive === 'Session'
                  && sessionStart > actionPerformedTime
              )
          )
      );

    });
  }

  async retrieveNotification(claimId: RouteParam,role: string,  req: AppRequest): Promise<DashboardNotificationList>  {
    const config = this.getConfig(req);
    const response = await this.client.get(CIVIL_SERVICE_NOTIFICATION_LIST_URL.replace(':ccd-case-identifier', normalizeRouteParam(claimId)).replace(':role-type', role), config);
    let dashboardNotificationItems = plainToInstance(DashboardNotification, response.data as DashboardNotification[]);
    dashboardNotificationItems = this.filterDashboardNotificationItems(dashboardNotificationItems, req);
    return new DashboardNotificationList(dashboardNotificationItems);
  }

  async retrieveGaNotification(appIds: string[], role: string,  req: AppRequest): Promise<Map<string, DashboardNotificationList>>  {
    const config = this.getConfig(req);
    const appIdsParam = appIds.join(',');
    const response = await this.client.get(CIVIL_SERVICE_GA_NOTIFICATION_LIST_URL.replace(':ccd-case-identifiers', appIdsParam).replace(':role-type', role), config);
    const dashboardNotificationItems = plainToInstance(Map<string, DashboardNotification[]>, response.data as Map<string, DashboardNotification[]>);
    const gaNotifications = new Map<string, DashboardNotificationList>;
    dashboardNotificationItems.forEach((value, key, map) => {
      const dashboardNotificationItems = this.filterDashboardNotificationItems(value, req);
      gaNotifications.set(key, new DashboardNotificationList(dashboardNotificationItems));
    });

    return gaNotifications;
  }

  async retrieveDashboard(claimId: RouteParam,role: string,  req: AppRequest): Promise<Dashboard>  {
    const config = this.getConfig(req);
    const response = await this.client.get(CIVIL_SERVICE_DASHBOARD_TASKLIST_URL.replace(':ccd-case-identifier', normalizeRouteParam(claimId)).replace(':role-type', role), config);
    const taskList = plainToInstance(CivilServiceDashboardTask, response.data as CivilServiceDashboardTask[]);

    const groupedTasks = taskList.reduce((group, task) => {
      const key = `${task.categoryEn}-${task.categoryCy}`;
      const dashboardTask = new DashboardTask(
        task.id,
        task.taskNameEn,
        task.taskNameCy,
        task.currentStatusEn.toString(),
        task.currentStatusCy,
        TaskStatusColor[task.currentStatusEn],
        task.hintTextEn,
        task.hintTextCy,
      );

      if (!group[key]) {
        group[key] = new DashboardTaskList(task.categoryEn, task.categoryCy);
      }
      group[key].tasks.push(dashboardTask);

      return group;
    }, {} as Record<string, DashboardTaskList>);

    const groupedTasksList= Object.values(groupedTasks) as DashboardTaskList[];

    return new Dashboard(groupedTasksList);
  }

  async createDashboard(req: AppRequest): Promise<void> {
    const redisKey = req?.session?.user?.id;
    const scenarioRef = 'Scenario.AAA6.ClaimIssue.ClaimSubmit.Required';
    await executeRequest(
      () => this.client.post(
        CIVIL_SERVICE_CREATE_SCENARIO_DASHBOARD_URL.replace(':scenarioRef', scenarioRef).replace(':redisKey', redisKey),
        {params: new Map()},
        this.getConfig(req),
      ),
      (err) => logger.error(err),
    );
  }

  async recordClick(id: string, req: AppRequest): Promise<void> {
    await this.authenticatedPut(
      CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', id),
      null,
      req,
      (err) => logger.error(err),
    );
  }
  async updateTaskStatus(taskId: string, req: AppRequest): Promise<void> {
    await this.authenticatedPut(
      CIVIL_SERVICE_UPDATE_TASK_STATUS_URL.replace(':taskItemId', taskId),
      null,
      req,
      (err) => logger.error(err),
    );
  }
}
