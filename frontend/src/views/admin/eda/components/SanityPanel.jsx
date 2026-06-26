import React from "react";
import Card from "components/card";
import { SectionLabel, NotebookChart } from "./common";

const SanityPanel = ({ san }) => {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <Card extra="p-6">
        <SectionLabel text="Sanity Check" />
        <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">Kiểm tra Logic</h3>
        <div className="space-y-3">
          {[
            { l: "Tenure lỗi (≤ 0)", v: san?.numerical_sanity?.tenure_invalid },
            { l: "Cước tháng lỗi (≤ 0)", v: san?.numerical_sanity?.monthly_charges_invalid },
            { l: "Cước tổng lỗi (≤ 0)", v: san?.numerical_sanity?.total_charges_invalid },
            { l: "Sai logic Internet", v: san?.categorical_sanity?.internet_logic_errors },
          ].map((x) => (
            <div key={x.l} className="flex items-center justify-between border-b border-gray-100 py-2.5 dark:border-white/10">
              <span className="text-sm text-navy-700 dark:text-white">{x.l}</span>
              <span className={`text-sm font-bold font-mono ${(x.v || 0) > 0 ? "text-red-500" : "text-green-500"}`}>
                {x.v || 0} dòng
              </span>
            </div>
          ))}
        </div>
      </Card>
      <Card extra="p-6 lg:col-span-2">
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-green-500">Kiểm định tính hợp lệ</span>
            </div>
            <ul className="space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                <span>Kết quả đồng loạt bằng <strong className="text-navy-700 dark:text-white">0</strong> chứng minh các biến định lượng trong tập dữ liệu hoàn toàn hợp lệ về mặt toán học lẫn logic nghiệp vụ.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                <span>Không tồn tại trường hợp thời gian gắn bó <code className="rounded bg-gray-100 px-1 dark:bg-navy-700">tenure</code> bị âm, hay cước phí hàng tháng / tổng cước nhỏ hơn hoặc bằng <strong>0</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                <span>Quá trình <em>Feature Engineering</em> được đảm bảo không xảy ra lỗi chia cho không <em>(ZeroDivisionError)</em> hay sinh giá trị vô cực <em>(Inf)</em>.</span>
              </li>
            </ul>
          </div>
          <div className="border-t border-gray-100 pt-4 dark:border-white/10">
            <NotebookChart
              src="/eda_charts/chart_sanity_boxplot.png"
              label="Khảo sát phân phối và Kiểm soát điểm ngoại lai"
              title="Khảo sát Phân phối và Kiểm soát Điểm ngoại lai (Outliers) qua Đồ thị Boxplot"
              color="blue"
              maxH="400px"
              points={[
                "Tất cả quan sát của tenure, MonthlyCharges, và TotalCharges đều nằm gọn trong khoảng cho phép (Non-outlier region) theo tiêu chí phân vị IQR.",
                "Không ghi nhận bất kỳ điểm dị thường (outliers) dạng râu dài nào cần phải loại bỏ hoặc xử lý capping.",
                "Đồ thị chứng tỏ dữ liệu định lượng của khách hàng hoàn toàn sạch, không có lỗi nhập liệu và sẵn sàng cho các khâu phân tích nâng cao (Modeling & Feature Engineering) mà không cần can thiệp kỹ thuật Imputation."
              ]}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SanityPanel;
