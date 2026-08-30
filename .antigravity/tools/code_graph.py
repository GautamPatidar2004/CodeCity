import os
import json
import hashlib
from tree_sitter import Language, Parser

def get_parser(language_name):
    if language_name == "javascript":
        import tree_sitter_javascript as tsjs
        return Parser(Language(tsjs.language()))
    elif language_name == "typescript":
        import tree_sitter_typescript as tsts
        return Parser(Language(tsts.language_typescript()))
    elif language_name == "tsx":
        import tree_sitter_typescript as tsts
        return Parser(Language(tsts.language_tsx()))
    elif language_name == "python":
        import tree_sitter_python as tspython
        return Parser(Language(tspython.language()))
    else:
        raise ValueError(f"Language {language_name} is not supported.")

CACHE_FILE = ".antigravity/tools/graph_cache.json"

class CodeGraph:
    def __init__(self, root_dir="."):
        self.root_dir = root_dir
        self.graph = {"nodes": {}, "edges": [], "hashes": {}}
        self.load_cache()

    def get_file_hash(self, path):
        with open(path, "rb") as f:
            return hashlib.sha256(f.read()).hexdigest()

    def load_cache(self):
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, "r") as f:
                    self.graph = json.load(f)
            except (json.JSONDecodeError, ValueError):
                self.graph = {"nodes": {}, "edges": [], "hashes": {}}

    def save_cache(self):
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, "w") as f:
            json.dump(self.graph, f, indent=2)

    def parse_js_ts_file(self, file_path):
        if file_path.endswith(".tsx"):
            parser = get_parser("tsx")
        elif file_path.endswith(".ts"):
            parser = get_parser("typescript")
        else:
            parser = get_parser("javascript")

        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            code = f.read()

        tree = parser.parse(bytes(code, "utf-8"))
        symbols = []

        def extract_nodes(node):
            name = None
            # Standard Functions & Classes: function Header() {}, class Profile {}
            if node.type in ("function_declaration", "class_declaration", "method_definition"):
                name_node = node.child_by_field_name("name")
                if name_node:
                    name = code[name_node.start_byte:name_node.end_byte]

            # Arrow Functions & Hooks: const HomeScreen = () => {}, const useAuth = () => {}
            elif node.type == "variable_declarator":
                name_node = node.child_by_field_name("name")
                val_node = node.child_by_field_name("value")
                if name_node and val_node and val_node.type in ("arrow_function", "function"):
                    name = code[name_node.start_byte:name_node.end_byte]

            if name:
                symbols.append({
                    "id": f"{file_path}::{name}",
                    "name": name,
                    "type": node.type,
                    "file": file_path,
                    "code": code[node.start_byte:node.end_byte]
                })

            for child in node.children:
                extract_nodes(child)

        extract_nodes(tree.root_node)
        return symbols

    def build_or_update(self):
        # React Native me heavy folders ko scan hone se rokna zaroori hai
        ignore_dirs = {
            "node_modules", ".git", ".antigravity", "android", "ios", "build", "dist", ".expo", ".next", "out"
    }
        for root, dirs, files in os.walk(self.root_dir):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]

            for file in files:
                if file.endswith((".js", ".jsx", ".ts", ".tsx")):
                    full_path = os.path.join(root, file).replace("\\", "/")
                    current_hash = self.get_file_hash(full_path)

                    # Incremental Cache Check
                    if self.graph["hashes"].get(full_path) == current_hash:
                        continue

                    symbols = self.parse_js_ts_file(full_path)
                    for sym in symbols:
                        self.graph["nodes"][sym["id"]] = sym
                    self.graph["hashes"][full_path] = current_hash

        self.save_cache()

    def query_symbol(self, symbol_name):
        matches = [node for node in self.graph["nodes"].values() if symbol_name.lower() in node["name"].lower()]
        return matches

if __name__ == "__main__":
    import sys
    engine = CodeGraph()

    if len(sys.argv) > 1 and sys.argv[1] == "--stats":
        hashes = engine.graph.get("hashes", {})
        nodes = engine.graph.get("nodes", {})
        print("=" * 45)
        print(f"📊 TOTAL INDEXED FILES       : {len(hashes)}")
        print(f"🧩 TOTAL EXTRACTED COMPONENTS : {len(nodes)}")
        print("=" * 45)
        print("\n📁 Indexed Files:")
        for f in hashes.keys():
            print(f"  ✓ {f}")
    elif len(sys.argv) > 1:
        engine.build_or_update()
        query = sys.argv[1]
        results = engine.query_symbol(query)
        print(json.dumps(results, indent=2))
    else:
        engine.build_or_update()
        print("React Native graph updated successfully.")