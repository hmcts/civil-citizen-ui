import {RequestHandler} from 'express';
import {isUiPreviewEnabled} from 'common/utils/uiPreviewConfig';
import {UI_PREVIEW_URL} from 'routes/urls';

/** Runs before cookie/session/OIDC middleware. No prefix authentication exemption. */
export const uiPreviewBoundary: RequestHandler = (req, res, next) => {
  if (req.path === UI_PREVIEW_URL || req.path === `${UI_PREVIEW_URL}/`) {
    if (!isUiPreviewEnabled()) {
      res.status(404).type('text/plain').send('Not found');
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD');
      res.status(405).end();
      return;
    }
  }
  next();
};
