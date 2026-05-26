# js-promises-variant1

**Практична робота 10.1 — Варіант 1**  
Система замовлення їжі · Promise chains · .then() · .catch() · .finally()

## Реалізовано

### Promise ланцюжок — Замовлення їжі
```js
checkAvailability(orderId)    // 1с · 20% помилка
  .then(r => reserveItems(r)) // 1с · 20% помилка
  .then(r => processPayment(r, r.amount)) // 1.5с · 20% помилка
  .then(r => scheduleDelivery(r))         // 1с · 20% помилка
  .catch(err => handleError(err))         // централізована обробка
  .finally(() => cleanup())              // завжди виконується
```

### Статичні методи
```js
Promise.all([...])         // паралельно — чекає на всі
Promise.race([...])        // перший відповів — виграє
Promise.allSettled([...])  // всі — навіть якщо деякі провалились
```

### Retry логіка
```js
function retry(fn, attempts) {
  return fn().catch(err =>
    attempts > 1 ? delay(500).then(() => retry(fn, attempts-1)) : Promise.reject(err)
  );
}
```

### Event Loop
- Синхронний код → Мікрозадачі (Promise) → Макрозадачі (setTimeout)
- Callback → Promise → async/await — еволюція підходів

## Запуск

Відкрити `praktychna_10_1_variant1.html` у браузері.

## Demo відео

> 🎥 https://youtu.be/Z1YYIc83n9I?si=f82lxaovcC9a2WDt
