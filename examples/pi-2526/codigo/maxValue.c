/********************************************************
 Example of functions to determine the maximum of an 
 unorder sequence and also 
 a function to reverse a sequence

 Author: Fernando Silva
 Date:   March/2025
*******************************************************/

#include <stdio.h>

#define MAX(A,B) ((A >= B) ? A : B)

// swap two values
void swap(int *a, int *b) {
  int tmp= *a;
  *a = *b;
  *b = tmp;
}

// Iterative version to determine largest value of v[]
int maxIt(int v[], int start, int end) {
  int maxSoFar = v[start];
  for (int i= start+1; i <= end; i++)
    if (v[i] > maxSoFar)
      maxSoFar = v[i];
  return maxSoFar;
}

// recursive version 1 to determine largest value of v[]
// maximum = MAX(1st element; maxRec1(remaining elements))
int maxRec1(int v[],int start,int end) {
  int max; 
  if (start == end) 
    return v[start];             // base case
  max= maxRec1(v, start+1, end); // recursive
  return MAX(v[start], max);     // combine
}

// recursive version 2 to determine largest value of v[]
// maximum = MAX(maxRec2(leftPart); maxRec2(rightPart))
int maxRec2(int v[], int start, int end) {
  if (start == end)
    return v[start];                   // base case
  int middle = (start + end) / 2;
  int max1 = maxRec2(v, start, middle);// recursive 
  int max2 = maxRec2(v, middle+1, end);// recursive
  return MAX(max1, max2);              // combine
}

// recursively reversing the elements of an array v[]
void reverseArray(int v[], int start, int end) {
  if (start >= end)
    return;                             // base case
  // still more than one element
  swap(&v[start], &v[end]);
  return reverseArray(v,start+1,end-1); // recurse on the remaining
}

// print array of size n
void printArray(int v[], int n) {
  printf("%d",v[0]);
  for (int i=1; i<n; i++)
    printf(" %d", v[i]);
  printf("\n");
}
// main function to experiment with the above functions

int main() {
  int n;
  scanf("%d", &n);
  int a[n];

  for (int i= 0; i < n; i++) // largest will be the last value
    a[i]= i+1;               // you can read the array from standard-input
                             // to test other sequences
  printf("Original array:\n");
  printArray(a,n);
  printf("Largest: %d -- iterative.\n",maxIt(a, 0, n-1));
  printf("Largest: %d -- recursive 1.\n",maxRec1(a, 0, n-1));
  printf("Largest: %d -- recursive 2.\n",maxRec2(a, 0, n-1));
  reverseArray(a,0,n-1);
  printf("Reversed array:\n");
  printArray(a,n);
}
