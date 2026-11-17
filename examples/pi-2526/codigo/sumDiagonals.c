/************************************************
 Problem: Given a matrix, calculate the sum of
          main and anti-diagonal
 Author:  Fernando Silva (DCC/FCUP)
 Date:    March/2025
 ***********************************************/

#include <stdio.h>

void sumMatrixDiagonals (int n, int a[n][n], int *sumMD , int *sumAD) {
  *sumMD= 0;
  *sumAD= 0;
  for (int i= 0; i < n; i++) { // only one loop is enough
    *sumMD += a[i][i];
    *sumAD += a[i][n-1-i];
  }
}

void readMatrix(int n, int a[n][n]) {
  for (int i= 0; i < n; i++)
    for (int j= 0; j < n; j++)
      scanf("%d", &a[i][j]);
}

int main () {
  int n, sumAD, sumMD;
  scanf("%d", &n); // square matrix dimension
  int a[n][n];

  readMatrix(n, a);
  sumMatrixDiagonals (n, a, &sumMD, &sumAD);
  printf("Sum main-diagonal: %d\n", sumMD);
  printf("Sum anti-diagonal: %d\n", sumAD);
}
