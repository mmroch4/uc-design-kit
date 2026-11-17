
#include "binaryTree.h"

int main() {
    BTree tree;
    initTree(&tree);

    insertBST(&tree, 5);
    insertBST(&tree, 3);
    insertBST(&tree, 8);
    insertBST(&tree, 1);
    insertBST(&tree, 4);

    printf("In-order traversal: \n");
    printInorder(&tree);
    printf("\nTotal nodes: %d\n", treeNodes(&tree));

    freeTree(&tree);
    return 0;
}
