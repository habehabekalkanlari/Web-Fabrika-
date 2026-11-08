import json
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from agents.pandas_agent import PandasAgent
from agents.meta_agent import MetaAgent
from agents.laya_agent import LayaAgent
from agents.chromadb_memory import ChromaMemory

from google import genai
from google.genai import types

app = FastAPI(title="Habehabe AI - Web Fabrika")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ajanların başlatılması (Singleton)
pandas_agent = PandasAgent()
meta_agent = MetaAgent()
laya_agent = LayaAgent()
memory = ChromaMemory()

def get_gemini_api_key():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        env_path = Path(".env.local")
        if env_path.exists():
            for line in env_path.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip().strip("'\"")
                    if k in ("GEMINI_API_KEY", "GOOGLE_API_KEY"):
                        api_key = v
                        break
    return api_key

def run_agent_pipeline(istek: str):
    """
    İstek sırası:
    1. chromadb_memory: Hafızada önceki benzer kayıtları tara
    2. pandas_agent: İstegi parçala ve bileşenleri planla
    3. meta_agent: Kod üret (Qwen 1.5B + Tailwind)
    4. laya_agent: Üretilen kodu denetle
    5. chromadb_memory: Üretilen kodu hafızaya kaydet
    """
    # 1. Chroma Memory kontrolü
    hafiza = memory.ara(istek)

    # 2. Pandas Agent - Planla
    if hasattr(pandas_agent, "isegi_parcala"):
        df = pandas_agent.isegi_parcala(istek)
    else:
        df = pandas_agent.istegi_parcala(istek)
    bilesenler = df["bilesen"].tolist() if "bilesen" in df else []

    # 3. Meta Agent - Kod üret
    kod = meta_agent.kod_uret(bilesenler=bilesenler, hafiza=hafiza, istek=istek)

    # 4. Laya Agent - Denetle
    denetim = laya_agent.karar_ver(kod)

    # 5. Chroma Memory - Kaydet
    ad_etiketi = istek.strip()[:25].replace(" ", "_")
    memory.kaydet(ad_etiketi, kod)

    return {
        "istek": istek,
        "bilesenler": bilesenler,
        "denetim": denetim,
        "kod": kod
    }

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "Habehabe AI Web Fabrika",
        "agents": ["pandas_agent", "meta_agent", "laya_agent", "chromadb_memory"]
    }

@app.post("/api/generate")
def generate(data: dict):
    istek = data.get("istek", "").strip()
    if not istek and "messages" in data:
        for m in reversed(data["messages"]):
            if m.get("role") == "user":
                istek = m.get("content", "").strip()
                break
    if not istek:
        raise HTTPException(status_code=400, detail="Lütfen bir istek belirtin.")

    sonuc = run_agent_pipeline(istek)
    bilesen_str = ", ".join(sonuc["bilesenler"])
    denetim_str = ", ".join(sonuc["denetim"])
    cevap_metni = (
        f"🚀 Web Fabrika Ajan Zinciri Çalıştırıldı:\n\n"
        f"• [PANDAS AGENT] Planlanan Bileşenler: {bilesen_str}\n"
        f"• [META AGENT] HTML/Tailwind kodu başarıyla üretildi.\n"
        f"• [LAYA AGENT] Denetim Raporu: {denetim_str}\n"
        f"• [CHROMA HAFIZA] Kod vektör belleğine kaydedildi.\n\n"
        f"```html\n{sonuc['kod']}\n```"
    )
    sonuc["cevap"] = cevap_metni
    sonuc["message"] = {"role": "assistant", "content": cevap_metni}
    return sonuc

@app.post("/api/chat")
def chat(data: dict):
    # İstek metnini hem "istek" hem de Ollama "messages" şemasından çıkar
    istek = data.get("istek", "").strip()
    if not istek and "messages" in data:
        for m in reversed(data["messages"]):
            if m.get("role") == "user":
                istek = m.get("content", "").strip()
                break
        if not istek and data["messages"]:
            istek = data["messages"][-1].get("content", "").strip()

    is_stream = bool(data.get("stream", False))
    if not istek:
        bos_msg = "Lütfen bir istek veya soru yazın."
        if is_stream:
            def bos_stream():
                yield (json.dumps({"message": {"role": "assistant", "content": bos_msg}}) + "\n").encode("utf-8")
            return StreamingResponse(bos_stream(), media_type="application/x-ndjson")
        return {"message": {"role": "assistant", "content": bos_msg}, "cevap": bos_msg}

    mode = data.get("mode", "")
    uretim_kelimeleri = [
        "yap", "üret", "uret", "kod", "site", "landing", "sayfa",
        "tasarla", "oluştur", "olustur", "html", "web", "arayüz", "arayuz", "app"
    ]
    istek_kucuk = istek.lower()
    is_generate_intent = mode == "generate" or any(w in istek_kucuk for w in uretim_kelimeleri)

    if is_generate_intent:
        sonuc = run_agent_pipeline(istek)
        bilesen_str = ", ".join(sonuc["bilesenler"])
        denetim_str = ", ".join(sonuc["denetim"])
        cevap_metni = (
            f"🚀 Web Fabrika Ajan Zinciri Çalıştırıldı:\n\n"
            f"• [PANDAS AGENT] Planlanan Bileşenler: {bilesen_str}\n"
            f"• [META AGENT] HTML/Tailwind kodu başarıyla üretildi.\n"
            f"• [LAYA AGENT] Denetim Raporu: {denetim_str}\n"
            f"• [CHROMA HAFIZA] Kod belleğe kaydedildi.\n\n"
            f"```html\n{sonuc['kod']}\n```"
        )
        if is_stream:
            def stream_agent():
                yield (json.dumps({
                    "model": "habehabe-ai",
                    "message": {"role": "assistant", "content": cevap_metni},
                    "done": True
                }) + "\n").encode("utf-8")
            return StreamingResponse(stream_agent(), media_type="application/x-ndjson")

        sonuc["cevap"] = cevap_metni
        sonuc["message"] = {"role": "assistant", "content": cevap_metni}
        return sonuc

    # Genel sohbet - Google Gemini SDK ile yanıtla
    try:
        api_key = get_gemini_api_key()
        if not api_key:
            hata_msg = "Gemini API anahtarı (.env.local) bulunamadı. Lütfen GEMINI_API_KEY veya GOOGLE_API_KEY tanımlayın."
            if is_stream:
                def stream_err():
                    yield (json.dumps({"message": {"role": "assistant", "content": hata_msg}, "done": True}) + "\n").encode("utf-8")
                return StreamingResponse(stream_err(), media_type="application/x-ndjson")
            return {"message": {"role": "assistant", "content": hata_msg}, "cevap": hata_msg}

        client = genai.Client(api_key=api_key)

        sistem_prompt = (
            "Sen Habehabe AI'sin. Meta Agent (kod/site yapma), Laya Agent (denetim), "
            "Pandas Agent (planlama) ve Chroma Hafıza ajanlarından oluşan bir Web Fabrikasısın. "
            "Türkçe, kısa ve net cevap ver."
        )

        contents = []
        raw_messages = data.get("messages") or [{"role": "user", "content": istek}]
        for m in raw_messages:
            r = m.get("role")
            c = m.get("content", "").strip()
            if not c or r == "system":
                continue
            gemini_role = "model" if r == "assistant" else "user"
            contents.append(types.Content(role=gemini_role, parts=[types.Part(text=c)]))

        if not contents:
            contents = [types.Content(role="user", parts=[types.Part(text=istek)])]

        config = types.GenerateContentConfig(system_instruction=sistem_prompt)

        if is_stream:
            def stream_gemini():
                for chunk in client.models.generate_content_stream(
                    model="gemini-3.8-flash",
                    contents=contents,
                    config=config,
                ):
                    text_chunk = chunk.text or ""
                    if text_chunk:
                        out = {
                            "model": "gemini-3.8-flash",
                            "message": {"role": "assistant", "content": text_chunk},
                            "done": False,
                        }
                        yield (json.dumps(out) + "\n").encode("utf-8")
                yield (json.dumps({"done": True}) + "\n").encode("utf-8")
            return StreamingResponse(stream_gemini(), media_type="application/x-ndjson")
        else:
            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=contents,
                config=config,
            )
            content = response.text or ""
            return {"message": {"role": "assistant", "content": content}, "cevap": content}
    except Exception as e:
        hata_msg = f"Gemini API bağlantı hatası: {str(e)}"
        if is_stream:
            def stream_err():
                yield (json.dumps({"message": {"role": "assistant", "content": hata_msg}, "done": True}) + "\n").encode("utf-8")
            return StreamingResponse(stream_err(), media_type="application/x-ndjson")
        return {"message": {"role": "assistant", "content": hata_msg}, "cevap": hata_msg}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
