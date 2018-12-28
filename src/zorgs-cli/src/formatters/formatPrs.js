const { table } = require("table");
const chalk = require("chalk");

module.exports = function formatCommits(prs) {
  const data = [["Year"], ["Pull Requests Opened"], ["Pull Requests Closed"]];
  Object.entries(prs.years).forEach(([year, stats]) => {
    data[0].push(chalk.bold(year));
    data[1].push(stats.opened);
    data[2].push(stats.closed);
  });
  return table(data);
};
