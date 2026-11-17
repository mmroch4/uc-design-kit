# [IP097] Stranger Cells
# Example skeleton code for student
# (exemplifying the usage of global variables)

# read the input and change the following global variables
# - r: integer rule
# - k: number of iterations
# - line: the initial generation
def read():
    global r, k, line
    # TO DO
    pass

# return a list of the 8 bits of rule r
def rule_to_8bits(r):
    # TO DO
    pass

# return the number that represented a triplet (string of 3 chars)
def str_to_number(triplet):
    # TO DO
    pass

# return a new character (# or .) according to the current triplet
# - rules: the set of rules as a list of 8 bits
# - triplet: a string with 3 chars - LEFT CENTER RIGHT
def calculate(rule, triplet):    
    # TO DO
    pass

# generate and return a new line:
# - rules: the set of rules as a list of 8 bits
# - line: the current line from which to generate the next one
def create(rule, line):
    # TO DO
    pass

# simulate the game
# cycle trough the number of generations and for each one:
# - create the new generation (calling create)
# - update and print the current line
def simulate():
    # TO DO
    pass

# Main code: read the input and the simulate the automaton
read()
simulate()
