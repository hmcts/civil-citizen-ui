import {Claim} from 'models/claim';
import {ClaimSummaryContent, ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {SummaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {
  formatDocumentAlignedViewURL,
  formatDocumentWithHintText,
} from 'common/utils/formatDocumentURL';
import {CaseProgressionHearingDocuments} from 'models/caseProgression/caseProgressionHearing';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {alignText} from 'form/models/alignText';

export function getHearingContent(claimId: string, claim: Claim, lang: string): ClaimSummaryContent[] {

  const claimSummaryContent = [] as ClaimSummaryContent[];
  claimSummaryContent.push(getHearings(claimId,claim, lang));
  claimSummaryContent.push(getButton(claimId, claim, lang));

  return claimSummaryContent;
}

function getHearings(claimId: string, claim: Claim, lang: string): ClaimSummaryContent {

  const hearingHeaders = getHearingsHeader(lang);
  const hearingSummary = getHearingsSummary(claim,lang);

  const hearingsSection = [] as ClaimSummarySection[];
  hearingsSection.push(hearingHeaders);
  hearingsSection.push(hearingSummary);

  return {contentSections: hearingsSection, hasDivider: false};
}

function getHearingsHeader(lang: string): ClaimSummarySection{
  const hearingHeaders: ClaimSummarySection= {
    type:ClaimSummaryType.TITLE,
    data:{text: t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.VIEW_THE_HEARING.TAB_TITLE', {lng:lang})}};

  return hearingHeaders;
}

function getHearingsSummary(claim: Claim,lang: string): ClaimSummarySection {

  const hearingRows = [] as SummaryRow[];
  const hearingDocuments :CaseProgressionHearingDocuments[] = claim.caseProgressionHearing?.hearingDocuments;

  for(const hearingDocument of hearingDocuments){

    if(hearingDocument?.value) {
      const hearingDocumentLink = formatDocumentAlignedViewURL(hearingDocument.value?.documentName, claim.id, hearingDocument.value?.documentLink.document_binary_url,alignText.ALIGN_TO_THE_RIGHT);
      const hearingDoc = formatDocumentWithHintText(hearingDocument.value?.documentType,hearingDocument.value?.createdDatetime,lang);
      hearingRows.push({key:{html:hearingDoc},
        value:{html: hearingDocumentLink},
      });
    }
  }

  const hearingHeaders: ClaimSummarySection= {
    type:ClaimSummaryType.SUMMARY,
    data:{rows:hearingRows},
  };

  return hearingHeaders;
}
function getButton(claimId: string, claim: Claim, lang: string): ClaimSummaryContent {

  const redirectUrl = claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL;

  const buttonSection = new PageSectionBuilder()
    .addButton(t('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_CASE_OVERVIEW', {lng:lang}), constructResponseUrlWithIdParams(claimId, redirectUrl))
    .build();

  return {contentSections: buttonSection, hasDivider: false};
}
