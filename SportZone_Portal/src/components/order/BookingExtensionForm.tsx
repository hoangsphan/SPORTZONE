"use client"

import type React from "react"
import { useState } from "react"
import { MdAccessTime } from "react-icons/md"

interface BookingExtensionFormProps {
  orderId: string
  onBookExtension: (orderId: string, hours: number, pricePerHour: number) => void
}

export function BookingExtensionForm({ orderId, onBookExtension }: BookingExtensionFormProps) {
  const [open, setOpen] = useState(false)
  const [hours, setHours] = useState(1)
  const [pricePerHour, setPricePerHour] = useState(100000)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onBookExtension(orderId, hours, pricePerHour)
    setOpen(false)
    setHours(1)
    setPricePerHour(100000)
  }

  const totalCost = hours * pricePerHour

  return (
    <div className={`relative ${open ? "block" : "hidden"}`}>
      {/* Dialog Trigger */}
      <button
        className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
        onClick={() => setOpen(true)}
      >
        <MdAccessTime className="h-4 w-4" />
        Gia hạn giờ
      </button>

      {/* Dialog Content */}
      {open && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40" onClick={() => setOpen(false)}></div>
      )}
      {open && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg max-w-md w-full z-50">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Gia hạn thời gian booking</h2>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="hours" className="font-medium">
                Số giờ gia hạn
              </label>
              <input
                id="hours"
                type="number"
                min="0.5"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(Number.parseFloat(e.target.value) || 1)}
                className="p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="pricePerHour" className="font-medium">
                Giá mỗi giờ (VNĐ)
              </label>
              <input
                id="pricePerHour"
                type="number"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(Number.parseInt(e.target.value) || 100000)}
                className="p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="text-sm font-medium">Tổng chi phí gia hạn: {totalCost.toLocaleString("vi-VN")}đ</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Xác nhận gia hạn
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}