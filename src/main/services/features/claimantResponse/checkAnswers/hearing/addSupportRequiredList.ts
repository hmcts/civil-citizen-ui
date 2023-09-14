import {t} from 'i18next';
import {Claim} from '../../../../../common/models/claim';
import {SummarySection} from '../../../../../common/models/summaryList/summarySections';
import {SupportRequired} from 'common/models/directionsQuestionnaire/supportRequired';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {YesNoUpperCase} from '../../../../../common/form/models/yesNo';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {SUPPORT_REQUIRED_URL} from '../../../../../routes/urls';
import {changeLabel} from '../../../../../common/utils/checkYourAnswer/changeButton';

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

export const addSupportRequiredList = (claim: Claim, hearingRequirementsSection: SummarySection, claimId: string, lng: string) => {
  const supportRequiredHref = constructResponseUrlWithIdParams(claimId, SUPPORT_REQUIRED_URL);
  const supportRequiredList = claim.claimantResponse.directionQuestionnaire?.hearing?.supportRequiredList;

  if (claim.isClaimantResponseSupportRequiredYes && claim.isClaimantResponseSupportRequiredDetailsAvailable) {
    hearingRequirementsSection.summaryList.rows.push(
      summaryRow(t('PAGES.SUPPORT_REQUIRED.TITLE', {lng}), t(`COMMON.${YesNoUpperCase.YES}`, {lng}), supportRequiredHref, changeLabel(lng)),
    );

    claim.isSupportRequiredDetailsAvailable && supportRequiredList.items.forEach((item, index) => {
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

