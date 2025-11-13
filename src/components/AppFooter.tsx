import { Gavel, Globe, Twitter, Instagram, Linkedin, Github, Lock, ShieldCheck, CreditCard, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AppFooter() {
  return (
    <footer className="relative border-t supports-[backdrop-filter]:bg-white/50 bg-white/70 backdrop-blur-xl">
      {/* hairline gradient */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-fuchsia-400/40 to-transparent" />

      <div className="container mx-auto px-4 py-12 text-slate-700">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Newsletter */}
          <div className="md:col-span-5">
            <div className="max-w-md">
              <div className="flex items-center gap-2 font-bold text-xl">
                <Gavel className="h-5 w-5" /> SnapBid
              </div>
              <h3 className="mt-3 text-lg font-semibold">Don’t miss new drops</h3>
              <p className="text-sm text-slate-500">
                Get alerts for curated auctions, exclusive releases, and price drops.
              </p>
              <form
                className="mt-4 flex items-center gap-2"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="relative w-full">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="pl-9 h-10"
                    required
                  />
                </div>
                <Button type="submit" className="h-10">
                  Subscribe
                </Button>
              </form>
              <p className="mt-2 text-xs text-slate-400">
                By subscribing, you agree to our Terms &amp; Privacy.
              </p>
            </div>
          </div>

          {/* Link columns */}
          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold">Marketplace</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#featured" className="hover:text-slate-900">Featured</a></li>
                <li><a href="#trending" className="hover:text-slate-900">Trending</a></li>
                <li><a href="#how" className="hover:text-slate-900">How it works</a></li>
                <li><a href="#" className="hover:text-slate-900">Categories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Resources</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#" className="hover:text-slate-900">Help Center</a></li>
                <li><a href="#" className="hover:text-slate-900">Guides</a></li>
                <li><a href="#" className="hover:text-slate-900">Buyer Protection</a></li>
                <li><a href="#" className="hover:text-slate-900">Seller Handbook</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Company</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#" className="hover:text-slate-900">About</a></li>
                <li><a href="#" className="hover:text-slate-900">Careers</a></li>
                <li><a href="#" className="hover:text-slate-900">Press</a></li>
                <li><a href="#" className="hover:text-slate-900">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Legal</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#" className="hover:text-slate-900">Terms</a></li>
                <li><a href="#" className="hover:text-slate-900">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-900">Cookies</a></li>
                <li><a href="#" className="hover:text-slate-900">Licenses</a></li>
              </ul>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: copyright */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Gavel className="h-4 w-4" /> © {new Date().getFullYear()} SnapBid. All rights reserved.
          </div>

          {/* Middle: language / currency */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-500" />
              <Select defaultValue="en">
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select defaultValue="usd">
              <SelectTrigger className="h-8 w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD</SelectItem>
                <SelectItem value="vnd">VND</SelectItem>
                <SelectItem value="eur">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Right: socials */}
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Twitter" className="p-2 rounded-full hover:bg-slate-100">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Instagram" className="p-2 rounded-full hover:bg-slate-100">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="LinkedIn" className="p-2 rounded-full hover:bg-slate-100">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="#" aria-label="GitHub" className="p-2 rounded-full hover:bg-slate-100">
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Trust row */}
        <div className="mt-4 text-xs text-slate-500 flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <Lock className="h-3.5 w-3.5" /> Secure checkout (TLS)
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Buyer protection
          </span>
          <span className="inline-flex items-center gap-1">
            <CreditCard className="h-3.5 w-3.5" /> We accept major cards
          </span>
        </div>
      </div>
    </footer>
  );
}
