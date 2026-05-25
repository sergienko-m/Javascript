// ============================================================
// Практична робота 8 — Варіант 1
// Data Transformation Library
// Функції вищого порядку, композиція, каррінг, мемоізація
// ============================================================

// ─── 1. Власні реалізації map, filter, reduce ────────────────

/**
 * map — застосовує функцію до кожного елемента
 * Чиста функція: не змінює оригінальний масив
 */
const myMap = (fn) => (arr) => {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i, arr));
  }
  return result;
};

/**
 * filter — повертає елементи що задовольняють умову
 * Чиста функція: не змінює оригінальний масив
 */
const myFilter = (fn) => (arr) => {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (fn(arr[i], i, arr)) result.push(arr[i]);
  }
  return result;
};

/**
 * reduce — згортає масив до одного значення
 * Чиста функція: не змінює оригінальний масив
 */
const myReduce = (fn, initial) => (arr) => {
  let acc = initial;
  let startIdx = 0;
  if (acc === undefined) { acc = arr[0]; startIdx = 1; }
  for (let i = startIdx; i < arr.length; i++) {
    acc = fn(acc, arr[i], i, arr);
  }
  return acc;
};

/**
 * forEach — виконує функцію для кожного елемента (побічний ефект)
 */
const myForEach = (fn) => (arr) => {
  for (let i = 0; i < arr.length; i++) fn(arr[i], i, arr);
};

/**
 * find — повертає перший елемент що задовольняє умову
 */
const myFind = (fn) => (arr) => {
  for (let i = 0; i < arr.length; i++) {
    if (fn(arr[i], i, arr)) return arr[i];
  }
  return undefined;
};

/**
 * some — true якщо хоча б один елемент задовольняє умову
 */
const mySome = (fn) => (arr) => {
  for (let i = 0; i < arr.length; i++) {
    if (fn(arr[i])) return true;
  }
  return false;
};

/**
 * every — true якщо всі елементи задовольняють умову
 */
const myEvery = (fn) => (arr) => {
  for (let i = 0; i < arr.length; i++) {
    if (!fn(arr[i])) return false;
  }
  return true;
};

// ─── 2. compose та pipe ───────────────────────────────────────

/**
 * compose — виконує функції справа наліво
 * compose(f, g, h)(x) === f(g(h(x)))
 */
const compose = (...fns) => (x) =>
  fns.reduceRight((acc, fn) => fn(acc), x);

/**
 * pipe — виконує функції зліва направо
 * pipe(f, g, h)(x) === h(g(f(x)))
 */
const pipe = (...fns) => (x) =>
  fns.reduce((acc, fn) => fn(acc), x);

// ─── 3. curry — каррінг довільної функції ────────────────────

/**
 * curry — перетворює функцію з N аргументами
 * на послідовність функцій з одним аргументом
 * curry(add)(1)(2)(3) === add(1,2,3)
 */
const curry = (fn) => {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) {
      return fn(...args);
    }
    return (...moreArgs) => curried(...args, ...moreArgs);
  };
};

// ─── 4. partial — часткове застосування ──────────────────────

/**
 * partial — фіксує перші N аргументів функції
 * partial(add, 1)(2, 3) === add(1, 2, 3)
 */
const partial = (fn, ...preArgs) =>
  (...laterArgs) => fn(...preArgs, ...laterArgs);

// ─── 5. memoize — мемоізація ──────────────────────────────────

/**
 * memoize — кешує результати функції
 * При повторному виклику з тими ж аргументами повертає з кешу
 */
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// ─── Chainable API ────────────────────────────────────────────

/**
 * Chain — ланцюжок трансформацій над масивом
 * Імутабельний: кожна операція повертає новий об'єкт
 */
const Chain = (data) => ({
  map:    (fn) => Chain(data.map(fn)),
  filter: (fn) => Chain(data.filter(fn)),
  reduce: (fn, init) => Chain([data.reduce(fn, init)]),
  forEach:(fn) => { data.forEach(fn); return Chain(data); },
  find:   (fn) => data.find(fn),
  some:   (fn) => data.some(fn),
  every:  (fn) => data.every(fn),
  sortBy: (fn) => Chain([...data].sort(fn)),
  take:   (n)  => Chain(data.slice(0, n)),
  value:  ()   => data,
  log:    (label='') => { console.log(label, data); return Chain(data); },
});

// ─── Утиліти (чисті функції) ──────────────────────────────────

const add      = curry((a, b) => a + b);
const multiply = curry((a, b) => a * b);
const subtract = curry((a, b) => a - b);
const gt       = curry((threshold, val) => val > threshold);
const lt       = curry((threshold, val) => val < threshold);
const eq       = curry((a, b) => a === b);
const prop     = curry((key, obj) => obj[key]);
const double   = multiply(2);
const increment= add(1);
const square   = (x) => x * x;
const toUpper  = (s) => s.toUpperCase();
const trim     = (s) => s.trim();
const clamp    = curry((min, max, val) => Math.min(Math.max(val, min), max));

// ─── Приклади використання ────────────────────────────────────

const EXAMPLES = {

  // map
  mapExample: () => {
    const numbers = [1, 2, 3, 4, 5];
    const doubled  = myMap(double)(numbers);
    const squared  = myMap(square)(numbers);
    const incremented = myMap(increment)(numbers);
    return { input: numbers, doubled, squared, incremented };
  },

  // filter
  filterExample: () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const evens  = myFilter((x) => x % 2 === 0)(numbers);
    const odds   = myFilter((x) => x % 2 !== 0)(numbers);
    const bigGt5 = myFilter(gt(5))(numbers);
    return { input: numbers, evens, odds, bigGt5 };
  },

  // reduce
  reduceExample: () => {
    const numbers = [1, 2, 3, 4, 5];
    const sum     = myReduce((acc, x) => acc + x, 0)(numbers);
    const product = myReduce((acc, x) => acc * x, 1)(numbers);
    const max     = myReduce((acc, x) => x > acc ? x : acc)(numbers);
    return { input: numbers, sum, product, max };
  },

  // find / some / every
  findExample: () => {
    const users = [
      { name: 'Іван', age: 17 },
      { name: 'Марія', age: 25 },
      { name: 'Олег', age: 30 },
    ];
    const firstAdult = myFind((u) => u.age >= 18)(users);
    const hasMinor   = mySome((u) => u.age < 18)(users);
    const allAdults  = myEvery((u) => u.age >= 18)(users);
    return { firstAdult, hasMinor, allAdults };
  },

  // compose
  composeExample: () => {
    const process = compose(
      myMap(double),
      myFilter((x) => x % 2 === 0),
      myMap(increment)
    );
    const input = [1, 2, 3, 4, 5];
    // increment → [2,3,4,5,6] → filter парні → [2,4,6] → double → [4,8,12]
    return { input, result: process(input), steps: [
      'myMap(increment) → [2,3,4,5,6]',
      'myFilter(парні)  → [2,4,6]',
      'myMap(double)    → [4,8,12]',
    ]};
  },

  // pipe
  pipeExample: () => {
    const processName = pipe(trim, toUpper);
    const processNumber = pipe(increment, double, square);
    return {
      name:   processName('  іван петренко  '),
      number: processNumber(3), // (3+1)*2 = 8, 8²=64
    };
  },

  // curry
  curryExample: () => {
    const addCurried = curry((a, b, c) => a + b + c);
    const add5 = addCurried(5);
    const add5and3 = add5(3);
    return {
      full:    addCurried(1, 2, 3),
      partial: add5(3)(2),
      chain:   add5and3(2),
    };
  },

  // partial
  partialExample: () => {
    const multiply3 = (a, b, c) => a * b * c;
    const double_  = partial(multiply3, 2);
    const triple   = partial(multiply3, 3);
    const times6   = partial(multiply3, 2, 3);
    return {
      double5:  double_(1, 5),
      triple4:  triple(1, 4),
      times6_7: times6(7),
    };
  },

  // memoize
  memoizeExample: () => {
    let callCount = 0;
    const slowFibonacci = memoize((n) => {
      callCount++;
      if (n <= 1) return n;
      return slowFibonacci(n - 1) + slowFibonacci(n - 2);
    });
    const results = [];
    callCount = 0;
    for (let i = 0; i <= 10; i++) results.push(slowFibonacci(i));
    return { results, totalCalls: callCount };
  },

  // chain
  chainExample: () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = Chain(data)
      .filter((x) => x % 2 === 0)   // [2,4,6,8,10]
      .map((x) => x * x)             // [4,16,36,64,100]
      .filter(gt(10))                // [16,36,64,100]
      .map(Math.sqrt)                // [4,6,8,10]
      .value();
    return { input: data, result };
  },

  // clamp — curried utility
  clampExample: () => {
    const clamp0to100 = clamp(0, 100);
    return {
      normal:   clamp0to100(50),
      tooLow:   clamp0to100(-10),
      tooHigh:  clamp0to100(150),
    };
  },
};

// Експорт для використання у HTML
if (typeof module !== 'undefined') {
  module.exports = {
    myMap, myFilter, myReduce, myForEach, myFind, mySome, myEvery,
    compose, pipe, curry, partial, memoize, Chain,
    add, multiply, subtract, gt, lt, eq, prop,
    double, increment, square, toUpper, trim, clamp,
    EXAMPLES,
  };
}
