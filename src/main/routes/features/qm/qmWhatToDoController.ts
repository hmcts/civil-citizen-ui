import {RequestHandler, Response, Router} from 'express';
import {
  BACK_URL, QM_INFORMATION_URL,
  QM_WHAT_DO_YOU_WANT_TO_DO_URL,
} from 'routes/urls';

import {GenericForm} from 'form/models/genericForm';
import {
  QualifyingQuestion,
  QualifyingQuestionTypeOption,
  RadioButtonItems,
  WhatToDoTypeOption,
} from 'form/models/qm/queryManagement';
import { t } from 'i18next';
import {
  getCancelUrl,
  getCaption,
  getQueryManagement,
  saveQueryManagement,
} from 'services/features/qm/queryManagementService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const qmWhatToDoController = Router();
const qmStartViewPath = 'features/qm/qm-questions-template.njk';

const QUERY_MANAGEMENT_PROPERTY_NAME = 'qualifyingQuestion';

const getRedirectPath = (qmType: WhatToDoTypeOption, option: QualifyingQuestionTypeOption) => {
  return QM_INFORMATION_URL.replace(':qmType', qmType).replace(':qmQualifyOption', option);
};

const getValidationMessage = (option: WhatToDoTypeOption) => {
  return validationMap[option] || 'ERRORS.QUERY_MANAGEMENT_YOU_MUST_SELECT';
};

const validationMap: Partial<Record<WhatToDoTypeOption, string>> = {
  [WhatToDoTypeOption.GET_UPDATE]: 'ERRORS.QUERY_MANAGEMENT_YOU_SELECT_UPDATE_YOU_WANT',
  [WhatToDoTypeOption.SEND_UPDATE]: 'ERRORS.QUERY_MANAGEMENT_YOU_SELECT_UPDATE_YOU_WANT',
  [WhatToDoTypeOption.SEND_DOCUMENTS]: 'ERRORS.QUERY_MANAGEMENT_YOU_MUST_SELECT_SEND_DOCUMENTS',
  [WhatToDoTypeOption.SOLVE_PROBLEM]: 'ERRORS.QUERY_MANAGEMENT_YOU_MUST_SELECT_SOLVE_PROBLEM',
  [WhatToDoTypeOption.MANAGE_HEARING]: 'ERRORS.QUERY_MANAGEMENT_HOW_YOU_WANT_TO_MANAGE_HEARING',
};

const getItems = (option: string, qmType:WhatToDoTypeOption, lang: string) => {

  const pageInfo = 'PAGES.QM.QUALIFY.OPTIONS';
  switch (qmType) {
    case WhatToDoTypeOption.GET_UPDATE:{
      return [
        new RadioButtonItems(QualifyingQuestionTypeOption.GENERAL_UPDATE, t(`${pageInfo}.${QualifyingQuestionTypeOption.GENERAL_UPDATE}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.GENERAL_UPDATE),
        new RadioButtonItems(QualifyingQuestionTypeOption.CLAIM_NOT_PAID, t(`${pageInfo}.${QualifyingQuestionTypeOption.CLAIM_NOT_PAID}.TEXT`, {lang}), null, option === QualifyingQuestionTypeOption.CLAIM_NOT_PAID),
        new RadioButtonItems(QualifyingQuestionTypeOption.CLAIM_NOT_PAID_AFTER_JUDGMENT, t(`${pageInfo}.${QualifyingQuestionTypeOption.CLAIM_NOT_PAID_AFTER_JUDGMENT}.TEXT`, {lang}),  null, option === QualifyingQuestionTypeOption.CLAIM_NOT_PAID_AFTER_JUDGMENT),
      ];
    }
    case WhatToDoTypeOption.SEND_UPDATE:{
      return [
        new RadioButtonItems(QualifyingQuestionTypeOption.PAID_OR_PARTIALLY_PAID_JUDGMENT, t(`${pageInfo}.${QualifyingQuestionTypeOption.PAID_OR_PARTIALLY_PAID_JUDGMENT}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.PAID_OR_PARTIALLY_PAID_JUDGMENT),
        new RadioButtonItems(QualifyingQuestionTypeOption.SETTLE_CLAIM, t(`${pageInfo}.${QualifyingQuestionTypeOption.SETTLE_CLAIM}.TEXT`, {lang}), null, option === QualifyingQuestionTypeOption.SETTLE_CLAIM),
        new RadioButtonItems(QualifyingQuestionTypeOption.AMEND_CLAIM_DETAILS, t(`${pageInfo}.${QualifyingQuestionTypeOption.AMEND_CLAIM_DETAILS}.TEXT`, {lang}),  t(`${pageInfo}.${QualifyingQuestionTypeOption.AMEND_CLAIM_DETAILS}.HINT`, {lang}), option === QualifyingQuestionTypeOption.AMEND_CLAIM_DETAILS),
        new RadioButtonItems(QualifyingQuestionTypeOption.CLAIM_ENDED, t(`${pageInfo}.${QualifyingQuestionTypeOption.CLAIM_ENDED}.TEXT`, {lang}),  null, option === QualifyingQuestionTypeOption.CLAIM_ENDED),
        new RadioButtonItems(QualifyingQuestionTypeOption.SEND_UPDATE_SOMETHING_ELSE, t(`${pageInfo}.SOMETHING_ELSE.TEXT`, {lang}),  null, option === QualifyingQuestionTypeOption.SEND_UPDATE_SOMETHING_ELSE),
      ];

    }
    case WhatToDoTypeOption.SEND_DOCUMENTS:{
      return [
        new RadioButtonItems(QualifyingQuestionTypeOption.ENFORCEMENT_REQUESTS, t(`${pageInfo}.${QualifyingQuestionTypeOption.ENFORCEMENT_REQUESTS}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.ENFORCEMENT_REQUESTS),
        new RadioButtonItems(QualifyingQuestionTypeOption.CLAIM_DOCUMENTS_AND_EVIDENCE, t(`${pageInfo}.${QualifyingQuestionTypeOption.CLAIM_DOCUMENTS_AND_EVIDENCE}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.CLAIM_DOCUMENTS_AND_EVIDENCE),
      ];
    }
    case WhatToDoTypeOption.SOLVE_PROBLEM:{
      return [
        new RadioButtonItems(QualifyingQuestionTypeOption.SUBMIT_RESPONSE_CLAIM, t(`${pageInfo}.${QualifyingQuestionTypeOption.SUBMIT_RESPONSE_CLAIM}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.SUBMIT_RESPONSE_CLAIM),
        new RadioButtonItems(QualifyingQuestionTypeOption.SEE_THE_CLAIM_ON_MY_ACCOUNT, t(`${pageInfo}.${QualifyingQuestionTypeOption.SEE_THE_CLAIM_ON_MY_ACCOUNT}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.SEE_THE_CLAIM_ON_MY_ACCOUNT),
        new RadioButtonItems(QualifyingQuestionTypeOption.VIEW_DOCUMENTS_ON_MY_ACCOUNT, t(`${pageInfo}.${QualifyingQuestionTypeOption.VIEW_DOCUMENTS_ON_MY_ACCOUNT}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.VIEW_DOCUMENTS_ON_MY_ACCOUNT),
        new RadioButtonItems(QualifyingQuestionTypeOption.SOLVE_PROBLEM_SOMETHING_ELSE, t(`${pageInfo}.SOMETHING_ELSE.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.SOLVE_PROBLEM_SOMETHING_ELSE),
      ];
    }
    case WhatToDoTypeOption.MANAGE_HEARING:{
      return [
        new RadioButtonItems(QualifyingQuestionTypeOption.CHANGE_THE_HEARING_DATE, t(`${pageInfo}.${QualifyingQuestionTypeOption.CHANGE_THE_HEARING_DATE}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.CHANGE_THE_HEARING_DATE),
        new RadioButtonItems(QualifyingQuestionTypeOption.CHANGE_SOMETHING_ABOUT_THE_HEARING, t(`${pageInfo}.${QualifyingQuestionTypeOption.CHANGE_SOMETHING_ABOUT_THE_HEARING}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.CHANGE_SOMETHING_ABOUT_THE_HEARING),
        new RadioButtonItems(QualifyingQuestionTypeOption.ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING, t(`${pageInfo}.${QualifyingQuestionTypeOption.ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING),
        new RadioButtonItems(QualifyingQuestionTypeOption.MANAGE_HEARING_SOMETHING_ELSE, t(`${pageInfo}.SOMETHING_ELSE.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.MANAGE_HEARING_SOMETHING_ELSE),
      ];
    }
  }
};

export const getTitle = (option: WhatToDoTypeOption) => {
  return titleMap[option] || 'PAGES.QM.WHAT_DO_YOU_WANT_TODO_TITLE';
};

const titleMap: Partial<Record<WhatToDoTypeOption, string>> = {
  [WhatToDoTypeOption.SEND_DOCUMENTS]: 'PAGES.QM.WHAT_DOCUMENT_DO_YOU_WANT_TO_SEND_TITLE',
  [WhatToDoTypeOption.SOLVE_PROBLEM]: 'PAGES.QM.WHAT_ARE_TRYING_TODO_TITLE',
  [WhatToDoTypeOption.MANAGE_HEARING]: 'PAGES.QM.WHAT_DO_YOU_NEED_TODO_TITLE',

};

const renderView = (claimId: string,qmType: WhatToDoTypeOption, form: GenericForm<QualifyingQuestion>, res: Response)=> {
  const cancelUrl = getCancelUrl(claimId);
  const backLinkUrl = BACK_URL;
  const caption = getCaption(qmType);
  const title = getTitle(qmType);
  res.render(qmStartViewPath, {
    cancelUrl,
    backLinkUrl,
    pageTitle: title,
    title: title,
    caption,
    form,
  });
};

qmWhatToDoController.get(QM_WHAT_DO_YOU_WANT_TO_DO_URL, (async (req, res , next) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const qmType = req.params.qmType as WhatToDoTypeOption;
    const queryManagement = await getQueryManagement(redisKey, req);
    const option = queryManagement.qualifyingQuestion?.option;
    const form = new GenericForm(
      new QualifyingQuestion(option, getItems(option ,qmType ,lang)));
    renderView(claimId, qmType, form, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

qmWhatToDoController.post(QM_WHAT_DO_YOU_WANT_TO_DO_URL, (async (req, res , next) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const qmType = req.params.qmType as WhatToDoTypeOption;
    const redisKey = generateRedisKey(<AppRequest>req);
    const option = req.body.option;
    const form = new GenericForm(new QualifyingQuestion(option, getItems(option, qmType, lang), getValidationMessage(qmType)));
    await form.validate();
    if (form.hasErrors()) {
      return renderView(claimId,qmType, form, res);
    }
    await saveQueryManagement(redisKey, form.model, QUERY_MANAGEMENT_PROPERTY_NAME, req);
    const redirectPath = getRedirectPath(qmType, option);
    res.redirect(constructResponseUrlWithIdParams(claimId, redirectPath));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default qmWhatToDoController;
