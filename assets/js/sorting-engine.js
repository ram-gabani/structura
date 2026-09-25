/**
 * SYLLABUS SORTING LABORATORY ENGINE (PLAIN-ENGLISH REFACTOR)
 * Generates intuitive, human-friendly, step-by-step traces for:
 * 1. Bubble Sort (Comparing neighbors, floating largest items right)
 * 2. Selection Sort (Finding smallest item, locking in front)
 * 3. Insertion Sort (Playing card sorting, shifting bigger cards right)
 * 4. Radix Sort (Grouping digits into 10 buckets from right to left)
 */

export const ALGORITHM_INFO = {
  bubble: {
    name: 'Bubble Sort',
    subtitle: 'Compares neighbors and swaps them until the biggest numbers float to the end.',
    timeBest: 'O(N) (Instant if already sorted)',
    timeAvg: 'O(N²) (Slow on large lists)',
    timeWorst: 'O(N²) (Many swaps needed)',
    space: 'None (In-Place)',
    stable: true,
    stableText: 'Yes (Stable)',
    pointerLabels: { left: 'Left', right: 'Right' },
    description: 'Repeatedly compares pairs of side-by-side numbers. If the left number is bigger than the right one, they trade places. The biggest number gradually floats (bubbles) to the very end on every pass.',
    cCode: [
      'void bubbleSort(int arr[], int n) {',
      '    for (int i = 0; i < n - 1; i++) {',
      '        bool swapped = false; // Check if any trade happened',
      '        for (int j = 0; j < n - i - 1; j++) {',
      '            if (arr[j] > arr[j + 1]) { // If left is bigger',
      '                swap(&arr[j], &arr[j + 1]); // Swap them!',
      '                swapped = true;',
      '            }',
      '        }',
      '        if (!swapped) break; // Already sorted, stop early!',
      '    }',
      '}'
    ]
  },
  selection: {
    name: 'Selection Sort',
    subtitle: 'Finds the smallest number in the list and puts it in the front, one by one.',
    timeBest: 'O(N²) (Always scans the whole list)',
    timeAvg: 'O(N²) (Slow on large lists)',
    timeWorst: 'O(N²) (Always does full search)',
    space: 'None (In-Place)',
    stable: false,
    stableText: 'No (Unstable)',
    pointerLabels: { checking: 'Checking 🔍', smallest: 'Smallest 📍' },
    description: 'Scans the unsorted part of the list to find the absolute smallest number, then brings it directly to the front. Repeats this for every spot until the entire list is in order.',
    cCode: [
      'void selectionSort(int arr[], int n) {',
      '    for (int i = 0; i < n - 1; i++) {',
      '        int minIdx = i; // Assume front item is smallest',
      '        for (int j = i + 1; j < n; j++) {',
      '            if (arr[j] < arr[minIdx]) { // Found a smaller number!',
      '                minIdx = j; // Update smallest candidate',
      '            }',
      '        }',
      '        if (minIdx != i) {',
      '            swap(&arr[i], &arr[minIdx]); // Put smallest in front',
      '        }',
      '    }',
      '}'
    ]
  },
  insertion: {
    name: 'Insertion Sort',
    subtitle: 'Builds a sorted list one item at a time, exactly like sorting playing cards in your hand.',
    timeBest: 'O(N) (Instant if already in order)',
    timeAvg: 'O(N²) (Slow on reverse lists)',
    timeWorst: 'O(N²) (Requires shifting every item)',
    space: 'None (In-Place)',
    stable: true,
    stableText: 'Yes (Stable)',
    pointerLabels: { key: 'Active Card 🃏', shift: 'Shifting ➔' },
    description: 'Takes numbers one at a time, picks them up like a playing card, and slides bigger numbers over to the right until finding the perfect spot to drop the card in.',
    cCode: [
      'void insertionSort(int arr[], int n) {',
      '    for (int i = 1; i < n; i++) {',
      '        int key = arr[i]; // Pick up the card',
      '        int j = i - 1;',
      '        while (j >= 0 && arr[j] > key) {',
      '            arr[j + 1] = arr[j]; // Slide bigger card right',
      '            j = j - 1;',
      '        }',
      '        arr[j + 1] = key; // Drop card into open slot',
      '    }',
      '}'
    ]
  },
  radix: {
    name: 'Radix Sort (LSD)',
    subtitle: 'Sorts numbers without comparing them by grouping digits from right to left (1s ➔ 10s ➔ 100s).',
    timeBest: 'O(d · (N + k)) (Fast & predictable)',
    timeAvg: 'O(d · (N + k)) (Digit-by-digit pass)',
    timeWorst: 'O(d · (N + k)) (Fast on all datasets)',
    space: '10 Buckets Needed',
    stable: true,
    stableText: 'Yes (Stable)',
    pointerLabels: { active: 'Active Number 📦', bucket: 'Target Bucket 🗄️' },
    description: 'Never compares numbers directly! Instead, it groups numbers into 10 buckets (0 to 9) based on their 1s digit, flattens them back out, then repeats for the 10s digit, 100s digit, and so on until fully sorted.',
    cCode: [
      'void countSort(int arr[], int n, int exp) {',
      '    int output[n], count[10] = {0};',
      '    // 1. Group numbers into digit buckets 0-9',
      '    for (int i = 0; i < n; i++)',
      '        count[(arr[i] / exp) % 10]++;',
      '    // 2. Calculate starting spots in output list',
      '    for (int i = 1; i < 10; i++) count[i] += count[i - 1];',
      '    // 3. Place numbers in order (from right to left)',
      '    for (int i = n - 1; i >= 0; i--) {',
      '        int d = (arr[i] / exp) % 10;',
      '        output[--count[d]] = arr[i];',
      '    }',
      '    for (int i = 0; i < n; i++) arr[i] = output[i];',
      '}',
      'void radixSort(int arr[], int n) {',
      '    int m = getMax(arr, n);',
      '    for (int exp = 1; m / exp > 0; exp *= 10)',
      '        countSort(arr, n, exp); // Sort by 1s, 10s, 100s...',
      '}'
    ]
  }
};

/**
 * Step Generator Functions with Plain-English Explanations
 */
export function generateSortingSteps(algoKey, originalArray) {
  const arr = [...originalArray];
  const steps = [];
  let comparisons = 0;
  let swaps = 0;

  // Initial step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    pivot: -1,
    minIdx: -1,
    pointerTags: {},
    sorted: [],
    activeRange: [0, arr.length - 1],
    buckets: Array.from({ length: 10 }, () => []),
    codeLine: 0,
    explanation: `List ready with ${arr.length} numbers. Click "Play" or "Next Step ➔" to watch how ${ALGORITHM_INFO[algoKey].name} sorts them!`,
    comparisons: 0,
    swaps: 0
  });

  if (algoKey === 'bubble') {
    const n = arr.length;
    const sortedIndices = [];

    for (let i = 0; i < n - 1; i++) {
      let swappedInPass = false;
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        pivot: -1,
        minIdx: -1,
        pointerTags: {},
        sorted: [...sortedIndices],
        activeRange: [0, n - i - 1],
        buckets: Array.from({ length: 10 }, () => []),
        codeLine: 1,
        explanation: `Starting Pass #${i + 1}: Floating the biggest remaining number toward the right side.`,
        comparisons,
        swaps
      });

      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        const leftVal = arr[j];
        const rightVal = arr[j + 1];

        if (leftVal > rightVal) {
          steps.push({
            array: [...arr],
            comparing: [j, j + 1],
            swapping: [],
            pivot: -1,
            minIdx: -1,
            pointerTags: { [j]: 'Left', [j + 1]: 'Right' },
            sorted: [...sortedIndices],
            activeRange: [0, n - i - 1],
            buckets: Array.from({ length: 10 }, () => []),
            codeLine: 4,
            explanation: `Comparing ${leftVal} and ${rightVal}. Since ${leftVal} is bigger, swap them so the larger number bubbles to the right.`,
            comparisons,
            swaps
          });

          swaps++;
          swappedInPass = true;
          arr[j] = rightVal;
          arr[j + 1] = leftVal;

          steps.push({
            array: [...arr],
            comparing: [],
            swapping: [j, j + 1],
            pivot: -1,
            minIdx: -1,
            pointerTags: { [j + 1]: 'Moved Right ➔' },
            sorted: [...sortedIndices],
            activeRange: [0, n - i - 1],
            buckets: Array.from({ length: 10 }, () => []),
            codeLine: 5,
            explanation: `Swapped! ${leftVal} moved to spot [${j + 1}] and ${rightVal} moved to spot [${j}].`,
            comparisons,
            swaps
          });
        } else {
          steps.push({
            array: [...arr],
            comparing: [j, j + 1],
            swapping: [],
            pivot: -1,
            minIdx: -1,
            pointerTags: { [j]: 'Left', [j + 1]: 'Right' },
            sorted: [...sortedIndices],
            activeRange: [0, n - i - 1],
            buckets: Array.from({ length: 10 }, () => []),
            codeLine: 4,
            explanation: `Comparing ${leftVal} and ${rightVal}. They are already in the correct order (${leftVal} ≤ ${rightVal}), so no swap needed.`,
            comparisons,
            swaps
          });
        }
      }

      sortedIndices.unshift(n - 1 - i);
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        pivot: -1,
        minIdx: -1,
        pointerTags: { [n - 1 - i]: 'Locked 🔒' },
        sorted: [...sortedIndices],
        activeRange: [0, n - i - 2],
        buckets: Array.from({ length: 10 }, () => []),
        codeLine: 8,
        explanation: `Pass #${i + 1} complete! The largest item (${arr[n - 1 - i]}) is now locked in its final spot at the end of the list.`,
        comparisons,
        swaps
      });

      if (!swappedInPass) {
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [],
          pivot: -1,
          minIdx: -1,
          pointerTags: {},
          sorted: arr.map((_, idx) => idx),
          activeRange: [],
          buckets: Array.from({ length: 10 }, () => []),
          codeLine: 9,
          explanation: `✨ Smart Early Exit: No swaps were needed in this pass! That means the entire list is already fully sorted.`,
          comparisons,
          swaps
        });
        break;
      }
    }
  } else if (algoKey === 'selection') {
    const n = arr.length;
    const sortedIndices = [];

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        pivot: -1,
        minIdx: minIdx,
        pointerTags: { [i]: 'Smallest 📍' },
        sorted: [...sortedIndices],
        activeRange: [i, n - 1],
        buckets: Array.from({ length: 10 }, () => []),
        codeLine: 2,
        explanation: `Pass #${i + 1}: Looking for the smallest number to place at position [${i}]. Starting with ${arr[i]}.`,
        comparisons,
        swaps
      });

      for (let j = i + 1; j < n; j++) {
        comparisons++;
        steps.push({
          array: [...arr],
          comparing: [j, minIdx],
          swapping: [],
          pivot: -1,
          minIdx: minIdx,
          pointerTags: { [j]: 'Checking 🔍', [minIdx]: 'Smallest 📍' },
          sorted: [...sortedIndices],
          activeRange: [i, n - 1],
          buckets: Array.from({ length: 10 }, () => []),
          codeLine: 4,
          explanation: `Scanning position [${j}] (${arr[j]}). Smallest found so far is ${arr[minIdx]} at position [${minIdx}].`,
          comparisons,
          swaps
        });

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          steps.push({
            array: [...arr],
            comparing: [],
            swapping: [],
            pivot: -1,
            minIdx: minIdx,
            pointerTags: { [minIdx]: 'New Smallest ⭐' },
            sorted: [...sortedIndices],
            activeRange: [i, n - 1],
            buckets: Array.from({ length: 10 }, () => []),
            codeLine: 5,
            explanation: `Found an even smaller number! New champion smallest is **${arr[minIdx]}** at position [${minIdx}].`,
            comparisons,
            swaps
          });
        }
      }

      if (minIdx !== i) {
        swaps++;
        const temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;

        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [i, minIdx],
          pivot: -1,
          minIdx: -1,
          pointerTags: { [i]: 'Placed in Front 🏆' },
          sorted: [...sortedIndices],
          activeRange: [i, n - 1],
          buckets: Array.from({ length: 10 }, () => []),
          codeLine: 9,
          explanation: `Swapping the smallest number (${arr[i]}) into its correct permanent position at the front (spot [${i}]).`,
          comparisons,
          swaps
        });
      }

      sortedIndices.push(i);
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        pivot: -1,
        minIdx: -1,
        pointerTags: { [i]: 'Locked 🔒' },
        sorted: [...sortedIndices],
        activeRange: [i + 1, n - 1],
        buckets: Array.from({ length: 10 }, () => []),
        codeLine: 1,
        explanation: `Locked position [${i}] with value ${arr[i]}. The sorted section at the front now has ${sortedIndices.length} items!`,
        comparisons,
        swaps
      });
    }
  } else if (algoKey === 'insertion') {
    const n = arr.length;
    const sortedIndices = [0];

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;

      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        pivot: i,
        minIdx: -1,
        pointerTags: { [i]: 'Active Card 🃏' },
        sorted: [...sortedIndices],
        activeRange: [0, i],
        buckets: Array.from({ length: 10 }, () => []),
        codeLine: 2,
        explanation: `Picking up **${key}** (like a playing card in your hand). Finding where it belongs in our sorted cards on the left.`,
        comparisons,
        swaps
      });

      while (j >= 0) {
        comparisons++;
        steps.push({
          array: [...arr],
          comparing: [j, i],
          swapping: [],
          pivot: i,
          minIdx: -1,
          pointerTags: { [j]: 'Checking Card', [i]: 'Active Card 🃏' },
          sorted: [...sortedIndices],
          activeRange: [0, i],
          buckets: Array.from({ length: 10 }, () => []),
          codeLine: 4,
          explanation: `Checking card ${arr[j]} against our picked card (${key}).`,
          comparisons,
          swaps
        });

        if (arr[j] > key) {
          swaps++;
          arr[j + 1] = arr[j];
          steps.push({
            array: [...arr],
            comparing: [],
            swapping: [j, j + 1],
            pivot: -1,
            minIdx: -1,
            pointerTags: { [j + 1]: 'Slid Right ➔' },
            sorted: [...sortedIndices],
            activeRange: [0, i],
            buckets: Array.from({ length: 10 }, () => []),
            codeLine: 5,
            explanation: `${arr[j]} is bigger than our card (${key}), so sliding ${arr[j]} one spot to the right to make room.`,
            comparisons,
            swaps
          });
          j--;
        } else {
          break;
        }
      }

      arr[j + 1] = key;
      sortedIndices.push(i);

      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [j + 1],
        pivot: -1,
        minIdx: -1,
        pointerTags: { [j + 1]: 'Dropped In 🎯' },
        sorted: [...sortedIndices],
        activeRange: [0, i],
        buckets: Array.from({ length: 10 }, () => []),
        codeLine: 8,
        explanation: `Found the right spot! Dropped **${key}** into slot [${j + 1}]. First ${i + 1} cards are now in perfect order.`,
        comparisons,
        swaps
      });
    }
  } else if (algoKey === 'radix') {
    const maxVal = Math.max(...arr, 0);
    let exp = 1;
    let passNum = 1;

    while (Math.floor(maxVal / exp) > 0) {
      const placeName = exp === 1 ? '1s digit (Units place)' : (exp === 10 ? '10s digit (Tens place)' : '100s digit (Hundreds place)');
      let currentBuckets = Array.from({ length: 10 }, () => []);

      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        pivot: -1,
        minIdx: -1,
        pointerTags: {},
        sorted: [],
        activeRange: [0, arr.length - 1],
        buckets: currentBuckets.map(b => [...b]),
        codeLine: 13,
        explanation: `Pass #${passNum}: Looking at the **${placeName}**. Sorting numbers into Buckets 0 to 9 based on this digit.`,
        comparisons,
        swaps
      });

      // 1. Distribute into 10 Buckets
      for (let i = 0; i < arr.length; i++) {
        comparisons++;
        const digit = Math.floor(arr[i] / exp) % 10;
        currentBuckets[digit].push(arr[i]);

        steps.push({
          array: [...arr],
          comparing: [i],
          swapping: [],
          pivot: i,
          minIdx: -1,
          pointerTags: { [i]: `Digit is ${digit} ➔ Bucket ${digit}` },
          sorted: [],
          activeRange: [0, arr.length - 1],
          buckets: currentBuckets.map(b => [...b]),
          codeLine: 3,
          explanation: `Number **${arr[i]}** has ${placeName} equal to **${digit}** ➔ Grouping into **Bucket ${digit}**.`,
          comparisons,
          swaps
        });
      }

      // 2. Flatten Buckets back into array
      let writeIdx = 0;
      for (let d = 0; d < 10; d++) {
        while (currentBuckets[d].length > 0) {
          swaps++;
          const val = currentBuckets[d].shift();
          arr[writeIdx] = val;

          steps.push({
            array: [...arr],
            comparing: [],
            swapping: [writeIdx],
            pivot: -1,
            minIdx: -1,
            pointerTags: { [writeIdx]: `From Bucket ${d}` },
            sorted: [],
            activeRange: [0, writeIdx],
            buckets: currentBuckets.map(b => [...b]),
            codeLine: 8,
            explanation: `Emptying Bucket ${d}: Took out **${val}** and placed back into the list at position [${writeIdx}].`,
            comparisons,
            swaps
          });
          writeIdx++;
        }
      }

      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        pivot: -1,
        minIdx: -1,
        pointerTags: {},
        sorted: [],
        activeRange: [0, arr.length - 1],
        buckets: Array.from({ length: 10 }, () => []),
        codeLine: 10,
        explanation: `Pass #${passNum} finished! All numbers are now in stable order according to their ${placeName}.`,
        comparisons,
        swaps
      });

      exp *= 10;
      passNum++;
    }
  }

  // Final Complete step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    pivot: -1,
    minIdx: -1,
    pointerTags: {},
    sorted: arr.map((_, i) => i),
    activeRange: [],
    buckets: Array.from({ length: 10 }, () => []),
    codeLine: 0,
    explanation: `🎉 All Done! All ${arr.length} numbers are now sorted from smallest to largest in ${comparisons} checks and ${swaps} moves.`,
    comparisons,
    swaps
  });

  return steps;
}

/**
 * Dataset Preset Generators
 */
export function generateDataset(type, size = 12, isRadix = false) {
  const n = Math.max(5, Math.min(30, size));
  switch (type) {
    case 'nearly-sorted': {
      const base = Array.from({ length: n }, (_, i) => (i + 1) * (isRadix ? 15 : 3) + Math.floor(Math.random() * 5));
      const swaps = Math.max(1, Math.floor(n / 6));
      for (let s = 0; s < swaps; s++) {
        const idx1 = Math.floor(Math.random() * (n - 1));
        const temp = base[idx1];
        base[idx1] = base[idx1 + 1];
        base[idx1 + 1] = temp;
      }
      return base;
    }
    case 'reversed': {
      return Array.from({ length: n }, (_, i) => (n - i) * (isRadix ? 18 : 3) + 12);
    }
    case 'few-unique': {
      const palette = isRadix ? [142, 285, 45, 67, 142, 880] : [12, 28, 45, 67, 88];
      return Array.from({ length: n }, () => palette[Math.floor(Math.random() * palette.length)]);
    }
    case 'random':
    default: {
      const set = new Set();
      while (set.size < n) {
        set.add(isRadix ? (Math.floor(Math.random() * 850) + 10) : (Math.floor(Math.random() * 85) + 10));
      }
      return Array.from(set);
    }
  }
}
