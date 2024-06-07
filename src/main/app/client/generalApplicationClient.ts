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
      return [mock1, mock2]
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
  'id': '1716993568476294', 
  'createdDate': '2024-05-29T14:39:28.483971', 
  'state': 'APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION', 
  'applicationTypes': 'Adjourn a hearing', 
};

const mock2 = {
  'id': '1716993568476294', 
  'createdDate': '2024-05-29T14:39:28.483971', 
  'state': 'APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION', 
  'applicationTypes': 'Adjourn a hearing', 
};

// const mock = {
//   "isMultiParty": "No",
//   "locationName": "County Court Money Claims Centre",
//   "generalAppType": {
//     "types": [
//       "ADJOURN_HEARING",
//       "EXTEND_TIME"
//     ]
//   },
//   "businessProcess": {
//     "status": "FINISHED",
//     "camundaEvent": "INITIATE_GENERAL_APPLICATION"
//   },
//   "isCcmccLocation": "Yes",
//   "applicationTypes": "Adjourn a hearing",
//   "isGaApplicantLip": "Yes",
//   "isDocumentVisible": "Yes",
//   "CaseAccessCategory": "SPEC_CLAIM",
//   "claimant1PartyName": "Mr Claimant person",
//   "defendant1PartyName": "mr defendant person",
//   "parentCaseReference": "1717675354750680",
//   "generalAppPBADetails": {
//     "fee": {
//       "code": "FEE0443",
//       "version": "2",
//       "calculatedAmountInPence": "10800"
//     },
//     "serviceRequestReference": "2022-1655915218557"
//   },
//   "isGaRespondentOneLip": "Yes",
//   "isGaRespondentTwoLip": "No",
//   "civilServiceUserRoles": {
//     "id": "74ad03f0-8bf5-4a87-90b3-f299652d01fc",
//     "email": "civilmoneyclaimsdemo@gmail.com"
//   },
//   "caseManagementCategory": {
//     "value": {
//       "code": "Civil",
//       "label": "Civil"
//     },
//     "list_items": [
//       {
//         "id": "ec8c9fbf-59c5-4842-909f-1a49ebe471c0",
//         "value": {
//           "code": "Civil",
//           "label": "Civil"
//         }
//       }
//     ]
//   },
//   "caseManagementLocation": {
//     "region": "4",
//     "address": "88 Alfred Street, RandonCity",
//     "postcode": "AA5 4RR",
//     "siteName": "County Court Money Claims Centre",
//     "baseLocation": "992288"
//   },
//   "gaApplicantDisplayName": "null - Defendant",
//   "generalAppConsentOrder": "No",
//   "generalAppApplnSolicitor": {
//     "id": "74ad03f0-8bf5-4a87-90b3-f299652d01fc",
//     "email": "civilmoneyclaimsdemo@gmail.com",
//     "surname": "Citizen",
//     "forename": "civilmoneyclaimsdemo@gmail.com"
//   },
//   "generalAppDetailsOfOrder": "The hearing arranged for [enter date] be moved to the first available date after [enter date], avoiding [enter dates to avoid].",
//   "generalAppHearingDetails": {
//     "HearingDetailsEmailID": "civilmoneyclaimsdemo@gmail.com",
//     "HearingPreferredLocation": {
//       "value": {
//         "code": "aaddfb55-cd28-40f0-8a63-19900ce9b88c",
//         "label": "Central London County Court - THOMAS MORE BUILDING, ROYAL COURTS OF JUSTICE, STRAND, LONDON - WC2A 2LL"
//       },
//       "list_items": [
//         {
//           "code": "aaddfb55-cd28-40f0-8a63-19900ce9b88c",
//           "label": "Central London County Court - THOMAS MORE BUILDING, ROYAL COURTS OF JUSTICE, STRAND, LONDON - WC2A 2LL"
//         }
//       ]
//     },
//     "HearingDetailsTelephoneNumber": "01632960001",
//     "ReasonForPreferredHearingType": "asdf",
//     "HearingPreferencesPreferredType": "IN_PERSON",
//     "unavailableTrialRequiredYesOrNo": "No"
//   },
//   "generalAppParentCaseLink": {
//     "CaseReference": "1717675354750680"
//   },
//   "generalAppReasonsOfOrder": "asdf",
//   "generalAppSuperClaimType": "SPEC_CLAIM",
//   "parentClaimantIsApplicant": "No",
//   "generalAppInformOtherParty": {
//     "isWithNotice": "Yes"
//   },
//   "generalAppStatementOfTruth": {
//     "name": "pablo"
//   },
//   "applicant1OrganisationPolicy": {
//     "OrgPolicyCaseAssignedRole": "[APPLICANTSOLICITORONE]"
//   },
//   "generalAppRespondentAgreement": {
//     "hasAgreed": "Yes"
//   },
//   "generalAppNotificationDeadlineDate": "2024-06-12T16:00:00"
// };

// const mock2 = {
// 	"isMultiParty": "No",
// 	"locationName": "County Court Money Claims Centre",
// 	"generalAppType": {
// 		"types": [
// 			"EXTEND_TIME"
// 		]
// 	},
// 	"businessProcess": {
// 		"status": "FINISHED",
// 		"camundaEvent": "INITIATE_GENERAL_APPLICATION"
// 	},
// 	"isCcmccLocation": "Yes",
// 	"applicationTypes": "Extend time",
// 	"isGaApplicantLip": "Yes",
// 	"isDocumentVisible": "Yes",
// 	"CaseAccessCategory": "SPEC_CLAIM",
// 	"applicantPartyName": "lipf lipl",
// 	"claimant1PartyName": "org",
// 	"defendant1PartyName": "lipf lipl",
// 	"parentCaseReference": "1716900200663759",
// 	"generalAppPBADetails": {
// 		"fee": {
// 			"code": "FEE0443",
// 			"version": "2",
// 			"calculatedAmountInPence": "10800"
// 		},
// 		"serviceRequestReference": "2022-1655915218557"
// 	},
// 	"isGaRespondentOneLip": "No",
// 	"isGaRespondentTwoLip": "No",
// 	"civilServiceUserRoles": {
// 		"id": "39dce7c1-c9d6-49eb-aa57-b7322461e146",
// 		"email": "civilmoneyclaimsdemo@gmail.com"
// 	},
// 	"caseManagementCategory": {
// 		"value": {
// 			"code": "Civil",
// 			"label": "Civil"
// 		},
// 		"list_items": [
// 			{
// 				"id": "736a21c3-8c71-4e76-a441-05322b12f7f5",
// 				"value": {
// 					"code": "Civil",
// 					"label": "Civil"
// 				}
// 			}
// 		]
// 	},
// 	"caseManagementLocation": {
// 		"region": "4",
// 		"address": "88 Alfred Street, RandonCity",
// 		"postcode": "AA5 4RR",
// 		"siteName": "County Court Money Claims Centre",
// 		"baseLocation": "992288"
// 	},
// 	"gaApplicantDisplayName": "lipf lipl - Defendant",
// 	"generalAppConsentOrder": "No",
// 	"generalAppApplnSolicitor": {
// 		"id": "39dce7c1-c9d6-49eb-aa57-b7322461e146",
// 		"email": "civilmoneyclaimsdemo@gmail.com",
// 		"surname": "Citizen",
// 		"forename": "civilmoneyclaimsdemo@gmail.com"
// 	},
// 	"generalAppDetailsOfOrder": "test",
// 	"generalAppHearingDetails": {
// 		"SupportRequirement": [
// 			"LANGUAGE_INTERPRETER"
// 		],
// 		"HearingDetailsEmailID": "a@b.com",
// 		"HearingPreferredLocation": {
// 			"value": {
// 				"code": "f8e66ca0-df59-4ef2-8a9b-0ffe05c57aa9",
// 				"label": "Barnet Civil and Family Centre - St Mary's Court, Regents Park Road - N3 1BQ"
// 			},
// 			"list_items": [
// 				{
// 					"code": "f8e66ca0-df59-4ef2-8a9b-0ffe05c57aa9",
// 					"label": "Barnet Civil and Family Centre - St Mary's Court, Regents Park Road - N3 1BQ"
// 				}
// 			]
// 		},
// 		"generalAppUnavailableDates": [
// 			{
// 				"id": "5cc89b8e-4690-466f-8f49-73beb0995a4f",
// 				"value": {
// 					"unavailableTrialDateFrom": "2024-07-01"
// 				}
// 			},
// 			{
// 				"id": "134df13d-7bb3-4659-b425-10867229e38d",
// 				"value": {
// 					"unavailableTrialDateTo": "2024-07-08",
// 					"unavailableTrialDateFrom": "2024-07-05"
// 				}
// 			}
// 		],
// 		"HearingDetailsTelephoneNumber": "01234123123",
// 		"ReasonForPreferredHearingType": "test",
// 		"HearingPreferencesPreferredType": "VIDEO",
// 		"unavailableTrialRequiredYesOrNo": "Yes",
// 		"SupportRequirementLanguageInterpreter": "Spanish"
// 	},
// 	"generalAppParentCaseLink": {
// 		"CaseReference": "1716900200663759"
// 	},
// 	"generalAppReasonsOfOrder": "test",
// 	"generalAppSuperClaimType": "SPEC_CLAIM",
// 	"parentClaimantIsApplicant": "No",
// 	"generalAppInformOtherParty": {
// 		"isWithNotice": "Yes"
// 	},
// 	"generalAppStatementOfTruth": {
// 		"name": "Paul Pearson"
// 	},
// 	"applicant1OrganisationPolicy": {
// 		"OrgPolicyCaseAssignedRole": "[APPLICANTSOLICITORONE]"
// 	},
// 	"generalAppRespondentAgreement": {
// 		"hasAgreed": "Yes"
// 	},
// 	"generalAppRespondentSolicitors": [
// 		{
// 			"id": "3e247e2b-9f7d-48df-af42-0ba1a72e2786",
// 			"value": {
// 				"id": "dd2416f8-2029-4f5c-970b-1a2cf1678de3",
// 				"email": "hmcts.civil+organisation.1.solicitor.1@gmail.com",
// 				"organisationIdentifier": "Q1KOKP2"
// 			}
// 		}
// 	],
// 	"generalAppNotificationDeadlineDate": "2024-06-12T16:00:00"
// };
