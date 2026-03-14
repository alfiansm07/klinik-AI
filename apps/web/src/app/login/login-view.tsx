"use client";

import { useState } from "react";

import { Activity, Lock, Building2, LayoutDashboard } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

const trustIndicators = [
  { icon: Lock, text: "Keamanan Data Terjamin" },
  { icon: Building2, text: "Multi-Klinik Support" },
  { icon: LayoutDashboard, text: "Dashboard Terintegrasi" },
];

export default function LoginView() {
  const [showSignIn, setShowSignIn] = useState(true);

  return (
    <div className="flex min-h-svh">
      {/* ── Branding Panel (left) ── */}
      <div className="login-gradient relative hidden flex-col justify-between overflow-hidden p-12 text-white md:flex md:w-2/5 lg:w-1/2">
        {/* Decorative circles */}
        <div
          className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10"
          aria-hidden="true"
        />
        <div
          className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-white/10"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/3 right-12 h-32 w-32 rounded-full bg-white/5"
          aria-hidden="true"
        />

        {/* Logo & Brand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="font-heading text-2xl font-bold tracking-tight">
              Klinikai
            </span>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="space-y-6"
        >
          <div>
            <h2 className="font-heading text-3xl leading-tight font-semibold lg:text-4xl">
              Sistem Manajemen
              <br />
              Klinik Modern
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
              Kelola klinik Anda dengan efisien. Dari pendaftaran pasien hingga
              laporan keuangan — semua dalam satu platform.
            </p>
          </div>

          {/* Trust indicators */}
          <div className="space-y-3">
            {trustIndicators.map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/15">
                  <item.icon className="h-4 w-4 text-white/90" />
                </div>
                <span className="text-sm text-white/80">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xs text-white/50"
        >
          &copy; {new Date().getFullYear()} Klinikai. All rights reserved.
        </motion.p>
      </div>

      {/* ── Form Panel (right) ── */}
      <div className="relative flex flex-1 flex-col items-center justify-center bg-background px-6 py-12 md:px-12">
        {/* Mobile header — visible only on small screens */}
        <div className="mb-8 flex items-center gap-2 md:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold text-foreground">
            Klinikai
          </span>
        </div>

        {/* Form container */}
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {showSignIn ? (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
