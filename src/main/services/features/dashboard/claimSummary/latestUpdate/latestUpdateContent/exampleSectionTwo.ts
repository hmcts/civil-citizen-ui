import {ClaimSummarySection, ClaimSummaryType} from '../../../../../../common/form/models/claimSummarySection';
import {Claim} from '../../../../../../common/models/claim';

/**
 * THIS FILE IS A CONCEPT AND DOESN'T WORK
 *
 * The logic on this file is not the real business logic.
 * This code is only a concept of what we should do.
 *
 */

export const getFourthConditionalContentContent = (claim: Claim): ClaimSummarySection[] => { //NOSONAR
  return [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: 'View the responses to the order',
      },
    },
    {
      type: ClaimSummaryType.BUTTON,
      data: {
        href: '/test',
        text: 'See the details you sent to the court',
        classes: 'govuk-button--secondary',
      },
    },
    {
      type: ClaimSummaryType.BUTTON,
      data: {
        href: '/test',
        text: 'See the details the defendant sent to the court',
        classes: 'govuk-button--secondary',
      },
    },
  ];
};
