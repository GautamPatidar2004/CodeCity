# CabsFlow Agent Architecture Rules

1. Before modifying or creating features:
   - Query the symbol graph first: `python .antigravity/tools/code_graph.py <ComponentName>`
   - Do NOT scan entire directory trees or open random files.
2. Read only the targeted symbol node returned by the graph.
3. After completing edits:
   - Run `python .antigravity/tools/code_graph.py` to refresh modified AST nodes.