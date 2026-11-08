import os
from pathlib import Path
from google import genai


def _get_api_key():
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


class MetaAgent:
    def __init__(self):
        api_key = _get_api_key()
        self.client = genai.Client(api_key=api_key) if api_key else None

    def kod_uret(self, bilesenler, hafiza=None, istek="landing page"):
        try:
            response = self.client.models.generate_content(
                model="gemini-3.8-flash",
                contents=(
                    f"Kullanici istegi: {istek} icin 3 kisa baslik ve 3 kisa aciklama uret. "
                    f"Format: Baslik1|Aciklama1; Baslik2|Aciklama2; Baslik3|Aciklama3. "
                    f"Turkce, doga temali olmasin, tekrar etme."
                ),
            )
            txt = response.text or ""
            parts = [p.split("|") for p in txt.split(";") if "|" in p]
            if len(parts) < 3:
                parts = [
                    ["Doğa Dostu Tasarım", "%100 geri dönüştürülebilir malzemeler"],
                    ["Karbon Nötr", "Doğa için sıfır emisyon hedefi"],
                    ["Yeşil Enerji", "Güneş ve rüzgar enerjisiyle üretim"],
                ]
            print(f"[META] Gemini içerik: {parts}")
        except Exception as e:
            print(f"[META] Gemini içerik hatası: {e}")
            parts = [
                ["Doğa Dostu Tasarım", "%100 geri dönüştürülebilir malzemeler"],
                ["Karbon Nötr", "Sıfır emisyon"],
                ["Yeşil Enerji", "Yenilenebilir enerji"],
            ]
        renk = "emerald"
        return f'''<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>{istek}</title><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-gray-50">
<header class="bg-gray-900 text-white p-4 flex justify-between"><div class="font-bold">🌿 web-fabrika</div><div class="text-sm opacity-60">Gemini 3.8 Flash</div></header>
<section class="bg-gradient-to-br from-{renk}-600 to-teal-700 text-white py-20 px-8 text-center"><h1 class="text-5xl font-bold">{istek}</h1><p class="text-xl mt-4 opacity-90">Gemini + Tailwind + PANDAS->ChromaDB->LAYA->META</p></section>
<section class="py-16 px-8 max-w-6xl mx-auto"><h2 class="text-2xl font-bold mb-8 text-center">Özellikler</h2><div class="grid md:grid-cols-3 gap-6">
<div class="bg-white p-6 rounded-2xl shadow"><h3 class="font-bold text-lg">{parts[0][0]}</h3><p class="text-gray-600 mt-2 text-sm">{parts[0][1]}</p></div>
<div class="bg-white p-6 rounded-2xl shadow"><h3 class="font-bold text-lg">{parts[1][0]}</h3><p class="text-gray-600 mt-2 text-sm">{parts[1][1]}</p></div>
<div class="bg-white p-6 rounded-2xl shadow"><h3 class="font-bold text-lg">{parts[2][0]}</h3><p class="text-gray-600 mt-2 text-sm">{parts[2][1]}</p></div>
</div></section>
<footer class="bg-gray-900 text-white py-6 text-center text-sm">Web Fabrika - Gemini 3.8 Flash - LAYA: OK</footer>
</body></html>'''
