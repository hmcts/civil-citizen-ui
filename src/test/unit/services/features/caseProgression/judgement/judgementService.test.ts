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

const lang = 'en';
const createdBy= 'Jhon';
const claimId = '1234';
const fileName = 'Name of file';
const binary = '77121e9b-e83a-440a-9429-e7f0fe89e518';
const binary_url = `http://dm-store:8080/documents/${binary}/binary`;
const url = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(binary_url));
const document = {document_filename: fileName, document_url: url, document_binary_url: binary_url};

describe('getJudgementContent', () =>{
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
