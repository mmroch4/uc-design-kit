# Introduction to Programming 2025/2026 (CC1024)
# Pedro Ribeiro (DCC/FCUP)
# [IP060] Experimental Stability 
# Example code to measure execution time growth of a naive solution to 

import random, time

# ------------------------------------------------------------

# generate a random list of n integers in the range [a,b]
def random_list(n, a, b):
    lst = []
    for _ in range(n):
        lst.append(random.randint(a,b))
    return lst

# ------------------------------------------------------------

# Run the following experiment:
# - Let's use n to denote the size of the list
# - Begin with n=start, and continue until n<=end, each time multiplying n by two
# - Call the stable function with k = len(list)/2 and measure time taken
# - Report the (processor) time taken and how much did it grow compared to last time
def experiment(start, end, mult):
    n = start
    while n<=end:
        lst = random_list(n, -10**5, 10**5)
        t1 = time.process_time()
        best = stable(n//2, lst)
        t2 = time.process_time()
        cur_time = t2 - t1
        if n == start: ratio = 0
        else: ratio = cur_time / last_time 
        print(f"n = {n}, time = {cur_time:.3f}s {ratio:.2f}x")
        n *= mult
        last_time = cur_time

# ------------------------------------------------------------
        
# Our naive solution for the problem
def stable(k, lst):
    best = 0
    for i in range(len(lst) - k + 1):
        count = 0
        for v in lst[i: i+k]:
            if v > 0:
                count += 1
        best = max(best, count)
    return best

# ------------------------------------------------------------
# "Main" code

# Measure times for random lists starting with n=100
# Continue multiplying n by 2 while n<=100000
experiment(100, 100000, 2)

