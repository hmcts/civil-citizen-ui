import Axios, {AxiosInstance} from 'axios';
import {AppRequest} from 'models/AppRequest';
// import {
//   CIVIL_GENERAL_APPLICATIONS_URL,
// } from './generalApplicationUrls';
// import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
// import {Application} from 'models/generalApplication/application';
// import { CaseState } from 'common/form/models/claimDetails';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('generalApplicationClient');

export class GeneralApplicationClient {
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

  getConfig(req: AppRequest) {
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.session?.user?.accessToken}`,
      },
    };
  }

  async getApplications(req: AppRequest): Promise<any[]> {
    // const config = this.getConfig(req);
    // let applications: ApplicationResponse[] = [];
    try {
      // const response = await this.client.post(CIVIL_GENERAL_APPLICATIONS_URL, {match_all: {}}, config);
      // applications = response.data?.cases?.map((application: ApplicationResponse) => {
      //   const caseData = Object.assign(new Application(), application.case_data);
      //   return new ApplicationResponse(application.id, caseData, application.state, application.last_modified);
      // });
      // return applications;
      return [test, mock1, mock2]
      // return [
      //   new ApplicationResponse('123', {legacyCaseReference: 'ABC'}, CaseState.CASE_ISSUED, new Date()),
      //   new ApplicationResponse('456', {legacyCaseReference: 'XYZ'}, CaseState.AWAITING_APPLICANT_INTENTION, new Date())
      // ]
    } catch (err) {
      logger.error('Error when getApplications');
      throw err;
    }
  }
}

const mock1 = {
  id: '123123123123123', 
  createdDate: '2024-05-29T14:39:28.483971', 
  state: 'AWAITING_RESPONDENT_RESPONSE', 
  data: {
    applicationTypes: 'Adjourn a hearing', 
  },
};

const mock2 = {
  id: '4564564564564564', 
  createdDate: '2024-05-29T14:39:28.483971', 
  state: 'AWAITING_APPLICATION_PAYMENT', 
  data:{
    applicationTypes: 'Adjourn a hearing', 
  },
};

const test = {
  id: 1716993568476294,
  jurisdiction: "CIVIL",
  caseTypeId: "GENERALAPPLICATION",
  createdDate: "2024-05-29T14:39:28.483971",
  lastModified: "2024-06-07T09:59:44.868006",
  state: "APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION",
  lockedBy: "null",
  securityLevel: "null",
  data: {
    generalAppUrgencyRequirement: { generalAppUrgency: "No" },
    generalAppNotificationDeadlineDate: "2024-06-03T16:00:00",
    civilServiceUserRoles: {
      id: "dd2416f8-2029-4f5c-970b-1a2cf1678de3",
      email: "hmcts.civil+organisation.1.solicitor.1@gmail.com",
    },
    generalAppHearingDate: {
      hearingScheduledDate: "2025-01-01",
      hearingScheduledPreferenceYesNo: "Yes",
    },
    generalAppStatementOfTruth: {
      name: "sd",
      role: "ds",
    },
    caseManagementLocation: {
      region: "4",
      address: "88 Alfred Street, RandonCity",
      postcode: "AA5 4RR",
      siteName: "County Court Money Claims Centre",
      baseLocation: "992288",
    },
    generalAppApplnSolicitor: {
      id: "dd2416f8-2029-4f5c-970b-1a2cf1678de3",
      email: "hmcts.civil+organisation.1.solicitor.1@gmail.com",
      surname: "Claimant-solicitor",
      forename: "hmcts.civil+organisation.1.solicitor.1@gmail.com",
      organisationIdentifier: "Q1KOKP2",
    },
    parentClaimantIsApplicant: "Yes",
    isGaApplicantLip: "No",
    caseManagementCategory: {
      value: { code: "Civil", label: "Civil" },
      list_items: [
        {
          id: "38ef1e46-5324-4d8b-a9f3-9dfe76de8bb2",
          value: { code: "Civil", label: "Civil" },
        },
      ],
    },
    CaseAccessCategory: "SPEC_CLAIM",
    parentCaseReference: "1716900200663759",
    generalAppRespondentSolicitors: [
      {
        id: "a13e197e-6b5d-4a92-9910-a02c3794756a",
        value: {
          id: "39dce7c1-c9d6-49eb-aa57-b7322461e146",
          email: "civilmoneyclaimsdemo@gmail.com",
          surname: "lipl",
          forename: "lipf",
        },
      },
    ],
    isDocumentVisible: "Yes",
    generalAppParentCaseLink: { CaseReference: 1716900200663759 },
    generalAppRespondentAgreement: { hasAgreed: "Yes" },
    applicantPartyName: "org",
    generalAppConsentOrder: "No",
    generalAppSuperClaimType: "SPEC_CLAIM",
    generalAppPBADetails: {
      fee: { code: "FREE", version: 1, calculatedAmountInPence: 0 },
      paymentDetails: {
        status: "SUCCESS",
        reference: "FREE",
        customerReference: "FREE",
      },
      paymentSuccessfulDate: "2024-05-29T15:39:41.5588713",
      serviceRequestReference: "FREE",
    },
    generalAppDetailsOfOrder: "ds",
    isGaRespondentTwoLip: "No",
    locationName: "County Court Money Claims Centre",
    claimant1PartyName: "org",
    respondent1OrganisationPolicy: { OrgPolicyCaseAssignedRole: ["DEFENDANT"] },
    generalAppHearingDetails: {
      hearingYesorNo: "No",
      HearingDuration: "MINUTES_30",
      judgeRequiredYesOrNo: "No",
      trialRequiredYesOrNo: "No",
      HearingDetailsEmailID: "sd@do.com",
      HearingPreferredLocation: {
        value: {
          code: "20a1b82d-6883-4910-b83a-4d4e3771d9b3",
          label:
            "Barnet Civil and Family Centre - St Mary's Court, Regents Park Road - N3 1BQ",
        },
        list_items: [
          {
            code: "20a1b82d-6883-4910-b83a-4d4e3771d9b3",
            label:
              "Barnet Civil and Family Centre - St Mary's Court, Regents Park Road - N3 1BQ",
          },
        ],
      },
      HearingDetailsTelephoneNumber: 123,
      ReasonForPreferredHearingType: "ds",
      vulnerabilityQuestionsYesOrNo: "No",
      HearingPreferencesPreferredType: "VIDEO",
      unavailableTrialRequiredYesOrNo: "No",
    },
    isGaRespondentOneLip: "Yes",
    businessProcess: {
      status: "FINISHED",
      camundaEvent: "INITIATE_GENERAL_APPLICATION",
    },
    defendant1PartyName: "lipf lipl",
    generalAppInformOtherParty: { isWithNotice: "Yes" },
    generalAppType: { types: ["ADJOURN_HEARING"] },
    generalAppReasonsOfOrder: "sd",
    applicationTypes: "Adjourn a hearing",
    applicant1OrganisationPolicy: {
      Organisation: { OrganisationID: "Q1KOKP2" },
      OrgPolicyCaseAssignedRole: ["APPLICANTSOLICITORONE"],
    },
    isMultiParty: "No",
    isCcmccLocation: "Yes",
    gaApplicantDisplayName: "org - Claimant",
  },
  securityClassification: "PUBLIC",
  callbackResponseStatus: "null",
};
