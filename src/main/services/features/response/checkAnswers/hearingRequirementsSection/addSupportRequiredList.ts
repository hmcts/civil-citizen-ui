import {t} from 'i18next';
import {Claim} from '../../../../../common/models/claim';
import {SummarySection} from '../../../../../common/models/summaryList/summarySections';
import {SupportRequired} from 'common/models/directionsQuestionnaire/supportRequired';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {YesNoUpperCase} from '../../../../../common/form/models/yesNo';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {SUPPORT_REQUIRED_URL,} from '../../../../../routes/urls';
import {changeLabel} from './buildHearingRequirementsSection';

export const generateSupportDetails = (item: SupportRequired) => {
  const supportDetails = [];
  if (item.disabledAccess) {
    supportDetails.push(t('PAGES.SUPPORT_REQUIRED.DISABLE'))
  }
  if (item.hearingLoop) {
    supportDetails.push(t('PAGES.SUPPORT_REQUIRED.HEARING'));
  }
  if (item.signLanguageInterpreter.selected) {
    supportDetails.push(item.signLanguageInterpreter.content + ' ' + t('PAGES.CHECK_YOUR_ANSWER.SUPPORT_REQUIRED_INTERPRETER'))
  }
  if (item.languageInterpreter.selected) {
    supportDetails.push(item.languageInterpreter.content + ' ' + t('PAGES.CHECK_YOUR_ANSWER.SUPPORT_REQUIRED_INTERPRETER'))
  }
  if (item.otherSupport.selected) {
    supportDetails.push(t('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_OTHER') + ` : ${item.otherSupport.content}`);
  }
  return supportDetails.join('<br>');
}


export const addSupportRequiredList = (claim: Claim, hearingRequirementsSection: SummarySection, claimId: string, lang: string | unknown) => {
  const supportRequiredHref = constructResponseUrlWithIdParams(claimId, SUPPORT_REQUIRED_URL);
  const supportRequiredList = claim.directionQuestionnaire?.hearing?.supportRequiredList;

  if (claim.hasSupportRequiredProvided && claim.isSupportRequiredDetailsAvailable) {
    hearingRequirementsSection.summaryList.rows.push(
      summaryRow(t('PAGES.SUPPORT_REQUIRED.TITLE', {lng: getLng(lang)}), t(`COMMON.${YesNoUpperCase.YES}`, {lng: getLng(lang)}), supportRequiredHref, changeLabel(lang)),
    );

    claim.isSupportRequiredDetailsAvailable && supportRequiredList.items.forEach(item => {
      hearingRequirementsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.SUPPORT_REQUIRED_NAME', {lng: getLng(lang)}), item.fullName, '', changeLabel(lang)));
      hearingRequirementsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.SUPPORT_REQUIRED_DETAILS', {lng: getLng(lang)}), generateSupportDetails(item), '', changeLabel(lang)));
    })
  } else {
    hearingRequirementsSection.summaryList.rows.push(
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_TITLE', {lng: getLng(lang)}), t(`COMMON.${YesNoUpperCase.NO}`, {lng: getLng(lang)}), supportRequiredHref, changeLabel(lang)),
    );
  }
};

