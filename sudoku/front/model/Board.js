console.log('board');

class GridSolvable {
    constructor(grid, solvable){
        this.grid = grid;
        this.solvable = solvable;
    }
}

class Board {

    constructor(nbnumbers, nbrowsperblock, nbcolsperblock, seed, lvlchoice) {
        this.nbnumbers = nbnumbers;
        this.nbrowsperblock = nbrowsperblock;
        this.nbcolsperblock = nbcolsperblock;
        this.seed = seed;
        this.initializeRandom(seed);
        this.grid = [];
        for (let i=0;i<nbnumbers;i++) {
            this.grid[i] = [];
        }
        for (let i=0;i<nbnumbers;i++) {
			for (let j=0;j<nbnumbers;j++) {
				this.grid[i][j] = 0;
			}
		}
		this.buildSoluce2(lvlchoice);
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
    
    buildSoluce(tempValues, lvlchoice) {
		for (let i=0;i<this.nbnumbers;i++) {
			for (let j=0;j<this.nbnumbers;j++) {
				if (tempValues[i][j]==0) {
					let candidates = this.candidates(i, j, tempValues);
					console.log(candidates);
					let soluceFound = false;
					while (candidates.length>0 && !soluceFound) {
                        this.randomNumber = (this.multiplier * this.randomNumber + this.adder) % this.modulo;
                        let indexCandidate = this.randomNumber % candidates.length;
						let candidate = candidates[indexCandidate];
						for (let x=1;x<lvlchoice;x++) {
                            this.randomNumber = (this.multiplier * this.randomNumber + this.adder) % this.modulo;
                            indexCandidate = this.randomNumber % candidates.length;
							candidate = candidates[indexCandidate];
						}
						tempValues[i][j] = candidate;
						soluceFound = this.buildSoluce(tempValues,lvlchoice);
						if (soluceFound) {
							return true;
						} else {
							tempValues[i][j] = 0;
						}
                        const index = candidates.indexOf(candidate, 0);
                        if (index > -1) {
                            candidates.splice(index, 1);
                        }
					}
					if (!soluceFound) {
						//no candidate available
						return false;
					}
				}
			}
		}
		return true;
	}

    buildSoluce2(lvlchoice) {
		for (let i=0;i<this.nbnumbers;i++) {
			for (let j=0;j<this.nbnumbers;j++) {
				if (this.grid[i][j]==0) {
					let candidates = this.candidates(i, j, this.grid);
					let soluceFound = false;
					while (candidates.length>0 && !soluceFound) {
                        this.randomNumber = (this.multiplier * this.randomNumber + this.adder) % this.modulo;
                        let indexCandidate = this.randomNumber % candidates.length;
						let candidate = candidates[indexCandidate];
						for (let x=1;x<lvlchoice;x++) {
                            this.randomNumber = (this.multiplier * this.randomNumber + this.adder) % this.modulo;
                            indexCandidate = this.randomNumber % candidates.length;
							candidate = candidates[indexCandidate];
						}
						this.grid[i][j] = candidate;
						soluceFound = this.buildSoluce2(lvlchoice);
						if (soluceFound) {
							return true;
						} else {
							this.grid[i][j] = 0;
						}
                        const index = candidates.indexOf(candidate, 0);
                        if (index > -1) {
                            candidates.splice(index, 1);
                        }
					}
					if (!soluceFound) {
						//no candidate available
						return false;
					}
				}
			}
		}
		return true;
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
			const rowblock = Math.floor(row/this.nbrowsperblock);
			const colblock = Math.floor(col/this.nbcolsperblock);
			for (let r=0;r<this.nbrowsperblock;r++) {
				for (let c=0;c<this.nbcolsperblock;c++) {
					if (!isCandidate || tabValues[rowblock*this.nbrowsperblock+r][colblock*this.nbcolsperblock+c] == k+1) {
						isCandidate = false;
						break;
					}
				}
			}
			
			if (isCandidate) {
				candidates.push(k+1);
			}
		}
		return candidates;
	}
}