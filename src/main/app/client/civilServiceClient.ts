import {Claim} from 'common/models/claim';
import Axios, {AxiosError, AxiosInstance, AxiosResponse} from 'axios';
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
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('civilServiceClient');

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
    this.client.interceptors.request.use((config) => {
      const authHeader = config.headers?.['Authorization'] ?? config.headers?.['authorization'];
      if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        /* istanbul ignore next -- investigation logging for API calls with token */
        logger.info('Civil API call with token', { // NOSONAR
          method: config.method,
          url: config.url,
          baseURL: config.baseURL,
          token_suffix: authHeader.length > 13 ? `***${authHeader.slice(-4)}` : '***',
        });
      }
      return config;
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

  async getClaimsForClaimant(req: AppRequest): Promise<DashboardClaimantResponse> {
    const config = this.getConfig(req);
    const submitterId = req.session?.user?.id;
    const currentPage = req.query?.claimantPage ?? 1;
    try {
      const response = await this.client.get('/cases/claimant/' + submitterId + '?page=' + currentPage, config);
      const dashboardClaimantItemList = plainToInstance(DashboardClaimantItem, response.data.claims as object[]);
      return { claims: dashboardClaimantItemList, totalPages: response.data.totalPages };
    } catch (err) {
      logger.error(`Error when getting claims for claimant - submitterId - ${submitterId}, error - ${err.message}`);
      throw err;
    }
  }

  async getClaimsForDefendant(req: AppRequest): Promise<DashboardDefendantResponse> {
    const config = this.getConfig(req);
    const submitterId = req.session?.user?.id;
    const currentPage = req.query?.defendantPage ?? 1;
    try {
      const response = await this.client.get('/cases/defendant/' + submitterId + '?page=' + currentPage, config);
      const dashboardDefendantItemList = plainToInstance(DashboardDefendantItem, response.data.claims as object[]);
      return { claims: dashboardDefendantItemList, totalPages: response.data.totalPages };
    } catch (err) {
      logger.error(`Error when getting claims for defendant -submitterId - ${submitterId}, error - ${err.message}`);
      throw err;
    }
  }

  async retrieveByDefendantId(req: AppRequest): Promise<CivilClaimResponse[]> {
    const config = this.getConfig(req);
    let claims: CivilClaimResponse[] = [];
    try {
      const response = await this.client.post(CIVIL_SERVICE_CASES_URL, {match_all: {}}, config);
      claims = response.data.cases.map((claim: CivilClaimResponse) => {
        //TODO Maybe we need to convert also CCD to CUI
        const caseData = Object.assign(new Claim(), claim.case_data);
        return new CivilClaimResponse(claim.id, caseData);
      });
      return claims;
    } catch (err) {
      logger.error(`Error when retrieving by defendant id - error - ${err.message} `);
      throw err;
    }
  }

  async retrieveClaimDetails(claimId: string, req: AppRequest): Promise<Claim> {
    const config = this.getConfig(req);
    try {
      const response = await this.client.get(`/cases/${claimId}`, config);// nosonar
      if (!response.data) {
        throw new AssertionError({message: 'Claim details not available!'});
      }
      const caseDetails: CivilClaimResponse = response.data;

      caseDetails.case_data.caseRole = await this.getUserCaseRoles(claimId, req);
      const caseId = caseDetails.id?.toString();
      if (caseId) {
        const session = req.session as AppSession | undefined;
        if (session) {
          session.caseReference = caseId;
          syncCaseReferenceCookie(req);
        }
      }
      return convertCaseToClaim(caseDetails);
    } catch (err: unknown) {
      logger.error(`Error when retrieving claim details for claim id - ${claimId} `);
      throw err;
    }
  }

  async getFeeRanges(req: AppRequest): Promise<FeeRanges> {
    const config = this.getConfig(req);
    try {
      const response = await this.client.get(CIVIL_SERVICE_FEES_RANGES, config);
      return new FeeRanges(plainToInstance(FeeRange, response.data as object[]));
    } catch (err: unknown) {
      logger.error(`Error when getting fee ranges, req.params.id - ${req.params.id}`);
      throw err;
    }
  }

  async getHearingAmount(amount: number, req: AppRequest): Promise<HearingFee> {
    const config = this.getConfig(req);
    try {
      const response = await this.client.get(`${CIVIL_SERVICE_HEARING_URL}/${amount}`, config);
      return response.data;
    } catch (err: unknown) {
      logger.error(`Error when getting hearing amount, req.params.id - ${req.params.id}`);
      throw err;
    }
  }

  async getClaimAmountFee(amount: number, req: AppRequest): Promise<number> {
    const claimFeeData = await this.getClaimFeeData(amount, req);
    return convertToPoundsFilter(claimFeeData?.calculatedAmountInPence.toString());
  }

  async getClaimFeeData(amount: number, req: AppRequest): Promise<ClaimFeeData> {
    const config = this.getConfig(req);
    try {
      const userid = (<AppRequest>req).session.user?.id;
      logger.info(`Total Claim Amount before Round off for user ${userid}, amount: ${amount}`);
      amount = roundOffTwoDecimals(amount);
      logger.info(`Total Claim Amount before Round off for user ${userid}, amount: ${amount}`);
      const response: AxiosResponse<object> = await this.client.get(`${CIVIL_SERVICE_CLAIM_AMOUNT_URL}/${amount}`, config);
      const claimFeeInPence = (response.data as ClaimFeeData).calculatedAmountInPence;
      logger.info(`Claim fee of ${claimFeeInPence} calculated for user ${userid} based on claim amount ${amount}`);
      return response.data;
    } catch (err: unknown) {
      logger.error(`Error when getting claim fee data, req.params.id - ${req.params.id}`);
      throw err;
    }
  }

  async getGeneralApplicationFee(feeRequestBody: GAFeeRequestBody, req: AppRequest): Promise<ClaimFeeData> {
    try {
      const config = this.getConfig(req);
      const response: AxiosResponse<object> = await this.client.post(CIVIL_SERVICE_GENERAL_APPLICATION_FEE_URL, feeRequestBody, config);
      return response.data;
    } catch (err: unknown) {
      logger.error(`Error when getting general application fee data - req.params.id - ${req.params.id}`);
      throw err;
    }
  }

  async getAirlines(req: AppRequest): Promise<any> {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.get(`${CIVIL_SERVICE_AIRLINES_URL}`, config);
      return response.data;
    } catch (err: unknown) {
      logger.error(`Error when getting airline list - req.params.id - ${req.params.id}`);
      throw err;
    }
  }

  async verifyPin(req: AppRequest, pin: string, caseReference: string): Promise<Claim> {
    try {
      const response = await this.client.post(CIVIL_SERVICE_VALIDATE_PIN_URL //nosonar
        .replace(':caseReference', caseReference), {pin:pin}, {headers: {'Content-Type': 'application/json'}});// nosonar
      if (!response.data) {
        return new Claim();
      }
      const caseDetails: CivilClaimResponse = response.data;
      return convertCaseToClaim(caseDetails);

    } catch (err: unknown) {
      logger.error(`Error when verifying pin - req.params.id - ${req.params.id}`);
      throw err;
    }
  }

  async verifyOcmcPin(pin: string, caseReference: string): Promise<string> {
    try {
      const response = await this.client.post(CIVIL_SERVICE_VALIDATE_OCMC_PIN_URL //nosonar
        .replace(':caseReference', caseReference), {pin:pin}, {headers: {'Content-Type': 'application/json'}});// no-sonar
      if (!response.data) {
        return null;
      }
      return response.data as string;
    } catch (err: unknown) {
      logger.error(`Error when verifying OCMC pin -caseReference - ${caseReference}`);
      throw err;
    }
  }

  async isDefendantLinked(caseReference: string): Promise<boolean> {
    try {
      const response = await this.client.get(CIVIL_SERVICE_CHECK_DEFENDENT_LINKED_URL //nosonar
        .replace(':caseReference', caseReference), {headers: {'Content-Type': 'application/json'}});// no-sonar
      if (!response.data) {
        return false;
      }
      return response.data as boolean;
    } catch (err: unknown) {
      logger.error(`Error when checking a claim ${caseReference} is linked to a defendant,caseReference - ${caseReference}`);
      throw err;
    }
  }

  async uploadDocument(req: AppRequest, file: FileUpload): Promise<CaseDocument> {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([file.buffer]) , file.originalname);
      const response= await this.client.post(CIVIL_SERVICE_UPLOAD_DOCUMENT_URL, formData,
        {headers: {'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${req.session?.user?.accessToken}`}});
      if (!response.data) {
        throw new AssertionError({message: 'Document upload unsuccessful.'});
      }
      if (response.data instanceof Uint8Array) {
        const decoder = new TextDecoder('utf-8');
        const decodedString = decoder.decode(response.data);
        return JSON.parse(decodedString) as CaseDocument;
      } else {
        return response.data as CaseDocument;
      }
    } catch (err: unknown) {
      logger.error(`Error when uploading document, error - req.params.id - ${req.params.id}`);
      throw err;
    }
  }

  async retrieveDocument(req: AppRequest, documentId: string ) {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.get(CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL
        .replace(':documentId', documentId), config);

      return new FileResponse(response.headers['content-type'],
        response.headers['original-file-name'],
        response.data as Buffer);

    } catch (err) {
      logger.error(`Error when retrieving document, - documentId- ${documentId}`);
      throw err;
    }
  }

  async submitDefendantResponseEvent(claimId: string, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.DEFENDANT_RESPONSE_CUI, claimId, updatedClaim, req);
  }

  async submitClaimantResponseEvent(claimId: string, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.CLAIMANT_RESPONSE_CUI, claimId, updatedClaim, req);
  }

  async submitAgreedResponseExtensionDateEvent(claimId: string, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.INFORM_AGREED_EXTENSION_DATE_SPEC, claimId, updatedClaim, req);
  }

  async submitDraftClaim(updatedClaim: ClaimUpdate, req: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.CREATE_LIP_CLAIM, 'draft', updatedClaim, req);
  }

  async submitClaimAfterPayment(claimId: string, claim: Claim, req: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.CREATE_CLAIM_SPEC_AFTER_PAYMENT, claimId,
      {
        issueDate : claim.issueDate,
        respondent1ResponseDeadline: claim.respondent1ResponseDeadline,
      }
      , req);
  }

  async submitClaimantResponseDJEvent(claimId: string, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.DEFAULT_JUDGEMENT_SPEC, claimId, updatedClaim, req);
  }

  async submitTrialArrangement(claimId: string, updatedClaim: ClaimUpdate, req?: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.TRIAL_ARRANGEMENTS, claimId, updatedClaim, req);
  }

  async submitClaimantResponseForRequestJudgementAdmission(claimId: string, updatedClaim: ClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.REQUEST_JUDGEMENT_ADMISSION_SPEC, claimId, updatedClaim, req);
  }

  async submitClaimSettled(claimId: string, updatedClaim: ClaimUpdate, req: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.LIP_CLAIM_SETTLED,  claimId, updatedClaim, req);
  }

  async submitDefendantSignSettlementAgreementEvent(claimId: string, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.DEFENDANT_SIGN_SETTLEMENT_AGREEMENT, claimId, updatedClaim, req);
  }

  async submitCreateServiceRequestEvent(claimId: string, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.CREATE_SERVICE_REQUEST_CUI, claimId, {}, req);
  }

  async submitJudgmentPaidInFull(claimId: string, updatedClaim: ClaimUpdate, req?: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.JUDGMENT_PAID_IN_FULL, claimId, updatedClaim, req);
  }

  async submitInitiateGeneralApplicationEvent(claimId: string, updatedApplication: CCDGeneralApplication, req?: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.INITIATE_GENERAL_APPLICATION, claimId, updatedApplication, req);
  }

  async submitInitiateGeneralApplicationEventForCosc(claimId: string, updatedApplication: CCDGeneralApplication, req?: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.INITIATE_GENERAL_APPLICATION_COSC, claimId, updatedApplication, req);
  }

  async submitRequestForReconsideration(claimId: string, updatedClaim: ClaimUpdate, req?: AppRequest):  Promise<Claim> {
    return this.submitEvent(CaseEvent.REQUEST_FOR_RECONSIDERATION, claimId, updatedClaim, req);
  }

  async submitEvent(event: CaseEvent, claimId: string, updatedClaim?: ClaimUpdate, req?: AppRequest): Promise<Claim> {
    const config = this.getConfig(req);
    const userId = req.session?.user?.id;
    const data: EventDto = {
      event: event,
      caseDataUpdate: updatedClaim,
    };
    assertNonEmpty(userId, 'User id is undefined');
    assertNonEmpty(claimId, 'Claim id is undefined');
    try {
      const response = await this.client.post(CIVIL_SERVICE_SUBMIT_EVENT // nosonar
        .replace(':submitterId', userId)
        .replace(':caseId', claimId), data, config);// nosonar
      assertHasData(response, { action: 'submit event', event });
      const claimResponse = response.data as CivilClaimResponse;
      return convertCaseToClaim(claimResponse);
    } catch (e: unknown) {
      const err = e as AxiosError;
      const status = err.response?.status;
      const body = err.response?.data;
      logger.error(`Submit event failed (event=${event}, claimId=${claimId}, status=${status})`, { body });
      throw err;
    }
  }

  async calculateClaimInterest(claim: ClaimUpdate): Promise<number> {
    try {
      logger.info('calculateClaimInterest');
      const response = await this.client.post(CIVIL_SERVICE_CLAIM_CALCULATE_INTEREST, claim, {headers: {'Content-Type': 'application/json'}});
      logger.info(`calculateClaimInterest response: ${response.data}` );
      return response.data as number;
    } catch (err: unknown) {
      logger.error('Error when calculating interest');
      throw err;
    }
  }

  async calculateClaimTotalAmount(claim: ClaimUpdate): Promise<number> {
    try {
      const response = await this.client.post(CIVIL_SERVICE_CALCULATE_TOTAL_CLAIM_AMOUNT_URL, claim, {headers: {'Content-Type': 'application/json'}});
      return response.data as number;
    } catch (err: unknown) {
      logger.error('Error when calculating claim total amount');
      throw err;
    }
  }

  async submitQueryManagementRaiseQuery(claimId: string, updatedClaim: ClaimUpdate, req: AppRequest): Promise<Claim> {
    return this.submitEvent(CaseEvent.QUERY_MANAGEMENT_RAISE_QUERY, claimId, updatedClaim, req);
  }

  async calculateExtendedResponseDeadline(extendedDeadline: Date, plusDays: number, req: AppRequest): Promise<Date> {
    const config = this.getConfig(req);
    try {
      const response = await this.client.post(CIVIL_SERVICE_CALCULATE_DEADLINE, {
        responseDate: extendedDeadline,
        plusDays: plusDays,
      }, config);
      return response.data as Date;
    } catch (err: unknown) {
      logger.error(`Error when calculating extended response deadline - req.params.id - ${req.params.id}`);
      throw err;
    }
  }

  async getCourtLocations(req: AppRequest): Promise<CourtLocation[]> {
    const config = this.getConfig(req);
    try {
      const response = await this.client.get(CIVIL_SERVICE_COURT_LOCATIONS, config);
      return plainToInstance(CourtLocation, response.data as object[]);
    } catch (err: unknown) {
      logger.error('Error when getting court location');
      throw err;
    }
  }

  async assignDefendantToClaim(claimId: string, req: AppRequest, pin:string): Promise<void> {
    await this.client.post(ASSIGN_CLAIM_TO_DEFENDANT.replace(':claimId', claimId), { pin: pin }, // nosonar
      { headers: { 'Authorization': `Bearer ${req.session?.user?.accessToken}` } })
      .catch((err) => {
        logger.error(`Error when assigning defendant to claim ${claimId}`);
        throw err;
      }); // nosonar
  }

  async getAgreedDeadlineResponseDate(claimId: string, req: AppRequest): Promise<Date> {
    const config = this.getConfig(req);
    try {
      const response = await this.client.get(CIVIL_SERVICE_AGREED_RESPONSE_DEADLINE_DATE.replace(':claimId', claimId), config);
      if(response.data)
        return new Date(response.data.toString());
    } catch (err: unknown) {
      logger.error(`Error when getting agreed deadline response date for claimId: ${claimId}`);
      throw err;
    }
  }

  async getUserCaseRoles(claimId: string, req: AppRequest) {
    try {
      const userCaseRolesUrl = (new URL(`${this.client.defaults.baseURL}${CIVIL_SERVICE_USER_CASE_ROLE.replace(':claimId', claimId)}`));
      const response = await this.client.get(userCaseRolesUrl.toString()
        , {headers: {'Authorization': `Bearer ${req.session?.user?.accessToken}`}});
      const responseRoles = response.data as string[];
      return responseRoles
        .map(role => Object.values(CaseRole).find(enumValue => enumValue === role))
        .at(0);
    } catch (err) {
      logger.error('Error when getting user case roles');
      throw err;
    }
  }

  async getCalculatedDecisionOnClaimantProposedRepaymentPlan(claimId: string, req: AppRequest, claimantProposedPlan: CCDClaimantProposedPlan) :Promise<RepaymentDecisionType> {
    const config = this.getConfig(req);
    try{
      const response = await this.client.post(CIVIL_SERVICE_COURT_DECISION.replace(':claimId', claimId), claimantProposedPlan, config);
      return response.data as unknown as RepaymentDecisionType;
    } catch(err) {
      logger.error('Error when getting calculated decision on claimant proposed repayment plan');
      throw err;
    }
  }
  async getFeePaymentRedirectInformation(claimId: string, feeType: string,  req: AppRequest): Promise<PaymentInformation> {
    const config = this.getConfig(req);
    try {
      const response = await this.client.post(CIVIL_SERVICE_FEES_PAYMENT_URL.replace(':feeType', feeType).replace(':claimId', claimId),'', config);
      return plainToInstance(PaymentInformation, response.data);
    } catch (err: unknown) {
      logger.error('Error when getting fee payment redirect information');
      throw err;
    }
  }

  async getFeePaymentStatus(claimId: string, paymentReference: string, feeType: string,  req: AppRequest): Promise<PaymentInformation> {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.get(CIVIL_SERVICE_FEES_PAYMENT_STATUS_URL.replace(':claimId', claimId).replace(':feeType', feeType).replace(':paymentReference', paymentReference), config);

      return plainToInstance(PaymentInformation, response.data);
    } catch (err: unknown) {
      logger.error('Error when getting fee payment status');
      throw err;
    }
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

  async retrieveNotification(claimId: string,role: string,  req: AppRequest): Promise<DashboardNotificationList>  {
    const config = this.getConfig(req);
    const response = await this.client.get(CIVIL_SERVICE_NOTIFICATION_LIST_URL.replace(':ccd-case-identifier', claimId).replace(':role-type', role), config);
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

  async retrieveDashboard(claimId: string,role: string,  req: AppRequest): Promise<Dashboard>  {
    const config = this.getConfig(req);
    const response = await this.client.get(CIVIL_SERVICE_DASHBOARD_TASKLIST_URL.replace(':ccd-case-identifier', claimId).replace(':role-type', role), config);
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
    const config = this.getConfig(req);
    try {
      const redisKey = req?.session?.user?.id;
      const scenarioRef = 'Scenario.AAA6.ClaimIssue.ClaimSubmit.Required';
      await this.client.post(CIVIL_SERVICE_CREATE_SCENARIO_DASHBOARD_URL.replace(':scenarioRef', scenarioRef).replace(':redisKey', redisKey), {params: new Map()},config);
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }

  async recordClick(id: string, req: AppRequest): Promise<void> {
    const config = this.getConfig(req);
    try {
      await this.client.put(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', id), null, config);
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }
  async updateTaskStatus(taskId: string, req: AppRequest): Promise<void> {
    const config = this.getConfig(req);
    try {
      await this.client.put(CIVIL_SERVICE_UPDATE_TASK_STATUS_URL.replace(':taskItemId', taskId), null, config);
    } catch (err: unknown) {
      logger.error(err);
      throw err;
    }
  }
}
