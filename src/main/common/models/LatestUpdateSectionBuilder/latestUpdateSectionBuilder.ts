import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {CASE_DOCUMENT_DOWNLOAD_URL, CITIZEN_CONTACT_THEM_URL} from 'routes/urls';
import {t} from 'i18next';

export class LatestUpdateSectionBuilder extends PageSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];
  addContactLink(text: string, claimId: string, variables?: any, textAfter?: string) {
    const linkSection = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        variables: variables,
        href: CITIZEN_CONTACT_THEM_URL.replace(':id', claimId),
        textAfter: textAfter,
      },
    });
    this._claimSummarySections.push(linkSection);
    return this;
  }

  addButtonOpensNewTab(title: string, href: string) {
    const newTabButtonSection = ({
      type: ClaimSummaryType.NEW_TAB_BUTTON,
      data: {
        text: title,
        href: href,
      },
    });
    this._claimSummarySections.push(newTabButtonSection);
    return this;
  }

  addResponseDocumentLink(text: string, claimId: string, documentId: string, variables?: any, textAfter?: string) {
    const linkSection = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        variables: variables,
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', documentId),
        textAfter: textAfter,
      },
    });
    this._claimSummarySections.push(linkSection);
    return this;
  }

  addWarning(text: string, variables?: any) {
    const warningSection = ({
      type: ClaimSummaryType.WARNING,
      data: {
        text: text,
        variables: variables,
      },
    });
    this._claimSummarySections.push(warningSection);
    return this;
  }

  addLatestUpdateClaimantParagraph(lang:string) {
    const paragraphSection = ({
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">${t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.CASE_DISMISSED_HEARING_DUE_DATE.CLAIMANT_FURTHER_INFORMATION', {lng: lang})}
                <br> ${t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.CASE_DISMISSED_HEARING_DUE_DATE.CLAIMANT_FURTHER_INFORMATION_SPECIFIED_EMAIL', {lng: lang})}
                <a href="mailto:contactocmc@justice.gov.uk">contactocmc@justice.gov.uk</a>
                <br> ${t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.CASE_DISMISSED_HEARING_DUE_DATE.CLAIMANT_FURTHER_INFORMATION_DAMAGES_EMAIL', {lng: lang})}
                <a href="mailto:ccmcccustomerenquiries@justice.gov.uk">ccmcccustomerenquiries@justice.gov.uk</a>
                <br> ${t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.CASE_DISMISSED_HEARING_DUE_DATE.CLAIMANT_FURTHER_INFORMATION_CONTACT', {lng: lang})}
                <br> ${t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.CASE_DISMISSED_HEARING_DUE_DATE.CLAIMANT_FURTHER_INFORMATION_FIND_OUT', {lng: lang})}
                <a href="https://www.gov.uk/call-charges">https://www.gov.uk/call-charges</a>
                </p>`,
      },
    });
    this._claimSummarySections.push(paragraphSection);
    return this;
  }

  build() {
    return this._claimSummarySections;
  }
}
