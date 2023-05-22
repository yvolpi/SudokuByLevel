package sudoku;

public class GeneratorMain {
	public static int nbnumbers = 9;
	public static int nbrowsperblock = 3;
	public static int nbcolsperblock = 3;
	public static long seed = 2;
	public static int nbessais = 1;
	public static int chosenLevel = 1;
	public static int chosenNbSteps = 200;

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		Board board = new Board(nbnumbers, nbrowsperblock, nbcolsperblock, seed, chosenLevel);
		//board.writeBoard();
		Puzzle puzzle = new Puzzle(board);
		puzzle.findBestPuzzle(chosenLevel, chosenNbSteps, nbessais);
		puzzle.writePuzzle();
		System.out.println("level: " + puzzle.level);
		System.out.println("nb essais: " + puzzle.nbTests);
		//puzzle.showsteps = true;
		//puzzle.solver(puzzle.puzzleTab, puzzle.nbEmptyCells, 1, 0, chosenLevel);
		
		/*
		Integer sudokutest[][] = {
				{6,0,0,0,0,0,0,0,0},
				{2,3,8,0,0,0,0,0,0},
				{4,7,1,0,0,0,0,0,0},
				{0,0,0,0,0,0,0,0,0},
				{0,0,0,0,0,0,0,0,0},
				{0,0,0,0,0,0,0,0,0},
				{0,0,0,0,0,0,0,0,0},
				{0,0,0,0,0,0,0,0,0},
				{0,0,0,0,0,0,0,0,0}};
		
		boolean sudokuFlag[][][] = new boolean[9][9][9];
		
		for (int i=0;i<9;i++) {
			for (int j=0;j<9;j++) {
				if (sudokutest[i][j] == 0) {
					if (i == 0 && j < 3) {
						for (int k=0;k<9;k++) {
							if (k!=4  && k!=5 && k!=8) {
								sudokuFlag[i][j][k] = false;
							} else {
								sudokuFlag[i][j][k] = true;
							}
						}
						
					} else {
						for (int k=0;k<9;k++) {
							sudokuFlag[i][j][k] = true;
						}
						if (i == 0) {
							sudokuFlag[i][j][5] = false;
						}
					}
					
				}
			}
		}
		
		boolean numberMissingRow[][] = {
				{true,true,true,true,true,false,true,true,true},
				{true,false,false,true,true,true,true,false,true},
				{false,true,true,false,true,true,false,true,true},
				{false,false,false,false,false,false,false,false,false},
				{false,false,false,false,false,false,false,false,false},
				{false,false,false,false,false,false,false,false,false},
				{false,false,false,false,false,false,false,false,false},
				{false,false,false,false,false,false,false,false,false},
				{false,false,false,false,false,false,false,false,false}};
		boolean numberMissingCol[][] = {
				{true,false,true,false,true,false,true,true,true},
				{true,true,false,true,true,true,false,true,true},
				{false,true,true,true,true,true,true,false,true},
				{false,false,false,false,false,false,false,false,false},
				{false,false,false,false,false,false,false,false,false},
				{false,false,false,false,false,false,false,false,false},
				{false,false,false,false,false,false,false,false,false},
				{false,false,false,false,false,false,false,false,false},
				{false,false,false,false,false,false,false,false,false}};
		boolean numberMissingBlock[][] = {
				{false,false,false,false,true,false,false,false,true},
				{false,false,false,false,false,false,false,false,false},
				{false,false,false,false,false,false,false,false,false},
				{false,false,false,false,false,false,false,false,false},
				{false,false,false,false,false,false,false,false,false},
				{false,false,false,false,false,false,false,false,false},
				{false,false,false,false,false,false,false,false,false},
				{false,false,false,false,false,false,false,false,false},
				{false,false,false,false,false,false,false,false,false}};
		
		boolean simplyfied = simplifyByDeductionCross(sudokutest,sudokuFlag,numberMissingRow,numberMissingCol,numberMissingBlock);
		System.out.println("simplyfied: " + simplyfied);
		/*boolean testRowFlag[][][] = new boolean[1][9][9];
		for (int c=0;c<9;c++) {
			for (int k=0;k<9;k++) {
				testRowFlag[0][c][k] = true;
			}
		}
		for (int k=0;k<7;k++) {
			testRowFlag[0][2][k] = false;
			testRowFlag[0][5][k] = false;
		}
		ArrayList<Integer> positionsEmptyCells = new ArrayList<Integer>();
		for (int c=0;c<9;c++) {
			positionsEmptyCells.add(c);
		}
		int partialGroup[] = new int[2];
		partialGroup[0] = 2;*/
		
		
	}
	
	static boolean simplifyByDeductionCross(Integer sudoku[][], boolean sudokuflags[][][], boolean numberMissingRow[][], boolean numberMissingCol[][], boolean numberMissingBlock[][]) {
		boolean hasChanged = true;
		boolean hasSimplyfied = false;
		while (hasChanged) {
			hasChanged = false;
			//row
			for(int i=0;i<nbnumbers;i++) {
				for(int k=0;k<nbnumbers;k++) {
					if (numberMissingRow[i][k]) {
						int posBloc = -1;
						int count = 0;
						for(int c=0;c<nbnumbers;c++) {
							if (sudoku[i][c] == 0 && sudokuflags[i][c][k]) {
								if (posBloc == -1 || posBloc!= c/nbcolsperblock) {
									posBloc = c/nbcolsperblock;
									count ++;
								}
								
							}
						}
						if (count == 1) {
							//unique block for the number k+1
							int rowBlock = i%nbrowsperblock;
							int rowBlockLocation = (i/nbrowsperblock)*nbrowsperblock;
							int colBlockLocation = posBloc*nbcolsperblock;
							for(int r=0;r<nbrowsperblock;r++) {
								if (r != rowBlock) {
									for(int c=0;c<nbcolsperblock;c++) {
										if (sudoku[rowBlockLocation + r][colBlockLocation + c] == 0 && sudokuflags[rowBlockLocation + r][colBlockLocation + c][k]) {
											sudokuflags[rowBlockLocation + r][colBlockLocation + c][k] = false;
											hasChanged = true;
											hasSimplyfied = true;
										}
									}
								}
							}
						}
					}
				}
			}
			//col
			for(int j=0;j<nbnumbers;j++) {
				for(int k=0;k<nbnumbers;k++) {
					if (numberMissingCol[j][k]) {
						int posBloc = -1;
						int count = 0;
						for(int r=0;r<nbnumbers;r++) {
							if (sudoku[r][j] == 0 && sudokuflags[r][j][k]) {
								if (posBloc == -1 || posBloc!= r/nbrowsperblock) {
									posBloc = r/nbrowsperblock;
									count ++;
								}
								
							}
						}
						if (count == 1) {
							//unique block for the number k+1
							int colBlock = j%nbcolsperblock;
							int rowBlockLocation = posBloc*nbrowsperblock;
							int colBlockLocation = (j/nbcolsperblock)*nbcolsperblock;
							for(int c=0;c<nbcolsperblock;c++) {
								if (c != colBlock) {
									for(int r=0;r<nbrowsperblock;r++) {
										if (sudoku[rowBlockLocation + r][colBlockLocation + c] == 0 && sudokuflags[rowBlockLocation + r][colBlockLocation + c][k]) {
											sudokuflags[rowBlockLocation + r][colBlockLocation + c][k] = false;
											hasChanged = true;
											hasSimplyfied = true;
										}
									}
								}
							}
						}
					}
				}
			}
			//block
			//col
			for(int b=0;b<nbnumbers;b++) {
				for(int k=0;k<nbnumbers;k++) {
					if (numberMissingBlock[b][k]) {
						int posBlocRow = -1;
						int posBlocCol = -1;
						int rowBlock = (b/nbrowsperblock)*nbrowsperblock;
						int colBlock = (b%nbrowsperblock)*nbcolsperblock;
						int countRow = 0;
						int countCol = 0;
						for(int posb=0;posb<nbnumbers;posb++) {
							if (sudoku[rowBlock + posb/nbcolsperblock][colBlock + posb%nbcolsperblock] == 0 && sudokuflags[rowBlock + posb/nbcolsperblock][colBlock + posb%nbcolsperblock][k]) {
								if (countRow == 0) {
									countRow ++;
									countCol++;
									posBlocRow = rowBlock + posb/nbcolsperblock;
									posBlocCol = colBlock + posb%nbcolsperblock;
								} else {
									if (rowBlock + posb/nbcolsperblock != posBlocRow) {
										countRow++;
									}
									if (colBlock + posb%nbcolsperblock != posBlocCol) {
										countCol++;
									}
								}
								
							}
						}
						if (countRow == 1) {
							//unique row for the number k+1
							for(int c=0;c<nbnumbers;c++) {
								if (c < colBlock || c >= colBlock + nbcolsperblock) {
									if (sudoku[posBlocRow][c] == 0 && sudokuflags[posBlocRow][c][k]) {
										sudokuflags[posBlocRow][c][k] = false;
										hasChanged = true;
										hasSimplyfied = true;
									}
								}
							}
						} else if (countCol == 1) {
							//unique col for the number k+1
							for(int ro=0;ro<nbnumbers;ro++) {
								if (ro < rowBlock || ro >= rowBlock + nbrowsperblock) {
									if (sudoku[ro][posBlocCol] == 0 && sudokuflags[ro][posBlocCol][k]) {
										sudokuflags[ro][posBlocCol][k] = false;
										hasChanged = true;
										hasSimplyfied = true;
									}
								}
							}
						}
					}
				}
			}
		}
		return hasSimplyfied;
		
	}

}
