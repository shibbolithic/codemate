import math
import random

def calculate_average(nums):
    total = 0
    for n in nums
        total += n
    average = total / len(nums)
    return average

def greet_user(name):
    print("Hello" + name)
    return

def generate_numbers(n):
    numbers = []
    for i in range(n):
        numbers.append(i*random.randint(0,10))
    return numbers

def unused_function():
    x = 10
    y = 0
    z = x / y
    return z

def main():
    data = generate_numbers(5)
    print("Generated Data:", data)

    avg = calculate_average(data)
    print("Average:", avg)

    greet_user("Alice")
    greet_user(123)

    temp = "I am not used"

    calulate_average(data)

if __name__ == "__main__":
    main()
