'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink
} from '@/components/ui/navigation-menu';
import { logout } from '@/lib/features/auth/authSlice';
import { AppDispatch, RootState } from '@/lib/store';

const formatSegment = (segment: string) =>
  segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const AppHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const items = segments.map((segment, index) => ({
      label: formatSegment(segment),
      href: `/${segments.slice(0, index + 1).join('/')}`,
      isCurrent: index === segments.length - 1
    }));
    return items.length ? items : [{ label: 'Dashboard', href: '/dashboard', isCurrent: true }];
  }, [pathname]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace('/login');
  };

  const navConfig = [
    {
      type: 'link' as const,
      label: 'Dashboard',
      href: '/dashboard'
    },
    {
      type: 'menu' as const,
      label: 'Operations',
      items: [
        { label: 'Receipts', href: '/receipts' },
        { label: 'Delivery Orders', href: '/delivery-orders' },
        { label: 'Stock Adjustments', href: '/stock-adjustments' }
      ]
    },
    {
      type: 'menu' as const,
      label: 'Stock',
      items: [
        { label: 'Products', href: '/products' },
        { label: 'Categories', href: '/categories' },
        { label: 'Reordering Rules', href: '/reordering-rules' }
      ]
    },
    {
      type: 'link' as const,
      label: 'Move History',
      href: '/stock-ledger'
    },
    {
      type: 'menu' as const,
      label: 'Settings',
      items: [
        { label: 'Warehouses', href: '/warehouses' },
        { label: 'Locations', href: '/locations' }
      ]
    }
  ];

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-slate-900">
            StockMaster
          </Link>
          <NavigationMenu className="flex-1">
            <NavigationMenuList className="justify-start gap-2">
              {navConfig.map((item) => (
                <NavigationMenuItem key={item.label}>
                  {item.type === 'link' ? (
                    <Link href={item.href} passHref legacyBehavior>
                      <NavigationMenuLink active={pathname === item.href}>
                        {item.label}
                      </NavigationMenuLink>
                    </Link>
                  ) : (
                    <>
                      <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid gap-2 rounded-md bg-white p-2 shadow-md md:w-56">
                          {item.items.map((subItem) => (
                            <li key={subItem.href}>
                              <Link href={subItem.href} passHref legacyBehavior>
                                <NavigationMenuLink active={pathname.startsWith(subItem.href)}>
                                  {subItem.label}
                                </NavigationMenuLink>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          {user && <span className="hidden sm:inline">{user.email}</span>}
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-slate-200">
            Logout
          </Button>
        </div>
      </div>
      <div className="border-t px-4 py-2 text-sm text-slate-500 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              {index > 0 && <Separator orientation="vertical" className="h-4" />}
              {crumb.isCurrent ? (
                <span className="font-medium text-slate-900">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="transition-colors hover:text-slate-900">
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
};
