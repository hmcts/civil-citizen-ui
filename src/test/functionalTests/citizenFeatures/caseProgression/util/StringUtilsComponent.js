class StringUtilsComponent {
  static formatClaimReferenceToAUIDisplayFormat(claimReference) {
    return claimReference.toString().replace(/\d{4}(?=.)/g, '$& ');
  }
}

module.exports = {StringUtilsComponent};
