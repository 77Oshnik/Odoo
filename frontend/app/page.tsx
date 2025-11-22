'use client';

import Image from "next/image";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../lib/store";
import { logout } from "../lib/features/auth/authSlice";
import { Button } from "../components/ui/button";

export default function Home() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Welcome to Odoo Clone</h1>

        {user ? (
          <div className="flex flex-col gap-4 items-center sm:items-start">
            <p className="text-xl">Hello, {user.name}!</p>
            <p className="text-gray-600">{user.email}</p>
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        ) : (
          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <Link href="/login">
              <Button size="lg">Login</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg">Sign Up</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}