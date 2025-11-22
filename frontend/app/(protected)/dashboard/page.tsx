"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import { motion } from "framer-motion"
import api from "@/lib/axios"
import type { AppDispatch, RootState } from "@/lib/store"
import { logout } from "@/lib/features/auth/authSlice"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardKpis {
  counts: {
    totalProducts: number
    activeProducts: number
    totalCategories: number
    totalWarehouses: number
  }
  inventory: {
    totalStock: number
    lowStockProducts: number
  }
  operations: {
    pendingReceipts: number
    pendingDeliveries: number
    pendingTransfers: number
  }
}

interface DashboardFilters {
  categories: Array<{ id: string; name: string }>
  warehouses: Array<{ id: string; name: string }>
  statuses: {
    receipt: string[]
    delivery: string[]
    transfer: string[]
  }
}

const metricSkeletons = Array.from({ length: 4 })

const DashboardPage = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { token, user } = useSelector((state: RootState) => state.auth)
  const [kpis, setKpis] = useState<DashboardKpis | null>(null)
  const [filters, setFilters] = useState<DashboardFilters | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const [kpisResponse, filtersResponse] = await Promise.all([
          api.get<DashboardKpis>("/dashboard/kpis"),
          api.get<DashboardFilters>("/dashboard/filters"),
        ])

        if (!isMounted) {
          return
        }

        setKpis(kpisResponse.data)
        setFilters(filtersResponse.data)
      } catch (error: any) {
        if (error.response?.status === 401) {
          await dispatch(logout())
          router.replace("/login")
          return
        }
        const message = error.response?.data?.message || "Failed to load dashboard data"
        toast.error(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    const storedToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null)
    if (!storedToken) {
      router.replace("/login")
      return
    }

    fetchDashboardData()

    return () => {
      isMounted = false
    }
  }, [token, dispatch, router])

  const kpiCards = useMemo(
    () => [
      {
        title: "Total Products",
        description: "Total number of products in the catalog",
        value: kpis?.counts.totalProducts ?? 0,
      },
      {
        title: "Active Products",
        description: "Products currently available",
        value: kpis?.counts.activeProducts ?? 0,
      },
      {
        title: "Categories",
        description: "Distinct product categories",
        value: kpis?.counts.totalCategories ?? 0,
      },
      {
        title: "Warehouses",
        description: "Active warehouse locations",
        value: kpis?.counts.totalWarehouses ?? 0,
      },
    ],
    [kpis],
  )

  const operationCards = useMemo(
    () => [
      {
        title: "Pending Receipts",
        value: kpis?.operations.pendingReceipts ?? 0,
        description: "Waiting or ready to receive",
      },
      {
        title: "Pending Deliveries",
        value: kpis?.operations.pendingDeliveries ?? 0,
        description: "Waiting or ready to deliver",
      },
      {
        title: "Pending Transfers",
        value: kpis?.operations.pendingTransfers ?? 0,
        description: "Transfers pending completion",
      },
    ],
    [kpis],
  )

  return (
    <div className="relative min-h-screen bg-[#030303] overflow-hidden">
      <div className="relative z-10 flex flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {user ? `Welcome back, ${user.name.split(" ")[0]}!` : "Dashboard"}
          </h1>
          <p className="text-sm sm:text-base text-white/60">
            Monitor key stock performance indicators and access quick filters for deeper analysis.
          </p>
        </motion.header>

        {/* KPI Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {isLoading
            ? metricSkeletons.map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-lg"
                >
                  <Skeleton className="h-4 w-24 bg-white/10" />
                  <Skeleton className="mt-2 h-3 w-32 bg-white/10" />
                  <Skeleton className="mt-4 h-10 w-20 bg-white/10" />
                </div>
              ))
            : kpiCards.map((card, idx) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + idx * 0.05 }}
                >
                  <div className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-lg hover:bg-white/[0.08] transition-colors">
                    <p className="text-white/60 text-sm font-medium">{card.title}</p>
                    <p className="text-white/40 text-xs mt-1">{card.description}</p>
                    <p className="text-3xl sm:text-4xl font-bold text-white mt-4">{card.value}</p>
                  </div>
                </motion.div>
              ))}
        </motion.section>

        {/* Inventory & Operations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Inventory Overview */}
          <div className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Inventory Overview</h3>
            <p className="text-white/50 text-sm mb-6">Stock coverage derived from all warehouse locations.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 bg-white/10 rounded-lg" />
                  <Skeleton className="h-20 bg-white/10 rounded-lg" />
                </>
              ) : (
                <>
                  <div className="rounded-lg bg-white/[0.05] border border-white/5 p-4">
                    <p className="text-white/50 text-sm font-medium">Total Stock Units</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white mt-2">{kpis?.inventory.totalStock ?? 0}</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.05] border border-white/5 p-4">
                    <p className="text-white/50 text-sm font-medium">Low Stock Products</p>
                    <p className="text-2xl sm:text-3xl font-bold text-amber-400 mt-2">
                      {kpis?.inventory.lowStockProducts ?? 0}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Operational Snapshot */}
          <div className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Operational Snapshot</h3>
            <p className="text-white/50 text-sm mb-6">Priority documents that need attention.</p>
            <div className="space-y-3">
              {isLoading
                ? Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-16 bg-white/10 rounded-lg" />
                  ))
                : operationCards.map((card) => (
                    <div key={card.title} className="rounded-lg bg-white/[0.05] border border-white/5 p-4">
                      <p className="text-white/50 text-sm font-medium">{card.title}</p>
                      <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
                      <p className="text-xs text-white/40 mt-1">{card.description}</p>
                    </div>
                  ))}
            </div>
          </div>
        </motion.section>

        {/* Quick Filters */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-2">Quick Filters</h3>
          <p className="text-white/50 text-sm mb-6">Select a filter to narrow down product analytics.</p>
          <div className="grid gap-6 md:grid-cols-2">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="space-y-3">
                  <Skeleton className="h-4 w-32 bg-white/10" />
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((__, chipIdx) => (
                      <Skeleton key={chipIdx} className="h-6 w-20 rounded-full bg-white/10" />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div>
                  <p className="mb-3 text-sm font-semibold text-white/80">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {filters?.categories.length ? (
                      filters.categories.map((category) => (
                        <span
                          key={category.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        >
                          {category.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-white/40">No categories configured yet.</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-sm font-semibold text-white/80">Warehouses</p>
                  <div className="flex flex-wrap gap-2">
                    {filters?.warehouses.length ? (
                      filters.warehouses.map((warehouse) => (
                        <span
                          key={warehouse.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        >
                          {warehouse.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-white/40">No warehouses configured yet.</p>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="mb-3 text-sm font-semibold text-white/80">Document Statuses</p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {filters && (
                      <>
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase text-white/50">Receipts</p>
                          <div className="flex flex-wrap gap-2">
                            {filters.statuses.receipt.map((status) => (
                              <span
                                key={status}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white/5 text-white/70 border border-white/10"
                              >
                                {status}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase text-white/50">Deliveries</p>
                          <div className="flex flex-wrap gap-2">
                            {filters.statuses.delivery.map((status) => (
                              <span
                                key={status}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white/5 text-white/70 border border-white/10"
                              >
                                {status}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase text-white/50">Transfers</p>
                          <div className="flex flex-wrap gap-2">
                            {filters.statuses.transfer.map((status) => (
                              <span
                                key={status}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white/5 text-white/70 border border-white/10"
                              >
                                {status}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  )
}

export default DashboardPage
