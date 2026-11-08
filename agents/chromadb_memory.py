
import chromadb
class ChromaMemory:
    def __init__(self, persist_dir="./chroma_db"):
        self.client = chromadb.PersistentClient(path=persist_dir)
        self.collection = self.client.get_or_create_collection("kod_bilesen_hafizasi")
        self.path = persist_dir
    def ara(self, q):
        try: return self.collection.query(query_texts=[q], n_results=1)
        except: return {"ids":[[]]}
    def kaydet(self, ad, kod):
        try: self.collection.add(documents=[kod[:1000]], ids=[ad+"_"+str(hash(kod))[-4:]], metadatas=[{"tip":"bilesen"}])
        except: pass
