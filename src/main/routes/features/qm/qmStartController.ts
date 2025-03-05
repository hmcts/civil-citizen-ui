import {Request, RequestHandler, Response, Router} from "express";
import {BACK_URL, CANCEL_URL, QM_BASE_START_PAGE} from 'routes/urls';

import {GenericForm} from "form/models/genericForm";
import {radioButtonItems, WhatDoYouWantToDo, WhatToDoTypeOption} from "form/models/qm/queryManagement";
import {Claim} from "models/claim";
import { t } from "i18next";

const qmStartController = Router();
const qmStartViewPath = 'features/qm/qm-questions-template.njk';

function getItems(option: string) {
  const pageInfo = 'PAGES.QM.OPTIONS';
  return [
    new radioButtonItems(WhatToDoTypeOption.CHANGE_CASE, t(`${pageInfo}.${WhatToDoTypeOption.CHANGE_CASE}.TEXT`),  t(`${pageInfo}.${WhatToDoTypeOption.CHANGE_CASE}.HINT`), option === WhatToDoTypeOption.CHANGE_CASE),
    new radioButtonItems(WhatToDoTypeOption.GET_UPDATE, t(`${pageInfo}.${WhatToDoTypeOption.GET_UPDATE}.TEXT`), null, option === WhatToDoTypeOption.GET_UPDATE),
    new radioButtonItems(WhatToDoTypeOption.SEND_UPDATE, t(`${pageInfo}.${WhatToDoTypeOption.SEND_UPDATE}.TEXT`),  t(`${pageInfo}.${WhatToDoTypeOption.CHANGE_CASE}.HINT`), option === WhatToDoTypeOption.SEND_UPDATE),
    new radioButtonItems(WhatToDoTypeOption.SEND_DOCUMENTS, t(`${pageInfo}.${WhatToDoTypeOption.SEND_DOCUMENTS}.TEXT`), null,  option === WhatToDoTypeOption.SEND_DOCUMENTS),
    new radioButtonItems(WhatToDoTypeOption.SOLVE_PROBLEM, t(`${pageInfo}.${WhatToDoTypeOption.SOLVE_PROBLEM}.TEXT`),  t(`${pageInfo}.${WhatToDoTypeOption.SOLVE_PROBLEM}.HINT`), option === WhatToDoTypeOption.SOLVE_PROBLEM),
    new radioButtonItems(WhatToDoTypeOption.MANAGE_HEARING, t(`${pageInfo}.${WhatToDoTypeOption.MANAGE_HEARING}.TEXT`), null, option === WhatToDoTypeOption.MANAGE_HEARING),
    new radioButtonItems(WhatToDoTypeOption.GET_SUPPORT, t(`${pageInfo}.${WhatToDoTypeOption.GET_SUPPORT}.TEXT`), null, option === WhatToDoTypeOption.GET_SUPPORT),
    new radioButtonItems(WhatToDoTypeOption.FOLLOW_UP, t(`${pageInfo}.${WhatToDoTypeOption.FOLLOW_UP}.TEXT`), null, option === WhatToDoTypeOption.FOLLOW_UP),
    new radioButtonItems(WhatToDoTypeOption.SOMETHING_ELSE, t(`${pageInfo}.${WhatToDoTypeOption.SOMETHING_ELSE}.TEXT`), null, option === WhatToDoTypeOption.SOMETHING_ELSE),
  ];
}

const renderView = (claim: Claim, res: Response, req: Request)=> {
  const cancelUrl = CANCEL_URL
    .replace(':id', 'claimId')
    .replace(':propertyName', 'generalApplication');

  const backLinkUrl = BACK_URL;
  const option = claim?.queryManagement?.whatDoYouWantToDo.option;
  const form = new GenericForm(new WhatDoYouWantToDo(claim?.queryManagement?.whatDoYouWantToDo.option, getItems(option)));
  res.render(qmStartViewPath, {
    cancelUrl,
    backLinkUrl,
    pageTitle: 'PAGES.QM.WHAT_DO_YOU_WANT_TODO_TITLE',
    title: 'PAGES.QM.WHAT_DO_YOU_WANT_TODO_TITLE',
    caption: 'PAGES.QM.LEVEL_0.CAPTION',
    form,
  });
};

qmStartController.get(QM_BASE_START_PAGE, (async (req, res ,next) => {
  try {
    //todo add redis key
    renderView(new Claim(), res, req);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default qmStartController;
