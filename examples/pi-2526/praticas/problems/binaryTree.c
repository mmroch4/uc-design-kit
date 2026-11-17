#include "binaryTree.h"

/* Creates a new node with given value and children */
BTNode *newNode(NodeInfo val, BTNode *l, BTNode *r) {
  BTNode *nnode = malloc(sizeof(BTNode));
  nnode->val   = val;
  nnode->left  = l;
  nnode->right = r;
  return nnode;
}

/* Initialises an empty tree */
void initTree(BTree *t) {
  t->root = NULL;
}

/* Recursively inserts val into a BST subtree rooted at r */
BTNode *addBTNode(BTNode *r, NodeInfo val) {
  if (r == NULL)
    return newNode(val, NULL, NULL);
  if (val <= r->val)
    r->left  = addBTNode(r->left,  val);
  else
    r->right = addBTNode(r->right, val);
  return r;
}

/* Inserts val into the BST t */
void insertBST(BTree *t, NodeInfo val) {
  t->root = addBTNode(t->root, val);
}

/* Reads a single node (and its subtree) from stdin in pre-order.
   Expects integer values; "N" represents a null node. */
BTNode *readNode(void) {
  char buffer[64];
  if (scanf("%63s", buffer) != 1) return NULL;
  if (strcmp(buffer, NULL_SYMBOL) == 0) return NULL;
  NodeInfo val = atoi(buffer);
  BTNode *n = newNode(val, NULL, NULL);
  n->left  = readNode();
  n->right = readNode();
  return n;
}

/* Reads a full tree from stdin */
void readTree(BTree *t) {
  initTree(t);
  t->root = readNode();
}

/* Frees all memory allocated for the subtree rooted at node */
void freeTree(BTNode *node) {
  if (node == NULL) return;
  freeTree(node->left);
  freeTree(node->right);
  free(node);
}

/* Returns the total number of nodes in the subtree rooted at n */
int numberNodes(BTNode *n) {
  if (n == NULL) return 0;
  return 1 + numberNodes(n->left) + numberNodes(n->right);
}

/* Wrapper: total nodes in tree t */
int numberTNodes(BTree *t) {
  return numberNodes(t->root);
}

/* Returns the height of the subtree rooted at n (-1 for empty) */
int height(BTNode *n) {
  if (n == NULL) return -1;
  int lh = height(n->left);
  int rh = height(n->right);
  return 1 + (lh > rh ? lh : rh);
}

/* Wrapper: height of tree t */
int treeHeight(BTree *t) {
  return height(t->root);
}

/* Returns 1 if val exists in the subtree rooted at n, 0 otherwise */
int contains(BTNode *n, NodeInfo val) {
  if (n == NULL)       return 0;
  if (n->val == val)   return 1;
  return contains(n->left, val) || contains(n->right, val);
}

/* Wrapper: search in tree t */
int treeContains(BTree *t, NodeInfo val) {
  return contains(t->root, val);
}

/* Pre-order traversal: root, left, right */
void printPreOrder(BTNode *n) {
  if (n == NULL) return;
  printf(" %d", n->val);
  printPreOrder(n->left);
  printPreOrder(n->right);
}

/* In-order traversal: left, root, right */
void printInOrder(BTNode *n) {
  if (n == NULL) return;
  printInOrder(n->left);
  printf(" %d", n->val);
  printInOrder(n->right);
}

/* Post-order traversal: left, right, root */
void printPostOrder(BTNode *n) {
  if (n == NULL) return;
  printPostOrder(n->left);
  printPostOrder(n->right);
  printf(" %d", n->val);
}
