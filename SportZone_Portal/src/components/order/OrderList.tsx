/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import type { Order, OrderServiceType, Service, User } from "../interface"
import { OrderDetailModal } from "./OrderDetailModal"
import { MdSearch, MdVisibility, MdCalendarToday, MdPerson, MdPhone } from "react-icons/md"

interface OrderListProps {
  orders: Order[]
  orderServices: OrderServiceType[]
  services: Service[]
  user: User
  getOrderServices: (orderId: string) => OrderServiceType[]
  onAddService: (orderService: Omit<OrderServiceType, "order_service_id">) => void
  onUpdateService: (orderServiceId: string, updates: Partial<OrderServiceType>) => void
  onDeleteService: (orderServiceId: string) => void
  onBookExtension: (orderId: string, hours: number, pricePerHour: number) => void
  onUpdateOrderStatus: (orderId: string, newStatus: "pending" | "paid" | "cancelled") => void
}

export function OrderList({
  orders,
  orderServices,
  services,
  user,
  getOrderServices,
  onAddService,
  onUpdateService,
  onDeleteService,
  onBookExtension,
  onUpdateOrderStatus,
}: OrderListProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  console.log("OrderList props:", { orders, user, onUpdateOrderStatus }) // Debug log

  //lọc danh sách đơn hàng
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.guest_phone.includes(searchTerm) ||
      order.order_id.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || order.status_payment === statusFilter

    return matchesSearch && matchesStatus
  })

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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
          <input
            placeholder="Tìm kiếm theo tên, số điện thoại hoặc mã đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ thanh toán</option>
          <option value="paid">Đã thanh toán</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => {
          const orderServicesList = getOrderServices(order.order_id)
          const serviceCount = orderServicesList.length

          return (
            <div
              key={order.order_id}
              className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">#{order.order_id}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status_payment)}`}>
                    {getStatusText(order.status_payment)}
                  </span>
                </div>
                <div className="space-y-3">
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
                    <span>{new Date(order.create_at).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">{serviceCount} dịch vụ</span>
                      <span className="font-semibold">{order.total_amount.toLocaleString("vi-VN")}đ</span>
                    </div>
                    <button
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <MdVisibility className="h-4 w-4" />
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          orderServices={getOrderServices(selectedOrder.order_id)}
          services={services}
          user={user}
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
          onAddService={onAddService}
          onUpdateService={onUpdateService}
          onDeleteService={onDeleteService}
          onBookExtension={onBookExtension}
          onUpdateOrderStatus={onUpdateOrderStatus} // Truyền đúng hàm từ props
        />
      )}
    </div>
  )
}