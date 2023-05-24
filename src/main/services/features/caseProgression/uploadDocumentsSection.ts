import {ClaimSummarySection, ClaimSummaryType} from '../../../common/form/models/claimSummarySection';

export const getWitnessSubtitle = (subTitle:string): ClaimSummarySection => {
  return {
    type: ClaimSummaryType.SUBTITLE,
    data: {
      text: subTitle,
    },
  };
};
export const getInput = (title:string, classes:string): ClaimSummarySection => {
  return {
    type: ClaimSummaryType.INPUT,
    data: {
      text: title,
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

export const getTitle = (title:string): ClaimSummarySection => {
  return {
    type: ClaimSummaryType.TITLE,
    data: {
      text: title,
    },
  };
};

export const getCustomInput = (title:string, classes:string, hint:string, id:string): ClaimSummarySection => {
  return {
    type: ClaimSummaryType.CUSTOM_INPUT,
    data: {
      id: id+'-input',
      name: id+'-input',
      text: title,
      classes:classes,
      hint: hint,
    },
  };
};
export const getCustomDateInput = (title:string,  hint:string, id: string): ClaimSummarySection => {
  return {
    type: ClaimSummaryType.DATE,
    data: {
      id:  id+'-date',
      name: id+'-date',
      text: title,
      hint: hint,
      classes:'govuk-fieldset__legend--s',
    },
  };
};
export const getCustomUploadInput = (title:string,  html:string, id: string): ClaimSummarySection => {
  return {
    type: ClaimSummaryType.UPLOAD,
    data: {
      id: id+'-file-upload',
      name: id+'-file-upload',
      text: title,
      html: html,
    },
  };
};
