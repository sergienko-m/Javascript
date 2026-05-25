# js-hof-variant1

**Практична робота 8 — Варіант 1**  
Data Transformation Library · Функції вищого порядку

## Реалізовані функції

### map / filter / reduce / forEach / find / some / every
```js
myMap(fn)(arr)          // трансформація кожного елемента
myFilter(fn)(arr)       // фільтрація за умовою
myReduce(fn, init)(arr) // згортання до значення
myForEach(fn)(arr)      // ітерація (без повернення)
myFind(fn)(arr)         // перший елемент що задовольняє умову
mySome(fn)(arr)         // true якщо хоча б один
myEvery(fn)(arr)        // true якщо всі
```

### compose / pipe
```js
compose(f, g, h)(x) // f(g(h(x))) — справа наліво
pipe(f, g, h)(x)    // h(g(f(x))) — зліва направо
```

### curry / partial
```js
curry(fn)(a)(b)(c)     // каррінг довільної функції
partial(fn, a, b)(c)   // фіксує перші аргументи
```

### memoize
```js
const fibFast = memoize(fib);
// кешує результати, уникає повторних обчислень
```

### Chainable API
```js
Chain([1,2,3,4,5,6,7,8,9,10])
  .filter(x => x % 2 === 0)
  .map(x => x * x)
  .filter(x => x > 10)
  .value(); // → [16, 36, 64, 100]
```

## Принципи функціонального програмування
- **Чисті функції** — без побічних ефектів
- **Імутабельність** — оригінальні масиви не змінюються
- **Функції як значення** — передаються як аргументи
- **Композиція** — складні функції з простих
- **Каррінг** — часткове застосування аргументів

## Запуск

Відкрити `praktychna_8_variant1.html` у браузері.

## Demo відео

> 🎥 https://youtu.be/MgubMaRNfIg?si=L0qU8viMMDl_0Nsw
