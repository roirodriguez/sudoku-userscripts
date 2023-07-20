// ==UserScript==
// @name         NYT sudoku open
// @namespace    https://github.com/roirodriguez/sudoku-userscripts
// @version      0.1
// @description  Open NYT sudoku into f-puzzles, sudokuexchange, or CTC app
// @author       Roi Rodriguez
// @match        https://www.nytimes.com/puzzles/sudoku/*
// @icon         https://www.nytimes.com/games-assets/v2/metadata/nyt-favicon.ico?v=v2307131500
// @require      https://f-puzzles.com/Compression.js?v=1.11.3
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js
// @grant        GM_registerMenuCommand
// @grant        GM_info
// ==/UserScript==

(function () {
  "use strict";

  const doShim = () => {
    const difficulty_pathinfo = location.pathname.toLowerCase().substring(16);
    let difficulty = "unknown_difficulty";

    if (difficulty_pathinfo.startsWith("hard")) {
      difficulty = "hard";
    } else if (difficulty_pathinfo.startsWith("medium")) {
      difficulty = "medium";
    } else if (difficulty_pathinfo.startsWith("easy")) {
      difficulty = "easy";
    }

    const extractBoard = () => {
      let board = document.getElementsByClassName("su-board")[0];
      let sudokuStr = board
        ? [...board.getElementsByClassName("su-cell")]
            .map((el) =>
              el.classList.contains("prefilled")
                ? el.getAttribute("aria-label")
                : "0"
            )
            .join("")
        : "";
      return sudokuStr;
    };

    const createFpuzzlesStr = () => {
      const size = 9;
      const puzzle = {
        author: "NYT",
        ruleset: "Normal sudoku rules apply.",
        title: "NYT " + difficulty + " " + moment().format("YYYY-MM-DD"),
        size: size,
        grid: [],
      };
      const sudokuStr = extractBoard();
      for (var i = 0; i < size; i++) {
        puzzle.grid.push([]);
        for (var j = 0; j < size; j++) {
          let digit = parseInt(sudokuStr.charAt(i * size + j));
          puzzle.grid[i].push({
            value: digit,
            given: digit != 0,
            cornerPencilMarks: [],
            centerPencilMarks: [],
            c: 0,
            highlight: 0,
          });
        }
      }
      const sudokuFpuzzlesEncodedJson = compressor.compressToBase64(
        JSON.stringify(puzzle)
      );
      return sudokuFpuzzlesEncodedJson;
    };

    const openInSudokuExchange = GM_registerMenuCommand(
      "Open in sudokuexchange",
      (e) => {
        let sudokuStr = extractBoard();
        window.open("https://sudokuexchange.com/play?s=" + sudokuStr, "_blank");
      }
    );

    const openInFpuzzles = GM_registerMenuCommand("Open in f-puzzles", (e) => {
      const sudokuFpuzzlesEncodedJson = createFpuzzlesStr();
      window.open(
        "https://f-puzzles.com/?load=" + sudokuFpuzzlesEncodedJson,
        "_blank"
      );
    });

    const openInCTCApp = GM_registerMenuCommand("Open in CTC app", (e) => {
      const sudokuFpuzzlesEncodedJson = createFpuzzlesStr();
      window.open(
        "https://app.crackingthecryptic.com/sudoku/?puzzleid=fpuzzles" +
          sudokuFpuzzlesEncodedJson,
        "_blank"
      );
    });
  };

  doShim();
})();