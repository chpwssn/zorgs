const gql = require("graphql-tag");
module.exports = gql`
  query repositoryPrs(
    $after: String
    $repository: String!
    $limit: Int = 100
    $organization: String!
  ) {
    organization(login: $organization) {
      repository(name: $repository) {
        isPrivate
        createdAt
        name
        pullRequests(first: $limit, after: $after) {
          totalCount
          edges {
            node {
              title
              createdAt
              closedAt
              closed
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  }
`;
