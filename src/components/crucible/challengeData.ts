import type { Challenge } from '../../lib/challenges'

// Static Crucible challenges mirroring PracticeArena IDs (presentation only — no backend writes)
export const CRUCIBLE_CHALLENGES: Record<string, Challenge> = {
  'reverse-string': {
    id: 'reverse-string',
    title: 'Reverse the String',
    slug: 'reverse-string',
    description: 'Write a function that reverses a string without using built-in reverse methods.',
    difficulty: 'Beginner',
    category: 'Strings',
    language: 'python',
    starter_code: `def reverse_string(s: str) -> str:
    # Write your solution here
    pass

# Test your solution
print(reverse_string("hello"))  # Expected: "olleh"
print(reverse_string("world"))  # Expected: "dlrow"
`,
    instructions: `**The Trial:** Forge a function that reverses a string.

You may NOT use Python's built-in \`[::-1]\` slice or \`reversed()\` function.

**Constraints:**
- The input string can contain letters, numbers, and symbols.
- Return the reversed string as output.

**Example:**
- Input: \`"hello"\` → Output: \`"olleh"\`
- Input: \`"CodeCity"\` → Output: \`"ytiCedoC"\``,
    sample_input: `olleh
dlrow`,
    hints: [
      'Think about iterating through the string backwards using a loop.',
      'You can build the result character by character into a new string.',
      'Consider using Python\'s range() with a negative step: range(len(s)-1, -1, -1)',
    ],
    xp_reward: 75,
    is_published: true,
    created_at: new Date().toISOString(),
    solution_explanation: 'Iterate through the string from last index to first, appending each character to a new string. Time complexity O(n).',
    solution_code: `def reverse_string(s: str) -> str:
    result = ""
    for i in range(len(s) - 1, -1, -1):
        result += s[i]
    return result`,
  },
  'fizz-buzz': {
    id: 'fizz-buzz',
    title: 'Fizz Buzz',
    slug: 'fizz-buzz',
    description: 'Print numbers 1 to n. For multiples of 3 print Fizz, for 5 print Buzz, for both print FizzBuzz.',
    difficulty: 'Beginner',
    category: 'Loops',
    language: 'python',
    starter_code: `def fizz_buzz(n: int) -> None:
    # Write your loop here
    pass

fizz_buzz(15)
`,
    instructions: `**The Trial:** The ancient Fizz Buzz challenge.

For each number from 1 to n:
- If divisible by **3**, print \`"Fizz"\`
- If divisible by **5**, print \`"Buzz"\`
- If divisible by **both**, print \`"FizzBuzz"\`
- Otherwise, print the number

**Example (n=5):**
\`\`\`
1
2
Fizz
4
Buzz
\`\`\``,
    sample_input: `1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz`,
    hints: [
      'Use the modulo operator `%` to check divisibility.',
      'Check for FizzBuzz (divisible by both) BEFORE checking for Fizz or Buzz individually.',
      'Use a for loop with range(1, n+1) to iterate from 1 to n inclusive.',
    ],
    xp_reward: 75,
    is_published: true,
    created_at: new Date().toISOString(),
    solution_explanation: 'Check divisibility by 15 first (both 3 and 5), then by 3, then by 5, then print the number.',
    solution_code: `def fizz_buzz(n: int) -> None:
    for i in range(1, n + 1):
        if i % 15 == 0:
            print("FizzBuzz")
        elif i % 3 == 0:
            print("Fizz")
        elif i % 5 == 0:
            print("Buzz")
        else:
            print(i)`,
  },
  'climb-stairs': {
    id: 'climb-stairs',
    title: 'Climb the Stairs',
    slug: 'climb-stairs',
    description: 'Count the distinct ways to climb n stairs, taking 1 or 2 steps at a time.',
    difficulty: 'Intermediate',
    category: 'Dynamic Programming',
    language: 'python',
    starter_code: `def climb_stairs(n: int) -> int:
    # Write your solution here
    pass

print(climb_stairs(2))   # Expected: 2
print(climb_stairs(3))   # Expected: 3
print(climb_stairs(5))   # Expected: 8
`,
    instructions: `**The Trial:** You are climbing a staircase.

Each time you can either climb **1** or **2** steps.

How many distinct ways can you climb to the top?

**Examples:**
- n = 2: Two ways: [1,1] or [2]
- n = 3: Three ways: [1,1,1], [1,2], [2,1]`,
    sample_input: `2
3
8`,
    hints: [
      'This follows the Fibonacci sequence pattern.',
      'The number of ways to reach step n is the sum of ways to reach step n-1 and n-2.',
      'Use dynamic programming with a simple loop instead of recursion to avoid stack overflow.',
    ],
    xp_reward: 125,
    is_published: true,
    created_at: new Date().toISOString(),
    solution_explanation: 'Classic Fibonacci DP: ways(n) = ways(n-1) + ways(n-2), base cases ways(1)=1, ways(2)=2.',
    solution_code: `def climb_stairs(n: int) -> int:
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b`,
  },
  'two-sum': {
    id: 'two-sum',
    title: 'Two Sum',
    slug: 'two-sum',
    description: 'Find two numbers in the array that add up to the target.',
    difficulty: 'Intermediate',
    category: 'Arrays',
    language: 'python',
    starter_code: `def two_sum(nums: list, target: int) -> list:
    # Write your solution here
    pass

print(two_sum([2, 7, 11, 15], 9))   # Expected: [0, 1]
print(two_sum([3, 2, 4], 6))         # Expected: [1, 2]
`,
    instructions: `**The Trial:** Given an array of integers and a target, return the **indices** of the two numbers that add up to the target.

**Constraints:**
- Each input has exactly one solution.
- You may not use the same element twice.
- Return indices in ascending order.`,
    sample_input: `[0, 1]
[1, 2]`,
    hints: [
      'A brute-force solution with two nested loops works but is O(n²).',
      'For O(n), use a hash map (dictionary) to store numbers you\'ve seen and their indices.',
      'For each number x, check if (target - x) is already in your dictionary.',
    ],
    xp_reward: 125,
    is_published: true,
    created_at: new Date().toISOString(),
    solution_explanation: 'Use a hash map to store each number\'s index. For each element, check if the complement (target - num) exists in the map.',
    solution_code: `def two_sum(nums: list, target: int) -> list:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return sorted([seen[complement], i])
        seen[num] = i
    return []`,
  },
}

export function getCrucibleChallenge(id: string): Challenge | null {
  return CRUCIBLE_CHALLENGES[id] ?? null
}
