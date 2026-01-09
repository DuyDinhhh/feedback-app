import React, { useEffect, useState } from "react";
import FeedbackService from "../../services/feedbackService";
import { toast } from "react-toastify";
import StaffService from "../../services/staffService";

function formatDate(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return `${d.toLocaleTimeString("vi-VN")} ${d.getDate()}/${
    d.getMonth() + 1
  }/${d.getFullYear()}`;
}

function PaginationButton({
  label,
  active = false,
  disabled = false,
  onClick,
}) {
  const baseClasses =
    "px-3 py-1 text-sm font-medium rounded-md transition inline-flex items-center justify-center";
  if (disabled) {
    return (
      <button
        disabled
        className={`${baseClasses} bg-white border text-gray-300 cursor-not-allowed`}
      >
        {label}
      </button>
    );
  }
  if (active) {
    return (
      <button className={`${baseClasses} bg-red-600 text-white border`}>
        {label}
      </button>
    );
  }
  return (
    <button
      className={`${baseClasses} bg-white border hover:bg-gray-50`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffs, setStaffs] = useState([]);
  const [value, setValue] = useState([]);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });

  const [staffId, setStaffId] = useState("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("desc");
  const [exporting, setExporting] = useState(false);

  const fetchStaffs = async () => {
    try {
      const res = await StaffService.list();
      setStaffs(res.data?.staff || res.staff || []);
    } catch (err) {
      setStaffs([]);
      toast.error("Lỗi khi tải danh sách nhân viên", { autoClose: 500 });
    }
  };

  const fetchFeedbacks = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        staff_id: staffId,
        date_from: dateFrom,
        date_to: dateTo,
        sort,
        value,
      };
      const response = await FeedbackService.index(page, params);
      console.log("feedback:   ", response);
      const data = response.feedback;
      setFeedbacks(data?.data || []);
      setPagination({
        current_page: data?.current_page || 1,
        last_page: data?.last_page || 1,
        per_page: data?.per_page || 10,
        total: data?.total || 0,
        from: data?.from || 0,
        to: data?.to || 0,
      });
    } catch (err) {
      setFeedbacks([]);
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 0,
        to: 0,
      });
      const errorMessage =
        err.response?.data?.message || "Lỗi khi tải feedback";
      toast.error(errorMessage, { autoClose: 500 });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaffs();
    fetchFeedbacks(1);
  }, []);

  useEffect(() => {
    fetchFeedbacks(1);
  }, [staffId, dateFrom, dateTo, sort, value]);

  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= (pagination.last_page || 1) &&
      newPage !== pagination.current_page
    ) {
      fetchFeedbacks(newPage);
    }
  };

  const getPageNumbers = () => {
    const { current_page, last_page } = pagination;
    const maxPagesToShow = 5;
    let start = Math.max(1, current_page - Math.floor(maxPagesToShow / 2));
    let end = start + maxPagesToShow - 1;
    if (end > last_page) {
      end = last_page;
      start = Math.max(1, end - maxPagesToShow + 1);
    }
    const pageNumbers = [];
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        staff_id: staffId,
        date_from: dateFrom,
        date_to: dateTo,
        sort,
        value,
      };
      const response = await FeedbackService.export(params);
      const blob = new Blob([response.data || response], {
        type: "application/vnd.ms-excel",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "feedbacks.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      try {
        const errorBlob = err.response.data;
        const errorText = await errorBlob.text();
        console.log(errorText);
        toast.error(JSON.parse(errorText).error || "Lỗi khi xuất Excel", {
          autoClose: 1000,
        });
      } catch (e) {
        toast.error("Lỗi khi xuất Excel", { autoClose: 1000 });
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full px-8 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Quản lý Đánh giá
          </h2>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className={`bg-[#00afb9] hover:bg-[#0081a7] text-white font-bold py-2 px-4 rounded flex items-center ${
            exporting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {exporting ? (
            <>
              <svg
                className="w-4 h-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <span className="ml-2">Đang xuất... </span>
            </>
          ) : (
            <span className="ml-2">Xuất Excel</span>
          )}
        </button>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow">
        <div className="p-6 border-b">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              className="px-3 py-2 rounded border border-gray-200 bg-white text-gray-700 w-[200px]"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
            >
              <option value="">-- Tất cả nhân viên --</option>
              {staffs.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} {staff.deleted_at ? "(Đã xoá)" : ""}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-2 rounded border border-gray-200 bg-white text-gray-700 min-w-[180px]"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            >
              <option value="">-- Tất cả đánh giá --</option>
              <option value={4}>Rất hài lòng</option>
              <option value={3}>Hài lòng</option>
              <option value={2}>Bình thường</option>
              <option value={1}>Không hài lòng</option>
            </select>

            <input
              type="date"
              className="px-3 py-2 rounded border border-gray-200 bg-white text-gray-700"
              placeholder="Từ ngày"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <input
              type="date"
              className="px-3 py-2 rounded border border-gray-200 bg-white text-gray-700"
              placeholder="Đến ngày"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            <select
              className="px-3 py-2 rounded border border-gray-200 bg-white text-gray-700"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="desc">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full">
              <thead className="">
                <tr className="border-b">
                  <th className="text-left text-md font-semibold text-gray-500 pb-3 px-4">
                    Nhân viên
                  </th>

                  <th className="text-center text-md font-semibold text-gray-500 pb-3 px-4">
                    Đánh giá
                  </th>

                  <th className="text-center text-md font-semibold text-gray-500 pb-3 px-4">
                    Ngày gửi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : !feedbacks.length ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Không tìm thấy feedback.
                    </td>
                  </tr>
                ) : (
                  feedbacks.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-b-0 hover:bg-red-50 transition-colors duration-150"
                    >
                      <td className="p-4 text-sm text-gray-600">
                        {item?.staff_with_trashed?.name || "-"}
                      </td>
                      <td className="p-4 text-center text-sm font-semibold text-gray-800">
                        {item.value === 1 && (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                            Không hài lòng
                          </span>
                        )}
                        {item.value === 2 && (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                            Bình thường
                          </span>
                        )}
                        {item.value === 3 && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                            Hài lòng
                          </span>
                        )}
                        {item.value === 4 && (
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                            Rất hài lòng
                          </span>
                        )}
                        {!item.value && "-"}
                      </td>

                      <td className="p-4 text-sm text-gray-600 text-center">
                        {formatDate(item.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination footer */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Trang {pagination.current_page} trên {pagination.last_page} | Hiển
            thị {pagination.from}-{pagination.to} trong tổng số{" "}
            {pagination.total} feedback
          </div>
          <div className="flex items-center gap-2">
            <PaginationButton
              label="Trước"
              disabled={pagination.current_page <= 1}
              onClick={() => handlePageChange(pagination.current_page - 1)}
            />
            {getPageNumbers().map((num) => (
              <PaginationButton
                key={num}
                label={String(num)}
                active={pagination.current_page === num}
                onClick={() => handlePageChange(num)}
              />
            ))}
            <PaginationButton
              label="Tiếp"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => handlePageChange(pagination.current_page + 1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagement;
