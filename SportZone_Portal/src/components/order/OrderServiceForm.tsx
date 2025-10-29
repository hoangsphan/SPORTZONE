"use client"

import type React from "react"
import { useState } from "react"
import type { OrderServiceType, Service } from "../interface"
import { MdAdd, MdEdit } from "react-icons/md"

interface OrderServiceFormProps {
  orderService?: OrderServiceType
  orderId: string
  services: Service[]
  onSubmit: (orderService: Omit<OrderServiceType, "order_service_id">) => void
  onUpdate?: (orderServiceId: string, updates: Partial<OrderServiceType>) => void
  isEdit?: boolean
}

export function OrderServiceForm({
  orderService,
  orderId,
  services,
  onSubmit,
  onUpdate,
  isEdit = false,
}: OrderServiceFormProps) {
  const [open, setOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState(orderService?.service_id || "")
  const [quantity, setQuantity] = useState(orderService?.quantity || 1)
  const [price, setPrice] = useState(orderService?.price || 0)

  const selectedService = services.find((s) => s.service_id === selectedServiceId)

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    const service = services.find((s) => s.service_id === serviceId)
    if (service) {
      setPrice(service.price)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedServiceId) return

    const service = services.find((s) => s.service_id === selectedServiceId)

    if (isEdit && orderService && onUpdate) {
      onUpdate(orderService.order_service_id, {
        service_id: selectedServiceId,
        quantity,
        price,
        service_name: service?.name,
        service_description: service?.description,
      })
    } else {
      onSubmit({
        order_id: orderId,
        service_id: selectedServiceId,
        quantity,
        price,
        service_name: service?.name,
        service_description: service?.description,
      })
    }

    setOpen(false)
    if (!isEdit) {
      setSelectedServiceId("")
      setQuantity(1)
      setPrice(0)
    }
  }

  return (
    <div className="relative">
      {/* Dialog Trigger */}
      <button
        className={`flex items-center gap-2 px-${isEdit ? "2" : "4"} py-${isEdit ? "1" : "2"} ${
          isEdit ? "bg-transparent text-black" : "bg-blue-600 text-white"
        } rounded border ${isEdit ? "border-none" : "border-blue-600"}`}
        onClick={() => setOpen(true)}
      >
        {isEdit ? <MdEdit className="h-4 w-4" /> : <MdAdd className="h-4 w-4" />}
        {isEdit ? "" : "Thêm dịch vụ"}
      </button>

      {/* Dialog Content */}
      {open && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg max-w-md w-full z-50">
          <div className="mb-4">
            <h2 className="text-xl font-bold">{isEdit ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}</h2>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Service Select */}
            <div className="flex flex-col gap-2">
              <label htmlFor="service" className="font-medium">
                Dịch vụ
              </label>
              <select
                id="service"
                value={selectedServiceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="p-2 border border-gray-300 rounded w-full"
              >
                <option value="">Chọn dịch vụ</option>
                {services.map((service) => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.name} - {service.price.toLocaleString("vi-VN")}đ
                  </option>
                ))}
              </select>
            </div>

            {/* Service Description */}
            {selectedService && (
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">{selectedService.description}</p>
                <p className="text-sm font-medium">
                  Thời gian: {selectedService.duration} phút
                </p>
              </div>
            )}

            {/* Quantity Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="quantity" className="font-medium">
                Số lượng
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                className="p-2 border border-gray-300 rounded w-full"
              />
            </div>

            {/* Price Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="price" className="font-medium">
                Giá (VNĐ)
              </label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number.parseInt(e.target.value) || 0)}
                className="p-2 border border-gray-300 rounded w-full"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-transparent border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isEdit ? "Cập nhật" : "Thêm"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}