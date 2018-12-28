const repositoriesQuery = require("./queries/repositoriesWithCommits.js");
const getRepositoryPrs = require("./getRepositoryPrs.js");
const queryPaginate = require("./queryPaginate.js");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async function getPrs({ client, organization }) {
  const arrayOfRepositoriesData = await queryPaginate({
    client,
    query: repositoriesQuery,
    variables: {
      organization,
      withCommits: false
    },
    getPaginationInfo: data => data.data.organization.repositories.pageInfo
  });
  const repositories = arrayOfRepositoriesData.reduce((incoming, chunk) => {
    return [
      ...incoming,
      ...chunk.data.organization.repositories.edges.map(repo => repo.node.name)
    ];
  }, []);

  // bad reduce to keep await happy
  let accum = { total: 0, years: {}, repositories: {} };
  for (let i = 0; i < repositories.length; i++) {
    const repositoryName = repositories[i];
    // sleep to stay under rate limits
    await sleep(1400);
    const repositoryPrs = await getRepositoryPrs({
      client,
      organization,
      repository: repositoryName
    });
    accum.repositories[repositoryName] = repositoryPrs;
    Object.keys(repositoryPrs.years).forEach(year => {
      if (accum.years[year] === undefined) {
        accum.years[year] = {
          opened: 0,
          closed: 0
        };
      }
      accum.years[year].opened += repositoryPrs.years[year].opened;
      accum.years[year].closed += repositoryPrs.years[year].closed;
    });
    accum.total += repositoryPrs.total;
  }
  return accum;
};
