#include <stdio.h>
#include "binaryTree.h"

int main(void) {
  BTree t;
  initTree(&t);

  /* Read n values and insert them into the BST */
  int n;
  scanf("%d", &n);
  for (int i = 0; i < n; i++) {
    int x;
    scanf("%d", &x);
    insertBST(&t, x);
  }

  /* Read q queries and print the balance of each */
  int q;
  scanf("%d", &q);
  for (int i = 0; i < q; i++) {
    int x;
    scanf("%d", &x);
    printf("balance(t, %d) = %d\n", x, treBalance(&t, x));
  }

  freeTree(t.root);
  return 0;
}
