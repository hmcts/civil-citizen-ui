import {getHearingContent} from 'services/features/caseProgression/hearing/hearingService';
import {Claim} from 'models/claim';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {CASE_DOCUMENT_VIEW_URL, DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {
  DocumentType,
} from 'models/document/documentType';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {CaseProgressionHearing, CaseProgressionHearingDocuments} from 'models/caseProgression/caseProgressionHearing';
import {toInteger} from 'lodash';
import {ClaimSummaryType} from 'form/models/claimSummarySection';

const lang = 'en';
const createdBy= 'Jhon';
const claimId = '1234';
const fileName = 'Name of file';
const binary = '77121e9b-e83a-440a-9429-e7f0fe89e518';
const binary_url = `http://dm-store:8080/documents/${binary}/binary`;
const url = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(binary_url));
const document = {document_filename: fileName, document_url: url, document_binary_url: binary_url};

describe('getHearingContent', () =>{
  const hearingDocuments : CaseProgressionHearingDocuments = {id:'Document test', value: {
    createdBy: createdBy,
    documentLink: document,
    documentName: fileName,
    documentType: DocumentType.HEARING_FORM,
    documentSize: toInteger(5),
    createdDatetime: new Date(),
  }};

  describe('getHearingContent', () => {
    it('hearing info should be displayed', () => {
      //given
      const caseData = new Claim();
      caseData.id = '1234';
      caseData.caseProgression = new CaseProgression();
      caseData.caseProgressionHearing = new CaseProgressionHearing();
      caseData.caseProgressionHearing.hearingDocuments = [new CaseProgressionHearingDocuments()];
      caseData.caseProgressionHearing.hearingDocuments.push(hearingDocuments);
      const dashboardUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);

      //when
      const hearingActual = getHearingContent(caseData.id, caseData, lang,dashboardUrl);

      //then
      expect(hearingActual[0].contentSections[0].type).toMatch(ClaimSummaryType.TITLE);
      expect(hearingActual[0].contentSections[1].type).toMatch(ClaimSummaryType.SUMMARY);
      expect(hearingActual[1].contentSections[0].type).toMatch(ClaimSummaryType.BUTTON);

    });
  });
});
