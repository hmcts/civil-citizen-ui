import {RequestHandler, Response, Router} from 'express';
import {
  APPLICATION_TYPE_URL,
  BACK_URL,
  QM_CREATE_QUERY_URL, QM_FOLLOW_UP_URL,
  QM_START_URL, QM_WHAT_DO_YOU_WANT_TO_DO_URL,
} from 'routes/urls';

import {GenericForm} from 'form/models/genericForm';
import {RadioButtonItems, WhatDoYouWantToDo, WhatToDoTypeOption} from 'form/models/qm/queryManagement';
import { t } from 'i18next';
import {
  deleteQueryManagement,
  getCancelUrl,
  getQueryManagement,
  saveQueryManagement,
} from 'services/features/qm/queryManagementService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const qmStartController = Router();
const qmStartViewPath = 'features/qm/qm-questions-template.njk';

const QUERY_MANAGEMENT_PROPERTY_NAME = 'whatDoYouWantToDo';

const getRedirectPath = (option: WhatToDoTypeOption) => {
  return redirectionMap[option] || QM_WHAT_DO_YOU_WANT_TO_DO_URL;
};

const redirectionMap: Partial<Record<WhatToDoTypeOption, string>> = {
  [WhatToDoTypeOption.CHANGE_CASE]: APPLICATION_TYPE_URL,
  [WhatToDoTypeOption.GET_SUPPORT]: QM_CREATE_QUERY_URL,
  [WhatToDoTypeOption.FOLLOW_UP]: QM_FOLLOW_UP_URL,
  [WhatToDoTypeOption.SOMETHING_ELSE]: QM_CREATE_QUERY_URL,
};

const getItems = (option: string, lng: string) => {
  const pageInfo = 'PAGES.QM.OPTIONS';
  return [
    new RadioButtonItems(WhatToDoTypeOption.CHANGE_CASE, t(`${pageInfo}.${WhatToDoTypeOption.CHANGE_CASE}.TEXT`, {lng} ),  t(`${pageInfo}.${WhatToDoTypeOption.CHANGE_CASE}.HINT`, {lng}), option === WhatToDoTypeOption.CHANGE_CASE),
    new RadioButtonItems(WhatToDoTypeOption.GET_UPDATE, t(`${pageInfo}.${WhatToDoTypeOption.GET_UPDATE}.TEXT`, {lng}), null, option === WhatToDoTypeOption.GET_UPDATE),
    new RadioButtonItems(WhatToDoTypeOption.SEND_UPDATE, t(`${pageInfo}.${WhatToDoTypeOption.SEND_UPDATE}.TEXT`, {lng}),  t(`${pageInfo}.${WhatToDoTypeOption.CHANGE_CASE}.HINT`, {lng}), option === WhatToDoTypeOption.SEND_UPDATE),
    new RadioButtonItems(WhatToDoTypeOption.SEND_DOCUMENTS, t(`${pageInfo}.${WhatToDoTypeOption.SEND_DOCUMENTS}.TEXT`, {lng}), null,  option === WhatToDoTypeOption.SEND_DOCUMENTS),
    new RadioButtonItems(WhatToDoTypeOption.SOLVE_PROBLEM, t(`${pageInfo}.${WhatToDoTypeOption.SOLVE_PROBLEM}.TEXT`, {lng}),  t(`${pageInfo}.${WhatToDoTypeOption.SOLVE_PROBLEM}.HINT`, {lng}), option === WhatToDoTypeOption.SOLVE_PROBLEM),
    new RadioButtonItems(WhatToDoTypeOption.MANAGE_HEARING, t(`${pageInfo}.${WhatToDoTypeOption.MANAGE_HEARING}.TEXT`, {lng}), null, option === WhatToDoTypeOption.MANAGE_HEARING),
    new RadioButtonItems(WhatToDoTypeOption.GET_SUPPORT, t(`${pageInfo}.${WhatToDoTypeOption.GET_SUPPORT}.TEXT`, {lng}), null, option === WhatToDoTypeOption.GET_SUPPORT),
    new RadioButtonItems(WhatToDoTypeOption.FOLLOW_UP, t(`${pageInfo}.${WhatToDoTypeOption.FOLLOW_UP}.TEXT`, {lng}), null, option === WhatToDoTypeOption.FOLLOW_UP),
    new RadioButtonItems(WhatToDoTypeOption.SOMETHING_ELSE, t(`${pageInfo}.${WhatToDoTypeOption.SOMETHING_ELSE}.TEXT`, {lng}), null, option === WhatToDoTypeOption.SOMETHING_ELSE),
  ];
};

const renderView = (claimId: string, form: GenericForm<WhatDoYouWantToDo>, res: Response)=> {
  const cancelUrl = getCancelUrl(claimId);
  const backLinkUrl = BACK_URL;

  res.render(qmStartViewPath, {
    cancelUrl,
    backLinkUrl,
    pageTitle: 'PAGES.QM.WHAT_DO_YOU_WANT_TODO_TITLE',
    title: 'PAGES.QM.WHAT_DO_YOU_WANT_TODO_TITLE',
    caption: 'PAGES.QM.LEVEL_0.CAPTION',
    form,
  });
};

qmStartController.get(QM_START_URL, (async (req:AppRequest, res , next) => {
  try {
    const redisKey = generateRedisKey(req);
    const linkFrom = req.query.linkFrom;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    if (linkFrom === 'start') {
      await deleteQueryManagement(redisKey, req);
    }
    const queryManagement = await getQueryManagement(redisKey, req);
    const option = queryManagement.whatDoYouWantToDo?.option;
    const form = new GenericForm(new WhatDoYouWantToDo(option, getItems(option, lang)));
    renderView(claimId, form, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

qmStartController.post(QM_START_URL, (async (req, res , next) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const option = req.body.option;
    const form = new GenericForm(new WhatDoYouWantToDo(option, getItems(option, lang)));
    await form.validate();
    if (form.hasErrors()) {
      return renderView(claimId,form, res);
    }
    await saveQueryManagement(redisKey, form.model, QUERY_MANAGEMENT_PROPERTY_NAME, req);
    const redirectPath = getRedirectPath(option);
    res.redirect(constructResponseUrlWithIdParams(claimId, redirectPath.replace(':qmType', option)));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default qmStartController;
