"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import api from "@/lib/axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StockAdjustment {
  _id: string
  adjustmentNumber: string
  product: {
    _id: string
    name: string
    sku: string
  }
  warehouse: {
    _id: string
    name: string
  }
  recordedQuantity: number
  countedQuantity: number
  adjustmentQuantity: number
  reason: string
  adjustedBy: {
    name: string
  }
  createdAt: string
}

export default function StockAdjustmentPage() {
  const router = useRouter()
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [reasonFilter, setReasonFilter] = useState("all")

  useEffect(() => {
    fetchAdjustments()
  }, [])

  const fetchAdjustments = async () => {
    try {
      setLoading(true)
      const response = await api.get("/stock-adjustments")
      if (response.data.success) {
        setAdjustments(response.data.data)
      }
    } catch (error) {
      toast.error("Failed to fetch stock adjustments")
    } finally {
      setLoading(false)
    }
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "damaged":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "lost":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "found":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      case "expired":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "miscounted":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const filteredAdjustments = adjustments.filter((adj) => {
    const matchesSearch =
      adj.adjustmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adj.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adj.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesReason = reasonFilter === "all" || adj.reason === reasonFilter
    return matchesSearch && matchesReason
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
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Stock Adjustments</h1>
            <p className="text-sm sm:text-base text-white/60 mt-2">Manage inventory discrepancies and updates</p>
          </div>
          <Link href="/stock-adjustments/create">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Adjustment
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
          <h2 className="text-lg font-semibold text-white mb-6">Adjustments</h2>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <Input
                placeholder="Search adjustments..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by reason" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                <SelectItem value="all">All Reasons</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="found">Found</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="miscounted">Miscounted</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/[0.02]">
                  <TableHead className="text-white/70">Ref #</TableHead>
                  <TableHead className="text-white/70">Product</TableHead>
                  <TableHead className="text-white/70">Warehouse</TableHead>
                  <TableHead className="text-right text-white/70">Recorded</TableHead>
                  <TableHead className="text-right text-white/70">Counted</TableHead>
                  <TableHead className="text-right text-white/70">Diff</TableHead>
                  <TableHead className="text-white/70">Reason</TableHead>
                  <TableHead className="text-white/70">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-white/40">
                      Loading adjustments...
                    </TableCell>
                  </TableRow>
                ) : filteredAdjustments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-white/40">
                      No adjustments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdjustments.map((adj) => (
                    <TableRow key={adj._id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                      <TableCell className="font-medium text-white">{adj.adjustmentNumber}</TableCell>
                      <TableCell>
                        <div className="text-white">{adj.product.name}</div>
                        <div className="text-sm text-white/50">{adj.product.sku}</div>
                      </TableCell>
                      <TableCell className="text-white/70">{adj.warehouse.name}</TableCell>
                      <TableCell className="text-right text-white">{adj.recordedQuantity}</TableCell>
                      <TableCell className="text-right text-white">{adj.countedQuantity}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${adj.adjustmentQuantity > 0 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {adj.adjustmentQuantity > 0 ? "+" : ""}
                        {adj.adjustmentQuantity}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getReasonColor(adj.reason)} border capitalize`}>
                          {adj.reason}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/70">{new Date(adj.createdAt).toLocaleDateString()}</TableCell>
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
