/********************************************************
 Problem: Student stats
 
 Author: Fernando Silva
 Date:   1992 (revised March/2025)
*******************************************************/


#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define NA 30   // Number of students
#define NC 05   // Number of courses

// function prototypes
void generateCourseMarks(int marks[NA][NC]);
void printMatrix(int marks[NA][NC]);
void courseWithBestApprovalRate(int marks[NA][NC]);
void degreeMeanPerStudent(int marks[NA][NC], float means[NA]);
void studentBestMean(float means[NA]);
void studentWithBestMarkAllCourses(int marks[NA][NC]);
void percentStudentsApprovedAtLeastHalfCourses(int marks[NA][NC]);

int main () {
  int marks[NA][NC]= {0};
  float stdMeans[NA]= {0.0};
  
  generateCourseMarks(marks);
  printMatrix(marks);
  courseWithBestApprovalRate(marks);
  degreeMeanPerStudent(marks, stdMeans);
  studentBestMean(stdMeans);
  studentWithBestMarkAllCourses(marks);
  percentStudentsApprovedAtLeastHalfCourses(marks);
}

void generateCourseMarks(int marks[NA][NC]) {
 // Taking current time as seed
  unsigned int seed = time(0);
  
  for (int i=0; i<NA; i++) 
    for (int j=0; j<NC; j++) {
      marks[i][j]= (rand_r(&seed) % 21); // generates random number in range (0,20)
      if (marks[i][j]<10)
	marks[i][j] += (rand_r(&seed) % 11);
    }
}

void printMatrix(int marks[NA][NC]) {
  for (int i=0; i<NA; i++) {
    printf("%2d",marks[i][0]);
    for (int j=1; j<NC; j++)
      printf(" %2d", marks[i][j]);
    printf("\n");
  }
}

// Which was the course with best approval rate (percentage)? Approved means a mark greater or equal 10.
void courseWithBestApprovalRate(int marks[NA][NC]) {
  int bestCourse=0;
  int ctr, maxCtr=0;

  for (int c= 0; c<NC; c++) {
    ctr= 0;
    for (int a= 0; a<NA; a++)
      if (marks[a][c]>=10) ctr++;
    if (ctr>maxCtr) {
      maxCtr= ctr;
      bestCourse= c;
    }
  }
  printf("Course(%d) has the best approval rate which is %.1f\n",bestCourse, ((float) maxCtr/NA)*100);
}

// Determine the current degree mark of each student (i.e. the mean of the approved courses).
void degreeMeanPerStudent(int marks[NA][NC], float means[NA]) {
  int sumMarks, ctrApproved;

  for (int a= 0; a < NA; a++) {
    sumMarks= 0;
    ctrApproved= 0;
    for (int c= 0; c < NC; c++)
      if (marks[a][c] >= 10) {
	sumMarks += marks[a][c];
	ctrApproved++;
      }
    means[a]= (float)sumMarks/ctrApproved;
    printf("Student(%d) current mean is %.2f.\n", a, means[a]);
  }
}

// What is the student with best degree mean at present?
void studentBestMean(float means[NA]) {
  int best= 0;

  for (int i=0; i < NA; i++)
    if (means[i]>means[best])
      best= i;
  printf("Student(%d) has the best mean of %.2f\n", best, means[best]);
}

// Which student has the best mark in all courses? Take first occurrence. What if there are ties?
void studentWithBestMarkAllCourses(int marks[NA][NC]) {
  int bestStudent= 0;
  int bestCourse= 0;

  for (int a= 0; a < NA; a++)
    for (int c= 0; c < NC; c++) {
      if (marks[bestStudent][bestCourse] < marks[a][c]) {
	  bestStudent= a;
	  bestCourse= c;
      }
    }
  printf("Student(%d) has the best mark of %d. It occurred in course(%d)\n", bestStudent, marks[bestStudent][bestCourse], bestCourse);
}

// What is the percentage of students approved at least half of the courses?
// for each student, count the number of approvals. If #approvals is greater than half of the course, it counts to the final total
void percentStudentsApprovedAtLeastHalfCourses(int marks[NA][NC]) {
  int coursesApproved;
  int totalApproved= 0;

  for (int a=0; a < NA; a++) {
    coursesApproved= 0;
    for (int c=0; c < NC; c++)
      if (marks[a][c]>=10)
	coursesApproved++;
    if (coursesApproved >= NC/2)
      totalApproved++;
  }
  printf("Percentage of students approved at least to half of the courses: %.2f\n", ((float)totalApproved/NA)*100);
}
