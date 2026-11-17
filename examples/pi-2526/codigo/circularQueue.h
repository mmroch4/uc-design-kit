// -------------------------------------------------
// Programação Imperativa (CC1003)
// Header file for an array based circular queue
// Fernando Silva, DCC/FCUP
// -------------------------------------------------

#include <stdio.h>
#include <assert.h>
#include <stdlib.h>
#include <stdbool.h>

#define MAXNODES 1000

#define NodeInfo int  // adjust to the type of values 

typedef struct {
  int first;
  int last;
  int size;
  NodeInfo nodes[MAXNODES];
} Queue;

// prototypes
void empty(Queue *);
bool isEmpty(Queue *);
bool isFull(Queue *);
int size(Queue *);
void addLast(Queue *, NodeInfo);
NodeInfo removeFirst(Queue *);
NodeInfo first(Queue *);
