import {Router} from 'express';
import {
  QM_CONFIRMATION_URL,
} from 'routes/urls';
import {getCancelUrl} from 'services/features/queryManagement/queryManagementService';
import {getRouteParam} from 'common/utils/routeParamUtils';

const qmConfirmationController = Router();
const qmConfirmationViewPath = 'features/queryManagement/qm-confirmation-template.njk';

qmConfirmationController.get(QM_CONFIRMATION_URL, (req, res) => {
  const claimId = getRouteParam(req, 'id');
  const cancelUrl = getCancelUrl(claimId);
  res.render(qmConfirmationViewPath, {
    cancelUrl,
  });
});

export default qmConfirmationController;
