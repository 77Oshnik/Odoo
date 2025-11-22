'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { AppDispatch, RootState } from '@/lib/store';
import { logout } from '@/lib/features/auth/authSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardKpis {
  counts: {
    totalProducts: number;
    activeProducts: number;
    totalCategories: number;
    totalWarehouses: number;
  };
  inventory: {
    totalStock: number;
    lowStockProducts: number;
  };
  operations: {
    pendingReceipts: number;
    pendingDeliveries: number;
    pendingTransfers: number;
  };
}

interface DashboardFilters {
  categories: Array<{ id: string; name: string }>;
  warehouses: Array<{ id: string; name: string }>;
  statuses: {
    receipt: string[];
    delivery: string[];
    transfer: string[];
  };
}

const metricSkeletons = Array.from({ length: 4 });

const DashboardPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [filters, setFilters] = useState<DashboardFilters | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [kpisResponse, filtersResponse] = await Promise.all([
          api.get<DashboardKpis>('/dashboard/kpis'),
          api.get<DashboardFilters>('/dashboard/filters')
        ]);

        if (!isMounted) {
          return;
        }

        setKpis(kpisResponse.data);
        setFilters(filtersResponse.data);
      } catch (error: any) {
        if (error.response?.status === 401) {
          await dispatch(logout());
          router.replace('/login');
          return;
        }
        const message = error.response?.data?.message || 'Failed to load dashboard data';
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const storedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (!storedToken) {
      router.replace('/login');
      return;
    }

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [token, dispatch, router]);

  const kpiCards = useMemo(
    () => [
      {
        title: 'Total Products',
        description: 'Total number of products in the catalog',
        value: kpis?.counts.totalProducts ?? 0
      },
      {
        title: 'Active Products',
        description: 'Products currently available',
        value: kpis?.counts.activeProducts ?? 0
      },
      {
        title: 'Categories',
        description: 'Distinct product categories',
        value: kpis?.counts.totalCategories ?? 0
      },
      {
        title: 'Warehouses',
        description: 'Active warehouse locations',
        value: kpis?.counts.totalWarehouses ?? 0
      }
    ],
    [kpis]
  );

  const operationCards = useMemo(
    () => [
      {
        title: 'Pending Receipts',
        value: kpis?.operations.pendingReceipts ?? 0,
        description: 'Waiting or ready to receive'
      },
      {
        title: 'Pending Deliveries',
        value: kpis?.operations.pendingDeliveries ?? 0,
        description: 'Waiting or ready to deliver'
      },
      {
        title: 'Pending Transfers',
        value: kpis?.operations.pendingTransfers ?? 0,
        description: 'Transfers pending completion'
      }
    ],
    [kpis]
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {user ? `Welcome back, ${user.name.split(' ')[0]}!` : 'Dashboard'}
        </h1>
        <p className="text-sm text-slate-600">
          Monitor key stock performance indicators and access quick filters for deeper analysis.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? metricSkeletons.map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-2 h-3 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-20" />
                </CardContent>
              </Card>
            ))
          : kpiCards.map((card) => (
              <Card key={card.title}>
                <CardHeader>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">{card.value}</p>
                </CardContent>
              </Card>
            ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>Stock coverage derived from all warehouse locations.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            {isLoading ? (
              metricSkeletons.slice(0, 2).map((_, index) => (
                <div key={index} className="space-y-2 rounded-lg border p-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))
            ) : (
              <>
                <div className="space-y-2 rounded-lg border p-4">
                  <p className="text-sm font-medium text-slate-500">Total Stock Units</p>
                  <p className="text-3xl font-semibold">{kpis?.inventory.totalStock ?? 0}</p>
                </div>
                <div className="space-y-2 rounded-lg border p-4">
                  <p className="text-sm font-medium text-slate-500">Low Stock Products</p>
                  <p className="text-3xl font-semibold text-amber-600">
                    {kpis?.inventory.lowStockProducts ?? 0}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational Snapshot</CardTitle>
            <CardDescription>Priority documents that need attention.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {isLoading
              ? metricSkeletons.slice(0, 3).map((_, index) => (
                  <div key={index} className="space-y-1 rounded-lg border p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))
              : operationCards.map((card) => (
                  <div key={card.title} className="space-y-1 rounded-lg border p-4">
                    <p className="text-sm font-medium text-slate-500">{card.title}</p>
                    <p className="text-2xl font-semibold">{card.value}</p>
                    <p className="text-xs text-slate-500">{card.description}</p>
                  </div>
                ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Quick Filters</CardTitle>
            <CardDescription>Select a filter to narrow down product analytics.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {isLoading ? (
              metricSkeletons.slice(0, 2).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((__, chipIndex) => (
                      <Skeleton key={chipIndex} className="h-6 w-20 rounded-full" />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-600">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {filters?.categories.length ? (
                      filters.categories.map((category) => (
                        <Badge key={category.id} variant="secondary">
                          {category.name}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No categories configured yet.</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-600">Warehouses</p>
                  <div className="flex flex-wrap gap-2">
                    {filters?.warehouses.length ? (
                      filters.warehouses.map((warehouse) => (
                        <Badge key={warehouse.id}>{warehouse.name}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No warehouses configured yet.</p>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="mb-3 text-sm font-semibold text-slate-600">Document Statuses</p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {filters && (
                      <>
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase text-slate-500">Receipts</p>
                          <div className="flex flex-wrap gap-2">
                            {filters.statuses.receipt.map((status) => (
                              <Badge key={status} variant="outline">
                                {status}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase text-slate-500">Deliveries</p>
                          <div className="flex flex-wrap gap-2">
                            {filters.statuses.delivery.map((status) => (
                              <Badge key={status} variant="outline">
                                {status}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase text-slate-500">Transfers</p>
                          <div className="flex flex-wrap gap-2">
                            {filters.statuses.transfer.map((status) => (
                              <Badge key={status} variant="outline">
                                {status}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default DashboardPage;
