/******************************************
 * Problem: Rotating right a square matrix
 * Author: Fernando Silva
 * Date: March/2025
 *****************************************/
#include <stdio.h>

void printMatrix(int n, int a[n][n]) {
for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++)
            printf("%d ", a[i][j]);
        printf("\n");
    }
}
void rotateMatrix(int n, int matrix[n][n]) {
    int rotated[n][n];

    for (int i = 0; i < n; i++) 
      for (int j = 0; j < n; j++) 
	rotated[i][j] = matrix[n-1-j][i];
    printf("Matrix rotated:\n");
    printMatrix(n, rotated);
}

int main() {
    int n;
    
    printf("Provide the matrix dimension: \n");
    scanf("%d", &n);
    
    int matrix[n][n];
    // fill in the matrix with lines all equal
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            matrix[i][j]= j+1;
    
    printf("Matrix given:\n");
    printMatrix(n, matrix);
    rotateMatrix(n, matrix);
    return 0;
}

