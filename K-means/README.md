# Inventory K-means

โฟลเดอร์นี้เป็นเวอร์ชัน K-means ที่ทำงานเฉพาะกับข้อมูลสินค้าใน Inventory ของแอปคุณเอง โดยไม่แตะโครงสร้างแอปหลักใด ๆ

## จุดประสงค์

- ดึงข้อมูลจากฐานข้อมูล MySQL ของ Inventory
- เลือกฟีเจอร์ที่ใช้ clustering คือ `price` และ `stock`
- ใช้ scikit-learn KMeans เพื่อแบ่งกลุ่มสินค้า
- ส่งผลลัพธ์ออกเป็นไฟล์ JSON/CSV และกราฟ PNG ในโฟลเดอร์นี้เท่านั้น

## การติดตั้ง

```bash
cd K-means
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
```

## การรัน

ก่อนรัน ให้แน่ใจว่า MySQL ของ Inventory ได้เปิดใช้งานแล้ว (ปกติใช้ localhost:3306 ตามไฟล์ .env ของโปรเจ็กต์)

ถ้าอยู่ที่โฟลเดอร์ K-means แล้ว ให้รัน:

```bash
.venv\Scripts\python run_kmeans.py --k 3
```

หากต้องการรันจาก workspace 根 ให้ใช้:

```bash
cd K-means
.venv\Scripts\python run_kmeans.py --k 3
```

ตัวเลือกเพิ่มเติม:

```bash
.venv\Scripts\python run_kmeans.py --k 4 --out-dir outputs
```

## ผลลัพธ์ที่ได้

- `outputs/<timestamp>/clustering_result.json`
- `outputs/<timestamp>/cluster_memberships.csv`
- `outputs/<timestamp>/centroids.csv`
- `outputs/<timestamp>/price_stock_clusters.png`
- `outputs/<timestamp>/k_diagnostics.png`

## ข้อสังเกต

- ไฟล์นี้ใช้ข้อมูลจากฐานข้อมูล Inventory จริงของคุณ
- ไม่ได้แก้ไขไฟล์ใน `src/` หรือ `server.js`
- ใช้แม่แบบ K-means แบบสแปนกลางจาก zip แต่ปรับให้สอดคล้องกับ Inventory ของคุณ
