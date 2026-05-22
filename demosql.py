import sqlite3

conn = sqlite3.connect("backend/zoom_clone.db")
conn.row_factory = sqlite3.Row

cursor = conn.cursor()

rows = cursor.execute("SELECT * FROM meetings LIMIT 2").fetchall()

for row in rows:
    print(dict(row))

conn.close()