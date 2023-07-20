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

    const setSudokuGrid = (sudokuStr) => {
        let i, j = 0;
        unsafeWindow.grid.forEach((row) => {
            row.forEach((cell) => {
              newcell = cell(i, j);
              newcell.value = parseInt(sudokuStr.charAt(9*i+j));
              newcell.candidates = [cell.value];
              newcell.isgiven = true;
              ++j;
            });
            ++i;
          });        
        return;
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
      (e) => {
        let sudokuStr = prompt("Please paste a sudoku string");
        setSudokuGrid(sudokuStr);
      }
    );
    const openInSudokuExchangeCmdId = GM_registerMenuCommand(
        "Open in sudokuexchange",
        (e) => {
          window.open("https://sudokuexchange.com/play?s=" + getSudokuStr(), "_blank");
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
      typeof importPuzzle === "undefined"
    ) {
      return;
    }

    clearInterval(intervalId);
    doShim();
  }, 16);
})();
