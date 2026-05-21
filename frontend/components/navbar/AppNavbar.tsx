"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/shared/Button";

export function AppNavbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#d9deea] bg-white">
      <div className="flex h-20 items-center justify-between px-7">
        <Link href="/" className="flex items-center gap-8">
          <span className="text-[42px] font-semibold leading-none tracking-[-0.04em] text-[#0b5cff]">zoom</span>
          <nav className="hidden items-center gap-10 text-[19px] font-normal text-[#5b5a78] lg:flex">
            <span>Products</span>
            <span>Solutions</span>
            <span>Resources</span>
            <span>Plans & Pricing</span>
          </nav>
        </Link>

        <nav className="hidden items-center gap-8 text-[19px] font-normal text-[#5b5a78] md:flex">
          <Link className="hover:text-[#0b5cff]" href="/schedule">
            Schedule
          </Link>
          <Link className="hover:text-[#0b5cff]" href="/join">
            Join
          </Link>
          <Link className="inline-flex items-center gap-1 hover:text-[#0b5cff]" href="/dashboard">
            Host <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Link>
          <span className="inline-flex items-center gap-1">
            Web App <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111118] text-sm font-medium text-white">
            SV
          </div>
        </nav>

        <Button variant="ghost" className="md:hidden">Menu</Button>
      </div>
    </header>
  );
}
