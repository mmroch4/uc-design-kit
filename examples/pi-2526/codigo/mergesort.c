// -------------------------------------------------
// Programação Imperativa (CC1003)
// Merge Sort and example of use
// Fernando Silva, DCC/FCUP  April 2025
// -------------------------------------------------

#include <stdio.h>
#include <stdlib.h>

void msort(int v[], int left, int right);
void merge(int v[], int left,int middle,int rightEnd);
void printArray(int [], int);

int main() {
  int n;
  scanf("%d",&n); // number of elements
  
  int v[n];
  for (int k=0; k<n; k++) 
    scanf("%d",&v[k]);  // read array elements
  printf("Initial array: ");
  printArray(v,n);
  msort(v, 0, n-1);
  printf("After merge-sort: ");
  printArray(v,n);
}
void printArray(int a[], int n) {
  printf("[%d", a[0]);
  for (int k=1; k<n; k++)
    printf(",%d",a[k]);
  printf("]\n");
}
void msort(int v[], int left, int right) {
  int middle;
  
  if (left<right) {
    middle= (left+right)/2;           // determine middle
    msort(v, left, middle);           // sort left part
    msort(v, middle+1, right);        // sort right part
    merge(v, left, middle+1, right);  // merge both parts
  }
}

void merge(int v[],int left,int middle,int rightEnd) {
  int nv[(rightEnd-left+1)];
  int leftEnd= middle-1;
  int cursorL= left;
  int cursor=  left; // cursor for new array
  int cursorR= middle;
  
  while (cursorL <= leftEnd && cursorR <= rightEnd) {
    if (v[cursorL] < v[cursorR]) {
      nv[cursor]= v[cursorL];
      cursorL++;
    }
    else {
      nv[cursor]= v[cursorR];
      cursorR++;
    }
    cursor++;
  }
  // copy remaining on the right or the left
  while (cursorL<= leftEnd) { 
    nv[cursor]= v[cursorL];
    cursorL++; cursor++;
  }
  while (cursorR<= rightEnd) {
    nv[cursor]= v[cursorR];
    cursorR++; cursor++;
  }
  // copy from nv[] to v[]
  for (cursor=left; cursor<=rightEnd; cursor++)
    v[cursor]= nv[cursor];
}
