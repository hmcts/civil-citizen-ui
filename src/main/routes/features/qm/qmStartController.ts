import {Request, RequestHandler, Response, Router} from "express";
import {BACK_URL, CANCEL_URL, QM_BASE_START_PAGE} from 'routes/urls';

import {GenericForm} from "form/models/genericForm";
import {radioButtonItems, WhatDoYouWantToDo} from "form/models/qm/queryManagement";
import {Claim} from "models/claim";

const qmStartController = Router();
const qmStartViewPath = 'features/qm/qm-questions-template.njk';
const items = Array.of(
  new radioButtonItems('CHANGE_CASE', 'Change case', 'change-case', 'Change case', true),
  new radioButtonItems('CHANGE_CASE', 'Change case', 'change-case', 'Change case', true),
  new radioButtonItems('CHANGE_CASE', 'Change case', 'change-case', 'Change case', true),
  new radioButtonItems('CHANGE_CASE', 'Change case', 'change-case', 'Change case', true),
  new radioButtonItems('CHANGE_CASE', 'Change case', 'change-case', 'Change case', true));

const renderView = (claim: Claim, res: Response, req: Request)=> {
  const cancelUrl = CANCEL_URL
    .replace(':id', 'claimId')
    .replace(':propertyName', 'generalApplication');

  const backLinkUrl = BACK_URL;
  const form = new GenericForm(new WhatDoYouWantToDo(claim?.queryManagement?.whatDoYouWantToDo.option, items));
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
    renderView(new claim, res, req);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default qmStartController;
