import {ResponseOptions} from '../../common/form/models/responseDeadline';

export interface ResponseDeadline {
  option?: ResponseOptions,
  deadlineDate?: Date; // TODO: refactor respondent1ResponseDeadline into this?
}
