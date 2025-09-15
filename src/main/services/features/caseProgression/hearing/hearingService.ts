import {Claim} from 'models/claim';
import {ClaimSummaryContent, ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {SummaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {formatDocumentAlignedViewURL, formatDocumentWithHintText} from 'common/utils/formatDocumentURL';
import {CaseProgressionHearingDocuments} from 'models/caseProgression/caseProgressionHearing';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {alignText} from 'form/models/alignText';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {LanguageOptions} from 'models/directionsQuestionnaire/languageOptions';

export function getHearingContent(claimId: string, claim: Claim, lang: string, redirectUrl:string): ClaimSummaryContent[] {

  const claimSummaryContent = [] as ClaimSummaryContent[];
  claimSummaryContent.push(getHearings(claimId,claim, lang));
  claimSummaryContent.push(getButton(claimId, claim, lang, redirectUrl));

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
  return {
    type:ClaimSummaryType.TITLE,
    data:{text: t('PAGES.DASHBOARD.HEARINGS.HEARING', {lng:lang})}};
}

function getHearingsSummary(claim: Claim,lang: string): ClaimSummarySection {

  const hearingRows = [] as SummaryRow[];
  const hearingDocuments: CaseProgressionHearingDocuments[] = claim.caseProgressionHearing?.hearingDocuments;
  if(hearingDocuments) {
    for(const hearingDocument of hearingDocuments){
      if(hearingDocument?.value) {
        const hearingDocumentLink = formatDocumentAlignedViewURL(hearingDocument.value?.documentName, claim.id, hearingDocument.value?.documentLink.document_binary_url,alignText.ALIGN_TO_THE_RIGHT);
        const hearingDoc = formatDocumentWithHintText(t('PAGES.DASHBOARD.HEARINGS.HEARING_NOTICE', {lng:lang}),hearingDocument.value?.createdDatetime,lang);
        hearingRows.push({key:{html:hearingDoc,classes:'govuk-!-width-one-half'},
          value:{html: hearingDocumentLink},
        });
      }
    }
  }
  const hearingDocumentsWelsh: CaseProgressionHearingDocuments[] = claim.caseProgressionHearing?.hearingDocumentsWelsh;
  if(claim.caseProgressionHearing?.hearingDocumentsWelsh) {
    for(const hearingDocumentWelsh of hearingDocumentsWelsh) {
      if (checkWelshHearingNotice(claim)) {
        if(hearingDocumentWelsh?.value) {
          const hearingDocumentLink = formatDocumentAlignedViewURL(hearingDocumentWelsh.value?.documentName, claim.id, hearingDocumentWelsh.value?.documentLink.document_binary_url,alignText.ALIGN_TO_THE_RIGHT);
          const hearingDoc = formatDocumentWithHintText(t('PAGES.DASHBOARD.HEARINGS.TRANSLATED_HEARING_NOTICE', {lng:lang}),hearingDocumentWelsh.value?.createdDatetime,lang);
          hearingRows.push({key:{html:hearingDoc,classes:'govuk-!-width-one-half'}, value:{html: hearingDocumentLink},
          });
        }
      }
    }
  }

  return {type:ClaimSummaryType.SUMMARY, data:{rows:hearingRows}};
}
function getButton(claimId: string, claim: Claim, lang: string, redirectUrl:string): ClaimSummaryContent {

  const buttonSection = new PageSectionBuilder()
    .addButton(t('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_CASE_OVERVIEW', {lng:lang}), constructResponseUrlWithIdParams(claimId, redirectUrl))
    .build();

  return {contentSections: buttonSection, hasDivider: false};
}

export function checkWelshHearingNotice(claim: Claim): boolean {

  const isWelshLanguage = (lang?: LanguageOptions): boolean => {
    return lang === LanguageOptions.WELSH || lang === LanguageOptions.WELSH_AND_ENGLISH;
  };

  const docsLanguageClaimant = claim?.claimantResponse?.directionQuestionnaire?.welshLanguageRequirements?.language?.documentsLanguage;
  const docsLanguageDefendant = claim?.directionQuestionnaire?.welshLanguageRequirements?.language?.documentsLanguage;
  const isDocsLanguageWelsh = isWelshLanguage(docsLanguageClaimant);
  const isDocsLanguageWelshDefendant = isWelshLanguage(docsLanguageDefendant);

  const isClaimantWelshBilingual =
    claim.claimantBilingualLanguagePreference === ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH
    || claim.claimantBilingualLanguagePreference === ClaimBilingualLanguagePreference.WELSH;

  const isDefendantLipResponseBoth =
    claim.respondent1LiPResponse?.respondent1ResponseLanguage === 'BOTH'
    || claim.respondent1LiPResponse?.respondent1ResponseLanguage === 'WELSH';

  return ((claim.isClaimant() && (isClaimantWelshBilingual || isDocsLanguageWelsh)) ||
    (claim.isDefendant() && (isDefendantLipResponseBoth || isDocsLanguageWelshDefendant)));
}
