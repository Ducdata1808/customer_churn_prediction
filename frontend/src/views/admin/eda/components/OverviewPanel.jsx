import React from "react";
import Card from "components/card";
import Widget from "components/widget/Widget";
import { MdGridOn, MdWarning, MdAnalytics, MdCheckCircle } from "react-icons/md";
import { IoDocuments } from "react-icons/io5";
import { SectionLabel } from "./common";

const OverviewPanel = ({ ov }) => {
  return (
    <div className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Widget icon={<MdGridOn className="h-6 w-6" />} title="Số mẫu dữ liệu" subtitle={ov?.shape?.rows?.toLocaleString()} />
        <Widget icon={<IoDocuments className="h-5 w-5" />} title="Số thuộc tính" subtitle={String(ov?.shape?.columns ?? "-")} />
        <Widget icon={<MdWarning className="h-6 w-6" />} title="Bản ghi trùng" subtitle={String(ov?.duplicates ?? 0)} />
        <Widget icon={<MdAnalytics className="h-6 w-6" />} title="Giá trị khuyết" subtitle={ov?.missing_values_count?.toLocaleString() ?? "0"} />
      </div>

      {/* Insight */}
      <Card extra="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/20">
            <MdCheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-widest text-gray-500">Tổng quan dữ liệu</p>
            <p className="text-sm leading-relaxed text-navy-700 dark:text-white">{ov?.insight}</p>
          </div>
        </div>
      </Card>

      {/* Feature Roles */}
      <Card extra="p-6">
        <SectionLabel text="Feature Roles" />
        <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">Phân loại thuộc tính</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { l: "Numerical", d: ov?.feature_roles?.numerical, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20" },
            { l: "Categorical", d: ov?.feature_roles?.categorical, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/20" },
            { l: "Target", d: ov?.feature_roles?.target, color: "text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/20" },
          ].map((g) => (
            <div key={g.l} className={`rounded-xl p-4 ${g.bg}`}>
              <p className={`mb-2 text-[10px] uppercase tracking-widest font-bold ${g.color}`}>
                {g.l} ({g.d?.length ?? 0})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {g.d?.map((f) => (
                  <span key={f} className="rounded-md bg-white/60 px-2 py-0.5 text-xs font-mono text-navy-700 dark:bg-navy-800 dark:text-white">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Notebook Insights: Categorical Labels Analysis */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card extra="p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-green-500">Phân tích biến định tính</span>
          </div>
          <ul className="space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              <span>Tập dữ liệu có tính phân nhánh khá đồng đều — phần lớn đặc trưng chỉ xoay quanh <strong className="text-navy-700 dark:text-white">2 đến 3</strong> nhãn phân biệt.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              <span>Không xuất hiện tình trạng nhãn hiếm <em>(Rare Labels)</em> — tất cả nhóm giá trị đều chiếm tỷ trọng đáng kể, thấp nhất là <strong className="text-navy-700 dark:text-white">6.1%</strong> ở <code className="rounded bg-gray-100 px-1 dark:bg-navy-700">PhoneService</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              <span><code className="rounded bg-gray-100 px-1 dark:bg-navy-700">PhoneService</code> có nhãn <em>Yes</em> chiếm ưu thế tuyệt đối <strong className="text-navy-700 dark:text-white">93.89%</strong>; chỉ <strong>6.1%</strong> khách hàng không sử dụng điện thoại.</span>
            </li>
          </ul>
        </Card>
        <Card extra="p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-500">Nhóm dịch vụ Internet</span>
          </div>
          <ul className="space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
              <span>Các dịch vụ hỗ trợ như <code className="rounded bg-gray-100 px-1 dark:bg-navy-700">OnlineSecurity</code>, <code className="rounded bg-gray-100 px-1 dark:bg-navy-700">TechSupport</code>, <code className="rounded bg-gray-100 px-1 dark:bg-navy-700">StreamingTV</code>... đều có nhóm khách hàng không dùng Internet chiếm tỷ lệ cố định <strong className="text-navy-700 dark:text-white">23.7%</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
              <span>Đây là cơ sở để thực hiện phân nhóm các đặc trưng nhằm tìm ra <strong className="text-navy-700 dark:text-white">vùng rủi ro rời bỏ dịch vụ</strong> của từng phân khúc khách hàng.</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default OverviewPanel;
