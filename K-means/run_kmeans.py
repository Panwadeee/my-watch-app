from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parent
WORKSPACE_ROOT = ROOT.parent
OUTPUT_DIR = ROOT / 'outputs'


def load_env() -> None:
    env_file = WORKSPACE_ROOT / '.env'
    if not env_file.exists():
        return

    for raw_line in env_file.read_text(encoding='utf-8').splitlines():
        line = raw_line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        os.environ.setdefault(key.strip(), value.strip())


load_env()

API_BASE_URL = os.getenv('API_BASE_URL', os.getenv('API_URL', 'http://119.59.102.161:3033')).rstrip('/')

FEATURES = ['price', 'stock']


def load_inventory_products() -> list[dict]:
    products_url = f"{API_BASE_URL}/api/products"

    try:
        with urllib.request.urlopen(products_url, timeout=10) as response:
            payload = json.loads(response.read().decode('utf-8'))
    except (urllib.error.URLError, json.JSONDecodeError, OSError) as exc:
        raise RuntimeError(
            f"ไม่สามารถโหลดข้อมูลจาก Inventory API ได้ที่ {products_url}. "
            f"กรุณาเปิด server.js ก่อนรัน K-means ({exc})"
        ) from exc

    rows = payload if isinstance(payload, list) else payload.get('products', payload.get('data', []))
    if not isinstance(rows, list):
        raise RuntimeError(f"รูปแบบข้อมูลจาก API ไม่ถูกต้อง: {type(rows).__name__}")

    products: list[dict] = []
    for row in rows:
        stock = row.get('stock')
        price = row.get('price')
        if stock is None or price is None:
            continue
        products.append(
            {
                'id': row.get('id'),
                'productCode': row.get('productCode'),
                'name': row.get('name'),
                'category': row.get('category'),
                'location': row.get('location'),
                'price': float(price),
                'stock': float(stock),
            }
        )

    return products


def build_matrix(products: list[dict]) -> np.ndarray:
    if len(products) < 3:
        raise RuntimeError('ต้องมีสินค้าอย่างน้อย 3 รายการเพื่อทำ K-means')

    matrix = np.asarray([[float(p['price']), float(p['stock'])] for p in products], dtype=float)
    if not np.isfinite(matrix).all():
        raise RuntimeError('ข้อมูลมีค่าที่ไม่ถูกต้อง')
    return matrix


def create_run_outputs(products: list[dict], result: dict, out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)

    with (out_dir / 'clustering_result.json').open('w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    with (out_dir / 'cluster_memberships.csv').open('w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['id', 'productCode', 'name', 'category', 'location', 'price', 'stock', 'cluster'])
        for row in result['products']:
            writer.writerow([
                row['id'],
                row['productCode'],
                row['name'],
                row['category'],
                row['location'],
                row['price'],
                row['stock'],
                row['cluster'],
            ])

    with (out_dir / 'centroids.csv').open('w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['cluster', 'price_thb_per_unit', 'stock_units'])
        for item in result['centroids_original_units']:
            writer.writerow([item['cluster'], item['price_thb_per_unit'], item['stock_units']])

    color_palette = ['#1f77b4', '#d62728', '#2ca02c', '#9467bd', '#ff7f0e', '#17becf']
    fig, ax = plt.subplots(figsize=(9, 5.5), dpi=160)
    for cluster in sorted({p['cluster'] for p in result['products']}):
        rows = [p for p in result['products'] if p['cluster'] == cluster]
        ax.scatter(
            [p['price'] for p in rows],
            [p['stock'] for p in rows],
            c=color_palette[cluster % len(color_palette)],
            s=80,
            label=f'Cluster {cluster}',
            edgecolors='white',
            linewidths=0.7,
        )

    for center in result['centroids_original_units']:
        ax.scatter(
            center['price_thb_per_unit'],
            center['stock_units'],
            marker='X',
            s=170,
            c=color_palette[center['cluster'] % len(color_palette)],
            edgecolors='black',
            linewidths=1.1,
        )
        ax.annotate(
            f'C{center["cluster"]}',
            (center['price_thb_per_unit'], center['stock_units']),
            xytext=(7, 7),
            textcoords='offset points',
            fontsize=10,
            weight='bold',
        )

    ax.set_title('Inventory Product K-means Clusters (Price vs Stock)')
    ax.set_xlabel('Price (THB per unit)')
    ax.set_ylabel('Stock (units)')
    ax.grid(alpha=0.25)
    ax.legend(loc='best', fontsize=9)
    fig.tight_layout()
    fig.savefig(out_dir / 'price_stock_clusters.png')
    plt.close(fig)

    ks = [d['k'] for d in result['diagnostics']]
    fig, (ax1, ax2) = plt.subplots(2, 1, sharex=True, figsize=(9, 6.0), dpi=160)
    ax1.plot(ks, [d['inertia'] for d in result['diagnostics']], marker='o', color='#1f4e79', label='Inertia')
    ax1.set_ylabel('Inertia')
    ax1.grid(alpha=0.2)
    ax1.legend(loc='best')

    valid = [(d['k'], d['silhouette']) for d in result['diagnostics'] if d['silhouette'] is not None]
    if valid:
        ax2.plot([x[0] for x in valid], [x[1] for x in valid], marker='s', color='#d62728', label='Silhouette')
        ax2.legend(loc='best')
    ax2.set_xlabel('k')
    ax2.set_ylabel('Silhouette')
    ax2.set_xticks(ks)
    ax2.grid(alpha=0.2)
    fig.suptitle('Inventory K-means Diagnostics')
    fig.tight_layout()
    fig.savefig(out_dir / 'k_diagnostics.png')
    plt.close(fig)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--k', type=int, default=3, help='จำนวน cluster ที่ต้องการ')
    parser.add_argument('--out-dir', type=str, default=None, help='โฟลเดอร์ผลลัพธ์')
    args = parser.parse_args()

    products = load_inventory_products()
    if not products:
        raise RuntimeError('ไม่พบสินค้าใน Inventory หรือ Inventory ว่าง')

    X = build_matrix(products)

    unique_vectors = np.unique(X, axis=0).shape[0]
    max_k = min(6, X.shape[0] - 1, unique_vectors)
    if args.k < 2 or args.k > max_k:
        raise RuntimeError(f'k ต้องอยู่ในช่วง 2 ถึง {max_k} สำหรับข้อมูลนี้')

    scaler = StandardScaler().fit(X)
    Z = scaler.transform(X)

    diagnostics = []
    models = {}
    for k in range(2, max_k + 1):
        model = KMeans(n_clusters=k, random_state=42, n_init=10).fit(Z)
        labels = model.labels_
        realized = int(np.unique(labels).size)
        sil = float(silhouette_score(Z, labels)) if 1 < realized < len(labels) else None
        diagnostics.append({
            'k': k,
            'inertia': float(model.inertia_),
            'silhouette': sil,
            'realized_clusters': realized,
        })
        models[k] = (model, labels)

    selected_model, selected_labels = models[args.k]
    centers = scaler.inverse_transform(selected_model.cluster_centers_)

    assignments = []
    for product, label in zip(products, selected_labels.tolist()):
        item = dict(product)
        item['cluster'] = int(label)
        assignments.append(item)

    sizes = {str(int(label)): int((selected_labels == label).sum()) for label in sorted(np.unique(selected_labels))}
    result = {
        'mode': 'inventory_db',
        'run_id': datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ'),
        'features': FEATURES,
        'matrix_shape': list(X.shape),
        'parameters': {
            'selected_k': args.k,
            'random_state': 42,
            'n_init': 10,
            'scaler': 'StandardScaler',
        },
        'diagnostics': diagnostics,
        'selected': {
            'k': args.k,
            'inertia': float(selected_model.inertia_),
            'silhouette': next(d['silhouette'] for d in diagnostics if d['k'] == args.k),
            'cluster_sizes': sizes,
        },
        'centroids_original_units': [
            {
                'cluster': i,
                'price_thb_per_unit': float(c[0]),
                'stock_units': float(c[1]),
            }
            for i, c in enumerate(centers)
        ],
        'products': assignments,
    }

    out_root = Path(args.out_dir) if args.out_dir else OUTPUT_DIR
    run_out_dir = out_root / result['run_id']
    create_run_outputs(products, result, run_out_dir)

    print(json.dumps(
        {
            'run_id': result['run_id'],
            'matrix_shape': result['matrix_shape'],
            'selected': result['selected'],
            'outputs': {
                'cluster_memberships': str(run_out_dir / 'cluster_memberships.csv'),
                'centroids': str(run_out_dir / 'centroids.csv'),
                'scatter': str(run_out_dir / 'price_stock_clusters.png'),
                'diagnostics': str(run_out_dir / 'k_diagnostics.png'),
                'full_result': str(run_out_dir / 'clustering_result.json'),
            },
        },
        ensure_ascii=False,
        indent=2,
    ))


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        raise SystemExit(1)
