import {
  getCaseDataFromStore,
} from '../../../modules/draft-store/draftStoreService';
import {Section, SummaryListAggregate} from '../../../../main/common/models/summaryList/summaryListAggregate';
import {Claim} from '../../../../main/common/models/claim';
import {t} from 'i18next';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkAnswersService');

class CheckAnswersService {

  public async getSummaryListAggregate(claimId: string): Promise<SummaryListAggregate> {
    try {
      const claim = await getCaseDataFromStore(claimId);
      return CheckAnswersService.buildSummaryListAggregate(claim);
    } catch (error) {
      logger.error(`${(error as Error).stack || error}`);
      throw error;
    }
  }

  private static buildSummaryListAggregate(claim: Claim): SummaryListAggregate {

    const yourDetailsSection: Section = {
      title: t('Your details'),
      summaryList: {
        rows: [
          {
            key: {
              text: 'Full name',
            },
            value: {
              text: claim.respondent1.partyName,
            },
            actions: {
              items:[
                {
                  href:'#',
                  text: 'Change',
                  visuallyHiddenText: 'full name',
                },
              ],
            },
          },
          {
            key: {
              text: 'Contact number (optional)',
            },
            value: {
              text: claim.respondent1.telephoneNumber,
            },
            actions: {
              items:[
                {
                  href:'#',
                  text: 'Change',
                  visuallyHiddenText: 'contact number',
                },
              ],
            },
          },
        ],
      },
    };
    return  {
      sections: [
        yourDetailsSection,
      ],
    };
  }
}

const checkAnswersService = new CheckAnswersService();
export default checkAnswersService;
