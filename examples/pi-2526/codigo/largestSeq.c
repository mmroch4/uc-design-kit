/********************************************************
 Problem: Determine the two largest values of a sequence
 Goal: no pointers yet; process sequence as you input it

 Author: Fernando Silva
 Date: February/2025
*******************************************************/

#include <stdio.h>

int main() {
  int n, i, tmp, big1, big2;

    // ler o número n
    scanf("%d", &n);

    if (n<2)
      printf("sequência com menos de 2 elementos\n");
    else {
      // read the first 2 values
      scanf("%d %d",&big1, &big2);
      if (big2>big1) {
	tmp=big1;
	big1= big2;
	big2= tmp;
      }
      i=2;
      while (i<n) {  // read remaining, one at a time
	scanf("%d",&tmp);
	if (tmp>big1) {
	  big2= big1;
	  big1= tmp;
	}
	else if (tmp>big2) {
	  big2=tmp;
	}
	i++;
      }
    }
    printf("Largest1= %d, Largest2=%d\n", big1, big2);
    return 0;
}
