import json

CACHE_FILE = ".antigravity/tools/graph_cache.json"

try:
    with open(CACHE_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    files = list(data.get("hashes", {}).keys())
    nodes = data.get("nodes", {})

    print("=" * 45)
    print(f"📊 TOTAL INDEXED FILES       : {len(files)}")
    print(f"🧩 TOTAL EXTRACTED COMPONENTS : {len(nodes)}")
    print("=" * 45)
    print("\n📁 Indexed Files List:")
    for f in files:
        print(f"  ✓ {f}")

except FileNotFoundError:
    print("Graph cache file nahi mili. Pehle 'python .antigravity/tools/code_graph.py' run karein.")