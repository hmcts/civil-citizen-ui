import {RequestHandler, Response, Router} from 'express';
import {
  APPLICATION_TYPE_URL,
  CCJ_PAID_AMOUNT_URL,
  DATE_PAID_URL,
  BACK_URL,
  QUERY_MANAGEMENT_CREATE_QUERY,
  QM_FOLLOW_UP_URL,
  QM_INFORMATION_URL,
  QM_VIEW_QUERY_URL,
  UPLOAD_YOUR_DOCUMENTS_URL,
} from 'routes/urls';

import {
  QualifyingQuestionTypeOption,
  WhatToDoTypeOption,
} from 'form/models/queryManagement/queryManagement';
import {
  getCancelUrl,
  getCaption,
} from 'services/features/queryManagement/queryManagementService';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  attachmentOfEarningsOrderUrl,
  chargingOrderUrl,
  checkCivilFeesListFullListUrl,
  checkCivilFees_Ex50Url,
  checkCivilFeesListUrl,
  discontinueClaimUrl,
  countyCourtJudgmentsUri,
  findCourtTribunalUrl,
  thirdPartyDebtOrderUrl,
  warrantOfControlUrl,
  whatToDoUrl,
} from 'common/utils/externalURLs';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import { t } from 'i18next';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {LinKFromValues} from 'models/generalApplication/applicationType';

const qmInformationController = Router();

const qmStartViewPath = 'features/queryManagement/qm-information-template.njk';
let showAnythingElseSection = false;

const getCommonInformationSolveProblems = (pageSection: PageSectionBuilder, claimId: string)=> {
  const submitResponseClaimCommonInfo = 'PAGES.QM.QUALIFY_SECTIONS.COMMON_SOLVE_PROBLEMS';
  pageSection
    .addLink(`${submitResponseClaimCommonInfo}.LINK_1.TEXT`, constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY), `${submitResponseClaimCommonInfo}.LINK_1.TEXT_BEFORE`, `${submitResponseClaimCommonInfo}.LINK_1.TEXT_AFTER`)
    .addLink(`${submitResponseClaimCommonInfo}.LINK_2.TEXT`, findCourtTribunalUrl, `${submitResponseClaimCommonInfo}.LINK_2.TEXT_BEFORE`, null, null, true);
};

const getContent = (claimId: string,claim: Claim, isFollowUpScreen: boolean, qualifyQuestionType: QualifyingQuestionTypeOption, lang: string): ClaimSummarySection[] => {

  const qualifySectionInfo = 'PAGES.QM.QUALIFY_SECTIONS';
  const pageSection = new PageSectionBuilder();
  if (isFollowUpScreen) {
    showAnythingElseSection = false;
    const linkHref =  QM_VIEW_QUERY_URL.replace(':id', claimId);
    pageSection
      .addParagraph(`${qualifySectionInfo}.FOLLOW_UP.PARAGRAPH_1`)
      .addLink(`${qualifySectionInfo}.FOLLOW_UP.LINK.TEXT`, linkHref, `${qualifySectionInfo}.FOLLOW_UP.LINK.TEXT_BEFORE`, `${qualifySectionInfo}.FOLLOW_UP.LINK.TEXT_AFTER`)
      .addParagraph(`${qualifySectionInfo}.FOLLOW_UP.PARAGRAPH_2`)
      .addParagraph(`${qualifySectionInfo}.FOLLOW_UP.PARAGRAPH_3`);
  } else {
    switch (qualifyQuestionType) {
      case QualifyingQuestionTypeOption.ENFORCEMENT_REQUESTS:{
        showAnythingElseSection = true;
        pageSection
          .addParagraph(`${qualifySectionInfo}.ENFORCEMENT_REQUESTS.PARAGRAPH_1`)
          .addLink(`${qualifySectionInfo}.ENFORCEMENT_REQUESTS.LINK_1.TEXT`, whatToDoUrl, `${qualifySectionInfo}.ENFORCEMENT_REQUESTS.LINK_1.TEXT_BEFORE`, null, null, true)
          .addParagraph(`${qualifySectionInfo}.ENFORCEMENT_REQUESTS.PARAGRAPH_2`)
          .addParagraph(`${qualifySectionInfo}.ENFORCEMENT_REQUESTS.PARAGRAPH_3`)
          .addRawHtml(`<ul class="govuk-list govuk-list--bullet">
              <li><a href="${warrantOfControlUrl}" class="govuk-link" rel="noopener noreferrer" target="_blank">${t(`${qualifySectionInfo}.ENFORCEMENT_REQUESTS.LINK_2.TEXT`, {lng: lang})}</a></li>
              <li><a href="${attachmentOfEarningsOrderUrl}" class="govuk-link" rel="noopener noreferrer" target="_blank">${t(`${qualifySectionInfo}.ENFORCEMENT_REQUESTS.LINK_3.TEXT`, {lng: lang})}</a></li>
              <li><a href="${thirdPartyDebtOrderUrl}" class="govuk-link" rel="noopener noreferrer" target="_blank">${t(`${qualifySectionInfo}.ENFORCEMENT_REQUESTS.LINK_4.TEXT`, {lng: lang})}</a></li>
              <li><a href="${chargingOrderUrl}" class="govuk-link" rel="noopener noreferrer" target="_blank">${t(`${qualifySectionInfo}.ENFORCEMENT_REQUESTS.LINK_5.TEXT`, {lng: lang})}</a></li>
            </ul>`)
          .addLink(`${qualifySectionInfo}.ENFORCEMENT_REQUESTS.LINK_6.TEXT`, checkCivilFeesListUrl, `${qualifySectionInfo}.ENFORCEMENT_REQUESTS.LINK_6.TEXT_BEFORE`, `${qualifySectionInfo}.ENFORCEMENT_REQUESTS.LINK_6.TEXT_AFTER`, null, true);
        break;
      }
      case QualifyingQuestionTypeOption.CLAIM_DOCUMENTS_AND_EVIDENCE:{
        showAnythingElseSection = true;
        if(claim.isCaseProgressionCaseState()) {
          pageSection
            .addLink(`${qualifySectionInfo}.CLAIM_DOCUMENTS_AND_EVIDENCE.CP_STATE.LINK_1.TEXT`, constructResponseUrlWithIdParams(claimId,UPLOAD_YOUR_DOCUMENTS_URL), `${qualifySectionInfo}.CLAIM_DOCUMENTS_AND_EVIDENCE.CP_STATE.LINK_1.TEXT_BEFORE`, '.')
            .addParagraph(`${qualifySectionInfo}.CLAIM_DOCUMENTS_AND_EVIDENCE.CP_STATE.PARAGRAPH_1`)
            .addLink(`${qualifySectionInfo}.CLAIM_DOCUMENTS_AND_EVIDENCE.CP_STATE.LINK_2.TEXT`, constructResponseUrlWithIdParams(claimId,APPLICATION_TYPE_URL + `?linkFrom=${LinKFromValues.start}&isAskMoreTime=true`), `${qualifySectionInfo}.CLAIM_DOCUMENTS_AND_EVIDENCE.CP_STATE.LINK_2.TEXT_BEFORE`, '.');
        } else {
          pageSection
            .addSubTitle(`${qualifySectionInfo}.CLAIM_DOCUMENTS_AND_EVIDENCE.SUBTITLE_1`)
            .addParagraph(`${qualifySectionInfo}.CLAIM_DOCUMENTS_AND_EVIDENCE.PARAGRAPH_1`)
            .addParagraph(`${qualifySectionInfo}.CLAIM_DOCUMENTS_AND_EVIDENCE.PARAGRAPH_2`);
        }
        break;
      }
      case QualifyingQuestionTypeOption.SUBMIT_RESPONSE_CLAIM:{
        showAnythingElseSection = false;
        pageSection
          .addSubTitle(`${qualifySectionInfo}.SUBMIT_RESPONSE_CLAIM.SUBTITLE_1`)
          .addParagraph(`${qualifySectionInfo}.SUBMIT_RESPONSE_CLAIM.PARAGRAPH_1`);
        getCommonInformationSolveProblems(pageSection, claimId);
        break;
      }
      case QualifyingQuestionTypeOption.SEE_THE_CLAIM_ON_MY_ACCOUNT:{
        showAnythingElseSection = false;
        pageSection
          .addSubTitle(`${qualifySectionInfo}.SEE_THE_CLAIM_ON_MY_ACCOUNT.SUBTITLE_1`)
          .addParagraph(`${qualifySectionInfo}.SEE_THE_CLAIM_ON_MY_ACCOUNT.PARAGRAPH_1`);
        getCommonInformationSolveProblems(pageSection, claimId);
        break;
      }
      case QualifyingQuestionTypeOption.VIEW_DOCUMENTS_ON_MY_ACCOUNT:{
        showAnythingElseSection = false;
        pageSection
          .addSubTitle(`${qualifySectionInfo}.VIEW_DOCUMENTS_ON_MY_ACCOUNT.SUBTITLE_1`)
          .addParagraph(`${qualifySectionInfo}.VIEW_DOCUMENTS_ON_MY_ACCOUNT.PARAGRAPH_1`);
        getCommonInformationSolveProblems(pageSection, claimId);
        break;
      }
      case QualifyingQuestionTypeOption.GENERAL_UPDATE: {
        showAnythingElseSection = true;
        pageSection
          .addParagraph(`${qualifySectionInfo}.GENERAL_UPDATE.PARAGRAPH_1`)
          .addParagraph(`${qualifySectionInfo}.GENERAL_UPDATE.PARAGRAPH_2`)
          .addParagraph(`${qualifySectionInfo}.GENERAL_UPDATE.PARAGRAPH_3`);
        break;
      }
      case QualifyingQuestionTypeOption.CLAIM_NOT_PAID: {
        showAnythingElseSection = true;
        const isCCJLinkEnabled = claim.isClaimant() &&
          claim.isDeadLinePassed() &&
          claim.isDefendantNotResponded();
        pageSection
          .addParagraph(`${qualifySectionInfo}.CLAIM_NOT_PAID.PARAGRAPH_1`)
          .addParagraph(`${qualifySectionInfo}.CLAIM_NOT_PAID.PARAGRAPH_2`)
          .addRawHtml(`<ul class="govuk-list govuk-list--bullet">
              <li>${t(`${qualifySectionInfo}.CLAIM_NOT_PAID.LI_1`, {lng: lang})}</li>
              <li>${t(`${qualifySectionInfo}.CLAIM_NOT_PAID.LI_2`, {lng: lang})}</li>
              <li>${t(`${qualifySectionInfo}.CLAIM_NOT_PAID.LI_3`, {lng: lang})}</li>
            </ul>`)
          .addParagraph(`${qualifySectionInfo}.CLAIM_NOT_PAID.PARAGRAPH_3`)
          .addSubTitle(`${qualifySectionInfo}.CLAIM_NOT_PAID.SUBTITLE_1`);
        if (isCCJLinkEnabled) {
          pageSection.addLink(`${qualifySectionInfo}.CLAIM_NOT_PAID.LINK_1.TEXT`, constructResponseUrlWithIdParams(claimId, CCJ_PAID_AMOUNT_URL), `${qualifySectionInfo}.CLAIM_NOT_PAID.LINK_1.TEXT_BEFORE`, '.');
        } else {
          pageSection.addParagraph(`${qualifySectionInfo}.CLAIM_NOT_PAID.PARAGRAPH_WHEN_CCJ_IS_NOT_ENABLED`);
        }
        pageSection.addLink(`${qualifySectionInfo}.CLAIM_NOT_PAID.LINK_2.TEXT`, countyCourtJudgmentsUri, `${qualifySectionInfo}.CLAIM_NOT_PAID.LINK_2.TEXT_BEFORE`, '.', null, true);
        break;
      }
      case QualifyingQuestionTypeOption.CLAIM_NOT_PAID_AFTER_JUDGMENT: {
        showAnythingElseSection = true;
        pageSection
          .addParagraph(`${qualifySectionInfo}.CLAIM_NOT_PAID_AFTER_JUDGMENT.PARAGRAPH_1`)
          .addParagraph(`${qualifySectionInfo}.CLAIM_NOT_PAID_AFTER_JUDGMENT.PARAGRAPH_2`)
          .addRawHtml(`<ul class="govuk-list govuk-list--bullet">
              <li>${t(`${qualifySectionInfo}.CLAIM_NOT_PAID_AFTER_JUDGMENT.LI_1`, {lng: lang})}</li>
              <li>${t(`${qualifySectionInfo}.CLAIM_NOT_PAID_AFTER_JUDGMENT.LI_2`, {lng: lang})}</li>
              <li>${t(`${qualifySectionInfo}.CLAIM_NOT_PAID_AFTER_JUDGMENT.LI_3`, {lng: lang})}</li>
              <li>${t(`${qualifySectionInfo}.CLAIM_NOT_PAID_AFTER_JUDGMENT.LI_4`, {lng: lang})}</li>
            </ul>`)
          .addLink(`${qualifySectionInfo}.CLAIM_NOT_PAID_AFTER_JUDGMENT.LINK_1.TEXT`, whatToDoUrl, `${qualifySectionInfo}.CLAIM_NOT_PAID_AFTER_JUDGMENT.LINK_1.TEXT_BEFORE`, '.', null, true)
          .addSubTitle(`${qualifySectionInfo}.CLAIM_NOT_PAID_AFTER_JUDGMENT.SUBTITLE_1`)
          .addLink(`${qualifySectionInfo}.CLAIM_NOT_PAID_AFTER_JUDGMENT.LINK_2.TEXT`, checkCivilFees_Ex50Url, `${qualifySectionInfo}.CLAIM_NOT_PAID_AFTER_JUDGMENT.LINK_2.TEXT_BEFORE`, '.', null, true);

        break;
      }
      case QualifyingQuestionTypeOption.CHANGE_THE_HEARING_DATE:
        showAnythingElseSection = true;
        pageSection.addLink(`${qualifySectionInfo}.CHANGE_THE_HEARING_DATE.LINK_1.TEXT`, constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL + `?linkFrom=${LinKFromValues.start}&isAdjournHearing=true`), `${qualifySectionInfo}.CHANGE_THE_HEARING_DATE.LINK_1.TEXT_BEFORE`, '.')
          .addParagraph(`${qualifySectionInfo}.CHANGE_THE_HEARING_DATE.PARAGRAPH_1`)
          .addParagraph(`${qualifySectionInfo}.CHANGE_THE_HEARING_DATE.PARAGRAPH_2`)
          .addParagraph(`${qualifySectionInfo}.CHANGE_THE_HEARING_DATE.PARAGRAPH_3`)
          .addLink(`${qualifySectionInfo}.CHANGE_THE_HEARING_DATE.LINK_2.TEXT`, checkCivilFeesListUrl, `${qualifySectionInfo}.CHANGE_THE_HEARING_DATE.LINK_2.TEXT_BEFORE`, `${qualifySectionInfo}.CHANGE_THE_HEARING_DATE.LINK_2.TEXT_AFTER`, '', true)
          .addParagraph(`${qualifySectionInfo}.CHANGE_THE_HEARING_DATE.PARAGRAPH_4`);
        break;
      case QualifyingQuestionTypeOption.CHANGE_SOMETHING_ABOUT_THE_HEARING:
        showAnythingElseSection = true;
        pageSection.addParagraph(`${qualifySectionInfo}.CHANGE_SOMETHING_ABOUT_THE_HEARING.PARAGRAPH_1`)
          .addRawHtml(`<ul class="govuk-list govuk-list--bullet">
            <li>${t(`${qualifySectionInfo}.CHANGE_SOMETHING_ABOUT_THE_HEARING.LIST_1`, {lng: lang})}</li>
            <li>${t(`${qualifySectionInfo}.CHANGE_SOMETHING_ABOUT_THE_HEARING.LIST_2`, {lng: lang})}</li>
            </ul>`)
          .addLink(`${qualifySectionInfo}.CHANGE_SOMETHING_ABOUT_THE_HEARING.LINK_1.TEXT`, constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL + `?linkFrom=${LinKFromValues.start}`), `${qualifySectionInfo}.CHANGE_SOMETHING_ABOUT_THE_HEARING.LINK_1.TEXT_BEFORE`, `${qualifySectionInfo}.CHANGE_SOMETHING_ABOUT_THE_HEARING.LINK_1.TEXT_AFTER`)
          .addParagraph(`${qualifySectionInfo}.CHANGE_SOMETHING_ABOUT_THE_HEARING.PARAGRAPH_2`)
          .addLink(`${qualifySectionInfo}.CHANGE_SOMETHING_ABOUT_THE_HEARING.LINK_2.TEXT`, checkCivilFeesListUrl, `${qualifySectionInfo}.CHANGE_SOMETHING_ABOUT_THE_HEARING.LINK_2.TEXT_BEFORE`, '.', '', true);
        break;
      case QualifyingQuestionTypeOption.ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING:
        showAnythingElseSection = true;
        pageSection.addParagraph(`${qualifySectionInfo}.ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING.PARAGRAPH_1`)
          .addRawHtml(`<ul class="govuk-list govuk-list--bullet">
            <li>${t(`${qualifySectionInfo}.ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING.LIST_1`, {lng: lang})}</li>
            <li>${t(`${qualifySectionInfo}.ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING.LIST_2`, {lng: lang})}</li>
            <li>${t(`${qualifySectionInfo}.ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING.LIST_3`, {lng: lang})}</li>
            <li>${t(`${qualifySectionInfo}.ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING.LIST_4`, {lng: lang})}</li>
            </ul>`)
          .addLink(`${qualifySectionInfo}.ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING.LINK_1.TEXT`, findCourtTribunalUrl, `${qualifySectionInfo}.ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING.LINK_1.TEXT_BEFORE`, '.', '', true);
        break;
      case QualifyingQuestionTypeOption.PAID_OR_PARTIALLY_PAID_JUDGMENT: {
        showAnythingElseSection = true;
        pageSection
          .addSubTitle(`${qualifySectionInfo}.PAID_OR_PARTIALLY_PAID_JUDGMENT.SUBTITLE_1`)
          .addParagraph(`${qualifySectionInfo}.PAID_OR_PARTIALLY_PAID_JUDGMENT.PARAGRAPH_1`);
        break;
      }
      case QualifyingQuestionTypeOption.SETTLE_CLAIM: {
        showAnythingElseSection = true;
        pageSection
          .addSubTitle(`${qualifySectionInfo}.SETTLE_CLAIM.SUBTITLE_1`);
        if (claim.isClaimant() && !claim.isClaimSettled()) {
          pageSection
            .addLink(`${qualifySectionInfo}.SETTLE_CLAIM.NOT_SETTLED.LINK_1.TEXT`, constructResponseUrlWithIdParams(claimId, DATE_PAID_URL), `${qualifySectionInfo}.SETTLE_CLAIM.NOT_SETTLED.LINK_1.TEXT_BEFORE`, '.');
        } else {
          pageSection
            .addParagraph(`${qualifySectionInfo}.SETTLE_CLAIM.TEXT_UPDATE_WITHOUT_LINK`);
        }
        pageSection
          .addLink(`${qualifySectionInfo}.SETTLE_CLAIM.LINK_2.TEXT`, 'mailto:contactocmc@justice.gov.uk', `${qualifySectionInfo}.SETTLE_CLAIM.LINK_2.TEXT_BEFORE`, `${qualifySectionInfo}.SETTLE_CLAIM.LINK_2.TEXT_AFTER`)
          .addRawHtml(`<ul class="govuk-list govuk-list--bullet">
                <li>${t(`${qualifySectionInfo}.SETTLE_CLAIM.LI_1`, {lng: lang})}</li>
                <li>${t(`${qualifySectionInfo}.SETTLE_CLAIM.LI_2`, {lng: lang})}</li>
                <li>${t(`${qualifySectionInfo}.SETTLE_CLAIM.LI_3`, {lng: lang})}</li>
              </ul>`)
          .addSubTitle(`${qualifySectionInfo}.SETTLE_CLAIM.SUBTITLE_2`)
          .addParagraph(`${qualifySectionInfo}.SETTLE_CLAIM.TEXT_1`);
        break;
      }
      case QualifyingQuestionTypeOption.AMEND_CLAIM_DETAILS: {
        showAnythingElseSection = true;
        pageSection
          .addParagraph(`${qualifySectionInfo}.AMEND_CLAIM_DETAILS.TEXT_1`)
          .addRawHtml(`<ul class="govuk-list govuk-list--bullet">
                <li>${t(`${qualifySectionInfo}.AMEND_CLAIM_DETAILS.LI_1`, {lng: lang})}</li>
                <li>${t(`${qualifySectionInfo}.AMEND_CLAIM_DETAILS.LI_2`, {lng: lang})}</li>
                <li>${t(`${qualifySectionInfo}.AMEND_CLAIM_DETAILS.LI_3`, {lng: lang})}</li>
              </ul>`)
          .addLink(`${qualifySectionInfo}.AMEND_CLAIM_DETAILS.LINK_1.TEXT`, constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL + `?linkFrom=${LinKFromValues.start}&isAmendClaim=true`), `${qualifySectionInfo}.AMEND_CLAIM_DETAILS.LINK_1.TEXT_BEFORE`, `${qualifySectionInfo}.AMEND_CLAIM_DETAILS.LINK_1.TEXT_AFTER`)
          .addLink(`${qualifySectionInfo}.AMEND_CLAIM_DETAILS.LINK_2.TEXT`, checkCivilFeesListFullListUrl, `${qualifySectionInfo}.AMEND_CLAIM_DETAILS.LINK_2.TEXT_BEFORE`, `${qualifySectionInfo}.AMEND_CLAIM_DETAILS.LINK_2.TEXT_AFTER`, null, true)
          .addSubTitle(`${qualifySectionInfo}.AMEND_CLAIM_DETAILS.SUBTITLE_1`)
          .addLink(`${qualifySectionInfo}.AMEND_CLAIM_DETAILS.LINK_3.TEXT`, 'mailto:contactocmc@justice.gov.uk', `${qualifySectionInfo}.AMEND_CLAIM_DETAILS.LINK_3.TEXT_BEFORE`, '.')
          .addSubTitle(`${qualifySectionInfo}.AMEND_CLAIM_DETAILS.SUBTITLE_2`)
          .addLink(`${qualifySectionInfo}.AMEND_CLAIM_DETAILS.LINK_4.TEXT`, constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY), `${qualifySectionInfo}.AMEND_CLAIM_DETAILS.LINK_4.TEXT_BEFORE`, '.');
        break;
      }
      case QualifyingQuestionTypeOption.CLAIM_ENDED: {
        showAnythingElseSection = true;
        pageSection
          .addLink(`${qualifySectionInfo}.CLAIM_ENDED.LINK_1.TEXT`, discontinueClaimUrl, `${qualifySectionInfo}.CLAIM_ENDED.LINK_1.TEXT_BEFORE`, `${qualifySectionInfo}.CLAIM_ENDED.LINK_1.TEXT_AFTER`, null, true)
          .addParagraph(`${qualifySectionInfo}.CLAIM_ENDED.TEXT_1`)
          .addLink(`${qualifySectionInfo}.CLAIM_ENDED.LINK_2.TEXT`, findCourtTribunalUrl, `${qualifySectionInfo}.CLAIM_ENDED.LINK_2.TEXT_BEFORE`, `${qualifySectionInfo}.CLAIM_ENDED.LINK_2.TEXT_AFTER`, null, true);
        break;
      }

    }
  }
  return pageSection
    .build();
};

export const getTitle = (qualifyingQuestionTypeOption: QualifyingQuestionTypeOption) => {
  return titleMap[qualifyingQuestionTypeOption];
};

const titleMap: Partial<Record<QualifyingQuestionTypeOption, string>> = {
  [QualifyingQuestionTypeOption.ENFORCEMENT_REQUESTS]: 'PAGES.QM.QUALIFY.TITLES.ENFORCEMENT_REQUESTS',
  [QualifyingQuestionTypeOption.CLAIM_DOCUMENTS_AND_EVIDENCE]: 'PAGES.QM.QUALIFY.TITLES.CLAIM_DOCUMENTS_AND_EVIDENCE',
  [QualifyingQuestionTypeOption.SUBMIT_RESPONSE_CLAIM]: 'PAGES.QM.QUALIFY.TITLES.SUBMIT_RESPONSE_CLAIM',
  [QualifyingQuestionTypeOption.SEE_THE_CLAIM_ON_MY_ACCOUNT]: 'PAGES.QM.QUALIFY.TITLES.SEE_THE_CLAIM_ON_MY_ACCOUNT',
  [QualifyingQuestionTypeOption.VIEW_DOCUMENTS_ON_MY_ACCOUNT]: 'PAGES.QM.QUALIFY.TITLES.VIEW_DOCUMENTS_ON_MY_ACCOUNT',
  [QualifyingQuestionTypeOption.CHANGE_THE_HEARING_DATE]: 'PAGES.QM.QUALIFY.TITLES.CHANGE_THE_HEARING_DATE',
  [QualifyingQuestionTypeOption.CHANGE_SOMETHING_ABOUT_THE_HEARING]: 'PAGES.QM.QUALIFY.TITLES.CHANGE_SOMETHING_ABOUT_THE_HEARING',
  [QualifyingQuestionTypeOption.ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING]: 'PAGES.QM.QUALIFY.TITLES.ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING',
  [QualifyingQuestionTypeOption.GENERAL_UPDATE]: 'PAGES.QM.QUALIFY.TITLES.GENERAL_UPDATE',
  [QualifyingQuestionTypeOption.CLAIM_NOT_PAID]: 'PAGES.QM.QUALIFY.TITLES.CLAIM_NOT_PAID',
  [QualifyingQuestionTypeOption.CLAIM_NOT_PAID_AFTER_JUDGMENT]: 'PAGES.QM.QUALIFY.TITLES.CLAIM_NOT_PAID_AFTER_JUDGMENT',
  [QualifyingQuestionTypeOption.PAID_OR_PARTIALLY_PAID_JUDGMENT]: 'PAGES.QM.QUALIFY.TITLES.PAID_OR_PARTIALLY_PAID_JUDGMENT',
  [QualifyingQuestionTypeOption.SETTLE_CLAIM]: 'PAGES.QM.QUALIFY.TITLES.SETTLE_CLAIM',
  [QualifyingQuestionTypeOption.AMEND_CLAIM_DETAILS]: 'PAGES.QM.QUALIFY.TITLES.AMEND_CLAIM_DETAILS',
  [QualifyingQuestionTypeOption.CLAIM_ENDED]: 'PAGES.QM.QUALIFY.TITLES.CLAIM_ENDED',
};

const renderView = (claimId: string, claim: Claim, isFollowUpScreen: boolean, qmType: WhatToDoTypeOption, qualifyingQuestionTypeOption: QualifyingQuestionTypeOption, lang:string, res: Response)=> {
  const backLinkUrl = BACK_URL;
  const caption = getCaption(qmType);
  const title = isFollowUpScreen? 'PAGES.QM.QUALIFY.TITLES.FOLLOW_UP' : getTitle(qualifyingQuestionTypeOption);
  const createQueryUrl = constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY);

  const contents = getContent(claimId,claim, isFollowUpScreen, qualifyingQuestionTypeOption, lang);
  res.render(qmStartViewPath, {
    backLinkUrl,
    pageTitle: title,
    title: title,
    caption,
    contents,
    showAnythingElseSection,
    createQueryUrl,
  });
};

qmInformationController.get([QM_FOLLOW_UP_URL, QM_INFORMATION_URL], (async (req, res , next) => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const claimId = req.params.id;
  const qmType = req.params.qmType as WhatToDoTypeOption;
  const claim:Claim = await getClaimById(claimId, req,true);
  const qualifyQuestionType = req.params.qmQualifyOption as QualifyingQuestionTypeOption || null;
  const isFollowUpScreen = req.path === QM_FOLLOW_UP_URL.replace(':id', claimId);
  renderView(claimId,claim, isFollowUpScreen, qmType,qualifyQuestionType, lang, res);
}) as RequestHandler);

qmInformationController.post([QM_FOLLOW_UP_URL, QM_INFORMATION_URL], (async (req, res , next) => {
  const claimId = req.params.id;
  res.redirect(getCancelUrl(claimId));
}) as RequestHandler);

export default qmInformationController;
