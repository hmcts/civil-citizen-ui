import autobind from 'autobind-decorator';
import { Response } from 'express';

import {FormFields } from '../form/Form';

import { AppRequest } from './AppRequest';

@autobind
export class PostController<T extends AnyObject> {
  constructor(protected readonly fields: FormFields) {}

  /**
   * Parse the form body and decide whether this is a save and sign out, save and continue or session time out
   */
  public async post(req: AppRequest<T>, res: Response): Promise<void> {


  }

}

export type AnyObject = Record<string, unknown>;
