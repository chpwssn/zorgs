const query = require("./queries/repositoryPrs.js");
const queryPaginate = require("./queryPaginate.js");

module.exports = async function getRepositoryPrs({
  client,
  organization,
  repository
}) {
  const arrayOfData = await queryPaginate({
    client,
    query,
    variables: {
      organization,
      repository
    },
    getPaginationInfo: data =>
      data.data.organization.repository.pullRequests.pageInfo
  });

  return arrayOfData.reduce(
    (allPrs, currentData) => {
      currentData.data.organization.repository.pullRequests.edges.forEach(
        ({ node: pr }) => {
          /* eslint-disable no-param-reassign */
          const yearOpened = pr.createdAt.slice(0, 4);
          const yearClosed = pr.createdAt.slice(0, 4);
          if (allPrs.years[yearOpened] === undefined) {
            allPrs.years[yearOpened] = {
              opened: 0,
              closed: 0
            };
          }
          if (allPrs.years[yearClosed] === undefined) {
            allPrs.years[yearClosed] = {
              opened: 0,
              closed: 0
            };
          }
          allPrs.years[yearOpened].opened++;
          allPrs.years[yearClosed].closed++;
          allPrs.total++;
        }
      );
      return allPrs;
    },
    { years: {}, total: 0 }
  );
};
