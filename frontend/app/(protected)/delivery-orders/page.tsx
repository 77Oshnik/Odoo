"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Search, MoreHorizontal, Truck, Package, CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import api from "@/lib/axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DeliveryOrder {
  _id: string
  deliveryNumber: string
  customer: string
  warehouse: {
    _id: string
    name: string
  }
  status: "draft" | "waiting" | "ready" | "done" | "canceled"
  deliveryDate: string
  products: any[]
  createdAt: string
}

export default function DeliveryOrderPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<DeliveryOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get("/delivery-orders")
      if (response.data.success) {
        setOrders(response.data.data)
      }
    } catch (error) {
      toast.error("Failed to fetch delivery orders")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
      case "waiting":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "ready":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "done":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      case "canceled":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Package className="w-4 h-4 mr-1" />
      case "waiting":
        return <Clock className="w-4 h-4 mr-1" />
      case "ready":
        return <Truck className="w-4 h-4 mr-1" />
      case "done":
        return <CheckCircle className="w-4 h-4 mr-1" />
      case "canceled":
        return <XCircle className="w-4 h-4 mr-1" />
      default:
        return null
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="relative min-h-screen bg-[#030303] overflow-hidden">
      <div className="relative z-10 space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Delivery Orders</h1>
            <p className="text-sm sm:text-base text-white/60 mt-2">Manage your outbound deliveries</p>
          </div>
          <Link href="/delivery-orders/create">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Order
            </Button>
          </Link>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-lg"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Orders</h2>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <Input
                placeholder="Search orders..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/[0.02]">
                  <TableHead className="text-white/70">Order #</TableHead>
                  <TableHead className="text-white/70">Customer</TableHead>
                  <TableHead className="text-white/70">Warehouse</TableHead>
                  <TableHead className="text-white/70">Date</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-right text-white/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-white/40">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-white/40">
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order._id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                      <TableCell className="font-medium text-white">{order.deliveryNumber}</TableCell>
                      <TableCell className="text-white/70">{order.customer || "-"}</TableCell>
                      <TableCell className="text-white/70">{order.warehouse?.name}</TableCell>
                      <TableCell className="text-white/70">
                        {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(order.status)} border flex w-fit items-center`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4 text-white/70" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10">
                            <DropdownMenuLabel className="text-white/80">Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              className="cursor-pointer text-white hover:bg-white/10"
                              onClick={() => router.push(`/delivery-orders/${order._id}`)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                              className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              onClick={() => {
                                // Handle delete
                              }}
                            >
                              Delete Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
