import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import { ApplicationType, ApplicationTypeOption } from 'models/generalApplication/applicationType';
import {t} from 'i18next';
import { ClaimFeeData } from 'common/models/civilClaimResponse';
import { convertToPoundsFilter } from 'common/utils/currencyFormat';

interface ContentParagraph {
  text?: string;
  variables?: object;
}

export const getApplicationCostsContent = (applicationTypes: ApplicationType[], gaFeeData: ClaimFeeData, lang: string) => {
  const pageSectionBuilder = new PageSectionBuilder();
  const gaFee = convertToPoundsFilter(gaFeeData?.calculatedAmountInPence.toString());
  const selectedApplicationTypeContent = getSelectedApplicationTypeContent(lang, gaFee);
  const applicationTypeOption = applicationTypes[applicationTypes.length - 1].option;
  if (applicationTypeOption in selectedApplicationTypeContent) {
    const content = selectedApplicationTypeContent[applicationTypeOption];
    content.forEach(contentParagraph => pageSectionBuilder.addParagraph(contentParagraph.text, contentParagraph.variables));
  } else {
    pageSectionBuilder.addParagraph('PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.TO_APPLY_MULTIPLE', {
      applicationType: t(`PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.${applicationTypeOption}`, {lng: lang}),
      applicationFee: gaFee,
    });
  }
  pageSectionBuilder.addParagraph('PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.FEE_NEED_TO_BE_PAID', {}, 'govuk-!-padding-bottom-5');
  return pageSectionBuilder.build();
};

const getSelectedApplicationTypeContent = (lang: string, gaFee: number) : Partial<{ [key in ApplicationTypeOption]: ContentParagraph[] }> => {
  return {
    [ApplicationTypeOption.ADJOURN_HEARING]: [
      {
        text: 'PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.TO_APPLY_MULTIPLE',
        variables: {
          applicationType: t('PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.ADJOURN_HEARING', {lng: lang}),
          applicationFee: gaFee,
        },
      },
      {text: 'PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.HEARING_MORE_THAN'},
      {text: 'PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.HEARING_LESS_THAN'},
      {text: 'PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.MAY_NOT_AGREE'},
    ],
    [ApplicationTypeOption.SET_ASIDE_JUDGEMENT]: [
      {
        text: 'PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.TO_APPLY',
        variables: {
          applicationType: t('PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.SET_ASIDE_JUDGEMENT', {lng: lang}),
          applicationFee: gaFee,
        },
      },
    ],
    [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT]: [
      {
        text: 'PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.TO_APPLY',
        variables: {
          applicationType: t('PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.VARY_PAYMENT_TERMS_OF_JUDGMENT', {lng: lang}),
          applicationFee: gaFee,
        },
      },
    ],
  };
};

