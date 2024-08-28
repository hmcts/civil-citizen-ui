const I = actor();

const seeInTitle = (title) => I.seeInTitle(`${title} - Your money claims account`);

module.exports = {
  seeInTitle,
};
