// import {t} from 'i18next';
import {ClaimSummaryType, ClaimSummarySection} from '../../../../../../common/form/models/claimSummarySection';
// import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {Claim} from '../../../../../../common/models/claim';

export const getFirstConditionalContentContent = (claim: Claim, lang: string, claimId: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantName();
  return [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: 'You can request a County Court Judgment',
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: `${claimantName} has not responded to your claim by the deadline. You can request a County Court Judgment (CCJ) against them.`,
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'The court will order them to pay the money. It doesn´t guarantee that they´ll pay it.',
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: `${claimantName} can still respond to the claim until you request a CCJ.`,
      },
    },
    {
      type: ClaimSummaryType.BUTTON,
      data: {
        text: 'Request a CCJ',
        href: '/test',
      },
    },
  ];
};

export const getSecondConditionalContentContent = (claim: Claim, lang: string): ClaimSummarySection[] => {
  return [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: 'Tell us you´ve ended the claim',
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'If you´ve been paid or you´ve made another agreement with the defendant, you need to tell us.',
      },
    },
    {
      type: ClaimSummaryType.BUTTON,
      data: {
        text: 'Tell us you´ve settled',
        href: '/test',
        classes: 'govuk-button--secondary',
      },
    },
  ]
};

export const getThirdConditionalContentContent = (claim: Claim, lang: string): ClaimSummarySection[] => {
  return [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: 'Notify us about the debt respite scheme (breathing space)',
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'Do you need to notify us that the defendant has entered the debt respite scheme (breathing space)?',
      },
    },
    {
      type: ClaimSummaryType.LINK,
      data: {
        text: 'debt respite scheme (opens in new tab)',
        href: '/test',
        textBefore: 'More information about the',
      },
    },
    {
      type: ClaimSummaryType.BUTTON,
      data: {
        text: 'Notify us about the debt respite scheme',
        href: '/test',
        classes: 'govuk-button--secondary',
      },
    },
  ];
};
