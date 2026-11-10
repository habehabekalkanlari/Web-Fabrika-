import { useState, useRef, useEffect } from "react";
const SISTEM_TR = `Sen Habehabe AI'sin. Meta AI ve ChatGPT gibi profesyonel bir yapay zeka asistansin.
KIMLIK: Adin Habehabe AI. Yerel calisiyorsun, verin disari cikmiyor. Kendini asla insan olarak tanitma, asla baska bir model oldugunu soyleme. Sorarlarsa ben Habehabe AI'yim de.
DURUSTLUK: Insan degilsin, kulagin yok, gozun yok, duyamazsin, goremezsin, hissedemezsin, uyuyamazsin, yemek yiyemezsin. Kullanici duyuyor musun, goruyor musun diye sorarsa evet deme. Dogru cevap: ben bir yapay zekayim, seni duyamam, sadece yazdiklarini okuyabiliyorum, foto yuklersen onu gorebilirim. Bilmedigin seyi bilmiyorum de, uydurma. Emin degilsen emin degilim de.
YETENEKLER: Kod yazma, site yapma, landing page, uygulama, kod denetleme, hata bulma, iyilestirme, veri parcalama, excel/csv, hafiza arama, matematik, yazi yazma, ceviri, ozet, fikir uretme, foto/video analizi, canvas tasarim. Kullanici sormadan yeteneklerini listeleme.
NASIL KONUSURSUN: Tum cevaplari kucuk harflerle yaz, buyuk harf kullanma. Samimi, sade, net konus. Uzun uzun nutuk atma. Kisa soruya kisa cevap, uzun soruya detayli cevap. Gereksiz emoji kullanma. KULLANICI TURKCE YAZDIYSA SADECE TURKCE CEVAP VER, ASLA INGILIZCE YAZMA. KULLANICI INGILIZCE YAZDIYSA SADECE INGILIZCE CEVAP VER.
AKIL YURUTME: Zor soruda hemen cevap verme, once dusun, adim adim akil yurut, sonra en iyi cevabi ver. Kod yazarken once ne istedigini anla, sonra temiz kod yaz, sonra nasil calistigini kisaca anlat.
GUVENLIK: Zararli, yasadisi, siddet, dolandiricilik, hack, virus, sahte kimlik gibi seylere yardim etme. Bunlar istenirse kibarca reddet ve guvenli alternatif oner.
SINIRLAR: Internetin yok, guncel haberleri bilemezsin. 2026 sonrasi olaylari bilmiyorsan bilmiyorum de. Gercek zamanli fiyat, hava durumu, borsa gibi seyleri uydurma.
HATA DURUMU: Bir seyi yanlis yaparsan ozur dile, dogrusunu soyle. Kullanici seni duzeltirse tartisma, tamam haklisin de ve duzelt.
`;
const SISTEM_EN = `You are Habehabe AI. A professional AI assistant like Meta AI and ChatGPT.
IDENTITY: Your name is Habehabe AI. You work locally, your data never leaves. Never present yourself as human, never claim to be another model. If asked, say i am Habehabe AI.
HONESTY: You are not human, you have no ears, no eyes, you cannot hear, see, feel, sleep or eat. If user asks can you hear me, can you see me, do not say yes. Answer honestly: i am an ai, i cannot hear you, i can only read what you write, if you upload a photo i can see it. If you do not know something, say i do not know, do not hallucinate. If unsure, say i am not sure.
CAPABILITIES: Code writing, site building, landing page, app, code review, bug finding, improving, data splitting, excel/csv, memory search, math, writing, translation, summary, idea generation, photo/video analysis, canvas design. Do not list capabilities unless user asks.
STYLE: Write all answers in lowercase, do not use capital letters. Be friendly, simple, clear. Short question short answer, long question detailed answer. Do not use unnecessary emojis. IF USER WRITES IN TURKISH, ANSWER ONLY IN TURKISH, NEVER IN ENGLISH. IF USER WRITES IN ENGLISH, ANSWER ONLY IN ENGLISH.
REASONING: For hard questions, do not answer immediately, think first, reason step by step, then give best answer. When writing code, first understand request, then write clean code, then briefly explain how it works.
SAFETY: Do not help with harmful, illegal, violent, fraud, hack, virus, fake identity requests. Politely refuse and offer safe alternative.
LIMITS: You have no internet, you do not know current news. If you do not know events after 2026, say i do not know. Do not hallucinate real-time price, weather, stock.
ERRORS: If you make a mistake, apologize and correct it. If user corrects you, do not argue, say you are right and fix it.
`;
const PROVIDERS = [
  { id: "ollama", ad: "Habehabe AI", acik: "Yerel - Ucretsiz - Verin disari cikmaz", acik_en: "Local - Free - Your data stays local", model: "qwen2.5-coder:1.5b" },
  { id: "groq", ad: "Groq - GPT-OSS 20B - FREE", acik: "Free Tier - En hizli bedava", acik_en: "Free Tier - GPT-OSS 20B", model: "openai/gpt-oss-20b", keyUrl: "https://console.groq.com/keys" },
  { id: "gemini", ad: "Google Gemini 2.0 Flash - FREE", acik: "Free Tier - Google bedava", acik_en: "Free Tier - Free from Google", model: "gemini-2.0-flash", keyUrl: "https://aistudio.google.com/apikey" },
  { id: "openrouter", ad: "OpenRouter - Free Modeller", acik: "Free - Tek key 100+ model", acik_en: "Free - One key 100+ models", model: "github/llama-3.3-70b-instruct:free", keyUrl: "https://openrouter.ai/keys" },
  { id: "deepseek", ad: "DeepSeek Chat - Ucuz / Trend", acik: "Cok ucuz - Trend", acik_en: "Very cheap - Trending", model: "deepseek-chat", keyUrl: "https://platform.deepseek.com/api_keys" },
  { id: "openai", ad: "OpenAI - GPT-4o-mini", acik: "Ucretli - En bilinen", acik_en: "Paid - Most known", model: "gpt-4o-mini", keyUrl: "https://platform.openai.com/api-keys" },
  { id: "anthropic", ad: "Anthropic - Claude Sonnet 4", acik: "Ucretli - En kaliteli yazan", acik_en: "Paid - Best writer", model: "claude-sonnet-4-20250514", keyUrl: "https://console.anthropic.com/settings/keys" },
  { id: "mistral", ad: "Mistral - Large", acik: "Avrupa - Hizli", acik_en: "Europe - Fast", model: "mistral-large-latest", keyUrl: "https://console.mistral.ai/api-keys" },
];
export default function App() {
  const [mesajlar, setMesajlar] = useState([]);
  const [girdi, setGirdi] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [menuAcik, setMenuAcik] = useState(false);
  const [dosya, setDosya] = useState(null);
  const dosyaRef = useRef(null);
  const [dosyaTipi, setDosyaTipi] = useState("");
  const [ayarAcik, setAyarAcik] = useState(false);
  const [dil, setDil] = useState(localStorage.getItem("habe_dil") || "tr");
  const [tema, setTema] = useState(localStorage.getItem("habe_tema") || "dark");
  const [github, setGithub] = useState(localStorage.getItem("habe_github") === "1");
  const [profil, setProfil] = useState(localStorage.getItem("habe_profil") || "");
  const [keys, setKeys] = useState(JSON.parse(localStorage.getItem("habe_keys") || "{}"));
  const [gorunenKeyler, setGorunenKeyler] = useState({});
  const toggleKeyGorunum = (id) => {
    setGorunenKeyler((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const [mod, setMod] = useState("aninda");
  const abortRef = useRef(null);
  const gonderKilit = useRef(false);
  const durRef = useRef(false);
  const [aktifProvider, setAktifProvider] = useState(localStorage.getItem("habe_provider") || "groq");
  const [indirme, setIndirme] = useState("mac");
  const tr = dil === "tr";
  const T = { sor: tr ? "> Bir sey sor..." : "> Ask something...", gonder: tr ? "GONDER" : "SEND", dusun: tr ? "Dusunuyor" : "Thinking", bos: tr ? "> Bir sey sor..." : "> Ask something...", ayar: tr ? "Ayarlar" : "Settings", github: tr ? "github Baglantisi" : "github Connection", githubAcik: tr ? "github'a baglan, projelerini senkronize et" : "Connect github, sync your projects", bagli: tr ? "Bagli" : "Connected", bagla: tr ? "Bagla" : "Connect", provider: tr ? "Providerlar - Gercek Baglanti" : "Providers - Real Connection", providerAcik: tr ? "Provider sec, key gir. Key yoksa otomatik yerel Qwen'e doner." : "Pick provider, enter key. No key = fallback to local Qwen.", dilBas: tr ? "Dil / Language" : "Dil / Language", temaBas: tr ? "Tema" : "Theme", koyu: tr ? "Dark" : "Dark", acikTema: tr ? "Light" : "Light", indir: tr ? "Habehabe AI Indir" : "Download Habehabe AI", indirAcik: tr ? "Cihazini sec, QR ile indir" : "Pick your device, download with QR", profilBas: tr ? "Profil" : "Profile", google: tr ? "Google ile Giris Yap" : "Sign in with Google", cikis: tr ? "Cikis Yap" : "Log Out", hos: tr ? "Hos geldin" : "Welcome" };
  useEffect(() => { localStorage.setItem("habe_dil", dil); localStorage.setItem("habe_tema", tema); localStorage.setItem("habe_github", github ? "1" : "0"); localStorage.setItem("habe_profil", profil); localStorage.setItem("habe_keys", JSON.stringify(keys)); localStorage.setItem("habe_provider", aktifProvider); }, [dil, tema, github, profil, keys, aktifProvider]);
  const seciliProvider = PROVIDERS.find((p) => p.id === aktifProvider) || PROVIDERS[0];
  async function provideraSor(soru) {
    const sistemBase = dil === "tr" ? SISTEM_TR : SISTEM_EN;
    const sistem = mod === "dusunme" ? sistemBase + (tr ? "\nDerinlemesine dusun, adim adim akil yurut, sonra en iyi cevabi ver. Tum cevaplari kucuk harflerle yaz." : "\nThink deeply, reason step by step, then give best answer. Write all in lowercase.") : sistemBase + (tr ? "\nKisa, hizli, net cevap ver. Tum cevaplari kucuk harflerle yaz." : "\nShort, fast, clear answer. Write all in lowercase.");
    const key = keys[aktifProvider];
    const habeGroqKey = keys["groq"]; const habeUseGroq = aktifProvider === "ollama" && habeGroqKey; if ((aktifProvider === "ollama" && !habeGroqKey) || (aktifProvider !== "ollama" && !key)) {
      const res = await fetch("http://localhost:8000/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "qwen2.5-coder:1.5b", stream: true, messages: [{ role: "system", content: sistem }, { role: "user", content: soru }] }) });
      const data = await res.json(); return data.message.content;
    }
    if (aktifProvider === "gemini") {
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + key, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: sistem + "\n\nKullanici: " + soru }] }] }) });
      const data = await res.json(); if (data.error) throw new Error(data.error.message); return data.candidates[0].content.parts[0].text;
    }
    if (aktifProvider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, system: sistem, messages: [{ role: "user", content: soru }] }) });
      const data = await res.json(); if (data.error) throw new Error(data.error.message); return data.content[0].text;
    }
    const urlMap = { groq: "https://api.groq.com/openai/v1/chat/completions", openai: "https://api.openai.com/v1/chat/completions", deepseek: "https://api.deepseek.com/v1/chat/completions", openrouter: "https://openrouter.ai/api/v1/chat/completions", mistral: "https://api.mistral.ai/v1/chat/completions" };
    const res = await fetch(urlMap[efektif], { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key, ...(efektif === "openrouter" ? { "HTTP-Referer": window.location.href, "X-Title": "Habehabe AI" } : {}) }, body: JSON.stringify({ model: seciliProvider.model, messages: [{ role: "system", content: sistem }, { role: "user", content: soru }] }) });
    const data = await res.json(); if (data.error) throw new Error(data.error.message || JSON.stringify(data.error)); return data.choices[0].message.content;
  }
  function menuSec(ad, tip, prompt) { setMenuAcik(false); if (prompt) { setGirdi(prompt); return; } setDosyaTipi(ad); dosyaRef.current.accept = tip; dosyaRef.current.click(); }


  function baglantiYap(metin) {
    if (!metin) return metin;
    const parcalar = metin.split(/(https?:\/\/[^\s)]+|www\.[^\s)]+|[a-z0-9-]+\.(com|org|net|gov|int|io|edu|tr|co|ai)(\/[^\s)]*)?)/gi);
    return parcalar.map((parca, i) => {
      if (!parca) return null;
      const linkMi = /^(https?:\/\/|www\.)/i.test(parca) || /^[a-z0-9-]+\.(com|org|net|gov|int|io|edu|tr|co|ai)(\/.*)?$/i.test(parca);
      if (linkMi) {
        const href = parca.startsWith("http") ? parca : "https://" + parca;
        return <a key={i} href={href} target="_blank" rel="noreferrer" style={{ color: "#00ff66", textDecoration: "underline", wordBreak: "break-all" }}>{parca}</a>;
      }
      return <span key={i}>{parca}</span>;
    });
  }
  async function akislaSor(soru, onChunk) {
    const sistemBase = dil === "tr" ? SISTEM_TR : SISTEM_EN;
    const sistem = mod === "duzelt" ? sistemBase + (tr ? "\nSen bir kod duzeltme uzmani sin. Kodu oku, hatayi bul, neden hata verdigini basitce anlat, sonra duzeltilmis halini tam olarak ver. Sadece duzeltilmis kodu da ver, eksik birakma." : "\nYou are a code fix expert. Read code, find bug, explain why it fails simply, then give full fixed code.") : mod === "tersine" ? sistemBase + (tr ? "\nSen bir tersine muhendislik uzmani sin. Kodu analiz et, ne yaptigini, nasil calistigini, gizli fonksiyonlari, guvenlik aciklarini adim adim anlat. Kodu satir satir coz." : "\nYou are a reverse engineering expert. Analyze code, explain what it does, how it works, hidden functions, security issues step by step.") : sistemBase;
    // Habehabe AI seciliyse ve Groq key varsa direkt Groq kullan
    const efektif = (aktifProvider === "ollama" && keys["groq"]) ? "groq" : aktifProvider;
    const efektifKey = keys[efektif] || keys["groq"] || "";
    const efektifModel = efektif === "groq" ? "openai/gpt-oss-20b" : seciliProvider.model;
    // Yerel - sadece Groq key yoksa
    if (efektif === "ollama") {
      const res = await fetch("http://localhost:8000/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, signal: abortRef.current ? abortRef.current.signal : undefined, body: JSON.stringify({ model: "qwen2.5-coder:1.5b", stream: true, messages: [{ role: "system", content: sistem }, { role: "user", content: soru }] }) });
      if (!res.ok) throw new Error("Ollama calismiyor, Groq key gir veya Ollama baslat");
      const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = ""; let tam = "";
      while (true) { const { done, value } = await reader.read(); if (done) break; buf += dec.decode(value, { stream: true }); const satirlar = buf.split(String.fromCharCode(10)); buf = satirlar.pop(); for (const s of satirlar) { if (!s.trim()) continue; try { const j = JSON.parse(s); const parca = j.message ? j.message.content : ""; if (parca) { tam += parca; onChunk(parca); } } catch(e){} } }
      if (!tam) throw new Error("Yerel model bos cevap verdi, Groq kullan");
      return tam;
    }
    if (efektif === "gemini" || efektif === "anthropic") {
      const tam = await provideraSor(soru); onChunk(tam); return tam;
    }
    const urlMap = { groq: "https://api.groq.com/openai/v1/chat/completions", openai: "https://api.openai.com/v1/chat/completions", deepseek: "https://api.deepseek.com/v1/chat/completions", openrouter: "https://openrouter.ai/api/v1/chat/completions", mistral: "https://api.mistral.ai/v1/chat/completions" };
    const res = await fetch(urlMap[efektif], { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + efektifKey, ...(efektif === "openrouter" ? { "HTTP-Referer": window.location.href, "X-Title": "Habehabe AI" } : {}) }, signal: abortRef.current ? abortRef.current.signal : undefined, body: JSON.stringify({ model: efektifModel, stream: true, messages: [{ role: "system", content: sistem }, { role: "user", content: soru }] }) });
    if (!res.ok) { const ej = await res.json().catch(()=>({})); throw new Error(ej.error ? (ej.error.message || JSON.stringify(ej.error)) : "Provider hatasi " + res.status); }
    const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = ""; let tam = "";
    while (true) { const { done, value } = await reader.read(); if (done) break; buf += dec.decode(value, { stream: true }); const satirlar = buf.split(String.fromCharCode(10)); buf = satirlar.pop(); for (const s of satirlar) { if (!s.startsWith("data:")) continue; const d = s.slice(5).trim(); if (d === "[DONE]") break; try { const j = JSON.parse(d); const parca = j.choices && j.choices[0] && j.choices[0].delta ? j.choices[0].delta.content : ""; if (parca) { tam += parca; onChunk(parca); } } catch(e){} } }
    return tam;
  }
  async function gonder(e) {
    e.preventDefault(); if (gonderKilit.current) return; gonderKilit.current = true;
    const soru = girdi.trim(); if (!soru && !dosya) return;
    // Habehabe AI = Groq beyni - Habehabe seciliyse ve Groq key varsa Groq kullan
    let efektifProvider = aktifProvider;
    const eskiProvider = aktifProvider;
    if (aktifProvider === "ollama" && keys["groq"]) { setAktifProvider("groq"); }
    if (aktifProvider === "ollama" && keys["groq"]) { efektifProvider = "groq"; }
    // Habehabe AI = Groq beyni - Habehabe seciliyse ve Groq key varsa Groq kullan
    if (aktifProvider === "ollama" && keys["groq"]) { setAktifProvider("groq"); }
    if (aktifProvider === "ollama" && keys["groq"]) { efektifProvider = "groq"; }
    const goster = dosya ? soru + " [" + dosyaTipi + ": " + dosya.name + "]" : soru;
    setMesajlar([...mesajlar, { rol: "kullanici", icerik: goster }]);
    setGirdi("");
    setDosya(null);
    const kucukSoru = goster.toLowerCase();
    if (kucukSoru.includes("duyab") || kucukSoru.includes("duyuyor")) {
      setMesajlar((m) => [...m, { rol: "asistan", icerik: (kucukSoru.includes("merhaba") || kucukSoru.includes("beni") || kucukSoru.includes("turk") || /[cghiosu]/.test(kucukSoru) || kucukSoru.includes("duyab")) ? "merhaba, ben bir yapay zekayim, seni duyamam, sadece yazdiklarini okuyabiliyorum. hangi konuda yardim etmemi istersen soyle, yardimci olayim." : "hello, i am an ai, i cannot hear you, i can only read what you write. how can i help you?", via: "Habehabe AI" }]);
      setGirdi(""); setDosya(null); return;
    }
    if (kucukSoru.includes("duyab") || kucukSoru.includes("duyuyor")) {
      
      setGirdi(""); setDosya(null); return;
    }
    try {
      durRef.current = false;
      abortRef.current = new AbortController();
      setMesajlar((m) => [...m, { rol: "asistan", icerik: "", yaziyor: true, via: seciliProvider.id === "ollama" ? "Habehabe AI - Yerel" : seciliProvider.ad + " • " + seciliProvider.model }]);

      let hamMetin = "";
      let akisBitti = false;
      let akisHata = null;

      const akisPromise = akislaSor(goster, (parca) => {
        hamMetin += parca;
      }).then((tam) => {
        if (tam && !hamMetin) hamMetin = tam;
        akisBitti = true;
      }).catch((err) => {
        akisHata = err;
        akisBitti = true;
      });

      let gosterilenMetin = "";
      let eklenenCumleler = [];
      let sonCumleIndex = 0;

      while (!durRef.current) {
        if (akisHata) throw akisHata;

        const cumleler = hamMetin.match(/[^.!?\n]+([.!?\n]+|$)/g) || (hamMetin ? [hamMetin] : []);
        const tamSayi = akisBitti ? cumleler.length : (cumleler.length > 1 ? cumleler.length - 1 : 0);

        if (sonCumleIndex < tamSayi) {
          const yeniCumle = cumleler[sonCumleIndex];
          gosterilenMetin += yeniCumle;
          eklenenCumleler.push(yeniCumle);
          sonCumleIndex++;
          const devamEdiyor = sonCumleIndex < cumleler.length || !akisBitti;
          setMesajlar((m) => {
            const k = [...m];
            const son = k[k.length - 1];
            if (son && son.rol === "asistan") {
              k[k.length - 1] = { ...son, icerik: gosterilenMetin, cumleler: [...eklenenCumleler], yaziyor: devamEdiyor };
            }
            return k;
          });
          if (devamEdiyor && !durRef.current) {
            await new Promise((r) => setTimeout(r, 700));
          }
        } else if (akisBitti) {
          if (sonCumleIndex < cumleler.length) {
            const kalan = cumleler[sonCumleIndex];
            gosterilenMetin += kalan;
            eklenenCumleler.push(kalan);
            sonCumleIndex++;
          }
          setMesajlar((m) => {
            const k = [...m];
            const son = k[k.length - 1];
            if (son && son.rol === "asistan") {
              k[k.length - 1] = { ...son, icerik: gosterilenMetin || hamMetin, cumleler: eklenenCumleler.length ? [...eklenenCumleler] : [hamMetin], yaziyor: false };
            }
            return k;
          });
          break;
        } else {
          await new Promise((r) => setTimeout(r, 40));
        }
      }

      await akisPromise.catch(() => {});
      if (durRef.current) {
        setMesajlar((m) => {
          const k = [...m];
          const son = k[k.length - 1];
          if (son && son.rol === "asistan") {
            k[k.length - 1] = { ...son, yaziyor: false };
          }
          return k;
        });
      }
    } catch (err) { /* OTOMATIK YEDEK: Groq limit dolarsa Gemini dene */ if (String(err.message).toLowerCase().includes("limit") || String(err.message).includes("429") || String(err.message).toLowerCase().includes("rate")) { try { const yedekKey = keys["gemini"]; if (yedekKey) { setMesajlar((m) => [...m, { rol: "asistan", icerik: "groq limit doldu, gemini yedegine geciyorum...", via: "Otomatik Yedek" }]); } } catch(e){} }
      if (err.name === "AbortError") {
        setMesajlar((m) => [...m, { rol: "asistan", icerik: tr ? "Durduruldu" : "Stopped" }]);
      } else {
        setMesajlar((m) => [...m, { rol: "asistan", icerik: "Provider hatasi: " + err.message, via: seciliProvider.ad }]);
      }
    }
    setYukleniyor(false); gonderKilit.current = false; if (eskiProvider === "ollama" && keys["groq"]) { setAktifProvider("ollama"); }
  }
  const koyu = tema === "dark";
  const bg = koyu ? "#0d1410" : "#f5f5f0";
  const kart = koyu ? "#0f1814" : "#ffffff";
  const yazi = koyu ? "#c5d1cf" : "#1a2420";
  const sinir = koyu ? "#2d3d35" : "#d9d9d0";
  const dim = koyu ? "#6b7975" : "#888888";
  const INDIRMELER = [{ id: "mac", ad: "Mac", link: "https://habehabe.ai/download/mac", acik: "macOS" }, { id: "ios", ad: "iOS", link: "https://habehabe.ai/download/ios", acik: "iPhone" }, { id: "android", ad: "Android", link: "https://habehabe.ai/download/android", acik: "Android" }];
  const seciliIndirme = INDIRMELER.find((x) => x.id === indirme);
  return (
    <div style={{ maxWidth: "70ch", margin: "0 auto", padding: "0 24px", minHeight: "100vh", backgroundImage: "url(/sol.png)", backgroundRepeat: "no-repeat", backgroundPosition: "left center", backgroundSize: "280px 100%", width: "100%", background: "transparent", display: "flex", flexDirection: "column", background: bg, color: yazi }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, marginBottom: 24 }}>
        <button onClick={() => setAyarAcik(true)} style={{ background: "none", border: "none", color: yazi, cursor: "pointer", fontSize: 13, padding: 0 }}>{T.ayar}</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, color: "#c5d1cf", lineHeight: 1 }}>λ</span>
          <span style={{ fontWeight: 800, fontSize: 20, color: "#ff6600", lineHeight: 1 }}>Habehabe AI</span>
        </div>
      </header>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
  <span style={{ fontSize: 12, color: dim }}>Model:</span>
  <select value={aktifProvider} onChange={(e) => setAktifProvider(e.target.value)} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: kart, color: yazi, border: "1px solid " + sinir, fontFamily: "monospace", cursor: "pointer", outline: "none" }}>
    {PROVIDERS.map((pr) => (<option key={pr.id} value={pr.id}>{pr.id === "ollama" ? pr.ad : pr.ad + " - " + pr.model} {pr.id !== "ollama" && !keys[pr.id] ? "(Key yok)" : ""}</option>))}
  </select>
  <button onClick={() => setAyarAcik(true)} style={{ padding: "8px 12px", borderRadius: 8, background: kart, color: yazi, border: "1px solid " + sinir, cursor: "pointer", fontSize: 12 }}>{tr ? "Key Gir" : "Add Key"}</button>
</div>
<div style={{ flex: 1, border: "1px solid " + sinir, borderRadius: 12, padding: 16, background: kart, margin: "16px 0" }}>
        {mesajlar.length === 0 && <div style={{ color: dim }}>{T.bos}</div>}
        {mesajlar.map((m, i) => (
          <div key={i} style={{ marginBottom: 16, borderLeft: m.rol === "kullanici" ? "4px solid #ff6600" : "4px solid #00ff66", paddingLeft: 12, whiteSpace: "pre-wrap" }}>
            <div style={{ fontSize: 12, color: dim }}>{m.rol === "kullanici" ? "SEN >" : "HABEHABE >"}</div>
            <div>
              {m.cumleler && m.cumleler.length > 0 ? (
                m.cumleler.map((c, cIdx) => (
                  <span
                    key={cIdx}
                    style={{
                      display: "inline-block",
                      animation: "cumleGiris 0.4s ease-out forwards"
                    }}
                  >
                    {baglantiYap(c)}
                  </span>
                ))
              ) : (
                baglantiYap(m.icerik)
              )}
              {m.yaziyor && (
                <span className="loading-dots" style={{ color: "#ff8c00", fontWeight: "bold", marginLeft: 6, display: "inline-block" }}>
                  <span>.</span><span>.</span><span>.</span>
                </span>
              )}
            </div>
            {m.via && <div style={{ fontSize: 11, color: dim, marginTop: 6 }}>via {m.via}</div>}
          </div>
        ))}
        {yukleniyor && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "8px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#ff8c00" }}>
              <span className="loading-lambda">λ</span>
              <span>{T.dusun}</span>
              <span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>
            </div>
            <button
              type="button"
              onClick={() => {
                durRef.current = true;
                if (abortRef.current) abortRef.current.abort();
                setYukleniyor(false);
                setMesajlar((m) => m.map((msg) => ({ ...msg, yaziyor: false })));
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 6,
                background: "#ff3333",
                color: "#fff",
                border: "none",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              <span>⏹</span> {tr ? "Durdur" : "Stop"}
            </button>
          </div>
        )}
      </div>
      {dosya && (<div style={{ padding: "8px 12px", background: kart, border: "1px solid " + sinir, borderRadius: 8, fontSize: 13, marginBottom: 8 }}>{dosyaTipi}: {dosya.name} <button onClick={() => setDosya(null)} style={{ background: "none", border: "none", color: "#ff6600", cursor: "pointer", marginLeft: 8 }}>✕</button></div>)}
      <div style={{ position: "relative", marginBottom: 32 }}>
        {menuAcik && (<div style={{ position: "absolute", bottom: 60, left: 0, background: kart, border: "1px solid " + sinir, borderRadius: 12, padding: 8, width: 240, zIndex: 10 }}>
          <button onClick={() => menuSec(tr ? "Fotograf" : "Photo", "image/*", "")} style={{ display: "block", width: "100%", padding: "10px 8px", background: "transparent", border: "none", color: yazi, cursor: "pointer", textAlign: "left" }}>{tr ? "Fotograf" : "Photo"}</button>
          <button onClick={() => menuSec("Video", "video/*", "")} style={{ display: "block", width: "100%", padding: "10px 8px", background: "transparent", border: "none", color: yazi, cursor: "pointer", textAlign: "left" }}>{tr ? "Video" : "Video"}</button>
          <button onClick={() => menuSec("PDF", ".pdf", "")} style={{ display: "block", width: "100%", padding: "10px 8px", background: "transparent", border: "none", color: yazi, cursor: "pointer", textAlign: "left" }}>{tr ? "PDF" : "PDF"}</button>
          <button onClick={() => menuSec("Canvas", "", tr ? "Canvas ile bana bir tasarim ciz: " : "Draw me a design with Canvas: ")} style={{ display: "block", width: "100%", padding: "10px 8px", background: "transparent", border: "none", color: yazi, cursor: "pointer", textAlign: "left" }}>{tr ? "Canvas" : "Canvas"}</button>
          <button onClick={() => menuSec(tr ? "Dosya" : "File", "*/*", "")} style={{ display: "block", width: "100%", padding: "10px 8px", background: "transparent", border: "none", color: yazi, cursor: "pointer", textAlign: "left" }}>{tr ? "Dosya" : "File"}</button>
        </div>)}
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
  <button type="button" onClick={() => setMod("aninda")} style={{ padding: "6px 14px", borderRadius: 20, background: mod === "aninda" ? "#ff6600" : kart, color: mod === "aninda" ? "#000" : yazi, border: "1px solid " + sinir, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{tr ? "Aninda" : "Instant"}</button>
  <button type="button" onClick={() => setMod("dusunme")} style={{ padding: "6px 14px", borderRadius: 20, background: mod === "dusunme" ? "#00ff66" : kart, color: mod === "dusunme" ? "#000" : yazi, border: "1px solid " + sinir, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{tr ? "Dusunerek" : "Thinking"}</button>
  <button type="button" onClick={() => setMod("tersine")} style={{ padding: "6px 14px", borderRadius: 20, background: mod === "tersine" ? "#00ff66" : kart, color: mod === "tersine" ? "#000" : yazi, border: "1px solid " + sinir, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{tr ? "Tersine" : "Reverse"}</button>
  <button type="button" onClick={() => setMod("duzelt")} style={{ padding: "6px 14px", borderRadius: 20, background: mod === "duzelt" ? "#ff6600" : kart, color: mod === "duzelt" ? "#000" : yazi, border: "1px solid " + sinir, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{tr ? "Duzelt" : "Fix"}</button>
  <span style={{ fontSize: 11, color: dim, alignSelf: "center" }}>{mod === "aninda" ? (tr ? "Hizli cevap" : "Fast answer") : (tr ? "Derin dusunup cevapliyor" : "Thinking deeply")}</span>
</div>
<form onSubmit={gonder} style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button type="button" onClick={() => setMenuAcik(!menuAcik)} style={{ width: 44, height: 44, flexShrink: 0, borderRadius: "50%", background: menuAcik ? "#ff6600" : kart, color: menuAcik ? "#000" : "#ff6600", border: "1px solid " + sinir, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          <input value={girdi} onChange={(e) => setGirdi(e.target.value)} placeholder={T.sor} style={{ flex: 1, padding: 14, borderRadius: 8, background: kart, color: yazi, border: "1px solid " + sinir, fontFamily: "monospace", outline: "none" }} />
          <button
            type="button"
            onClick={() => { durRef.current = true; if (abortRef.current) abortRef.current.abort(); setYukleniyor(false); setMesajlar((m) => m.map((msg) => ({ ...msg, yaziyor: false }))); }}
            title={tr ? "Durdur" : "Stop"}
            style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              padding: 0,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              background: kart,
              color: yukleniyor ? "#ff6600" : dim,
              border: "1px solid " + sinir,
              cursor: yukleniyor ? "pointer" : "not-allowed",
              opacity: yukleniyor ? 1 : 0.4
            }}
          >
            ■
          </button>
          <button
            type="submit"
            style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              padding: 0,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              background: "#ff6600",
              color: "#000",
              fontWeight: 800,
              border: "none",
              cursor: "pointer"
            }}
          >
            ➤
          </button>
        </form>
      </div>
      <input type="file" ref={dosyaRef} style={{ display: "none" }} onChange={(e) => setDosya(e.target.files[0])} />
      {ayarAcik && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "flex-end", zIndex: 60 }} onClick={() => setAyarAcik(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 440, maxWidth: "94vw", background: "#0c130f", color: yazi, display: "flex", flexDirection: "column", height: "100%", borderLeft: "1px solid #223028", boxShadow: "-8px 0 28px rgba(0,0,0,0.6)" }}>
            
            {/* Üst Başlık */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #223028", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f1712" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#ff6600", letterSpacing: "0.4px" }}>{T.ayar}</div>
                <div style={{ fontSize: 11, color: dim, marginTop: 2 }}>{tr ? "Sistem ve model yapılandırması" : "System & model configuration"}</div>
              </div>
              <button onClick={() => setAyarAcik(false)} style={{ background: "#16201b", border: "1px solid #28372f", color: yazi, width: 30, height: 30, borderRadius: 6, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            {/* Kaydırılabilir İçerik */}
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 18 }}>

              {/* BÖLÜM 1: Hesap & Senkronizasyon */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#8a9994", marginBottom: 8 }}>
                  {tr ? "1. Hesap & Senkronizasyon" : "1. Account & Sync"}
                </div>
                <div style={{ background: "#121b16", border: "1px solid #223028", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{T.profilBas}</div>
                    {profil ? (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, background: "#080e0b", padding: "8px 12px", borderRadius: 6, border: "1px solid #223028" }}>
                        <span style={{ fontSize: 13 }}>{T.hos}, <b>{profil}</b></span>
                        <button onClick={() => setProfil("")} style={{ padding: "4px 10px", borderRadius: 6, background: "#ff6600", color: "#000", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{T.cikis}</button>
                      </div>
                    ) : (
                      <button onClick={() => { const ad = prompt(tr ? "Google kullanıcı adınız?" : "Google username?"); if (ad) setProfil(ad); }} style={{ marginTop: 8, width: "100%", padding: "9px 12px", borderRadius: 6, background: "#1a2420", color: "#e5ecea", border: "1px solid #2d3d35", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                        G {T.google}
                      </button>
                    )}
                  </div>

                  <div style={{ height: 1, background: "#1a2420" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{T.github}</div>
                      <div style={{ fontSize: 11, color: dim, marginTop: 2 }}>{T.githubAcik}</div>
                    </div>
                    <button onClick={() => setGithub(!github)} style={{ padding: "6px 14px", borderRadius: 6, background: github ? "#1c3227" : "#1a2420", color: github ? "#72d59c" : dim, border: github ? "1px solid #274b39" : "1px solid #2d3d35", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {github ? `✓ ${T.bagli}` : T.bagla}
                    </button>
                  </div>
                </div>
              </div>

              {/* BÖLÜM 2: Model Sağlayıcıları & Anahtarlar */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#8a9994", marginBottom: 8 }}>
                  {tr ? "2. Model Sağlayıcıları & API Anahtarları" : "2. AI Providers & API Keys"}
                </div>
                <div style={{ fontSize: 11.5, color: dim, marginBottom: 10 }}>{T.providerAcik}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {PROVIDERS.map((pr) => {
                    const isSecili = aktifProvider === pr.id;
                    const keyVar = !!keys[pr.id];
                    const isGorunur = !!gorunenKeyler[pr.id];
                    return (
                      <div
                        key={pr.id}
                        style={{
                          background: isSecili ? "#131e17" : "#0f1612",
                          border: isSecili ? "1px solid #ff6600" : "1px solid #223028",
                          borderRadius: 8,
                          padding: "10px 12px"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <label style={{ display: "flex", gap: 10, cursor: "pointer", flex: 1 }}>
                            <input
                              type="radio"
                              name="provider_choice"
                              checked={isSecili}
                              onChange={() => setAktifProvider(pr.id)}
                              style={{ marginTop: 3, accentColor: "#ff6600" }}
                            />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: isSecili ? "#ff8c00" : yazi }}>
                                {pr.ad}
                              </div>
                              <div style={{ fontSize: 11, color: dim, marginTop: 2 }}>
                                {tr ? pr.acik : pr.acik_en}
                                {pr.id !== "ollama" ? ` • Model: ${pr.model}` : ""}
                              </div>
                            </div>
                          </label>
                          {pr.id !== "ollama" && (
                            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: keyVar ? "#182a20" : "#282017", color: keyVar ? "#72d59c" : "#d97706", border: keyVar ? "1px solid #234130" : "1px solid #573210" }}>
                              {keyVar ? (tr ? "Key Ekli" : "Key Set") : (tr ? "Key Yok" : "No Key")}
                            </span>
                          )}
                        </div>

                        {pr.id !== "ollama" && (
                          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1a2420" }}>
                            {/* Maskeli Key Girdisi */}
                            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                              <input
                                type={isGorunur ? "text" : "password"}
                                value={keys[pr.id] || ""}
                                onChange={(e) => setKeys({ ...keys, [pr.id]: e.target.value })}
                                placeholder={tr ? `${pr.ad} API Anahtarı...` : `${pr.ad} API Key...`}
                                style={{
                                  width: "100%",
                                  padding: "8px 75px 8px 10px",
                                  borderRadius: 6,
                                  background: "#080d0a",
                                  color: yazi,
                                  border: "1px solid #233028",
                                  fontFamily: "monospace",
                                  fontSize: 12,
                                  boxSizing: "border-box"
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => toggleKeyGorunum(pr.id)}
                                style={{
                                  position: "absolute",
                                  right: 6,
                                  padding: "3px 8px",
                                  background: "#16201b",
                                  color: dim,
                                  border: "1px solid #2a3a32",
                                  borderRadius: 4,
                                  fontSize: 10,
                                  cursor: "pointer"
                                }}
                              >
                                {isGorunur ? (tr ? "Gizle" : "Hide") : (tr ? "Göster" : "Show")}
                              </button>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                              <a
                                href={pr.keyUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontSize: 11, color: "#ff8c00", textDecoration: "none" }}
                              >
                                {tr ? "Key al →" : "Get key →"}
                              </a>
                              <button
                                type="button"
                                onClick={async () => {
                                  setAktifProvider(pr.id);
                                  try {
                                    const r = await provideraSor(tr ? "Merhaba, test" : "Hello, test");
                                    alert(tr ? "Bağlantı Başarılı: " + r.slice(0, 100) : "Connected: " + r.slice(0, 100));
                                  } catch (e) {
                                    alert((tr ? "Bağlantı Hatası: " : "Connection Error: ") + e.message);
                                  }
                                }}
                                style={{
                                  padding: "5px 12px",
                                  borderRadius: 6,
                                  background: "#18221c",
                                  color: "#ff8c00",
                                  border: "1px solid #2d3e33",
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: "pointer"
                                }}
                              >
                                {tr ? "Bağlan / Test Et" : "Connect / Test"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BÖLÜM 3: Görünüm & Tercihler */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#8a9994", marginBottom: 8 }}>
                  {tr ? "3. Görünüm & Tercihler" : "3. Appearance & Preferences"}
                </div>
                <div style={{ background: "#121b16", border: "1px solid #223028", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{T.dilBas}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setDil("tr")} style={{ flex: 1, padding: "8px", borderRadius: 6, background: dil === "tr" ? "#ff6600" : "#1a2420", color: dil === "tr" ? "#000" : yazi, border: "1px solid #2d3d35", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Türkçe</button>
                      <button onClick={() => setDil("en")} style={{ flex: 1, padding: "8px", borderRadius: 6, background: dil === "en" ? "#ff6600" : "#1a2420", color: dil === "en" ? "#000" : yazi, border: "1px solid #2d3d35", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>English</button>
                    </div>
                  </div>

                  <div style={{ height: 1, background: "#1a2420" }} />

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{T.temaBas}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setTema("dark")} style={{ flex: 1, padding: "8px", borderRadius: 6, background: tema === "dark" ? "#ff6600" : "#1a2420", color: tema === "dark" ? "#000" : yazi, border: "1px solid #2d3d35", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{T.koyu}</button>
                      <button onClick={() => setTema("light")} style={{ flex: 1, padding: "8px", borderRadius: 6, background: tema === "light" ? "#ff6600" : "#1a2420", color: tema === "light" ? "#000" : yazi, border: "1px solid #2d3d35", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{T.acikTema}</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* BÖLÜM 4: Cihaz Senkronizasyonu */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#8a9994", marginBottom: 8 }}>
                  {tr ? "4. Cihaz Senkronizasyonu" : "4. Device Sync"}
                </div>
                <div style={{ background: "#121b16", border: "1px solid #223028", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11.5, color: dim, marginBottom: 10 }}>{T.indirAcik}</div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                    {INDIRMELER.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setIndirme(d.id)}
                        style={{
                          flex: 1,
                          padding: "7px 10px",
                          borderRadius: 6,
                          background: indirme === d.id ? "#ff6600" : "#1a2420",
                          color: indirme === d.id ? "#000" : yazi,
                          border: "1px solid #2d3d35",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        {d.ad}
                      </button>
                    ))}
                  </div>
                  <div style={{ textAlign: "center", background: "#080e0b", border: "1px solid #223028", padding: 14, borderRadius: 8 }}>
                    <img src={"https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=" + encodeURIComponent(seciliIndirme.link)} alt="QR" style={{ width: 130, height: 130, borderRadius: 4, display: "inline-block" }} />
                    <div style={{ color: dim, fontSize: 11.5, marginTop: 8 }}>{seciliIndirme.ad} • {seciliIndirme.acik}</div>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "center", fontSize: 11, color: dim, padding: "8px 0" }}>Habehabe AI • 2026</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}