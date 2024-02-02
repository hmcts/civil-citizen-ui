import {t} from 'i18next';
import {ClaimSummaryType} from 'common/form/models/claimSummarySection';
import {Claim} from 'common/models/claim';
import {formatDateToFullDate} from 'common/utils/dateUtils';

export const getClaimantResponseStatus = (claim: Claim, statement: string, lang: string) => {
  const claimNumber = claim.legacyCaseReference;
  const responseSubmitDate = formatDateToFullDate(claim?.applicant1ResponseDate, lang);
  return [
    {
      type: ClaimSummaryType.PANEL,
      data: {
        title: `<span class='govuk-!-font-size-36'>${t(statement, {lng: lang})}</span>`,
        html: `<span class='govuk-!-font-size-27'>${t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER', {lng: lang})}</span>
              <br><strong>${claimNumber}</strong><br>
              <span class='govuk-!-font-weight-bold govuk-!-font-size-24'>${responseSubmitDate}</span>`,
      },
    },
  ];
};

export const getRCDisputeNotContinueNextSteps = (claim: Claim, lang: string) => {
  const defendantName = claim.getDefendantFullName();
  return [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.CLAIM_ENDED', {defendantName, lng: lang}),
      },
    },
  ];
};
