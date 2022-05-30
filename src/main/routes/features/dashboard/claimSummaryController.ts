import {Claim} from 'common/models/claim';
import * as express from 'express';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {CLAIMANT_SUMMARY_URL} from '../../urls';
import {ComponentDetailItems} from 'common/form/models/componentDetailItems/componentDetailItems';

const claimSummaryViewPath = 'features/dashboard/claim-summary';
const claimSummaryController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimSummaryController');

function getItems(): ComponentDetailItems {
  return {
    title: 'test',
    subtitle: 'test',
    content: ['<a href="https://www.gov.uk/government/publications/debt-respite-scheme-breathing-space-guidance/debt-respite-scheme-breathing-space-guidance-for-creditors#end-of-a-breathing-space">debt respite scheme (opens in new tab)</a>'],
    button: {
      text: 'ttt',
      href: 'testttt',
    },
    hasDivider:  true,
  };
}
claimSummaryController.get(CLAIMANT_SUMMARY_URL, async (req, res) => {
  try {
    const claim: Claim = await getCaseDataFromStore((req.params.id));
    const content = getItems();
    res.render(claimSummaryViewPath, { claim, claimId: req.params.id , content: content});
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error.message });
  }
});

export default claimSummaryController;
