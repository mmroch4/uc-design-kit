// -------------------------------------------------
// Programação Imperativa (CC1003)
// Implementation of an array based circular queue
// Fernando Silva, DCC/FCUP
// -------------------------------------------------

#include "circularQueue.h"

// make the queue empty
void empty(Queue *q) {
  q->size= 0;
  q->first= q->last= 0;
}
// verify if queue is empty
bool isEmpty(Queue *q) {
  return (q->size == 0);
}
// verify if stack is full
bool isFull(Queue *q) {
  return (q->size >= MAXNODES); // or (first == last)
}
// insert (enqueue) a new node in last position
void addLast(Queue *q, NodeInfo val) {
  if (isFull(q)) {
    printf("Queue is full\n"); exit(1);
  }
  q->nodes[q->last]= val;
  q->last = (q->last+1)%MAXNODES;
  q->size++;
}
// remove (dequeue) first node from queue
NodeInfo removeFirst(Queue *q) {
  if (isEmpty(q)){
    printf("Stack is Empty\n"); exit(1);
  }
  NodeInfo val= q->nodes[q->first];
  q->size--;
  q->first = (q->first+1)%MAXNODES;
  return val;
}
// inspect first node in the queue
NodeInfo first(Queue *q) {
  if (isEmpty(q)){
    printf("Stack is Empty\n"); exit(1);
  }
  return q->nodes[q->first];
}
