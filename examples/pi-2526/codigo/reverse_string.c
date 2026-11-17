#include <stdio.h>

#define MAX_SIZE 1000              // maximun size

/* Function that calculates the length of a string*/
unsigned length(char str[]);

/* Function that reverses a string. */
void reverse(char str[]);

int main() {
  char text[MAX_SIZE];

  fgets(text, MAX_SIZE, stdin);    // reads a string
  printf("\n\nOriginal text: ");
  puts(text);                      // prints the original string
  reverse(text);                   // reverse the string
  printf("Reverse text: ");
  puts(text);                      // prints the reversed string

  return 0;
}

unsigned length(char str[]) {
  unsigned i = 0;

  while (str[i] != '\0') i++;

  return i;
}

void reverse(char str[]){
  int i = 0;
  int j = length(str) - 1;

  while(i < j) {
    char ch = str[i];
    str[i] = str[j];
    str[j] = ch;
    i++;
    j--;
  }
}
