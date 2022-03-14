export function constructResponseUrlWithIdParams(id: string, path:string): string{
  return `/case/${id}/response${path}`;
}
