/// <reference types='codeceptjs' />
type steps_file =  typeof import('././src/test/e2e/steps_file');


declare namespace CodeceptJS {
  interface SupportObject { I: CodeceptJS.I }
  interface CallbackOrder { [0]: CodeceptJS.I }
  interface Methods extends CodeceptJS.Puppeteer, PuppeteerHelpers {}
  interface I extends ReturnType<steps_file> {}
  namespace Translation {
    interface Actions {}
  }
}