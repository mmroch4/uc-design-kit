/********************************************************
 Problem: generating all permutations of a given sequence

 Author: Fernando Silva
 Date:   March/2025
*******************************************************/
#include <stdio.h>

// Global var
int nperm=0;   // count number of permutations (should be n!)

void swap(int *a, int *b) {
   int temp = *a;
   *a = *b;
   *b = temp;
}

// print array of size n
void printArray(int v[], int n) {
  printf("%d",v[0]);
  for (int i=1; i<n; i++)
    printf(" %d", v[i]);
  printf("\n");
}

// generate all permutations using recursion and backtracking
void genPermutations(int curr, int n, int v[]) {
  if (curr == n) {    // Base case: all elements are in place
    printArray(v,n+1); // print solution (n+1) 
    nperm++;
    return;
  }
  for (int i = curr; i <= n; i++) {
    swap(&v[curr], &v[i]); // Swap to fix one element
    genPermutations(curr + 1, n, v); // generate remaining elems
    swap(&v[curr], &v[i]); // Swap back (backtracking)
  }
}

// example of use
int main() {
  int n;
  scanf("%d",&n); // define sequence size

  // initialize sequence
  int v[n];
  for(int i=0; i < n; i++)
    v[i]= i+1;

  printf("All permutations:\n");
  genPermutations(0, n - 1, v);
  printf("%d\n",nperm);
  return 0;
}

