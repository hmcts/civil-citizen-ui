import {RequestHandler, Response, Router} from 'express';
import {
  APPLICATION_TYPE_URL,
  BACK_URL,
  QM_CREATE_QUERY_URL, QM_FOLLOW_UP_URL,
  QM_WHAT_DO_YOU_WANT_TO_DO_URL,
} from 'routes/urls';

import {GenericForm} from 'form/models/genericForm';
import {
  QualifyingQuestion,
  QualifyingQuestionTypeOption,
  radioButtonItems,
  WhatToDoTypeOption
} from 'form/models/qm/queryManagement';
import { t } from 'i18next';
import {
  getCancelUrl,
  getCaption,
  getQueryManagement,
  saveQueryManagement
} from 'services/features/qm/queryManagementService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const qmWhatToDoController = Router();
const qmStartViewPath = 'features/qm/qm-questions-template.njk';

const QUERY_MANAGEMENT_PROPERTY_NAME = 'qualifyingQuestion';

const getRedirectPath = (option: WhatToDoTypeOption) => {
  return redirectionMap[option] || QM_WHAT_DO_YOU_WANT_TO_DO_URL;
};

const redirectionMap: Partial<Record<WhatToDoTypeOption, string>> = {
  [WhatToDoTypeOption.CHANGE_CASE]: APPLICATION_TYPE_URL,
  [WhatToDoTypeOption.GET_SUPPORT]: QM_CREATE_QUERY_URL,
  [WhatToDoTypeOption.FOLLOW_UP]: QM_FOLLOW_UP_URL,
  [WhatToDoTypeOption.SOMETHING_ELSE]: QM_CREATE_QUERY_URL,
};

const getValidationMessage = (option: WhatToDoTypeOption) => {
  return validationMap[option] || 'ERRORS.QUERY_MANAGEMENT_YOU_MUST_SELECT';
};

const validationMap: Partial<Record<WhatToDoTypeOption, string>> = {

};
const getItems = (option: string, qmType:WhatToDoTypeOption, lang: string) => {

  const pageInfo = 'PAGES.QM.QUALIFY.OPTIONS';
  switch (qmType) {
    case WhatToDoTypeOption.GET_UPDATE:{
      return [
        new radioButtonItems(QualifyingQuestionTypeOption.GENERAL_UPDATE, t(`${pageInfo}.${QualifyingQuestionTypeOption.GENERAL_UPDATE}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.GENERAL_UPDATE),
        new radioButtonItems(QualifyingQuestionTypeOption.CLAIM_NOT_PAID, t(`${pageInfo}.${QualifyingQuestionTypeOption.CLAIM_NOT_PAID}.TEXT`, {lang}), null, option === QualifyingQuestionTypeOption.CLAIM_NOT_PAID),
        new radioButtonItems(QualifyingQuestionTypeOption.CLAIM_NOT_PAID_AFTER_JUDGMENT, t(`${pageInfo}.${QualifyingQuestionTypeOption.CLAIM_NOT_PAID_AFTER_JUDGMENT}.TEXT`, {lang}),  null, option === QualifyingQuestionTypeOption.CLAIM_NOT_PAID_AFTER_JUDGMENT),
      ];
    }
    case WhatToDoTypeOption.SEND_UPDATE:{
      return [
        new radioButtonItems(QualifyingQuestionTypeOption.GENERAL_UPDATE, t(`${pageInfo}.${QualifyingQuestionTypeOption.GENERAL_UPDATE}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.GENERAL_UPDATE),
        new radioButtonItems(QualifyingQuestionTypeOption.CLAIM_NOT_PAID, t(`${pageInfo}.${QualifyingQuestionTypeOption.CLAIM_NOT_PAID}.TEXT`, {lang}), null, option === QualifyingQuestionTypeOption.CLAIM_NOT_PAID),
        new radioButtonItems(QualifyingQuestionTypeOption.CLAIM_NOT_PAID_AFTER_JUDGMENT, t(`${pageInfo}.${QualifyingQuestionTypeOption.CLAIM_NOT_PAID_AFTER_JUDGMENT}.TEXT`, {lang}),  null, option === QualifyingQuestionTypeOption.CLAIM_NOT_PAID_AFTER_JUDGMENT),
      ];
    }
    case WhatToDoTypeOption.SEND_DOCUMENTS:{
      return [
        new radioButtonItems(WhatToDoTypeOption.CHANGE_CASE, t(`${pageInfo}.${WhatToDoTypeOption.CHANGE_CASE}.TEXT`, {lang} ),  t(`${pageInfo}.${WhatToDoTypeOption.CHANGE_CASE}.HINT`, {lang}), option === WhatToDoTypeOption.CHANGE_CASE),
        new radioButtonItems(WhatToDoTypeOption.GET_UPDATE, t(`${pageInfo}.${WhatToDoTypeOption.GET_UPDATE}.TEXT`, {lang}), null, option === WhatToDoTypeOption.GET_UPDATE),
        new radioButtonItems(WhatToDoTypeOption.SEND_UPDATE, t(`${pageInfo}.${WhatToDoTypeOption.SEND_UPDATE}.TEXT`, {lang}),  t(`${pageInfo}.${WhatToDoTypeOption.CHANGE_CASE}.HINT`, {lang}), option === WhatToDoTypeOption.SEND_UPDATE),
        new radioButtonItems(WhatToDoTypeOption.SEND_DOCUMENTS, t(`${pageInfo}.${WhatToDoTypeOption.SEND_DOCUMENTS}.TEXT`, {lang}), null,  option === WhatToDoTypeOption.SEND_DOCUMENTS),
        new radioButtonItems(WhatToDoTypeOption.SOLVE_PROBLEM, t(`${pageInfo}.${WhatToDoTypeOption.SOLVE_PROBLEM}.TEXT`, {lang}),  t(`${pageInfo}.${WhatToDoTypeOption.SOLVE_PROBLEM}.HINT`, {lang}), option === WhatToDoTypeOption.SOLVE_PROBLEM),
        new radioButtonItems(WhatToDoTypeOption.MANAGE_HEARING, t(`${pageInfo}.${WhatToDoTypeOption.MANAGE_HEARING}.TEXT`, {lang}), null, option === WhatToDoTypeOption.MANAGE_HEARING),
        new radioButtonItems(WhatToDoTypeOption.GET_SUPPORT, t(`${pageInfo}.${WhatToDoTypeOption.GET_SUPPORT}.TEXT`, {lang}), null, option === WhatToDoTypeOption.GET_SUPPORT),
        new radioButtonItems(WhatToDoTypeOption.FOLLOW_UP, t(`${pageInfo}.${WhatToDoTypeOption.FOLLOW_UP}.TEXT`, {lang}), null, option === WhatToDoTypeOption.FOLLOW_UP),
        new radioButtonItems(WhatToDoTypeOption.SOMETHING_ELSE, t(`${pageInfo}.${WhatToDoTypeOption.SOMETHING_ELSE}.TEXT`, {lang}), null, option === WhatToDoTypeOption.SOMETHING_ELSE),
      ];
    }
    case WhatToDoTypeOption.SOLVE_PROBLEM:{
      return [
        new radioButtonItems(WhatToDoTypeOption.CHANGE_CASE, t(`${pageInfo}.${WhatToDoTypeOption.CHANGE_CASE}.TEXT`, {lang} ),  t(`${pageInfo}.${WhatToDoTypeOption.CHANGE_CASE}.HINT`, {lang}), option === WhatToDoTypeOption.CHANGE_CASE),
        new radioButtonItems(WhatToDoTypeOption.GET_UPDATE, t(`${pageInfo}.${WhatToDoTypeOption.GET_UPDATE}.TEXT`, {lang}), null, option === WhatToDoTypeOption.GET_UPDATE),
        new radioButtonItems(WhatToDoTypeOption.SEND_UPDATE, t(`${pageInfo}.${WhatToDoTypeOption.SEND_UPDATE}.TEXT`, {lang}),  t(`${pageInfo}.${WhatToDoTypeOption.CHANGE_CASE}.HINT`, {lang}), option === WhatToDoTypeOption.SEND_UPDATE),
        new radioButtonItems(WhatToDoTypeOption.SEND_DOCUMENTS, t(`${pageInfo}.${WhatToDoTypeOption.SEND_DOCUMENTS}.TEXT`, {lang}), null,  option === WhatToDoTypeOption.SEND_DOCUMENTS),
        new radioButtonItems(WhatToDoTypeOption.SOLVE_PROBLEM, t(`${pageInfo}.${WhatToDoTypeOption.SOLVE_PROBLEM}.TEXT`, {lang}),  t(`${pageInfo}.${WhatToDoTypeOption.SOLVE_PROBLEM}.HINT`, {lang}), option === WhatToDoTypeOption.SOLVE_PROBLEM),
        new radioButtonItems(WhatToDoTypeOption.MANAGE_HEARING, t(`${pageInfo}.${WhatToDoTypeOption.MANAGE_HEARING}.TEXT`, {lang}), null, option === WhatToDoTypeOption.MANAGE_HEARING),
        new radioButtonItems(WhatToDoTypeOption.GET_SUPPORT, t(`${pageInfo}.${WhatToDoTypeOption.GET_SUPPORT}.TEXT`, {lang}), null, option === WhatToDoTypeOption.GET_SUPPORT),
        new radioButtonItems(WhatToDoTypeOption.FOLLOW_UP, t(`${pageInfo}.${WhatToDoTypeOption.FOLLOW_UP}.TEXT`, {lang}), null, option === WhatToDoTypeOption.FOLLOW_UP),
        new radioButtonItems(WhatToDoTypeOption.SOMETHING_ELSE, t(`${pageInfo}.${WhatToDoTypeOption.SOMETHING_ELSE}.TEXT`, {lang}), null, option === WhatToDoTypeOption.SOMETHING_ELSE),
      ];
    }
    case WhatToDoTypeOption.MANAGE_HEARING:{
      return [
        new radioButtonItems(WhatToDoTypeOption.CHANGE_CASE, t(`${pageInfo}.${WhatToDoTypeOption.CHANGE_CASE}.TEXT`, {lang} ),  t(`${pageInfo}.${WhatToDoTypeOption.CHANGE_CASE}.HINT`, {lang}), option === WhatToDoTypeOption.CHANGE_CASE),
        new radioButtonItems(WhatToDoTypeOption.GET_UPDATE, t(`${pageInfo}.${WhatToDoTypeOption.GET_UPDATE}.TEXT`, {lang}), null, option === WhatToDoTypeOption.GET_UPDATE),
        new radioButtonItems(WhatToDoTypeOption.SEND_UPDATE, t(`${pageInfo}.${WhatToDoTypeOption.SEND_UPDATE}.TEXT`, {lang}),  t(`${pageInfo}.${WhatToDoTypeOption.CHANGE_CASE}.HINT`, {lang}), option === WhatToDoTypeOption.SEND_UPDATE),
        new radioButtonItems(WhatToDoTypeOption.SEND_DOCUMENTS, t(`${pageInfo}.${WhatToDoTypeOption.SEND_DOCUMENTS}.TEXT`, {lang}), null,  option === WhatToDoTypeOption.SEND_DOCUMENTS),
        new radioButtonItems(WhatToDoTypeOption.SOLVE_PROBLEM, t(`${pageInfo}.${WhatToDoTypeOption.SOLVE_PROBLEM}.TEXT`, {lang}),  t(`${pageInfo}.${WhatToDoTypeOption.SOLVE_PROBLEM}.HINT`, {lang}), option === WhatToDoTypeOption.SOLVE_PROBLEM),
        new radioButtonItems(WhatToDoTypeOption.MANAGE_HEARING, t(`${pageInfo}.${WhatToDoTypeOption.MANAGE_HEARING}.TEXT`, {lang}), null, option === WhatToDoTypeOption.MANAGE_HEARING),
        new radioButtonItems(WhatToDoTypeOption.GET_SUPPORT, t(`${pageInfo}.${WhatToDoTypeOption.GET_SUPPORT}.TEXT`, {lang}), null, option === WhatToDoTypeOption.GET_SUPPORT),
        new radioButtonItems(WhatToDoTypeOption.FOLLOW_UP, t(`${pageInfo}.${WhatToDoTypeOption.FOLLOW_UP}.TEXT`, {lang}), null, option === WhatToDoTypeOption.FOLLOW_UP),
        new radioButtonItems(WhatToDoTypeOption.SOMETHING_ELSE, t(`${pageInfo}.${WhatToDoTypeOption.SOMETHING_ELSE}.TEXT`, {lang}), null, option === WhatToDoTypeOption.SOMETHING_ELSE),
      ];
    }
  }
};

const renderView = (claimId: string,qmType: WhatToDoTypeOption, form: GenericForm<QualifyingQuestion>, res: Response)=> {
  const cancelUrl = getCancelUrl(claimId);
  const backLinkUrl = BACK_URL;
  const caption = getCaption(qmType);
  res.render(qmStartViewPath, {
    cancelUrl,
    backLinkUrl,
    pageTitle: 'PAGES.QM.WHAT_DO_YOU_WANT_TODO_TITLE',
    title: 'PAGES.QM.WHAT_DO_YOU_WANT_TODO_TITLE',
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
    const qmType = req.params.qmType as WhatToDoTypeOption;;
    const redisKey = generateRedisKey(<AppRequest>req);
    const option = req.body.option;
    const form = new GenericForm(new QualifyingQuestion(option, getItems(option, qmType, lang), getValidationMessage(option)));
    await form.validate();
    if (form.hasErrors()) {
      return renderView(claimId,qmType, form, res);
    }
    await saveQueryManagement(redisKey, form.model, QUERY_MANAGEMENT_PROPERTY_NAME, req);
    const redirectPath = getRedirectPath(option);
    res.redirect(constructResponseUrlWithIdParams(claimId, redirectPath.replace(':qmType', option)));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default qmWhatToDoController;
