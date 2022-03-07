const ID_VALUE = ':id';
export class UrlPatchReplace {
  static replaceIDFromUrl = (url: string, idValue: string) => url.replace(ID_VALUE, idValue);
}
