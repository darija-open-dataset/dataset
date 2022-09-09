#!/usr/bin/env python3
# Needs to be updated to support folders
# counting all the lines in the csv files
import os
num_lines = 0
for file in os.listdir("."):
    if file.endswith(".csv"):
        for line in open(file, encoding="utf8"):
            if line.strip() == '':
                continue
            num_lines += 1
    # remove first & last lines
    num_lines -= 2

if __name__ == "__main__":
    print(f"The dataset contains {num_lines} entries!")
