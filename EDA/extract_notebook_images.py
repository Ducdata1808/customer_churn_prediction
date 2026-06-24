import json
import base64
import os

with open('EDA/trocungDucLevan.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

output_dir = 'frontend/public/eda_charts/raw'
os.makedirs(output_dir, exist_ok=True)

img_count = 0
for i, cell in enumerate(nb['cells']):
    for j, out in enumerate(cell.get('outputs', [])):
        if 'data' in out and 'image/png' in out['data']:
            img_data = out['data']['image/png']
            # Some base64 strings might have newlines
            img_data = img_data.replace('\n', '')
            with open(f'{output_dir}/raw_chart_{img_count:02d}.png', 'wb') as f:
                f.write(base64.b64decode(img_data))
            img_count += 1
print(f"Extracted {img_count} images to {output_dir}")
