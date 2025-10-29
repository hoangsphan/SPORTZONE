/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { MdAccessTime, MdAttachMoney, MdPeople, MdShoppingCart } from "react-icons/md"
import Sidebar from "../../Sidebar"
import type { Order, OrderServiceType, Service, User } from "../interface"
import { OrderList } from "../order/OrderList"
import { OrderService } from "../services/orderServices"

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [orderServices, setOrderServices] = useState<OrderServiceType[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null)

  const [currentUser] = useState<User>({
    id: "user_1",
    name: "Admin User",
    role: "admin",
  })
  //call API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [ordersData, orderServicesData, servicesData] = await Promise.all([
          OrderService.getOrders(),
          OrderService.getOrderServices(),
          OrderService.getServices(),
        ])

        setOrders(ordersData)
        setOrderServices(orderServicesData)
        setServices(servicesData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getOrderServices = (orderId: string) => {
    return orderServices.filter((os) => os.order_id === orderId)
  }

  //add service cho đơn hàng
  const addOrderService = async (orderService: Omit<OrderServiceType, "order_service_id">) => {
    try {
      const newOrderService = await OrderService.addOrderService(orderService)
      setOrderServices((prev) => [...prev, newOrderService])
      await OrderService.updateOrderTotal(orderService.order_id)
      const updatedOrders = await OrderService.getOrders()
      setOrders(updatedOrders)
    } catch (error) {
      console.error("Error adding order service:", error)
    }
  }
  //cập nhật dịch vụ đã đặt
  const updateOrderService = async (orderServiceId: string, updates: Partial<OrderServiceType>) => {
    try {
      const updatedOrderService = await OrderService.updateOrderService(orderServiceId, updates)
      setOrderServices((prev) => prev.map((os) => (os.order_service_id === orderServiceId ? updatedOrderService : os)))
      const orderService = orderServices.find((os) => os.order_service_id === orderServiceId)
      if (orderService) {
        await OrderService.updateOrderTotal(orderService.order_id)
        const updatedOrders = await OrderService.getOrders()
        setOrders(updatedOrders)
      }
    } catch (error) {
      console.error("Error updating order service:", error)
    }
  }

  const deleteOrderService = async (orderServiceId: string) => {
    try {
      const orderService = orderServices.find((os) => os.order_service_id === orderServiceId)
      await OrderService.deleteOrderService(orderServiceId)
      setOrderServices((prev) => prev.filter((os) => os.order_service_id !== orderServiceId))
      if (orderService) {
        await OrderService.updateOrderTotal(orderService.order_id)
        const updatedOrders = await OrderService.getOrders()
        setOrders(updatedOrders)
      }
    } catch (error) {
      console.error("Error deleting order service:", error)
    }
  }

  const bookAdditionalHours = async (orderId: string, hours: number, pricePerHour: number) => {
    try {
      await OrderService.bookAdditionalHours(orderId, hours, pricePerHour)
      const updatedOrders = await OrderService.getOrders()
      setOrders(updatedOrders)
    } catch (error) {
      console.error("Error booking additional hours:", error)
    }
  }

  //xác nhận thanh toán
  const confirmPayment = async (orderId: string, newStatus: "pending" | "paid" | "cancelled") => {
    console.log(`Confirming payment for order ${orderId} with status ${newStatus}`) // Debug log
    try {
      setPayingOrderId(orderId)
      await OrderService.updateOrderPaymentStatus(orderId, newStatus)
      const updatedOrders = await OrderService.getOrders()
      setOrders(updatedOrders)
      console.log("Updated orders:", updatedOrders) // Debug log
    } catch (error) {
      console.error("Error confirming payment:", error)
      throw error
    } finally {
      setPayingOrderId(null)
    }
  }
  // tính tổng đơn hàng
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status_payment === "pending").length,
    paidOrders: orders.filter((o) => o.status_payment === "paid").length,
    totalRevenue: orders.filter((o) => o.status_payment === "paid").reduce((sum, o) => sum + o.total_amount, 0),
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 pt-16 pl-64">
        <Sidebar />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Đang tải...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pt-16 pl-64">
      <Sidebar />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
            <p className="text-gray-500">Quản lý đơn hàng và dịch vụ của khách hàng</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="p-4 flex flex-row items-center justify-between">
              <h3 className="text-sm font-medium">Tổng đơn hàng</h3>
              <MdShoppingCart className="h-4 w-4 text-gray-500" />
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="p-4 flex flex-row items-center justify-between">
              <h3 className="text-sm font-medium">Chờ thanh toán</h3>
              <MdAccessTime className="h-4 w-4 text-gray-500" />
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="p-4 flex flex-row items-center justify-between">
              <h3 className="text-sm font-medium">Đã thanh toán</h3>
              <MdPeople className="h-4 w-4 text-gray-500" />
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.paidOrders}</div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="p-4 flex flex-row items-center justify-between">
              <h3 className="text-sm font-medium">Tổng doanh thu</h3>
              <MdAttachMoney className="h-4 w-4 text-gray-500" />
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString("vi-VN")}đ</div>
            </div>
          </div>
        </div>

       

        <OrderList
          orders={orders}
          orderServices={orderServices}
          services={services}
          user={currentUser}
          getOrderServices={getOrderServices}
          onAddService={addOrderService}
          onUpdateService={updateOrderService}
          onDeleteService={deleteOrderService}
          onBookExtension={bookAdditionalHours}
          onUpdateOrderStatus={confirmPayment}
        />
      </div>
    </div>
  )
}