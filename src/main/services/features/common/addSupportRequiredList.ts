import {Claim} from 'models/claim';
import {SummarySection} from 'models/summaryList/summarySections';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {SUPPORT_REQUIRED_URL} from 'routes/urls';
import {YesNo, YesNoUpperCase} from 'form/models/yesNo';
import {t} from 'i18next';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';
import {summaryRow} from 'models/summaryList/summaryList';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {SupportRequired} from 'models/directionsQuestionnaire/supportRequired';

export const addSupportRequiredListCommon = (claim: Claim, hearingRequirementsSection: SummarySection, claimId: string, lng: string,directionQuestionnaire:DirectionQuestionnaire) => {
  const supportRequiredHref = constructResponseUrlWithIdParams(claimId, SUPPORT_REQUIRED_URL);
  if (directionQuestionnaire?.hearing?.supportRequiredList?.option === YesNo.YES &&  directionQuestionnaire?.hearing?.supportRequiredList?.items?.length > 0) {
    hearingRequirementsSection.summaryList.rows.push(
      summaryRow(t('PAGES.SUPPORT_REQUIRED.TITLE', {lng}), t(`COMMON.${YesNoUpperCase.YES}`, {lng}), supportRequiredHref, changeLabel(lng)),
    );

    claim.isSupportRequiredDetailsAvailable && directionQuestionnaire?.hearing?.supportRequiredList.items.forEach((item, index) => {
      const row = index + 1;
      hearingRequirementsSection.summaryList.rows.push(summaryRow(`${t('PAGES.SUPPORT_REQUIRED.PERSON_TEXT', {lng})} ${row}`));
      hearingRequirementsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.SUPPORT_REQUIRED_NAME', {lng}), item.fullName, supportRequiredHref, changeLabel(lng)));
      hearingRequirementsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.SUPPORT_REQUIRED_DETAILS', {lng}), generateSupportDetails(item, lng), supportRequiredHref, changeLabel(lng)));
    });
  } else {
    hearingRequirementsSection.summaryList.rows.push(
      summaryRow(t('PAGES.SUPPORT_REQUIRED.TITLE', {lng}), t(`COMMON.${YesNoUpperCase.NO}`, {lng}), supportRequiredHref, changeLabel(lng)),
    );
  }
};
export const generateSupportDetails = (item: SupportRequired, lng: string) => {
  const supportDetails = [];
  if (item.disabledAccess) {
    supportDetails.push(t('PAGES.SUPPORT_REQUIRED.DISABLE', {lng}));
  }
  if (item.hearingLoop) {
    supportDetails.push(t('PAGES.SUPPORT_REQUIRED.HEARING', {lng}));
  }
  if (item.signLanguageInterpreter?.selected) {
    supportDetails.push(item.signLanguageInterpreter.content + ' ' + t('PAGES.CHECK_YOUR_ANSWER.SUPPORT_REQUIRED_INTERPRETER', {lng}));
  }
  if (item.languageInterpreter?.selected) {
    supportDetails.push(item.languageInterpreter.content + ' ' + t('PAGES.CHECK_YOUR_ANSWER.SUPPORT_REQUIRED_INTERPRETER', {lng}));
  }
  if (item.otherSupport?.selected) {
    supportDetails.push(t('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_OTHER', {lng}) + ` : ${item.otherSupport.content}`);
  }
  return supportDetails.join('<br>');
};
