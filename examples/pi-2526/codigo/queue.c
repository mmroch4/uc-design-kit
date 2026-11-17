// Programação Imperativa (CC1003)
// Implementação de Queues com listas ligadas
// F. Silva Maio 2025

#include "queue.h"

// initializes a new node
Node *newNode(NodeInfo val, Node *next) {
  Node *nnode= malloc(sizeof(Node)); // alocate memory for new node
  nnode->val= val;
  nnode->next= next;
  return nnode;
}
// inititializes queue as empty
void initQueue(Queue *q) {
  q->size= 0;
  q->first= NULL;
  q->last= NULL;
}
// verify if queue is empty
bool isEmpty(Queue *q) {
  return (q->size == 0); // or first==null
}
// return size of queue
int size(Queue *q) {
  return q->size;
}
// remove first node from queue
NodeInfo removeFirst(Queue *q) {
  if (isEmpty(q))
    return NULL;
  Node *tmp= q->first;
  NodeInfo removedVal= tmp->val;
  q->first= tmp->next;
  if (q->first==NULL) q->last=NULL; // reset last if queue becomes empty
  free(tmp);
  q->size--;
  return removedVal;
}

// add new node at the end of the queue
void addLast(Queue *q, NodeInfo v) {
  Node *nnode = newNode(v, NULL);

  if (isEmpty(q)) { //queue is empty? nnode becomes the first and last
    q->first = nnode;
    q->last = nnode;
  } else { // add after last
    q->last->next = nnode;
    q->last= nnode;
  }
  q->size++;
}
// inspect first node from queue
// at call queue must ensure it is not empty
NodeInfo first(Queue *q) {
  return q->first->val;
}

void printQueue(Queue *q) {
  Node *curr= q->first;

  printf("{");
  while (curr != NULL) {
    printf("%s",curr->val);  // depends on NodeInfo type
    curr= curr->next;
    if (curr!=NULL) printf(",");
  }
  printf("}");
}
