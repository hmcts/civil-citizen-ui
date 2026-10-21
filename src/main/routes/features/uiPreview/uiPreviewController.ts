import {Router} from 'express';
import {UI_PREVIEW_URL} from 'routes/urls';
import {getUiPreviewPageCatalog} from 'services/features/uiPreview/pageCatalog';
import {isUiPreviewEnabled} from 'common/utils/uiPreviewConfig';

const controller = Router({caseSensitive: true, strict: true});
controller.get([UI_PREVIEW_URL, `${UI_PREVIEW_URL}/`], async (_req, res, next) => {
  if (!isUiPreviewEnabled()) { res.status(404).end(); return; }
  try {
    await res.app.locals.uiPreviewReady;
    res.setHeader('X-UI-Preview', 'synthetic-local-only');
    res.render('features/ui-preview/index', {pageTitle: 'UI preview', catalog: getUiPreviewPageCatalog()});
  } catch (error) { next(error); }
});
export default controller;
