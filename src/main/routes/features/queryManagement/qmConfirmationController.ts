import {Router} from 'express';
import {
  QM_CONFIRMATION_URL,
} from 'routes/urls';
import {getCancelUrl} from 'services/features/queryManagement/queryManagementService';

const qmConfirmationController = Router();
const qmConfirmationViewPath = 'features/qm/qm-confirmation-template.njk';

qmConfirmationController.get(QM_CONFIRMATION_URL, (req, res) => {
  const claimId = req.params.id;
  const cancelUrl = getCancelUrl(claimId);
  res.render(qmConfirmationViewPath, {
    cancelUrl,
  });
});

export default qmConfirmationController;
