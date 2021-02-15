#!/usr/bin/env python3
# counting all the lines in the csv files
# the goal is 10K entries
import os
num_lines = 0
for file in os.listdir("."):
    if file.endswith(".csv"):
        for line in open(file, encoding="utf8"):
            if line.strip() == '':
                continue
            num_lines += 1
    num_lines -= 1

if __name__ == "__main__":
    print(f"We are {num_lines/100}% done!")
