import {RequestHandler, Response, Router} from 'express';
import {
  BACK_URL, QM_FOLLOW_UP_URL, QM_INFORMATION_URL, QM_VIEW_QUERY_URL,
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

const qmInformationController = Router();
const qmStartViewPath = 'features/qm/qm-information-template.njk';
let showAnythingElseSection = false;

const getContent = (claimId: string, isFollowUpScreen: boolean, qualifyQuestionType: QualifyingQuestionTypeOption, lang: string): ClaimSummarySection[] => {

  //const pageInfo = 'PAGES.QM.QUALIFY.OPTIONS';
  const pageSection = new PageSectionBuilder();
  if (isFollowUpScreen) {
    showAnythingElseSection = false;
    const linkHref =  QM_VIEW_QUERY_URL.replace(':id', claimId);
    pageSection
      .addParagraph('Your messages are listed on your dashboard.')
      .addLink('Applications and messages to the court', linkHref, 'You can follow up on a message by selecting the one you want to view from the ', 'section.')
      .addParagraph('You can reply to any message from the court, your reply must be related to the subject of your original message.')
      .addParagraph('Do not send a follow up message if it has been less than 10 days since you sent your last message to the court as this could slow down the response from the court.');
  } else {
    switch (qualifyQuestionType) {
      case QualifyingQuestionTypeOption.CHANGE_THE_HEARING_DATE:{
        //TODO add page section content
        showAnythingElseSection = true;
        break;
      }
    }
  }
  return pageSection
    .build();
};

export const getTitle = (isFollowUpScreen:boolean, qualifyingQuestionTypeOption: QualifyingQuestionTypeOption) => {
  if (isFollowUpScreen) {
    return 'follow title';
  } else {
    return titleMap[qualifyingQuestionTypeOption];
  }
};

const titleMap: Partial<Record<QualifyingQuestionTypeOption, string>> = {
  [QualifyingQuestionTypeOption.CHANGE_THE_HEARING_DATE]: 'PAGES.QM.CAPTIONS.GET_UPDATE',
};
const renderView = (claimId: string, isFollowUpScreen: boolean, qmType: WhatToDoTypeOption, qualifyingQuestionTypeOption: QualifyingQuestionTypeOption, lang:string, res: Response)=> {
  const backLinkUrl = BACK_URL;
  const cancelUrl = getCancelUrl(claimId);
  const caption = getCaption(qmType);
  const title = getTitle(isFollowUpScreen, qualifyingQuestionTypeOption);
  const contents = getContent(claimId, isFollowUpScreen, qualifyingQuestionTypeOption, lang);
  res.render(qmStartViewPath, {
    backLinkUrl,
    pageTitle: title,
    title: title,
    caption,
    contents,
    cancelUrl,
    showAnythingElseSection,
  });
};

qmInformationController.get([QM_FOLLOW_UP_URL, QM_INFORMATION_URL], (async (req, res , next) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const qmType = req.params.qmType as WhatToDoTypeOption;
    const qualifyQuestionType = req.params.qmQualifyOption as QualifyingQuestionTypeOption || null;
    const isFollowUpScreen = req.path === QM_FOLLOW_UP_URL.replace(':id', claimId);
    renderView(claimId,isFollowUpScreen, qmType,qualifyQuestionType, lang, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default qmInformationController;
