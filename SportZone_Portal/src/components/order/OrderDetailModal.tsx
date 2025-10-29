/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import type { Order, OrderServiceType, Service, User } from "../interface"
import { OrderServiceForm } from "./OrderServiceForm"
import { BookingExtensionForm } from "./BookingExtensionForm"
import { MdDelete, MdPerson, MdPhone, MdCalendarToday, MdCreditCard } from "react-icons/md"
import Swal from 'sweetalert2';
interface OrderDetailModalProps {
  order: Order
  orderServices: OrderServiceType[]
  services: Service[]
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddService: (orderService: Omit<OrderServiceType, "order_service_id">) => void
  onUpdateService: (orderServiceId: string, updates: Partial<OrderServiceType>) => void
  onDeleteService: (orderServiceId: string) => void
  onBookExtension: (orderId: string, hours: number, pricePerHour: number) => void
  onUpdateOrderStatus: (orderId: string, newStatus: "pending" | "paid" | "cancelled") => void
}

export function OrderDetailModal({
  order,
  orderServices,
  services,
  user,
  open,
  onOpenChange,
  onAddService,
  onUpdateService,
  onDeleteService,
  onBookExtension,
  onUpdateOrderStatus,
}: OrderDetailModalProps) {
  const [isPaying, setIsPaying] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  console.log(`OrderDetailModal - Order ID: ${order.order_id}, Status: ${order.status_payment}, User Role: ${user.role}`) // Debug log

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Đã thanh toán"
      case "pending":
        return "Chờ thanh toán"
      case "cancelled":
        return "Đã hủy"
      default:
        return status
    }
  }
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  };
  const canModify = order.status_payment === "pending" && user.role === "admin"

  const handlePayment = async () => {
    if (canModify && !isPaying) {
      console.log(`Attempting to confirm payment for order ${order.order_id}`) // Debug log
      try {
        setIsPaying(true)
        await onUpdateOrderStatus(order.order_id, "paid")
        console.log(`Payment confirmed for order ${order.order_id}`) // Debug log
        showToast("Xác nhận thanh toán thành công!","success")
      } catch (error) {
        console.error("Error confirming payment:", error)
        showToast("Không thể xác nhận thanh toán. Vui lòng thử lại.","error");
      } finally {
        setIsPaying(false)
      }
    } else {
      console.log(`Cannot confirm payment: canModify=${canModify}, isPaying=${isPaying}`) // Debug log
    }
  }

  const handleCancel = async () => {
    if (order.status_payment === "paid" && user.role === "admin" && !isCancelling) {
      console.log(`Attempting to cancel order ${order.order_id}`) // Debug log
      try {
        setIsCancelling(true)
        await onUpdateOrderStatus(order.order_id, "cancelled")
        console.log(`Order ${order.order_id} cancelled`) // Debug log
        alert("Hủy đơn hàng thành công!")
      } catch (error) {
        console.error("Error cancelling order:", error)
        alert("Không thể hủy đơn hàng. Vui lòng thử lại.")
      } finally {
        setIsCancelling(false)
      }
    } else {
      console.log(`Cannot cancel: status=${order.status_payment}, role=${user.role}, isCancelling=${isCancelling}`) // Debug log
    }
  }

  return (
    <div className={`relative ${open ? "block" : "hidden"}`}>
      <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40" onClick={() => onOpenChange(false)}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto z-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Chi tiết đơn hàng #{order.order_id}</h2>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status_payment)}`}>
            {getStatusText(order.status_payment)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <MdPerson className="h-5 w-5" />
                Thông tin khách hàng
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MdPerson className="h-4 w-4 text-gray-500" />
                <span>{order.guest_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MdPhone className="h-4 w-4 text-gray-500" />
                <span>{order.guest_phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MdCalendarToday className="h-4 w-4 text-gray-500" />
                <span>{new Date(order.create_at).toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MdCreditCard className="h-4 w-4 text-gray-500" />
                <span>{order.content_payment}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="p-4">
              <h3 className="text-lg font-semibold">Tổng quan đơn hàng</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span>Booking ID:</span>
                <span className="font-mono">{order.booking_id}</span>
              </div>
              <div className="flex justify-between">
                <span>Facility ID:</span>
                <span className="font-mono">{order.fac_id}</span>
              </div>
              <hr className="border-t border-gray-200" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng tiền:</span>
                <span>{order.total_amount.toLocaleString("vi-VN")}đ</span>
              </div>
              {canModify && (
                <button
                  onClick={handlePayment}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isPaying}
                >
                  {isPaying ? "Đang xử lý..." : "Xác nhận thanh toán"}
                </button>
              )}
              {order.status_payment === "paid" && user.role === "admin" && (
                <button
                  onClick={handleCancel}
                  className="mt-2 w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={isCancelling}
                >
                  {isCancelling ? "Đang xử lý..." : "Hủy đơn hàng"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg bg-white shadow-sm mt-6">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Dịch vụ đã đặt</h3>
            <div className="flex gap-2">
              {canModify && (
                <>
                  <BookingExtensionForm orderId={order.order_id} onBookExtension={onBookExtension} />
                  <OrderServiceForm orderId={order.order_id} services={services} onSubmit={onAddService} />
                </>
              )}
            </div>
          </div>
          <div className="p-4">
            {orderServices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Chưa có dịch vụ nào được đặt</p>
            ) : (
              <div className="space-y-4">
                {orderServices.map((orderService) => (
                  <div
                    key={orderService.order_service_id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{orderService.service_name}</h4>
                      <p className="text-sm text-gray-500">{orderService.service_description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span>Số lượng: {orderService.quantity}</span>
                        <span>Đơn giá: {orderService.price.toLocaleString("vi-VN")}đ</span>
                        <span className="font-medium">
                          Thành tiền: {(orderService.quantity * orderService.price).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                    {canModify && (
                      <div className="flex items-center gap-2">
                        <OrderServiceForm
                          orderService={orderService}
                          orderId={order.order_id}
                          services={services}
                          onSubmit={onAddService}
                          onUpdate={onUpdateService}
                          isEdit={true}
                        />
                        <button
                          className="p-2 text-red-600 hover:text-red-700"
                          onClick={() => onDeleteService(orderService.order_service_id)}
                        >
                          <MdDelete className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {!canModify && order.status_payment !== "paid" && (
          <div className="text-sm text-gray-500 text-center p-4 bg-gray-100 rounded-lg mt-4">
            Đơn hàng đã được thanh toán hoặc hủy, không thể chỉnh sửa
          </div>
        )}
      </div>
    </div>
  )
}