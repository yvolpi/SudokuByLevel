class Puzzle {	
	constructor(board) {
		this.board = board;
		this.showsteps = false;
		this.nbnumbers = board.nbnumbers;
		this.nbrowsperblock = board.nbrowsperblock;
		this.nbcolsperblock = board.nbcolsperblock;
		this.level = 1;
		this.nbTests = 0;
		this.puzzleTab = [];
		for (let i=0;i<this.nbnumbers;i++) {
            this.puzzleTab[i] = [];
			for (let j=0;j<this.nbnumbers;j++) {
				this.puzzleTab[i][j] = board.grid[i][j];
			}
		}
		this.nbEmptyCells = 0;
		this.solvable = true;
        this.seed = board.seed;
		this.initializeRandom(this.seed);
	}

    initializeRandom(seed) {
        let power10 = 2;
        let palier10 = 10**power10;
        while (seed > palier10 * palier10) {
            power10 ++;
            palier10 = 10**power10;
        }
        this.modulo = palier10;
        let rest = Math.floor(seed / this.modulo);
        this.randomNumber = seed % this.modulo;
		console.log('randomNumber ', this.randomNumber);
        const nummultiplier = Math.floor(rest / (4 * this.modulo / 10));
        const numadder = rest % (4 * this.modulo / 10);
        this.multiplier = 21 + nummultiplier * 20;
        let quotient4 = Math.floor(numadder / 4);
        let modulo4 = numadder % 4;
        this.adder = 1 + quotient4 * 10;
        if (modulo4 % 4 == 1) {
            this.adder += 2;
        }
        if (modulo4 % 4 == 2) {
            this.adder += 6;
        }
        if (modulo4 % 4 == 3) {
            this.adder += 8;
        }
    }
	
	findBestPuzzle(chosenLevel, chosenNbSteps, nbessais) {
		let bestLvl = 1;
		let bestNbTests = 0;
		let bestPuzzle = [];
		for (let i=0;i<this.nbnumbers;i++) {
            bestPuzzle[i] = [];
			for (let j=0;j<this.nbnumbers;j++) {
				bestPuzzle[i][j] = this.board.grid[i][j];
			}
		}
		
		for (let n=0;n<nbessais;n++) {
			let levelForVeryHardSudokus = 4 + (this.nbnumbers/2-2)*3 + Math.max(0,Math.max(nbrowsperblock,nbcolsperblock)/2-1);
			let nbPossibles = Math.floor((this.nbnumbers * this.nbnumbers + 1)/2);
			let order = [];
			for (let i=0;i<nbPossibles;i++) {
                this.randomNumber = (this.multiplier * this.randomNumber + this.adder) % this.modulo;
                const pos = Math.floor(this.randomNumber)%(order.length+1);
                order.splice(pos,0,i);
			}
			let tempBestNbEmptyCases = 0;
			let tempBestLvl = 1;
			let tempBestNbTests = 0;
			let previousLvl = 1;
			for (let i=0;i<this.nbnumbers;i++) {
				for (let j=0;j<this.nbnumbers;j++) {
					this.puzzleTab[i][j] = this.board.grid[i][j];
				}
			}
			this.level = 1;
			this.nbEmptyCells = 0;
			for (let i=0;i<nbPossibles;i++) {
				let pos = order[i];
				let rowpos = Math.floor(pos/this.nbnumbers);
				let colpos = pos%this.nbnumbers;
				//remove numbers (symetric)
				this.puzzleTab[rowpos][colpos] = 0;
				this.puzzleTab[this.nbnumbers-rowpos-1][this.nbnumbers-colpos-1] = 0;
				this.nbEmptyCells += 2;
				if (this.nbnumbers%2 == 1 && rowpos == colpos && rowpos == Math.floor(this.nbnumbers/2)) {
					this.nbEmptyCells--;
				}
				this.level = 1;
				this.nbTests = 0;
				let solve = this.solver(this.puzzleTab, this.nbEmptyCells, this.level, 0, chosenLevel);
				//writePuzzle();
				//System.out.println("level: " + level + ", solve = " + solve);
				//System.out.println();
				if (solve > 1 || this.level > chosenLevel || this.nbTests > chosenNbSteps) {
					this.puzzleTab[rowpos][colpos] = this.board.grid[rowpos][colpos];
					this.puzzleTab[this.nbnumbers-rowpos-1][this.nbnumbers-colpos-1] = this.board.grid[this.nbnumbers-rowpos-1][this.nbnumbers-colpos-1];
					this.nbEmptyCells -= 2;
					if (rowpos == colpos && rowpos == 4) {
					}
					if (this.nbnumbers%2 == 1 && rowpos == colpos && rowpos == Math.floor(this.nbnumbers/2)) {
						this.nbEmptyCells++;
					}
					this.level = previousLvl;
					//System.out.println("level to hard, previous level = " + level);
					//System.out.println();
				} else if (this.level>tempBestLvl) {
					tempBestLvl = this.level;
					previousLvl = this.level;
					tempBestNbTests = this.nbTests;
					tempBestNbEmptyCases = this.nbEmptyCells;
					//System.out.println("better level, previous level = " + level);
					//System.out.println();
				} else if (this.level==tempBestLvl && this.nbTests>tempBestNbTests) {
					tempBestNbTests = this.nbTests;
					tempBestNbEmptyCases = this.nbEmptyCells;
				} else if (this.level==tempBestLvl && this.nbTests==tempBestNbTests && this.nbEmptyCells>tempBestNbEmptyCases) {
					tempBestNbEmptyCases = this.nbEmptyCells;
				}
			}
			if (n==0 || tempBestLvl > bestLvl) {
				//System.out.println("best level " + tempBestLvl + ", nbtests= " + tempBestNbTests);
				bestLvl = tempBestLvl;
				bestNbTests = tempBestNbTests;
				for (let i=0;i<this.nbnumbers;i++) {
					for (let j=0;j<this.nbnumbers;j++) {
						bestPuzzle[i][j] = this.puzzleTab[i][j];
					}
				}
			}
			if (chosenLevel < levelForVeryHardSudokus && bestLvl == chosenLevel) {
				break;
			}
		}
		for (let i=0;i<this.nbnumbers;i++) {
			for (let j=0;j<this.nbnumbers;j++) {
				this.puzzleTab[i][j] = bestPuzzle[i][j];
			}
		}
		this.level = bestLvl;
		this.nbTests = bestNbTests;
	}
	
	
	solver(sudoku, nbEmptyCells, lvlmax, nbTests, chosenLevel) {
		//0= no solution, 1=unique solution, 2=multiple solution
		if (nbEmptyCells == 0) {
			return 1;
		} else {
			//search for unique solution
			/*int counte = 0;
			for (int i=0;i<nbnumbers;i++) {
				for (int j=0;j<nbnumbers;j++) {
					if (sudoku[i][j] == 0) {
						counte++;
					}
				}
			}*/
			this.sudokuflags = [];
			for (let i=0;i<this.nbnumbers;i++) {
                this.sudokuflags[i] = [];
				for (let j=0;j<this.nbnumbers;j++) {
					if (sudoku[i][j] == 0) {
						this.sudokuflags[i][j]= this.candidates(i, j, sudoku);
						let count = 0;
						let firstcandidate = 0;
						for (let k=0;k<this.nbnumbers;k++) {
							if (this.sudokuflags[i][j][k]) {
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
							sudoku[i][j] = firstcandidate;
							let solve = this.solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
							sudoku[i][j] = 0;
							return solve;
						}
					}
				}
			}
			lvlmax = Math.max(2, lvlmax);
			this.level = Math.max(2, lvlmax);
			if (this.level > chosenLevel) return 2;
			//search for unique place
			this.numberMissingRow = [];
			this.numberMissingCol = [];
			this.numberMissingBlock = [];
			for(let i=0;i<this.nbnumbers;i++) {
				this.numberMissingRow[i] = [];
				this.numberMissingCol[i] = [];
				this.numberMissingBlock[i] = [];
				for(let k=0;k<this.nbnumbers;k++) {
					this.numberMissingRow[i][k] = true;
					this.numberMissingCol[i][k] = true;
					this.numberMissingBlock[i][k] = true;
				}
			}
			for(let r=0;r<this.nbnumbers;r++) {
				for(let c=0;c<this.nbnumbers;c++) {
					if (sudoku[r][c] != 0) {
						let block = Math.floor(r/this.nbrowsperblock)*this.nbrowsperblock + Math.floor(c/this.nbcolsperblock);
						this.numberMissingRow[r][sudoku[r][c]-1] = false;
						this.numberMissingCol[c][sudoku[r][c]-1] = false;
						this.numberMissingBlock[block][sudoku[r][c]-1] = false;
					}
				}
			}
			for(let ro=0;ro<this.nbnumbers;ro++) {
				for(let k=0;k<this.nbnumbers;k++) {
					if (this.numberMissingRow[ro][k]) {
						let pos = -1;
						let count = 0;
						for(let c=0;c<this.nbnumbers;c++) {
							if (sudoku[ro][c] == 0 && this.sudokuflags[ro][c][k]) {
								pos = c;
								count ++;
							}
						}
						if (count == 0) {
							return 0;
						}
						if (count == 1) {
							//unique cell for the number k+1
							sudoku[ro][pos] = k+1;
							let solve = this.solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
							sudoku[ro][pos] = 0;
							return solve;
						}
					}
				}
			}
			for(let c=0;c<this.nbnumbers;c++) {
				for(let k=0;k<this.nbnumbers;k++) {
					if (this.numberMissingCol[c][k]) {
						let pos = -1;
						let count = 0;
						for(let ro=0;ro<this.nbnumbers;ro++) {
							if (sudoku[ro][c] == 0 && this.sudokuflags[ro][c][k]) {
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
							sudoku[pos][c] = k+1;
							let solve = this.solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
							sudoku[pos][c] = 0;
							return solve;
						}
					}
				}
			}
			for(let b=0;b<this.nbnumbers;b++) {
				let rowb = Math.floor(b/this.nbrowsperblock)*this.nbrowsperblock;
				let colb = Math.floor(b%this.nbrowsperblock)*this.nbcolsperblock;
				for(let k=0;k<this.nbnumbers;k++) {
					if (this.numberMissingBlock[b][k]) {
						let posr = -1;
						let posc = -1;
						let count = 0;
						for(let i=0;i<this.nbrowsperblock;i++) {
							for(let j=0;j<this.nbcolsperblock;j++) {
								if (sudoku[rowb + i][colb + j] == 0 && this.sudokuflags[rowb + i][colb + j][k]) {
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
							sudoku[posr][posc] = k+1;
							let solve = this.solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
							sudoku[posr][posc] = 0;
							return solve;
						}
					}
				}
			}
			
			lvlmax = Math.max(3, lvlmax);
			this.level = Math.max(3, lvlmax);
			if (this.level > chosenLevel) return 2;
			
			//deduction cross?
			/*boolean deductionCross = simplifyByDeductionCross(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock);
			int singleSoluce[] = null;
			if (deductionCross) {
				singleSoluce = searchCellUniqueSolution(sudoku, sudokuflags);
				if (singleSoluce != null && singleSoluce[2] == -1) {
					return 0;
				}
				if (singleSoluce != null && singleSoluce[2] != -1) {
					if (showsteps) {
						System.out.println("unique candidate for r"+singleSoluce[0]+" c"+singleSoluce[1] + " k" + singleSoluce[2]);
					}
					sudoku[singleSoluce[0]][singleSoluce[1]] = singleSoluce[2];
					int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
					sudoku[singleSoluce[0]][singleSoluce[1]] = 0;
					return solve;
				}
				singleSoluce = searchUniquePosSolution(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock);
				if (singleSoluce != null && singleSoluce[2] == -1) {
					return 0;
				}
				if (singleSoluce != null && singleSoluce[2] != -1) {
					if (showsteps) {
						System.out.println("unique position for k"+singleSoluce[2]+" r"+singleSoluce[0] + " c" + singleSoluce[1]);
					}
					sudoku[singleSoluce[0]][singleSoluce[1]] = singleSoluce[2];
					int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
					sudoku[singleSoluce[0]][singleSoluce[1]] = 0;
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
					if (singleSoluce != null && singleSoluce[2] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[2] != -1) {
						if (showsteps) {
							System.out.println("unique candidate for r"+singleSoluce[0]+" c"+singleSoluce[1] + " k" + singleSoluce[2]);
						}
						sudoku[singleSoluce[0]][singleSoluce[1]] = singleSoluce[2];
						int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]] = 0;
						return solve;
					}
					singleSoluce = searchUniquePosSolution(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock);
					if (singleSoluce != null && singleSoluce[2] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[2] != -1) {
						if (showsteps) {
							System.out.println("unique position for k"+singleSoluce[2]+" r"+singleSoluce[0] + " c" + singleSoluce[1]);
						}
						sudoku[singleSoluce[0]][singleSoluce[1]] = singleSoluce[2];
						int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]] = 0;
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
					if (singleSoluce != null && singleSoluce[2] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[2] != -1) {
						if (showsteps) {
							System.out.println("unique candidate for r"+singleSoluce[0]+" c"+singleSoluce[1] + " k" + singleSoluce[2]);
						}
						sudoku[singleSoluce[0]][singleSoluce[1]] = singleSoluce[2];
						int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]] = 0;
						return solve;
					}
					singleSoluce = searchUniquePosSolution(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock);
					if (singleSoluce != null && singleSoluce[2] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[2] != -1) {
						if (showsteps) {
							System.out.println("unique position for k"+singleSoluce[2]+" r"+singleSoluce[0] + " c" + singleSoluce[1]);
						}
						sudoku[singleSoluce[0]][singleSoluce[1]] = singleSoluce[2];
						int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]] = 0;
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
					if (singleSoluce != null && singleSoluce[2] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[2] != -1) {
						if (showsteps) {
							System.out.println("unique candidate for r"+singleSoluce[0]+" c"+singleSoluce[1] + " k" + singleSoluce[2]);
						}
						sudoku[singleSoluce[0]][singleSoluce[1]] = singleSoluce[2];
						int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]] = 0;
						return solve;
					}
					singleSoluce = searchUniquePosSolution(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock);
					if (singleSoluce != null && singleSoluce[2] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[2] != -1) {
						if (showsteps) {
							System.out.println("unique position for k"+singleSoluce[2]+" r"+singleSoluce[0] + " c" + singleSoluce[1]);
						}
						sudoku[singleSoluce[0]][singleSoluce[1]] = singleSoluce[2];
						int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]] = 0;
						return solve;
					}
				}
			}
			
			//deductionCrossX?
			int n2 = Math.max(nbrowsperblock,nbcolsperblock)/2;
			for (int groupSize=2;groupSize<= n2;groupSize++) {
				levelMethod++;
				lvlmax = Math.max(levelMethod, lvlmax);
				level = Math.max(levelMethod, lvlmax);
				if (level > chosenLevel) return 2;
				boolean deductionCrossX = simplifyByDeductionCrossX(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock, groupSize);
				while (deductionCrossX) {
					deductionCrossX = simplifyByDeductionCross(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock);
					for (int groupSize2=2;groupSize2<=n;groupSize2++) {
						deductionCrossX = deductionCrossX || simplifyByVisibleGroups(sudoku, sudokuflags, groupSize2);
						deductionCrossX = deductionCrossX || simplifyByNakedGroups(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock, groupSize2);
						deductionCrossX = deductionCrossX || simplifyBySwordFishes(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock, groupSize2);
					}
					for (int groupSize2=2;groupSize2<=groupSize;groupSize2++) {
						deductionCrossX = deductionCrossX || simplifyBySwordFishes(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock, groupSize2);
					}
					singleSoluce = searchCellUniqueSolution(sudoku, sudokuflags);
					if (singleSoluce != null && singleSoluce[2] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[2] != -1) {
						sudoku[singleSoluce[0]][singleSoluce[1]] = singleSoluce[2];
						int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]] = 0;
						return solve;
					}
					singleSoluce = searchUniquePosSolution(sudoku, sudokuflags, numberMissingRow, numberMissingCol, numberMissingBlock);
					if (singleSoluce != null && singleSoluce[2] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[2] != -1) {
						sudoku[singleSoluce[0]][singleSoluce[1]] = singleSoluce[2];
						int solve = solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]] = 0;
						return solve;
					}
				}
			}
			
			levelMethod++;
			lvlmax = Math.max(levelMethod, lvlmax);
			level = Math.max(levelMethod, lvlmax);
			if (level > chosenLevel) return 2;
			//try candidates
			int emptyCellTry[] = searchCellXSolutions(sudoku, sudokuflags, 2);
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
			}*/
			
			
		}
		
		return 2;
	}
	
	candidates(row, col, tabValues) {
		let candidates = [];
		for (let k=0;k<this.nbnumbers;k++) {
			let isCandidate = true;
			//row
			for (let c=0;c<this.nbnumbers;c++) {
				if (tabValues[row][c] == k+1) {
					isCandidate = false;
					break;
				}
			}
			//col
			for (let r=0;r<this.nbnumbers;r++) {
				if (!isCandidate || tabValues[r][col] == k+1) {
					isCandidate = false;
					break;
				}
			}
			//block
			let rowblock = Math.floor(row/this.nbrowsperblock);
			let colblock = Math.floor(col/this.nbcolsperblock);
			for (let r=0;r<this.nbrowsperblock;r++) {
				for (let c=0;c<this.nbcolsperblock;c++) {
					if (!isCandidate || tabValues[rowblock*this.nbrowsperblock+r][colblock*this.nbcolsperblock+c] == k+1) {
						isCandidate = false;
						break;
					}
				}
			}
			
			candidates[k] = isCandidate;
		}
		return candidates;
	}
	/*
	int[] searchCellUniqueSolution(Integer sudoku[][], boolean sudokuflags[][][]) {
		//return tab of 3 numbers: row, colonne and number
		for (int i=0;i<nbnumbers;i++) {
			for (int j=0;j<nbnumbers;j++) {
				if (sudoku[i][j] == 0) {
					int count = 0;
					int candidate = 0;
					for (int k=0;k<nbnumbers;k++) {
						if (sudokuflags[i][j][k]) {
							count++;
							candidate = k+1;
						}
					}
					if (count == 0) {
						return new int[] {0,0,-1};
					}
					if (count == 1) {
						return new int[] {i,j,candidate};
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
	
	int[] searchUniquePosSolution(Integer sudoku[][], boolean sudokuflags[][][], boolean numberMissingRow[][], boolean numberMissingCol[][], boolean numberMissingBlock[][]) {
		//return tab of 3 numbers: row, colonne and number
		//row
		for (int ro=0;ro<nbnumbers;ro++) {
			for (int k=0;k<nbnumbers;k++) {
				if (numberMissingRow[ro][k]) {
					int count = 0;
					int pos = -1;
					for (int c=0;c<nbnumbers;c++) {
						if (sudoku[ro][c] == 0 && sudokuflags[ro][c][k]) {
							count++;
							pos = c;
						}
					}
					if (count == 0) {
						return new int[] {0,0,-1};
					}
					if (count == 1) {
						return new int[] {ro,pos,k+1};
					}
				}
			}
		}
		//col
		for (int c=0;c<nbnumbers;c++) {
			for (int k=0;k<nbnumbers;k++) {
				if (numberMissingCol[c][k]) {
					int count = 0;
					int pos = -1;
					for (int ro=0;ro<nbnumbers;ro++) {
						if (sudoku[ro][c] == 0 && sudokuflags[ro][c][k]) {
							count++;
							pos = ro;
						}
					}
					if (count == 0) {
						return new int[] {0,0,-1};
					}
					if (count == 1) {
						return new int[] {pos,c,k+1};
					}
				}
			}
		}
		//block
		for (int b=0;b<nbnumbers;b++) {
			int rowBlock = (b/nbrowsperblock)*nbrowsperblock;
			int colBlock = (b%nbrowsperblock)*nbcolsperblock;
			for (int k=0;k<nbnumbers;k++) {
				if (numberMissingBlock[b][k]) {
					int count = 0;
					int posRow = -1;
					int posCol = -1;
					for (int posb=0;posb<nbnumbers;posb++) {
						int ro = rowBlock + posb/nbcolsperblock;
						int c = colBlock + posb%nbcolsperblock;
						if (sudoku[ro][c] == 0 && sudokuflags[ro][c][k]) {
							count++;
							posRow = ro;
							posCol = c;
						}
					}
					if (count == 0) {
						return new int[] {0,0,-1};
					}
					if (count == 1) {
						return new int[] {posRow,posCol,k+1};
					}
				}
			}
		}
		return null;
	}
	
	boolean simplifyByDeductionCross(Integer sudoku[][], boolean sudokuflags[][][], boolean numberMissingRow[][], boolean numberMissingCol[][], boolean numberMissingBlock[][]) {
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
											if (showsteps) {
												System.out.println("deduction cross rowblock row" + i + ", b" + colBlockLocation + " for k" + (k+1));
												System.out.println("Remove candidate k" + (k+1) + " for r" + (rowBlockLocation + r) + " c" + (colBlockLocation + c));
											}
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
											if (showsteps) {
												System.out.println("deduction cross colblock col" + j + ", b" + rowBlockLocation + " for k" + (k+1));
												System.out.println("Remove candidate k" + (k+1) + " for r" + (rowBlockLocation + r) + " c" + (colBlockLocation + c));
											}
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
										if (showsteps) {
											System.out.println("deduction cross blockrow block" + b + ", row" + posBlocRow + " for k" + (k+1));
											System.out.println("Remove candidate k" + (k+1) + " for r" + posBlocRow + " c" + c);
										}
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
										if (showsteps) {
											System.out.println("deduction cross blockcol block" + b + ", col" + posBlocCol + " for k" + (k+1));
											System.out.println("Remove candidate k" + (k+1) + " for r" + ro + " c" + posBlocCol);
										}
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
	
	boolean simplifyByVisibleGroups(Integer sudoku[][], boolean sudokuflags[][][], int groupSize) {
		//visible pairs, triplets, ...
		boolean hasSimplyfied = false;
		//row
		for (int ro=0;ro<nbnumbers;ro++) {
			ArrayList<Integer> positionsEmptyCells = new ArrayList<Integer>();
			for (int c=0;c<nbnumbers;c++) {
				if (sudoku[ro][c] == 0) {
					positionsEmptyCells.add(c);
				}
			}
			if (positionsEmptyCells.size() >= 2*groupSize) {
				for (int i=0;i<positionsEmptyCells.size()+1-groupSize;i++) {
					int groupCells[] = new int[groupSize];
					groupCells[0] = positionsEmptyCells.get(i);
					int nbCandidates = 0;
					for (int k=0;k<nbnumbers;k++) {
						if (sudokuflags[ro][groupCells[0]][k]) {
							nbCandidates++;
						}
					}
					groupCells = searchVisibleGroupRowsRecursive(ro, sudokuflags, positionsEmptyCells, groupSize,
							i+1, groupCells, 1, nbCandidates);
					if (groupCells != null) {
						//group found
						ArrayList<Integer> groupCandidates = new ArrayList<>();
						for (int g=0;g<groupCells.length;g++) {
							int col = groupCells[g];
							for (int k=0;k<nbnumbers;k++) {
								if (sudokuflags[ro][col][k] && !groupCandidates.contains(k)) {
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
									if (sudokuflags[ro][col][groupCandidates.get(cand)]) {
										if (showsteps) {
											System.out.print("visible group row " + ro + " for values ");
											for (int g=0;g<groupSize;g++) {
												System.out.print((groupCandidates.get(g)+1) + " " );
											}
											System.out.println();
											System.out.println("Remove candidate k" + (groupCandidates.get(cand)+1) + " r" + ro + " c" + col);
										}
										sudokuflags[ro][col][groupCandidates.get(cand)] = false;
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
		for (int c=0;c<nbnumbers;c++) {
			ArrayList<Integer> positionsEmptyCells = new ArrayList<Integer>();
			for (int ro=0;ro<nbnumbers;ro++) {
				if (sudoku[ro][c] == 0) {
					positionsEmptyCells.add(c);
				}
			}
			if (positionsEmptyCells.size() >= 2*groupSize) {
				for (int i=0;i<positionsEmptyCells.size()+1-groupSize;i++) {
					int groupCells[] = new int[groupSize];
					groupCells[0] = positionsEmptyCells.get(i);
					int nbCandidates = 0;
					for (int k=0;k<nbnumbers;k++) {
						if (sudokuflags[groupCells[0]][c][k]) {
							nbCandidates++;
						}
					}
					groupCells = searchVisibleGroupColsRecursive(c, sudokuflags, positionsEmptyCells, groupSize,
							i+1, groupCells, 1, nbCandidates);
					if (groupCells != null) {
						//group found
						ArrayList<Integer> groupCandidates = new ArrayList<>();
						for (int g=0;g<groupCells.length;g++) {
							int row = groupCells[g];
							for (int k=0;k<nbnumbers;k++) {
								if (sudokuflags[row][c][k] && !groupCandidates.contains(k)) {
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
									if (sudokuflags[ro][c][groupCandidates.get(cand)]) {
										if (showsteps) {
											System.out.print("visible group col " + c + " for values ");
											for (int g=0;g<groupSize;g++) {
												System.out.print((groupCandidates.get(g)+1) + " " );
											}
											System.out.println();
											System.out.println("Remove candidate k" + (groupCandidates.get(cand)+1) + " r" + ro + " c" + c);
										}
										sudokuflags[ro][c][groupCandidates.get(cand)] = false;
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
		for (int b=0;b<nbnumbers;b++) {
			ArrayList<Integer> positionsEmptyCells = new ArrayList<Integer>();
			int rowblock = (b/nbrowsperblock)*nbrowsperblock;
			int colblock = (b%nbrowsperblock)*nbcolsperblock;
			for (int pos=0;pos<nbnumbers;pos++) {
				int rob = rowblock + pos/nbcolsperblock;
				int roc = colblock + pos%nbcolsperblock;
				if (sudoku[rob][roc] == 0) {
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
						if (sudokuflags[rob][roc][k]) {
							nbCandidates++;
						}
					}
					groupCells = searchVisibleGroupBlocksRecursive(rowblock, colblock, sudokuflags, positionsEmptyCells, groupSize,
							i+1, groupCells, 1, nbCandidates);
					if (groupCells != null) {
						//group found
						ArrayList<Integer> groupCandidates = new ArrayList<>();
						for (int g=0;g<groupCells.length;g++) {
							int row =  rowblock + groupCells[g]/nbcolsperblock;
							int c =  colblock + groupCells[g]%nbcolsperblock;
							for (int k=0;k<nbnumbers;k++) {
								if (sudokuflags[row][c][k] && !groupCandidates.contains(k)) {
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
									if (sudokuflags[ro][c][groupCandidates.get(cand)]) {
										if (showsteps) {
											System.out.print("visible group block " + b + " for values ");
											for (int g=0;g<groupSize;g++) {
												System.out.print((groupCandidates.get(g)+1) + " " );
											}
											System.out.println();
											System.out.println("Remove candidate k" + (groupCandidates.get(cand)+1) + " r" + ro + " c" + c);
										}
										sudokuflags[ro][c][groupCandidates.get(cand)] = false;
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
	
	int[] searchVisibleGroupRowsRecursive(int row, boolean sudokuflags[][][], ArrayList<Integer> positionsEmptyCells, int groupSize,
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
					if (sudokuflags[row][partialGroup[j]][k]) {
						if (!candidatesGroup.contains(k)) {
							candidatesGroup.add(k);
							nbCandidates++;
						}
					}
				}
			}
			int group[] = searchVisibleGroupRowsRecursive(row, sudokuflags, positionsEmptyCells, groupSize,
					i+1, partialGroup, step+1, nbCandidates);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	int[] searchVisibleGroupColsRecursive(int col, boolean sudokuflags[][][], ArrayList<Integer> positionsEmptyCells, int groupSize,
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
					if (sudokuflags[partialGroup[j]][col][k]) {
						if (!candidatesGroup.contains(k)) {
							candidatesGroup.add(k);
							nbCandidates++;
						}
					}
				}
			}
			int group[] = searchVisibleGroupColsRecursive(col, sudokuflags, positionsEmptyCells, groupSize,
					i+1, partialGroup, step+1, nbCandidates);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	int[] searchVisibleGroupBlocksRecursive(int rowblock, int colblock, boolean sudokuflags[][][], ArrayList<Integer> positionsEmptyCells, int groupSize,
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
					if (sudokuflags[rob][roc][k]) {
						if (!candidatesGroup.contains(k)) {
							candidatesGroup.add(k);
							nbCandidates++;
						}
					}
				}
			}
			int group[] = searchVisibleGroupBlocksRecursive(rowblock, colblock, sudokuflags, positionsEmptyCells, groupSize,
					i+1, partialGroup, step+1, nbCandidates);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	boolean simplifyByNakedGroups(Integer sudoku[][], boolean sudokuflags[][][], boolean numberMissingRow[][], boolean numberMissingCol[][], boolean numberMissingBlock[][], int groupSize) {
		//naked pairs, triplets, ...
		boolean hasSimplyfied = false;
		//row
		for (int row=0;row<nbnumbers;row++) {
			ArrayList<Integer> missingNumbersList = new ArrayList<Integer>();
			for (int k=0;k<nbnumbers;k++) {
				if (numberMissingRow[row][k]) {
					missingNumbersList.add(k+1);
				}
			}
			if (missingNumbersList.size() >= 2*groupSize) {
				for (int i=0;i<missingNumbersList.size()+1-groupSize;i++) {
					int groupNumbers[] = new int[groupSize];
					groupNumbers[0] = missingNumbersList.get(i);
					int nbCandidatesPos = 0;
					for (int c=0;c<nbnumbers;c++) {
						if (sudoku[row][c]==0 && sudokuflags[row][c][groupNumbers[0]]) {
							nbCandidatesPos++;
						}
					}
					groupNumbers = searchNakedGroupRowsRecursive(sudoku, row, sudokuflags, missingNumbersList, groupSize,
							i+1, groupNumbers, 1, nbCandidatesPos);
					if (groupNumbers != null) {
						//group found
						ArrayList<Integer> groupCandidatesPos = new ArrayList<>();
						for (int g=0;g<groupNumbers.length;g++) {
							int k = groupNumbers[g]-1;
							for (int c=0;c<nbnumbers;c++) {
								if (sudoku[row][c]==0 && sudokuflags[row][c][k] && !groupCandidatesPos.contains(c)) {
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
									if (sudoku[row][groupCandidatesPos.get(cand)]==0 && sudokuflags[row][groupCandidatesPos.get(cand)][k]) {
										if (showsteps) {
											System.out.print("naked group row " + row + " for values ");
											for (int g=0;g<groupSize;g++) {
												System.out.print((groupNumbers[g]+1) + " " );
											}
											System.out.println();
											System.out.println("Remove candidate k" + (k+1) + " r" + row + " c" + groupCandidatesPos.get(cand));
										}
										sudokuflags[row][groupCandidatesPos.get(cand)][k] = false;
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
		for (int col=0;col<nbnumbers;col++) {
			ArrayList<Integer> missingNumbersList = new ArrayList<Integer>();
			for (int k=0;k<nbnumbers;k++) {
				if (numberMissingCol[col][k]) {
					missingNumbersList.add(k+1);
				}
			}
			if (missingNumbersList.size() >= 2*groupSize) {
				for (int i=0;i<missingNumbersList.size()+1-groupSize;i++) {
					int groupNumbers[] = new int[groupSize];
					groupNumbers[0] = missingNumbersList.get(i);
					int nbCandidatesPos = 0;
					for (int ro=0;ro<nbnumbers;ro++) {
						if (sudoku[ro][col]==0 && sudokuflags[ro][col][groupNumbers[0]]) {
							nbCandidatesPos++;
						}
					}
					groupNumbers = searchNakedGroupColsRecursive(sudoku, col, sudokuflags, missingNumbersList, groupSize,
							i+1, groupNumbers, 1, nbCandidatesPos);
					if (groupNumbers != null) {
						//group found
						ArrayList<Integer> groupCandidatesPos = new ArrayList<>();
						for (int g=0;g<groupNumbers.length;g++) {
							int k = groupNumbers[g]-1;
							for (int ro=0;ro<nbnumbers;ro++) {
								if (sudoku[ro][col]==0 && sudokuflags[ro][col][k] && !groupCandidatesPos.contains(ro)) {
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
									if (sudoku[groupCandidatesPos.get(cand)][col]==0 && sudokuflags[groupCandidatesPos.get(cand)][col][k]) {
										if (showsteps) {
											System.out.print("naked group col " + col + " for values ");
											for (int g=0;g<groupSize;g++) {
												System.out.print((groupNumbers[g]+1) + " " );
											}
											System.out.println();
											System.out.println("Remove candidate k" + (k+1) + " r" + groupCandidatesPos.get(cand) + " c" + col);
										}
										sudokuflags[groupCandidatesPos.get(cand)][col][k] = false;
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
		for (int b=0;b<nbnumbers;b++) {
			ArrayList<Integer> missingNumbersList = new ArrayList<Integer>();
			for (int k=0;k<nbnumbers;k++) {
				if (numberMissingBlock[b][k]) {
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
						if (sudoku[rob][roc]==0 && sudokuflags[rob][roc][groupNumbers[0]]) {
							nbCandidatesPos++;
						}
					}
					groupNumbers = searchNakedGroupBlocksRecursive(sudoku,rowblock, colblock, sudokuflags, missingNumbersList, groupSize,
							i+1, groupNumbers, 1, nbCandidatesPos);
					if (groupNumbers != null) {
						//group found
						ArrayList<Integer> groupCandidatesPos = new ArrayList<>();
						for (int g=0;g<groupNumbers.length;g++) {
							for (int pos=0;pos<nbnumbers;pos++) {
								int row =  rowblock + pos/nbcolsperblock;
								int c =  colblock + pos%nbcolsperblock;
								if (sudoku[row][c]==0 && sudokuflags[row][c][groupNumbers[g]-1] && !groupCandidatesPos.contains(pos)) {
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
									if (sudokuflags[ro][c][k]) {
										if (showsteps) {
											System.out.print("naked group block " + b + " for values ");
											for (int g=0;g<groupSize;g++) {
												System.out.print((groupNumbers[g]+1) + " " );
											}
											System.out.println();
											System.out.println("Remove candidate k" + (k+1) + " r" + ro + " c" + c);
										}
										sudokuflags[ro][c][k] = false;
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
	
	int[] searchNakedGroupRowsRecursive(Integer sudoku[][],int row, boolean sudokuflags[][][], ArrayList<Integer> missingNumbers, int groupSize,
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
					if (sudoku[row][c]==0 && sudokuflags[row][c][partialGroup[j]-1]) {
						if (!candidatesGroup.contains(c)) {
							candidatesGroup.add(c);
							nbCandidatesPos++;
						}
					}
				}
			}
			int group[] = searchNakedGroupRowsRecursive(sudoku, row, sudokuflags, missingNumbers, groupSize,
					i+1, partialGroup, step+1, nbCandidatesPos);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	int[] searchNakedGroupColsRecursive(Integer sudoku[][],int col, boolean sudokuflags[][][], ArrayList<Integer> missingNumbers, int groupSize,
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
					if (sudoku[ro][col]==0 && sudokuflags[ro][col][partialGroup[j]-1]) {
						if (!candidatesGroup.contains(ro)) {
							candidatesGroup.add(ro);
							nbCandidatesPos++;
						}
					}
				}
			}
			int group[] = searchNakedGroupColsRecursive(sudoku, col, sudokuflags, missingNumbers, groupSize,
					i+1, partialGroup, step+1, nbCandidatesPos);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	int[] searchNakedGroupBlocksRecursive(Integer sudoku[][], int rowblock, int colblock, boolean sudokuflags[][][], ArrayList<Integer> missingNumbers, int groupSize,
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
					if (sudoku[ro][col]==0 && sudokuflags[ro][col][partialGroup[j]-1]) {
						if (!candidatesGroup.contains(pos)) {
							candidatesGroup.add(pos);
							nbCandidatesPos++;
						}
					}
				}
			}
			int group[] = searchNakedGroupBlocksRecursive(sudoku, rowblock, colblock, sudokuflags, missingNumbers, groupSize,
					i+1, partialGroup, step+1, nbCandidatesPos);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	boolean simplifyBySwordFishes(Integer sudoku[][], boolean sudokuflags[][][], boolean numberMissingRow[][], boolean numberMissingCol[][], boolean numberMissingBlock[][], int groupSize) {
		//for example X-Wing for position pairs
		boolean hasSimplyfied = false;
		for (int k=0;k<nbnumbers;k++) {
			int countKPut = 0;
			for (int b=0;b<nbnumbers;b++) {
				if (numberMissingBlock[b][k]) {
					countKPut++;
				}
			}
			if (countKPut >= 2*groupSize) {
				//rows
				ArrayList<Integer> valueMissingRows = new ArrayList<Integer>();
				for (int row=0;row<nbnumbers;row++) {
					if (numberMissingRow[row][k]) {
						valueMissingRows.add(row);
					}
				}
				for (int i=0;i<countKPut+1-groupSize;i++) {
					int groupRows[] = new int[groupSize];
					groupRows[0] = valueMissingRows.get(i);
					int nbCandidatesPos = 0;
					for (int c=0;c<nbnumbers;c++) {
						if (sudoku[groupRows[0]][c] == 0 && sudokuflags[groupRows[0]][c][k]) {
							nbCandidatesPos++;
						}
					}
					groupRows = searchSwordFishGroupRowsRecursive(sudoku, k, sudokuflags, valueMissingRows, groupSize,
							i+1, groupRows, 1, nbCandidatesPos);
					if (groupRows != null) {
						//found
						ArrayList<Integer> candidatesCol = new ArrayList<Integer>();
						for (int j=0;j<groupSize;j++) {
							for (int c=0;c<nbnumbers;c++) {
								if (sudoku[groupRows[j]][c]==0 && sudokuflags[groupRows[j]][c][k]) {
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
								if (sudoku[ro][c]==0 && notInGroup && sudokuflags[ro][c][k]) {
									if (showsteps) {
										System.out.print("swordfish rows " );
										for (int g=0;g<groupSize;g++) {
											System.out.print(groupRows[g] + " " );
										}
										System.out.print(", k" + (k+1) + ", pos ");
										for (int g=0;g<groupSize;g++) {
											System.out.print(candidatesCol.get(g) + " " );
										}
										System.out.println();
										System.out.println("Remove candidate k" + (k+1) + " r" + ro + " c" + c);
									}
									sudokuflags[ro][c][k] = false;
									hasSimplyfied = true;
								}
							}
						}
					}
				}
				//col
				ArrayList<Integer> valueMissingCols = new ArrayList<Integer>();
				for (int col=0;col<nbnumbers;col++) {
					if (numberMissingCol[col][k]) {
						valueMissingCols.add(col);
					}
				}
				for (int i=0;i<countKPut+1-groupSize;i++) {
					int groupCols[] = new int[groupSize];
					groupCols[0] = valueMissingCols.get(i);
					int nbCandidatesPos = 0;
					for (int ro=0;ro<nbnumbers;ro++) {
						if (sudoku[ro][groupCols[0]] == 0 && sudokuflags[ro][groupCols[0]][k]) {
							nbCandidatesPos++;
						}
					}
					groupCols = searchSwordFishGroupColsRecursive(sudoku, k, sudokuflags, valueMissingCols, groupSize,
							i+1, groupCols, 1, nbCandidatesPos);
					if (groupCols != null) {
						//found
						ArrayList<Integer> candidatesRow = new ArrayList<Integer>();
						for (int j=0;j<groupSize;j++) {
							for (int ro=0;ro<nbnumbers;ro++) {
								if (sudoku[ro][groupCols[j]]==0 && sudokuflags[ro][groupCols[j]][k]) {
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
								if (sudoku[ro][c]==0 && notInGroup && sudokuflags[ro][c][k]) {
									if (showsteps) {
										System.out.print("swordfish cols " );
										for (int g=0;g<groupSize;g++) {
											System.out.print(groupCols[g] + " " );
										}
										System.out.print(", k" + (k+1) + ", pos ");
										for (int g=0;g<groupSize;g++) {
											System.out.print(candidatesRow.get(g) + " " );
										}
										System.out.println();
										System.out.println("Remove candidate k" + (k+1) + " r" + ro + " c" + c);
									}
									sudokuflags[ro][c][k] = false;
									hasSimplyfied = true;
								}
							}
						}
					}
				}
				
			}
		}
		return hasSimplyfied;
	}
	
	int[] searchSwordFishGroupRowsRecursive(Integer sudoku[][],int missingValue, boolean sudokuflags[][][], ArrayList<Integer> valueMissingRows, int groupSize,
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
						if (!candidatesGroup.contains(c)) {
							candidatesGroup.add(c);
							nbCandidatesPos++;
						}
					}
				}
			}
			int group[] = searchSwordFishGroupRowsRecursive(sudoku, missingValue, sudokuflags, valueMissingRows, groupSize,
					i+1, partialGroup, step+1, nbCandidatesPos);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	int[] searchSwordFishGroupColsRecursive(Integer sudoku[][],int missingValue, boolean sudokuflags[][][], ArrayList<Integer> valueMissingCols, int groupSize,
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
					if (sudoku[ro][partialGroup[j]]==0 && sudokuflags[ro][partialGroup[j]][missingValue]) {
						if (!candidatesGroup.contains(ro)) {
							candidatesGroup.add(ro);
							nbCandidatesPos++;
						}
					}
				}
			}
			int group[] = searchSwordFishGroupColsRecursive(sudoku, missingValue, sudokuflags, valueMissingCols, groupSize,
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
	}*/
}