// ==UserScript==
// @name         El Pais sudoku open
// @namespace    https://github.com/roirodriguez/sudoku-userscripts
// @version      0.1
// @description  Open NYT sudoku into f-puzzles, sudokuexchange, or CTC app
// @author       Roi Rodriguez
// @match        https://cdn-eu1.amuselabs.com/elpais/*
// @match        https://elpais.com/juegos/sudokus/*
// @icon         https://static.elpais.com/dist/resources/images/favicon.ico
// @require      https://f-puzzles.com/Compression.js?v=1.11.3
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
  "use strict";

  let boxes = undefined;

  const getDifficulty = (loc) => {
    const difficulty_pathinfo = loc.pathname.toLowerCase().substring(16);
    if (difficulty_pathinfo.startsWith("dificil")) {
      return "hard";
    } else if (difficulty_pathinfo.startsWith("medio")) {
      return "medium";
    } else if (difficulty_pathinfo.startsWith("facil")) {
      return "easy";
    }
    return "unknown_difficulty";
  };

  const getBoxes = (doc) => {
    let ret = doc.querySelectorAll("span.letter-in-box");
    if (typeof ret === "undefined" || ret.length == 0) return undefined;
    return ret;
  };

  const doShim = () => {
    let difficulty = GM_getValue("difficulty");
    const extractBoard = () => {
      let sudokuStr =
        boxes && boxes.length == 81
          ? [...boxes]
              .map((box) => {
                let digit = box.innerHTML;
                if (digit > "0" && digit <= "9") return digit;
                return "0";
              })
              .join("")
          : "";
      return sudokuStr;
    };

    const createFpuzzlesStr = () => {
      const size = 9;
      const puzzle = {
        author: "El Pais",
        ruleset: "Normal sudoku rules apply.",
        title: "El Pais " + difficulty + " " + moment().format("YYYY-MM-DD"),
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

  const intervalId = setInterval(() => {
    // This is called for both matched domains. cdn from amuselabs contains the puzzle
    if (document.domain == "cdn-eu1.amuselabs.com") {
      boxes = getBoxes(document);
      if (GM_getValue("difficulty" == null)) {
        return;
      }
      clearInterval(intervalId);
      doShim();
    } else {
      // El elpais.com only sets difficulty according to its pathinfo, the puzzle is
      // contained in amuselabs. GM_setValue let me share difficulty with amuselabs iframe.
      GM_setValue("difficulty", getDifficulty(location));
      return;
    }
  }, 100);
})();
