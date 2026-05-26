// Практична робота 10.1 — Варіант 1
// Promises · .then() · .catch() · .finally() · Promise.all/race/allSettled

// ── Утиліти ──────────────────────────────────────────────────
var logEl = function(id, type, msg) {
  var box = document.getElementById(id);
  if (!box) return;
  var now = new Date().toLocaleTimeString('uk', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  var labels = {info:'INFO',ok:'OK',err:'ERR',warn:'WARN',finally:'FINALLY'};
  var entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = '<span class="log-time">'+now+'</span>'+
    '<span class="log-badge lb-'+type+'">'+labels[type]+'</span>'+
    '<span class="log-msg">'+msg+'</span>';
  if (box.firstChild && box.firstChild.style && box.firstChild.style.color) box.innerHTML = '';
  box.appendChild(entry);
  box.scrollTop = box.scrollHeight;
};

var delay = function(ms) { return new Promise(function(r){setTimeout(r,ms);}); };

var mayFail = function(chance) {
  return new Promise(function(resolve, reject) {
    if (Math.random() < chance) reject(new Error('Випадкова помилка'));
    else resolve();
  });
};

// ── Навігація ─────────────────────────────────────────────────
function goPage(id, el) {
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
  document.querySelectorAll('.nb').forEach(function(b){b.classList.remove('active');});
  document.getElementById('page-'+id).classList.add('active');
  el.classList.add('active');
}

// ── Огляд ─────────────────────────────────────────────────────
function runBasicPromise() {
  var chance = 1 - parseFloat(document.getElementById('ov-chance').value);
  var box = 'ov-out';
  logEl(box,'info','new Promise() створено — стан: pending ⏳');
  new Promise(function(resolve, reject) {
    setTimeout(function() {
      if (Math.random() < chance) reject(new Error('Операція відхилена'));
      else resolve({ data: 'Дані успішно отримано', timestamp: Date.now() });
    }, 1000);
  })
  .then(function(result) {
    logEl(box,'ok','Promise fulfilled ✅ → '+JSON.stringify(result));
  })
  .catch(function(err) {
    logEl(box,'err','Promise rejected ❌ → '+err.message);
  })
  .finally(function() {
    logEl(box,'finally','.finally() — виконався незалежно від результату');
  });
}

// ── Замовлення їжі ────────────────────────────────────────────
var orderCount = 0;
var orders = [];

function setStep(idx, state, time) {
  var el = document.getElementById('step-'+idx);
  el.className = 'step '+state;
  if (time) document.getElementById('st-'+idx).textContent = time+'мс';
}

function resetPipeline() {
  for(var i=0;i<4;i++) {
    setStep(i,'pending','');
    document.getElementById('st-'+i).textContent='';
  }
}

function checkAvailability(orderId, failChance) {
  setStep(0,'loading');
  var t = Date.now();
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      if (Math.random() < failChance) {
        setStep(0,'error');
        reject(new Error('Товар відсутній на складі'));
      } else {
        setStep(0,'success', Date.now()-t);
        resolve({ orderId: orderId, status: 'available' });
      }
    }, 1000);
  });
}

function reserveItems(data, failChance) {
  setStep(1,'loading');
  var t = Date.now();
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      if (Math.random() < failChance) {
        setStep(1,'error');
        reject(new Error('Не вдалося зарезервувати товар'));
      } else {
        setStep(1,'success', Date.now()-t);
        resolve({ orderId: data.orderId, reserved: true, amount: parseFloat(document.getElementById('o-amount').value)||250 });
      }
    }, 1000);
  });
}

function processPayment(data, failChance) {
  setStep(2,'loading');
  var t = Date.now();
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      if (Math.random() < failChance) {
        setStep(2,'error');
        reject(new Error('Оплата відхилена банком'));
      } else {
        setStep(2,'success', Date.now()-t);
        resolve({ orderId: data.orderId, paid: true, amount: data.amount });
      }
    }, 1500);
  });
}

function scheduleDelivery(data, failChance) {
  setStep(3,'loading');
  var t = Date.now();
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      if (Math.random() < failChance) {
        setStep(3,'error');
        reject(new Error('Немає вільних кур\'єрів'));
      } else {
        setStep(3,'success', Date.now()-t);
        resolve({ orderId: data.orderId, deliveryTime: '30-45 хв', estimatedTime: new Date(Date.now()+2400000).toLocaleTimeString() });
      }
    }, 1000);
  });
}

function startOrder() {
  var btn = document.getElementById('order-btn');
  btn.disabled = true;
  resetPipeline();
  orderCount++;
  var orderId = 'ORD-'+String(orderCount).padStart(4,'0');
  var name = document.getElementById('o-name').value;
  var failChance = parseFloat(document.getElementById('o-fail').value);
  var logId = 'order-log';
  document.getElementById(logId).innerHTML = '';
  var startTime = Date.now();
  var order = { id: orderId, name: name, status: 'running', startTime: startTime };
  orders.unshift(order);
  renderHistory();

  logEl(logId,'info','🍕 Нове замовлення '+orderId+': "'+name+'" — '+document.getElementById('o-amount').value+'₴');
  logEl(logId,'info','Шанс помилки на кожному кроці: '+(failChance*100)+'%');

  checkAvailability(orderId, failChance)
    .then(function(r) {
      logEl(logId,'ok','✅ Крок 1: Наявність підтверджена — '+JSON.stringify(r));
      return reserveItems(r, failChance);
    })
    .then(function(r) {
      logEl(logId,'ok','✅ Крок 2: Товар зарезервовано на суму '+r.amount+'₴');
      return processPayment(r, failChance);
    })
    .then(function(r) {
      logEl(logId,'ok','✅ Крок 3: Оплата '+r.amount+'₴ успішна');
      return scheduleDelivery(r, failChance);
    })
    .then(function(r) {
      logEl(logId,'ok','✅ Крок 4: Доставку заплановано — очікуйте '+r.deliveryTime);
      logEl(logId,'ok','🎉 Замовлення '+orderId+' успішно оформлено! Час: '+(Date.now()-startTime)+'мс');
      order.status = 'success'; order.time = Date.now()-startTime;
    })
    .catch(function(err) {
      logEl(logId,'err','❌ Помилка: '+err.message);
      logEl(logId,'warn','Замовлення '+orderId+' скасовано. Час: '+(Date.now()-startTime)+'мс');
      order.status = 'failed'; order.time = Date.now()-startTime;
    })
    .finally(function() {
      logEl(logId,'finally','🔄 .finally() — очищення стану, розблокування кнопки');
      btn.disabled = false;
      renderHistory();
    });
}

function renderHistory() {
  var html = '';
  for(var i=0;i<Math.min(orders.length,5);i++) {
    var o=orders[i];
    var cls = o.status==='success'?'os-success':o.status==='failed'?'os-failed':o.status==='running'?'os-running':'os-pending';
    var icon = o.status==='success'?'✅':o.status==='failed'?'❌':o.status==='running'?'⏳':'⏸';
    html+='<div class="order-card">'+
      '<div class="order-header">'+
      '<span class="order-id">'+o.id+'</span>'+
      '<span class="order-status '+cls+'">'+icon+' '+o.status+'</span>'+
      '</div>'+
      '<div class="order-items">'+o.name+(o.time?' · '+o.time+'мс':'')+'</div>'+
    '</div>';
  }
  document.getElementById('order-history').innerHTML = html || '<div style="color:#8b949e;font-size:12px">Поки немає замовлень</div>';
}

// ── Promise chains demo ───────────────────────────────────────
function runChainDemo() {
  var id='chain-log';
  document.getElementById(id).innerHTML='';
  logEl(id,'info','Запускаємо ланцюжок промісів...');

  new Promise(function(resolve) {
    logEl(id,'info','Крок 1: checkAvailability() — pending ⏳');
    setTimeout(function(){ logEl(id,'ok','Крок 1: resolve({ orderId:"001" })'); resolve({orderId:'001'}); },800);
  })
  .then(function(r) {
    logEl(id,'info','→ .then() отримав: '+JSON.stringify(r));
    logEl(id,'info','Крок 2: reserveItems() — pending ⏳');
    return new Promise(function(resolve){
      setTimeout(function(){ logEl(id,'ok','Крок 2: resolve({ reserved:true })'); resolve({orderId:r.orderId,amount:250}); },800);
    });
  })
  .then(function(r) {
    logEl(id,'info','→ .then() отримав: '+JSON.stringify(r));
    logEl(id,'info','Крок 3: processPayment() — pending ⏳');
    return new Promise(function(resolve){
      setTimeout(function(){ logEl(id,'ok','Крок 3: resolve({ paid:true })'); resolve({orderId:r.orderId,paid:true}); },1000);
    });
  })
  .then(function(r) {
    logEl(id,'info','→ .then() отримав: '+JSON.stringify(r));
    logEl(id,'info','Крок 4: scheduleDelivery() — pending ⏳');
    return new Promise(function(resolve){
      setTimeout(function(){ logEl(id,'ok','Крок 4: resolve({ delivery:"30-45хв" })'); resolve({delivery:'30-45хв'}); },800);
    });
  })
  .then(function(r) {
    logEl(id,'ok','🎉 Ланцюжок завершено: '+JSON.stringify(r));
  })
  .finally(function(){
    logEl(id,'finally','.finally() — завжди виконується');
  });
}

function clearChainLog(){ document.getElementById('chain-log').innerHTML='<div style="color:#8b949e">← Натисни ▶</div>'; }

function runDataChain() {
  var id='data-chain-log';
  document.getElementById(id).innerHTML='';
  logEl(id,'info','Демонстрація передачі даних між .then()');

  Promise.resolve(10)
    .then(function(n){
      logEl(id,'info','.then(n='+n+') → повертає n*2 = '+(n*2));
      return n*2;
    })
    .then(function(n){
      logEl(id,'info','.then(n='+n+') → повертає n+5 = '+(n+5));
      return n+5;
    })
    .then(function(n){
      logEl(id,'info','.then(n='+n+') → повертає "Result: "+n');
      return 'Result: '+n;
    })
    .then(function(s){
      logEl(id,'ok','Фінальний результат: "'+s+'"');
    });
}

// ── Errors ────────────────────────────────────────────────────
function runErrorDemo() {
  var errorStep = parseInt(document.getElementById('err-step').value);
  var id = 'err-log';
  document.getElementById(id).innerHTML='';
  var steps = ['checkAvailability','reserveItems','processPayment','scheduleDelivery'];
  logEl(id,'info','Запускаємо ланцюжок'+(errorStep>=0?' — помилка на кроці '+(errorStep+1)+' ('+steps[errorStep]+')':'— без помилок'));

  var makeStep = function(i, data) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        if (i === errorStep) {
          reject(new Error('Помилка на кроці '+(i+1)+': '+steps[i]+' failed'));
        } else {
          resolve(Object.assign({}, data, {step: i+1, ok: true}));
        }
      }, 600);
    });
  };

  makeStep(0, {orderId:'ERR-001'})
    .then(function(r){ logEl(id,'ok','Крок 1 ✅'); return makeStep(1, r); })
    .then(function(r){ logEl(id,'ok','Крок 2 ✅'); return makeStep(2, r); })
    .then(function(r){ logEl(id,'ok','Крок 3 ✅'); return makeStep(3, r); })
    .then(function(r){ logEl(id,'ok','Крок 4 ✅ — всі кроки успішні!'); })
    .catch(function(err){ logEl(id,'err','❌ .catch() спрацював: '+err.message); logEl(id,'warn','Всі наступні .then() пропущені!'); })
    .finally(function(){ logEl(id,'finally','.finally() — виконується завжди'); });
}

function runRetry() {
  var chance = parseFloat(document.getElementById('retry-chance').value)/100;
  var id = 'retry-log';
  document.getElementById(id).innerHTML='';
  var attempts = 0;
  var maxAttempts = 3;

  function attempt() {
    attempts++;
    logEl(id,'info','Спроба '+attempts+'/'+maxAttempts+'...');
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        if (Math.random() < chance) reject(new Error('Сервер недоступний'));
        else resolve({ data: 'OK', attempt: attempts });
      }, 600);
    });
  }

  function retry(attemptsLeft) {
    return attempt().catch(function(err) {
      logEl(id,'warn','❌ Спроба '+attempts+' провалилась: '+err.message);
      if (attemptsLeft > 1) {
        logEl(id,'info','Повторна спроба через 500мс...');
        return delay(500).then(function(){ return retry(attemptsLeft-1); });
      }
      throw new Error('Всі '+maxAttempts+' спроби вичерпано');
    });
  }

  retry(maxAttempts)
    .then(function(r){ logEl(id,'ok','✅ Успіх на спробі '+r.attempt+'!'); })
    .catch(function(err){ logEl(id,'err','❌ '+err.message); });
}

// ── Promise.all ───────────────────────────────────────────────
function runAll() {
  var id='all-log';
  document.getElementById(id).innerHTML='';
  document.getElementById('all-progress').innerHTML='';
  var completed = 0;
  var total = 4;
  var startTime = Date.now();

  function updateProgress() {
    completed++;
    var pct = (completed/total*100).toFixed(0);
    document.getElementById('all-progress').innerHTML=
      '<div style="color:#8b949e;font-size:12px;margin-bottom:4px">Завантажено: '+completed+'/'+total+' ('+pct+'%)</div>'+
      '<div class="progress-bar"><div class="progress-fill" style="width:'+pct+'%"></div></div>';
    logEl(id,'info','Завантажено '+completed+'/'+total+' запитів');
  }

  function makeRequest(name, ms) {
    return delay(ms).then(function() { updateProgress(); return {source:name, data:'✅ Дані отримано', time:ms+'мс'}; });
  }

  logEl(id,'info','Promise.all() — всі 4 запити стартують ОДНОЧАСНО');

  Promise.all([
    makeRequest('Меню', 1000),
    makeRequest('Ресторани', 1500),
    makeRequest('Відгуки', 800),
    makeRequest('Акції', 1200),
  ]).then(function(results) {
    logEl(id,'ok','✅ Promise.all() завершено за '+(Date.now()-startTime)+'мс');
    results.forEach(function(r){ logEl(id,'ok',r.source+': '+r.data+' ('+r.time+')'); });
  }).catch(function(err){ logEl(id,'err','❌ Один запит провалився — весь Promise.all зупинено: '+err.message); });
}

function runSequential() {
  var id='all-log';
  document.getElementById(id).innerHTML='';
  var startTime = Date.now();
  logEl(id,'info','Послідовне виконання — кожен запит чекає попередній');

  delay(1000).then(function(){
    logEl(id,'ok','Меню: ✅ (1000мс)');
    return delay(1500);
  }).then(function(){
    logEl(id,'ok','Ресторани: ✅ (1500мс)');
    return delay(800);
  }).then(function(){
    logEl(id,'ok','Відгуки: ✅ (800мс)');
    return delay(1200);
  }).then(function(){
    logEl(id,'ok','Акції: ✅ (1200мс)');
    logEl(id,'warn','⏱ Послідовно: '+(Date.now()-startTime)+'мс (vs ~1500мс паралельно)');
  });
}

// ── Promise.race ──────────────────────────────────────────────
function runRace() {
  var id='race-log';
  document.getElementById(id).innerHTML='';
  var btn=document.getElementById('race-btn');
  btn.disabled=true;

  var servers = [
    {name:'Сервер А 🟠', color:'#f0883e'},
    {name:'Сервер Б 🟢', color:'#3fb950'},
    {name:'Сервер В 🔵', color:'#79c0ff'},
  ];

  // Генеруємо випадкові затримки
  var times = servers.map(function(){return Math.floor(Math.random()*1500)+500;});
  var vizHtml = '';
  servers.forEach(function(s,i){
    vizHtml+='<div style="margin-bottom:10px">'+
      '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">'+
      '<span style="color:'+s.color+'">'+s.name+'</span>'+
      '<span style="color:#8b949e" id="race-time-'+i+'">'+times[i]+'мс</span>'+
      '</div>'+
      '<div class="progress-bar" style="height:10px">'+
      '<div id="race-bar-'+i+'" class="progress-fill" style="width:0%;background:'+s.color+'"></div>'+
      '</div></div>';
  });
  document.getElementById('race-viz').innerHTML=vizHtml;

  // Анімуємо прогрес
  var startTime=Date.now();
  var animInterval=setInterval(function(){
    var elapsed=Date.now()-startTime;
    servers.forEach(function(s,i){
      var pct=Math.min(100,(elapsed/times[i]*100)).toFixed(0);
      document.getElementById('race-bar-'+i).style.width=pct+'%';
    });
  },50);

  logEl(id,'info','🏁 Promise.race() — стартуємо три сервери одночасно!');
  logEl(id,'info','Час відповіді: '+servers.map(function(s,i){return s.name+': '+times[i]+'мс';}).join(' | '));

  var promises = servers.map(function(s,i){
    return delay(times[i]).then(function(){ return {server:s.name, time:times[i]}; });
  });
  promises.push(new Promise(function(_,reject){ setTimeout(function(){reject(new Error('Timeout 3000мс'));},3000); }));

  Promise.race(promises).then(function(r){
    clearInterval(animInterval);
    servers.forEach(function(s,i){ document.getElementById('race-bar-'+i).style.width='100%'; });
    logEl(id,'ok','🏆 Виграв '+r.server+' — відповів за '+r.time+'мс!');
    logEl(id,'info','Інші сервери продовжують виконуватись у фоні, але результат вже є');
    btn.disabled=false;
  }).catch(function(err){
    clearInterval(animInterval);
    logEl(id,'err','❌ '+err.message);
    btn.disabled=false;
  });
}

// ── Promise.allSettled ────────────────────────────────────────
function runAllSettled() {
  var id='settled-log';
  document.getElementById(id).innerHTML='';
  logEl(id,'info','Promise.allSettled() — завантажуємо дані з 5 джерел');

  var sources = [
    {name:'Меню ресторану', failChance:0.1},
    {name:'Відгуки клієнтів', failChance:0.5},
    {name:'Акції та знижки', failChance:0.7},
    {name:'Геолокація', failChance:0.2},
    {name:'Рекомендації', failChance:0.4},
  ];

  var promises = sources.map(function(s){
    return delay(Math.random()*1000+500).then(function(){
      if(Math.random()<s.failChance) throw new Error(s.name+' недоступний');
      return {source:s.name, data:'✅ Отримано'};
    });
  });

  Promise.allSettled(promises).then(function(results){
    var ok=0, fail=0;
    results.forEach(function(r,i){
      if(r.status==='fulfilled'){
        ok++;
        logEl(id,'ok','✅ '+r.value.source+': '+r.value.data);
      } else {
        fail++;
        logEl(id,'err','❌ '+r.reason.message);
      }
    });
    logEl(id,'info','Підсумок: успішних='+ok+', провалених='+fail+' з '+results.length);
    logEl(id,'ok','Promise.allSettled чекав на ВСІ навіть якщо деякі провалились');
  });
}

// ── Event Loop ────────────────────────────────────────────────
function runEventLoop() {
  var id='el-log';
  document.getElementById(id).innerHTML='';
  var step=0;
  function log(type,msg){ setTimeout(function(){ logEl(id,type,'['+step+'] '+msg); step++; }, step*0); }

  logEl(id,'info','=== Синхронний код ===');
  logEl(id,'ok','console.log("1 — синхронний") — виконується ЗАРАЗ');

  setTimeout(function(){
    logEl(id,'warn','console.log("3 — macrotask") — setTimeout(0) — після мікрозадач');
  },0);

  Promise.resolve().then(function(){
    logEl(id,'info','console.log("2 — microtask") — Promise.then() — перед setTimeout');
  });

  logEl(id,'ok','console.log("1.5 — синхронний") — ще синхронний код');
  logEl(id,'info','--- Синхронний код завершено. Далі: мікрозадачі → макрозадачі ---');
}

function runCallbackVsPromise() {
  var id='cbvsp-log';
  document.getElementById(id).innerHTML='';
  logEl(id,'info','=== Callback підхід (callback hell) ===');
  logEl(id,'warn','getData(function(a) { getMore(a, function(b) { save(b, function(c) { ... }) }) })');
  logEl(id,'err','Проблема: важко читати, важко обробляти помилки → "Callback Hell"');

  setTimeout(function(){
    logEl(id,'info','=== Promise підхід (ланцюжок) ===');
    logEl(id,'ok','getData().then(getMore).then(save).catch(handleError) — читабельно!');

    setTimeout(function(){
      logEl(id,'info','=== async/await (сучасний підхід) ===');
      logEl(id,'ok','const a = await getData();  // виглядає як синхронний код');
      logEl(id,'ok','const b = await getMore(a); // але насправді асинхронний');
      logEl(id,'ok','await save(b);');
    },300);
  },300);
}