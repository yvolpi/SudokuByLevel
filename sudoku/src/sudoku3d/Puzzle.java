package sudoku3d;

import java.util.ArrayList;
import java.util.Random;

public class Puzzle {
	int nbnumbers;
	int nbrowsperblock;
	int nbcolsperblock;
	int d3size;
	Board board;
	Integer puzzleTab[][][];
	int level;
	int nbTests;
	int nbEmptyCells;
	boolean solvable;
	boolean showsteps;
	public static Random r;
	
	public Puzzle (Board board) {
		this.board = board;
		showsteps = false;
		nbnumbers = board.nbnumbers;
		nbrowsperblock = board.nbrowsperblock;
		nbcolsperblock = board.nbcolsperblock;
		d3size = board.d3size;
		level = 1;
		nbTests = 0;
		puzzleTab = new Integer[nbnumbers][nbnumbers][d3size];
		for (int i=0;i<nbnumbers;i++) {
			for (int j=0;j<nbnumbers;j++) {
				for (int l=0;l<d3size;l++) {
					puzzleTab[i][j][l] = board.values[i][j][l];
				}
			}
		}
		nbEmptyCells = 0;
		solvable = true;
		r = Board.r;
	}
	
	public void findBestPuzzle(int chosenLevel, int chosenNbSteps, int nbessais) {
		int bestLvl = 1;
		int bestNbTests = 0;
		int bestPuzzle[][][] = new int[nbnumbers][nbnumbers][d3size];
		for (int i=0;i<nbnumbers;i++) {
			for (int j=0;j<nbnumbers;j++) {
				for (int l=0;l<d3size;l++) {
					bestPuzzle[i][j][l] = board.values[i][j][l];
				}
				
			}
		}
		
		for (int n=0;n<nbessais;n++) {
			int levelForVeryHardSudokus = 4 + (nbnumbers/2-1)*3;
			int nbPossibles = ((nbnumbers * nbnumbers + 1)/2)*d3size;
			ArrayList<Integer> order = new ArrayList<>();
			for (int i=0;i<nbPossibles;i++) {
				order.add(r.nextInt(order.size()+1),i);
			}
			
			int tempBestNbEmptyCases = 0;
			int tempBestLvl = 1;
			int tempBestNbTests = 0;
			int previousLvl = 1;
			for (int i=0;i<nbnumbers;i++) {
				for (int j=0;j<nbnumbers;j++) {
					for (int l=0;l<d3size;l++) {
						puzzleTab[i][j][l] = board.values[i][j][l];
					}
				}
			}
			level = 1;
			nbEmptyCells = 0;
			for (int i=0;i<nbPossibles;i++) {
				int pos = order.get(i);
				int rowpos = (pos/d3size)/nbnumbers;
				int colpos = (pos/d3size)%nbnumbers;
				int d3pos = pos%d3size;
				//remove numbers (symetric)
				puzzleTab[rowpos][colpos][d3pos] = 0;
				puzzleTab[nbnumbers-rowpos-1][nbnumbers-colpos-1][d3pos] = 0;
				nbEmptyCells += 2;
				if (nbnumbers%2 == 0 && rowpos == colpos && rowpos == nbnumbers/2) {
					nbEmptyCells--;
				}
				level = 1;
				nbTests = 0;
				int solve = solver(puzzleTab, nbEmptyCells, level, 0, chosenLevel);
				//writePuzzle();
				//System.out.println("level: " + level + ", solve = " + solve);
				//System.out.println();
				if (solve > 1 || level > chosenLevel || nbTests > chosenNbSteps) {
					puzzleTab[rowpos][colpos][d3pos] = board.values[rowpos][colpos][d3pos];
					puzzleTab[nbnumbers-rowpos-1][nbnumbers-colpos-1][d3pos] = board.values[nbnumbers-rowpos-1][nbnumbers-colpos-1][d3pos];
					nbEmptyCells -= 2;
					if (nbnumbers%2 == 0 && rowpos == colpos && rowpos == nbnumbers/2 + 1) {
						nbEmptyCells++;
					}
					level = previousLvl;
					//System.out.println("level to hard, previous level = " + level);
					//System.out.println();
				} else if (level>tempBestLvl) {
					if (level == 8) {
						System.out.println("level 8, nbtests= " + nbTests);
					}
					tempBestLvl = level;
					previousLvl = level;
					tempBestNbTests = nbTests;
					tempBestNbEmptyCases = nbEmptyCells;
					//System.out.println("better level, previous level = " + level);
					//System.out.println();
				} else if (level==tempBestLvl && nbTests>tempBestNbTests) {
					tempBestNbTests = nbTests;
					tempBestNbEmptyCases = nbEmptyCells;
				} else if (level==tempBestLvl && nbTests==tempBestNbTests && nbEmptyCells>tempBestNbEmptyCases) {
					tempBestNbEmptyCases = nbEmptyCells;
				}
			}
			if (n==0 || tempBestLvl > bestLvl) {
				System.out.println("best level " + tempBestLvl + ", nbtests= " + tempBestNbTests);
				bestLvl = tempBestLvl;
				bestNbTests = tempBestNbTests;
				for (int i=0;i<nbnumbers;i++) {
					for (int j=0;j<nbnumbers;j++) {
						for (int l=0;l<d3size;l++) {
							bestPuzzle[i][j][l] = puzzleTab[i][j][l];
						}
					}
				}
			}
			if (chosenLevel < levelForVeryHardSudokus && bestLvl == chosenLevel) {
				break;
			}
		}
		for (int i=0;i<nbnumbers;i++) {
			for (int j=0;j<nbnumbers;j++) {
				for (int l=0;l<d3size;l++) {
					puzzleTab[i][j][l] = bestPuzzle[i][j][l];
				}
			}
		}
		level = bestLvl;
		nbTests = bestNbTests;
	}
	
	
	int solver(Integer sudoku[][][], int nbEmptyCells, int lvlmax, int nbTests, int chosenLevel) {
		//0= no solution, 1=unique solution, 2=multiple solution
		if (nbEmptyCells == 0) {
			return 1;
		} else {
			//search for unique solution
			boolean sudokuflags[][][][] = new boolean[nbnumbers][nbnumbers][d3size][nbnumbers];
			for (int i=0;i<nbnumbers;i++) {
				for (int j=0;j<nbnumbers;j++) {
					for (int l=0;l<d3size;l++) {
						if (sudoku[i][j][l] == 0) {
							sudokuflags[i][j][l]= candidates(i, j, l, sudoku);
							int count = 0;
							int firstcandidate = 0;
							for (int k=0;k<nbnumbers;k++) {
								if (sudokuflags[i][j][l][k]) {
									count++;
									firstcandidate = k+1;
								}	
							}
							if (count == 0) {
								//no solution
								return 0;
							}
							if (count == 1) {
								//unique solution for the cell
								sudoku[i][j][l] = firstcandidate;
								int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
								sudoku[i][j][l] = 0;
								return solve;
							}
						}
					}
					
				}
			}
			
			lvlmax = Math.max(2, lvlmax);
			level = Math.max(2, lvlmax);
			if (level > chosenLevel) return 2;
			//search for unique place
			boolean numberMissingRow[][][] = new boolean[nbnumbers][d3size][nbnumbers];
			boolean numberMissingCol[][][] = new boolean[nbnumbers][d3size][nbnumbers];
			boolean numberMissingBlock[][][] = new boolean[nbnumbers][d3size][nbnumbers];
			for(int i=0;i<nbnumbers;i++) {
				for(int l=0;l<d3size;l++) {
					for(int k=0;k<nbnumbers;k++) {
						numberMissingRow[i][l][k] = true;
						numberMissingCol[i][l][k] = true;
						numberMissingBlock[i][l][k] = true;
					}
				}
			}
			for(int r=0;r<nbnumbers;r++) {
				for(int c=0;c<nbnumbers;c++) {
					for(int l=0;l<d3size;l++) {
						if (sudoku[r][c][l] != 0) {
							int block = (r/nbrowsperblock)*nbrowsperblock + c/nbcolsperblock;
							numberMissingRow[r][l][sudoku[r][c][l]-1] = false;
							numberMissingCol[c][l][sudoku[r][c][l]-1] = false;
							numberMissingBlock[block][l][sudoku[r][c][l]-1] = false;
						}
					}
				}
			}
			for(int ro=0;ro<nbnumbers;ro++) {
				for(int l=0;l<d3size;l++) {
					for(int k=0;k<nbnumbers;k++) {
						if (numberMissingRow[ro][l][k]) {
							int pos = -1;
							int count = 0;
							for(int c=0;c<nbnumbers;c++) {
								if (sudoku[ro][c][l] == 0 && sudokuflags[ro][c][l][k]) {
									pos = c;
									count ++;
								}
							}
							if (count == 0) {
								return 0;
							}
							if (count == 1) {
								//unique cell for the number k+1
								sudoku[ro][pos][l] = k+1;
								int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
								sudoku[ro][pos][l] = 0;
								return solve;
							}
						}
					}
				}
			}
			for(int c=0;c<nbnumbers;c++) {
				for(int l=0;l<d3size;l++) {
					for(int k=0;k<nbnumbers;k++) {
						if (numberMissingCol[c][l][k]) {
							int pos = -1;
							int count = 0;
							for(int ro=0;ro<nbnumbers;ro++) {
								if (sudoku[ro][c][l] == 0 && sudokuflags[ro][c][l][k]) {
									pos = ro;
									count ++;
								}
							}
							if (count == 0) {
								//writeTempPuzzle(sudoku);
								return 0;
							}
							if (count == 1) {
								//unique cell for the number k+1
								sudoku[pos][c][l] = k+1;
								int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
								sudoku[pos][c][l] = 0;
								return solve;
							}
						}
					}
				}
			}
			for(int b=0;b<nbnumbers;b++) {
				int rowb = (b/nbrowsperblock)*nbrowsperblock;
				int colb = (b%nbrowsperblock)*nbcolsperblock;
				for(int l=0;l<d3size;l++) {
					for(int k=0;k<nbnumbers;k++) {
						if (numberMissingBlock[b][l][k]) {
							int posr = -1;
							int posc = -1;
							int count = 0;
							for(int i=0;i<nbrowsperblock;i++) {
								for(int j=0;j<nbcolsperblock;j++) {
									if (sudoku[rowb + i][colb + j][l] == 0 && sudokuflags[rowb + i][colb + j][l][k]) {
										posr = rowb + i;
										posc = colb + j;
										count++;
									}
								}
							}
							if (count == 0) {
								return 0;
							}
							if (count == 1) {
								//unique cell for the number k+1
								sudoku[posr][posc][l] = k+1;
								int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
								sudoku[posr][posc][l] = 0;
								return solve;
							}
						}
					}
				}
			}
			
			lvlmax = Math.max(3, lvlmax);
			level = Math.max(3, lvlmax);
			if (level > chosenLevel) return 2;
			
			//deduction cross?
			boolean deductionCross = simplifyByDeductionCross(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock);
			int singleSoluce[] = null;
			if (deductionCross) {
				singleSoluce = searchCellUniqueSolution(sudoku, sudokuflags);
				if (singleSoluce != null && singleSoluce[3] == -1) {
					return 0;
				}
				if (singleSoluce != null && singleSoluce[3] != -1) {
					sudoku[singleSoluce[0]][singleSoluce[1]][singleSoluce[2]] = singleSoluce[3];
					int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
					sudoku[singleSoluce[0]][singleSoluce[1]][singleSoluce[2]] = 0;
					return solve;
				}
				singleSoluce = searchUniquePosSolution(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock);
				if (singleSoluce != null && singleSoluce[3] == -1) {
					return 0;
				}
				if (singleSoluce != null && singleSoluce[3] != -1) {
					sudoku[singleSoluce[0]][singleSoluce[1]][singleSoluce[2]] = singleSoluce[3];
					int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
					sudoku[singleSoluce[0]][singleSoluce[1]][singleSoluce[2]] = 0;
					return solve;
				}
			}
			
			
			//pairs, triplets?
			int n = (nbnumbers/2)-1;
			int levelMethod = 3;
			for (int groupSize=2;groupSize<=n;groupSize++) {
				levelMethod++;
				lvlmax = Math.max(levelMethod, lvlmax);
				level = Math.max(levelMethod, lvlmax);
				if (level > chosenLevel) return 2;
				boolean visibleGroups = simplifyByVisibleGroups(sudoku, sudokuflags, groupSize);
				while (visibleGroups) {
					visibleGroups = simplifyByDeductionCross(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock);
					for (int g=2;g<level/2;g++) {
						visibleGroups = visibleGroups || simplifyByVisibleGroups(sudoku, sudokuflags, g);
						visibleGroups = visibleGroups || simplifyByNakedGroups(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock, g);
					}
					
					visibleGroups = visibleGroups || simplifyByVisibleGroups(sudoku, sudokuflags, groupSize);
					singleSoluce = searchCellUniqueSolution(sudoku, sudokuflags);
					if (singleSoluce != null && singleSoluce[3] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[3] != -1) {
						sudoku[singleSoluce[0]][singleSoluce[1]][singleSoluce[2]] = singleSoluce[3];
						int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]][singleSoluce[2]] = 0;
						return solve;
					}
					singleSoluce = searchUniquePosSolution(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock);
					if (singleSoluce != null && singleSoluce[3] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[3] != -1) {
						sudoku[singleSoluce[0]][singleSoluce[1]][singleSoluce[2]] = singleSoluce[3];
						int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]][singleSoluce[2]] = 0;
						return solve;
					}
				}
				levelMethod++;
				lvlmax = Math.max(levelMethod, lvlmax);
				level = Math.max(levelMethod, lvlmax);
				if (level > chosenLevel) return 2;
				//nakedGroup
				boolean nakedGroup = simplifyByNakedGroups(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock, groupSize);
				while (nakedGroup) {
					nakedGroup = simplifyByDeductionCross(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock);
					for (int g=2;g<=level/2;g++) {
						nakedGroup = nakedGroup || simplifyByVisibleGroups(sudoku, sudokuflags, g);
						nakedGroup = nakedGroup || simplifyByNakedGroups(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock, g);
					}
					singleSoluce = searchCellUniqueSolution(sudoku, sudokuflags);
					if (singleSoluce != null && singleSoluce[3] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[3] != -1) {
						sudoku[singleSoluce[0]][singleSoluce[1]][singleSoluce[2]] = singleSoluce[3];
						int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]][singleSoluce[2]] = 0;
						return solve;
					}
					singleSoluce = searchUniquePosSolution(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock);
					if (singleSoluce != null && singleSoluce[3] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[3] != -1) {
						sudoku[singleSoluce[0]][singleSoluce[1]][singleSoluce[2]] = singleSoluce[3];
						int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]][singleSoluce[2]] = 0;
						return solve;
					}
				}
			}
			
			for (int groupSize=2;groupSize<=n;groupSize++) {
				levelMethod++;
				lvlmax = Math.max(levelMethod, lvlmax);
				level = Math.max(levelMethod, lvlmax);
				if (level > chosenLevel) return 2;
				//swordfishes
				boolean swordfish = simplifyBySwordFishes(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock, groupSize);
				while (swordfish) {
					swordfish = simplifyByDeductionCross(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock);
					for (int groupSize2=2;groupSize2<=n;groupSize2++) {
						swordfish = swordfish || simplifyByVisibleGroups(sudoku, sudokuflags, groupSize2);
						swordfish = swordfish || simplifyByNakedGroups(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock, groupSize2);
					}
					for (int groupSize2=2;groupSize2<=groupSize;groupSize2++) {
						swordfish = swordfish || simplifyBySwordFishes(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock, groupSize);
					}
					singleSoluce = searchCellUniqueSolution(sudoku, sudokuflags);
					if (singleSoluce != null && singleSoluce[3] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[3] != -1) {
						sudoku[singleSoluce[0]][singleSoluce[1]][singleSoluce[2]] = singleSoluce[3];
						int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]][singleSoluce[2]] = 0;
						return solve;
					}
					singleSoluce = searchUniquePosSolution(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock);
					if (singleSoluce != null && singleSoluce[3] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[3] != -1) {
						sudoku[singleSoluce[0]][singleSoluce[1]][singleSoluce[2]] = singleSoluce[3];
						int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]][singleSoluce[2]] = 0;
						return solve;
					}
				}
			}
			
			
			levelMethod++;
			lvlmax = Math.max(levelMethod, lvlmax);
			level = Math.max(levelMethod, lvlmax);
			if (level > chosenLevel) return 2;
			//try candidates
			/*int emptyCellTry[] = searchCellXSolutions(sudoku, sudokuflags, 2);
			if (emptyCellTry != null) {
				nbTests += 2*nbEmptyCells;
				this.nbTests += 2*nbEmptyCells;
				int countSolutions = 0;
				for (int i=0;i<2;i++) {
					sudoku[emptyCellTry[0]][emptyCellTry[1]] = emptyCellTry[2+i];
					int solvePossibleCandidate = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
					sudoku[emptyCellTry[0]][emptyCellTry[1]] = 0;
					if (solvePossibleCandidate == 2) return 2;
					if (solvePossibleCandidate == 1) countSolutions++;
				}
				if (countSolutions>2) return 2;
				return countSolutions;
			}
			*/
			
		}
		
		return 2;
	}
	
	boolean[] candidates(int row, int col, int l, Integer tabValues[][][]) {
		boolean candidates[] = new boolean[nbnumbers];
		for (int k=0;k<nbnumbers;k++) {
			boolean isCandidate = true;
			//row
			for (int c=0;c<nbnumbers;c++) {
				if (tabValues[row][c][l] == k+1) {
					isCandidate = false;
					break;
				}
			}
			//col
			for (int r=0;r<nbnumbers;r++) {
				if (!isCandidate || tabValues[r][col][l] == k+1) {
					isCandidate = false;
					break;
				}
			}
			//d3
			for (int ll=0;ll<d3size;ll++) {
				if (!isCandidate || tabValues[row][col][ll] == k+1) {
					isCandidate = false;
					break;
				}
			}
			
			//block
			int rowblock = row/nbrowsperblock;
			int colblock = col/nbcolsperblock;
			for (int r=0;r<nbrowsperblock;r++) {
				for (int c=0;c<nbcolsperblock;c++) {
					if (!isCandidate || tabValues[rowblock*nbrowsperblock+r][colblock*nbcolsperblock+c][l] == k+1) {
						isCandidate = false;
						break;
					}
				}
			}
			
			candidates[k] = isCandidate;
		}
		return candidates;
	}
	
	int[] searchCellUniqueSolution(Integer sudoku[][][], boolean sudokuflags[][][][]) {
		//return tab of 3 numbers: row, colonne and number
		for (int i=0;i<nbnumbers;i++) {
			for (int j=0;j<nbnumbers;j++) {
				for (int l=0;l<d3size;l++) {
					if (sudoku[i][j][l] == 0) {
						int count = 0;
						int candidate = 0;
						for (int k=0;k<nbnumbers;k++) {
							if (sudokuflags[i][j][l][k]) {
								count++;
								candidate = k+1;
							}
						}
						if (count == 0) {
							return new int[] {0,0,0,-1};
						}
						if (count == 1) {
							return new int[] {i,j,l,candidate};
						}
					}
				}
			}
		}
		return null;
	}
	
	int[] searchCellXSolutions(Integer sudoku[][], boolean sudokuflags[][][], int nbsolutions) {
		//return tab of x numbers: row, colonne and numbers
		for (int i=0;i<nbnumbers;i++) {
			for (int j=0;j<nbnumbers;j++) {
				if (sudoku[i][j] == 0) {
					int count = 0;
					int candidates[] = new int[nbsolutions];
					for (int k=0;k<nbnumbers;k++) {
						if (sudokuflags[i][j][k]) {
							count++;
							if (count<=nbsolutions) {
								candidates[count-1] = k+1;
							}
							
						}
					}
					if (count == nbsolutions) {
						int[] result = new int[nbsolutions+2];
						result[0] = i;
						result[1] = j;
						for (int k=0;k<nbsolutions;k++) {
							result[2+k] = candidates[k];
						}
						return result;
					}
				}
			}
		}
		return null;
	}
	
	int[] searchUniquePosSolution(Integer sudoku[][][], boolean sudokuflags[][][][], boolean numberMissingRow[][][], boolean numberMissingCol[][][], boolean numberMissingBlock[][][]) {
		//return tab of 3 numbers: row, colonne, l and number
		//row
		for (int ro=0;ro<nbnumbers;ro++) {
			for (int l=0;l<d3size;l++) {
				for (int k=0;k<nbnumbers;k++) {
					if (numberMissingRow[ro][l][k]) {
						int count = 0;
						int pos = -1;
						for (int c=0;c<nbnumbers;c++) {
							if (sudoku[ro][c][l] == 0 && sudokuflags[ro][c][l][k]) {
								count++;
								pos = c;
							}
						}
						if (count == 0) {
							return new int[] {0,0,0,-1};
						}
						if (count == 1) {
							return new int[] {ro,pos,l,k+1};
						}
					}
				}
			}
		}
		//col
		for (int c=0;c<nbnumbers;c++) {
			for (int l=0;l<d3size;l++) {
				for (int k=0;k<nbnumbers;k++) {
					if (numberMissingCol[c][l][k]) {
						int count = 0;
						int pos = -1;
						for (int ro=0;ro<nbnumbers;ro++) {
							if (sudoku[ro][c][l] == 0 && sudokuflags[ro][c][l][k]) {
								count++;
								pos = ro;
							}
						}
						if (count == 0) {
							return new int[] {0,0,0,-1};
						}
						if (count == 1) {
							return new int[] {pos,c,l,k+1};
						}
					}
				}
			}
		}
		//block
		for (int b=0;b<nbnumbers;b++) {
			for (int l=0;l<d3size;l++) {
				int rowBlock = (b/nbrowsperblock)*nbrowsperblock;
				int colBlock = (b%nbrowsperblock)*nbcolsperblock;
				for (int k=0;k<nbnumbers;k++) {
					if (numberMissingBlock[b][l][k]) {
						int count = 0;
						int posRow = -1;
						int posCol = -1;
						for (int posb=0;posb<nbnumbers;posb++) {
							int ro = rowBlock + posb/nbcolsperblock;
							int c = colBlock + posb%nbcolsperblock;
							if (sudoku[ro][c][l] == 0 && sudokuflags[ro][c][l][k]) {
								count++;
								posRow = ro;
								posCol = c;
							}
						}
						if (count == 0) {
							return new int[] {0,0,0,-1};
						}
						if (count == 1) {
							return new int[] {posRow,posCol,l,k+1};
						}
					}
				}
			}
		}
		return null;
	}
	
	boolean simplifyByDeductionCross(Integer sudoku[][][], boolean sudokuflags[][][][], boolean numberMissingRow[][][], boolean numberMissingCol[][][], boolean numberMissingBlock[][][]) {
		boolean hasChanged = true;
		boolean hasSimplyfied = false;
		while (hasChanged) {
			hasChanged = false;
			//row
			for(int i=0;i<nbnumbers;i++) {
				for (int l=0;l<d3size;l++) {
					for(int k=0;k<nbnumbers;k++) {
						if (numberMissingRow[i][l][k]) {
							int posBloc = -1;
							int count = 0;
							for(int c=0;c<nbnumbers;c++) {
								if (sudoku[i][c][l] == 0 && sudokuflags[i][c][l][k]) {
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
											if (sudoku[rowBlockLocation + r][colBlockLocation + c][l] == 0 && sudokuflags[rowBlockLocation + r][colBlockLocation + c][l][k]) {
												sudokuflags[rowBlockLocation + r][colBlockLocation + c][l][k] = false;
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
			}
			//col
			for(int j=0;j<nbnumbers;j++) {
				for (int l=0;l<d3size;l++) {
					for(int k=0;k<nbnumbers;k++) {
						if (numberMissingCol[j][l][k]) {
							int posBloc = -1;
							int count = 0;
							for(int r=0;r<nbnumbers;r++) {
								if (sudoku[r][j][l] == 0 && sudokuflags[r][j][l][k]) {
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
											if (sudoku[rowBlockLocation + r][colBlockLocation + c][l] == 0 && sudokuflags[rowBlockLocation + r][colBlockLocation + c][l][k]) {
												sudokuflags[rowBlockLocation + r][colBlockLocation + c][l][k] = false;
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
			}
			//block
			for(int b=0;b<nbnumbers;b++) {
				for (int l=0;l<d3size;l++) {
					for(int k=0;k<nbnumbers;k++) {
						if (numberMissingBlock[b][l][k]) {
							int posBlocRow = -1;
							int posBlocCol = -1;
							int rowBlock = (b/nbrowsperblock)*nbrowsperblock;
							int colBlock = (b%nbrowsperblock)*nbcolsperblock;
							int countRow = 0;
							int countCol = 0;
							for(int posb=0;posb<nbnumbers;posb++) {
								if (sudoku[rowBlock + posb/nbcolsperblock][colBlock + posb%nbcolsperblock][l] == 0 && sudokuflags[rowBlock + posb/nbcolsperblock][colBlock + posb%nbcolsperblock][l][k]) {
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
										if (sudoku[posBlocRow][c][l] == 0 && sudokuflags[posBlocRow][c][l][k]) {
											sudokuflags[posBlocRow][c][l][k] = false;
											hasChanged = true;
											hasSimplyfied = true;
										}
									}
								}
							} else if (countCol == 1) {
								//unique col for the number k+1
								for(int ro=0;ro<nbnumbers;ro++) {
									if (ro < rowBlock || ro >= rowBlock + nbrowsperblock) {
										if (sudoku[ro][posBlocCol][l] == 0 && sudokuflags[ro][posBlocCol][l][k]) {
											sudokuflags[ro][posBlocCol][l][k] = false;
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
		}
		return hasSimplyfied;
		
	}
	
	boolean simplifyByVisibleGroups(Integer sudoku[][][], boolean sudokuflags[][][][], int groupSize) {
		//visible pairs, triplets, ...
		boolean hasSimplyfied = false;
		//row
		for (int ro=0;ro<nbnumbers;ro++) {
			for (int l=0;l<nbnumbers;l++) {
				ArrayList<Integer> positionsEmptyCells = new ArrayList<Integer>();
				for (int c=0;c<nbnumbers;c++) {
					if (sudoku[ro][c][l] == 0) {
						positionsEmptyCells.add(c);
					}
				}
				if (positionsEmptyCells.size() >= 2*groupSize) {
					for (int i=0;i<positionsEmptyCells.size()+1-groupSize;i++) {
						int groupCells[] = new int[groupSize];
						groupCells[0] = positionsEmptyCells.get(i);
						int nbCandidates = 0;
						for (int k=0;k<nbnumbers;k++) {
							if (sudokuflags[ro][groupCells[0]][l][k]) {
								nbCandidates++;
							}
						}
						groupCells = searchVisibleGroupRowsRecursive(ro, l, sudokuflags, positionsEmptyCells, groupSize,
								i+1, groupCells, 1, nbCandidates);
						if (groupCells != null) {
							//group found
							ArrayList<Integer> groupCandidates = new ArrayList<>();
							for (int g=0;g<groupCells.length;g++) {
								int col = groupCells[g];
								for (int k=0;k<nbnumbers;k++) {
									if (sudokuflags[ro][col][l][k] && !groupCandidates.contains(k)) {
										groupCandidates.add(k);
									}
								}
							}
							for (int j=0;j<positionsEmptyCells.size();j++) {
								int col = positionsEmptyCells.get(j);
								boolean notIngroup = true;
								for (int g=0;g<groupCells.length;g++) {
									if (groupCells[g] == col) {
										notIngroup = false;
										break;
									}
								}
								if (notIngroup) {
									//suppress candidates
									for (int cand=0;cand<groupCandidates.size();cand++) {
										
										if (sudokuflags[ro][col][l][groupCandidates.get(cand)]) {
											sudokuflags[ro][col][l][groupCandidates.get(cand)] = false;
											hasSimplyfied = true;
										}
									}
								}
							}
						}
					}
				}
			}	
		}
		//col
		for (int c=0;c<nbnumbers;c++) {
			for (int l=0;l<nbnumbers;l++) {
				ArrayList<Integer> positionsEmptyCells = new ArrayList<Integer>();
				for (int ro=0;ro<nbnumbers;ro++) {
					if (sudoku[ro][c][l] == 0) {
						positionsEmptyCells.add(c);
					}
				}
				if (positionsEmptyCells.size() >= 2*groupSize) {
					for (int i=0;i<positionsEmptyCells.size()+1-groupSize;i++) {
						int groupCells[] = new int[groupSize];
						groupCells[0] = positionsEmptyCells.get(i);
						int nbCandidates = 0;
						for (int k=0;k<nbnumbers;k++) {
							if (sudokuflags[groupCells[0]][c][l][k]) {
								nbCandidates++;
							}
						}
						groupCells = searchVisibleGroupColsRecursive(c, l, sudokuflags, positionsEmptyCells, groupSize,
								i+1, groupCells, 1, nbCandidates);
						if (groupCells != null) {
							//group found
							ArrayList<Integer> groupCandidates = new ArrayList<>();
							for (int g=0;g<groupCells.length;g++) {
								int row = groupCells[g];
								for (int k=0;k<nbnumbers;k++) {
									if (sudokuflags[row][c][l][k] && !groupCandidates.contains(k)) {
										groupCandidates.add(k);
									}
								}
							}
							
							for (int j=0;j<positionsEmptyCells.size();j++) {
								int ro = positionsEmptyCells.get(j);
								boolean notIngroup = true;
								for (int g=0;g<groupCells.length;g++) {
									if (groupCells[g] == ro) {
										notIngroup = false;
										break;
									}
								}
								if (notIngroup) {
									//suppress candidates
									for (int cand=0;cand<groupCandidates.size();cand++) {
										if (sudokuflags[ro][c][l][groupCandidates.get(cand)]) {
											sudokuflags[ro][c][l][groupCandidates.get(cand)] = false;
											hasSimplyfied = true;
										}
									}
								}
							}
						}
					}
				}
			}
		}
		
		//block
		for (int b=0;b<nbnumbers;b++) {
			for (int l=0;l<nbnumbers;l++) {
				ArrayList<Integer> positionsEmptyCells = new ArrayList<Integer>();
				int rowblock = (b/nbrowsperblock)*nbrowsperblock;
				int colblock = (b%nbrowsperblock)*nbcolsperblock;
				for (int pos=0;pos<nbnumbers;pos++) {
					int rob = rowblock + pos/nbcolsperblock;
					int roc = colblock + pos%nbcolsperblock;
					if (sudoku[rob][roc][l] == 0) {
						positionsEmptyCells.add(pos);
					}
				}
				if (positionsEmptyCells.size() >= 2*groupSize) {
					for (int i=0;i<positionsEmptyCells.size()+1-groupSize;i++) {
						int groupCells[] = new int[groupSize];
						groupCells[0] = positionsEmptyCells.get(i);
						int nbCandidates = 0;
						int rob = rowblock + groupCells[0]/nbcolsperblock;
						int roc = colblock + groupCells[0]%nbcolsperblock;
						for (int k=0;k<nbnumbers;k++) {
							if (sudokuflags[rob][roc][l][k]) {
								nbCandidates++;
							}
						}
						groupCells = searchVisibleGroupBlocksRecursive(rowblock, colblock, l, sudokuflags, positionsEmptyCells, groupSize,
								i+1, groupCells, 1, nbCandidates);
						if (groupCells != null) {
							//group found
							ArrayList<Integer> groupCandidates = new ArrayList<>();
							for (int g=0;g<groupCells.length;g++) {
								int row =  rowblock + groupCells[g]/nbcolsperblock;
								int c =  colblock + groupCells[g]%nbcolsperblock;
								for (int k=0;k<nbnumbers;k++) {
									if (sudokuflags[row][c][l][k] && !groupCandidates.contains(k)) {
										groupCandidates.add(k);
									}
								}
							}
							
							for (int j=0;j<positionsEmptyCells.size();j++) {
								int pos = positionsEmptyCells.get(j);
								boolean notIngroup = true;
								for (int g=0;g<groupCells.length;g++) {
									if (groupCells[g] == pos) {
										notIngroup = false;
										break;
									}
								}
								if (notIngroup) {
									//suppress candidates
									int ro =  rowblock + pos/nbcolsperblock;
									int c =  colblock + pos%nbcolsperblock;
									for (int cand=0;cand<groupCandidates.size();cand++) {
										if (sudokuflags[ro][c][l][groupCandidates.get(cand)]) {
											sudokuflags[ro][c][l][groupCandidates.get(cand)] = false;
											hasSimplyfied = true;
										}
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
	
	int[] searchVisibleGroupRowsRecursive(int row, int l, boolean sudokuflags[][][][], ArrayList<Integer> positionsEmptyCells, int groupSize,
			int index, int partialGroup[], int step, int nbCandidates) {
		if (nbCandidates > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		for (int i=index;i<positionsEmptyCells.size();i++) {
			partialGroup[step] = positionsEmptyCells.get(i);
			nbCandidates = 0;
			ArrayList<Integer> candidatesGroup = new ArrayList<Integer>();
			for (int k=0;k<nbnumbers;k++) {
				for (int j=0;j<=step;j++) {
					if (sudokuflags[row][partialGroup[j]][l][k]) {
						if (!candidatesGroup.contains(k)) {
							candidatesGroup.add(k);
							nbCandidates++;
						}
					}
				}
			}
			int group[] = searchVisibleGroupRowsRecursive(row, l, sudokuflags, positionsEmptyCells, groupSize,
					i+1, partialGroup, step+1, nbCandidates);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	int[] searchVisibleGroupColsRecursive(int col, int l,boolean sudokuflags[][][][], ArrayList<Integer> positionsEmptyCells, int groupSize,
			int index, int partialGroup[], int step, int nbCandidates) {
		if (nbCandidates > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		for (int i=index;i<positionsEmptyCells.size();i++) {
			partialGroup[step] = positionsEmptyCells.get(i);
			nbCandidates = 0;
			ArrayList<Integer> candidatesGroup = new ArrayList<Integer>();
			for (int k=0;k<nbnumbers;k++) {
				for (int j=0;j<=step;j++) {
					if (sudokuflags[partialGroup[j]][col][l][k]) {
						if (!candidatesGroup.contains(k)) {
							candidatesGroup.add(k);
							nbCandidates++;
						}
					}
				}
			}
			int group[] = searchVisibleGroupColsRecursive(col, l, sudokuflags, positionsEmptyCells, groupSize,
					i+1, partialGroup, step+1, nbCandidates);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	int[] searchVisibleGroupBlocksRecursive(int rowblock, int colblock, int l,boolean sudokuflags[][][][], ArrayList<Integer> positionsEmptyCells, int groupSize,
			int index, int partialGroup[], int step, int nbCandidates) {
		if (nbCandidates > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		
		
		for (int i=index;i<positionsEmptyCells.size();i++) {
			partialGroup[step] = positionsEmptyCells.get(i);
			nbCandidates = 0;
			ArrayList<Integer> candidatesGroup = new ArrayList<Integer>();
			for (int k=0;k<nbnumbers;k++) {
				for (int j=0;j<=step;j++) {
					int rob = rowblock + partialGroup[j]/nbcolsperblock;
					int roc = colblock + partialGroup[j]%nbcolsperblock;
					if (sudokuflags[rob][roc][l][k]) {
						if (!candidatesGroup.contains(k)) {
							candidatesGroup.add(k);
							nbCandidates++;
						}
					}
				}
			}
			int group[] = searchVisibleGroupBlocksRecursive(rowblock, colblock, l, sudokuflags, positionsEmptyCells, groupSize,
					i+1, partialGroup, step+1, nbCandidates);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	boolean simplifyByNakedGroups(Integer sudoku[][][], boolean sudokuflags[][][][], boolean numberMissingRow[][][], boolean numberMissingCol[][][], boolean numberMissingBlock[][][], int groupSize) {
		//naked pairs, triplets, ...
		boolean hasSimplyfied = false;
		//row
		for (int row=0;row<nbnumbers;row++) {
			for (int l=0;l<d3size;l++) {
				ArrayList<Integer> missingNumbersList = new ArrayList<Integer>();
				for (int k=0;k<nbnumbers;k++) {
					if (numberMissingRow[row][l][k]) {
						missingNumbersList.add(k+1);
					}
				}
				if (missingNumbersList.size() >= 2*groupSize) {
					for (int i=0;i<missingNumbersList.size()+1-groupSize;i++) {
						int groupNumbers[] = new int[groupSize];
						groupNumbers[0] = missingNumbersList.get(i);
						int nbCandidatesPos = 0;
						for (int c=0;c<nbnumbers;c++) {
							if (sudoku[row][c][l]==0 && sudokuflags[row][c][l][groupNumbers[0]]) {
								nbCandidatesPos++;
							}
						}
						groupNumbers = searchNakedGroupRowsRecursive(sudoku, row, l, sudokuflags, missingNumbersList, groupSize,
								i+1, groupNumbers, 1, nbCandidatesPos);
						if (groupNumbers != null) {
							//group found
							ArrayList<Integer> groupCandidatesPos = new ArrayList<>();
							for (int g=0;g<groupNumbers.length;g++) {
								int k = groupNumbers[g]-1;
								for (int c=0;c<nbnumbers;c++) {
									if (sudoku[row][c][l]==0 && sudokuflags[row][c][l][k] && !groupCandidatesPos.contains(c)) {
										groupCandidatesPos.add(c);
									}
								}
							}
							for (int j=0;j<missingNumbersList.size();j++) {
								int k = missingNumbersList.get(j)-1;
								boolean notIngroup = true;
								for (int g=0;g<groupNumbers.length;g++) {
									if (groupNumbers[g] == k+1) {
										notIngroup = false;
										break;
									}
								}
								if (notIngroup) {
									//suppress candidates
									for (int cand=0;cand<groupCandidatesPos.size();cand++) {
										if (sudoku[row][groupCandidatesPos.get(cand)][l]==0 && sudokuflags[row][groupCandidatesPos.get(cand)][l][k]) {
											sudokuflags[row][groupCandidatesPos.get(cand)][l][k] = false;
											hasSimplyfied = true;
										}
									}
								}
							}
						}
					}
				}
			}
		}
		//col
		for (int col=0;col<nbnumbers;col++) {
			for (int l=0;l<d3size;l++) {
				ArrayList<Integer> missingNumbersList = new ArrayList<Integer>();
				for (int k=0;k<nbnumbers;k++) {
					if (numberMissingCol[col][l][k]) {
						missingNumbersList.add(k+1);
					}
				}
				if (missingNumbersList.size() >= 2*groupSize) {
					for (int i=0;i<missingNumbersList.size()+1-groupSize;i++) {
						int groupNumbers[] = new int[groupSize];
						groupNumbers[0] = missingNumbersList.get(i);
						int nbCandidatesPos = 0;
						for (int ro=0;ro<nbnumbers;ro++) {
							if (sudoku[ro][col][l]==0 && sudokuflags[ro][col][l][groupNumbers[0]]) {
								nbCandidatesPos++;
							}
						}
						groupNumbers = searchNakedGroupColsRecursive(sudoku, col, l, sudokuflags, missingNumbersList, groupSize,
								i+1, groupNumbers, 1, nbCandidatesPos);
						if (groupNumbers != null) {
							ArrayList<Integer> groupCandidatesPos = new ArrayList<>();
							for (int g=0;g<groupNumbers.length;g++) {
								int k = groupNumbers[g]-1;
								for (int ro=0;ro<nbnumbers;ro++) {
									if (sudoku[ro][col][l]==0 && sudokuflags[ro][col][l][k] && !groupCandidatesPos.contains(ro)) {
										groupCandidatesPos.add(ro);
									}
								}
							}
							for (int j=0;j<missingNumbersList.size();j++) {
								int k = missingNumbersList.get(j)-1;
								boolean notIngroup = true;
								for (int g=0;g<groupNumbers.length;g++) {
									if (groupNumbers[g] == k+1) {
										notIngroup = false;
										break;
									}
								}
								if (notIngroup) {
									//suppress candidates
									for (int cand=0;cand<groupCandidatesPos.size();cand++) {
										if (sudoku[groupCandidatesPos.get(cand)][col][l]==0 && sudokuflags[groupCandidatesPos.get(cand)][col][l][k]) {
											sudokuflags[groupCandidatesPos.get(cand)][col][l][k] = false;
											hasSimplyfied = true;
										}
									}
								}
							}
						}
					}
				}
			}
		}
		//block
		for (int b=0;b<nbnumbers;b++) {
			for (int l=0;l<d3size;l++) {
				ArrayList<Integer> missingNumbersList = new ArrayList<Integer>();
				for (int k=0;k<nbnumbers;k++) {
					if (numberMissingBlock[b][l][k]) {
						missingNumbersList.add(k+1);
					}
				}
				int rowblock = (b/nbrowsperblock)*nbrowsperblock;
				int colblock = (b%nbrowsperblock)*nbcolsperblock;
				if (missingNumbersList.size() >= 2*groupSize) {
					for (int i=0;i<missingNumbersList.size()+1-groupSize;i++) {
						int groupNumbers[] = new int[groupSize];
						groupNumbers[0] = missingNumbersList.get(i);
						int nbCandidatesPos = 0;
						for (int pos=0;pos<nbnumbers;pos++) {
							int rob = rowblock + pos/nbcolsperblock;
							int roc = colblock + pos%nbcolsperblock;
							if (sudoku[rob][roc][l]==0 && sudokuflags[rob][roc][l][groupNumbers[0]]) {
								nbCandidatesPos++;
							}
						}
						groupNumbers = searchNakedGroupBlocksRecursive(sudoku,rowblock, colblock, l, sudokuflags, missingNumbersList, groupSize,
								i+1, groupNumbers, 1, nbCandidatesPos);
						if (groupNumbers != null) {
							//group found
							ArrayList<Integer> groupCandidatesPos = new ArrayList<>();
							for (int g=0;g<groupNumbers.length;g++) {
								for (int pos=0;pos<nbnumbers;pos++) {
									int row =  rowblock + pos/nbcolsperblock;
									int c =  colblock + pos%nbcolsperblock;
									if (sudoku[row][c][l]==0 && sudokuflags[row][c][l][groupNumbers[g]-1] && !groupCandidatesPos.contains(pos)) {
										groupCandidatesPos.add(pos);
									}
								}
							}
							
							for (int j=0;j<missingNumbersList.size();j++) {
								int k = missingNumbersList.get(j)-1;
								boolean notIngroup = true;
								for (int g=0;g<groupNumbers.length;g++) {
									if (groupNumbers[g] == k+1) {
										notIngroup = false;
										break;
									}
								}
								if (notIngroup) {
									//suppress candidates
									for (int cand=0;cand<groupCandidatesPos.size();cand++) {
										int ro =  rowblock + groupCandidatesPos.get(cand)/nbcolsperblock;
										int c =  colblock + groupCandidatesPos.get(cand)%nbcolsperblock;
										if (sudokuflags[ro][c][l][k]) {
											sudokuflags[ro][c][l][k] = false;
											hasSimplyfied = true;
										}
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
	
	int[] searchNakedGroupRowsRecursive(Integer sudoku[][][],int row, int l, boolean sudokuflags[][][][], ArrayList<Integer> missingNumbers, int groupSize,
			int index, int partialGroup[], int step, int nbCandidatesPos) {
		if (nbCandidatesPos > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		for (int i=index;i<missingNumbers.size();i++) {
			partialGroup[step] = missingNumbers.get(i);
			nbCandidatesPos = 0;
			ArrayList<Integer> candidatesGroup = new ArrayList<Integer>();
			for (int j=0;j<=step;j++) {
				for (int c=0;c<nbnumbers;c++) {
					if (sudoku[row][c][l]==0 && sudokuflags[row][c][l][partialGroup[j]-1]) {
						if (!candidatesGroup.contains(c)) {
							candidatesGroup.add(c);
							nbCandidatesPos++;
						}
					}
				}
			}
			int group[] = searchNakedGroupRowsRecursive(sudoku, row, l, sudokuflags, missingNumbers, groupSize,
					i+1, partialGroup, step+1, nbCandidatesPos);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	int[] searchNakedGroupColsRecursive(Integer sudoku[][][],int col, int l, boolean sudokuflags[][][][], ArrayList<Integer> missingNumbers, int groupSize,
			int index, int partialGroup[], int step, int nbCandidatesPos) {
		if (nbCandidatesPos > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		for (int i=index;i<missingNumbers.size();i++) {
			partialGroup[step] = missingNumbers.get(i);
			nbCandidatesPos = 0;
			ArrayList<Integer> candidatesGroup = new ArrayList<Integer>();
			for (int j=0;j<=step;j++) {
				for (int ro=0;ro<nbnumbers;ro++) {
					if (sudoku[ro][col][l]==0 && sudokuflags[ro][col][l][partialGroup[j]-1]) {
						if (!candidatesGroup.contains(ro)) {
							candidatesGroup.add(ro);
							nbCandidatesPos++;
						}
					}
				}
			}
			int group[] = searchNakedGroupColsRecursive(sudoku, col, l, sudokuflags, missingNumbers, groupSize,
					i+1, partialGroup, step+1, nbCandidatesPos);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	int[] searchNakedGroupBlocksRecursive(Integer sudoku[][][], int rowblock, int colblock, int l, boolean sudokuflags[][][][], ArrayList<Integer> missingNumbers, int groupSize,
			int index, int partialGroup[], int step, int nbCandidatesPos) {
		if (nbCandidatesPos > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		for (int i=index;i<missingNumbers.size();i++) {
			partialGroup[step] = missingNumbers.get(i);
			nbCandidatesPos = 0;
			ArrayList<Integer> candidatesGroup = new ArrayList<Integer>();
			for (int j=0;j<=step;j++) {
				for (int pos=0;pos<nbnumbers;pos++) {
					int ro = rowblock + pos/nbcolsperblock;
					int col = colblock + pos%nbcolsperblock;
					if (sudoku[ro][col][l]==0 && sudokuflags[ro][col][l][partialGroup[j]-1]) {
						if (!candidatesGroup.contains(pos)) {
							candidatesGroup.add(pos);
							nbCandidatesPos++;
						}
					}
				}
			}
			int group[] = searchNakedGroupBlocksRecursive(sudoku, rowblock, colblock, l, sudokuflags, missingNumbers, groupSize,
					i+1, partialGroup, step+1, nbCandidatesPos);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	boolean simplifyBySwordFishes(Integer sudoku[][][], boolean sudokuflags[][][][], boolean numberMissingRow[][][], boolean numberMissingCol[][][], boolean numberMissingBlock[][][], int groupSize) {
		//for example X-Wing for position pairs
		boolean hasSimplyfied = false;
		for (int k=0;k<nbnumbers;k++) {
			for (int l=0;l<d3size;l++) {
				int countKPut = 0;
				for (int b=0;b<nbnumbers;b++) {
					if (numberMissingBlock[b][l][k]) {
						countKPut++;
					}
				}
				if (countKPut >= 2*groupSize) {
					//rows
					ArrayList<Integer> valueMissingRows = new ArrayList<Integer>();
					for (int row=0;row<nbnumbers;row++) {
						if (numberMissingRow[row][l][k]) {
							valueMissingRows.add(row);
						}
					}
					for (int i=0;i<countKPut+1-groupSize;i++) {
						int groupRows[] = new int[groupSize];
						groupRows[0] = valueMissingRows.get(i);
						int nbCandidatesPos = 0;
						for (int c=0;c<nbnumbers;c++) {
							if (sudoku[groupRows[0]][c][l] == 0 && sudokuflags[groupRows[0]][c][l][k]) {
								nbCandidatesPos++;
							}
						}
						groupRows = searchSwordFishGroupRowsRecursive(sudoku, l, k, sudokuflags, valueMissingRows, groupSize,
								i+1, groupRows, 1, nbCandidatesPos);
						if (groupRows != null) {
							//found
							ArrayList<Integer> candidatesCol = new ArrayList<Integer>();
							for (int j=0;j<groupSize;j++) {
								for (int c=0;c<nbnumbers;c++) {
									if (sudoku[groupRows[j]][c][l]==0 && sudokuflags[groupRows[j]][c][l][k]) {
										if (!candidatesCol.contains(c)) {
											candidatesCol.add(c);
										}
									}
								}
							}
							for (int j=0;j<candidatesCol.size();j++) {
								int c = candidatesCol.get(j);
								for (int ro=0;ro<nbnumbers;ro++) {
									boolean notInGroup = true;
									for (int g=0;g<groupSize;g++) {
										if (groupRows[g] == ro) {
											notInGroup = false;
										}
									}
									if (sudoku[ro][c][l]==0 && notInGroup && sudokuflags[ro][c][l][k]) {
										sudokuflags[ro][c][l][k] = false;
										hasSimplyfied = true;
									}
								}
							}
						}
					}
					//col
					ArrayList<Integer> valueMissingCols = new ArrayList<Integer>();
					for (int col=0;col<nbnumbers;col++) {
						if (numberMissingCol[col][l][k]) {
							valueMissingCols.add(col);
						}
					}
					for (int i=0;i<countKPut+1-groupSize;i++) {
						int groupCols[] = new int[groupSize];
						groupCols[0] = valueMissingCols.get(i);
						int nbCandidatesPos = 0;
						for (int ro=0;ro<nbnumbers;ro++) {
							if (sudoku[ro][groupCols[0]][l] == 0 && sudokuflags[ro][groupCols[0]][l][k]) {
								nbCandidatesPos++;
							}
						}
						groupCols = searchSwordFishGroupColsRecursive(sudoku, l, k, sudokuflags, valueMissingCols, groupSize,
								i+1, groupCols, 1, nbCandidatesPos);
						if (groupCols != null) {
							//found
							ArrayList<Integer> candidatesRow = new ArrayList<Integer>();
							for (int j=0;j<groupSize;j++) {
								for (int ro=0;ro<nbnumbers;ro++) {
									if (sudoku[ro][groupCols[j]][l]==0 && sudokuflags[ro][groupCols[j]][l][k]) {
										if (!candidatesRow.contains(ro)) {
											candidatesRow.add(ro);
										}
									}
								}
							}
							for (int j=0;j<candidatesRow.size();j++) {
								int ro = candidatesRow.get(j);
								for (int c=0;c<nbnumbers;c++) {
									boolean notInGroup = true;
									for (int g=0;g<groupSize;g++) {
										if (groupCols[g] == c) {
											notInGroup = false;
										}
									}
									if (sudoku[ro][c][l]==0 && notInGroup && sudokuflags[ro][c][l][k]) {
										sudokuflags[ro][c][l][k] = false;
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
	
	int[] searchSwordFishGroupRowsRecursive(Integer sudoku[][][], int l, int missingValue, boolean sudokuflags[][][][], ArrayList<Integer> valueMissingRows, int groupSize,
			int index, int partialGroup[], int step, int nbCandidatesPos) {
		if (nbCandidatesPos > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		for (int i=index;i<valueMissingRows.size();i++) {
			partialGroup[step] = valueMissingRows.get(i);
			nbCandidatesPos = 0;
			ArrayList<Integer> candidatesGroup = new ArrayList<Integer>();
			for (int j=0;j<=step;j++) {
				for (int c=0;c<nbnumbers;c++) {
					if (sudoku[partialGroup[j]][c][l]==0 && sudokuflags[partialGroup[j]][c][l][missingValue]) {
						if (!candidatesGroup.contains(c)) {
							candidatesGroup.add(c);
							nbCandidatesPos++;
						}
					}
				}
			}
			int group[] = searchSwordFishGroupRowsRecursive(sudoku, l, missingValue, sudokuflags, valueMissingRows, groupSize,
					i+1, partialGroup, step+1, nbCandidatesPos);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	int[] searchSwordFishGroupColsRecursive(Integer sudoku[][][], int l,int missingValue, boolean sudokuflags[][][][], ArrayList<Integer> valueMissingCols, int groupSize,
			int index, int partialGroup[], int step, int nbCandidatesPos) {
		if (nbCandidatesPos > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		for (int i=index;i<valueMissingCols.size();i++) {
			partialGroup[step] = valueMissingCols.get(i);
			nbCandidatesPos = 0;
			ArrayList<Integer> candidatesGroup = new ArrayList<Integer>();
			for (int j=0;j<=step;j++) {
				for (int ro=0;ro<nbnumbers;ro++) {
					if (sudoku[ro][partialGroup[j]][l]==0 && sudokuflags[ro][partialGroup[j]][l][missingValue]) {
						if (!candidatesGroup.contains(ro)) {
							candidatesGroup.add(ro);
							nbCandidatesPos++;
						}
					}
				}
			}
			int group[] = searchSwordFishGroupColsRecursive(sudoku, l, missingValue, sudokuflags, valueMissingCols, groupSize,
					i+1, partialGroup, step+1, nbCandidatesPos);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	boolean simplifyByDeductionCrossX(Integer sudoku[][], boolean sudokuflags[][][], boolean numberMissingRow[][], boolean numberMissingCol[][], boolean numberMissingBlock[][], int groupSize) {
		boolean hasChanged = true;
		boolean hasSimplyfied = false;
		while (hasChanged) {
			hasChanged = false;
			if (nbrowsperblock >= 2*groupSize) {
				//row-block
				for(int k=0;k<nbnumbers;k++) {
					for(int rowb=0;rowb<nbcolsperblock;rowb++) {
						ArrayList<Integer> rowsMissing = new ArrayList<Integer>();
						for(int ro=0;ro<nbrowsperblock;ro++) {
							int row = rowb*nbrowsperblock+ro;
							if (numberMissingRow[row][k]) {
								rowsMissing.add(row);
							}
						}
						if (rowsMissing.size() >= 2*groupSize) {
							for (int i=0;i<rowsMissing.size()+1-groupSize;i++) {
								int groupRows[] = new int[groupSize];
								groupRows[0] = rowsMissing.get(i);
								int nbBlocks = 0;
								ArrayList<Integer> listBlocks = new ArrayList<Integer>();
								for (int c=0;c<nbnumbers;c++) {
									if (sudoku[groupRows[0]][c]==0 && sudokuflags[groupRows[0]][c][k]) {
										int bPosCol = c/nbcolsperblock;
										if (!listBlocks.contains(bPosCol)) {
											listBlocks.add(bPosCol);
											nbBlocks++;
										}
									}
								}
								groupRows = searchDeductionCrossGroupRowsRecursive(sudoku, k, sudokuflags, rowsMissing, groupSize,
										i+1, groupRows, 1, nbBlocks);
								if (groupRows!=null) {
									listBlocks = new ArrayList<Integer>();
									for (int c=0;c<nbnumbers;c++) {
										for (int g=0;g<groupSize;g++) {
											if (sudoku[groupRows[g]][c]==0 && sudokuflags[groupRows[g]][c][k]) {
												int bPosCol = c/nbcolsperblock;
												if (!listBlocks.contains(bPosCol)) {
													listBlocks.add(bPosCol);
												}
											}
										}
									}
									for (int jb=0;jb<listBlocks.size();jb++) {
										int colBlock = listBlocks.get(jb)*nbcolsperblock;
										for (int rob=rowb*nbrowsperblock;rob<rowb*nbrowsperblock+nbrowsperblock;rob++) {
											boolean notInGroup = true;
											for (int g=0;g<groupSize;g++) {
												if (rob == groupRows[g]) {
													notInGroup = false;
												}
											}
											if (notInGroup) {
												for (int c=colBlock;c<colBlock+nbcolsperblock;c++) {
													if (sudoku[rob][c]==0 && sudokuflags[rob][c][k]) {
														sudokuflags[rob][c][k] = false;
														hasSimplyfied = true;
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
				//block-row
				for(int k=0;k<nbnumbers;k++) {
					for(int rowb=0;rowb<nbcolsperblock;rowb++) {
						ArrayList<Integer> blocksMissing = new ArrayList<Integer>();
						for(int b=0;b<nbrowsperblock;b++) {
							int block = nbrowsperblock*rowb + b;
							if (numberMissingBlock[block][k]) {
								blocksMissing.add(block);
							}
						}
						if (blocksMissing.size() >= 2*groupSize) {
							for (int i=0;i<blocksMissing.size()+1-groupSize;i++) {
								int groupBlocks[] = new int[groupSize];
								groupBlocks[0] = blocksMissing.get(i);
								int nbrows = 0;
								ArrayList<Integer> listRows = new ArrayList<Integer>();
								for (int pos=0;pos<nbnumbers;pos++) {
									int ro = groupBlocks[0]/nbrowsperblock + pos/nbcolsperblock;
									int c = (groupBlocks[0]%nbrowsperblock)*nbcolsperblock + pos%nbcolsperblock;
									if (sudoku[ro][c]==0 && sudokuflags[ro][c][k]) {
										if (!listRows.contains(ro)) {
											listRows.add(ro);
											nbrows++;
										}
									}
								}
								groupBlocks = searchDeductionCrossGroupBlockRowsRecursive(sudoku, k, sudokuflags, blocksMissing, groupSize,
										i+1, groupBlocks, 1, nbrows);
								if (groupBlocks!=null) {
									listRows = new ArrayList<Integer>();
									for (int j=0;j<groupSize;j++) {
										int b = groupBlocks[j];
										int rowblock = (b/nbrowsperblock)*nbrowsperblock;
										int colb = (b%nbrowsperblock)*nbcolsperblock;
										for (int pos=0;pos<nbnumbers;pos++) {
											int ro = rowblock + pos/nbcolsperblock;
											int c = colb + pos%nbcolsperblock;
											if (sudoku[ro][c]==0 && sudokuflags[ro][c][k]) {
												if (!listRows.contains(ro)) {
													listRows.add(ro);
												}
											}
										}
									}
									for (int j=0;j<listRows.size();j++) {
										int rowj = listRows.get(j);
										for (int b=rowb*nbrowsperblock;b<rowb*nbrowsperblock+nbrowsperblock;b++) {
											boolean notInGroup = true;
											for (int g=0;g<groupSize;g++) {
												if (b == groupBlocks[g]) {
													notInGroup = false;
												}
											}
											if (notInGroup) {
												int colb = (b%nbrowsperblock)*nbcolsperblock;
												for (int c=colb;c<colb+nbcolsperblock;c++) {
													if (sudoku[rowj][c]==0 && sudokuflags[rowj][c][k]) {
														sudokuflags[rowj][c][k] = false;
														hasSimplyfied = true;
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			if (nbcolsperblock >= 2*groupSize) {
				//col-block
				for(int k=0;k<nbnumbers;k++) {
					for(int colb=0;colb<nbrowsperblock;colb++) {
						ArrayList<Integer> colsMissing = new ArrayList<Integer>();
						for(int c=0;c<nbcolsperblock;c++) {
							int col = colb*nbcolsperblock+c;
							if (numberMissingCol[col][k]) {
								colsMissing.add(col);
							}
						}
						if (colsMissing.size() >= 2*groupSize) {
							for (int i=0;i<colsMissing.size()+1-groupSize;i++) {
								int groupCols[] = new int[groupSize];
								groupCols[0] = colsMissing.get(i);
								int nbBlocks = 0;
								ArrayList<Integer> listBlocks = new ArrayList<Integer>();
								for (int ro=0;ro<nbnumbers;ro++) {
									if (sudoku[ro][groupCols[0]]==0 && sudokuflags[ro][groupCols[0]][k]) {
										int bPosRow = ro/nbrowsperblock;
										if (!listBlocks.contains(bPosRow)) {
											listBlocks.add(bPosRow);
											nbBlocks++;
										}
									}
								}
								groupCols = searchDeductionCrossGroupColsRecursive(sudoku, k, sudokuflags, colsMissing, groupSize,
										i+1, groupCols, 1, nbBlocks);
								if (groupCols!=null) {
									listBlocks = new ArrayList<Integer>();
									for (int ro=0;ro<nbnumbers;ro++) {
										for (int g=0;g<groupSize;g++) {
											if (sudoku[ro][groupCols[g]]==0 && sudokuflags[ro][groupCols[g]][k]) {
												int bPosRow = ro/nbcolsperblock;
												if (!listBlocks.contains(bPosRow)) {
													listBlocks.add(bPosRow);
												}
											}
										}
									}
									for (int jb=0;jb<listBlocks.size();jb++) {
										int rowBlock = listBlocks.get(jb)*nbrowsperblock;
										for (int cob=colb*nbcolsperblock;cob<colb*nbcolsperblock+nbcolsperblock;cob++) {
											boolean notInGroup = true;
											for (int g=0;g<groupSize;g++) {
												if (cob == groupCols[g]) {
													notInGroup = false;
												}
											}
											if (notInGroup) {
												for (int ro=rowBlock;ro<rowBlock+nbrowsperblock;ro++) {
													if (sudoku[ro][cob]==0 && sudokuflags[ro][cob][k]) {
														sudokuflags[ro][cob][k] = false;
														hasSimplyfied = true;
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
				//block-col
				for(int k=0;k<nbnumbers;k++) {
					for(int colb=0;colb<nbrowsperblock;colb++) {
						ArrayList<Integer> blocksMissing = new ArrayList<Integer>();
						for(int b=0;b<nbcolsperblock;b++) {
							int block = nbcolsperblock*b + colb;
							if (numberMissingBlock[block][k]) {
								blocksMissing.add(block);
							}
						}
						if (blocksMissing.size() >= 2*groupSize) {
							for (int i=0;i<blocksMissing.size()+1-groupSize;i++) {
								int groupBlocks[] = new int[groupSize];
								groupBlocks[0] = blocksMissing.get(i);
								int nbcols = 0;
								ArrayList<Integer> listCols = new ArrayList<Integer>();
								for (int pos=0;pos<nbnumbers;pos++) {
									int ro = groupBlocks[0]/nbrowsperblock + pos/nbcolsperblock;
									int c = (groupBlocks[0]%nbrowsperblock)*nbcolsperblock + pos%nbcolsperblock;
									if (sudoku[ro][c]==0 && sudokuflags[ro][c][k]) {
										if (!listCols.contains(ro)) {
											listCols.add(ro);
											nbcols++;
										}
									}
								}
								groupBlocks = searchDeductionCrossGroupBlockColsRecursive(sudoku, k, sudokuflags, blocksMissing, groupSize,
										i+1, groupBlocks, 1, nbcols);
								if (groupBlocks!=null) {
									listCols = new ArrayList<Integer>();
									for (int j=0;j<groupSize;j++) {
										int b = groupBlocks[j];
										int rowblock = (b/nbrowsperblock)*nbrowsperblock;
										int colbl = (b%nbrowsperblock)*nbcolsperblock;
										for (int pos=0;pos<nbnumbers;pos++) {
											int ro = rowblock + pos/nbcolsperblock;
											int c = colbl + pos%nbcolsperblock;
											if (sudoku[ro][c]==0 && sudokuflags[ro][c][k]) {
												if (!listCols.contains(c)) {
													listCols.add(c);
												}
											}
										}
									}
									for (int j=0;j<listCols.size();j++) {
										int colj = listCols.get(j);
										for (int b=0;b<nbcolsperblock;b++) {
											int b2 = colj*nbcolsperblock + b*nbrowsperblock;
											boolean notInGroup = true;
											for (int g=0;g<groupSize;g++) {
												if (b2 == groupBlocks[g]) {
													notInGroup = false;
												}
											}
											if (notInGroup) {
												int rowb = (b2%nbrowsperblock)*nbcolsperblock;
												for (int ro=rowb;ro<rowb+nbrowsperblock;ro++) {
													if (sudoku[ro][colj]==0 && sudokuflags[ro][colj][k]) {
														sudokuflags[ro][colj][k] = false;
														hasSimplyfied = true;
													}
												}
											}
										}
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
	
	int[] searchDeductionCrossGroupRowsRecursive(Integer sudoku[][],int missingValue, boolean sudokuflags[][][], ArrayList<Integer> valueMissingRows, int groupSize,
			int index, int partialGroup[], int step, int nbCandidatesPos) {
		if (nbCandidatesPos > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		for (int i=index;i<valueMissingRows.size();i++) {
			partialGroup[step] = valueMissingRows.get(i);
			nbCandidatesPos = 0;
			ArrayList<Integer> candidatesGroup = new ArrayList<Integer>();
			for (int j=0;j<=step;j++) {
				for (int c=0;c<nbnumbers;c++) {
					if (sudoku[partialGroup[j]][c]==0 && sudokuflags[partialGroup[j]][c][missingValue]) {
						int bPosCol = c/nbcolsperblock;
						if (!candidatesGroup.contains(bPosCol)) {
							candidatesGroup.add(bPosCol);
							nbCandidatesPos++;
						}
					}
				}
			}
			int group[] = searchDeductionCrossGroupRowsRecursive(sudoku, missingValue, sudokuflags, valueMissingRows, groupSize,
					i+1, partialGroup, step+1, nbCandidatesPos);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	int[] searchDeductionCrossGroupBlockRowsRecursive(Integer sudoku[][],int missingValue, boolean sudokuflags[][][], ArrayList<Integer> valueMissingBlocks, int groupSize,
			int index, int partialGroup[], int step, int nbCandidatesPos) {
		if (nbCandidatesPos > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		for (int i=index;i<valueMissingBlocks.size();i++) {
			partialGroup[step] = valueMissingBlocks.get(i);
			nbCandidatesPos = 0;
			ArrayList<Integer> candidatesGroup = new ArrayList<Integer>();
			for (int j=0;j<=step;j++) {
				int b = partialGroup[j];
				int rowb = (b/nbrowsperblock)*nbrowsperblock;
				int colb = (b%nbrowsperblock)*nbcolsperblock;
				for (int pos=0;pos<nbnumbers;pos++) {
					int ro = rowb + pos/nbcolsperblock;
					int c = colb + pos%nbcolsperblock;
					if (sudoku[ro][c]==0 && sudokuflags[ro][c][missingValue]) {
						if (!candidatesGroup.contains(ro)) {
							candidatesGroup.add(ro);
							nbCandidatesPos++;
						}
					}
				}
			}
			int group[] = searchDeductionCrossGroupBlockRowsRecursive(sudoku, missingValue, sudokuflags, valueMissingBlocks, groupSize,
					i+1, partialGroup, step+1, nbCandidatesPos);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	int[] searchDeductionCrossGroupColsRecursive(Integer sudoku[][],int missingValue, boolean sudokuflags[][][], ArrayList<Integer> valueMissingRows, int groupSize,
			int index, int partialGroup[], int step, int nbCandidatesPos) {
		if (nbCandidatesPos > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		for (int i=index;i<valueMissingRows.size();i++) {
			partialGroup[step] = valueMissingRows.get(i);
			nbCandidatesPos = 0;
			ArrayList<Integer> candidatesGroup = new ArrayList<Integer>();
			for (int j=0;j<=step;j++) {
				for (int ro=0;ro<nbnumbers;ro++) {
					if (sudoku[ro][partialGroup[j]]==0 && sudokuflags[ro][partialGroup[j]][missingValue]) {
						int bPosRow = ro/nbrowsperblock;
						if (!candidatesGroup.contains(bPosRow)) {
							candidatesGroup.add(bPosRow);
							nbCandidatesPos++;
						}
					}
				}
			}
			int group[] = searchDeductionCrossGroupColsRecursive(sudoku, missingValue, sudokuflags, valueMissingRows, groupSize,
					i+1, partialGroup, step+1, nbCandidatesPos);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	int[] searchDeductionCrossGroupBlockColsRecursive(Integer sudoku[][],int missingValue, boolean sudokuflags[][][], ArrayList<Integer> valueMissingBlocks, int groupSize,
			int index, int partialGroup[], int step, int nbCandidatesPos) {
		if (nbCandidatesPos > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		for (int i=index;i<valueMissingBlocks.size();i++) {
			partialGroup[step] = valueMissingBlocks.get(i);
			nbCandidatesPos = 0;
			ArrayList<Integer> candidatesGroup = new ArrayList<Integer>();
			for (int j=0;j<=step;j++) {
				int b = partialGroup[j];
				int rowb = (b/nbrowsperblock)*nbrowsperblock;
				int colb = (b%nbrowsperblock)*nbcolsperblock;
				for (int pos=0;pos<nbnumbers;pos++) {
					int ro = rowb + pos/nbcolsperblock;
					int c = colb + pos%nbcolsperblock;
					if (sudoku[ro][c]==0 && sudokuflags[ro][c][missingValue]) {
						if (!candidatesGroup.contains(c)) {
							candidatesGroup.add(c);
							nbCandidatesPos++;
						}
					}
				}
			}
			int group[] = searchDeductionCrossGroupBlockColsRecursive(sudoku, missingValue, sudokuflags, valueMissingBlocks, groupSize,
					i+1, partialGroup, step+1, nbCandidatesPos);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	public void writePuzzle() {
		for (int l=0;l<d3size;l++) {
			for (int i=0;i<nbnumbers;i++) {
				System.out.print("[");
				for (int j=0;j<nbnumbers;j++) {
					System.out.print(puzzleTab[i][j][l] + ",");
				}
				System.out.println("]");
			}
			System.out.println();
		}
	}
	
	public void writeTempPuzzle(Integer puzzleTab[][][]) {
		for (int l=0;l<d3size;l++) {
			for (int i=0;i<nbnumbers;i++) {
				System.out.print("[");
				for (int j=0;j<nbnumbers;j++) {
					System.out.print(puzzleTab[i][j][l] + ",");
				}
				System.out.println("]");
			}
			System.out.println();
		}
	}

}
