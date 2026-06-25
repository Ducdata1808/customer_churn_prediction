"""
Tái tạo toàn bộ biểu đồ EDA từ notebook trocungDucLevan.ipynb
Dùng train.csv thay vì Kaggle hub
"""
import os, warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
from scipy import stats

warnings.filterwarnings('ignore')

OUTPUT_DIR = "/Users/giabao/Desktop/customer_churn_prediction/frontend/public/eda_charts"
os.makedirs(OUTPUT_DIR, exist_ok=True)

DATA_PATH = "/Users/giabao/Desktop/customer_churn_prediction/artifacts/data_ingestion/train.csv"

# ─── Cấu hình style ─────────────────────────────────────────────────────────
DARK_BG   = "#0F172A"
CARD_BG   = "#1E293B"
ACCENT    = "#4F46E5"
TEAL      = "#14B8A6"
AMBER     = "#F59E0B"
RED       = "#EF4444"
BLUE      = "#3B82F6"
GREEN     = "#10B981"
PURPLE    = "#8B5CF6"
TEXT      = "#E2E8F0"
MUTED     = "#94A3B8"

plt.rcParams.update({
    'figure.facecolor': DARK_BG,
    'axes.facecolor': CARD_BG,
    'axes.edgecolor': '#334155',
    'axes.labelcolor': TEXT,
    'xtick.color': MUTED,
    'ytick.color': MUTED,
    'text.color': TEXT,
    'grid.color': '#334155',
    'grid.alpha': 0.5,
    'font.family': 'DejaVu Sans',
    'font.size': 11,
    'axes.titlesize': 13,
    'axes.titleweight': 'bold',
    'figure.dpi': 100,
})

def save(name):
    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, f"{name}.png")
    plt.savefig(path, dpi=120, bbox_inches='tight', facecolor=DARK_BG)
    plt.close('all')
    print(f"  ✓ {name}.png")

# ─── Load & Prepare Data ────────────────────────────────────────────────────
print("Loading data...")
df = pd.read_csv(DATA_PATH)
df_train_copy = df.copy()

# Fix TotalCharges
df_train_copy['TotalCharges'] = pd.to_numeric(df_train_copy['TotalCharges'], errors='coerce')
df_train_copy['TotalCharges'] = df_train_copy['TotalCharges'].fillna(df_train_copy['TotalCharges'].median())

df_train_copy['churn_flag'] = (df_train_copy['Churn'] == 'Yes').astype(int)

numerical_features = ['tenure', 'MonthlyCharges', 'TotalCharges']
categorical_features = [
    'gender', 'SeniorCitizen', 'Partner', 'Dependents', 'PhoneService',
    'MultipleLines', 'InternetService', 'OnlineSecurity', 'OnlineBackup',
    'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies',
    'Contract', 'PaperlessBilling', 'PaymentMethod'
]

print(f"Data loaded: {df_train_copy.shape}")
print(f"\n{'='*60}")

# ═══════════════════════════════════════════════════════════════════
# CHART 01 — Phân bố biến định lượng (Histogram + KDE)
# ═══════════════════════════════════════════════════════════════════
print("\n[01] Numerical distributions...")
fig, axes = plt.subplots(1, 3, figsize=(18, 5), facecolor=DARK_BG)
fig.suptitle("Phân bố các biến định lượng", color=TEXT, fontsize=15, fontweight='bold', y=1.02)

colors = [TEAL, AMBER, BLUE]
titles_vn = ['Thời gian gắn bó (tháng)', 'Cước phí hàng tháng ($)', 'Tổng cước phí ($)']

for i, (col, color, title) in enumerate(zip(numerical_features, colors, titles_vn)):
    ax = axes[i]
    data = df_train_copy[col].dropna()
    ax.hist(data, bins=30, color=color, alpha=0.8, edgecolor='none', density=True)
    kde_x = np.linspace(data.min(), data.max(), 300)
    kde = stats.gaussian_kde(data)
    ax.plot(kde_x, kde(kde_x), color='white', lw=2)
    ax.axvline(data.median(), color=RED, lw=1.5, linestyle='--', label=f'Median: {data.median():.1f}')
    ax.set_title(title)
    ax.set_xlabel(col)
    ax.legend(fontsize=9, framealpha=0.3)
    ax.grid(axis='y', alpha=0.3)

save("01_numerical_distribution")

# ═══════════════════════════════════════════════════════════════════
# CHART 02 — Phân bố biến định tính (Grid bar charts)
# ═══════════════════════════════════════════════════════════════════
print("[02] Categorical distributions...")
n_cols = 4
n_rows = (len(categorical_features) + n_cols - 1) // n_cols
fig, axes = plt.subplots(n_rows, n_cols, figsize=(22, n_rows * 4.5), facecolor=DARK_BG)
fig.suptitle("Phân bố các biến định tính", color=TEXT, fontsize=15, fontweight='bold')
axes_flat = axes.flatten()

palette = [TEAL, ACCENT, AMBER, RED, BLUE, GREEN, PURPLE]

for i, col in enumerate(categorical_features):
    ax = axes_flat[i]
    vc = df_train_copy[col].value_counts()
    pct = vc / vc.sum() * 100
    colors_bar = [palette[j % len(palette)] for j in range(len(vc))]
    bars = ax.bar(range(len(vc)), pct.values, color=colors_bar, edgecolor='none', alpha=0.85)
    for bar, val in zip(bars, pct.values):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
                f'{val:.1f}%', ha='center', va='bottom', fontsize=8, color=TEXT)
    ax.set_title(col, fontsize=10)
    ax.set_xticks(range(len(vc)))
    ax.set_xticklabels(vc.index, rotation=25, ha='right', fontsize=8)
    ax.set_ylabel('Tỷ lệ (%)')
    ax.grid(axis='y', alpha=0.3)

for j in range(i + 1, len(axes_flat)):
    axes_flat[j].set_visible(False)

save("02_categorical_distribution")

# ═══════════════════════════════════════════════════════════════════
# CHART 03 — Phân bố Churn (Donut chart)
# ═══════════════════════════════════════════════════════════════════
print("[03] Churn target distribution...")
fig, ax = plt.subplots(figsize=(7, 6), facecolor=DARK_BG)
vc = df_train_copy['Churn'].value_counts()
labels_vn = ['Tiếp tục sử dụng', 'Rời bỏ dịch vụ']
colors_pie = [TEAL, RED]
sizes = [vc.get('No', 0), vc.get('Yes', 0)]
total = sum(sizes)

wedges, texts, autotexts = ax.pie(
    sizes, labels=labels_vn, colors=colors_pie,
    autopct='%1.1f%%', startangle=90,
    wedgeprops=dict(width=0.6, edgecolor=DARK_BG, linewidth=2),
    pctdistance=0.75,
    textprops={'color': 'white', 'fontsize': 12, 'fontweight': 'medium'}
)
for at in autotexts:
    at.set_color('white')
    at.set_fontsize(13)
    at.set_fontweight('bold')

ax.legend(wedges, [f'{l} ({s:,})' for l, s in zip(labels_vn, sizes)],
          loc='lower center', bbox_to_anchor=(0.5, -0.08),
          framealpha=0.2, labelcolor=TEXT, fontsize=11)
ax.set_title("Phân bố biến mục tiêu — Churn", color=TEXT, fontsize=14, fontweight='bold', pad=15)

# Center text
ax.text(0, 0, f'{total:,}\nKhách hàng', ha='center', va='center',
        color=TEXT, fontsize=12, fontweight='bold')

save("03_churn_target_distribution")

# ═══════════════════════════════════════════════════════════════════
# CHART 04 — Numerical vs Churn (KDE + Boxplot)
# ═══════════════════════════════════════════════════════════════════
print("[04] Numerical vs Churn...")
churn_palette = {'Yes': AMBER, 'No': BLUE}
fig, axes = plt.subplots(len(numerical_features), 2, figsize=(15, 4 * len(numerical_features)), facecolor=DARK_BG)
fig.suptitle("Phân bố biến định lượng theo Churn", color=TEXT, fontsize=15, fontweight='bold')

titles_vn = {'tenure': 'Thời gian gắn bó', 'MonthlyCharges': 'Cước phí hàng tháng', 'TotalCharges': 'Tổng cước phí'}

for i, col in enumerate(numerical_features):
    ax_kde = axes[i][0]
    ax_box = axes[i][1]
    
    for churn_val, color in [('No', BLUE), ('Yes', AMBER)]:
        data = df_train_copy[df_train_copy['Churn'] == churn_val][col].dropna()
        kde_x = np.linspace(df_train_copy[col].min(), df_train_copy[col].max(), 300)
        kde = stats.gaussian_kde(data)
        label = 'Tiếp tục' if churn_val == 'No' else 'Rời bỏ'
        ax_kde.fill_between(kde_x, kde(kde_x), alpha=0.35, color=color)
        ax_kde.plot(kde_x, kde(kde_x), color=color, lw=2, label=label)
    
    ax_kde.set_title(f'{titles_vn[col]} — KDE')
    ax_kde.legend(framealpha=0.2)
    ax_kde.grid(alpha=0.3)
    
    groups = [df_train_copy[df_train_copy['Churn'] == g][col].dropna() for g in ['No', 'Yes']]
    bp = ax_box.boxplot(groups, patch_artist=True, widths=0.5,
                        medianprops=dict(color='white', linewidth=2))
    for patch, color in zip(bp['boxes'], [BLUE, AMBER]):
        patch.set_facecolor(color)
        patch.set_alpha(0.7)
    ax_box.set_xticklabels(['Tiếp tục', 'Rời bỏ'])
    ax_box.set_title(f'{titles_vn[col]} — Boxplot')
    ax_box.grid(axis='y', alpha=0.3)

save("04_numerical_vs_churn")

# ═══════════════════════════════════════════════════════════════════
# CHART 05 — Categorical vs Churn Rate (top 6 features)
# ═══════════════════════════════════════════════════════════════════
print("[05] Categorical vs Churn rate...")
selected_features = ['PaymentMethod', 'Contract', 'InternetService', 'OnlineSecurity', 'TechSupport', 'SeniorCitizen']

fig, axes = plt.subplots(2, 3, figsize=(18, 11), facecolor=DARK_BG)
fig.suptitle("Tỷ lệ Churn theo biến định tính", color=TEXT, fontsize=15, fontweight='bold')
axes_flat = axes.flatten()

for i, col in enumerate(selected_features):
    ax = axes_flat[i]
    cr = df_train_copy.groupby(col)['churn_flag'].mean() * 100
    cr = cr.sort_values(ascending=False)
    
    bar_colors = [RED if v > 30 else AMBER if v > 15 else TEAL for v in cr.values]
    bars = ax.bar(range(len(cr)), cr.values, color=bar_colors, edgecolor='none', alpha=0.85)
    
    overall = df_train_copy['churn_flag'].mean() * 100
    ax.axhline(overall, color='white', linestyle='--', lw=1.2, alpha=0.6, label=f'TB: {overall:.1f}%')
    
    for bar, val in zip(bars, cr.values):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
                f'{val:.1f}%', ha='center', va='bottom', fontsize=9, color=TEXT, fontweight='bold')
    
    ax.set_title(col, fontsize=11)
    ax.set_xticks(range(len(cr)))
    ax.set_xticklabels(cr.index, rotation=20, ha='right', fontsize=9)
    ax.set_ylabel('Tỷ lệ Churn (%)')
    ax.legend(fontsize=9, framealpha=0.2)
    ax.grid(axis='y', alpha=0.3)
    ax.set_ylim(0, max(cr.values) * 1.2)

save("05_categorical_vs_churn")

# ═══════════════════════════════════════════════════════════════════
# CHART 06 — Expected Churn Segments (Bubble chart)
# ═══════════════════════════════════════════════════════════════════
print("[06] Expected Churn Segments...")
segment_data = []
for col in categorical_features:
    for val in df_train_copy[col].unique():
        subset = df_train_copy[df_train_copy[col] == val]
        size_pct = len(subset) / len(df_train_copy) * 100
        churn_rate = subset['churn_flag'].mean() * 100
        expected = size_pct * churn_rate / 100
        segment_data.append({'segment': f'{col}={val}', 'size': size_pct, 'churn_rate': churn_rate, 'expected': expected})

seg_df = pd.DataFrame(segment_data).sort_values('expected', ascending=False).head(15)

fig, ax = plt.subplots(figsize=(14, 7), facecolor=DARK_BG)
scatter = ax.scatter(seg_df['size'], seg_df['churn_rate'],
                     s=seg_df['expected'] * 80,
                     c=seg_df['expected'],
                     cmap='RdYlGn_r',
                     alpha=0.8, edgecolors='white', linewidths=0.5)

for _, row in seg_df.head(8).iterrows():
    label = row['segment'].split('=')[1][:15]
    col_name = row['segment'].split('=')[0]
    ax.annotate(f"{col_name}\n{label}", (row['size'], row['churn_rate']),
                fontsize=7.5, color=TEXT, ha='center', va='bottom',
                xytext=(0, 8), textcoords='offset points')

plt.colorbar(scatter, ax=ax, label='Expected Churn (%)', shrink=0.8)
ax.set_xlabel('Quy mô phân khúc (%)')
ax.set_ylabel('Tỷ lệ Churn (%)')
ax.set_title('Phân khúc rủi ro dự kiến — Expected Churn Segments', fontsize=13)
ax.grid(alpha=0.3)

save("06_expected_churn_segments")

# ═══════════════════════════════════════════════════════════════════
# CHART 07 — Risk Gap Services (Grouped bar)
# ═══════════════════════════════════════════════════════════════════
print("[07] Risk Gap services...")
service_cols = ['OnlineSecurity', 'TechSupport', 'OnlineBackup', 'DeviceProtection', 'StreamingTV', 'StreamingMovies']

gap_rows = []
for col in service_cols:
    for val in ['Yes', 'No']:
        subset = df_train_copy[df_train_copy[col] == val]
        if len(subset) > 0:
            cr = subset['churn_flag'].mean() * 100
            gap_rows.append({'Feature': col, 'Subscribed': val, 'ChurnRate': cr})

gap_df = pd.DataFrame(gap_rows)
gap_pivot = gap_df.pivot(index='Feature', columns='Subscribed', values='ChurnRate')

x = np.arange(len(gap_pivot))
width = 0.35
fig, ax = plt.subplots(figsize=(13, 6), facecolor=DARK_BG)

bars1 = ax.bar(x - width/2, gap_pivot.get('Yes', 0), width, label='Đã đăng ký', color=TEAL, alpha=0.85, edgecolor='none')
bars2 = ax.bar(x + width/2, gap_pivot.get('No', 0), width, label='Chưa đăng ký', color=RED, alpha=0.85, edgecolor='none')

for bar in list(bars1) + list(bars2):
    h = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2, h + 0.5, f'{h:.1f}%',
            ha='center', va='bottom', fontsize=9, color=TEXT, fontweight='bold')

ax.set_xlabel('Dịch vụ bổ trợ')
ax.set_ylabel('Tỷ lệ Churn (%)')
ax.set_title('Risk Gap — Tỷ lệ Churn theo đăng ký dịch vụ bổ trợ', fontsize=13)
ax.set_xticks(x)
ax.set_xticklabels(gap_pivot.index, rotation=15)
ax.legend(framealpha=0.2, labelcolor=TEXT)
ax.grid(axis='y', alpha=0.3)
ax.set_ylim(0, 65)

save("07_risk_gap_services")

# ═══════════════════════════════════════════════════════════════════
# CHART 08 — Feature Engineering: charge_to_tenure_ratio
# ═══════════════════════════════════════════════════════════════════
print("[08] Financial feature engineering...")
df_train_copy['tenure_safe'] = df_train_copy['tenure'].replace(0, 0.5)
df_train_copy['charge_to_tenure_ratio'] = df_train_copy['MonthlyCharges'] / df_train_copy['tenure_safe']
df_train_copy['charge_to_tenure_ratio_log'] = np.log1p(df_train_copy['charge_to_tenure_ratio'])

fig, axes = plt.subplots(1, 2, figsize=(14, 5), facecolor=DARK_BG)
fig.suptitle("Đặc trưng kỹ thuật — Log Tỷ lệ Áp lực Chi phí", color=TEXT, fontsize=14, fontweight='bold')

for ax, col, title in zip(axes,
    ['charge_to_tenure_ratio', 'charge_to_tenure_ratio_log'],
    ['Tỷ lệ Áp lực Chi phí (gốc)', 'Log Tỷ lệ Áp lực Chi phí']):
    for churn_val, color in [('No', BLUE), ('Yes', AMBER)]:
        data = df_train_copy[df_train_copy['Churn'] == churn_val][col].dropna()
        kde_x = np.linspace(data.min(), data.max(), 300)
        kde = stats.gaussian_kde(data.clip(data.quantile(0.01), data.quantile(0.99)))
        label = 'Tiếp tục' if churn_val == 'No' else 'Rời bỏ'
        ax.fill_between(kde_x, kde(kde_x), alpha=0.35, color=color)
        ax.plot(kde_x, kde(kde_x), color=color, lw=2, label=label)
    ax.set_title(title)
    ax.legend(framealpha=0.2)
    ax.grid(alpha=0.3)

save("08_financial_features_dist")

# ═══════════════════════════════════════════════════════════════════
# CHART 09 — Security Score & Loyalty Tier
# ═══════════════════════════════════════════════════════════════════
print("[09] Security score & Loyalty tier...")
security_cols = ['OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 'TechSupport']
df_train_copy['security_score'] = df_train_copy[security_cols].apply(
    lambda row: sum(1 for v in row if v == 'Yes') - (1 if row.get('InternetService', 'No') == 'No internet service' else 0)
    if 'InternetService' in df_train_copy.columns else sum(1 for v in row if v == 'Yes'),
    axis=1
)

loyalty_bins = [0, 6, 12, 24, 48, float('inf')]
loyalty_labels = ['Onboarding\n(0-6)', 'First Year\n(6-12)', 'Second Year\n(12-24)', 'Established\n(24-48)', 'Champion\n(48+)']
df_train_copy['loyalty_tier'] = pd.cut(df_train_copy['tenure'], bins=loyalty_bins, labels=loyalty_labels)

fig, axes = plt.subplots(1, 2, figsize=(16, 6), facecolor=DARK_BG)

# Security Score
score_churn = df_train_copy.groupby('security_score')['churn_flag'].mean() * 100
ax = axes[0]
bars = ax.bar(score_churn.index, score_churn.values,
              color=[RED if v > 30 else AMBER if v > 15 else TEAL for v in score_churn.values],
              edgecolor='none', alpha=0.85)
for bar, val in zip(bars, score_churn.values):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
            f'{val:.1f}%', ha='center', va='bottom', fontsize=10, color=TEXT, fontweight='bold')
ax.set_title('Tỷ lệ Churn theo Điểm Bảo mật')
ax.set_xlabel('Security Score')
ax.set_ylabel('Tỷ lệ Churn (%)')
ax.grid(axis='y', alpha=0.3)

# Loyalty Tier
tier_churn = df_train_copy.groupby('loyalty_tier', observed=True)['churn_flag'].mean() * 100
ax2 = axes[1]
bars2 = ax2.bar(range(len(tier_churn)), tier_churn.values,
                color=[RED if v > 30 else AMBER if v > 15 else TEAL for v in tier_churn.values],
                edgecolor='none', alpha=0.85)
for bar, val in zip(bars2, tier_churn.values):
    ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
             f'{val:.1f}%', ha='center', va='bottom', fontsize=10, color=TEXT, fontweight='bold')
ax2.set_xticks(range(len(tier_churn)))
ax2.set_xticklabels(tier_churn.index, rotation=10, fontsize=9)
ax2.set_title('Tỷ lệ Churn theo Mức độ Gắn bó')
ax2.set_ylabel('Tỷ lệ Churn (%)')
ax2.grid(axis='y', alpha=0.3)

save("09_security_loyalty_dist")

# ═══════════════════════════════════════════════════════════════════
# CHART 10 — Pearson Correlation Heatmap
# ═══════════════════════════════════════════════════════════════════
print("[10] Pearson correlation heatmap...")
df_train_copy['SeniorCitizen_num'] = df_train_copy['SeniorCitizen'].astype(int)
cont_vars = ['tenure', 'MonthlyCharges', 'TotalCharges', 'charge_to_tenure_ratio_log', 'churn_flag']
available = [c for c in cont_vars if c in df_train_copy.columns]

corr = df_train_copy[available].corr(method='pearson')

rename_map = {
    'tenure': 'Thời gian gắn bó',
    'MonthlyCharges': 'Cước tháng',
    'TotalCharges': 'Tổng cước',
    'charge_to_tenure_ratio_log': 'Log Áp lực chi phí',
    'churn_flag': 'Churn'
}
corr = corr.rename(index=rename_map, columns=rename_map)

fig, ax = plt.subplots(figsize=(9, 7), facecolor=DARK_BG)
mask = np.triu(np.ones_like(corr, dtype=bool), k=1)
sns.heatmap(corr, ax=ax, annot=True, fmt='.2f', cmap='RdBu_r',
            vmin=-1, vmax=1, center=0,
            linewidths=0.5, linecolor='#1E293B',
            annot_kws={'size': 11, 'weight': 'bold'},
            cbar_kws={'shrink': 0.8})
ax.set_title("Ma trận tương quan Pearson", fontsize=14)
ax.tick_params(colors=TEXT, labelsize=10)
fig.axes[-1].yaxis.set_tick_params(colors=TEXT)

save("10_pearson_correlation")

# ═══════════════════════════════════════════════════════════════════
# CHART 11 — Risk Flags (composite_risk_profile, manual_payment, zero_supportive)
# ═══════════════════════════════════════════════════════════════════
print("[11] Risk flags...")
df_train_copy['manual_payment'] = (df_train_copy['PaymentMethod'] == 'Electronic check').astype(int)
df_train_copy['zero_supportive_service'] = (
    (df_train_copy['OnlineSecurity'] == 'No') &
    (df_train_copy['TechSupport'] == 'No') &
    (df_train_copy['OnlineBackup'] == 'No')
).astype(int)
df_train_copy['composite_risk_profile'] = (
    (df_train_copy['InternetService'] == 'Fiber optic') &
    (df_train_copy['Contract'] == 'Month-to-month')
).astype(int)

flag_features = ['zero_supportive_service', 'manual_payment', 'composite_risk_profile']
flag_titles = {
    'zero_supportive_service': 'Không có Dịch vụ Bảo vệ & Hỗ trợ',
    'manual_payment': 'Thanh toán thủ công (Electronic check)',
    'composite_risk_profile': 'Tổ hợp rủi ro (Fiber + Month-to-month)'
}
flag_labels = {0: 'Không', 1: 'Có'}

fig, axes = plt.subplots(1, 3, figsize=(16, 5), facecolor=DARK_BG)
fig.suptitle("Phân tích cờ rủi ro hành vi — Churn Triggers", color=TEXT, fontsize=14, fontweight='bold')

for ax, col in zip(axes, flag_features):
    cr = df_train_copy.groupby(col)['churn_flag'].mean() * 100
    colors_bar = [TEAL if i == 0 else RED for i in cr.index]
    bars = ax.bar([flag_labels.get(i, str(i)) for i in cr.index], cr.values,
                  color=colors_bar, edgecolor='none', alpha=0.85, width=0.5)
    for bar, val in zip(bars, cr.values):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
                f'{val:.1f}%', ha='center', va='bottom', fontsize=12, color=TEXT, fontweight='bold')
    ax.set_title(flag_titles[col], fontsize=10, wrap=True)
    ax.set_ylabel('Tỷ lệ Churn (%)')
    ax.set_ylim(0, 80)
    ax.grid(axis='y', alpha=0.3)

save("11_risk_flags")

# ═══════════════════════════════════════════════════════════════════
# CHART 12 — Feature Ranking (Correlation với Churn)
# ═══════════════════════════════════════════════════════════════════
print("[12] Feature ranking...")
# Map categorical to numeric
encode_map = {
    'Yes': 1, 'No': 0,
    'Month-to-month': 0, 'One year': 1, 'Two year': 2,
    'Electronic check': 0, 'Mailed check': 1, 'Bank transfer (automatic)': 2, 'Credit card (automatic)': 3,
    'Fiber optic': 2, 'DSL': 1, 'No': 0,
    'No internet service': 0, 'No phone service': 0,
    'Male': 0, 'Female': 1,
}

features_to_rank = {
    'Siêu cờ Tổ hợp rủi ro': 'composite_risk_profile',
    'Log Tỷ lệ Áp lực chi phí': 'charge_to_tenure_ratio_log',
    'Điểm Khiên Bảo vệ': 'security_score',
    'Mức độ gắn bó': 'loyalty_tier',
    'MonthlyCharges (gốc)': 'MonthlyCharges',
    'tenure (gốc)': 'tenure',
}

corr_vals = {}
for label, col in features_to_rank.items():
    if col in df_train_copy.columns:
        try:
            s = df_train_copy[col]
            if s.dtype == 'object' or str(s.dtype) == 'category':
                s = pd.Categorical(s).codes
            corr_val = abs(float(s.corr(df_train_copy['churn_flag'])))
            corr_vals[label] = corr_val
        except:
            pass

corr_series = pd.Series(corr_vals).sort_values()

fig, ax = plt.subplots(figsize=(11, 6), facecolor=DARK_BG)
bar_colors = [ACCENT if 'gốc' not in label else TEAL for label in corr_series.index]
bars = ax.barh(corr_series.index, corr_series.values, color=bar_colors, edgecolor='none', alpha=0.85, height=0.6)

for bar, val in zip(bars, corr_series.values):
    ax.text(bar.get_width() + 0.005, bar.get_y() + bar.get_height()/2,
            f'{val:.2f}', va='center', fontsize=11, color=TEXT, fontweight='bold')

ax.set_xlabel('Hệ số tương quan tuyệt đối với Churn')
ax.set_title('Xếp hạng sức mạnh đặc trưng — Engineered vs Original', fontsize=13)
ax.set_xlim(0, 0.65)
ax.grid(axis='x', alpha=0.3)

legend_patches = [
    mpatches.Patch(color=ACCENT, label='Engineered Features'),
    mpatches.Patch(color=TEAL, label='Original Features'),
]
ax.legend(handles=legend_patches, framealpha=0.2, labelcolor=TEXT)

save("12_feature_ranking")

print(f"\n{'='*60}")
print(f"✅ Hoàn tất! Đã xuất tất cả biểu đồ vào:")
print(f"   {OUTPUT_DIR}")
print(f"{'='*60}\n")
files = sorted(f for f in os.listdir(OUTPUT_DIR) if f.endswith('.png'))
for f in files:
    size = os.path.getsize(os.path.join(OUTPUT_DIR, f)) / 1024
    print(f"  {f} ({size:.0f} KB)")
