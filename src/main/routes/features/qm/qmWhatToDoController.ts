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
  [WhatToDoTypeOption.SEND_DOCUMENTS]: 'ERRORS.QUERY_MANAGEMENT_YOU_MUST_SELECT_SEND_DOCUMENTS',
  [WhatToDoTypeOption.SOLVE_PROBLEM]: 'ERRORS.QUERY_MANAGEMENT_YOU_MUST_SELECT_SOLVE_PROBLEM',
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
        new radioButtonItems(QualifyingQuestionTypeOption.PAID_OR_PARTIALLY_PAID_JUDGMENT, t(`${pageInfo}.${QualifyingQuestionTypeOption.PAID_OR_PARTIALLY_PAID_JUDGMENT}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.PAID_OR_PARTIALLY_PAID_JUDGMENT),
        new radioButtonItems(QualifyingQuestionTypeOption.SETTLE_CLAIM, t(`${pageInfo}.${QualifyingQuestionTypeOption.SETTLE_CLAIM}.TEXT`, {lang}), null, option === QualifyingQuestionTypeOption.SETTLE_CLAIM),
        new radioButtonItems(QualifyingQuestionTypeOption.AMEND_CLAIM_DETAILS, t(`${pageInfo}.${QualifyingQuestionTypeOption.AMEND_CLAIM_DETAILS}.TEXT`, {lang}),  t(`${pageInfo}.${QualifyingQuestionTypeOption.AMEND_CLAIM_DETAILS}.HINT`, {lang}), option === QualifyingQuestionTypeOption.AMEND_CLAIM_DETAILS),
        new radioButtonItems(QualifyingQuestionTypeOption.CLAIM_ENDED, t(`${pageInfo}.${QualifyingQuestionTypeOption.CLAIM_ENDED}.TEXT`, {lang}),  null, option === QualifyingQuestionTypeOption.CLAIM_ENDED),
        new radioButtonItems(QualifyingQuestionTypeOption.SOMETHING_ELSE, t(`${pageInfo}.${QualifyingQuestionTypeOption.SOMETHING_ELSE}.TEXT`, {lang}),  null, option === QualifyingQuestionTypeOption.SOMETHING_ELSE),
      ];

    }
    case WhatToDoTypeOption.SEND_DOCUMENTS:{
      return [
        new radioButtonItems(QualifyingQuestionTypeOption.ENFORCEMENT_REQUESTS, t(`${pageInfo}.${QualifyingQuestionTypeOption.ENFORCEMENT_REQUESTS}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.ENFORCEMENT_REQUESTS),
        new radioButtonItems(QualifyingQuestionTypeOption.CLAIM_DOCUMENTS_AND_EVIDENCE, t(`${pageInfo}.${QualifyingQuestionTypeOption.CLAIM_DOCUMENTS_AND_EVIDENCE}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.CLAIM_DOCUMENTS_AND_EVIDENCE),
      ];
    }
    case WhatToDoTypeOption.SOLVE_PROBLEM:{
      return [
        new radioButtonItems(QualifyingQuestionTypeOption.SUBMIT_RESPONSE_CLAIM, t(`${pageInfo}.${QualifyingQuestionTypeOption.SUBMIT_RESPONSE_CLAIM}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.SUBMIT_RESPONSE_CLAIM),
        new radioButtonItems(QualifyingQuestionTypeOption.SEE_THE_CLAIM_ON_MY_ACCOUNT, t(`${pageInfo}.${QualifyingQuestionTypeOption.SEE_THE_CLAIM_ON_MY_ACCOUNT}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.SEE_THE_CLAIM_ON_MY_ACCOUNT),
        new radioButtonItems(QualifyingQuestionTypeOption.VIEW_DOCUMENTS_ON_MY_ACCOUNT, t(`${pageInfo}.${QualifyingQuestionTypeOption.VIEW_DOCUMENTS_ON_MY_ACCOUNT}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.VIEW_DOCUMENTS_ON_MY_ACCOUNT),
        new radioButtonItems(QualifyingQuestionTypeOption.SOMETHING_ELSE, t(`${pageInfo}.${QualifyingQuestionTypeOption.SOMETHING_ELSE}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.SOMETHING_ELSE),
      ];
    }
    case WhatToDoTypeOption.MANAGE_HEARING:{
      return [
        new radioButtonItems(QualifyingQuestionTypeOption.CHANGE_THE_HEARING_DATE, t(`${pageInfo}.${QualifyingQuestionTypeOption.CHANGE_THE_HEARING_DATE}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.CHANGE_THE_HEARING_DATE),
        new radioButtonItems(QualifyingQuestionTypeOption.CHANGE_SOMETHING_ABOUT_THE_HEARING, t(`${pageInfo}.${QualifyingQuestionTypeOption.CHANGE_SOMETHING_ABOUT_THE_HEARING}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.CHANGE_SOMETHING_ABOUT_THE_HEARING),
        new radioButtonItems(QualifyingQuestionTypeOption.ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING, t(`${pageInfo}.${QualifyingQuestionTypeOption.ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING),
        new radioButtonItems(QualifyingQuestionTypeOption.SOMETHING_ELSE, t(`${pageInfo}.${QualifyingQuestionTypeOption.SOMETHING_ELSE}.TEXT`, {lang} ),  null, option === QualifyingQuestionTypeOption.SOMETHING_ELSE),
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
    const form = new GenericForm(new QualifyingQuestion(option, getItems(option, qmType, lang), getValidationMessage(qmType)));
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
