import {PactV3, SpecificationVersion} from '@pact-foundation/pact';
import {CivilServiceClient} from 'client/civilServiceClient';
import {GaServiceClient} from 'client/gaServiceClient';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {Application} from 'models/application';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {ApplicationEvent} from 'models/gaEvents/applicationEvent';
import {CaseEvent} from 'models/events/caseEvent';
import {YesNo} from 'form/models/yesNo';
import {HearingArrangement, HearingTypeOptions} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {QualifiedStatementOfTruth} from 'models/generalApplication/QualifiedStatementOfTruth';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {AcceptDefendantOffer, ProposedPaymentPlanOption} from 'models/generalApplication/response/acceptDefendantOffer';
import {RespondentAgreement} from 'models/generalApplication/response/respondentAgreement';
import {translateDraftApplicationToCCD, translateCoScApplicationToCCD, toCcdGeneralApplicationWithResponse} from 'services/translation/generalApplication/ccdTranslation';
import {translateCUItoCCD} from 'services/features/generalApplication/documentUpload/uploadDocumentsService';
import {prepareCCDData} from 'services/features/generalApplication/additionalDocumentService';
import {debtPaymentOptions} from 'models/generalApplication/debtPaymentOptions';
import {PACT_DIRECTORY_PATH} from '../utils';

jest.mock('uuid', () => ({...jest.requireActual('uuid'), v4: jest.fn()}));
// Translation imports a draft-store service that normally loads the full app.
jest.mock('../../../main/app', () => ({app: {locals: {}}}));

const CLAIM_ID = '1111222233334444';
const APPLICATION_ID = '2222333344445555';
const SECOND_APPLICATION_ID = '3333444455556666';
const USER_ID = 'cui-user-id';
const ACCESS_TOKEN = 'some-access-token';
const headers = {Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json'};
const request = () => ({params: {id: CLAIM_ID, appId: APPLICATION_ID}, locals: {},
  session: {user: {id: USER_ID, accessToken: ACCESS_TOKEN}}} as unknown as AppRequest);
const provider = () => new PactV3({consumer: 'civil_citizen_ui', provider: 'civil_service',
  spec: SpecificationVersion.SPECIFICATION_VERSION_V4, dir: PACT_DIRECTORY_PATH, logLevel: 'warn'});
const responseDetails = (caseData: object) => ({id: Number(CLAIM_ID), state: 'CASE_PROGRESSION',
  last_modified: '2025-05-01T10:00:00', case_data: caseData});
const documentLink = {document_url: 'http://dm-store/documents/ga-doc-1',
  document_binary_url: 'http://dm-store/documents/ga-doc-1/binary', document_filename: 'hearing-evidence.pdf', category_id: 'evidence'};
const uploadedFile = {caseDocument: {documentName: 'hearing-evidence.pdf', documentLink}};

const ordinaryApplication = (): GeneralApplication => Object.assign(new GeneralApplication(), {
  applicationTypes: [new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING)],
  agreementFromOtherParty: YesNo.YES,
  informOtherParties: {option: YesNo.NO, reasonForCourtNotInformingOtherParties: 'Urgent hearing date'},
  applicationCosts: YesNo.YES,
  orderJudges: [{text: 'Move the hearing to a later date'}],
  requestingReasons: [{text: 'The parties need additional preparation time'}],
  wantToUploadDocuments: YesNo.YES,
  uploadEvidenceForApplication: [uploadedFile],
  hearingArrangement: new HearingArrangement(HearingTypeOptions.TELEPHONE, 'The witness cannot travel', 'Leeds'),
  hearingContactDetails: new HearingContactDetails('07123456789', 'applicant@example.com'),
  statementOfTruth: new QualifiedStatementOfTruth(true, 'Alex Applicant', 'Claimant'),
});

const coscApplication = (): GeneralApplication => Object.assign(new GeneralApplication(), {
  applicationTypes: [new ApplicationType(ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID)],
  agreementFromOtherParty: YesNo.NO,
  informOtherParties: {option: YesNo.NO, reasonForCourtNotInformingOtherParties: 'DummyVal'},
  certificateOfSatisfactionOrCancellation: {
    defendantFinalPaymentDate: {date: '2025-04-15'},
    debtPaymentEvidence: {debtPaymentOption: debtPaymentOptions.MADE_FULL_PAYMENT_TO_COURT},
  },
  uploadEvidenceForApplication: [uploadedFile],
  statementOfTruth: new QualifiedStatementOfTruth(true, 'Alex Applicant', 'Claimant'),
});

describe('Civil Service General Application contracts', () => {
  test.each([
    ['ordinary', ApplicationEvent.RESPOND_TO_APPLICATION],
    ['urgent', ApplicationEvent.RESPOND_TO_APPLICATION_URGENT_LIP],
  ])('submits a translated %s GA response using the matching event', async (_variant, event) => {
    const response = Object.assign(new GaResponse(), {
      hearingArrangement: new HearingArrangement(HearingTypeOptions.TELEPHONE, 'A remote hearing is needed', 'Leeds'),
      hearingContactDetails: new HearingContactDetails('07123456789', 'respondent@example.com'),
      agreeToOrder: YesNo.NO,
      respondentAgreement: new RespondentAgreement(YesNo.NO, 'The proposed order is not agreed'),
      acceptDefendantOffer: new AcceptDefendantOffer(YesNo.NO, ProposedPaymentPlanOption.ACCEPT_INSTALMENTS,
        '125.00', 'The offer should be paid monthly'),
      statementOfTruth: new QualifiedStatementOfTruth(true, 'Riley Respondent', 'Defendant'),
      wantToUploadDocuments: YesNo.YES,
      uploadEvidenceDocuments: [uploadedFile],
    });
    const translated = toCcdGeneralApplicationWithResponse(response);
    expect(translated).toMatchObject({
      hearingDetailsResp: {HearingPreferencesPreferredType: 'TELEPHONE', HearingDetailsTelephoneNumber: '07123456789'},
      gaRespondentDebtorOffer: {respondentDebtorOffer: 'DECLINE', paymentPlan: 'INSTALMENT', monthlyInstalment: '12500'},
      gaRespondentConsent: 'No', generalAppRespondReason: 'The proposed order is not agreed',
      generalAppResponseStatementOfTruth: {name: 'Riley Respondent', role: 'Defendant'},
      generalAppRespondDocument: [{value: {document_url: documentLink.document_url,
        document_binary_url: documentLink.document_binary_url, document_filename: documentLink.document_filename}}],
    });
    const pact = provider();
    pact.addInteraction({states: [{description: _variant === 'ordinary' ? 'An ordinary GA response can be submitted' : 'An urgent GA response can be submitted'}],
      uponReceiving: `a translated ${event} response`,
      withRequest: {method: 'POST', path: `/cases/${APPLICATION_ID}/ga/citizen/${USER_ID}/event`, headers,
        body: {event, caseDataUpdate: translated}}, willRespondWith: {status: 200}});
    await pact.executeTest(async server => {
      const client = new GaServiceClient(server.url);
      const result = event === ApplicationEvent.RESPOND_TO_APPLICATION_URGENT_LIP
        ? await client.submitRespondToApplicationEventForUrgent(APPLICATION_ID, translated, request())
        : await client.submitRespondToApplicationEvent(APPLICATION_ID, translated, request());
      // The current response converter intentionally returns an empty Application.
      expect(result).toBeInstanceOf(Application);
    });
  });

  test.each([
    ['ordinary', CaseEvent.INITIATE_GENERAL_APPLICATION, ordinaryApplication, translateDraftApplicationToCCD],
    ['COSC', CaseEvent.INITIATE_GENERAL_APPLICATION_COSC, coscApplication, translateCoScApplicationToCCD],
  ])('initiates a translated %s GA and consumes its parent-case link', async (_variant, event, makeApplication, translate) => {
    const application = makeApplication();
    const translated = translate(application);
    if (event === CaseEvent.INITIATE_GENERAL_APPLICATION) {
      expect(translated).toMatchObject({generalAppType: {types: ['ADJOURN_HEARING']},
        generalAppRespondentAgreement: {hasAgreed: 'Yes'},
        generalAppDetailsOfOrderColl: [{value: 'Move the hearing to a later date'}],
        generalAppReasonsOfOrderColl: [{value: 'The parties need additional preparation time'}],
        generalAppEvidenceDocument: [{value: {document_url: documentLink.document_url}}],
        generalAppInformOtherParty: {isWithNotice: 'No', reasonsForWithoutNotice: 'Urgent hearing date'},
        generalAppHearingDetails: {HearingPreferencesPreferredType: 'TELEPHONE', HearingDetailsEmailID: 'applicant@example.com'},
        generalAppStatementOfTruth: {name: 'Alex Applicant', role: 'Claimant'}});
    } else {
      expect(translated).toMatchObject({generalAppType: {types: ['CONFIRM_CCJ_DEBT_PAID']},
        generalAppRespondentAgreement: {hasAgreed: 'No'}, certOfSC: {defendantFinalPaymentDate: '2025-04-15', debtPaymentEvidence: {debtPaymentOption: 'MADE_FULL_PAYMENT_TO_COURT'}},
        generalAppEvidenceDocument: [{value: {document_url: documentLink.document_url}}],
        generalAppStatementOfTruth: {name: 'Alex Applicant', role: 'Claimant'}});
    }
    const responseData = {generalApplications: [{id: APPLICATION_ID, value: {
      caseLink: {CaseReference: CLAIM_ID}, generalAppSubmittedDateGAspec: '2025-05-01', parentClaimantIsApplicant: 'Yes',
    }}]};
    const pact = provider();
    pact.addInteraction({states: [{description: _variant === 'ordinary' ? 'An ordinary GA can be initiated' : 'A COSC GA can be initiated'}],
      uponReceiving: `a translated ${event} application`,
      withRequest: {method: 'POST', path: `/cases/${CLAIM_ID}/citizen/${USER_ID}/event`, headers,
        body: {event, caseDataUpdate: translated}},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: responseDetails(responseData)}});
    await pact.executeTest(async server => {
      const client = new CivilServiceClient(server.url);
      const claim = event === CaseEvent.INITIATE_GENERAL_APPLICATION_COSC
        ? await client.submitInitiateGeneralApplicationEventForCosc(CLAIM_ID, translated, request())
        : await client.submitInitiateGeneralApplicationEvent(CLAIM_ID, translated, request());
      expect(claim).toBeInstanceOf(Claim);
      expect(claim.generalApplications).toMatchObject([{id: APPLICATION_ID, value: {
        caseLink: {CaseReference: CLAIM_ID}, generalAppSubmittedDateGAspec: '2025-05-01', parentClaimantIsApplicant: 'yes',
      }}]);
    });
  });

  test('retrieves a GA case with the response, fee and parent link fields used by CUI', async () => {
    const caseData = {applicationTypes: 'ADJOURN_HEARING', generalAppType: {types: ['ADJOURN_HEARING']},
      applicationFeeAmountInPence: '27500', generalAppRespondentDebtorOffer: {respondentDebtorOffer: 'DECLINE', monthlyInstalment: '12500'},
      caseLink: {CaseReference: CLAIM_ID}, gaAddlDoc: [{id: 'document-1', value: {document_url: documentLink.document_url,
        document_binary_url: documentLink.document_binary_url, document_filename: documentLink.document_filename}}]};
    const pact = provider();
    pact.addInteraction({states: [{description: 'A General Application case exists'}], uponReceiving: 'a request for a GA case by id',
      withRequest: {method: 'GET', path: `/cases/${APPLICATION_ID}`, headers},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: {
        id: Number(APPLICATION_ID), state: 'AWAITING_RESPONDENT_RESPONSE', created_date: '2025-04-28T09:00:00',
        last_modified: '2025-05-01T10:00:00', case_data: caseData,
      }}});
    await pact.executeTest(async server => {
      const result = await new GaServiceClient(server.url).getApplication(request(), APPLICATION_ID);
      expect(result).toMatchObject({id: Number(APPLICATION_ID), state: 'AWAITING_RESPONDENT_RESPONSE',
        created_date: '2025-04-28T09:00:00', last_modified: '2025-05-01T10:00:00',
        case_data: {applicationFeeAmountInPence: '27500', generalAppType: {types: ['ADJOURN_HEARING']},
          caseLink: {CaseReference: CLAIM_ID}, generalAppRespondentDebtorOffer: {monthlyInstalment: '12500'}}});
    });
  });

  test.each([
    ['populated', [{id: Number(SECOND_APPLICATION_ID), state: 'APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION', created_date: '2025-04-30T09:00:00',
      last_modified: '2025-05-02T10:00:00', case_data: {generalAppType: {types: ['SETTLE_BY_CONSENT']}, applicationFeeAmountInPence: '10000', caseLink: {CaseReference: CLAIM_ID}}},
    {id: Number(APPLICATION_ID), state: 'AWAITING_RESPONDENT_RESPONSE', created_date: '2025-04-28T09:00:00',
      last_modified: '2025-05-01T10:00:00', case_data: {generalAppType: {types: ['ADJOURN_HEARING']}, applicationFeeAmountInPence: '27500', caseLink: {CaseReference: CLAIM_ID}}}]],
    ['empty', []],
  ])('retrieves a %s GA list by parent claim and sorts applications by creation date', async (_variant, cases) => {
    const pact = provider();
    pact.addInteraction({states: [{description: `General Applications for parent case are ${_variant}`}],
      uponReceiving: `a parent-case General Application list request with ${_variant} results`,
      withRequest: {method: 'GET', path: `/cases/${CLAIM_ID}/ga/applications`, headers},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: {cases}}});
    await pact.executeTest(async server => {
      const result = await new GaServiceClient(server.url).getApplicationsByCaseId(CLAIM_ID, request());
      if (_variant === 'empty') expect(result).toEqual([]);
      else expect(result.map(application => application.id)).toEqual([Number(APPLICATION_ID), Number(SECOND_APPLICATION_ID)]);
    });
  });

  test.each([
    ['additional documents', ApplicationEvent.UPLOAD_ADDL_DOCUMENTS, 'uploadDocument', true, 'additional documents can be submitted to a General Application'],
    ['judge directions', ApplicationEvent.RESPOND_TO_JUDGE_DIRECTIONS, 'generalAppDirOrderUpload', false, 'judge directions documents can be submitted to a General Application'],
    ['judge additional information', ApplicationEvent.RESPOND_TO_JUDGE_ADDITIONAL_INFO, 'generalAppAddlnInfoUpload', false, 'judge additional information documents can be submitted to a General Application'],
    ['judge written representation', ApplicationEvent.RESPOND_TO_JUDGE_WRITTEN_REPRESENTATION, 'generalAppWrittenRepUpload', false, 'judge written representation documents can be submitted to a General Application'],
  ])('submits the translated GA %s collection', async (_name, event, collection, additional, providerState) => {
    const document = additional ? {typeOfDocument: 'Hearing evidence', caseDocument: uploadedFile.caseDocument}
      : uploadedFile;
    // This is the deterministic wire shape emitted by prepareCCDData in the
    // additional-documents controller; the other three events use its shared
    // production translateCUItoCCD mapper directly.
    const uuid = require('uuid').v4 as jest.Mock;
    uuid.mockReturnValue('10000000-0000-4000-8000-000000000001');
    const payload = additional
      ? prepareCCDData([Object.assign(document, {caseDocument: uploadedFile.caseDocument})] as any)
      : translateCUItoCCD([document as any]);
    const updates = {[collection]: payload, ...(event === ApplicationEvent.RESPOND_TO_JUDGE_ADDITIONAL_INFO ? {generalAppAddlnInfoText: 'Please review this document'} : {})};
    expect(payload[0]).toMatchObject({value: additional ? {typeOfDocument: 'Hearing evidence', documentUpload: {
      document_url: documentLink.document_url, document_binary_url: documentLink.document_binary_url, document_filename: documentLink.document_filename,
    }} : {document_url: documentLink.document_url, document_binary_url: documentLink.document_binary_url, document_filename: documentLink.document_filename}});
    const pact = provider();
    pact.addInteraction({states: [{description: providerState}],
      uponReceiving: `a ${event} document submission`,
      withRequest: {method: 'POST', path: `/cases/${APPLICATION_ID}/ga/citizen/${USER_ID}/event`, headers,
        body: {event, caseDataUpdate: updates}}, willRespondWith: {status: 200}});
    await pact.executeTest(async server => {
      const result = await new GaServiceClient(server.url).submitEvent(event, APPLICATION_ID, updates as any, request());
      expect(result).toBeInstanceOf(Application);
    });
  });
});
