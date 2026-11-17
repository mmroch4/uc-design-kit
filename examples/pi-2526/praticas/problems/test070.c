#include <stdio.h>
#include "binaryTree.h"

int main(void) {
  int n;
  scanf("%d", &n);

  for (int i = 0; i < n; i++) {
    BTree t;
    readTree(&t);
    printf("numberLeafs(t) = %d\n", numberTLeafs(&t));
    freeTree(t.root);
  }

  return 0;
}
