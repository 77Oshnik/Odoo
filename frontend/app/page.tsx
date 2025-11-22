'use client';

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../lib/store";
import { logout } from "../lib/features/auth/authSlice";
import { Button } from "../components/ui/button";
import HeroGeometric from "@/components/ui/modern-hero-section";
import FeatureGallery from "@/components/feature-gallery";
import Footer from "@/components/footer";

export default function Home() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <main className="bg-[#030303] min-h-screen">
      <HeroGeometric
        badge="Odoo Clone"
        title1="Manage Your"
        title2="Business Efficiently"
      >
        <div className="flex flex-col items-center gap-6">
          {user ? (
            <div className="flex flex-col gap-4 items-center">
              <p className="text-xl text-white/90">Hello, {user.name}!</p>
              <p className="text-white/60">{user.email}</p>
              <Button onClick={handleLogout} variant="secondary">Logout</Button>
            </div>
          ) : (
            <div className="flex gap-4 items-center flex-col sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="bg-white text-black hover:bg-white/90">Login</Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="lg" className="text-black border-white/20 hover:bg-white/10">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </HeroGeometric>

      <Footer />
    </main>
  );
}