// -------------------------------------------------
// Programação Imperativa (CC1003)
// Sorting methods: selection, insertion and bubble
// Example of using 3 sorting methods O(n^2)
// Fernando Silva, DCC/FCUP
// -------------------------------------------------

#include <stdio.h>
#include <stdbool.h>

void swap(int *a, int *b);
void selectMinSort(int v[], int n);
void insertionSort(int v[], int n);
void bubbleSort3(int v[], int n);
void printArray(int v[], int n);
void copyArray(int v[], int vc[], int n);
  
int main() {
  int n;
  scanf("%d", &n);        // number of elements
  int v[n], vc[n];

  for (int i=0; i<n; i++)
    scanf("%d", &v[i]);   // read the elements
  
  copyArray(v, vc, n);  // make a copy to preserve original
  printf("Initial array\n");
  printArray(vc, n);
  selectMinSort(vc, n);
  printf("After sorting by selecting minimum\n");
  printArray(vc, n);

  copyArray(v,vc,n);
  printf("Initial array\n");
  printArray(vc, n); 
  insertionSort(vc,n);
  printf("After insertion sorting\n");
  printArray(vc, n);

  copyArray(v,vc,n);
  printf("Initial array\n");
  printArray(vc, n);
  bubbleSort3(vc, n);
  printf("After bubble sort 3\n");
  printArray(vc, n);
  
}
// swap two values
void swap(int *a, int *b) {
  int tmp;
  tmp= *a;
  *a= *b;
  *b= tmp;
}
// copies v[] into vc[]
void copyArray(int v[], int vc[], int n) {
  for (int i=0; i<n; i++)
    vc[i]= v[i];
}
// printing array content
void printArray(int v[], int n) {
  printf("[%d", v[0]);
  for (int i=1; i<n; i++)
    printf(",%d", v[i]);
  printf("]\n");
}

// Sorts v[] in increasing order using selection sort
//
void selectMinSort(int v[], int n) {
  int min;
  
  for (int i= 0; i < n; i++) {
    min= i; 
    for (int j= i+1; j < n; j++) 
      if (v[j] < v[min]) 
        min= j;
    swap(&v[i], &v[min]);
  }
}

// Sorts v[] in increasing order using insertion sort
//
void insertionSort(int v[], int n) {
  int p, x;
    
  for (int i= 1; i < n; i++) {
    x= v[i]; 
    for (p= i; p > 0 && x < v[p-1]; p--) 
      v[p] = v[p-1]; 
    v[p]= x;
  }
}

void bubbleSort3(int v[], int n) {
  int lastj, lastSwap;    // index where last swap occurred 
  bool swaps= true;// indicates if there were swaps
  int i, j;
  
  lastSwap= n-1;
  for (i= 0; i < n-1 && swaps; i++) {
    swaps= false;
    for (j= 0; j < lastSwap; j++) 
      if (v[j] > v[j+1]) { // if not in the right order, swap
	swap(&v[j],&v[j+1]);
        swaps= true;
        lastj= j;       // keep position of last update
      }
    lastSwap= lastj;    // update lastSwap for next iteration
  }
}
