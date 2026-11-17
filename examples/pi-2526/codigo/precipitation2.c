/********************************************************
 Problem: Precipitation matrix

 Author: Fernando Silva
 Date:   1992 (revised March/2025)
*******************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define NDAYS 15    // num of days, normally 365
#define NLOCS 7     // num of stations, normally 200
#define MAXPREC 240 // mm per day

// global vars


//function prototypes
void annualRain(int p[NDAYS][NLOCS], int station);
void annualAvgRain(int p[NDAYS][NLOCS], int station);
void stationHighestRain(int p[NDAYS][NLOCS], int day);
void stationHighestRainOverYear(int p[NDAYS][NLOCS]);
void stationWithMostNrDaysNoRain(int p[NDAYS][NLOCS]);
void largestSequenceDaysWithNorain(int p[NDAYS][NLOCS], int loc);
  
                   /* Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec */
int monthlengths[] = {0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};

int isleap(int year) {
    return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
}
/* return total days from January up to the end of the given date */
int monthcount(int year, int month, int day) {
    int ndays = day;
    for(int i = 1; i < month; i++)
        ndays += monthlengths[i];
    if(isleap(year) && month > 2)
        ndays++;
    return ndays;
}

void printMatrix(int p[NDAYS][NLOCS]) {
  for (int i=0; i<NDAYS; i++) {
    printf("%3d",p[i][0]);
    for (int j=1; j<NLOCS; j++)
      printf(" %3d", p[i][j]);
    printf("\n");
  }
}

int main () {
  int p[NDAYS][NLOCS]= {0};
  // Taking current time as seed
  unsigned int seed = time(0);
  
  for (int i=0; i<NDAYS; i++) 
    for (int j=0; j<NLOCS; j++) 
      p[i][j]= rand_r(&seed) % MAXPREC; // generat random number in range (0,MAXPREC-1)
  // make sure we have some zeros
  for (int i=0; i<NDAYS*NLOCS*0.4; i++) {
    int s= rand_r(&seed) % NDAYS;
    int l= rand_r(&seed) % NLOCS;
    p[s][l]= 0;
  }
  printf("Precipitation matrix:\n");
  printMatrix(p);
  // what is the annual rainfall (total) at station 53?
  // printf("Annual rainfall at station 53: %d\n",annualRain(52));
  annualRain(p,3);
  // what is the mean annual rainfall in station 53?
  // printf("Mean Annual rainfall at station 53: %f\n",annualAvgRain(52));
  annualAvgRain(p,3);
  // annual rainfall at each station
  // for (int l=0; l<NLOCS; l++)
  //  printf("Annual rainfall at each station %d: %d\n",l,annualRain(l));
  // What is the station that recorded the highest rainfall on the 5th of april 2024
  // printf("Station with highest recorded rainfall is %d\n", stationHighestRain(monthcount(2024, 4, 5)));
  stationHighestRain(p, monthcount(2024, 1, 5));
  // Which local had more rain over a year and how much?
  stationHighestRainOverYear(p);
  // Station that recorded the highest number of days without rain
  stationWithMostNrDaysNoRain(p);
  // What was the largest sequence of days with no rain and in which station
  largestSequenceDaysWithNorain(p, 4);
}

// determines the total annual rain in mm at a given station
void annualRain(int p[NDAYS][NLOCS], int station) {
  int sum=0;
  for (int i; i<NDAYS; i++)
    sum += p[i][station];
  printf("Station(%d) total annual rainfall: %d mm\n", station, sum);
}
// determines the average daily rain over a year at a given station
void annualAvgRain(int p[NDAYS][NLOCS],int station) {
  double sum=0.0;
  for (int i; i<NDAYS; i++)
    sum += p[i][station];
  printf("Station(%d) mean annual rainfall: %.2f mm\n", station, sum/NDAYS);
}
// determines the station with highest rainfall in a given day of the year
void stationHighestRain(int p[NDAYS][NLOCS], int day) {
  int stmax= 0, max= p[day][0];

  for(int s=0; s<NLOCS; s++)
    if (p[day][s] > max) {
      max= p[day][s];
      stmax= s;
    }
  printf("Station(%d) had the highest rainfall, %d mm, on day %d\n",stmax, max, day+1);
}
// Station that recorded most rain over a year
void stationHighestRainOverYear(int p[NDAYS][NLOCS]) {
  int stmax=0;
  int smax= 0, sum;
  
  for(int s=0; s<NLOCS; s++) {
    sum= 0;
    for (int d=0; d<NDAYS; d++)  // determine rainfall for station s
      sum += p[d][s];
    if (sum > smax) {
      smax= sum;       // if a new max found, save it
      stmax= s;        // also save the station where it occurs
    }
  }
  printf("Station(%d) had the highest rainfall over a year: %d mm.\n", stmax, smax);
}
// Station that recorded the highest number of days without rain
void stationWithMostNrDaysNoRain(int p[NDAYS][NLOCS]) {
  // for each station, count the number of days with no rain
  // determine the largest of those counts
  int dwr, maxDwr, stMaxDwr;
  int d, s;

  maxDwr=stMaxDwr= 0;
  for (s= 0; s<NLOCS; s++) {
    dwr= 0;
    for (d= 0; d<NDAYS; d++) {
      if (p[d][s]==0)
	dwr++;
    }
    if (dwr>maxDwr) {
      maxDwr= dwr;
      stMaxDwr= s;
    }
  }
  printf("Station(%d) had %d days with no rain (the highest recording)\n", stMaxDwr, maxDwr);
}
// Determine the largest sequence of days with no rain and in which station it happened
void largestSequenceDaysWithNorain(int p[NDAYS][NLOCS],int loc) {
  int seq;    // counter for sequence of days
  int maxSeq; // value of the largest sequence
  int day;

  day=maxSeq= 0;
  while (day<NDAYS) {
    seq= 0;
    while (p[day][loc]==0 && day<NDAYS) {
      seq++;
      day++;
    }
    if (seq>maxSeq)
      maxSeq= seq;
    day++;
  }
  printf("Station(%d) had %d consecutive days with no rain (largest recording)\n",loc, maxSeq);
} 
