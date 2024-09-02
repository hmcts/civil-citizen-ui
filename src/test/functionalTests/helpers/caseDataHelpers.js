module.exports = {
  //changes 1711119652839305 to #1711-1196-5283-9305
  formatClaimRef(claimRef) {
    const groups = claimRef.toString().match(/.{1,4}/g);
    const formattedString = '#' + groups.join('-');
    return formattedString;
  },
};