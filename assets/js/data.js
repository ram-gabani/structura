/**
 * ARRAY MASTER — CLASSROOM DATASET
 * Storage Lockers Analogy, Line-by-Line C Code Annotations, Dual Videos & Quiz
 */

export const arrayData = {
  title: 'Array Data Structure & C Memory Architecture',
  tag: 'Beginner-Friendly Classroom Guide',
  badge: 'Elementary & Systems DSA',

  analogy: {
    title: 'The Row of Numbered Storage Lockers',
    tagline: 'A physical mental model for understanding memory addresses, zero-based indexing, and algorithmic shifts.',
    description: 'Imagine walking down a school hallway where 10 storage lockers are bolted directly side-by-side in an unbroken row, numbered from 0 to 9.',
    points: [
      {
        lockerTerm: 'Locker Number [0, 1, 2...]',
        arrayTerm: 'Array Index (i)',
        explanation: 'Every locker has an engraved number starting at 0. You use this number to directly identify the slot.'
      },
      {
        lockerTerm: 'Item Inside the Locker',
        arrayTerm: 'Element Value (arr[i])',
        explanation: 'The actual book, backpack, or integer stored inside the locker compartment.'
      },
      {
        lockerTerm: 'Hallway Floor Location',
        arrayTerm: 'Physical RAM Address (0x2000)',
        explanation: 'The exact physical tile in the hallway where the locker is installed.'
      },
      {
        lockerTerm: 'Identical Locker Width',
        arrayTerm: 'Data Type Size (sizeof(int) = 4B)',
        explanation: 'Every locker is manufactured to the exact same width, ensuring predictable equidistant spacing.'
      },
      {
        lockerTerm: 'Walking Directly to Locker #4',
        arrayTerm: 'Random Access (O(1))',
        explanation: 'You do not inspect lockers 0, 1, 2, and 3 first. You multiply locker width by 4 and step directly to locker 4 in 1 step.'
      },
      {
        lockerTerm: 'Sliding Lockers to Insert a New One',
        arrayTerm: 'Insertion Rightward Shift (O(n))',
        explanation: 'To fit a new locker into slot 2, every locker from 2 to 9 must be unbolted and slid down the hallway by one space.'
      }
    ]
  },

  tutorials: {
    englishMaster: {
      id: 'c-master-array-en',
      youtubeId: 'CBYHwZcbD-s',
      title: 'Arrays in C — Memory Layout & Pointer Math',
      channel: 'Portfolio Courses',
      creatorBio: 'Systems programming instructor focusing on low-level C memory models.',
      language: 'English',
      durationFormatted: '45m',
      publishedYear: 2022,
      synopsis: 'Deep-dive walkthrough of contiguous physical RAM addresses in VS Code debugger, showing why array indexing is equivalent to pointer arithmetic *(arr + i).',
      cCoreConcepts: [
        'Contiguous RAM indexing: *(arr + i)',
        'Dynamic arrays with malloc() and realloc()',
        '2D array row-major byte offsets'
      ],
      keyTakeaways: [
        'Contiguous RAM layout enables O(1) random access',
        'Address formula: Address(A[i]) = Base + (i * sizeof(type))',
        'Dynamic arrays double capacity on the heap via realloc()'
      ]
    },

    hindiMaster: {
      id: 'c-master-array-hi',
      youtubeId: 'AT14lCXuMKI',
      title: '1.1 Arrays in C — Memory Calculation & 2D Matrices',
      channel: "Jenny's Lectures CS IT",
      creatorBio: 'Acclaimed university CS faculty teaching Data Structures and Core C in Hindi.',
      language: 'Hindi',
      durationFormatted: '18m',
      publishedYear: 2021,
      synopsis: 'Exhaustive whiteboard breakdown calculating exact physical RAM byte addresses for 1D arrays and multi-dimensional matrices in Hindi.',
      cCoreConcepts: [
        'Physical RAM allocation and byte calculations',
        '1D and 2D Array address formulas',
        'Static array traversal in standard C'
      ],
      keyTakeaways: [
        'Continuous memory allocation maximizes CPU cache hits',
        'Address(A[i]) = Base_Address + (index * sizeof(type))',
        'Array name is an immutable pointer constant to &A[0]'
      ]
    }
  },

  complexityTable: [
    { op: 'Access by Index (arr[i])', time: 'O(1)', space: 'O(1)', status: 'green', desc: 'Direct base address offset calculation in 1 CPU cycle.' },
    { op: 'Update by Index (arr[i] = x)', time: 'O(1)', space: 'O(1)', status: 'green', desc: 'Direct memory register overwrite.' },
    { op: 'Linear Search', time: 'O(n)', space: 'O(1)', status: 'rose', desc: 'Worst-case requires inspecting all n items from index 0.' },
    { op: 'Binary Search (Sorted)', time: 'O(log n)', space: 'O(1)', status: 'amber', desc: 'Halves the search boundary at each step.' },
    { op: 'Insertion (at index k)', time: 'O(n)', space: 'O(1)', status: 'rose', desc: 'Requires shifting (n - k) elements to the right.' },
    { op: 'Deletion (at index k)', time: 'O(n)', space: 'O(1)', status: 'rose', desc: 'Requires shifting (n - k - 1) elements to the left.' }
  ],

  quizQuestions: [
    {
      id: 1,
      question: 'In the Storage Locker analogy, why is accessing locker #4 considered constant time O(1)?',
      options: [
        'Because you must open every locker from #0 to #3 first.',
        'Because you compute the exact floor distance (Base + 4 × Locker_Width) and walk straight to it in 1 step.',
        'Because locker #4 is always placed at the beginning of the hallway.',
        'Because the hallway uses a GPS sensor.'
      ],
      correctIndex: 1,
      explanation: 'Constant time O(1) means direct arithmetic offset calculation. The CPU multiplies index 4 by element byte size to jump straight to the address without scanning preceding elements.'
    },
    {
      id: 2,
      question: 'Given an array with base address `2000` and `sizeof(int) = 4` bytes, what is the memory address of `arr[3]`?',
      options: [
        '2003',
        '2008',
        '2012',
        '2016'
      ],
      correctIndex: 2,
      explanation: 'Using the formula Address(arr[3]) = 2000 + (3 × 4) = 2000 + 12 = 2012.'
    },
    {
      id: 3,
      question: 'Why does inserting a new item into locker #2 of a full 10-locker row require O(n) time?',
      options: [
        'Because the computer has to restart.',
        'Because all items from locker #2 to #9 must be shifted one position to the right to create an empty slot.',
        'Because lockers must be re-alphabetized.',
        'Because arrays only allow adding items to the front.'
      ],
      correctIndex: 1,
      explanation: 'Arrays must remain strictly contiguous with no gaps. Inserting at index 2 requires shifting all subsequent elements right.'
    },
    {
      id: 4,
      question: 'In C, what is the relationship between `arr[i]` and `*(arr + i)`?',
      options: [
        'They are completely unrelated operations.',
        'arr[i] is just syntactic shorthand that the compiler translates directly into pointer math *(arr + i).',
        'arr[i] is 100 times slower than pointer arithmetic.',
        '*(arr + i) is only valid in C++, not in standard C.'
      ],
      correctIndex: 1,
      explanation: 'Array subscripting arr[i] in C is syntactic sugar for pointer arithmetic and dereferencing *(arr + i).'
    }
  ]
};
