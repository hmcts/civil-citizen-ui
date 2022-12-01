import {NextFunction, Response, Router} from 'express';
import {BREATHING_SPACE_CHECK_ANSWERS_URL, DASHBOARD_CLAIMANT_URL} from '../../../urls';
import {getSummarySections} from '../../../../services/features/breathingSpace/checkAnswersService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {AppRequest} from '../../../../common/models/AppRequest';
import {getBreathingSpace} from 'services/features/breathingSpace/breathingSpaceService';
import {BreathingSpace} from 'models/breathingSpace';

const checkAnswersViewPath = 'features/breathingSpace/check-answers';
const breathingSpaceCheckAnswersController = Router();

function renderView(req: AppRequest, res: Response, breathingSpace: BreathingSpace, userId: string) {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const summarySections = getSummarySections(userId, breathingSpace, lang);
    res.render(checkAnswersViewPath, {summarySections});
}

breathingSpaceCheckAnswersController.get(BREATHING_SPACE_CHECK_ANSWERS_URL,
    async (req: AppRequest, res: Response, next: NextFunction) => {
        try {
            const claimId = req.params.id;
            const breathingSpace = await getBreathingSpace(claimId);
            renderView(req, res, breathingSpace, claimId);
        } catch (error) {
            next(error);
        }
    });

breathingSpaceCheckAnswersController.post(BREATHING_SPACE_CHECK_ANSWERS_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
        // TODO: submitResponse to be implemented
        const userId = req.session?.user?.id;
        res.redirect(constructResponseUrlWithIdParams(userId, DASHBOARD_CLAIMANT_URL));
    } catch (error) {
        next(error);
    }
});

export default breathingSpaceCheckAnswersController;
