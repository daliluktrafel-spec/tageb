/* =====================================================
   🔥 AI SMART ARABIC SEARCH PRO (FIXED CLEAN VERSION)
   ===================================================== */

/* ===============================
   1) Normalize Arabic
================================ */
function normalizeArabic(text) {
    if (!text) return "";

    return text
        .toLowerCase()
        .replace(/[إأآ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ؤ/g, "و")
        .replace(/ئ/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/ـ/g, "")
        .replace(/[^\u0621-\u064A0-9 ]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/* ===============================
   2) Expand Word
================================ */
function expandWord(word) {
    const w = normalizeArabic(word);
    const forms = new Set();

    if (!w) return [];

    forms.add(w);

    if (w.startsWith("ال")) forms.add(w.slice(2));
    if (w.endsWith("ات")) forms.add(w.slice(0, -2));
    if (w.endsWith("ه")) forms.add(w.slice(0, -1));

    forms.add("ال" + w);
    forms.add(w + "ه");
    forms.add(w + "ات");

    return Array.from(forms);
}

/* ===============================
   3) Dictionary Expand
================================ */
function getSmartKeywords(word) {
    const variants = new Set(expandWord(word));

    if (typeof dictionary === "object") {
        variants.forEach(v => {
            if (dictionary[v]) {
                dictionary[v].forEach(s => {
                    expandWord(s).forEach(e => variants.add(e));
                });
            }
        });
    }

    return Array.from(variants);
}

/* ===============================
   4) Detect Intent
================================ */
function analyzeIntent(words){
    let intent = {
        cheap: false,
        expensive: false
    };

    words.forEach(w=>{
        if(w.includes("رخيص") || w.includes("سعر")) intent.cheap = true;
        if(w.includes("غالي") || w.includes("فاخر")) intent.expensive = true;
    });

    return intent;
}

/* ===============================
   5) Ranking Engine
================================ */
function scoreProduct(product, words, intent){
    let score = 0;

    const name = normalizeArabic(product.name || "");
    const category = normalizeArabic(product.category || "");
    const store = normalizeArabic(product.store || "");
    const desc = normalizeArabic(product.description || "");

    words.forEach(word=>{
        const variants = getSmartKeywords(word);

        variants.forEach(v=>{
            if(name.includes(v)) score += 5;
            else if(category.includes(v)) score += 3;
            else if(store.includes(v)) score += 2;
            else if(desc.includes(v)) score += 1;
        });
    });

    const price = parseFloat(product.price) || 0;

    if(intent.cheap) score += (10000 - price) / 1000;
    if(intent.expensive) score += price / 1000;

    return score;
}

/* ===============================
   6) Search Engine
================================ */
function aiSafeSearch(products, input) {
    if (!input || input.trim() === "") return products.map(p=>p.id);

    const words = normalizeArabic(input).split(" ");
    const intent = analyzeIntent(words);

    const scored = products.map(p => ({
        id: p.id,
        score: scoreProduct(p, words, intent)
    }));

    return scored
        .filter(p => p.score > 0)
        .sort((a,b)=> b.score - a.score)
        .map(p => p.id);
}

/* ===============================
   7) Suggestions
================================ */
function getSuggestions(input){
    if(!input) return [];

    const word = normalizeArabic(input).split(" ").pop();
    const suggestions = new Set();

    products.forEach(p=>{
        const text = normalizeArabic(
            (p.name || "") + " " +
            (p.category || "") + " " +
            (p.store || "")
        );

        text.split(" ").forEach(w=>{
            if(w.length > 2 && w.startsWith(word)){
                suggestions.add(w);
            }
        });
    });

    return Array.from(suggestions).slice(0,5);
}

/* ===============================
   8) UI Search
================================ */
function smartSearch(){
    const input = document.getElementById("searchInput").value;

    if(!input){
        renderProducts("all");
        return;
    }

    showSection("all");

    const results = aiSafeSearch(products, input);
    const resultsSet = new Set(results);

    renderProducts("all", p => resultsSet.has(p.id));

    showSuggestions(input);
}

/* ===============================
   9) Suggestions UI
================================ */
function showSuggestions(input){
    let box = document.getElementById("suggestions");

    if(!box){
        box = document.createElement("div");
        box.id = "suggestions";
        box.style.background = "white";
        box.style.padding = "10px";
        box.style.maxWidth = "400px";
        box.style.margin = "auto";
        box.style.borderRadius = "10px";
        document.getElementById("searchInput").after(box);
    }

    const list = getSuggestions(input);

    box.innerHTML = "";

    list.forEach(s=>{
        const div = document.createElement("div");
        div.innerText = s;
        div.style.cursor = "pointer";
        div.onclick = ()=>{
            document.getElementById("searchInput").value = s;
            smartSearch();
        };
        box.appendChild(div);
    });
}

/* ===============================
   10) Price Filter FIX
================================ */
let maxPrice = 100000;
let currentSearch = "";

function filterByPrice(val){
    maxPrice = Number(val);
    document.getElementById("priceValue").innerText = val;
    applyFilters();
}

function applyFilters(){
    showSection("all");

    let filtered = products.filter(p => Number(p.price) <= maxPrice);

    if(currentSearch){
        const ids = aiSafeSearch(filtered, currentSearch);
        filtered = filtered.filter(p => ids.includes(p.id));
    }

    renderProducts("all", p => filtered.includes(p));
}