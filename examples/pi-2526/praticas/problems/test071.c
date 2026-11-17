#include <stdio.h>
#include <stdlib.h>
#include "binaryTree.h"

int main(void) {
  int n;
  scanf("%d", &n);

  for (int i = 0; i < n; i++) {
    BTree t;
    readTree(&t);

    int size = 0;
    int *sums = sumTLevels(&t, &size);

    printf("sumLevels(t) = {");
    for (int j = 0; j < size; j++) {
      if (j > 0) printf(",");
      printf("%d", sums[j]);
    }
    printf("}\n");

    free(sums);
    freeTree(t.root);
  }

  return 0;
}
