#include <stdio.h>

int main() {
  int digit, digit_rept[10] = {0};
  long n;
  printf("Enter a integer number:\n");
  scanf("%ld", &n);

  while (n > 0) {
    digit = n % 10;
    if (digit_rept[digit])
      break;
    digit_rept[digit] = 1;
    n /= 10;
  }

  if (n > 0) printf("Repeated digit!\n");
  else printf("No repeated digit!\n");
  return 0;
}
