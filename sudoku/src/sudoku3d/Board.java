package sudoku3d;

import java.util.ArrayList;
import java.util.Random;

public class Board {
	
	int nbnumbers;
	int nbrowsperblock;
	int nbcolsperblock;
	int d3size;
	public static Random r;
	
	Integer values[][][];
	
	public Board(int nbnumbers, int nbrowsperblock, int nbcolsperblock, int d3size, long seed, int chosenLevel) {
		super();
		this.nbnumbers = nbnumbers;
		this.nbrowsperblock = nbrowsperblock;
		this.nbcolsperblock = nbcolsperblock;
		this.d3size = d3size;
		r =new Random(seed);
		values = new Integer[nbnumbers][nbnumbers][d3size];
		for (int i=0;i<nbnumbers;i++) {
			for (int j=0;j<nbnumbers;j++) {
				for (int l=0;l<d3size;l++) {
					values[i][j][l] = 0;
				}
			}
		}
		buildSoluce(values,chosenLevel);
	}
	
	boolean buildSoluce(Integer tempValues[][][], int chosenLevel) {
		for (int i=0;i<nbnumbers;i++) {
			for (int j=0;j<nbnumbers;j++) {
				for (int l=0;l<d3size;l++) {
					if (tempValues[i][j][l]==0) {
						ArrayList<Integer> candidates = candidates(i, j, l, tempValues);
						boolean soluceFound = false;
						while (candidates.size()>0 && !soluceFound) {
							Integer candidate = candidates.get(r.nextInt(candidates.size()));
							for (int x=1;x<chosenLevel;x++) {
								candidate = candidates.get(r.nextInt(candidates.size()));
							}
							tempValues[i][j][l] = candidate;
							soluceFound = buildSoluce(tempValues,chosenLevel);
							if (soluceFound) {
								return true;
							} else {
								tempValues[i][j][l] = 0;
							}
							candidates.remove(candidate);
						}
						if (!soluceFound) {
							//no candidate available
							return false;
						}
					}
				}
				
			}
		}
		return true;
	}
	
	ArrayList<Integer> candidates(int row, int col, int d3, Integer tabValues[][][]) {
		ArrayList<Integer> candidates = new ArrayList<Integer>();
		for (int k=0;k<nbnumbers;k++) {
			boolean isCandidate = true;
			//row
			for (int c=0;c<nbnumbers;c++) {
				if (tabValues[row][c][d3] == k+1) {
					isCandidate = false;
					break;
				}
			}
			//col
			for (int r=0;r<nbnumbers;r++) {
				if (!isCandidate || tabValues[r][col][d3] == k+1) {
					isCandidate = false;
					break;
				}
			}
			//block
			int rowblock = row/nbrowsperblock;
			int colblock = col/nbcolsperblock;
			for (int r=0;r<nbrowsperblock;r++) {
				for (int c=0;c<nbcolsperblock;c++) {
					if (!isCandidate || tabValues[rowblock*nbrowsperblock+r][colblock*nbcolsperblock+c][d3] == k+1) {
						isCandidate = false;
						break;
					}
				}
			}
			//d3
			for (int l=0;l<d3size;l++) {
				if (!isCandidate || tabValues[row][col][l] == k+1) {
					isCandidate = false;
					break;
				}
			}
			
			if (isCandidate) {
				candidates.add(k+1);
			}
		}
		return candidates;
	}
	
	public void writeBoard() {
		for (int i=0;i<nbnumbers;i++) {
			System.out.print("[");
			for (int j=0;j<nbnumbers;j++) {
				System.out.print(values[i][j] + ",");
			}
			System.out.println("]");
		}
	}
	
	public void writeTempBoard(Integer tempBoard[][]) {
		for (int i=0;i<nbnumbers;i++) {
			System.out.print("[");
			for (int j=0;j<nbnumbers;j++) {
				System.out.print(tempBoard[i][j] + ",");
			}
			System.out.println("]");
		}
	}

}
