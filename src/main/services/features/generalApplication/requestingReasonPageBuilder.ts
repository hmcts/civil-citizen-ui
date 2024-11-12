import {ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';

export const buildRequestingReasonPageContent = (applicationType: ApplicationTypeOption, lng: string) => {

  switch (applicationType) {

    case ApplicationTypeOption.SET_ASIDE_JUDGEMENT:
      return new PageSectionBuilder()
        .addParagraph('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.CANCEL_JUDGMENT.SHOULD')
        .addRawHtml(
          `<ul class="govuk-list govuk-list--bullet">
            <li>${t('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.CANCEL_JUDGMENT.EXPLAIN', {lng})}</li>
            <li>${t('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.CANCEL_JUDGMENT.IF_DONT_BELIEVE', {lng})}</li>
          </ul>`)
        .addParagraph('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.CANCEL_JUDGMENT.YOU_WILL_HAVE_OPTION')
        .build();

    case ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT:
      return new PageSectionBuilder()
        .addParagraph('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.VARY_JUDGMENT')
        .build();

    case ApplicationTypeOption.VARY_ORDER:
      return new PageSectionBuilder()
        .addParagraph('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.RECONSIDER')
        .build();

    case ApplicationTypeOption.ADJOURN_HEARING:
      return new PageSectionBuilder()
        .addParagraph('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.CHANGE_HEARING')
        .build();

    case ApplicationTypeOption.EXTEND_TIME:
      return new PageSectionBuilder()
        .addParagraph('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.MORE_TIME')
        .build();

    case ApplicationTypeOption.RELIEF_FROM_SANCTIONS:
      return new PageSectionBuilder()
        .addParagraph('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.RELIEF_PENALTY.SHOULD')
        .addRawHtml(
          `<ul class="govuk-list govuk-list--bullet">
            <li>${t('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.RELIEF_PENALTY.WHY_BEEN_UNABLE', {lng})}</li>
            <li>${t('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.RELIEF_PENALTY.THE_EFFECT', {lng})}</li>
            <li>${t('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.RELIEF_PENALTY.ANY_RELEVANT_INFORMATION', {lng})}</li>
          </ul>`)
        .addParagraph('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.RELIEF_PENALTY.YOU_WILL_HAVE_OPTION')
        .build();

    case ApplicationTypeOption.AMEND_A_STMT_OF_CASE:
      return new PageSectionBuilder()
        .addParagraph('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.CHANGE_CLAIM')
        .build();

    case ApplicationTypeOption.SUMMARY_JUDGEMENT:
      return new PageSectionBuilder()
        .addParagraph('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.SUMMARY_JUDGMENT')
        .build();

    case ApplicationTypeOption.STRIKE_OUT:
      return new PageSectionBuilder()
        .addParagraph('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.STRIKE_OUT')
        .build();

    case ApplicationTypeOption.STAY_THE_CLAIM:
      return new PageSectionBuilder()
        .addParagraph('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.PAUSE')
        .build();

    case ApplicationTypeOption.UNLESS_ORDER:
      return new PageSectionBuilder()
        .addParagraph('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.IMPOSE_SANCTION')
        .build();

    default:
      return new PageSectionBuilder()
        .addParagraph('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.NOT_ON_LIST')
        .build();
  }
};
