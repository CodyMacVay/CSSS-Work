(function () {
  "use strict";

  // ── Storage ──────────────────────────────────────────────────────────
  const STORAGE_KEY = "cricket_matches";

  function loadMatches() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (_) {
      return [];
    }
  }

  function saveMatches(matches) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  function $(sel) {
    return document.querySelector(sel);
  }

  function $$(sel) {
    return document.querySelectorAll(sel);
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "className") {
          node.className = attrs[k];
        } else if (k.indexOf("on") === 0) {
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else {
          node.setAttribute(k, attrs[k]);
        }
      });
    }
    if (children !== undefined) {
      if (Array.isArray(children)) {
        children.forEach(function (c) {
          if (typeof c === "string") {
            node.appendChild(document.createTextNode(c));
          } else if (c) {
            node.appendChild(c);
          }
        });
      } else if (typeof children === "string") {
        node.textContent = children;
      } else if (children) {
        node.appendChild(children);
      }
    }
    return node;
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function fmt(val, decimals) {
    if (val === null || val === undefined || isNaN(val) || !isFinite(val))
      return "-";
    return Number(val).toFixed(decimals === undefined ? 2 : decimals);
  }

  function showToast(msg, isError) {
    var toast = $("#toast");
    toast.textContent = msg;
    toast.className = "toast show" + (isError ? " error" : "");
    setTimeout(function () {
      toast.className = "toast";
    }, 3000);
  }

  function parseBowlingOvers(overs) {
    var o = parseFloat(overs) || 0;
    var full = Math.floor(o);
    var partial = Math.round((o - full) * 10);
    if (partial >= 6) {
      full += 1;
      partial = 0;
    }
    return full * 6 + partial;
  }

  function ballsToOvers(balls) {
    return Math.floor(balls / 6) + "." + (balls % 6);
  }

  // ── Tab Navigation ───────────────────────────────────────────────────
  $$(".nav-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".nav-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      $$(".tab-content").forEach(function (t) {
        t.classList.remove("active");
      });
      btn.classList.add("active");
      var tab = btn.getAttribute("data-tab");
      var section = document.getElementById(tab);
      if (section) section.classList.add("active");
    });
  });

  // ── Toggle batting / bowling fields ──────────────────────────────────
  $("#did-bat").addEventListener("change", function () {
    $("#batting-fields").classList.toggle("hidden", !this.checked);
  });

  $("#did-bowl").addEventListener("change", function () {
    $("#bowling-fields").classList.toggle("hidden", !this.checked);
  });

  // ── Form Submission ──────────────────────────────────────────────────
  $("#match-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var match = readFormData();
    var matches = loadMatches();
    matches.push(match);
    saveMatches(matches);
    showToast("Match saved!");
    this.reset();
    $("#did-bat").checked = true;
    $("#did-bowl").checked = false;
    $("#batting-fields").classList.remove("hidden");
    $("#bowling-fields").classList.add("hidden");
    refreshAll();
  });

  function readFormData(prefix) {
    prefix = prefix || "";
    var didBat = $(prefix + "#did-bat").checked;
    var didBowl = $(prefix + "#did-bowl").checked;

    return {
      id: generateId(),
      date: $(prefix + "#match-date").value,
      opponent: $(prefix + "#match-opponent").value.trim(),
      venue: $(prefix + "#match-venue").value.trim(),
      format: $(prefix + "#match-format").value,
      result: $(prefix + "#match-result").value,
      batting: didBat
        ? {
            runs: parseInt($(prefix + "#bat-runs").value) || 0,
            balls: parseInt($(prefix + "#bat-balls").value) || 0,
            fours: parseInt($(prefix + "#bat-fours").value) || 0,
            sixes: parseInt($(prefix + "#bat-sixes").value) || 0,
            notOut: $(prefix + "#bat-not-out").checked,
            position: parseInt($(prefix + "#bat-position").value) || null,
            howOut: $(prefix + "#bat-how-out").value,
          }
        : null,
      bowling: didBowl
        ? {
            overs: parseFloat($(prefix + "#bowl-overs").value) || 0,
            maidens: parseInt($(prefix + "#bowl-maidens").value) || 0,
            runs: parseInt($(prefix + "#bowl-runs").value) || 0,
            wickets: parseInt($(prefix + "#bowl-wickets").value) || 0,
            wides: parseInt($(prefix + "#bowl-wides").value) || 0,
            noballs: parseInt($(prefix + "#bowl-noballs").value) || 0,
          }
        : null,
      fielding: {
        catches: parseInt($(prefix + "#field-catches").value) || 0,
        stumpings: parseInt($(prefix + "#field-stumpings").value) || 0,
        runouts: parseInt($(prefix + "#field-runouts").value) || 0,
      },
    };
  }

  // ── Statistics Calculations ──────────────────────────────────────────
  function computeStats(matches) {
    var s = {
      matches: matches.length,
      won: 0,
      lost: 0,
      drawn: 0,
      bat: {
        innings: 0,
        notOuts: 0,
        runs: 0,
        balls: 0,
        highest: 0,
        highestNotOut: false,
        fours: 0,
        sixes: 0,
        hundreds: 0,
        fifties: 0,
        ducks: 0,
        scores: [],
      },
      bowl: {
        innings: 0,
        balls: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        wides: 0,
        noballs: 0,
        bestWickets: 0,
        bestRuns: Infinity,
        fiveWickets: 0,
      },
      field: {
        catches: 0,
        stumpings: 0,
        runouts: 0,
      },
    };

    matches.forEach(function (m) {
      if (m.result === "Won") s.won++;
      else if (m.result === "Lost") s.lost++;
      else if (m.result === "Draw") s.drawn++;

      if (m.batting) {
        s.bat.innings++;
        if (m.batting.notOut) s.bat.notOuts++;
        s.bat.runs += m.batting.runs;
        s.bat.balls += m.batting.balls;
        s.bat.fours += m.batting.fours;
        s.bat.sixes += m.batting.sixes;
        if (m.batting.runs >= 100) s.bat.hundreds++;
        if (m.batting.runs >= 50 && m.batting.runs < 100) s.bat.fifties++;
        if (m.batting.runs === 0 && !m.batting.notOut) s.bat.ducks++;
        if (
          m.batting.runs > s.bat.highest ||
          (m.batting.runs === s.bat.highest && m.batting.notOut)
        ) {
          s.bat.highest = m.batting.runs;
          s.bat.highestNotOut = m.batting.notOut;
        }
        s.bat.scores.push({
          runs: m.batting.runs,
          notOut: m.batting.notOut,
          opponent: m.opponent,
          date: m.date,
        });
      }

      if (m.bowling) {
        s.bowl.innings++;
        s.bowl.balls += parseBowlingOvers(m.bowling.overs);
        s.bowl.maidens += m.bowling.maidens;
        s.bowl.runs += m.bowling.runs;
        s.bowl.wickets += m.bowling.wickets;
        s.bowl.wides += m.bowling.wides;
        s.bowl.noballs += m.bowling.noballs;
        if (m.bowling.wickets >= 5) s.bowl.fiveWickets++;
        if (
          m.bowling.wickets > s.bowl.bestWickets ||
          (m.bowling.wickets === s.bowl.bestWickets &&
            m.bowling.runs < s.bowl.bestRuns)
        ) {
          s.bowl.bestWickets = m.bowling.wickets;
          s.bowl.bestRuns = m.bowling.runs;
        }
      }

      if (m.fielding) {
        s.field.catches += m.fielding.catches || 0;
        s.field.stumpings += m.fielding.stumpings || 0;
        s.field.runouts += m.fielding.runouts || 0;
      }
    });

    var dismissals = s.bat.innings - s.bat.notOuts;
    s.bat.average = dismissals > 0 ? s.bat.runs / dismissals : null;
    s.bat.strikeRate = s.bat.balls > 0 ? (s.bat.runs / s.bat.balls) * 100 : null;

    s.bowl.average = s.bowl.wickets > 0 ? s.bowl.runs / s.bowl.wickets : null;
    s.bowl.economy = s.bowl.balls > 0 ? s.bowl.runs / (s.bowl.balls / 6) : null;
    s.bowl.strikeRate = s.bowl.wickets > 0 ? s.bowl.balls / s.bowl.wickets : null;

    if (s.bowl.bestWickets === 0) {
      s.bowl.bestWickets = 0;
      s.bowl.bestRuns = 0;
    }

    return s;
  }

  // ── Render Dashboard ─────────────────────────────────────────────────
  function renderDashboard() {
    var matches = loadMatches();
    var s = computeStats(matches);

    // Career Overview
    var overview = $("#career-overview");
    overview.innerHTML = "";

    var overviewItems = [
      { label: "Matches", value: s.matches },
      { label: "Won", value: s.won },
      { label: "Lost", value: s.lost },
      { label: "Bat Avg", value: fmt(s.bat.average) },
      { label: "Strike Rate", value: fmt(s.bat.strikeRate) },
      { label: "Total Runs", value: s.bat.runs },
      { label: "Wickets", value: s.bowl.wickets },
      { label: "Bowl Avg", value: fmt(s.bowl.average) },
    ];

    overviewItems.forEach(function (item) {
      overview.appendChild(
        el("div", { className: "overview-stat" }, [
          el("div", { className: "stat-value" }, String(item.value)),
          el("div", { className: "stat-label" }, item.label),
        ])
      );
    });

    // Batting Stats Table
    var batBody = $("#batting-stats-table tbody");
    batBody.innerHTML = "";
    var highStr =
      s.bat.highest + (s.bat.highestNotOut && s.bat.innings > 0 ? "*" : "");

    var batRows = [
      ["Innings", s.bat.innings],
      ["Not Outs", s.bat.notOuts],
      ["Runs", s.bat.runs],
      ["Highest Score", s.bat.innings > 0 ? highStr : "-"],
      ["Average", fmt(s.bat.average)],
      ["Strike Rate", fmt(s.bat.strikeRate)],
      ["Balls Faced", s.bat.balls],
      ["4s", s.bat.fours],
      ["6s", s.bat.sixes],
      ["100s", s.bat.hundreds],
      ["50s", s.bat.fifties],
      ["Ducks", s.bat.ducks],
      [
        "Boundary %",
        fmt(
          s.bat.runs > 0
            ? ((s.bat.fours * 4 + s.bat.sixes * 6) / s.bat.runs) * 100
            : null
        ) + "%",
      ],
      [
        "Dot Ball %",
        fmt(
          s.bat.balls > 0
            ? ((s.bat.balls - (s.bat.fours + s.bat.sixes + (s.bat.runs - s.bat.fours * 4 - s.bat.sixes * 6 > 0 ? Math.ceil((s.bat.runs - s.bat.fours * 4 - s.bat.sixes * 6) / 1) : 0))) /
                s.bat.balls) *
                100
            : null,
          1
        ),
      ],
    ];

    batRows.forEach(function (row) {
      batBody.appendChild(
        el("tr", null, [
          el("td", null, row[0]),
          el("td", null, String(row[1])),
        ])
      );
    });

    // Bowling Stats Table
    var bowlBody = $("#bowling-stats-table tbody");
    bowlBody.innerHTML = "";
    var bestStr =
      s.bowl.innings > 0
        ? s.bowl.bestWickets + "/" + s.bowl.bestRuns
        : "-";

    var bowlRows = [
      ["Innings", s.bowl.innings],
      ["Overs", s.bowl.balls > 0 ? ballsToOvers(s.bowl.balls) : "-"],
      ["Maidens", s.bowl.maidens],
      ["Runs Conceded", s.bowl.runs],
      ["Wickets", s.bowl.wickets],
      ["Average", fmt(s.bowl.average)],
      ["Economy Rate", fmt(s.bowl.economy)],
      [
        "Strike Rate",
        fmt(s.bowl.strikeRate, 1),
      ],
      ["Best Bowling", bestStr],
      ["5-Wicket Hauls", s.bowl.fiveWickets],
      ["Wides", s.bowl.wides],
      ["No Balls", s.bowl.noballs],
    ];

    bowlRows.forEach(function (row) {
      bowlBody.appendChild(
        el("tr", null, [
          el("td", null, row[0]),
          el("td", null, String(row[1])),
        ])
      );
    });

    // Fielding Stats Table
    var fieldBody = $("#fielding-stats-table tbody");
    fieldBody.innerHTML = "";
    var fieldRows = [
      ["Catches", s.field.catches],
      ["Stumpings", s.field.stumpings],
      ["Run Outs", s.field.runouts],
      ["Total Dismissals", s.field.catches + s.field.stumpings + s.field.runouts],
    ];
    fieldRows.forEach(function (row) {
      fieldBody.appendChild(
        el("tr", null, [
          el("td", null, row[0]),
          el("td", null, String(row[1])),
        ])
      );
    });

    // Recent Form
    var recentContainer = $("#recent-form");
    recentContainer.innerHTML = "";
    var recentScores = s.bat.scores.slice(-5);

    if (recentScores.length === 0) {
      recentContainer.appendChild(
        el("p", { className: "empty-msg" }, "No batting innings yet.")
      );
    } else {
      var maxRun = Math.max.apply(
        null,
        recentScores.map(function (sc) {
          return sc.runs;
        })
      );
      if (maxRun === 0) maxRun = 1;

      var barsDiv = el("div", { className: "form-bars" });
      recentScores.forEach(function (sc) {
        var pct = (sc.runs / maxRun) * 100;
        var color =
          sc.runs >= 100
            ? "var(--accent)"
            : sc.runs >= 50
              ? "var(--primary)"
              : sc.runs >= 30
                ? "var(--primary-light)"
                : "#aab";
        var bar = el("div", {
          className: "bar",
          style:
            "height:" +
            Math.max(pct, 5) +
            "%;background:" +
            color,
        });
        barsDiv.appendChild(
          el("div", { className: "form-bar" }, [
            bar,
            el(
              "span",
              { className: "bar-label" },
              sc.runs + (sc.notOut ? "*" : "")
            ),
            el("span", { className: "bar-sub" }, "v " + sc.opponent),
          ])
        );
      });
      recentContainer.appendChild(barsDiv);
    }

    // Milestones
    var milestonesDiv = $("#milestones");
    milestonesDiv.innerHTML = "";
    var milestoneData = [
      { count: s.bat.hundreds, label: "Centuries" },
      { count: s.bat.fifties, label: "Half-Centuries" },
      { count: s.bowl.fiveWickets, label: "5-Wicket Hauls" },
      { count: s.won, label: "Wins" },
      { count: s.field.catches, label: "Catches" },
      { count: s.bat.sixes, label: "Sixes Hit" },
    ];
    milestoneData.forEach(function (md) {
      milestonesDiv.appendChild(
        el("div", { className: "milestone" }, [
          el("span", { className: "m-count" }, String(md.count)),
          el("span", { className: "m-label" }, md.label),
        ])
      );
    });
  }

  // ── Render History ───────────────────────────────────────────────────
  function renderHistory() {
    var matches = loadMatches();
    var filter = $("#filter-format").value;

    if (filter !== "All") {
      matches = matches.filter(function (m) {
        return m.format === filter;
      });
    }

    matches.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    var tbody = $("#history-body");
    tbody.innerHTML = "";
    var noMsg = $("#no-matches");

    if (matches.length === 0) {
      noMsg.style.display = "block";
      return;
    }
    noMsg.style.display = "none";

    matches.forEach(function (m) {
      var batRuns = m.batting ? m.batting.runs + (m.batting.notOut ? "*" : "") : "-";
      var batBalls = m.batting ? m.batting.balls : "-";
      var sr =
        m.batting && m.batting.balls > 0
          ? fmt((m.batting.runs / m.batting.balls) * 100, 1)
          : "-";
      var notOut = m.batting ? (m.batting.notOut ? "Yes" : "No") : "-";
      var overs = m.bowling ? m.bowling.overs : "-";
      var wkts = m.bowling ? m.bowling.wickets : "-";
      var econ =
        m.bowling && m.bowling.overs > 0
          ? fmt(m.bowling.runs / m.bowling.overs, 2)
          : "-";
      var catches = m.fielding ? m.fielding.catches : 0;

      var resultClass = "result-" + m.result.toLowerCase().replace(/\s+/g, "-");

      var row = el("tr", null, [
        el("td", null, m.date),
        el("td", null, m.opponent),
        el("td", null, m.format),
        el("td", null, m.venue || "-"),
        el("td", { className: resultClass }, m.result),
        el("td", null, String(batRuns)),
        el("td", null, String(batBalls)),
        el("td", null, String(sr)),
        el("td", null, String(notOut)),
        el("td", null, String(overs)),
        el("td", null, String(wkts)),
        el("td", null, String(econ)),
        el("td", null, String(catches)),
        el("td", null, [
          el(
            "button",
            {
              className: "btn-icon delete",
              title: "Delete",
              onClick: function () {
                deleteMatch(m.id);
              },
            },
            "\u2716"
          ),
        ]),
      ]);
      tbody.appendChild(row);
    });
  }

  // ── Delete Match ─────────────────────────────────────────────────────
  function deleteMatch(id) {
    if (!confirm("Delete this match? This cannot be undone.")) return;
    var matches = loadMatches().filter(function (m) {
      return m.id !== id;
    });
    saveMatches(matches);
    showToast("Match deleted.");
    refreshAll();
  }

  // ── Export CSV ────────────────────────────────────────────────────────
  $("#export-btn").addEventListener("click", function () {
    var matches = loadMatches();
    if (matches.length === 0) {
      showToast("No matches to export.", true);
      return;
    }

    var headers = [
      "Date",
      "Opponent",
      "Format",
      "Venue",
      "Result",
      "Bat Runs",
      "Bat Balls",
      "Bat 4s",
      "Bat 6s",
      "Not Out",
      "How Out",
      "Bat Position",
      "Bowl Overs",
      "Bowl Maidens",
      "Bowl Runs",
      "Bowl Wickets",
      "Bowl Wides",
      "Bowl No Balls",
      "Catches",
      "Stumpings",
      "Run Outs",
    ];

    var rows = matches.map(function (m) {
      return [
        m.date,
        '"' + (m.opponent || "") + '"',
        m.format,
        '"' + (m.venue || "") + '"',
        m.result,
        m.batting ? m.batting.runs : "",
        m.batting ? m.batting.balls : "",
        m.batting ? m.batting.fours : "",
        m.batting ? m.batting.sixes : "",
        m.batting ? (m.batting.notOut ? "Yes" : "No") : "",
        m.batting ? m.batting.howOut : "",
        m.batting ? m.batting.position || "" : "",
        m.bowling ? m.bowling.overs : "",
        m.bowling ? m.bowling.maidens : "",
        m.bowling ? m.bowling.runs : "",
        m.bowling ? m.bowling.wickets : "",
        m.bowling ? m.bowling.wides : "",
        m.bowling ? m.bowling.noballs : "",
        m.fielding ? m.fielding.catches : 0,
        m.fielding ? m.fielding.stumpings : 0,
        m.fielding ? m.fielding.runouts : 0,
      ].join(",");
    });

    var csv = headers.join(",") + "\n" + rows.join("\n");
    var blob = new Blob([csv], { type: "text/csv" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "cricket_stats_" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("CSV exported!");
  });

  // ── Filter ───────────────────────────────────────────────────────────
  $("#filter-format").addEventListener("change", renderHistory);

  // ── Refresh All ──────────────────────────────────────────────────────
  function refreshAll() {
    renderDashboard();
    renderHistory();
  }

  // ── Init ─────────────────────────────────────────────────────────────
  (function init() {
    var today = new Date().toISOString().slice(0, 10);
    $("#match-date").value = today;
    refreshAll();
  })();
})();
