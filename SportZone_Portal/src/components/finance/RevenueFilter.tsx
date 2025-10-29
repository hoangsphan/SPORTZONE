import { useState } from "react";

type Facility = {
  facId: string;
  name: string;
  userId: string;
};

type RevenueFilterProps = {
  filter: {
    facilityId?: string;
    ownerId?: string;
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
  };
  onChange: (filter: Partial<RevenueFilterProps["filter"]>) => void;
  facilities?: Facility[];
};

const RevenueFilter = ({
  filter,
  onChange,
  facilities = [],
}: RevenueFilterProps) => {
  const [dateError, setDateError] = useState("");

  const handleDateChange = (
    field: keyof RevenueFilterProps["filter"],
    value: string
  ) => {
    const newFilter = { ...filter, [field]: value };
    if (
      newFilter.startDate &&
      newFilter.endDate &&
      newFilter.startDate > newFilter.endDate
    ) {
      setDateError("Từ ngày phải nhỏ hơn hoặc bằng Đến ngày");
    } else {
      setDateError("");
      onChange({ [field]: value });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-t-8 border-green-600 w-full flex flex-col">
      <div>
        <div className="font-semibold text-white bg-green-600 rounded-t px-4 py-2 mb-6 text-lg text-center">
          Bộ lọc
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn Cơ sở
            </label>
            <select
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              value={filter.facilityId}
              onChange={(e) => onChange({ facilityId: e.target.value })}
              title="Chọn cơ sở"
            >
              <option value="">Tất cả</option>
              {facilities
                .filter((fac) => fac.userId === filter.ownerId)
                .map((fac) => (
                  <option key={fac.facId} value={fac.facId}>
                    {fac.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian
            </label>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="time"
                  checked={
                    !filter.startDate &&
                    !filter.endDate &&
                    !filter.month &&
                    !filter.year
                  }
                  onChange={() =>
                    onChange({
                      startDate: "",
                      endDate: "",
                      month: "",
                      year: "",
                    })
                  }
                />{" "}
                Tất cả
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="time"
                  checked={!!filter.month}
                  onChange={() =>
                    onChange({
                      month: String(new Date().getMonth() + 1),
                      year: "",
                      startDate: "",
                      endDate: "",
                    })
                  }
                />{" "}
                Theo tháng
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="time"
                  checked={!!filter.year}
                  onChange={() =>
                    onChange({
                      year: String(new Date().getFullYear()),
                      month: "",
                      startDate: "",
                      endDate: "",
                    })
                  }
                />{" "}
                Theo năm
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ ngày:
              </label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                value={filter.startDate}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
                title="Từ ngày"
                placeholder="dd/mm/yyyy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đến ngày:
              </label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                value={filter.endDate}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                title="Đến ngày"
                placeholder="dd/mm/yyyy"
              />
            </div>
          </div>
          {dateError && (
            <div className="text-green-500 text-sm mt-2">{dateError}</div>
          )}
          <div className="flex justify-center mt-4">
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded shadow w-full md:w-auto"
              onClick={() => {
                setDateError("");
                onChange({
                  facilityId: "",
                  startDate: "",
                  endDate: "",
                  month: "",
                  year: "",
                });
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueFilter;
