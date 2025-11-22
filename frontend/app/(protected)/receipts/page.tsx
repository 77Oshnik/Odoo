"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter, FileText, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import type { AppDispatch, RootState } from "@/lib/store"
import { getReceipts } from "@/lib/features/receipts/receiptSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

export default function ReceiptsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { receipts, isLoading } = useSelector((state: RootState) => state.receipts)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    dispatch(getReceipts())
  }, [dispatch])

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      receipt.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.warehouse?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || receipt.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="secondary" className="bg-slate-500/20 text-slate-200">
            <Clock className="mr-1 h-3 w-3" /> Draft
          </Badge>
        )
      case "ready":
        return (
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
            <AlertCircle className="mr-1 h-3 w-3" /> Ready
          </Badge>
        )
      case "done":
        return (
          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Done
          </Badge>
        )
      case "canceled":
        return (
          <Badge variant="secondary" className="bg-red-500/20 text-red-200">
            <XCircle className="mr-1 h-3 w-3" /> Canceled
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-white/20 text-white/60">
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Receipts</h1>
          <p className="text-sm text-white/60">Manage incoming stock and supplier receipts.</p>
        </div>
        <Link href="/receipts/create">
          <Button className="w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Receipt
          </Button>
        </Link>
      </div>

      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white">All Receipts</CardTitle>
          <CardDescription className="text-white/60">View and filter your receipt documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search receipts, suppliers, or warehouses..."
                className="pl-9 bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-white/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white/10 border border-white/20 text-white">
                <Filter className="mr-2 h-4 w-4 text-white/40" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border border-white/10">
                <SelectItem value="all" className="text-white">
                  All Statuses
                </SelectItem>
                <SelectItem value="draft" className="text-white">
                  Draft
                </SelectItem>
                <SelectItem value="ready" className="text-white">
                  Ready
                </SelectItem>
                <SelectItem value="done" className="text-white">
                  Done
                </SelectItem>
                <SelectItem value="canceled" className="text-white">
                  Canceled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-white/70">Receipt #</TableHead>
                  <TableHead className="text-white/70">Date</TableHead>
                  <TableHead className="text-white/70">Supplier</TableHead>
                  <TableHead className="text-white/70">Warehouse</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-right text-white/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="border-white/10">
                      <TableCell>
                        <Skeleton className="h-4 w-24 bg-white/10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24 bg-white/10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32 bg-white/10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28 bg-white/10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-8 w-8 bg-white/10" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredReceipts.length === 0 ? (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={6} className="h-24 text-center text-white/40">
                      No receipts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReceipts.map((receipt) => (
                    <TableRow
                      key={receipt._id}
                      className="cursor-pointer border-white/10 hover:bg-white/5"
                      onClick={() => router.push(`/receipts/${receipt._id}`)}
                    >
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-white/40" />
                          {receipt.receiptNumber || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-white/60">
                        {receipt.createdAt ? format(new Date(receipt.createdAt), "MMM dd, yyyy") : "-"}
                      </TableCell>
                      <TableCell className="text-white/60">{receipt.supplier || "-"}</TableCell>
                      <TableCell className="text-white/60">{receipt.warehouse?.name || "-"}</TableCell>
                      <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-indigo-400 hover:text-indigo-300 hover:bg-white/10"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link href={`/receipts/${receipt._id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
