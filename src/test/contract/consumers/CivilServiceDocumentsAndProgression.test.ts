import {PactV3, SpecificationVersion} from '@pact-foundation/pact';
import {mkdtempSync, writeFileSync, unlinkSync, rmdirSync} from 'fs';
import {join, resolve} from 'path';
import {tmpdir} from 'os';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {FileUpload} from 'models/caseProgression/fileUpload';
import {CaseDocument} from 'models/document/caseDocument';
import {FileResponse} from 'models/FileResponse';
import {CaseEvent} from 'models/events/caseEvent';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {UploadDocuments, UploadDocumentTypes, UploadEvidenceWitness} from 'models/caseProgression/uploadDocumentsType';
import {EvidenceUploadWitness} from 'models/document/documentType';
import {CaseRole} from 'form/models/caseRoles';
import {YesNo} from 'form/models/yesNo';
import {translateDraftTrialArrangementsToCCD} from 'services/translation/caseProgression/trialArrangements/convertToCCDTrialArrangements';
import {translateDraftRequestForReconsiderationToCCD} from 'services/translation/caseProgression/requestForReconsideration/convertToCCDRequestForReconsideration';
import {toCCDEvidenceUpload} from 'services/translation/caseProgression/convertToCCDEvidenceUpload';
import {mapperMediationDocumentToCCDDocuments} from 'models/mediation/uploadDocuments/mapperCaseDocumentToCCDDocuments';
import {MediationDocumentsReferred, MediationUploadDocumentsCCD} from 'models/mediation/uploadDocuments/uploadDocumentsCCD';
import {PACT_DIRECTORY_PATH} from '../utils';

const CASE_ID = '1111222233334444';
const headers = {Authorization: 'Bearer some-access-token', 'Content-Type': 'application/json'};
const request = {params: {id: CASE_ID}, session: {user: {id: 'cui-user-id', accessToken: 'some-access-token'}}, locals: {}} as unknown as AppRequest;
const caseDocument: CaseDocument = {
  documentLink: {document_url: 'https://documents.example.test/documents/evidence-001',
    document_binary_url: 'https://documents.example.test/documents/evidence-001/binary', document_filename: 'evidence.txt'},
  documentName: 'evidence.txt', documentType: null, documentSize: 63,
  createdDatetime: new Date('2025-04-01T09:30:00.000Z'), createdBy: 'citizen',
};
const response = (data: object) => ({id: Number(CASE_ID), state: 'CASE_PROGRESSION',
  last_modified: '2025-05-01T10:00:00', case_data: data});

const newPact = () => new PactV3({consumer: 'civil_citizen_ui', provider: 'civil_service',
  spec: SpecificationVersion.SPECIFICATION_VERSION_V4, dir: PACT_DIRECTORY_PATH, logLevel: 'warn'});

const exerciseEvent = async (event: CaseEvent, payload: object, description: string, state: string) => {
  const provider = newPact();
  provider.addInteraction({states: [{description: state}], uponReceiving: description,
    withRequest: {method: 'POST', path: `/cases/${CASE_ID}/citizen/cui-user-id/event`, headers,
      body: {event, caseDataUpdate: payload}},
    willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: response(payload)}});
  await provider.executeTest(async server => {
    const client = new CivilServiceClient(server.url);
    const claim = await client.submitEvent(event, CASE_ID, payload, request);
    expect(claim).toBeInstanceOf(Claim);
    expect(claim).toMatchObject({id: CASE_ID, ccdState: 'CASE_PROGRESSION',
      lastModifiedDate: '2025-05-01T10:00:00'});
  });
};

describe('Civil Service document and case progression contracts', () => {
  test('uploads a document as a multipart file and converts the binary JSON response', async () => {
    const provider = newPact();
    const fixtureDirectory = mkdtempSync(join(tmpdir(), 'cui-document-contract-'));
    const fixture = join(fixtureDirectory, 'evidence.bin');
    const bytes = Buffer.from([0, 1, 2, 3, 255]);
    const responseFile = resolve(process.cwd(), 'src/test/contract/fixtures/document-upload-response.json');
    writeFileSync(fixture, bytes);
    try {
      provider.given('A synthetic citizen document can be uploaded')
        .uponReceiving('a multipart citizen document upload')
        .withRequestMultipartFileUpload({method: 'POST', path: '/case/document/generateAnyDoc',
          headers: {Authorization: 'Bearer some-access-token'}}, 'application/octet-stream', fixture, 'file')
        .willRespondWith({status: 201, headers: {'Content-Type': 'application/json'}})
        .withResponseBinaryFile({status: 201, headers: {'Content-Type': 'application/json'}}, 'application/json', responseFile);

      await provider.executeTest(async server => {
        const client = new CivilServiceClient(server.url, true);
        const file: FileUpload = {fieldname: 'file', originalname: 'evidence.bin', mimetype: 'application/octet-stream', buffer: bytes, size: bytes.length};
        const uploaded = await client.uploadDocument(request, file);
        expect(uploaded).toMatchObject({documentName: 'evidence.bin', documentSize: 5,
          documentLink: {document_url: caseDocument.documentLink.document_url,
            document_binary_url: caseDocument.documentLink.document_binary_url,
            document_filename: 'evidence.bin'}});
      });
    } finally {
      unlinkSync(fixture);
      rmdirSync(fixtureDirectory);
    }
  });

  test('downloads the binary document and preserves provider headers', async () => {
    const provider = newPact();
    const fixture = resolve(process.cwd(), 'src/test/contract/fixtures/document-contract.txt');
    provider.given('A synthetic document exists for download')
      .uponReceiving('a document download by identifier')
      .withRequest({method: 'GET', path: '/case/document/downloadDocument/document-001',
        headers: {Authorization: 'Bearer some-access-token', 'Content-Type': 'application/json'}})
      .withResponseBinaryFile({status: 200, headers: {'Content-Type': 'text/plain', 'original-file-name': 'evidence.txt'}}, 'text/plain', fixture);
    await provider.executeTest(async server => {
      const client = new CivilServiceClient(server.url, true);
      const downloaded: FileResponse = await client.retrieveDocument(request, 'document-001');
      expect(downloaded).toBeInstanceOf(FileResponse);
      expect(downloaded.contentType).toBe('text/plain');
      expect(downloaded.fileName).toBe('evidence.txt');
      expect(downloaded.data.toString()).toBe('Synthetic CUI document contract bytes; no personal or case data.\n');
    });
  });

  test('propagates the provider missing-document response', async () => {
    const provider = newPact();
    provider.addInteraction({states: [{description: 'The requested document does not exist'}],
      uponReceiving: 'a request to download a missing document',
      withRequest: {method: 'GET', path: '/case/document/downloadDocument/missing-document',
        headers: {Authorization: 'Bearer some-access-token'}},
      willRespondWith: {status: 404, headers: {'Content-Type': 'text/plain;charset=ISO-8859-1'},
        body: 'Document missing-document could not be found in document management.'}});
    await provider.executeTest(async server => {
      const client = new CivilServiceClient(server.url, true);
      await expect(client.retrieveDocument(request, 'missing-document')).rejects.toMatchObject({response: {status: 404}});
    });
  });

  test.each([true, false])('submits translated evidence metadata for claimant=%s', async isClaimant => {
    const event = isClaimant ? CaseEvent.EVIDENCE_UPLOAD_APPLICANT : CaseEvent.EVIDENCE_UPLOAD_RESPONDENT;
    const document = caseDocument.documentLink;
    const upload = new UploadDocumentTypes(true,
      new UploadEvidenceWitness('Witness statement', new Date('2025-03-30T00:00:00.000Z'), document, new Date('2025-04-01T09:30:00.000Z')),
      EvidenceUploadWitness.WITNESS_STATEMENT, 'evidence-entry-001');
    const progression = new CaseProgression();
    if (isClaimant) progression.claimantUploadDocuments = new UploadDocuments(undefined, [upload]);
    else progression.defendantUploadDocuments = new UploadDocuments(undefined, [upload]);
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-04-01T09:30:00.000Z'));
    let payload;
    try {
      payload = toCCDEvidenceUpload(progression, {} as never, isClaimant);
    } finally {
      jest.useRealTimers();
    }
    expect(isClaimant ? payload.documentWitnessStatement : payload.documentWitnessStatementRes).toMatchObject([
      {id: 'evidence-entry-001', value: {witnessOptionName: 'Witness statement',
        witnessOptionDocument: document, witnessOptionUploadDate: new Date('2025-03-30T00:00:00.000Z')}}]);
    await exerciseEvent(event, payload, `a translated ${event} evidence event`, `A translated ${event} event can be submitted`);
  });

  test('submits translated mediation document metadata', async () => {
    const mappedDocument = mapperMediationDocumentToCCDDocuments(caseDocument, 'ClaimantOneMediationDocs');
    const collectionEntry = new MediationUploadDocumentsCCD();
    collectionEntry.id = 'mediation-entry-001';
    collectionEntry.value = new MediationDocumentsReferred(mappedDocument,
      new Date('2025-03-30T00:00:00.000Z'), 'Invoice', new Date('2025-04-01T09:30:00.000Z'));
    const payload = {app1MediationDocumentsReferred: [collectionEntry]};
    expect(payload.app1MediationDocumentsReferred[0].value.document).toEqual({
      category_id: 'ClaimantOneMediationDocs',
      document_url: caseDocument.documentLink.document_url,
      document_binary_url: caseDocument.documentLink.document_binary_url,
      document_filename: caseDocument.documentLink.document_filename,
    });
    await exerciseEvent(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, payload,
      'a CUI_UPLOAD_MEDIATION_DOCUMENTS event with a referred document',
      'A CUI mediation document submission can be made');
  });

  test('submits production translated trial readiness data using the TRIAL_READINESS wire event', async () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.CLAIMANT;
    claim.caseProgression = {claimantTrialArrangements: {isCaseReady: YesNo.YES,
      hasAnythingChanged: {option: YesNo.YES, textArea: 'A step-free hearing room is required.'},
      otherTrialInformation: 'Please list the witness first.'}} as never;
    const payload = translateDraftTrialArrangementsToCCD(claim);
    expect(payload).toEqual({trialReadyApplicant: 'Yes', applicantRevisedHearingRequirements: {
      revisedHearingRequirements: 'Yes', revisedHearingComments: 'A step-free hearing room is required.'},
    applicantHearingOtherComments: {hearingOtherComments: 'Please list the witness first.'}});
    await exerciseEvent(CaseEvent.TRIAL_ARRANGEMENTS, payload, 'a TRIAL_READINESS event',
      'A translated trial readiness response can be submitted');
  });

  test.each(['initial request', 'comments response'] as const)('submits the translated reconsideration %s', async variant => {
    const claim = new Claim();
    claim.caseRole = variant === 'initial request' ? CaseRole.DEFENDANT : CaseRole.CLAIMANT;
    claim.caseProgression = variant === 'initial request'
      ? {requestForReviewDefendant: {textArea: 'The decision should be reconsidered because the payment was recorded.'}} as never
      : {requestForReviewClaimant: {textArea: 'Please review the evidence filed after judgment.'}} as never;
    const payload = translateDraftRequestForReconsiderationToCCD(claim);
    expect(payload).toEqual(variant === 'initial request'
      ? {requestForReviewCommentsDefendant: 'The decision should be reconsidered because the payment was recorded.'}
      : {requestForReviewCommentsClaimant: 'Please review the evidence filed after judgment.'});
    const article = variant === 'initial request' ? 'an' : 'a';
    await exerciseEvent(CaseEvent.REQUEST_FOR_RECONSIDERATION, payload,
      `${article} ${variant} REQUEST_FOR_RECONSIDERATION event`,
      `A translated reconsideration ${variant} can be submitted`);
  });
});
