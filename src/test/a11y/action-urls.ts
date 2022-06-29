import * as urls from '../../main/routes/urls';

interface ActionModel {
  url: string,
  actions: string[],
}

const submitButtonAction = 'click element .govuk-button';

export const urlsWithActions: ActionModel[] = [
  {
    url: urls.CITIZEN_DISABILITY_URL,
    actions: [submitButtonAction],
  },
];
