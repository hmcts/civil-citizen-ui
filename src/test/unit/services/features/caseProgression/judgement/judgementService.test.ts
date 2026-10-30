import {getJudgementContent} from 'services/features/caseProgression/judgement/judgementService';
import {Claim} from 'models/claim';
import {CASE_DOCUMENT_VIEW_URL, DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {
  DocumentType,
} from 'models/document/documentType';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {toInteger} from 'lodash';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {FinalOrderDocumentCollection} from 'models/caseProgression/finalOrderDocumentCollectionType';
import {mockFinalOrderDocument1} from '../../../../../utils/caseProgression/mockCCDFinalOrderDocumentCollection';
import {CaseRole} from 'form/models/caseRoles';
import {SystemGeneratedCaseDocuments} from 'models/document/systemGeneratedCaseDocuments';

const lang = 'en';
const createdBy= 'Jhon';
const claimId = '1234';
const fileName = 'Name of file';
const binary = '77121e9b-e83a-440a-9429-e7f0fe89e518';
const binary_url = `http://dm-store:8080/documents/${binary}/binary`;
const url = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(binary_url));
const document = {document_filename: fileName, document_url: url, document_binary_url: binary_url};

describe('getJudgementContent', () =>{
  const savedDocument = (id: string, documentType: DocumentType): SystemGeneratedCaseDocuments => ({
    id,
    value: {
      ...mockFinalOrderDocument1.value,
      documentType,
      documentName: `${id}.pdf`,
      documentLink: {
        document_filename: `${id}.pdf`,
        document_url: `http://documents/${id}`,
        document_binary_url: `http://documents/${id}/binary`,
      },
    },
  });

  it.each([
    {role: CaseRole.CLAIMANT, system: true, expected: 'claimant-system'},
    {role: CaseRole.DEFENDANT, system: true, expected: 'defendant-default'},
    {role: CaseRole.CLAIMANT, system: false, expected: 'claimant-default'},
    {role: CaseRole.DEFENDANT, system: false, expected: 'defendant-default'},
  ])('selects $expected for $role with populated system documents: $system', ({role, system, expected}) => {
    const claim = new Claim();
    claim.id = claimId;
    claim.caseRole = role;
    claim.systemGeneratedCaseDocuments = system ? [
      savedDocument('unrelated', DocumentType.HEARING_FORM),
      savedDocument('claimant-system', DocumentType.JUDGMENT_BY_ADMISSION_CLAIMANT),
    ] : [];
    claim.defaultJudgmentDocuments = [
      savedDocument('claimant-default', DocumentType.JUDGMENT_BY_ADMISSION_CLAIMANT),
      savedDocument('defendant-default', DocumentType.JUDGMENT_BY_ADMISSION_DEFENDANT),
    ];

    const rows = getJudgementContent(claimId, claim, lang, '/dashboard')[0].contentSections[1].data.rows;

    expect(rows).toHaveLength(1);
    expect(rows[0].value.html).toContain(`href="/case/${claimId}/view-documents/${expected}"`);
    expect(rows[0].value.html).toContain(`${expected}.pdf`);
  });

  it('does not show an unrelated document when neither collection contains a judgment', () => {
    const claim = new Claim();
    claim.id = claimId;
    claim.caseRole = CaseRole.CLAIMANT;
    claim.systemGeneratedCaseDocuments = [savedDocument('hearing', DocumentType.HEARING_FORM)];
    claim.defaultJudgmentDocuments = [savedDocument('other', DocumentType.HEARING_FORM)];

    expect(getJudgementContent(claimId, claim, lang, '/dashboard')[0].contentSections[1].data.rows).toEqual([]);
  });

  const judgementDocumnets : FinalOrderDocumentCollection = {id:'Document test', value: {
    createdBy: createdBy,
    documentLink: document,
    documentName: fileName,
    documentType: DocumentType.HEARING_FORM,
    documentSize: toInteger(5),
    createdDatetime: new Date(),
  }};

  describe('getJudgementContent', () => {
    it('hearing info should be displayed', () => {
      //given
      const caseData = new Claim();
      caseData.id = '1234';
      caseData.defaultJudgmentDocuments = [mockFinalOrderDocument1];
      caseData.defaultJudgmentDocuments.push(judgementDocumnets);
      const dashboardUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);

      //when
      const hearingActual = getJudgementContent(caseData.id, caseData, lang,dashboardUrl);

      //then
      expect(hearingActual[0].contentSections[0].type).toMatch(ClaimSummaryType.TITLE);
      expect(hearingActual[0].contentSections[1].type).toMatch(ClaimSummaryType.SUMMARY);
      expect(hearingActual[1].contentSections[0].type).toMatch(ClaimSummaryType.BUTTON);

    });
  });
});
