export interface Order {
    order_id: string
    customer_id: string
    fac_id: string
    discount_id?: string
    booking_id: string
    guest_name: string
    guest_phone: string
    total_amount: number
    content_payment: string
    status_payment: "pending" | "paid" | "cancelled"
    create_at: string
}

export interface OrderServiceType {
    order_service_id: string
    order_id: string
    service_id: string
    quantity: number
    price: number
    service_name?: string
    service_description?: string
}

export interface OrderField {
    order_field_id: string
    order_id: string
    field_id: string
}

export interface Service {
    service_id: string
    name: string
    description: string
    price: number
    duration: number // in minutes
}

export interface User {
    id: string
    name: string
    role: "admin" | "user"
}

export interface BookingExtension {
    hours: number
    price_per_hour: number
}