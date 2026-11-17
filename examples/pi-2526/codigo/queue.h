// Programação Imperativa (CC1003)
// Header file for Queues based on Singly Linked Lists
// F. Silva DCC/FCUP

#include <stdio.h>
#include <assert.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#define NodeInfo char* // update to the correct type when needed
#define MAXCHARS 30

// Define a node
typedef struct Node {
  NodeInfo val; 
  struct Node *next;
} Node;

// Define the linked list
typedef struct {
  Node *first;
  Node *last;
  int size;
} Queue;

// prototypes
Node *newNode(NodeInfo, Node *next); 
void initQueue(Queue *); 
bool isEmpty(Queue *);
int size(Queue *);
void addLast(Queue *, NodeInfo);
NodeInfo removeFirst(Queue *);
NodeInfo first(Queue *);
void printQueue(Queue *);

