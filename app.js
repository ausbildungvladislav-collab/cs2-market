(() => {
  "use strict";

  const CURRENCY_RATES = { EUR: 1, USD: 1.08, RUB: 97 };
  const CURRENCY_SYMBOLS = { EUR: "€", USD: "$", RUB: "₽" };

  const skins = [
    {id:"ak-redline",name:"AK-47 | Redline",weapon:"AK-47",wear:"Field-Tested",rarity:"Classified",price:18.5,emoji:"🔫",glow:"#d64b4b"},
    {id:"awp-asiimov",name:"AWP | Asiimov",weapon:"AWP",wear:"Field-Tested",rarity:"Covert",price:92,emoji:"🎯",glow:"#ff8b35"},
    {id:"deagle-blaze",name:"Desert Eagle | Blaze",weapon:"Desert Eagle",wear:"Factory New",rarity:"Restricted",price:74,emoji:"🔫",glow:"#e99b32"},
    {id:"m4a1-hyper",name:"M4A1-S | Hyper Beast",weapon:"M4A1-S",wear:"Minimal Wear",rarity:"Covert",price:61,emoji:"🐉",glow:"#c34c8b"},
    {id:"usp-kill",name:"USP-S | Kill Confirmed",weapon:"USP-S",wear:"Field-Tested",rarity:"Covert",price:48,emoji:"🔫",glow:"#d84e4e"},
    {id:"karambit-blue",name:"Karambit | Blue Steel",weapon:"Karambit",wear:"Minimal Wear",rarity:"Covert",price:210,emoji:"🔪",glow:"#4c9fe0"},
    {id:"glock-fade",name:"Glock-18 | Fade",weapon:"Glock-18",wear:"Factory New",rarity:"Restricted",price:135,emoji:"🔫",glow:"#d7a64a"},
    {id:"ak-neon",name:"AK-47 | Neon Rider",weapon:"AK-47",wear:"Minimal Wear",rarity:"Covert",price:39,emoji:"🌈",glow:"#bc48b5"},
    {id:"m4a4-emperor",name:"M4A4 | The Emperor",weapon:"M4A4",wear:"Field-Tested",rarity:"Covert",price:27,emoji:"👑",glow:"#d3a84a"},
    {id:"usp-cortex",name:"USP-S | Cortex",weapon:"USP-S",wear:"Minimal Wear",rarity:"Classified",price:8.4,emoji:"🔫",glow:"#e27a9d"},
    {id:"awp-mortis",name:"AWP | Mortis",weapon:"AWP",wear:"Field-Tested",rarity:"Classified",price:6.2,emoji:"🎯",glow:"#b74b52"},
    {id:"p250-see",name:"P250 | See Ya Later",weapon:"P250",wear:"Minimal Wear",rarity:"Covert",price:14.7,emoji:"🐊",glow:"#64b6a4"},
    {id:"five-seveN",name:"Five-SeveN | Hyper Beast",weapon:"Five-SeveN",wear:"Field-Tested",rarity:"Classified",price:11.3,emoji:"🐲",glow:"#b54f94"},
    {id:"galil-sugar",name:"Galil AR | Sugar Rush",weapon:"Galil AR",wear:"Field-Tested",rarity:"Classified",price:19.2,emoji:"🍬",glow:"#db78bd"},
    {id:"mac- neon",name:"MAC-10 | Neon Rider",weapon:"MAC-10",wear:"Minimal Wear",rarity:"Classified",price:12.5,emoji:"🌈",glow:"#ad52c1"},
    {id:"usp-print",name:"USP-S | Printstream",weapon:"USP-S",wear:"Field-Tested",rarity:"Covert",price:55,emoji:"⚪",glow:"#c5d0d9"}
  ];

  const cases = [
    {id:"starter",name:"Starter Case",description:"Базовые скины для начала коллекции.",price:4.5,emoji:"▤",pool:["usp-cortex","awp-mortis","five-seveN","ak-neon","ak-redline"]},
    {id:"weapon",name:"Weapon Case",description:"Популярные предметы и редкие находки.",price:12,emoji:"▣",pool:["ak-redline","m4a4-emperor","p250-see","galil-sugar","usp-kill","m4a1-hyper"]},
    {id:"elite",name:"Elite Case",description:"Шанс получить дорогой скин.",price:30,emoji:"✦",pool:["awp-asiimov","karambit-blue","glock-fade","usp-print","m4a1-hyper"]}
  ];

  const rarityColors = {Covert:"#e14b62",Classified:"#c05be5",Restricted:"#8b79ef","Mil-Spec":"#4e8de5"};
  const $ = id => document.getElementById(id);
  const getSkin = id => skins.find(s => s.id === id);
  const defaultState = () => ({balance:100,currency:"EUR",inventory:[],username:"PLAYER"});
  let state = loadState();
  let selectedSourceId = null;
  let toastTimer;

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem("cs2MarketState"));
      if (saved && typeof saved.balance === "number" && Array.isArray(saved.inventory)) {
        return {...defaultState(), ...saved, inventory:saved.inventory.filter(id => getSkin(id))};
      }
    } catch (e) { console.warn("Could not load saved data", e); }
    return defaultState();
  }
  function saveState() {
    localStorage.setItem("cs2MarketState", JSON.stringify(state));
  }
  function formatPrice(eur) {
    const value = eur * CURRENCY_RATES[state.currency];
    return new Intl.NumberFormat("ru-RU", {minimumFractionDigits:2,maximumFractionDigits:2}).format(value) + " " + CURRENCY_SYMBOLS[state.currency];
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }
  function toast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2300);
  }
  function skinCard(skin, action, label) {
    const owned = state.inventory.includes(skin.id);
    return `<article class="skin-card">
      <div class="skin-art" style="--skin-glow:${skin.glow};--rarity-color:${rarityColors[skin.rarity] || "#9aa"}">
        <span class="rarity-bar"></span><span class="rarity-tag">${escapeHtml(skin.rarity)}</span><span class="skin-emoji">${skin.emoji}</span>
      </div>
      <div class="skin-body"><div class="skin-type">${escapeHtml(skin.weapon)}</div><div class="skin-name" title="${escapeHtml(skin.name)}">${escapeHtml(skin.name)}</div><div class="skin-wear">${escapeHtml(skin.wear)}</div>
        <div class="skin-footer"><span class="skin-price">${formatPrice(skin.price)}</span><button class="mini-btn" data-action="${action}" data-id="${skin.id}" ${action==="buy" && owned ? "disabled" : ""}>${action==="buy" && owned ? "Есть" : label}</button></div>
      </div>
    </article>`;
  }
  function renderGrid(targetId, list, action, label, emptyText) {
    const target = $(targetId);
    target.innerHTML = list.length ? list.map(s => skinCard(s, action, label)).join("") : `<div class="empty-state">${emptyText}</div>`;
  }
  function inventorySkins() { return state.inventory.map(getSkin).filter(Boolean); }
  function inventoryValue() { return inventorySkins().reduce((sum,s) => sum+s.price,0); }

  function renderAll() {
    $("balanceValue").textContent = formatPrice(state.balance);
    $("marketCount").textContent = skins.length;
    $("marketPageCount").textContent = skins.length;
    $("inventoryCount").textContent = state.inventory.length;
    $("inventoryPageCount").textContent = state.inventory.length;
    $("inventoryValue").textContent = formatPrice(inventoryValue());
    $("profileBalance").textContent = formatPrice(state.balance);
    $("profileItems").textContent = state.inventory.length;
    $("profileValue").textContent = formatPrice(inventoryValue());
    $("profileCurrency").textContent = state.currency;
    $("profileMarket").textContent = skins.length;
    $("profileInventory").textContent = state.inventory.length;
    $("username").textContent = state.username;
    $("profileName").textContent = state.username;
    renderGrid("featuredGrid", skins.slice(0,4), "buy", "Купить", "Пока нет предметов.");
    renderMarket();
    renderGrid("inventoryGrid", inventorySkins(), "sell", "Продать", "Инвентарь пуст. Загляни в маркет или открой кейс.");
    renderCases();
    renderUpgrader();
  }
  function renderMarket() {
    const query = $("searchInput").value.trim().toLowerCase();
    const rarity = $("rarityFilter").value;
    const filtered = skins.filter(s => (s.name.toLowerCase().includes(query) || s.weapon.toLowerCase().includes(query)) && (rarity==="all" || s.rarity===rarity));
    renderGrid("marketGrid", filtered, "buy", "Купить", "Ничего не найдено. Попробуй изменить поиск.");
  }
  function renderCases() {
    $("casesGrid").innerHTML = cases.map(c => `<article class="case-card">
      <div class="case-art">${c.emoji}</div><h3>${escapeHtml(c.name)}</h3><p>${escapeHtml(c.description)}</p>
      <div class="case-footer"><span class="case-price">${formatPrice(c.price)}</span><button class="mini-btn" data-action="open-case" data-id="${c.id}">Открыть кейс</button></div>
    </article>`).join("");
  }
  function renderUpgrader() {
    const source = selectedSourceId ? getSkin(selectedSourceId) : null;
    const sourceOwned = source && state.inventory.includes(source.id);
    if (!sourceOwned) {
      selectedSourceId = null;
      $("upgradeSource").className = "upgrade-selection empty-selection";
      $("upgradeSource").textContent = state.inventory.length ? "Нажми на предмет в инвентаре, чтобы выбрать его для апгрейда." : "Сначала добавь предмет в инвентарь";
    } else {
      $("upgradeSource").className = "upgrade-selection";
      $("upgradeSource").innerHTML = `<div class="source-item"><span class="skin-emoji">${source.emoji}</span><div><strong>${escapeHtml(source.name)}</strong><small>${formatPrice(source.price)}</small></div></div>`;
    }
    const targetSelect = $("upgradeTarget");
    const previous = targetSelect.value;
    const targets = source ? skins.filter(s => s.price > source.price) : [];
    targetSelect.innerHTML = `<option value="">Выбери целевой скин</option>` + targets.map(s => `<option value="${s.id}">${escapeHtml(s.name)} — ${formatPrice(s.price)}</option>`).join("");
    if (targets.some(s => s.id === previous)) targetSelect.value = previous;
    updateChance();
  }
  function updateChance() {
    const source = selectedSourceId ? getSkin(selectedSourceId) : null;
    const target = getSkin($("upgradeTarget").value);
    const chance = source && target ? Math.max(1, Math.min(90, Math.round((source.price / target.price) * 75))) : 0;
    $("upgradeChance").textContent = chance + "%";
    $("chanceBar").style.width = chance + "%";
    $("upgradeButton").disabled = !(source && target && state.inventory.includes(source.id) && target.price > source.price);
  }
  function buySkin(id) {
    const skin = getSkin(id);
    if (!skin) return;
    if (state.inventory.includes(id)) return toast("Этот предмет уже есть в инвентаре.");
    if (state.balance < skin.price) return toast("Недостаточно средств.");
    state.balance -= skin.price;
    state.inventory.push(id);
    saveState(); renderAll(); toast("Предмет добавлен в инвентарь.");
  }
  function sellSkin(id) {
    const index = state.inventory.indexOf(id);
    const skin = getSkin(id);
    if (index < 0 || !skin) return;
    state.inventory.splice(index,1);
    state.balance += skin.price * 0.9;
    if (selectedSourceId === id) selectedSourceId = null;
    saveState(); renderAll(); toast("Предмет продан за 90% стоимости.");
  }
  function openCase(id) {
    const c = cases.find(item => item.id === id);
    if (!c) return;
    if (state.balance < c.price) return toast("Недостаточно средств для открытия кейса.");
    state.balance -= c.price;
    const dropId = c.pool[Math.floor(Math.random()*c.pool.length)];
    const drop = getSkin(dropId);
    state.inventory.push(dropId);
    $("caseResult").classList.remove("hidden");
    $("caseResult").innerHTML = `<span class="skin-emoji">${drop.emoji}</span><div><div class="result-kicker">КЕЙС ОТКРЫТ · ТВОЙ ДРОП</div><h3>${escapeHtml(drop.name)}</h3><p>Предмет добавлен в инвентарь · ${formatPrice(drop.price)}</p></div>`;
    saveState(); renderAll(); toast("Кейс открыт! Новый предмет в инвентаре.");
  }
  function runUpgrade() {
    const source = getSkin(selectedSourceId);
    const target = getSkin($("upgradeTarget").value);
    if (!source || !target || !state.inventory.includes(source.id) || target.price <= source.price) return;
    const chance = Math.max(1, Math.min(90, Math.round((source.price / target.price) * 75)));
    const success = Math.random()*100 < chance;
    const index = state.inventory.indexOf(source.id);
    if (index >= 0) state.inventory.splice(index,1);
    if (success) {
      state.inventory.push(target.id);
      toast("Успех! Ты получил " + target.name);
    } else {
      toast("Неудача. Предмет потерян.");
    }
    selectedSourceId = null;
    $("upgradeTarget").value = "";
    saveState(); renderAll();
  }
  function showPage(name) {
    const ids = {home:"homePage",market:"marketPage",inventory:"inventoryPage",cases:"casesPage",upgrader:"upgraderPage",profile:"profilePage"};
    Object.entries(ids).forEach(([key,id]) => $(id).classList.toggle("hidden", key !== name));
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === name));
    window.scrollTo({top:0,behavior:"smooth"});
    if (name === "upgrader") renderUpgrader();
  }

  document.addEventListener("click", event => {
    const tab = event.target.closest("[data-tab]");
    if (tab) { event.preventDefault(); showPage(tab.dataset.tab); return; }
    const action = event.target.closest("[data-action]");
    if (!action) return;
    const {action:kind,id} = action.dataset;
    if (kind === "buy") buySkin(id);
    if (kind === "sell") sellSkin(id);
    if (kind === "open-case") openCase(id);
  });
  $("currencySelect").addEventListener("change", event => {
    state.currency = event.target.value;
    saveState(); renderAll();
  });
  $("searchInput").addEventListener("input", renderMarket);
  $("rarityFilter").addEventListener("change", renderMarket);
  $("inventoryGrid").addEventListener("click", event => {
    const card = event.target.closest(".skin-card");
    if (!card || event.target.closest("button")) return;
    const name = card.querySelector(".skin-name")?.textContent;
    const skin = inventorySkins().find(s => s.name === name);
    if (skin) { selectedSourceId = skin.id; showPage("upgrader"); }
  });
  $("upgradeSource").addEventListener("click", () => showPage("inventory"));
  $("upgradeTarget").addEventListener("change", updateChance);
  $("upgradeButton").addEventListener("click", runUpgrade);
  $("resetDemo").addEventListener("click", () => {
    if (!confirm("Сбросить баланс и весь инвентарь?")) return;
    state = defaultState(); selectedSourceId = null; saveState(); $("caseResult").classList.add("hidden"); $("currencySelect").value = state.currency; renderAll(); toast("Демо-данные сброшены.");
  });

  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    const firstName = tg.initDataUnsafe?.user?.first_name;
    if (firstName) state.username = firstName.toUpperCase();
  }
  $("currencySelect").value = state.currency;
  renderAll();
})();