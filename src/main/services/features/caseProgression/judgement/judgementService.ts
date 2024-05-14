import {Claim} from 'models/claim';
import {ClaimSummaryContent, ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {SummaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {
  formatDocumentAlignedViewURL,
  formatDocumentWithHintText,
} from 'common/utils/formatDocumentURL';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {alignText} from 'form/models/alignText';
import {FinalOrderDocumentCollection} from 'models/caseProgression/finalOrderDocumentCollectionType';

export function getJudgementContent(claimId: string, claim: Claim, lang: string, redirectUrl:string): ClaimSummaryContent[] {

  const claimSummaryContent = [] as ClaimSummaryContent[];
  claimSummaryContent.push(getJudgements(claimId,claim, lang));
  claimSummaryContent.push(getButton(claimId, claim, lang, redirectUrl));

  return claimSummaryContent;
}

function getJudgements(claimId: string, claim: Claim, lang: string): ClaimSummaryContent {

  const judgementHeaders = getJudgementsHeader(lang);
  const judgementSummary = getJudgementSummary(claim,lang);

  const hearingsSection = [] as ClaimSummarySection[];
  hearingsSection.push(judgementHeaders);
  hearingsSection.push(judgementSummary);

  return {contentSections: hearingsSection, hasDivider: false};
}

function getJudgementsHeader(lang: string): ClaimSummarySection{
  return {
    type:ClaimSummaryType.TITLE,
    data:{text: t('PAGES.DASHBOARD.JUDGEMENTS.THE_JUDGEMENT', {lng:lang})}};
}

function getJudgementSummary(claim: Claim,lang: string): ClaimSummarySection {

  const judgementRows = [] as SummaryRow[];
  const judgementDocuments :FinalOrderDocumentCollection[] = claim.caseProgression?.finalOrderDocumentCollection;

  for(const judgementDocument of judgementDocuments){

    if(judgementDocument?.value) {
      const hearingDocumentLink = formatDocumentAlignedViewURL(judgementDocument.value?.documentName, claim.id, judgementDocument.value?.documentLink.document_binary_url,alignText.ALIGN_TO_THE_RIGHT);
      const hearingDoc = formatDocumentWithHintText(t('PAGES.DASHBOARD.JUDGEMENTS.JUDGEMENT', {lng:lang}),judgementDocument.value?.createdDatetime,lang);
      judgementRows.push({key:{html:hearingDoc,classes:'govuk-!-width-one-half'},
        value:{html: hearingDocumentLink},
      });
    }
  }

  return {type:ClaimSummaryType.SUMMARY, data:{rows:judgementRows}};
}
function getButton(claimId: string, claim: Claim, lang: string, redirectUrl:string): ClaimSummaryContent {

  const buttonSection = new PageSectionBuilder()
    .addButton(t('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_CASE_OVERVIEW', {lng:lang}), constructResponseUrlWithIdParams(claimId, redirectUrl))
    .build();

  return {contentSections: buttonSection, hasDivider: false};
}
