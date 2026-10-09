import {AppRequest} from 'common/models/AppRequest';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CIVIL_SERVICE_DRAFT_CLAIM_RETENTION_DAYS} from 'modules/draft-store/draftStoreDbService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'common/models/claim';
import {translateDraftClaimToCCDR2} from 'services/translation/claim/ccdTranslation';
import {Email} from 'models/Email';
import {app} from '../../../../app-instance';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const SUBMITTED_CLAIM_TTL_SECONDS = CIVIL_SERVICE_DRAFT_CLAIM_RETENTION_DAYS * 86400;
const SUBMISSION_PENDING = 'pending';
const SUBMISSION_RESERVATION_TTL_SECONDS = 60;
const SUBMISSION_WAIT_INTERVAL_MS = 500;
const SUBMISSION_WAIT_ATTEMPTS = 30;

interface SubmittedClaim {
  id: string;
  legacyCaseReference?: string;
}

const getSubmittedClaimKey = (userId: string, draftId: string, draftCreatedAt: string): string =>
  `submitted-claim:${userId}:${draftId}:${draftCreatedAt}`;

const reserveSubmission = async (key: string): Promise<boolean> =>
  (await app.locals.draftStoreClient.set(key, SUBMISSION_PENDING, 'EX', SUBMISSION_RESERVATION_TTL_SECONDS, 'NX')) === 'OK';

const releaseSubmission = async (key: string): Promise<void> => {
  try {
    await app.locals.draftStoreClient.del(key);
  } catch (err) {
    logger.error(`[submitClaim] failed to release submission ${key}`, err);
  }
};

const waitForSubmittedClaim = async (key: string): Promise<SubmittedClaim | null> => {
  for (let attempt = 0; attempt < SUBMISSION_WAIT_ATTEMPTS; attempt++) {
    const stored = await app.locals.draftStoreClient.get(key);
    if (!stored) {
      return null;
    }
    if (stored !== SUBMISSION_PENDING) {
      return JSON.parse(stored);
    }
    await new Promise(resolve => setTimeout(resolve, SUBMISSION_WAIT_INTERVAL_MS));
  }
  return null;
};

const saveSubmittedClaim = async (key: string, submittedClaim: SubmittedClaim): Promise<void> => {
  try {
    await app.locals.draftStoreClient.set(key, JSON.stringify(submittedClaim), 'EX', SUBMITTED_CLAIM_TTL_SECONDS);
  } catch (err) {
    logger.error(`[submitClaim] failed to save submitted claim ${submittedClaim.id}`, err);
  }
};

const isCcdCaseId = (id: unknown): id is string =>
  typeof id === 'string' && /^\d+$/.test(id);

const linkDraftToCase = async (req: AppRequest, claim: Claim, draftId: string, submittedClaim: Claim): Promise<void> => {
  claim.id = submittedClaim.id;
  if (submittedClaim.legacyCaseReference) {
    claim.legacyCaseReference = submittedClaim.legacyCaseReference;
  }
  try {
    await updateDraftClaim(req, claim, draftId);
  } catch (persistError) {
    logger.error('[submitClaim] failed to persist submitted case id on draft after CCD accept', persistError);
  }
};

export const submitClaim = async (req: AppRequest): Promise<Claim> => {
  try {
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[submitClaim] no draft claim found');
    }
    const user = (<AppRequest>req).session.user;
    const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    logger.info('Claim fee retrieved from check-your-answers');

    if (isCcdCaseId(claim.id)) {
      logger.info(`[submitClaim] draft already submitted as CCD case ${claim.id}, skipping create`);
      return claim;
    }

    const submittedClaimKey = getSubmittedClaimKey(user.id, draftResult.rawResponse?.draftId, draftResult.createdAt);
    if (!(await reserveSubmission(submittedClaimKey))) {
      const previouslySubmitted = await waitForSubmittedClaim(submittedClaimKey);
      if (!previouslySubmitted) {
        throw new Error('[submitClaim] draft claim submission is already in progress');
      }
      logger.info(`[submitClaim] draft already submitted as CCD case ${previouslySubmitted.id}, retrying draft link`);
      const submittedClaim = Object.assign(new Claim(), previouslySubmitted);
      await linkDraftToCase(req, claim, draftId, submittedClaim);
      return submittedClaim;
    }

    let submittedClaim: Claim;
    try {
      if (claim.applicant1) {
        claim.applicant1.emailAddress = new Email(user.email);
        if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
          claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
        }
        await updateDraftClaim(req, claim, draftId);
      }
      const ccdClaim = translateDraftClaimToCCDR2(claim, req);
      submittedClaim = await civilServiceClient.submitDraftClaim(ccdClaim, req);
    } catch (submitError) {
      await releaseSubmission(submittedClaimKey);
      throw submitError;
    }
    await saveSubmittedClaim(submittedClaimKey, {
      id: String(submittedClaim.id),
      legacyCaseReference: submittedClaim.legacyCaseReference,
    });
    await linkDraftToCase(req, claim, draftId, submittedClaim);
    return submittedClaim;
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
