// ==UserScript==
// @name         f-puzzles import / export tools
// @namespace    https://github.com/roirodriguez/sudoku-userscripts
// @version      0.1
// @description  Opens f-puzzles puzzle on CTC or sudokuexchange. It also exports an f-puzzles puzzle as a string, or imports from a string too. For classic sudoku only.
// @author       Roi Rodriguez
// @match        https://*.f-puzzles.com/*
// @match        https://f-puzzles.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=f-puzzles.com
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  "use strict";

  const doShim = () => {
    const getSudokuStr = () => {
      let sudokuStr = "";
      unsafeWindow.grid.forEach((row) => {
        row.forEach((cell) => {
          sudokuStr += cell.value;
        });
      });
      return sudokuStr;
    };

    // didn't get a way to import a puzzle without transforming it to a
    // f-puzzles string before
    const createFpuzzlesStr = (sudokuStr) => {
      const size = 9;
      const puzzle = {
        author: "unknown",
        ruleset: "Normal sudoku rules apply.",
        title: "Fpuzzles imported string",
        size: size,
        grid: [],
      };
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

    const exportSudokuStrCmdId = GM_registerMenuCommand(
      "Copy current puzzle as string to clipboard",
      (e) => {
        GM_setClipboard(getSudokuStr(), "text");
      }
    );
    const exportSudokuFpuzzlesStrCmdId = GM_registerMenuCommand(
      "Copy current puzzle's f-puzzles encoded JSON string to clipboard",
      (e) => {
        GM_setClipboard(exportPuzzle(false), "text");
      }
    );
    const importSudokuFromStrCmdId = GM_registerMenuCommand(
      "Import puzzle from string (user prompted)",
      (e) => {
        const sudokuStr = prompt("Please paste a sudoku string");
        const sudokuFpuzzlesStr = createFpuzzlesStr(sudokuStr);
        window.open(
          "https://f-puzzles.com/?load=" + sudokuFpuzzlesStr,
          "_self"
        );
      }
    );
    const openInSudokuExchangeCmdId = GM_registerMenuCommand(
      "Open in sudokuexchange",
      (e) => {
        window.open(
          "https://sudokuexchange.com/play?s=" + getSudokuStr(),
          "_blank"
        );
      }
    );
    const openInCTCAppCmdId = GM_registerMenuCommand("Open in CTC app", (e) => {
      const sudokuFpuzzlesEncodedJson = exportPuzzle(false);
      window.open(
        "https://app.crackingthecryptic.com/sudoku/?puzzleid=fpuzzles" +
          sudokuFpuzzlesEncodedJson,
        "_blank"
      );
    });
  };

  const intervalId = setInterval(() => {
    if (
      typeof grid === "undefined" ||
      typeof exportPuzzle === "undefined" ||
      typeof importPuzzle === "undefined" ||
      typeof cell === "undefined"
    ) {
      return;
    }

    clearInterval(intervalId);
    doShim();
  }, 16);
})();
