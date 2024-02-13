import {getBundlesContent} from 'services/features/caseProgression/bundles/bundlesService';
import {Claim} from 'models/claim';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {Bundle} from 'models/caseProgression/bundles/bundle';
import {t} from 'i18next';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {UploadDocuments, UploadDocumentTypes, UploadEvidenceWitness} from 'models/caseProgression/uploadDocumentsType';
import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {UploadedEvidenceFormatter} from 'services/features/caseProgression/uploadedEvidenceFormatter';
import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {getMockDocument, getMockDocumentBinary} from '../../../../../utils/mockDocument';

jest.mock('i18next');
jest.mock('services/features/caseProgression/uploadedEvidenceFormatter');
const mockTranslate = t as jest.Mock;
const mockDocumentLink = UploadedEvidenceFormatter.getDocumentLink as jest.Mock;
const mockDocumentType = UploadedEvidenceFormatter.getDocumentTypeName as jest.Mock;
const lang = 'en';
const documentURL = 'document url';

mockTranslate.mockImplementation( (key: string[]) => {
  return key.toString();
});

mockDocumentLink.mockImplementation(() => {
  return documentURL;
});

mockDocumentType.mockImplementation( (documentType:  EvidenceUploadDisclosure | EvidenceUploadWitness | EvidenceUploadExpert | EvidenceUploadTrial) => {
  return documentType;
});

const title = 'Trial Bundle';
const bundleCreationDate = new Date('01-02-2023');
const uploadedBeforeBundleCreationDate = new Date('01-01-2023');
const uploadedAfterBundleCreationDate = new Date('01-03-2023');
const hearingDate = new Date('01-01-2022');

const document = getMockDocument();
const documentUrl = CASE_DOCUMENT_VIEW_URL.replace(':id', '1234').replace(':documentId', getMockDocumentBinary());
const documentUrlElement = `<a class="govuk-link" target="_blank" href="${documentUrl}">${document.document_filename}</a>`;

const bundle = new Bundle(title, document, bundleCreationDate, hearingDate);
const bundleWithoutDocument = new Bundle(title, null, bundleCreationDate, hearingDate);
const bundleWithoutCreatedOn = new Bundle(title, document, null, hearingDate);

const uploadedDisclosureDocumentType = EvidenceUploadDisclosure.DISCLOSURE_LIST;
const uploadedDisclosureCaseDocument = new UploadEvidenceWitness('witness', uploadedBeforeBundleCreationDate, document, uploadedBeforeBundleCreationDate);
const uploadedDisclosureEvidence = new UploadDocumentTypes(false, uploadedDisclosureCaseDocument, uploadedDisclosureDocumentType,null);

const uploadedWitnessDocumentType = EvidenceUploadWitness.WITNESS_STATEMENT;
const uploadedWitnessCaseDocument = new UploadEvidenceWitness('witness', uploadedBeforeBundleCreationDate, document, uploadedBeforeBundleCreationDate);
const uploadedWitnessEvidence = new UploadDocumentTypes(false, uploadedWitnessCaseDocument, uploadedWitnessDocumentType,null);

const uploadedExpertDocumentType = EvidenceUploadExpert.STATEMENT;
const uploadedExpertCaseDocument = new UploadEvidenceWitness('witness', uploadedBeforeBundleCreationDate, document, uploadedBeforeBundleCreationDate);
const uploadedExpertEvidence = new UploadDocumentTypes(false, uploadedExpertCaseDocument, uploadedExpertDocumentType,null);

const uploadedTrialDocumentType = EvidenceUploadTrial.SKELETON_ARGUMENT;
const uploadedTrialCaseDocument = new UploadEvidenceWitness('witness', uploadedBeforeBundleCreationDate, document, uploadedBeforeBundleCreationDate);
const uploadedTrialEvidence = new UploadDocumentTypes(false, uploadedTrialCaseDocument, uploadedTrialDocumentType,null);

let documentsUploadedAfter: UploadDocuments;

describe('getBundlesContent', () =>{

  const caseData = new Claim();
  caseData.id = '1234';
  caseData.caseProgression = new CaseProgression();

  beforeEach( () => {
    caseData.caseProgression.caseBundles = undefined;
    caseData.caseProgression.claimantLastUploadDate = undefined;
    caseData.caseProgression.claimantUploadDocuments = undefined;
    caseData.caseProgression.defendantLastUploadDate = undefined;
    caseData.caseProgression.defendantUploadDocuments = undefined;
    documentsUploadedAfter = {disclosure: [], witness: [], expert: [], trial: []} as UploadDocuments;
  });

  describe('getBundles', () => {
    it('bundle info should be displayed if bundles != 0', () => {
      //given
      const bundles = [] as Bundle[];

      bundles.push(bundle);
      bundles.push(bundle);
      caseData.caseProgression.caseBundles = bundles;

      //when
      const bundleTabActual = getBundlesContent(caseData, lang);

      //then
      checkForNonTableBundleData(bundleTabActual);
      checkForBundleTableHeaders(bundleTabActual);
      checkForBundleTableFirstRow(bundleTabActual);
      expect(bundleTabActual[0].contentSections[3].data.tableRows[1][0].html).toMatch(title);
      expect(bundleTabActual[0].contentSections[3].data.tableRows[1][1].html).toMatch(bundle.getFormattedCreatedOn);
      expect(bundleTabActual[0].contentSections[3].data.tableRows[1][2].html).toMatch(bundle.getFormattedHearingDate);
      expect(bundleTabActual[0].contentSections[3].data.tableRows[1][3].html).toMatch(documentUrlElement);
      expect(bundleTabActual[1]).toBeUndefined();
    });

    it('bundle lrow should not be displayed if bundle does not contain stitchedDocument', () => {
      //given
      const bundles = [] as Bundle[];
      bundles.push(bundle);
      bundles.push(bundleWithoutDocument);
      caseData.caseProgression.caseBundles = bundles;

      //when
      const bundleTabActual = getBundlesContent(caseData, lang);

      //then
      checkForNonTableBundleData(bundleTabActual);
      checkForBundleTableHeaders(bundleTabActual);
      checkForBundleTableFirstRow(bundleTabActual);
      expect(bundleTabActual[0].contentSections[3].data.tableRows[1]).toBeUndefined();
      expect(bundleTabActual[1]).toBeUndefined();
    });

    it('bundle row should not be displayed if bundle does not contain createdOn', () => {
      //given
      const bundles = [] as Bundle[];
      bundles.push(bundle);
      bundles.push(bundleWithoutCreatedOn);
      caseData.caseProgression.caseBundles = bundles;

      //when
      const bundleTabActual = getBundlesContent(caseData, lang);

      //then
      checkForNonTableBundleData(bundleTabActual);
      checkForBundleTableHeaders(bundleTabActual);
      checkForBundleTableFirstRow(bundleTabActual);
      expect(bundleTabActual[0].contentSections[3].data.tableRows[1]).toBeUndefined();
      expect(bundleTabActual[1]).toBeUndefined();
    });

    it('if no bundles, could show tab info with bundle missing', () => {
      //given
      const caseData = new Claim();
      caseData.caseProgression = new CaseProgression();

      //when
      const bundleTabActual = getBundlesContent(caseData, lang);

      //then
      checkForNonTableBundleData(bundleTabActual);
      expect(bundleTabActual[0].contentSections[3].data.tableRows).toBeNull();
      expect(bundleTabActual[1]).toBeUndefined();
    });
  });

  describe('getUploadedAfterBundle', () => {
    it('if claimant documents after bundle date, show those documents only', () => {
      const bundles = [] as Bundle[];
      bundles.push(bundle);
      caseData.caseProgression.caseBundles = bundles;
      uploadedDisclosureEvidence.caseDocument.createdDatetime = uploadedAfterBundleCreationDate;
      uploadedWitnessEvidence.caseDocument.createdDatetime = uploadedAfterBundleCreationDate;
      uploadedExpertEvidence.caseDocument.createdDatetime = uploadedBeforeBundleCreationDate;

      documentsUploadedAfter.disclosure.push(uploadedDisclosureEvidence);
      documentsUploadedAfter.witness.push(uploadedWitnessEvidence);
      documentsUploadedAfter.expert.push(uploadedExpertEvidence);
      caseData.caseProgression.claimantUploadDocuments = documentsUploadedAfter;
      caseData.caseProgression.claimantLastUploadDate = uploadedAfterBundleCreationDate;

      //when
      const bundleTabActual = getBundlesContent(caseData, lang);

      //then
      checkForNonTableBundleData(bundleTabActual);
      expect(bundleTabActual[1].contentSections[0].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.UPLOADED_AFTER_UPLOADED_DOCUMENTS_CLAIMANT');
      expect(bundleTabActual[1].contentSections[1].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.UPLOADED_AFTER_DOCUMENTS_BELOW');
      expect(bundleTabActual[1].contentSections[2].data.tableRows[0][0].html).toMatch(EvidenceUploadDisclosure.DISCLOSURE_LIST);
      expect(bundleTabActual[1].contentSections[2].data.tableRows[0][1].html).toMatch(uploadedDisclosureEvidence.createdDateTimeFormatted);
      expect(bundleTabActual[1].contentSections[2].data.tableRows[0][2].html).toMatch(documentURL);
      expect(bundleTabActual[1].contentSections[2].data.tableRows[1][0].html).toMatch(EvidenceUploadWitness.WITNESS_STATEMENT);
      expect(bundleTabActual[1].contentSections[2].data.tableRows[1][1].html).toMatch(uploadedWitnessEvidence.createdDateTimeFormatted);
      expect(bundleTabActual[1].contentSections[2].data.tableRows[1][2].html).toMatch(documentURL);
      expect(bundleTabActual[1].contentSections[2].data.tableRows[2]).toBeUndefined();
      expect(bundleTabActual[2]).toBeUndefined();
    });

    it('if defendant documents after bundle date, show those documents only', () => {
      const bundles = [] as Bundle[];
      bundles.push(bundle);
      caseData.caseProgression.caseBundles = bundles;

      uploadedWitnessEvidence.caseDocument.createdDatetime = uploadedBeforeBundleCreationDate;
      documentsUploadedAfter.witness.push(uploadedWitnessEvidence);

      uploadedExpertEvidence.caseDocument.createdDatetime = uploadedAfterBundleCreationDate;
      documentsUploadedAfter.expert.push(uploadedExpertEvidence);

      uploadedTrialEvidence.caseDocument.createdDatetime = uploadedAfterBundleCreationDate;
      documentsUploadedAfter.trial.push(uploadedTrialEvidence);

      caseData.caseProgression.defendantUploadDocuments = documentsUploadedAfter;
      caseData.caseProgression.defendantLastUploadDate = uploadedAfterBundleCreationDate;

      //when
      const bundleTabActual = getBundlesContent(caseData, lang);

      //then
      checkForNonTableBundleData(bundleTabActual);
      expect(bundleTabActual[1]).toBeUndefined();
      expect(bundleTabActual[2].contentSections[0].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.UPLOADED_AFTER_UPLOADED_DOCUMENTS_DEFENDANT');
      expect(bundleTabActual[2].contentSections[1].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.UPLOADED_AFTER_DOCUMENTS_BELOW');
      expect(bundleTabActual[2].contentSections[2].data.tableRows[0][0].html).toMatch(EvidenceUploadExpert.STATEMENT);
      expect(bundleTabActual[2].contentSections[2].data.tableRows[0][1].html).toMatch(uploadedExpertEvidence.createdDateTimeFormatted);
      expect(bundleTabActual[2].contentSections[2].data.tableRows[0][2].html).toMatch(documentURL);
      expect(bundleTabActual[2].contentSections[2].data.tableRows[1][0].html).toMatch(EvidenceUploadTrial.SKELETON_ARGUMENT);
      expect(bundleTabActual[2].contentSections[2].data.tableRows[1][1].html).toMatch(uploadedTrialEvidence.createdDateTimeFormatted);
      expect(bundleTabActual[2].contentSections[2].data.tableRows[1][2].html).toMatch(documentURL);
      expect(bundleTabActual[2].contentSections[2].data.tableRows[2]).toBeUndefined();
    });

    it('if claimant or defendant documents before bundle date, do not show documents', () => {
      const bundles = [] as Bundle[];
      bundles.push(bundle);
      caseData.caseProgression.caseBundles = bundles;
      uploadedDisclosureEvidence.caseDocument.createdDatetime = uploadedBeforeBundleCreationDate;

      documentsUploadedAfter.expert.push(uploadedDisclosureEvidence);
      caseData.caseProgression.claimantUploadDocuments = documentsUploadedAfter;
      caseData.caseProgression.defendantUploadDocuments = documentsUploadedAfter;
      caseData.caseProgression.claimantLastUploadDate = uploadedBeforeBundleCreationDate;
      caseData.caseProgression.claimantLastUploadDate = uploadedBeforeBundleCreationDate;

      //when
      const bundleTabActual = getBundlesContent(caseData, lang);

      //then
      checkForNonTableBundleData(bundleTabActual);
      expect(bundleTabActual[1]).toBeUndefined();
      expect(bundleTabActual[2]).toBeUndefined();
    });
  });
});

function checkForNonTableBundleData(bundleTabActual: ClaimSummaryContent[]){
  expect(bundleTabActual[0].contentSections[0].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.FIND_BUNDLE_BELOW');
  expect(bundleTabActual[0].contentSections[1].data.textBefore).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_BEFORE');
  expect(bundleTabActual[0].contentSections[1].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_LINK');
  expect(bundleTabActual[0].contentSections[1].data.textAfter).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_AFTER');
  expect(bundleTabActual[0].contentSections[2].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.NEW_DOCUMENT_NOT_INCLUDED');
}

function checkForBundleTableHeaders(bundleTabActual: ClaimSummaryContent[]){
  expect(bundleTabActual[0].contentSections[3].data.head[0].html).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.BUNDLE_HEADER');
  expect(bundleTabActual[0].contentSections[3].data.head[1].html).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.CREATED_DATE_HEADER');
  expect(bundleTabActual[0].contentSections[3].data.head[2].html).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.HEARING_DATE_HEADER');
  expect(bundleTabActual[0].contentSections[3].data.head[3].html).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.URL_HEADER');
}

function checkForBundleTableFirstRow(bundleTabActual: ClaimSummaryContent[]){
  expect(bundleTabActual[0].contentSections[3].data.tableRows[0][0].html).toMatch(title);
  expect(bundleTabActual[0].contentSections[3].data.tableRows[0][1].html).toMatch(bundle.getFormattedCreatedOn);
  expect(bundleTabActual[0].contentSections[3].data.tableRows[0][2].html).toMatch(bundle.getFormattedHearingDate);
  expect(bundleTabActual[0].contentSections[3].data.tableRows[0][3].html).toMatch(documentUrlElement);
}
