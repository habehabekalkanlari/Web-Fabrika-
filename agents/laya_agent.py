
class LayaAgent:
    def karar_ver(self, kod):
        k=[]
        if len(kod)<500: k.append("TASARIM_KONTROLU")
        if "<title>" not in kod: k.append("SEO_EKSIK")
        if not k: k=["OK","HIZLI_GECTI"]
        return k
