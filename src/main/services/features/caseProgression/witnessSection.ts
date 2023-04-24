import {ClaimSummarySection, ClaimSummaryType} from '../../../common/form/models/claimSummarySection';

export const getWitnessTitle = (): ClaimSummarySection => {
  return ({
    type: ClaimSummaryType.TITLE,
    data: {
      text: 'PAGES.UPLOAD_DOCUMENTS.WITNESS',
    },
  });
};

export const getWitnessYourStatement = (): ClaimSummarySection => {
  return {
    type: ClaimSummaryType.SUBTITLE,
    data: {
      text: 'PAGES.UPLOAD_DOCUMENTS.STATEMENT',
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

