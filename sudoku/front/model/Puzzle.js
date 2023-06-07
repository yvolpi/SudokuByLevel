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
			let deductionCross = this.simplifyByDeductionCross(sudoku);
			let singleSoluce = null;
			if (deductionCross) {
				singleSoluce = this.searchCellUniqueSolution(sudoku);
				if (singleSoluce != null && singleSoluce[2] == -1) {
					return 0;
				}
				if (singleSoluce != null && singleSoluce[2] != -1) {
					sudoku[singleSoluce[0]][singleSoluce[1]] = singleSoluce[2];
					let solve = this.solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
					sudoku[singleSoluce[0]][singleSoluce[1]] = 0;
					return solve;
				}
				singleSoluce = this.searchUniquePosSolution(sudoku);
				if (singleSoluce != null && singleSoluce[2] == -1) {
					return 0;
				}
				if (singleSoluce != null && singleSoluce[2] != -1) {
					sudoku[singleSoluce[0]][singleSoluce[1]] = singleSoluce[2];
					let solve = this.solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
					sudoku[singleSoluce[0]][singleSoluce[1]] = 0;
					return solve;
				}
			}
			
			
			//pairs, triplets?
			const n = (this.nbnumbers/2)-1;
			let levelMethod = 3;
			for (let groupSize=2;groupSize<=n;groupSize++) {
				levelMethod++;
				lvlmax = Math.max(levelMethod, lvlmax);
				this.level = Math.max(levelMethod, lvlmax);
				if (this.level > chosenLevel) return 2;
				let visibleGroups = this.simplifyByVisibleGroups(sudoku, groupSize);
				while (visibleGroups) {
					visibleGroups = this.simplifyByDeductionCross(sudoku);
					for (let g=2;g<this.level/2;g++) {
						visibleGroups = visibleGroups || this.simplifyByVisibleGroups(sudoku, g);
						visibleGroups = visibleGroups || this.simplifyByNakedGroups(sudoku, g);
					}
					
					visibleGroups = visibleGroups || this.simplifyByVisibleGroups(sudoku, groupSize);
					singleSoluce = this.searchCellUniqueSolution(sudoku);
					if (singleSoluce != null && singleSoluce[2] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[2] != -1) {
						sudoku[singleSoluce[0]][singleSoluce[1]] = singleSoluce[2];
						let solve = this.solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]] = 0;
						return solve;
					}
					singleSoluce = this.searchUniquePosSolution(sudoku);
					if (singleSoluce != null && singleSoluce[2] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[2] != -1) {
						sudoku[singleSoluce[0]][singleSoluce[1]] = singleSoluce[2];
						let solve = this.solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]] = 0;
						return solve;
					}
				}
				levelMethod++;
				lvlmax = Math.max(levelMethod, lvlmax);
				this.level = Math.max(levelMethod, lvlmax);
				if (this.level > chosenLevel) return 2;
				//nakedGroup
				let nakedGroup = this.simplifyByNakedGroups(sudoku, groupSize);
				while (nakedGroup) {
					nakedGroup = this.simplifyByDeductionCross(sudoku);
					for (let g=2;g<=this.level/2;g++) {
						nakedGroup = nakedGroup || this.simplifyByVisibleGroups(sudoku, g);
						nakedGroup = nakedGroup || this.simplifyByNakedGroups(sudoku, g);
					}
					singleSoluce = this.searchCellUniqueSolution(sudoku);
					if (singleSoluce != null && singleSoluce[2] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[2] != -1) {
						sudoku[singleSoluce[0]][singleSoluce[1]] = singleSoluce[2];
						let solve = this.solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]] = 0;
						return solve;
					}
					singleSoluce = this.searchUniquePosSolution(sudoku);
					if (singleSoluce != null && singleSoluce[2] == -1) {
						return 0;
					}
					if (singleSoluce != null && singleSoluce[2] != -1) {
						sudoku[singleSoluce[0]][singleSoluce[1]] = singleSoluce[2];
						let solve = this.solver(sudoku, nbEmptyCells-1, lvlmax, nbTests, chosenLevel);
						sudoku[singleSoluce[0]][singleSoluce[1]] = 0;
						return solve;
					}
				}
			}
			
			/*for (int groupSize=2;groupSize<=n;groupSize++) {
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
	
	searchCellUniqueSolution(sudoku) {
		//return tab of 3 numbers: row, colonne and number
		for (let i=0;i<this.nbnumbers;i++) {
			for (let j=0;j<this.nbnumbers;j++) {
				if (sudoku[i][j] == 0) {
					let count = 0;
					let candidate = 0;
					for (let k=0;k<this.nbnumbers;k++) {
						if (this.sudokuflags[i][j][k]) {
							count++;
							candidate = k+1;
						}
					}
					if (count == 0) {
						return [0,0,-1];
					}
					if (count == 1) {
						return [i,j,candidate];
					}
				}
			}
		}
		return null;
	}
	
	/*int[] searchCellXSolutions(Integer sudoku[][], boolean sudokuflags[][][], int nbsolutions) {
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
	}*/
	
	searchUniquePosSolution(sudoku) {
		//return tab of 3 numbers: row, colonne and number
		//row
		for (let ro=0;ro<this.nbnumbers;ro++) {
			for (let k=0;k<this.nbnumbers;k++) {
				if (this.numberMissingRow[ro][k]) {
					let count = 0;
					let pos = -1;
					for (let c=0;c<this.nbnumbers;c++) {
						if (sudoku[ro][c] == 0 && this.sudokuflags[ro][c][k]) {
							count++;
							pos = c;
						}
					}
					if (count == 0) {
						return [0,0,-1];
					}
					if (count == 1) {
						return [ro,pos,k+1];
					}
				}
			}
		}
		//col
		for (let c=0;c<this.nbnumbers;c++) {
			for (let k=0;k<this.nbnumbers;k++) {
				if (this.numberMissingCol[c][k]) {
					let count = 0;
					let pos = -1;
					for (let ro=0;ro<this.nbnumbers;ro++) {
						if (sudoku[ro][c] == 0 && this.sudokuflags[ro][c][k]) {
							count++;
							pos = ro;
						}
					}
					if (count == 0) {
						return [0,0,-1];
					}
					if (count == 1) {
						return [pos,c,k+1];
					}
				}
			}
		}
		//block
		for (let b=0;b<this.nbnumbers;b++) {
			let rowBlock =  Math.floor(b/this.nbrowsperblock)*this.nbrowsperblock;
			let colBlock = (b%this.nbrowsperblock)*this.nbcolsperblock;
			for (let k=0;k<this.nbnumbers;k++) {
				if (this.numberMissingBlock[b][k]) {
					let count = 0;
					let posRow = -1;
					let posCol = -1;
					for (let posb=0;posb<this.nbnumbers;posb++) {
						let ro = rowBlock + Math.floor(posb/this.nbcolsperblock);
						let c = colBlock + posb%this.nbcolsperblock;
						if (sudoku[ro][c] == 0 && this.sudokuflags[ro][c][k]) {
							count++;
							posRow = ro;
							posCol = c;
						}
					}
					if (count == 0) {
						return [0,0,-1];
					}
					if (count == 1) {
						return [posRow,posCol,k+1];
					}
				}
			}
		}
		return null;
	}
	
	simplifyByDeductionCross(sudoku) {
		let hasChanged = true;
		let hasSimplyfied = false;
		while (hasChanged) {
			hasChanged = false;
			//row
			for(let i=0;i<this.nbnumbers;i++) {
				for(let k=0;k<this.nbnumbers;k++) {
					if (this.numberMissingRow[i][k]) {
						let posBloc = -1;
						let count = 0;
						for(let c=0;c<this.nbnumbers;c++) {
							if (sudoku[i][c] == 0 && this.sudokuflags[i][c][k]) {
								if (posBloc == -1 || posBloc!= c/this.nbcolsperblock) {
									posBloc = c/this.nbcolsperblock;
									count ++;
								}
								
							}
						}
						if (count == 1) {
							//unique block for the number k+1
							let rowBlock = i%this.nbrowsperblock;
							let rowBlockLocation = Math.floor(i/this.nbrowsperblock)*this.nbrowsperblock;
							let colBlockLocation = posBloc*this.nbcolsperblock;
							for(let r=0;r<this.nbrowsperblock;r++) {
								if (r != rowBlock) {
									for(let c=0;c<this.nbcolsperblock;c++) {
										if (sudoku[rowBlockLocation + r][colBlockLocation + c] == 0 && this.sudokuflags[rowBlockLocation + r][colBlockLocation + c][k]) {
											this.sudokuflags[rowBlockLocation + r][colBlockLocation + c][k] = false;
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
			for(let j=0;j<this.nbnumbers;j++) {
				for(let k=0;k<this.nbnumbers;k++) {
					if (this.numberMissingCol[j][k]) {
						let posBloc = -1;
						let count = 0;
						for(let r=0;r<this.nbnumbers;r++) {
							if (sudoku[r][j] == 0 && this.sudokuflags[r][j][k]) {
								if (posBloc == -1 || posBloc !=  Math.floor(r/this.nbrowsperblock)) {
									posBloc =  Math.floor(r/this.nbrowsperblock);
									count ++;
								}
								
							}
						}
						if (count == 1) {
							//unique block for the number k+1
							let colBlock = j%this.nbcolsperblock;
							let rowBlockLocation = posBloc*this.nbrowsperblock;
							let colBlockLocation =  Math.floor(j/this.nbcolsperblock)*this.nbcolsperblock;
							for(let c=0;c<this.nbcolsperblock;c++) {
								if (c != colBlock) {
									for(let r=0;r<this.nbrowsperblock;r++) {
										if (sudoku[rowBlockLocation + r][colBlockLocation + c] == 0 && this.sudokuflags[rowBlockLocation + r][colBlockLocation + c][k]) {
											this.sudokuflags[rowBlockLocation + r][colBlockLocation + c][k] = false;
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
			for(let b=0;b<this.nbnumbers;b++) {
				for(let k=0;k<this.nbnumbers;k++) {
					if (this.numberMissingBlock[b][k]) {
						let posBlocRow = -1;
						let posBlocCol = -1;
						let rowBlock = Math.floor(b/this.nbrowsperblock)*this.nbrowsperblock;
						let colBlock = (b%this.nbrowsperblock)*this.nbcolsperblock;
						let countRow = 0;
						let countCol = 0;
						for(let posb=0;posb<this.nbnumbers;posb++) {
							if (sudoku[rowBlock + Math.floor(posb/this.nbcolsperblock)][colBlock + posb%this.nbcolsperblock] == 0 && this.sudokuflags[rowBlock + Math.floor(posb/this.nbcolsperblock)][colBlock + posb%this.nbcolsperblock][k]) {
								if (countRow == 0) {
									countRow ++;
									countCol++;
									posBlocRow = rowBlock + Math.floor(posb/this.nbcolsperblock);
									posBlocCol = colBlock + posb%this.nbcolsperblock;
								} else {
									if (rowBlock + Math.floor(posb/this.nbcolsperblock) != posBlocRow) {
										countRow++;
									}
									if (colBlock + posb%this.nbcolsperblock != posBlocCol) {
										countCol++;
									}
								}
								
							}
						}
						if (countRow == 1) {
							//unique row for the number k+1
							for(let c=0;c<this.nbnumbers;c++) {
								if (c < colBlock || c >= colBlock + this.nbcolsperblock) {
									if (sudoku[posBlocRow][c] == 0 && this.sudokuflags[posBlocRow][c][k]) {
										this.sudokuflags[posBlocRow][c][k] = false;
										hasChanged = true;
										hasSimplyfied = true;
									}
								}
							}
						} else if (countCol == 1) {
							//unique col for the number k+1
							for(let ro=0;ro<this.nbnumbers;ro++) {
								if (ro < rowBlock || ro >= rowBlock + this.nbrowsperblock) {
									if (sudoku[ro][posBlocCol] == 0 && this.sudokuflags[ro][posBlocCol][k]) {
										this.sudokuflags[ro][posBlocCol][k] = false;
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
	
	simplifyByVisibleGroups(sudoku, groupSize) {
		//visible pairs, triplets, ...
		let hasSimplyfied = false;
		//row
		for (let ro=0;ro<this.nbnumbers;ro++) {
			let positionsEmptyCells = [];
			for (let c=0;c<this.nbnumbers;c++) {
				if (sudoku[ro][c] == 0) {
					positionsEmptyCells[positionsEmptyCells.length] = c;
				}
			}
			if (positionsEmptyCells.length >= 2*groupSize) {
				for (let i=0;i<positionsEmptyCells.length+1-groupSize;i++) {
					let groupCells = [];
					groupCells[0] = positionsEmptyCells[i];
					let nbCandidates = 0;
					for (let k=0;k<this.nbnumbers;k++) {
						if (this.sudokuflags[ro][groupCells[0]][k]) {
							nbCandidates++;
						}
					}
					groupCells = this.searchVisibleGroupRowsRecursive(ro, positionsEmptyCells, groupSize,
							i+1, groupCells, 1, nbCandidates);
					if (groupCells != null) {
						//group found
						let groupCandidates = [];
						for (let g=0;g<groupCells.length;g++) {
							let col = groupCells[g];
							for (let k=0;k<this.nbnumbers;k++) {
								if (this.sudokuflags[ro][col][k] && groupCandidates.indexOf(k) < 0) {
									groupCandidates[groupCandidates.length] = k;
								}
							}
						}
						for (let j=0;j<positionsEmptyCells.length;j++) {
							let col = positionsEmptyCells[j];
							let notIngroup = true;
							for (let g=0;g<groupCells.length;g++) {
								if (groupCells[g] == col) {
									notIngroup = false;
									break;
								}
							}
							if (notIngroup) {
								//suppress candidates
								for (let cand=0;cand<groupCandidates.length;cand++) {
									if (this.sudokuflags[ro][col][groupCandidates[cand]]) {
										this.sudokuflags[ro][col][groupCandidates[cand]] = false;
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
		for (let c=0;c<this.nbnumbers;c++) {
			let positionsEmptyCells = [];
			for (let ro=0;ro<this.nbnumbers;ro++) {
				if (sudoku[ro][c] == 0) {
					positionsEmptyCells[positionsEmptyCells.length] = ro;
				}
			}
			if (positionsEmptyCells.length >= 2*groupSize) {
				for (let i=0;i<positionsEmptyCells.length+1-groupSize;i++) {
					let groupCells = [];
					groupCells[0] = positionsEmptyCells[i];
					let nbCandidates = 0;
					for (let k=0;k<this.nbnumbers;k++) {
						if (this.sudokuflags[groupCells[0]][c][k]) {
							nbCandidates++;
						}
					}
					groupCells = this.searchVisibleGroupColsRecursive(c, positionsEmptyCells, groupSize,
							i+1, groupCells, 1, nbCandidates);
					if (groupCells != null) {
						//group found
						let groupCandidates = [];
						for (let g=0;g<groupCells.length;g++) {
							let row = groupCells[g];
							for (let k=0;k<this.nbnumbers;k++) {
								if (this.sudokuflags[row][c][k] && groupCandidates.indexOf(k) < 0) {
									groupCandidates[groupCandidates.length] = k;
								}
							}
						}
						
						for (let j=0;j<positionsEmptyCells.length;j++) {
							let ro = positionsEmptyCells[j];
							let notIngroup = true;
							for (let g=0;g<groupCells.length;g++) {
								if (groupCells[g] == ro) {
									notIngroup = false;
									break;
								}
							}
							if (notIngroup) {
								//suppress candidates
								for (let cand=0;cand<groupCandidates.length;cand++) {
									if (this.sudokuflags[ro][c][groupCandidates[cand]]) {
										this.sudokuflags[ro][c][groupCandidates[cand]] = false;
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
		for (let b=0;b<this.nbnumbers;b++) {
			let positionsEmptyCells = [];
			let rowblock = Math.floor(b/this.nbrowsperblock)*this.nbrowsperblock;
			let colblock = (b%this.nbrowsperblock)*this.nbcolsperblock;
			for (let pos=0;pos<this.nbnumbers;pos++) {
				let rob = rowblock + Math.floor(pos/this.nbcolsperblock);
				let roc = colblock + pos%this.nbcolsperblock;
				if (sudoku[rob][roc] == 0) {
					positionsEmptyCells[positionsEmptyCells.length] = pos;
				}
			}
			if (positionsEmptyCells.length >= 2*groupSize) {
				for (let i=0;i<positionsEmptyCells.length+1-groupSize;i++) {
					let groupCells = [];
					groupCells[0] = positionsEmptyCells[i];
					let nbCandidates = 0;
					let rob = rowblock + Math.floor(groupCells[0]/this.nbcolsperblock);
					let roc = colblock + groupCells[0]%this.nbcolsperblock;
					for (let k=0;k<this.nbnumbers;k++) {
						if (this.sudokuflags[rob][roc][k]) {
							nbCandidates++;
						}
					}
					groupCells = this.searchVisibleGroupBlocksRecursive(rowblock, colblock, positionsEmptyCells, groupSize,
							i+1, groupCells, 1, nbCandidates);
					if (groupCells != null) {
						//group found
						let groupCandidates = [];
						for (let g=0;g<groupCells.length;g++) {
							let row =  rowblock + Math.floor(groupCells[g]/this.nbcolsperblock);
							let c =  colblock + groupCells[g]%this.nbcolsperblock;
							for (let k=0;k<this.nbnumbers;k++) {
								if (this.sudokuflags[row][c][k] && groupCandidates.indexOf(k) < 0) {
									groupCandidates[groupCandidates.length] = k;
								}
							}
						}
						
						for (let j=0;j<positionsEmptyCells.length;j++) {
							let pos = positionsEmptyCells[j];
							let notIngroup = true;
							for (let g=0;g<groupCells.length;g++) {
								if (groupCells[g] == pos) {
									notIngroup = false;
									break;
								}
							}
							if (notIngroup) {
								//suppress candidates
								let ro =  rowblock + Math.floor(pos/this.nbcolsperblock);
								let c =  colblock + pos%this.nbcolsperblock;
								for (let cand=0;cand<groupCandidates.length;cand++) {
									if (this.sudokuflags[ro][c][groupCandidates[cand]]) {
										this.sudokuflags[ro][c][groupCandidates[cand]] = false;
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
	
	searchVisibleGroupRowsRecursive(row, positionsEmptyCells, groupSize,
			index, partialGroup, step, nbCandidates) {
		if (nbCandidates > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		for (let i=index;i<positionsEmptyCells.length;i++) {
			partialGroup[step] = positionsEmptyCells[i];
			nbCandidates = 0;
			let candidatesGroup = [];
			for (let k=0;k<this.nbnumbers;k++) {
				for (let j=0;j<=step;j++) {
					if (this.sudokuflags[row][partialGroup[j]][k]) {
						if (candidatesGroup.indexOf(k) < 0) {
							candidatesGroup.push(k);
							nbCandidates++;
						}
					}
				}
			}
			let group = this.searchVisibleGroupRowsRecursive(row, positionsEmptyCells, groupSize,
					i+1, partialGroup, step+1, nbCandidates);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	searchVisibleGroupColsRecursive(col, positionsEmptyCells, groupSize,
			index, partialGroup, step, nbCandidates) {
		if (nbCandidates > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		for (let i=index;i<positionsEmptyCells.length;i++) {
			partialGroup[step] = positionsEmptyCells[i];
			nbCandidates = 0;
			let candidatesGroup = [];
			for (let k=0;k<this.nbnumbers;k++) {
				for (let j=0;j<=step;j++) {
					if (this.sudokuflags[partialGroup[j]][col][k]) {
						if (candidatesGroup.indexOf(k) < 0) {
							candidatesGroup[candidatesGroup.length] = k;
							nbCandidates++;
						}
					}
				}
			}
			let group = this.searchVisibleGroupColsRecursive(col, positionsEmptyCells, groupSize,
					i+1, partialGroup, step+1, nbCandidates);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	searchVisibleGroupBlocksRecursive(rowblock, colblock, positionsEmptyCells, groupSize,
			index, partialGroup, step, nbCandidates) {
		if (nbCandidates > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		
		
		for (let i=index;i<positionsEmptyCells.length;i++) {
			partialGroup[step] = positionsEmptyCells[i];
			nbCandidates = 0;
			let candidatesGroup = [];
			for (let k=0;k<this.nbnumbers;k++) {
				for (let j=0;j<=step;j++) {
					let rob = rowblock + Math.floor(partialGroup[j]/this.nbcolsperblock);
					let roc = colblock + partialGroup[j]%this.nbcolsperblock;
					if (this.sudokuflags[rob][roc][k]) {
						if (candidatesGroup.indexOf(k) < 0) {
							candidatesGroup[candidatesGroup.length] = k;
							nbCandidates++;
						}
					}
				}
			}
			let group = this.searchVisibleGroupBlocksRecursive(rowblock, colblock, positionsEmptyCells, groupSize,
					i+1, partialGroup, step+1, nbCandidates);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	simplifyByNakedGroups(sudoku, groupSize) {
		//naked pairs, triplets, ...
		let hasSimplyfied = false;
		//row
		for (let row=0;row<this.nbnumbers;row++) {
			let missingNumbersList = [];
			for (let k=0;k<this.nbnumbers;k++) {
				if (this.numberMissingRow[row][k]) {
					missingNumbersList[missingNumbersList.length] = k+1;
				}
			}
			if (missingNumbersList.length >= 2*groupSize) {
				for (let i=0;i<missingNumbersList.length+1-groupSize;i++) {
					let groupNumbers = [];
					groupNumbers[0] = missingNumbersList[i];
					let nbCandidatesPos = 0;
					for (let c=0;c<this.nbnumbers;c++) {
						if (sudoku[row][c]==0 && this.sudokuflags[row][c][groupNumbers[0]]) {
							nbCandidatesPos++;
						}
					}
					groupNumbers = this.searchNakedGroupRowsRecursive(sudoku, row, missingNumbersList, groupSize,
							i+1, groupNumbers, 1, nbCandidatesPos);
					if (groupNumbers != null) {
						//group found
						let groupCandidatesPos = [];
						for (let g=0;g<groupNumbers.length;g++) {
							let k = groupNumbers[g]-1;
							for (let c=0;c<this.nbnumbers;c++) {
								if (sudoku[row][c]==0 && this.sudokuflags[row][c][k] && groupCandidatesPos.indexOf(c) < 0) {
									groupCandidatesPos[groupCandidatesPos.length] = c;
								}
							}
						}
						for (let j=0;j<missingNumbersList.length;j++) {
							let k = missingNumbersList[j]-1;
							let notIngroup = true;
							for (let g=0;g<groupNumbers.length;g++) {
								if (groupNumbers[g] == k+1) {
									notIngroup = false;
									break;
								}
							}
							if (notIngroup) {
								//suppress candidates
								for (let cand=0;cand<groupCandidatesPos.length;cand++) {
									if (sudoku[row][groupCandidatesPos[cand]]==0 && this.sudokuflags[row][groupCandidatesPos[cand]][k]) {
										this.sudokuflags[row][groupCandidatesPos[cand]][k] = false;
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
		for (let col=0;col<this.nbnumbers;col++) {
			let missingNumbersList = [];
			for (let k=0;k<this.nbnumbers;k++) {
				if (this.numberMissingCol[col][k]) {
					missingNumbersList[missingNumbersList.length] = k+1;
				}
			}
			if (missingNumbersList.length >= 2*groupSize) {
				for (let i=0;i<missingNumbersList.length+1-groupSize;i++) {
					let groupNumbers = [];
					groupNumbers[0] = missingNumbersList[i];
					let nbCandidatesPos = 0;
					for (let ro=0;ro<this.nbnumbers;ro++) {
						if (sudoku[ro][col]==0 && this.sudokuflags[ro][col][groupNumbers[0]]) {
							nbCandidatesPos++;
						}
					}
					groupNumbers = this.searchNakedGroupColsRecursive(sudoku, col, missingNumbersList, groupSize,
							i+1, groupNumbers, 1, nbCandidatesPos);
					if (groupNumbers != null) {
						//group found
						let groupCandidatesPos = [];
						for (let g=0;g<groupNumbers.length;g++) {
							let k = groupNumbers[g]-1;
							for (let ro=0;ro<this.nbnumbers;ro++) {
								if (sudoku[ro][col]==0 && this.sudokuflags[ro][col][k] && groupCandidatesPos.indexOf(ro) < 0) {
									groupCandidatesPos[groupCandidatesPos.length] = ro;
								}
							}
						}
						for (let j=0;j<missingNumbersList.length;j++) {
							let k = missingNumbersList[j]-1;
							let notIngroup = true;
							for (let g=0;g<groupNumbers.length;g++) {
								if (groupNumbers[g] == k+1) {
									notIngroup = false;
									break;
								}
							}
							if (notIngroup) {
								//suppress candidates
								for (let cand=0;cand<groupCandidatesPos.length;cand++) {
									if (sudoku[groupCandidatesPos[cand]][col]==0 && this.sudokuflags[groupCandidatesPos[cand]][col][k]) {
										this.sudokuflags[groupCandidatesPos[cand]][col][k] = false;
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
		for (let b=0;b<this.nbnumbers;b++) {
			let missingNumbersList = [];
			for (let k=0;k<this.nbnumbers;k++) {
				if (this.numberMissingBlock[b][k]) {
					missingNumbersList[missingNumbersList.length] = k+1;
				}
			}
			let rowblock = Math.floor(b/this.nbrowsperblock)*this.nbrowsperblock;
			let colblock = (b%this.nbrowsperblock)*this.nbcolsperblock;
			if (missingNumbersList.length >= 2*groupSize) {
				for (let i=0;i<missingNumbersList.length+1-groupSize;i++) {
					let groupNumbers = [];
					groupNumbers[0] = missingNumbersList[i];
					let nbCandidatesPos = 0;
					for (let pos=0;pos<this.nbnumbers;pos++) {
						let rob = rowblock + Math.floor(pos/this.nbcolsperblock);
						let roc = colblock + pos%this.nbcolsperblock;
						if (sudoku[rob][roc]==0 && this.sudokuflags[rob][roc][groupNumbers[0]]) {
							nbCandidatesPos++;
						}
					}
					groupNumbers = this.searchNakedGroupBlocksRecursive(sudoku,rowblock, colblock, missingNumbersList, groupSize,
							i+1, groupNumbers, 1, nbCandidatesPos);
					if (groupNumbers != null) {
						//group found
						let groupCandidatesPos = [];
						for (let g=0;g<groupNumbers.length;g++) {
							for (let pos=0;pos<this.nbnumbers;pos++) {
								let row =  rowblock + Math.floor(pos/this.nbcolsperblock);
								let c =  colblock + pos%this.nbcolsperblock;
								if (sudoku[row][c]==0 && this.sudokuflags[row][c][groupNumbers[g]-1] && groupCandidatesPos.indexOf(pos) < 0) {
									groupCandidatesPos[groupCandidatesPos.length] = pos;
								}
							}
						}
						
						for (let j=0;j<missingNumbersList.length;j++) {
							let k = missingNumbersList[j]-1;
							let notIngroup = true;
							for (let g=0;g<groupNumbers.length;g++) {
								if (groupNumbers[g] == k+1) {
									notIngroup = false;
									break;
								}
							}
							if (notIngroup) {
								//suppress candidates
								for (let cand=0;cand<groupCandidatesPos.length;cand++) {
									let ro =  rowblock + Math.floor(groupCandidatesPos[cand]/this.nbcolsperblock);
									let c =  colblock + Math.floor(groupCandidatesPos[cand]%this.nbcolsperblock);
									if (this.sudokuflags[ro][c][k]) {
										this.sudokuflags[ro][c][k] = false;
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
	
	searchNakedGroupRowsRecursive(sudoku, row, missingNumbers, groupSize,
			index, partialGroup, step, nbCandidatesPos) {
		if (nbCandidatesPos > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		for (let i=index;i<missingNumbers.length;i++) {
			partialGroup[step] = missingNumbers[i];
			nbCandidatesPos = 0;
			let candidatesGroup = [];
			for (let j=0;j<=step;j++) {
				for (let c=0;c<this.nbnumbers;c++) {
					if (sudoku[row][c]==0 && this.sudokuflags[row][c][partialGroup[j]-1]) {
						if (candidatesGroup.indexOf(c) < 0) {
							candidatesGroup[candidatesGroup.length] = c;
							nbCandidatesPos++;
						}
					}
				}
			}
			let group = this.searchNakedGroupRowsRecursive(sudoku, row, missingNumbers, groupSize,
					i+1, partialGroup, step+1, nbCandidatesPos);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	searchNakedGroupColsRecursive(sudoku, col, missingNumbers, groupSize,
		index, partialGroup, step, nbCandidatesPos) {
		if (nbCandidatesPos > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		for (let i=index;i<missingNumbers.length;i++) {
			partialGroup[step] = missingNumbers[i];
			nbCandidatesPos = 0;
			let candidatesGroup = [];
			for (let j=0;j<=step;j++) {
				for (let ro=0;ro<this.nbnumbers;ro++) {
					if (sudoku[ro][col]==0 && this.sudokuflags[ro][col][partialGroup[j]-1]) {
						if (candidatesGroup.indexOf(ro) < 0) {
							candidatesGroup[candidatesGroup.length] = ro;
							nbCandidatesPos++;
						}
					}
				}
			}
			let group = this.searchNakedGroupColsRecursive(sudoku, col, missingNumbers, groupSize,
					i+1, partialGroup, step+1, nbCandidatesPos);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	searchNakedGroupBlocksRecursive(sudoku, rowblock, colblock, missingNumbers, groupSize,
			index, partialGroup, step, nbCandidatesPos) {
		if (nbCandidatesPos > groupSize) {
			return null;
		}
		if (step == groupSize) {
			return partialGroup;
		}
		for (let i=index;i<missingNumbers.length;i++) {
			partialGroup[step] = missingNumbers[i];
			nbCandidatesPos = 0;
			let candidatesGroup = [];
			for (let j=0;j<=step;j++) {
				for (let pos=0;pos<this.nbnumbers;pos++) {
					let ro = rowblock + Math.floor(pos/this.nbcolsperblock);
					let col = colblock + pos%this.nbcolsperblock;
					if (sudoku[ro][col]==0 && this.sudokuflags[ro][col][partialGroup[j]-1]) {
						if (candidatesGroup.indexOf(pos) < 0) {
							candidatesGroup[candidatesGroup.length] = pos;
							nbCandidatesPos++;
						}
					}
				}
			}
			let group = this.searchNakedGroupBlocksRecursive(sudoku, rowblock, colblock, missingNumbers, groupSize,
					i+1, partialGroup, step+1, nbCandidatesPos);
			if (group != null) {
				return group;
			}
		}
		return null;
	}
	
	/*boolean simplifyBySwordFishes(Integer sudoku[][], boolean sudokuflags[][][], boolean numberMissingRow[][], boolean numberMissingCol[][], boolean numberMissingBlock[][], int groupSize) {
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