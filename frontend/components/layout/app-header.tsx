"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { logout } from "@/lib/features/auth/authSlice";
import type { AppDispatch, RootState } from "@/lib/store";
import { cn } from "@/lib/utils";

const formatSegment = (segment: string) =>
  segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

export const AppHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const items = segments.map((segment, index) => ({
      label: formatSegment(segment),
      href: `/${segments.slice(0, index + 1).join("/")}`,
      isCurrent: index === segments.length - 1,
    }));
    return items.length ? items : [{ label: "Dashboard", href: "/dashboard", isCurrent: true }];
  }, [pathname]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace("/login");
  };

  const navConfig = [
    {
      type: "link" as const,
      label: "Dashboard",
      href: "/dashboard"
    },
    {
      type: "menu" as const,
      label: "Operations",
      items: [
        { label: "Receipts", href: "/receipts" },
        { label: "Delivery Orders", href: "/delivery-orders" },
        { label: "Stock Adjustments", href: "/stock-adjustments" }
      ]
    },
    {
      type: "menu" as const,
      label: "Stock",
      items: [
        { label: "Products", href: "/products" },
        { label: "Categories", href: "/categories" }
      ]
    },
    {
      type: "link" as const,
      label: "Move History",
      href: "/stock-ledger"
    },
    {
      type: "menu" as const,
      label: "Settings",
      items: [
        { label: "Warehouses", href: "/warehouses" },
        { label: "Locations", href: "/locations" }
      ]
    }
  ];

  return (
    <header className="relative z-50 border-b border-white/10 bg-[#030303] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold tracking-tight text-indigo-400">
            StockMaster
          </Link>
          <NavigationMenu className="flex-1 overflow-visible">
            <NavigationMenuList className="justify-start gap-2 overflow-visible">
              {navConfig.map((item) => {
                const isActiveLink = pathname === item.href;
                const isActiveMenu =
                  item.type === "menu" && item.items.some((subItem) => pathname.startsWith(subItem.href));

                return (
                  <NavigationMenuItem key={item.label}>
                    {item.type === "link" ? (
                      <NavigationMenuLink asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "border-0 bg-transparent px-3 text-sm font-medium text-indigo-200 transition-colors duration-200 hover:bg-indigo-500/10 hover:text-white focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303] data-[state=open]:bg-indigo-500/20",
                            isActiveLink && "bg-indigo-500/20 text-white"
                          )}
                        >
                          {item.label}
                        </Link>
                      </NavigationMenuLink>
                    ) : (
                      <>
                        <NavigationMenuTrigger
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "border-0 bg-transparent px-3 text-sm font-medium text-indigo-200 transition-colors duration-200 hover:bg-indigo-500/10 hover:text-white focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303] data-[state=open]:bg-indigo-500/20",
                            isActiveMenu && "bg-indigo-500/20 text-white"
                          )}
                        >
                          {item.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="z-50 rounded-xl border border-white/10 bg-[#111111] p-3 shadow-2xl backdrop-blur-xl">
                          <ul className="grid gap-1 md:w-56">
                            {item.items.map((subItem) => (
                              <li key={subItem.href}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={subItem.href}
                                    className={cn(
                                      "block rounded-md px-3 py-2 text-sm transition-colors",
                                      pathname.startsWith(subItem.href)
                                        ? "bg-indigo-500/20 text-white"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"
                                    )}
                                  >
                                    {subItem.label}
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    )}
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
            <NavigationMenuViewport className="z-50 border border-white/10 bg-[#111111] shadow-2xl backdrop-blur-xl" />
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {user && <span className="hidden sm:inline text-white/70">{user.email}</span>}
          <Button
            onClick={handleLogout}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Logout
          </Button>
        </div>
      </div>
      <div className="border-t border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur-sm sm:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              {index > 0 && <Separator orientation="vertical" className="h-4 bg-white/20" />}
              {crumb.isCurrent ? (
                <span className="font-medium text-white">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-white/70 transition-colors hover:text-white">
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
