




from pathlib import Path

p = Path(r"C:\Users\rayme\Desktop/highandundead.txt")

texts = [p.read_text(encoding="utf-8", errors="replace") for _ in range(3)]

print([(len(t), len(t.splitlines())) for t in texts])
print(texts[0][:500])
print(texts[1][-500:])