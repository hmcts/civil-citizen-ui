/// <reference types='codeceptjs' />

declare namespace CodeceptJS {
    interface SupportObject {
      I: I;
      current: any;
      retries: (times: number) => void;
      login: (user: string) => void;
    }
    interface Methods extends Playwright {}
    interface I extends WithTranslation<Methods> {}
    namespace Translation {
      interface Actions {}
    }
  }