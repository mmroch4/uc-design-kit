// -------------------------------------------------
// Programação Imperativa (CC1003)
// Header file for an array basedstack
// Fernando Silva, DCC/FCUP
// -------------------------------------------------

#include <stdio.h>
#include <assert.h>
#include <stdlib.h>
#include <stdbool.h>

#define MAXNODES 1000

#define NodeInfo int  // adjust depending on the type of values

typedef struct {
  int top;
  NodeInfo nodes[MAXNODES];
} Stack;

// interface functions 
void empty(Stack *s);
bool isEmpty(Stack *s);
bool isFull(STACK *s);
void push(Stack *s, NodeInfo val);
NodeInfo pop(Stack *s);
NodeInfo top(Stack *s);
