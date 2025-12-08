import {Claim} from 'models/claim';
import {getEvidenceUploadContent} from 'services/features/dashboard/evidenceUploadDocumentsService';
import {t} from 'i18next';
import {CCDClaim} from 'models/civilClaimResponse';
import {createCCDClaimForEvidenceUpload} from '../../../../utils/caseProgression/mockCCDClaimForEvidenceUpload';
import {toCUICaseProgression} from 'services/translation/convertToCUI/convertToCUICaseProgression';

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next');

const getTranslateMock = t as jest.Mock;

getTranslateMock.mockImplementation((key: string[]) => {
  return key.toString();
});

describe('getEvidenceUploadContent', () => {
  it('should return an array with one ClaimSummaryContent object with one content section containing the evidence upload document section', async () => {

    const lang = 'en';

    const ccdClaim: CCDClaim = createCCDClaimForEvidenceUpload();
    const claim: Claim = new Claim();
    claim.caseProgression = toCUICaseProgression(ccdClaim);
    const evidenceUploadText = {'data': {'text': 'PAGES.CLAIM_SUMMARY.EVIDENCE_UPLOAD_SUMMARY_HEARING', 'classes': 'govuk-!-margin-bottom-7'}, 'type': 'p'};
    const disclosureHTML = {'data': {'html': '<h2 class="govuk-body"><span class="govuk-body govuk-!-font-weight-bold">PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.DISCLOSURE_DOCUMENTS</span></h2><hr class="govuk-section-break govuk-section-break--m govuk-section-break--visible"><div class="govuk-grid-row"><div class="govuk-grid-column-one-half govuk-body">PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.DISCLOSURE_LIST<span class="govuk-caption-m">PAGES.CLAIM_SUMMARY.DATE_DOCUMENT_UPLOADED[1 January 1970]</span></div><div class="govuk-!-text-align-right govuk-body govuk-grid-column-one-half"><a class="govuk-link" target="_blank" href="/case/undefined/view-documents/77121e9b-e83a-440a-9429-e7f0fe89e518">name</a></div></div><div class="govuk-grid-row"><div class="govuk-grid-column-one-half govuk-body">PAGES.CLAIM_SUMMARY.DOCUMENT_HEADERS.CLAIMANT.DOCUMENTS_FOR_DISCLOSURE<span class="govuk-caption-m">PAGES.CLAIM_SUMMARY.DATE_DOCUMENT_UPLOADED[1 January 1970]</span></div><div class="govuk-!-text-align-right govuk-body govuk-grid-column-one-half"><a class="govuk-link" target="_blank" href="/case/undefined/view-documents/77121e9b-e83a-440a-9429-e7f0fe89e518">name</a></div></div><hr class="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-7">'}, 'type': 'html'};
    // When
    const result = getEvidenceUploadContent(claim, lang);
    expect(result).toHaveLength(1);
    expect(result[0].contentSections).toHaveLength(11);
    expect(result[0].contentSections[0]).toEqual(evidenceUploadText);
    expect(result[0].contentSections[1]).toEqual(disclosureHTML);
  });
});
