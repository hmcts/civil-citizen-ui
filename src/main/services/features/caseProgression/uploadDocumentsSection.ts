import {ClaimSummarySection, ClaimSummaryType} from '../../../common/form/models/claimSummarySection';

export const getWitnessSubtitle = (subTitle:string): ClaimSummarySection => {
  return {
    type: ClaimSummaryType.SUBTITLE,
    data: {
      text: subTitle,
    },
  };
};
export const getInput = (title:string, classes:string,hint?: string): ClaimSummarySection => {
  return {
    type: ClaimSummaryType.INPUT,
    data: {
      text: title,
      hint: hint,
      classes:classes,
    },
  };
};
export const getDate = (title:string,  hint:string): ClaimSummarySection => {
  return {
    type: ClaimSummaryType.DATE,
    data: {
      id: 'date',
      name:'date',
      text: title,
      hint: hint,
      classes:'govuk-fieldset__legend--s',
    },
  };
};
export const getUpload = (title:string,  html:string): ClaimSummarySection => {
  return {
    type: ClaimSummaryType.UPLOAD,
    data: {
      id: 'file-upload',
      name:'file-upload',
      text: title,
      html: html,
    },
  };
};

