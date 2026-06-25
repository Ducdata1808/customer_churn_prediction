import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Set style
plt.style.use('ggplot')
sns.set_theme(style="whitegrid", palette="muted")
plt.rcParams['font.sans-serif'] = ['Arial', 'DejaVu Sans']

# Load data
df = pd.read_csv('data/train.csv')
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
df['TotalCharges'].fillna(0, inplace=True)

output_dir = 'frontend/public/eda_charts'

# 1. Overview: Data Types & Dataset Shape
fig, ax = plt.subplots(figsize=(10, 6))
dtypes_counts = df.dtypes.astype(str).value_counts()
colors = sns.color_palette("pastel")[0:len(dtypes_counts)]
wedges, texts, autotexts = ax.pie(dtypes_counts, labels=dtypes_counts.index, autopct='%1.1f%%', colors=colors, startangle=140, textprops=dict(color="w", weight="bold"))
ax.legend(wedges, dtypes_counts.index, title="Data Types", loc="center left", bbox_to_anchor=(1, 0, 0.5, 1))
plt.title(f'Tỷ lệ Kiểu dữ liệu (Data Types)\nTổng số Dòng: {df.shape[0]:,} | Tổng số Cột: {df.shape[1]}', fontsize=14, weight='bold', pad=20)
plt.tight_layout()
plt.savefig(f'{output_dir}/chart_overview_01.png', dpi=300)
plt.close()

# 2. Sanity: Missing Values
fig, ax = plt.subplots(figsize=(10, 6))
missing = df.isnull().sum()
sns.barplot(x=missing.values, y=missing.index, ax=ax, color='skyblue')
ax.set_title('Kiểm tra Dữ liệu Thiếu (Missing Values)', fontsize=14, weight='bold', pad=20)
ax.set_xlabel('Số lượng Giá trị Thiếu')
ax.set_ylabel('Đặc trưng')
plt.tight_layout()
plt.savefig(f'{output_dir}/chart_overview_02.png', dpi=300)
plt.close()

# 3. Stats: Descriptive Statistics Table
desc = df.describe().round(2).T
desc = desc[['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']]

fig, ax = plt.subplots(figsize=(12, 4))
ax.axis('off')
ax.axis('tight')

table = ax.table(cellText=desc.values,
                 rowLabels=desc.index,
                 colLabels=desc.columns,
                 cellLoc='center',
                 loc='center',
                 bbox=[0, 0, 1, 1])

table.auto_set_font_size(False)
table.set_fontsize(12)
table.scale(1.2, 1.5)

# Style the table
for key, cell in table.get_celld().items():
    cell.set_edgecolor('lightgray')
    if key[0] == 0 or key[1] == -1: # header or row index
        cell.set_facecolor('#f3f4f6')
        cell.set_text_props(weight='bold', color='#1f2937')
    else:
        cell.set_facecolor('white')
        cell.set_text_props(color='#4b5563')

plt.title('Thống kê Mô tả Đặc trưng Định lượng (Descriptive Statistics)', fontsize=14, weight='bold', pad=20)
plt.tight_layout()
plt.savefig(f'{output_dir}/chart_stats_01.png', dpi=300)
plt.close()

# 4. Stats: Categorical Describe
cat_desc = df.describe(include=['O', 'object']).T
cat_desc = cat_desc[['count', 'unique', 'top', 'freq']]
fig, ax = plt.subplots(figsize=(12, 8))
ax.axis('off')
ax.axis('tight')

table2 = ax.table(cellText=cat_desc.values,
                 rowLabels=cat_desc.index,
                 colLabels=cat_desc.columns,
                 cellLoc='center',
                 loc='center',
                 bbox=[0, 0, 1, 1])
table2.auto_set_font_size(False)
table2.set_fontsize(10)

for key, cell in table2.get_celld().items():
    cell.set_edgecolor('lightgray')
    if key[0] == 0 or key[1] == -1:
        cell.set_facecolor('#f3f4f6')
        cell.set_text_props(weight='bold', color='#1f2937')
    else:
        cell.set_facecolor('white')
        cell.set_text_props(color='#4b5563')

plt.title('Thống kê Đặc trưng Định tính (Categorical Summary)', fontsize=14, weight='bold', pad=20)
plt.tight_layout()
plt.savefig(f'{output_dir}/chart_stats_02.png', dpi=300)
plt.close()

print("Generated Overview and Stats charts!")
