
import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {ORDER_JUDGE_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {ApplicationType, ApplicationTypeOption, selectedApplicationType} from 'common/models/generalApplication/applicationType';
import {saveApplicationType} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import { PageSectionBuilder } from 'common/utils/pageSectionBuilder';
import { t } from 'i18next';

const orderJudgeController = Router();
const viewPath = 'features/generalApplication/order-judge';
const cancelUrl = 'test'; // TODO: add url
const backLinkUrl = 'test'; // TODO: add url

orderJudgeController.get(ORDER_JUDGE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const applicationType = selectedApplicationType[claim.generalApplication?.applicationType?.option];
    const {contentList, hintText} = buildPageContent(claim.generalApplication?.applicationType?.option);
    const form = new GenericForm(applicationType);
    res.render(viewPath, {
      form,
      cancelUrl,
      backLinkUrl,
      applicationType,
      contentList,
      hintText,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

orderJudgeController.post(ORDER_JUDGE_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    let applicationType = null;
    
    if (req.body.option === ApplicationTypeOption.OTHER) {
      applicationType = new ApplicationType(req.body.optionOther);
    } else {
      applicationType = new ApplicationType(req.body.option);
    }

    const form = new GenericForm(applicationType);
    await form.validate();
    if (form.hasErrors()) {
      res.render(viewPath, { form, cancelUrl, backLinkUrl });
    } else {
      await saveApplicationType(redisKey, applicationType);
      res.redirect('test'); // TODO: add url
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default orderJudgeController;


const buildPageContent = (applicationType: ApplicationTypeOption) => {
 
  switch (applicationType) {

    case ApplicationTypeOption.SET_ASIDE_JUDGEMENT:
      return {
        contentList: new PageSectionBuilder()
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_TO_MAKE'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADD_OR_ALTER'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX'))
        .build(), 
        hintText: t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SET_ASIDE_JUDGEMENT_HINT_TEXT'),
      };

    case ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT:
      // TODO: check N/A - no pre-populated variable This screen should not show in the case of a vary judgment application.
      return { 
        contentList: new PageSectionBuilder()
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_AND_MAKE'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_SHOULD'))
        .addRawHtml(
          `<ul class="govuk-list govuk-list--bullet">
            <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_THAT')}</li>
            <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SUGGEST_NEW_PLAN')}</li>
          </ul>`)      
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION'))
        .build(),
        hintText: '',
      };

    case ApplicationTypeOption.VARY_ORDER:
      return {
        contentList: new PageSectionBuilder()
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_AND_MAKE'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SHOULD_EXPLAIN'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION'))
        .build(),
        hintText: '',
      };

    case ApplicationTypeOption.ADJOURN_HEARING:
      return {
        contentList: new PageSectionBuilder()
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.A_JUDGE_WILL_CONSIDER'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_WILL_NEED_ADD_INFO'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN_ALSO_ALTER'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX'))
        .build(),
        hintText: t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADJOURN_HEARING_HINT_TEXT'),
      };

    case ApplicationTypeOption.EXTEND_TIME:
      return {
        contentList: new PageSectionBuilder()
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_MORE_TIME'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADD_INFO_MORE_TIME'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN_ALSO_ALTER'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX'))
        .build(),
        hintText: t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.MORE_TIME_HINT_TEXT'),
      };
      
    case ApplicationTypeOption.RELIEF_FROM_SANCTIONS:
      return {
        contentList: new PageSectionBuilder()
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_AND_MAKE'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SHOULD_EXPLAIN_PENALTY'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION'))
        .build(),
        hintText: '',
      };

    case ApplicationTypeOption.AMEND_A_STMT_OF_CASE:
      return { 
        contentList: new PageSectionBuilder()
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_CHANGE_CLAIM'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN'))
        .addRawHtml(
          `<ul class="govuk-list govuk-list--bullet">
            <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_DOCUMENT')}</li>
            <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.UPLOAD_NEW_VERSION')}</li>
          </ul>`)      
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN_ALSO_ALTER'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX'))
        .build(),
        hintText: t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CHANGE_CLAIM_HINT_TEXT'),
      };

    case ApplicationTypeOption.SUMMARY_JUDGMENT:
      return {
        contentList: new PageSectionBuilder()
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_SUMMARY_JUDGMENT'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADD_OR_ALTER'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX'))
        .build(),
        hintText: t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SUMMARY_JUDGMENT_HINT_TEXT'),
      };

    case ApplicationTypeOption.STRIKE_OUT:
      return {
        contentList: new PageSectionBuilder()
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_AND_MAKE'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_SHOULD'))
        .addRawHtml(
          `<ul class="govuk-list govuk-list--bullet">
            <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_DOCUMENT_DISMISSED')}</li>
            <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.MENTION_DATE')}</li>
          </ul>`)      
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION'))
        .build(),
        hintText: '',
      };

    case ApplicationTypeOption.STAY_THE_CLAIM:
      return {
        contentList: new PageSectionBuilder()
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_STAY_THE_CLAIM'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADD_INFO_STAY_THE_CLAIM'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN_ALSO_ALTER'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX'))
        .build(),
        hintText: t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.STAY_THE_CLAIM_HINT_TEXT'),
      };

      
    case ApplicationTypeOption.UNLESS_ORDER:
      return {
        contentList: new PageSectionBuilder()
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_AND_MAKE'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_SHOULD'))
        .addRawHtml(
          `<ul class="govuk-list govuk-list--bullet">
            <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_ACTION_UNLESS_ORDER')}</li>
            <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_UNLESS_ORDER')}</li>
          </ul>`)      
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'))
        .addParagraph(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION'))
        .build(),
        hintText: '',
      };

    
    case ApplicationTypeOption.SETTLE_BY_CONSENT:
      
      break;
        
    case ApplicationTypeOption.PROCEEDS_IN_HERITAGE:
    
      break;


    default:
      break;
  }
};