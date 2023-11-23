import { LatestUpdateSectionBuilder } from "common/models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder";
import { Claim } from "common/models/claim";
import { t } from "i18next";

export const getSendFinancialDetails = (claim: Claim, lang: string) => {

  const email = 'civilmoneyclaimsaat@gmail.com';

  return new LatestUpdateSectionBuilder()
    .addTitle(t('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT', {lng: lang}))
    .addTitle(t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SEND_FINANCIAL_DETAILS.TITLE', {lng: lang}))
    .addParagraph(t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SEND_FINANCIAL_DETAILS.YOU_NEED_TO_SEND', {lng: lang}))
    .addParagraph(t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SEND_FINANCIAL_DETAILS.MAKE_SURE', {caseNumber: claim.legacyCaseReference, lng: lang}))
    .addParagraph(t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SEND_FINANCIAL_DETAILS.THE_COURT_WILL_REVIEW', {lng: lang}))
    .addTitle(t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.USE_THIS_ADDRESS.TITLE', {lng: lang}))
    .addParagraph(t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.USE_THIS_ADDRESS.THE_DENFENDANT_SHOULD', {lng: lang}))
    .addInsetText(
      `<p class="govuk-body">${t('COMMON.POSTAL_ADDRESS.BUILDING')}</p>
      <p class="govuk-body">${t('COMMON.POSTAL_ADDRESS.PO_BOX')}</p>
      <p class="govuk-body">${t('COMMON.POSTAL_ADDRESS.CITY')}</p>
      <p class="govuk-body">${t('COMMON.POSTAL_ADDRESS.POSTCODE')}</p>`
    )
    .addLink( email, `mailto:${email}`, t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.USE_THIS_ADDRESS.OR_EMAIL', {lng: lang}), null, null)
    .addTitle(t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.COURT_BELIEVES_CAN_AFFORD.TITLE', {lng: lang}))
    .addParagraph(t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.COURT_BELIEVES_CAN_AFFORD.CCJ_WILL_BE_ISSUED', {lng: lang}))
    .addTitle(t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.COURT_BELIEVES_CANT_AFFORD.TITLE', {lng: lang}))
    .addParagraph(t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.COURT_BELIEVES_CANT_AFFORD.COURT_WILL_SET', {lng: lang}))
    .build();
};
