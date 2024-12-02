import {ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';

export const buildPageContent = (applicationType: ApplicationTypeOption, lng: string) => {

  switch (applicationType) {

    case ApplicationTypeOption.SET_ASIDE_JUDGEMENT:
      return {
        contentList: new PageSectionBuilder()
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_SET_ASIDE_JUDGEMENT')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADD_OR_ALTER')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX')
          .build(),
        hintText: t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SET_ASIDE_JUDGEMENT_HINT_TEXT', {lng}),
      };

    case ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT:
      return {
        contentList: new PageSectionBuilder()
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_SHOULD')
          .addRawHtml(
            `<ul class="govuk-list govuk-list--bullet">
              <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_THAT', {lng})}</li>
              <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SUGGEST_NEW_PLAN', {lng})}</li>
            </ul>`)
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION')
          .build(),
        hintText: '',
      };

    case ApplicationTypeOption.VARY_ORDER:
      return {
        contentList: new PageSectionBuilder()
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SHOULD_EXPLAIN')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION')
          .build(),
        hintText: '',
      };

    case ApplicationTypeOption.ADJOURN_HEARING:
      return {
        contentList: new PageSectionBuilder()
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_ADJOURN_HEARING')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_WILL_NEED_ADD_INFO')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN_ALSO_ALTER')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX')
          .build(),
        hintText: t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADJOURN_HEARING_HINT_TEXT', {lng}),
      };

    case ApplicationTypeOption.EXTEND_TIME:
      return {
        contentList: new PageSectionBuilder()
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_MORE_TIME')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADD_INFO_MORE_TIME')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN_ALSO_ALTER')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX')
          .build(),
        hintText: t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.MORE_TIME_HINT_TEXT', {lng}),
      };

    case ApplicationTypeOption.RELIEF_FROM_SANCTIONS:
      return {
        contentList: new PageSectionBuilder()
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SHOULD_EXPLAIN_PENALTY')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION')
          .build(),
        hintText: '',
      };

    case ApplicationTypeOption.AMEND_A_STMT_OF_CASE:
      return {
        contentList: new PageSectionBuilder()
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_CHANGE_CLAIM')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN')
          .addRawHtml(
            `<ul class="govuk-list govuk-list--bullet">
              <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_DOCUMENT', {lng})}</li>
              <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.UPLOAD_NEW_VERSION', {lng})}</li>
            </ul>`)
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN_ALSO_ALTER')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX')
          .build(),
        hintText: t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CHANGE_CLAIM_HINT_TEXT', {lng}),
      };

    case ApplicationTypeOption.SUMMARY_JUDGEMENT:
      return {
        contentList: new PageSectionBuilder()
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_SUMMARY_JUDGMENT')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADD_OR_ALTER')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX')
          .build(),
        hintText: t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SUMMARY_JUDGMENT_HINT_TEXT', {lng}),
      };

    case ApplicationTypeOption.STRIKE_OUT:
      return {
        contentList: new PageSectionBuilder()
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_SHOULD')
          .addRawHtml(
            `<ul class="govuk-list govuk-list--bullet">
              <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_DOCUMENT_DISMISSED', {lng})}</li>
              <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.MENTION_DATE', {lng})}</li>
            </ul>`)
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION')
          .build(),
        hintText: '',
      };

    case ApplicationTypeOption.STAY_THE_CLAIM:
      return {
        contentList: new PageSectionBuilder()
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_STAY_THE_CLAIM')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADD_INFO_STAY_THE_CLAIM')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN_ALSO_ALTER')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX')
          .build(),
        hintText: t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.STAY_THE_CLAIM_HINT_TEXT', {lng}),
      };

    case ApplicationTypeOption.UNLESS_ORDER:
      return {
        contentList: new PageSectionBuilder()
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_SHOULD')
          .addRawHtml(
            `<ul class="govuk-list govuk-list--bullet">
              <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_ACTION_UNLESS_ORDER', {lng})}</li>
              <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_UNLESS_ORDER', {lng})}</li>
            </ul>`)
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION')
          .build(),
        hintText: '',
      };

    case ApplicationTypeOption.SETTLE_BY_CONSENT:
      return {
        contentList: new PageSectionBuilder()
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_SHOULD')
          .addRawHtml(
            `<ul class="govuk-list govuk-list--bullet">
              <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_SETTLED', {lng})}</li>
              <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.INCLUDE_NAME', {lng})}</li>
              <li>${t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_TERMS', {lng})}</li>
            </ul>`)
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION')
          .build(),
        hintText: '',
      };

    case ApplicationTypeOption.OTHER:
      return {
        contentList: new PageSectionBuilder()
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SHOULD_EXPLAIN_PROCEEDS_IN_HERITAGE')
          .addParagraph('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION')
          .build(),
        hintText: '',
      };

    default:
      return {contentList: [], hintText: ''};
  }
};
