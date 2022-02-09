import * as express from 'express';
import { ValidationError, Validator } from 'class-validator';

import { Form } from '../../form/form';


type Constructor<T> = { new(): T }
type Mapper<T> = (value: any) => T

export class FormValidator {

  static requestHandler<T> (modelType: Constructor<T>, modelTypeMapper?: Mapper<T>, validationGroup?: string, actionsWithoutValidation?: string[]): express.RequestHandler {
    const validator: Validator = new Validator();

    if (!modelTypeMapper) {
      modelTypeMapper = (value: any): T => {
        return Object.assign(new modelType(), value);
      };
    }

    const isValidationEnabledFor = (req: express.Request): boolean => {
      if (actionsWithoutValidation && req.body.action) {
        const actionName = Object.keys(req.body.action)[0];
        return actionsWithoutValidation.indexOf(actionName) < 0;
      }
      return true;
    };

    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const model: T = modelTypeMapper(req.body);

      const errors: ValidationError[] = isValidationEnabledFor(req) ? await validator.validate(model as unknown as object, { groups: validationGroup !== undefined ? [validationGroup] : [] }) : [];
      const action: object = req.body.action;

      req.body = new Form<T>(model, errors, req.body);
      if (action) {
        req.body.action = action;
      }

      next();
    };
  }

}


