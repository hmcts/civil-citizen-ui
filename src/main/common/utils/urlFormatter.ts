export function constructResponseUrlWithIdParams(id: string, path:string): string{
  return path.toString().replace(/(:id)/i, id);
}
