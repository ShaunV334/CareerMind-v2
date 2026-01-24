// Sample DSA Questions Seed Data
export const sampleQuestions = [
  // Arrays
  {
    question: "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to the target.",
    category: "Arrays",
    difficulty: "Easy",
    type: "coding",
    tags: ["Arrays", "Hash Table", "Two Pointers"],
    explanation: "Use a hash map to store visited numbers and their indices. For each number, check if (target - number) exists in the map.",
    correctAnswer: "function twoSum(nums, target) { const map = new Map(); for(let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if(map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }",
  },
  {
    question: "Find the maximum product of any contiguous subarray.",
    category: "Arrays",
    difficulty: "Medium",
    type: "coding",
    tags: ["Arrays", "Dynamic Programming"],
    explanation: "Track both max and min product ending at each position. Min is important because negative * negative = positive.",
    correctAnswer: "function maxProduct(nums) { let max = nums[0], min = nums[0], result = nums[0]; for(let i = 1; i < nums.length; i++) { [max, min] = [Math.max(nums[i], max * nums[i], min * nums[i]), Math.min(nums[i], max * nums[i], min * nums[i])]; result = Math.max(result, max); } return result; }",
  },
  {
    question: "Rotate an array to the right by k steps.",
    category: "Arrays",
    difficulty: "Easy",
    type: "coding",
    tags: ["Arrays"],
    explanation: "Reverse the entire array, then reverse the first k elements, then reverse the remaining elements.",
    correctAnswer: "function rotate(nums, k) { k = k % nums.length; nums.reverse(); nums.splice(0, k).reverse().reverse(); }",
  },

  // Linked Lists
  {
    question: "Reverse a singly linked list.",
    category: "Linked Lists",
    difficulty: "Easy",
    type: "coding",
    tags: ["Linked Lists"],
    explanation: "Use three pointers: previous, current, and next. Iterate through the list, reversing the direction of pointers.",
    correctAnswer: "function reverseList(head) { let prev = null, current = head; while(current) { const next = current.next; current.next = prev; prev = current; current = next; } return prev; }",
  },
  {
    question: "Detect if a linked list has a cycle.",
    category: "Linked Lists",
    difficulty: "Easy",
    type: "coding",
    tags: ["Linked Lists", "Two Pointers"],
    explanation: "Use Floyd's cycle detection algorithm with slow and fast pointers. If they meet, there's a cycle.",
    correctAnswer: "function hasCycle(head) { let slow = head, fast = head; while(fast && fast.next) { slow = slow.next; fast = fast.next.next; if(slow === fast) return true; } return false; }",
  },
  {
    question: "Merge two sorted linked lists.",
    category: "Linked Lists",
    difficulty: "Easy",
    type: "coding",
    tags: ["Linked Lists"],
    explanation: "Create a dummy node and compare values from both lists, appending the smaller value each time.",
    correctAnswer: "function mergeTwoLists(l1, l2) { const dummy = new ListNode(0); let current = dummy; while(l1 && l2) { if(l1.val < l2.val) { current.next = l1; l1 = l1.next; } else { current.next = l2; l2 = l2.next; } current = current.next; } current.next = l1 || l2; return dummy.next; }",
  },

  // Binary Trees
  {
    question: "Find the maximum depth of a binary tree.",
    category: "Binary Trees",
    difficulty: "Easy",
    type: "coding",
    tags: ["Binary Trees", "DFS", "Recursion"],
    explanation: "Recursively find the maximum depth of left and right subtrees and return the maximum + 1.",
    correctAnswer: "function maxDepth(root) { if(!root) return 0; return 1 + Math.max(maxDepth(root.left), maxDepth(root.right)); }",
  },
  {
    question: "Level order traversal (BFS) of a binary tree.",
    category: "Binary Trees",
    difficulty: "Medium",
    type: "coding",
    tags: ["Binary Trees", "BFS", "Queue"],
    explanation: "Use a queue to process nodes level by level. Add children to queue for next level processing.",
    correctAnswer: "function levelOrder(root) { if(!root) return []; const result = []; const queue = [root]; while(queue.length) { const level = []; const size = queue.length; for(let i = 0; i < size; i++) { const node = queue.shift(); level.push(node.val); if(node.left) queue.push(node.left); if(node.right) queue.push(node.right); } result.push(level); } return result; }",
  },
  {
    question: "Validate a binary search tree.",
    category: "Binary Trees",
    difficulty: "Medium",
    type: "coding",
    tags: ["Binary Trees", "DFS"],
    explanation: "Use DFS and track min/max bounds. Each left subtree must be less than parent, right subtree greater.",
    correctAnswer: "function isValidBST(root, min = -Infinity, max = Infinity) { if(!root) return true; if(root.val <= min || root.val >= max) return false; return isValidBST(root.left, min, root.val) && isValidBST(root.right, root.val, max); }",
  },

  // Strings
  {
    question: "Check if a string is a palindrome (ignoring spaces and punctuation).",
    category: "Strings",
    difficulty: "Easy",
    type: "coding",
    tags: ["Strings", "Two Pointers"],
    explanation: "Remove non-alphanumeric characters, convert to lowercase, and check if it reads the same forwards and backwards.",
    correctAnswer: "function isPalindrome(s) { const cleaned = s.replace(/[^a-z0-9]/gi, '').toLowerCase(); return cleaned === cleaned.split('').reverse().join(''); }",
  },
  {
    question: "Find the longest substring without repeating characters.",
    category: "Strings",
    difficulty: "Medium",
    type: "coding",
    tags: ["Strings", "Sliding Window", "Hash Map"],
    explanation: "Use a sliding window with a set to track characters. Expand window when character is new, shrink when duplicate found.",
    correctAnswer: "function lengthOfLongestSubstring(s) { const charIndex = {}; let maxLen = 0, start = 0; for(let i = 0; i < s.length; i++) { if(s[i] in charIndex) start = Math.max(start, charIndex[s[i]] + 1); charIndex[s[i]] = i; maxLen = Math.max(maxLen, i - start + 1); } return maxLen; }",
  },

  // Sorting & Searching
  {
    question: "Implement binary search on a sorted array.",
    category: "Searching",
    difficulty: "Easy",
    type: "coding",
    tags: ["Binary Search", "Arrays"],
    explanation: "Use two pointers (left and right) and divide the search space in half each iteration.",
    correctAnswer: "function binarySearch(nums, target) { let left = 0, right = nums.length - 1; while(left <= right) { const mid = Math.floor((left + right) / 2); if(nums[mid] === target) return mid; nums[mid] < target ? left = mid + 1 : right = mid - 1; } return -1; }",
  },
  {
    question: "Merge sort implementation.",
    category: "Sorting",
    difficulty: "Medium",
    type: "coding",
    tags: ["Sorting", "Divide and Conquer"],
    explanation: "Divide array in half recursively, then merge sorted halves by comparing elements.",
    correctAnswer: "function mergeSort(arr) { if(arr.length <= 1) return arr; const mid = Math.floor(arr.length / 2); const left = mergeSort(arr.slice(0, mid)); const right = mergeSort(arr.slice(mid)); return merge(left, right); } function merge(l, r) { const result = []; let i = 0, j = 0; while(i < l.length && j < r.length) result.push(l[i] < r[j] ? l[i++] : r[j++]); return [...result, ...l.slice(i), ...r.slice(j)]; }",
  },

  // Dynamic Programming
  {
    question: "Solve the climbing stairs problem (how many ways to climb n stairs if you can take 1 or 2 steps at a time).",
    category: "Dynamic Programming",
    difficulty: "Easy",
    type: "coding",
    tags: ["Dynamic Programming", "Recursion"],
    explanation: "This is a Fibonacci problem. To reach stair n, you can come from stair n-1 or n-2.",
    correctAnswer: "function climbStairs(n) { if(n <= 1) return 1; const dp = [1, 1]; for(let i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2]; return dp[n]; }",
  },
  {
    question: "Find the minimum cost to climb stairs (each step has a cost).",
    category: "Dynamic Programming",
    difficulty: "Easy",
    type: "coding",
    tags: ["Dynamic Programming"],
    explanation: "Use DP where dp[i] = minimum cost to reach step i = cost[i] + min(dp[i-1], dp[i-2]).",
    correctAnswer: "function minCostClimbingStairs(cost) { const dp = [...cost]; for(let i = 2; i < cost.length; i++) dp[i] = cost[i] + Math.min(dp[i-1], dp[i-2]); return Math.min(dp[dp.length-1], dp[dp.length-2]); }",
  },
  {
    question: "Longest increasing subsequence.",
    category: "Dynamic Programming",
    difficulty: "Medium",
    type: "coding",
    tags: ["Dynamic Programming"],
    explanation: "For each element, track the longest increasing subsequence ending at that element.",
    correctAnswer: "function lengthOfLIS(nums) { const dp = Array(nums.length).fill(1); for(let i = 1; i < nums.length; i++) { for(let j = 0; j < i; j++) { if(nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1); } } return Math.max(...dp); }",
  },

  // Graph
  {
    question: "Implement depth-first search (DFS) for a graph.",
    category: "Graphs",
    difficulty: "Medium",
    type: "coding",
    tags: ["Graphs", "DFS"],
    explanation: "Use a stack or recursion to explore as far as possible along each branch before backtracking.",
    correctAnswer: "function dfs(graph, node, visited = new Set()) { if(visited.has(node)) return; visited.add(node); console.log(node); for(const neighbor of graph[node]) dfs(graph, neighbor, visited); return visited; }",
  },
  {
    question: "Implement breadth-first search (BFS) for a graph.",
    category: "Graphs",
    difficulty: "Medium",
    type: "coding",
    tags: ["Graphs", "BFS", "Queue"],
    explanation: "Use a queue to explore all neighbors at current depth before moving to next depth level.",
    correctAnswer: "function bfs(graph, start) { const visited = new Set([start]); const queue = [start]; while(queue.length) { const node = queue.shift(); console.log(node); for(const neighbor of graph[node]) { if(!visited.has(neighbor)) { visited.add(neighbor); queue.push(neighbor); } } } }",
  },

  // Hash Tables
  {
    question: "Group anagrams together.",
    category: "Hash Tables",
    difficulty: "Medium",
    type: "coding",
    tags: ["Hash Tables", "Sorting"],
    explanation: "Sort characters in each word. Words with same sorted characters are anagrams. Use map to group.",
    correctAnswer: "function groupAnagrams(strs) { const map = new Map(); for(const str of strs) { const sorted = str.split('').sort().join(''); if(!map.has(sorted)) map.set(sorted, []); map.get(sorted).push(str); } return Array.from(map.values()); }",
  },
  {
    question: "Find the first unique character in a string.",
    category: "Hash Tables",
    difficulty: "Easy",
    type: "coding",
    tags: ["Hash Tables", "Strings"],
    explanation: "Count character frequencies, then find first character with frequency 1.",
    correctAnswer: "function firstUniqChar(s) { const count = {}; for(const c of s) count[c] = (count[c] || 0) + 1; for(let i = 0; i < s.length; i++) if(count[s[i]] === 1) return i; return -1; }",
  },

  // Stacks & Queues
  {
    question: "Evaluate reverse polish notation (RPN).",
    category: "Stacks",
    difficulty: "Medium",
    type: "coding",
    tags: ["Stacks"],
    explanation: "Use a stack. For operands, push to stack. For operators, pop two operands, compute, and push result.",
    correctAnswer: "function evalRPN(tokens) { const stack = []; for(const t of tokens) { if(['+', '-', '*', '/'].includes(t)) { const b = stack.pop(), a = stack.pop(); const ops = {'+': a+b, '-': a-b, '*': a*b, '/': Math.trunc(a/b)}; stack.push(ops[t]); } else stack.push(parseInt(t)); } return stack[0]; }",
  },
]

export const sampleQuestionsWithoutAnswers = sampleQuestions.map(q => ({
  ...q,
  correctAnswer: undefined,
}))
