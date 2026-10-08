import {AppRequest} from 'common/models/AppRequest';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'common/models/claim';
import {translateDraftClaimToCCDR2} from 'services/translation/claim/ccdTranslation';
import {Email} from 'models/Email';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const isCcdCaseId = (id: unknown): id is string =>
  typeof id === 'string' && /^\d+$/.test(id);

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

    if (claim.applicant1) {
      claim.applicant1.emailAddress = new Email(user.email);
      if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
        claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
      await updateDraftClaim(req, claim, draftId);
    }
    const ccdClaim = translateDraftClaimToCCDR2(claim, req);
    const submittedClaim = await civilServiceClient.submitDraftClaim(ccdClaim, req);

    if (draftId) {
      claim.id = submittedClaim.id;
      if (submittedClaim.legacyCaseReference) {
        claim.legacyCaseReference = submittedClaim.legacyCaseReference;
      }
      try {
        await updateDraftClaim(req, claim, draftId);
      } catch (persistError) {
        logger.error('[submitClaim] failed to persist submitted case id on draft after CCD accept', persistError);
      }
    }
    return submittedClaim;
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
