import Alpine from "alpinejs";
import CTFd from "./index";
import { getOption } from "./utils/graphs/echarts/scoreboard";
import { embed } from "./utils/graphs/echarts";

window.Alpine = Alpine;
window.CTFd = CTFd;

// https://github.com/CTFd/CTFd.js/blob/8fa54fa56448f91032fcf1750a397e4ac46e5520/pages/scoreboard.js#L11
async function getScoreboardDetailBrackets(count, bracketId=null) {
  const url = bracketId ? `/api/v1/scoreboard/top/${count}?bracket_id=${bracketId}` : `/api/v1/scoreboard/top/${count}`;
  const response = await CTFd.fetch(url, {
    method: "GET",
  });
  const body = await response.json();
  return body["data"];
}

// Default scoreboard polling interval to every 5 minutes
const scoreboardUpdateInterval = window.scoreboardUpdateInterval || 300000;

Alpine.data("ScoreboardDetail", () => ({
  data: {},
  show: true,
  activeBracket: null,

  async update() {
    this.data = await getScoreboardDetailBrackets(10, this.activeBracket);
    let optionMerge = window.scoreboardChartOptions;
    let option = getOption(CTFd.config.userMode, this.data, optionMerge);
    embed(this.$refs.scoregraph, option);
    this.show = Object.keys(this.data).length > 0;
  },

  async init() {
    this.update();

    setInterval(() => {
      this.update();
    }, scoreboardUpdateInterval);
  },
}));

Alpine.data("ScoreboardList", () => ({
  standings: [],
  brackets: [],
  activeBracket: null,

  async update() {
    let response = await CTFd.fetch(`/api/v1/brackets?type=${CTFd.config.userMode}`, {
      method: "GET",
    });
    const body = await response.json();
    this.brackets = body["data"];
    this.standings = await CTFd.pages.scoreboard.getScoreboard();
  },

  async init() {
    this.update();

    setInterval(() => {
      this.update();
    }, scoreboardUpdateInterval);
  },
}));

Alpine.start();
