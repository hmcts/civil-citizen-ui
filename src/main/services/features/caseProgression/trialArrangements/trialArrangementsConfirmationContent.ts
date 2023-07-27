import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';
import {Claim} from 'models/claim';
import {DEFENDANT_DOCUMENTS_URL} from 'routes/urls';

export function getNextStepsTitle(lang: string): ClaimSummarySection[] {
  return [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.WHAT_HAPPENS_NEXT', {lng: lang}),
      },
    },
  ];
}

export function getNextStepsSection(claimId: string, claim: Claim, lng: string, readyForTrialOrHearing: boolean): ClaimSummarySection[] {
  if (readyForTrialOrHearing) {
    return [
      {
        type: ClaimSummaryType.LINK,
        data: {
          text: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.NOTICES_AND_ORDERS', {lng}),
          href: DEFENDANT_DOCUMENTS_URL.replace(':id', claimId),
          textBefore: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_CAN_VIEW_TRIAL_ARRANGEMENTS', {lng}),
          textAfter: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IN_THE_CASE_DETAILS', {lng}),
        },
      },
      {
        type: ClaimSummaryType.LINK,
        data: {
          text: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.MAKE_AN_APPLICATION', {lng}),
          href: 'https://www.gov.uk/government/publications/form-n244-application-notice',
          textBefore: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IF_THERE_ARE_ANY_CHANGES_TO_THE_ARRANGEMENTS', {lng}),
          textAfter: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.AS_SOON_AS_POSSIBLE_AND_PAY', {lng}),
          externalLink: true,
        },
      },
      {
        type: ClaimSummaryType.PARAGRAPH,
        data: {
          text: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_WILL_NEED_TO_PHONE', {lng}),
        },
      },
    ];
  } else {
    return [
      {
        type: ClaimSummaryType.HTML,
        data: {
          html: `<div class="warning-text-container">
                    <span class="govuk-warning-text__icon" aria-hidden="true">!</span>
                    <strong class="govuk-warning-text__text">
                    ${t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.TRIAL_OR_HEARING_WILL_GO_AHEAD_AS_PLANNED', {lng})}
                    </strong>
                 </div>`,
        },
      },
      {
        type: ClaimSummaryType.LINK,
        data: {
          text: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.MAKE_AN_APPLICATION', {lng}),
          href: 'https://www.gov.uk/government/publications/form-n244-application-notice',
          textBefore: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IF_YOU_WANT_THE_DATE_OF_THE_HEARING', {lng}),
          textAfter: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.TO_THE_COURT_AND_PAY', {lng}),
          externalLink: true,
        },
      },
      {
        type: ClaimSummaryType.PARAGRAPH,
        data: {
          text: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_WILL_NEED_TO_CALL', {lng}),
        },
      },
      {
        type: ClaimSummaryType.LINK,
        data: {
          text: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.NOTICES_AND_ORDERS', {lng}),
          href: DEFENDANT_DOCUMENTS_URL.replace(':id', claimId),
          textBefore: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_CAN_VIEW_TRIAL_ARRANGEMENTS', {lng}),
          textAfter: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IN_THE_CASE_DETAILS', {lng}),
        },
      },
    ];
  }
}
