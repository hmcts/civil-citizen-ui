export function constructResponseUrlWithIdParams(id: string, path:string): string{
  return path.replace(/(:id)/i, id);
}
