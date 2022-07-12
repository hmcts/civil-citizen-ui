import {ClaimSummaryContent, ClaimSummaryType} from '../../../common/form/models/claimSummarySection';
import { t } from 'i18next';
import {getLng} from '../../../common/utils/languageToggleUtils';

/**
 * Mock service
 */

function getDocumentsContent(lang?: string): ClaimSummaryContent[] {
  return [{
    contentSections: [
      {
        type: ClaimSummaryType.LINK,
        data: {
          href: '/test',
          text: t('PAGES.CLAIM_SUMMARY.DOWNLOAD_JUDGMENT_ORDER', { lng: getLng(lang) }),
          textAfter: '(PDF)',
          subtitle: 'Created: 27 May 2022',
        },
      },
      {
        type: ClaimSummaryType.LINK,
        data: {
          href: '/test',
          text: 'Download the new order',
          textAfter: '(PDF)',
          subtitle: 'Created: 25 April 2022',
        },
      },
      {
        type: ClaimSummaryType.LINK,
        data: {
          href: '/test',
          text: 'Download the original order',
          textAfter: '(PDF), which is now cancelled.',
          subtitle: 'Created: 5 April 2022',
        },
      },
    ],
  }];
}

export { getDocumentsContent };
