import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';

export class PageSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];
  addTitle(title: string, variables?: any, classes?: string) {
    const titleSection = ({
      type: ClaimSummaryType.TITLE,
      data: {
        text: title,
        variables: variables,
        classes: classes,
      },
    });
    this._claimSummarySections.push(titleSection);
    return this;
  }

  addParagraph(text: string, variables?: any, classes?: string) {
    const paragraphSection = ({
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: text,
        variables: variables,
        classes: classes,
      },
    });
    this._claimSummarySections.push(paragraphSection);
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

  addLink(text: string, href: string, textBefore?: string, textAfter?: string, variables?: any, externalLink = false) {
    const linkSection = ({
      type: ClaimSummaryType.LINK,
      data: {
        text: text,
        href: href,
        textBefore: textBefore,
        textAfter: textAfter,
        variables: variables,
        externalLink,
      },
    });
    this._claimSummarySections.push(linkSection);
    return this;
  }

  addButton(title: string, href: string) {
    const titleSection = ({
      type: ClaimSummaryType.BUTTON,
      data: {
        text: title,
        href: href,
      },
    });
    this._claimSummarySections.push(titleSection);
    return this;
  }

  addMainTitle(mainTitle: string, variables?: unknown) {
    const mainTitleSection = ({
      type: ClaimSummaryType.MAINTITLE,
      data: {
        text: mainTitle,
        variables: variables,
      },
    });
    this._claimSummarySections.push(mainTitleSection);
    return this;
  }

  addLeadParagraph(text: string, variables?: unknown, classes?: string) {
    const leadParagraphSection = ({
      type: ClaimSummaryType.LEAD_PARAGRAPH,
      data: {
        text: text,
        variables: variables,
        classes: classes,
      },
    });
    this._claimSummarySections.push(leadParagraphSection);
    return this;
  }

  build() {
    return this._claimSummarySections;
  }
}
