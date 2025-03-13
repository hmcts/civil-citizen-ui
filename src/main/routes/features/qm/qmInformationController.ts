import {RequestHandler, Response, Router} from 'express';
import {
  BACK_URL, QM_CREATE_QUERY_URL, QM_FOLLOW_UP_URL, QM_INFORMATION_URL, QM_VIEW_QUERY_URL,
} from 'routes/urls';

import {
  QualifyingQuestionTypeOption,
  WhatToDoTypeOption,
} from 'form/models/qm/queryManagement';
import {
  getCancelUrl,
  getCaption,
} from 'services/features/qm/queryManagementService';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  attachmentOfEarningsOrderUrl, chargingOrderUrl, checkCivilFeesListUrl,
  thirdPartyDebtOrderUrl,
  warrantOfControlUrl,
  whatToDoUrl,
} from 'common/utils/externalURLs';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import { t } from 'i18next';

const qmInformationController = Router();
const qmStartViewPath = 'features/qm/qm-information-template.njk';
let showAnythingElseSection = false;

const getContent = (claimId: string, isFollowUpScreen: boolean, qualifyQuestionType: QualifyingQuestionTypeOption, lang: string): ClaimSummarySection[] => {

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
        showAnythingElseSection = true;
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
  //TODO add other qualifying question types
};
const renderView = (claimId: string, isFollowUpScreen: boolean, qmType: WhatToDoTypeOption, qualifyingQuestionTypeOption: QualifyingQuestionTypeOption, lang:string, res: Response)=> {
  const backLinkUrl = BACK_URL;
  const caption = getCaption(qmType);
  const title = isFollowUpScreen? 'PAGES.QM.QUALIFY.TITLES.FOLLOW_UP' : getTitle(qualifyingQuestionTypeOption);
  const createQueryUrl = constructResponseUrlWithIdParams(claimId, QM_CREATE_QUERY_URL.replace(':qmType', qmType));
  const contents = getContent(claimId, isFollowUpScreen, qualifyingQuestionTypeOption, lang);
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
  const qualifyQuestionType = req.params.qmQualifyOption as QualifyingQuestionTypeOption || null;
  const isFollowUpScreen = req.path === QM_FOLLOW_UP_URL.replace(':id', claimId);
  renderView(claimId,isFollowUpScreen, qmType,qualifyQuestionType, lang, res);
}) as RequestHandler);

qmInformationController.post([QM_FOLLOW_UP_URL, QM_INFORMATION_URL], (async (req, res , next) => {
  const claimId = req.params.id;
  res.redirect(getCancelUrl(claimId));
}) as RequestHandler);

export default qmInformationController;
