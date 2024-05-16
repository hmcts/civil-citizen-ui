import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {t} from 'i18next';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {YesNo} from 'form/models/yesNo';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

interface ContentParagraph {
  text?: string;
  variables?: object;
}

export const getApplicationCostsContent = async (applicationTypeOption: ApplicationTypeOption, withConsent: YesNo, withNotice: YesNo, lang: string, req: AppRequest) => {
  const gaFee = await civilServiceClient.getGeneralApplicationFee(applicationTypeOption, withConsent, withNotice, req);
  const pageSectionBuilder = new PageSectionBuilder();
  const selectedApplicationTypeContent = getSelectedApplicationTypeContent(lang, gaFee);
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
    [ApplicationTypeOption.VARY_ORDER]: [
      {
        text: 'PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.TO_APPLY',
        variables: {
          applicationType: t('PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.VARY_ORDER', {lng: lang}),
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
