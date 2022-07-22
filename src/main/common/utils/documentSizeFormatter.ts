const formatBytesToKB = (bytes: number, decimals?:number): string => {
  if(bytes === 0){
    return '0 KB';
  }
  const dm = decimals < 0 ? 0 : decimals;
  const bytesInKB = 1024;

  return (bytes/bytesInKB).toFixed(dm) + ' KB';
};

export {
  formatBytesToKB,
};
