let generate_input = document.getElementById("generate");
let grid = document.getElementById("grid");

let board;
let puzzle;

function generateGrid() {
    console.log('generateGrid');
}

generate_input.onclick = () => {
    const nbnumbers = document.getElementById("amountNumber").value;
    const nbrowsperblock = document.getElementById("nbrowsperblock").value;
    const nbcolsperblock = document.getElementById("nbcolsperblock").value;
    const levellimit = document.getElementById("levellimit").value;
    const numseed = document.getElementById("seed").value;
    const nbtries = document.getElementById("nbtries").value;
    board = new Board(nbnumbers,nbrowsperblock,nbcolsperblock,numseed,levellimit);
    puzzle = new Puzzle(board);
    puzzle.findBestPuzzle(levellimit, 0, nbtries);
    console.log(puzzle.puzzleTab);
    let htmlGrid = '<h>level ' + puzzle.level + '</h>';
    for (let i=0; i<board.nbnumbers; i++) {
        let row = '';
        if (i==0) {
            row = row + '<div class="firstrow row">'
        } else if (i % nbrowsperblock == nbrowsperblock - 1) {
            row = row + '<div class="lastrowblock row">';
        } else {
            row = row + '<div class="row">';
        }
        for (let j=0; j< board.nbnumbers;j++) {
            if (j == 0) {
                if (puzzle.puzzleTab[i][j]>0) {
                    row = row + '<div class="firstcolumn cell" id="' + i + '_' + j + '">' + board.grid[i][j] + '</div>';
                } else {
                    row = row + '<input class="emptycell firstcolumn" style="width=' + (50) +';" type="number" min="1"/>';
                }
            } else if (j % nbcolsperblock == nbcolsperblock - 1) {
                if (puzzle.puzzleTab[i][j]>0) {
                    row = row + '<div class="lastcolblock cell" id="' + i + '_' + j + '">' + board.grid[i][j] + '</div>';
                } else {
                    row = row + '<input class="lastcolblock emptycell" style="width=' + (50) +';" type="number" min="1"/>';
                }
            } else {
                if (puzzle.puzzleTab[i][j]>0) {
                    row = row + '<div class="cell" id="' + i + '_' + j + '">' + board.grid[i][j] + '</div>';
                } else {
                    row = row + '<input class="emptycell" style="width=' + (50) +';" type="number" min="1"/>';
                }
            }
            
        }
        htmlGrid = htmlGrid + row + '</div>';
    }
    grid.innerHTML = htmlGrid;
}
