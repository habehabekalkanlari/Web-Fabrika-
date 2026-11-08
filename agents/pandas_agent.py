
import pandas as pd
class PandasAgent:
    def isegi_parcala(self, istek):
        istek_l = istek.lower()
        if "e-ticaret" in istek_l: b = ["header","product_grid","cart","footer"]
        elif "landing" in istek_l or "tanıtım" in istek_l or "mavi" in istek_l: b = ["header","hero","features","footer"]
        else: b = ["header","main","footer"]
        return pd.DataFrame({"bilesen": b, "durum": "yapilacak"})
