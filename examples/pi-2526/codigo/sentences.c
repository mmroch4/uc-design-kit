//-----------------------------------------------------------
// Program: Read a sentence from standard input ended by '*'
//          ignore non alphanumeric chars
//          count how many words wee read
//          count number of words with 5 or more letters
//          count number of occurrences of letter 'e' or 'E'
//          output the sentence read
// Date:    April 2025 (reviewed)
// Author:  Fernando Silva
//------------------------------------------------------------
//
// Libraries 
//
#include <stdio.h>
#include <ctype.h>
//
// Defining constanes
//
#define TERMINATOR   '*'  // char indicating end of line and input
#define SPACE        ' '  // char space                     
#define MANYLETTERS  5  
// 
// Macros:
//
#define LetterE(C)     (C == 'e') || (C == 'E')
//
// Prototype functions
//
void writeInitialMessage();
void writeCounters();
void initCounters();
void ignoreSpacesAndNonLetters(); 
void readAndProcessLine();
void readAndProcessWord();
//
// Global vars
//
char inChar; // next char being processed
int wordCtr, // counter of words read
   word5Ctr, // counter of words with 5 or more letters
       eCtr; // counter of occurrences of e or E
//
// Main: where all starts
//
int main() {
  writeInitialMessage();
  initCounters();
  readAndProcessLine();
  writeCounters();
}
//
void writeInitialMessage() {
  printf("PROGRAM SENTENCES\n");
  printf("Write a sequence of words ended by `*'\n\n");
}
//
// init counters
void initCounters() {
  wordCtr= 0;
  word5Ctr= 0;
  eCtr= 0;
}
//
//
void readAndProcessLine() {
 ignoreSpacesAndNonLetters();
 while (inChar != TERMINATOR) {
   readAndProcessWord();
   if (inChar == SPACE) {
     printf(" ");
     ignoreSpacesAndNonLetters();
   }
 }
}
//
// ignoreSpacesAndNonLetters: ignores next group of spaces and non-letters
// terminates when it reads char TERMINATOR or a letter.
//
void ignoreSpacesAndNonLetters() {
  while ((inChar= getchar()) != TERMINATOR && !isalpha(inChar)) ;
}
//
// readAndProcessWord: reads and writes a sequence of chars (a word) 
// ignores non-alpha chars
// updates counters 
// ends when it reads a SPACE or a TERMINATOR char
// 
void readAndProcessWord() {
  int lettersCtr= 0; // counts number of leters of the word being read

  /* 1. handle first letter */
  printf("%c", inChar);
  lettersCtr++;
  if (LetterE(inChar))
    eCtr++;
  
  // 2. handle remaining chars of word
  while ((inChar= getchar()) != TERMINATOR && inChar != SPACE) 
    if (isalpha(inChar)) {
      printf("%c",inChar);
      lettersCtr++;
      if (LetterE(inChar))
	eCtr++;
    }

  // 3. update counters
  wordCtr++;
  if (lettersCtr >= MANYLETTERS)
    word5Ctr++;
}
//
void writeCounters() {
  if (wordCtr == 0)
    printf("\n\n Empty line.\n");
  else {
    printf("\n\n#words: %d\n", wordCtr);
    printf("#words with 5 or more letters: %d\n", word5Ctr);
    printf("#occurrences of letter `e' ou `E': %d\n", eCtr);
  }
}
