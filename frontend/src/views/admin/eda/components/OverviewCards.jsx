import React from "react";
import Widget from "components/widget/Widget";
import { MdDataUsage, MdViewColumn, MdContentCopy, MdWarning } from "react-icons/md";

// Fix #1: Nhận overviewData từ component cha index.jsx qua props
// (Không còn tự gọi API nữa → loại bỏ 1 trong 3 lần gọi /overview trùng lặp)
const OverviewCards = ({ overviewData }) => {

  // Fix #4: Hiển thị loading thân thiện thay vì im lặng
  if (!overviewData) {
    return (
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[90px] rounded-[20px] bg-gray-100 dark:bg-navy-700 animate-pulse" />
        ))}
      </div>
    );
  }

  const data = overviewData;

  return (
    <div className="w-full">
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4">
        <Widget
          icon={<MdDataUsage className="h-7 w-7" />}
          title="Tổng số dòng (Rows)"
          subtitle={data.shape.rows.toString()}
        />
        <Widget
          icon={<MdViewColumn className="h-7 w-7" />}
          title="Tổng số cột (Columns)"
          subtitle={data.shape.columns.toString()}
        />
        <Widget
          icon={<MdContentCopy className="h-7 w-7" />}
          title="Dữ liệu trùng lặp"
          subtitle={data.duplicates.toString()}
        />
        <Widget
          icon={<MdWarning className="h-7 w-7" />}
          title="Dữ liệu bị khuyết (Missing)"
          subtitle={data.missing_values_count.toString()}
        />
      </div>

      <div className="mt-3 rounded-[20px] bg-indigo-50 p-4 dark:bg-navy-800">
        <p className="text-sm text-navy-700 dark:text-white">
          💡 <b>Nhận xét (Insight):</b> {data.insight}
        </p>
      </div>
    </div>
  );
};

export default OverviewCards;
