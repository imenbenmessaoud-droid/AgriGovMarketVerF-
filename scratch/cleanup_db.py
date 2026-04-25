import sqlite3
import os

db_path = 'backend/db.sqlite3'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("DROP TABLE IF EXISTS TransporterVehicle;")
        cursor.execute("DELETE FROM django_migrations WHERE app='users' AND name LIKE '0008%';")
        cursor.execute("DELETE FROM django_migrations WHERE app='users' AND name LIKE '0009%';")
        conn.commit()
        print("Dropped TransporterVehicle table and cleaned django_migrations.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()
else:
    print("Database not found.")
