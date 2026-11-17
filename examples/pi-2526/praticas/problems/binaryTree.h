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
   TODO: functions to implement 
   ------------------------------------------------------- */

/* Returns the number of leaf nodes in the tree.
   A leaf is a node with no children. */
int numberLeafs(BTNode *n);
int numberTLeafs(BTree *t);

/* Returns an array (dynamically allocated) with the sum of node
   values at each level. *size is set to the number of levels. */
int *sumLevels(BTNode *n, int *size);
int *sumTLevels(BTree *t, int *size);

#endif /* BINARY_TREE_H */
