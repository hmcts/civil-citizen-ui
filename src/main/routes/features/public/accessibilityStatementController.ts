import {Router} from 'express';
import {ACCESSIBILITY_STATEMENT_URL} from '../../../routes/urls';

const accessibilityStatementController = Router();

accessibilityStatementController.get(ACCESSIBILITY_STATEMENT_URL, (req, res) => {
  res.render('features/public/accessibility-statement');
});

export default accessibilityStatementController;
