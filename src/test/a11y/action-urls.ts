import * as urls from 'routes/urls';

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
