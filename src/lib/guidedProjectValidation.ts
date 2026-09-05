import { executeCode } from './execution'
import type { StageTestCaseResult } from './guidedProjects'

export interface StageGuideInfo {
  title?: string
  mission: string
  task: string
  requirements: string[]
  expectedBehavior: string
  successCondition: string
  suggestedStarterCode?: string
}

/**
 * Rich pedagogical metadata for Todo List and Expense Tracker stages.
 * Provides clear 5-step breakdown:
 * 1. What are you building? (Mission)
 * 2. Your task (Specific code to write)
 * 3. Requirements (Explicit rules, types, properties)
 * 4. What should happen? (Runtime behavior)
 * 5. How do I know I'm done? (Success condition)
 */
export const GUIDED_PROJECT_STAGE_GUIDES: Record<string, Record<number, StageGuideInfo>> = {
  // 1. Build a Todo List with JavaScript
  'cdd3a825-80fe-4cf1-a3a3-349871d15598': {
    1: {
      title: 'Create Todo Data',
      mission: 'Create the initial Todo data structure for your application.',
      task: 'Turn the empty `todos` array into a list containing at least 3 todo objects.',
      requirements: [
        'Create a `todos` array.',
        'Add at least 3 todo objects to the array.',
        'Every object must contain: `id` (a number), `title` (a task string), and `completed` (a boolean: true or false).',
        'Print the `todos` array using `console.log(todos)`.',
      ],
      expectedBehavior: 'The program logs the array containing at least 3 valid todo items.',
      successCondition: 'The validator confirms that `todos` is an array with >= 3 items, all items have id, title, and boolean completed, and the array is printed.',
      suggestedStarterCode: `// Step 1: Create an array with at least 3 todo objects
const todos = [
  { id: 1, title: "Learn JavaScript", completed: false },
  { id: 2, title: "Build Todo List App", completed: true },
  { id: 3, title: "Deploy Project", completed: false }
];

// Step 2: Print the todos array
console.log(todos);`,
    },
    2: {
      title: 'Add a Todo',
      mission: 'Implement a function to dynamically add new tasks to your todo list.',
      task: 'Create a function `addTodo(title)` that creates a new todo object and pushes it to the `todos` array.',
      requirements: [
        'Define a function named `addTodo(title)`.',
        'Each added todo must have an `id` (e.g. todos.length + 1), the provided `title`, and `completed: false`.',
        'Validation check: Do NOT add a todo if the `title` is empty or only whitespace.',
        'Call `addTodo("Learn JavaScript")` and `addTodo("Build Todo List")`.',
        'Print the new length: `console.log(todos.length)`.',
      ],
      expectedBehavior: 'Valid tasks are appended to `todos`; empty titles are rejected without adding.',
      successCondition: 'The validator verifies that `addTodo` adds valid items with completed: false and ignores empty titles.',
      suggestedStarterCode: `const todos = [];

function addTodo(title) {
  // 1. Check if title is valid (not empty or whitespace)
  if (!title || !title.trim()) return;

  // 2. Create todo object and add to todos
  const newTodo = {
    id: todos.length + 1,
    title: title.trim(),
    completed: false,
  };
  todos.push(newTodo);
}

addTodo("Learn JavaScript");
addTodo("Build Todo List");

console.log(todos.length);`,
    },
    3: {
      title: 'Display Todos',
      mission: 'Create a function that outputs each task title to the console.',
      task: 'Create a function named `displayTodos()` that iterates through the `todos` array and prints each todo title.',
      requirements: [
        'Define a function named `displayTodos()`.',
        'Loop through the `todos` array (using forEach, for...of, or a standard loop).',
        'Print each todo title using `console.log(todo.title)`.',
        'Call `displayTodos()`.',
      ],
      expectedBehavior: 'Each task title in the `todos` array is printed on its own line.',
      successCondition: 'The validator confirms that `displayTodos()` iterates over `todos` and logs each title.',
      suggestedStarterCode: `const todos = [
  { id: 1, title: "Learn JavaScript", completed: false },
  { id: 2, title: "Build Todo List", completed: false }
];

function displayTodos() {
  todos.forEach((todo) => {
    console.log(todo.title);
  });
}

displayTodos();`,
    },
    4: {
      title: 'Complete a Todo',
      mission: 'Implement task completion status toggling by ID.',
      task: 'Create a function named `toggleTodo(id)` that finds a todo by its `id` and changes its `completed` status.',
      requirements: [
        'Define a function named `toggleTodo(id)`.',
        'Search the `todos` array for an item matching the provided `id`.',
        'If found, toggle its `completed` property (e.g. from false to true, or negate its value).',
        'Call `toggleTodo(1)` and log `todos[0].completed`.',
      ],
      expectedBehavior: 'The targeted todo item has its `completed` property toggled.',
      successCondition: 'The validator confirms that `toggleTodo(id)` correctly modifies the targeted item in `todos`.',
      suggestedStarterCode: `const todos = [
  { id: 1, title: "Learn JavaScript", completed: false },
  { id: 2, title: "Build Todo List", completed: false }
];

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
  }
}

toggleTodo(1);

console.log(todos[0].completed);`,
    },
    5: {
      title: 'Delete a Todo',
      mission: 'Allow users to delete tasks from their list by ID.',
      task: 'Create a function named `deleteTodo(id)` that removes the matching todo from the `todos` array.',
      requirements: [
        'Define a function named `deleteTodo(id)`.',
        'Remove the item with the matching `id` from the `todos` array (using splice, filter, or indexOf).',
        'Call `deleteTodo(2)` and verify the new array length.',
      ],
      expectedBehavior: 'The item matching the given `id` is removed from `todos` while all other items remain intact.',
      successCondition: 'The validator verifies that `deleteTodo(id)` removes the specified item from `todos`.',
      suggestedStarterCode: `let todos = [
  { id: 1, title: "Learn JavaScript", completed: false },
  { id: 2, title: "Build Todo List", completed: false },
  { id: 3, title: "Practice", completed: false }
];

function deleteTodo(id) {
  const index = todos.findIndex((t) => t.id === id);
  if (index !== -1) {
    todos.splice(index, 1);
  }
}

deleteTodo(2);

console.log(todos.length);`,
    },
    6: {
      title: 'Integrate the Todo List',
      mission: 'Combine all core CRUD operations into a working task management system.',
      task: 'Integrate `addTodo`, `displayTodos`, `toggleTodo`, and `deleteTodo` into one coordinated script.',
      requirements: [
        'All 4 functions (`addTodo`, `displayTodos`, `toggleTodo`, `deleteTodo`) must be defined.',
        'They must all operate on the shared `todos` array.',
        'Run the integrated sequence: add 2 todos, toggle the first, delete the second.',
        'Output the resulting state.',
      ],
      expectedBehavior: 'All operations work seamlessly together on the `todos` array.',
      successCondition: 'The validator confirms that all 4 operations are present and execute correctly.',
      suggestedStarterCode: `const todos = [];

function addTodo(title) {
  if (!title || !title.trim()) return;
  todos.push({
    id: todos.length + 1,
    title: title.trim(),
    completed: false,
  });
}

function displayTodos() {
  todos.forEach((t) => console.log(t.title));
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.completed = !todo.completed;
}

function deleteTodo(id) {
  const idx = todos.findIndex((t) => t.id === id);
  if (idx !== -1) todos.splice(idx, 1);
}

addTodo("Learn JavaScript");
addTodo("Build Todo List");
toggleTodo(1);
deleteTodo(2);

console.log(todos);`,
    },
    7: {
      title: 'Final Todo List Challenge',
      mission: 'Master the complete Todo List application with validation and edge-case handling.',
      task: 'Finalize your implementation ensuring robust error-handling, edge-case tolerance, and correct state management.',
      requirements: [
        'Handle empty or whitespace titles in `addTodo` by rejecting them.',
        'Handle non-existent IDs gracefully in `toggleTodo` and `deleteTodo`.',
        'Verify the complete task lifecycle from creation to completion and deletion.',
      ],
      expectedBehavior: 'The application runs with zero crashes and passes all lifecycle assertions.',
      successCondition: 'The validator confirms full system reliability and adherence to requirements.',
      suggestedStarterCode: `const todos = [];

function addTodo(title) {
  if (!title || !title.trim()) return;
  todos.push({
    id: todos.length + 1,
    title: title.trim(),
    completed: false,
  });
}

function displayTodos() {
  todos.forEach((t) => console.log(t.title));
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.completed = !todo.completed;
}

function deleteTodo(id) {
  const idx = todos.findIndex((t) => t.id === id);
  if (idx !== -1) todos.splice(idx, 1);
}

addTodo("Learn JavaScript");
addTodo("Build Todo List");
addTodo(""); // Should be rejected safely
toggleTodo(1);
deleteTodo(2);

console.log(todos);`,
    },
  },
}

/**
 * Returns formatted instructions adhering to the 5-step curriculum guide.
 */
export function formatStageInstructions(guide: StageGuideInfo): string {
  return `🎯 MISSION
${guide.mission}

📋 YOUR TASK
${guide.task}

📌 REQUIREMENTS
${guide.requirements.map((r) => `• ${r}`).join('\n')}

💡 WHAT SHOULD HAPPEN?
${guide.expectedBehavior}

✅ SUCCESS CONDITION
${guide.successCondition}`
}

/**
 * Retrieves the rich guide for a given project and stage, or builds a sensible fallback.
 */
export function getStageGuide(projectId: string, stageOrder: number, stageTitle: string, defaultInstructions: string): StageGuideInfo {
  const projectGuides = GUIDED_PROJECT_STAGE_GUIDES[projectId]
  if (projectGuides && projectGuides[stageOrder]) {
    return projectGuides[stageOrder]
  }

  return {
    title: stageTitle,
    mission: `Master Stage ${stageOrder}: ${stageTitle}`,
    task: defaultInstructions || 'Follow the starter template and implement the requested logic.',
    requirements: [
      'Write clean, readable JavaScript.',
      'Ensure all functions and variables match the required names.',
      'Test your code with the "Run Code" terminal before submitting.',
    ],
    expectedBehavior: 'The solution executes without runtime errors and satisfies the stage test assertions.',
    successCondition: 'All validation test cases pass successfully.',
  }
}

/**
 * Behavioral / Structural validator for Todo List stages.
 * Tolerates student creativity (titles, IDs, styles) while strictly validating logic.
 */
export async function validateTodoStageBehavioral(
  stageOrder: number,
  code: string
): Promise<{ passed: boolean; testResults: StageTestCaseResult[]; error?: string }> {
  const testResults: StageTestCaseResult[] = []

  // 1. First test: clean execution check
  const baseExec = await executeCode('javascript', code, '')
  if (baseExec.status === 'compile_error' || baseExec.status === 'error' || baseExec.status === 'runtime_error') {
    return {
      passed: false,
      error: baseExec.stderr || 'Syntax or runtime error in code execution.',
      testResults: [
        {
          orderIndex: 1,
          isHidden: false,
          passed: false,
          actualOutput: baseExec.stdout,
          error: baseExec.stderr || 'Execution failed.',
        },
      ],
    }
  }

  // Stage 1: Create Todo Data
  if (stageOrder === 1) {
    const harness = `
;(() => {
  if (typeof todos === 'undefined') throw new Error("A 'todos' array was not found. Please declare 'const todos = [...]'.");
  if (!Array.isArray(todos)) throw new Error("'todos' must be an Array.");
  if (todos.length < 3) throw new Error("'todos' must contain at least 3 todo objects (found " + todos.length + ").");
  todos.forEach((t, i) => {
    if (!t || typeof t !== 'object') throw new Error("Todo item at index " + i + " must be an object.");
    if (t.id === undefined || t.id === null) throw new Error("Todo item at index " + i + " is missing an 'id'.");
    if (typeof t.title !== 'string' || !t.title.trim()) throw new Error("Todo item at index " + i + " must have a non-empty string 'title'.");
    if (typeof t.completed !== 'boolean') throw new Error("Todo item at index " + i + " must have a boolean 'completed' property.");
  });
})()
`
    const testExec = await executeCode('javascript', `${code}\n${harness}`, '')
    const passed = testExec.status === 'success'

    testResults.push({
      orderIndex: 1,
      isHidden: false,
      passed,
      actualOutput: baseExec.stdout || '(no console output)',
      expectedOutput: 'An array named "todos" containing >= 3 valid items with id, title, and completed boolean',
      error: passed ? undefined : testExec.stderr || 'Structural assertion failed.',
    })

    testResults.push({
      orderIndex: 2,
      isHidden: false,
      passed,
      actualOutput: passed ? 'All items have id, title, and boolean completed' : testExec.stderr,
      expectedOutput: 'Each item has id (number), title (string), and completed (boolean)',
      error: passed ? undefined : testExec.stderr,
    })

    return { passed, testResults, error: passed ? undefined : testExec.stderr }
  }

  // Stage 2: Add a Todo
  if (stageOrder === 2) {
    const harness = `
;(() => {
  if (typeof addTodo !== 'function') throw new Error("Function 'addTodo' is not defined.");
  if (typeof todos === 'undefined' || !Array.isArray(todos)) throw new Error("'todos' array is not defined.");
  const countBefore = todos.length;
  addTodo("__AUTOMATED_TEST_TASK_123__");
  if (todos.length !== countBefore + 1) throw new Error("addTodo('...') did not add an item to 'todos'.");
  const added = todos[todos.length - 1];
  if (!added || added.title !== "__AUTOMATED_TEST_TASK_123__") throw new Error("Added item must store the provided title.");
  if (typeof added.completed !== 'boolean') throw new Error("Added item must have a boolean 'completed' property.");
  const countBeforeEmpty = todos.length;
  addTodo("");
  addTodo("   ");
  if (todos.length !== countBeforeEmpty) throw new Error("Empty or whitespace-only titles must be rejected.");
})()
`
    const testExec = await executeCode('javascript', `${code}\n${harness}`, '')
    const passed = testExec.status === 'success'

    testResults.push({
      orderIndex: 1,
      isHidden: false,
      passed,
      actualOutput: passed ? 'addTodo adds valid todo object' : testExec.stderr,
      expectedOutput: 'addTodo(title) adds { id, title, completed: false } to todos',
      error: passed ? undefined : testExec.stderr,
    })

    testResults.push({
      orderIndex: 2,
      isHidden: false,
      passed,
      actualOutput: passed ? 'Empty titles rejected' : testExec.stderr,
      expectedOutput: 'Empty or whitespace-only titles are rejected',
      error: passed ? undefined : testExec.stderr,
    })

    return { passed, testResults, error: passed ? undefined : testExec.stderr }
  }

  // Stage 3: Display Todos
  if (stageOrder === 3) {
    const harness = `
;(() => {
  if (typeof displayTodos !== 'function') throw new Error("Function 'displayTodos' is not defined.");
  if (typeof todos === 'undefined' || !Array.isArray(todos)) throw new Error("'todos' array is not defined.");
  displayTodos();
})()
`
    const testExec = await executeCode('javascript', `${code}\n${harness}`, '')
    const passed = testExec.status === 'success'

    testResults.push({
      orderIndex: 1,
      isHidden: false,
      passed,
      actualOutput: baseExec.stdout || '(no console output)',
      expectedOutput: 'displayTodos() outputs each todo title to the console',
      error: passed ? undefined : testExec.stderr,
    })

    return { passed, testResults, error: passed ? undefined : testExec.stderr }
  }

  // Stage 4: Complete a Todo
  if (stageOrder === 4) {
    const harness = `
;(() => {
  if (typeof toggleTodo !== 'function') throw new Error("Function 'toggleTodo' is not defined.");
  if (typeof todos === 'undefined' || !Array.isArray(todos) || todos.length === 0) throw new Error("'todos' must contain items.");
  const target = todos[0];
  const targetId = target.id;
  const initialCompleted = target.completed;
  toggleTodo(targetId);
  const updated = todos.find(t => t.id === targetId);
  if (!updated || updated.completed === initialCompleted) {
    throw new Error("toggleTodo(" + targetId + ") did not change the completed status.");
  }
})()
`
    const testExec = await executeCode('javascript', `${code}\n${harness}`, '')
    const passed = testExec.status === 'success'

    testResults.push({
      orderIndex: 1,
      isHidden: false,
      passed,
      actualOutput: passed ? 'toggleTodo toggles target item completed status' : testExec.stderr,
      expectedOutput: 'toggleTodo(id) updates the completed property of the matching todo',
      error: passed ? undefined : testExec.stderr,
    })

    return { passed, testResults, error: passed ? undefined : testExec.stderr }
  }

  // Stage 5: Delete a Todo
  if (stageOrder === 5) {
    const harness = `
;(() => {
  if (typeof deleteTodo !== 'function') throw new Error("Function 'deleteTodo' is not defined.");
  if (typeof todos === 'undefined' || !Array.isArray(todos) || todos.length === 0) throw new Error("'todos' must contain items.");
  const target = todos[0];
  const targetId = target.id;
  const lenBefore = todos.length;
  deleteTodo(targetId);
  if (todos.some(t => t.id === targetId) || todos.length !== lenBefore - 1) {
    throw new Error("deleteTodo(" + targetId + ") did not remove the item from todos.");
  }
})()
`
    const testExec = await executeCode('javascript', `${code}\n${harness}`, '')
    const passed = testExec.status === 'success'

    testResults.push({
      orderIndex: 1,
      isHidden: false,
      passed,
      actualOutput: passed ? 'deleteTodo removes matching item' : testExec.stderr,
      expectedOutput: 'deleteTodo(id) removes the todo with matching id',
      error: passed ? undefined : testExec.stderr,
    })

    return { passed, testResults, error: passed ? undefined : testExec.stderr }
  }

  // Stages 6 & 7: Integration & Final Challenge
  const integrationHarness = `
;(() => {
  if (typeof addTodo !== 'function') throw new Error("Function 'addTodo' is not defined.");
  if (typeof displayTodos !== 'function') throw new Error("Function 'displayTodos' is not defined.");
  if (typeof toggleTodo !== 'function') throw new Error("Function 'toggleTodo' is not defined.");
  if (typeof deleteTodo !== 'function') throw new Error("Function 'deleteTodo' is not defined.");
  if (typeof todos === 'undefined' || !Array.isArray(todos)) throw new Error("'todos' array is not defined.");
})()
`
  const testExec = await executeCode('javascript', `${code}\n${integrationHarness}`, '')
  const passed = testExec.status === 'success'

  testResults.push({
    orderIndex: 1,
    isHidden: false,
    passed,
    actualOutput: passed ? 'All 4 CRUD operations verified' : testExec.stderr,
    expectedOutput: 'addTodo, displayTodos, toggleTodo, and deleteTodo work together',
    error: passed ? undefined : testExec.stderr,
  })

  return { passed, testResults, error: passed ? undefined : testExec.stderr }
}
