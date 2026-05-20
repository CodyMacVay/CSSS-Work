# Cricket Score Tracker

A lightweight, browser-based cricket score tracking application built with vanilla HTML, CSS, and JavaScript. All data is stored locally in your browser using `localStorage`.

## Features

### Dashboard
- **Career Overview** — matches played, wins, losses, batting average, strike rate, total runs, wickets, bowling average
- **Batting Statistics** — innings, not outs, runs, highest score, average, strike rate, balls faced, 4s, 6s, 100s, 50s, ducks, boundary %
- **Bowling Statistics** — innings, overs, maidens, runs conceded, wickets, average, economy rate, strike rate, best bowling, 5-wicket hauls, wides, no balls
- **Fielding Statistics** — catches, stumpings, run outs, total dismissals
- **Recent Form** — visual bar chart of last 5 innings
- **Milestones** — centuries, half-centuries, 5-wicket hauls, wins, catches, sixes

### Match Entry
Log each match with:
- **Match details** — date, opponent, venue, format (Test/ODI/T20/Club/Other), result
- **Batting** — runs, balls faced, 4s, 6s, not out status, batting position, dismissal type
- **Bowling** — overs, maidens, runs conceded, wickets, wides, no balls
- **Fielding** — catches, stumpings, run outs

### Match History
- View all matches in a sortable table
- Filter by format (Test, ODI, T20, Club, etc.)
- Delete individual matches
- **Export to CSV** for external analysis

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/CodyMacVay/cricket-tracker.git
   cd cricket-tracker
   ```
2. Open `index.html` in your browser — no build tools or server required.

## Tech Stack

- **HTML5** / **CSS3** / **Vanilla JavaScript**
- **localStorage** for persistence
- No external dependencies

## Screenshots

_Open `index.html` in any modern browser to see the app in action._
