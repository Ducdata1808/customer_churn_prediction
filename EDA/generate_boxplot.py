import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import os
import matplotlib
matplotlib.use('Agg')

df_train_copy = pd.read_csv('data/train.csv')
def get_name(col):
    if col == "tenure": return "Thời gian sử dụng dịch vụ"
    if col == "MonthlyCharges": return "Cước phí hàng tháng"
    if col == "TotalCharges": return "Tổng cước phí"
    return col

fig, axes = plt.subplots(1, 3, figsize=(18, 5))
df_train_copy['TotalCharges'] = pd.to_numeric(df_train_copy['TotalCharges'].replace(' ', '0'))

sns.boxplot(data=df_train_copy, x='tenure', color='#4CB391', ax=axes[0])
axes[0].set_title(f'Đồ thị Boxplot thể hiện {get_name("tenure")} của khách hàng', fontsize=12, fontweight='bold')
axes[0].set_xlabel('Thời gian sử dụng dịch vụ theo tháng (tenure)', fontsize=10)

sns.boxplot(data=df_train_copy, x='MonthlyCharges', color='#FF7F0E', ax=axes[1])
axes[1].set_title(f'Đồ thị Boxplot thể hiện {get_name("MonthlyCharges")} của khách hàng', fontsize=12, fontweight='bold')
axes[1].set_xlabel('Cước phí hàng tháng được ghi nhận (MonthlyCharges)', fontsize=10)

sns.boxplot(data=df_train_copy, x='TotalCharges', color='#1F77B4', ax=axes[2])
axes[2].set_title(f'Đồ thị Boxplot thể hiện {get_name("TotalCharges")} của khách hàng', fontsize=12, fontweight='bold')
axes[2].set_xlabel('Tổng cước phí được ghi nhận (TotalCharges)', fontsize=10)

plt.tight_layout()
plt.savefig('frontend/public/eda_charts/chart_sanity_boxplot.png', dpi=150)
print("Saved boxplot!")
