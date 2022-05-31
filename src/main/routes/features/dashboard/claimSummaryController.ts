import * as express from 'express';
import {Claim} from '../../../common/models/claim';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {CLAIMANT_SUMMARY_URL} from '../../urls';
import {ComponentDetailItems} from 'common/form/models/componentDetailItems/componentDetailItems';
import {t} from 'i18next';
import {getLng} from '../../../common/utils/languageToggleUtils';
import {getClaimantName, getDefendantName} from '../../../common/utils/getNameByType';

const claimSummaryViewPath = 'features/dashboard/claim-summary';
const claimSummaryController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimSummaryController');

function getComponentDetailItems(lang: string): ComponentDetailItems {
  return {
    title: t('PAGES.CHECK_YOUR_ANSWER.DETAILS_TITLE', {lng: getLng(lang)}),
    subtitle: t('PAGES.CHECK_YOUR_ANSWER.DETAILS_TITLE', {lng: getLng(lang)}),
    content: ['<a href="https://www.gov.uk/government/publications/debt-respite-scheme-breathing-space-guidance/debt-respite-scheme-breathing-space-guidance-for-creditors#end-of-a-breathing-space">debt respite scheme (opens in new tab)</a>',
    '<details class="govuk-details" data-module="govuk-details">\n' +
    '  <summary class="govuk-details__summary">\n' +
    '    <span class="govuk-details__summary-text">\n' +
    '      Help with nationality\n' +
    '    </span>\n' +
    '  </summary>\n' +
    '  <div class="govuk-details__text">\n' +
    '    We need to know your nationality so we can work out which elections you’re entitled to vote in. If you cannot provide your nationality, you’ll have to send copies of identity documents through the post.\n' +
    '  </div>\n' +
    '</details>'],
    button: {
      text: 'ttt',
      href: 'testttt',
    },
    hasDivider:  true,
  };
}
claimSummaryController.get(CLAIMANT_SUMMARY_URL, async (req, res) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;

    const claim: Claim = await getCaseDataFromStore((req.params.id));
    const claimantName = getClaimantName(claim);
    const defendantName = getDefendantName(claim);
    const content = getComponentDetailItems(lang);
    res.render(claimSummaryViewPath, { claim, claimId: req.params.id, claimantName, defendantName, content: content });
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error.message });
  }
});

export default claimSummaryController;
