import {
  getCaseDataFromStore,
} from '../../../modules/draft-store/draftStoreService';
import {
  summarySection,
  SummarySection,
  SummarySections,
} from 'models/summaryList/summarySections';
import {Claim} from '../../../../main/common/models/claim';
import {t} from 'i18next';
import {summaryRow} from '../../../../main/common/models/summaryList/summaryList';
import {
  CITIZEN_DETAILS_URL,
  CITIZEN_PHONE_NUMBER_URL,
  CITIZEN_RESPONSE_TYPE_URL,
} from '../../../routes/urls';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkAnswersService');

class CheckAnswersService {

  public async getSummarySections(claimId: string): Promise<SummarySections> {
    try {
      const claim = await getCaseDataFromStore(claimId);
      return CheckAnswersService.buildSummarySections(claim, claimId);
    } catch (error) {
      logger.error(`${(error as Error).stack || error}`);
      throw error;
    }
  }

  private static buildSummarySections(claim: Claim, claimId: string): SummarySections {

    const yourDetailsHref = CITIZEN_DETAILS_URL.replace(':id', claimId);
    const phoneNumberHref = CITIZEN_PHONE_NUMBER_URL.replace(':id', claimId);
    const yourDetailsSection: SummarySection = summarySection(
      t('Your details'),
      undefined,
      summaryRow(t('Full name'), claim.respondent1.partyName, yourDetailsHref, t('Change')),
      summaryRow(t('Contact number (optional)'), claim.respondent1.telephoneNumber, phoneNumberHref, t('Change')),
    );

    const yourResponseHref = CITIZEN_RESPONSE_TYPE_URL.replace(':id', claimId);
    const yourResponseSection: SummarySection = summarySection(
      t('Your response to the claim'),
      undefined,
      summaryRow(t('Do you owe the money claimed'), t(claim.respondent1.responseType), yourResponseHref, t('Change')),
      summaryRow(t('When will you pay'), 'Screen still to be developped', '#', t('Change')),
    );
    return {
      sections: [
        yourDetailsSection,
        yourResponseSection,
      ],
    };
  }
}

const checkAnswersService = new CheckAnswersService();
export default checkAnswersService;
