#ifndef BINARY_TREE_H
#define BINARY_TREE_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define NodeInfo int
#define NULL_SYMBOL "N"

/* -------------------------------------------------------
   Data structures
   ------------------------------------------------------- */

typedef struct BTNode {
  NodeInfo val;
  struct BTNode *left;
  struct BTNode *right;
} BTNode;

typedef struct {
  BTNode *root;
} BTree;

/* -------------------------------------------------------
   Function declarations
   ------------------------------------------------------- */

/* Node creation */
BTNode *newNode(NodeInfo val, BTNode *l, BTNode *r);

/* Tree initialisation */
void initTree(BTree *t);

/* BST insertion */
BTNode *addBTNode(BTNode *r, NodeInfo val);
void insertBST(BTree *t, NodeInfo val);

/* Read a tree from stdin in pre-order ("N" = null node) */
BTNode *readNode(void);
void readTree(BTree *t);

/* Memory management */
void freeTree(BTNode *node);

/* Tree properties */
int numberNodes(BTNode *n);
int numberTNodes(BTree *t);
int height(BTNode *n);
int treeHeight(BTree *t);

/* Traversals (print to stdout) */
void printPreOrder(BTNode *n);
void printInOrder(BTNode *n);
void printPostOrder(BTNode *n);

/* Search */
int contains(BTNode *n, NodeInfo val);
int treeContains(BTree *t, NodeInfo val);

/* -------------------------------------------------------
   TODO: functions to implement (submitted by the student)
   ------------------------------------------------------- */

/* Finds and returns the node with value val in the BST rooted at n.
   Returns NULL if not found. */
BTNode *findNode(BTNode *n, NodeInfo val);

/* Returns the balance of the node containing val:
     balance = height(right subtree) - height(left subtree)
   Returns 0 if val is not in the tree. */
int nodeBalance(BTNode *n, NodeInfo val);
int treBalance(BTree *t, NodeInfo val);

#endif /* BINARY_TREE_H */
