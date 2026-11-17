// -------------------------------------------------
// Programação Imperativa (CC1003)
// Quick Sort and example of use
// Fernando Silva, DCC/FCUP  April 2025
// -------------------------------------------------

#include <stdio.h>
#include <assert.h>

#define MAXN 1000

int v[MAXN];  // array to be sorted
int n;        // number of elements

void swap(int a, int b) {
  int tmp= v[a];
  v[a]= v[b];
  v[b]= tmp;
}

int partition(int left, int right) {
  int a, b, pivot;

  a= left;
  b= right;
  pivot= left;
  while (b >= a) {
    if (v[a] <= v[pivot])
      a++;
    else if (v[b] > v[pivot])
      b--;
    else {
      swap(a,b);
      a++;
      b--;
    }
  }
  swap(pivot, b);
  return b;
}

void quicksort(int left, int right) {
  int posPivot;

  if (left < right) {
    posPivot= partition(left, right); // divide into partions
    quicksort(left, posPivot-1);      // sort partion smaller elem. than pivot
    quicksort(posPivot+1, right);     // sort partion greater elem. than pivot
  }
}

void printArray(int a[], int n) {
  printf("[");
  for (int i=0; i<n; i++)
    printf("%d%c",a[i],",]"[i == n-1]);
    printf("\n");
}

int main() {
  scanf("%d",&n);           // read number of elements

  assert(n <= MAXN);
  
  for (int i=0; i<n; i++)   // read array elements
    scanf("%d",&v[i]);

  printf("Initial array: ");
  printArray(v,n);
  
  // call quick-sort
  quicksort(0,n-1);

  // print sorted array
  printf("After quick sort: ");
  printArray(v,n);
}
