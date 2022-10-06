import * as express from 'express';
import {
  CLAIM_COMPLETING_CLAIM_URL,
} from '../../urls';

const completingClaimViewPath = 'features/claim/completing-claim';
const completingClaimController = express.Router();

completingClaimController.get(CLAIM_COMPLETING_CLAIM_URL, (_req, res) => {
  res.render(completingClaimViewPath);
});

export default completingClaimController;
