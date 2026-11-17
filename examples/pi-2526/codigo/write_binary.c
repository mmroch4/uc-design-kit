#include <stdio.h>
#define NUM_BITS 32   /* defines macro to maximum number of bits */

int main() {
  unsigned n, size = 0, bits[NUM_BITS] = {0};
  printf("Enter a positive number:\n");
  scanf("%u", &n);  

  while (n > 0) {     /* compute the binary digits */
    bits[size] = n%2;
    n = n/2;
    size++;
  }

  printf("Binary representation:\n");
  while (size > 0) {  /* print in reverse order */
    size--;
    printf("%u", bits[size]);
  }
  putchar('\n');
  return 0;
}
