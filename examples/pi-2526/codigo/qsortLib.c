// -------------------------------------------------
// Programação Imperativa (CC1003)
// Sorting using C library
// Fernando Silva, DCC/FCUP
// -------------------------------------------------

#include <stdio.h>
#include <stdlib.h>
#include <assert.h>

// a compare function is needed to invoke the C function qsort
// the example is to compare integers, but this can be adjusted for other data types.
//
int compareInts(const void *a, const void *b) {
  return (*(int *)a - *(int *)b);
}

void printArray(int a[], int n) {
  printf("[");
  for (int i=0; i<n; i++)
    printf("%d%c",a[i],",]"[i == n-1]);
    printf("\n");
}

int main() {
  int n;
  scanf("%d",&n);
  int v[n];  // array to be sorted
  
  // read array elements
  for (int i=0; i<n; i++)
    scanf("%d",&v[i]);

  printf("Initial array: ");
  printArray(v,n);
  
  // call C library sort
  qsort(v, n, sizeof(int), compareInts);

  printf("After quick sort: ");
  printArray(v,n);
}
