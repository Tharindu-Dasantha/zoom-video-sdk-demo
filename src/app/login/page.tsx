"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import { Loader2, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-tl-navy p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <Logo size="md" className="justify-center" />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-tl-blue/10">
            <Lock className="h-6 w-6 text-tl-blue" />
          </div>
          <p className="text-sm text-white/60">Sign in to the admin dashboard</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg bg-tl-navy-800 border border-white/[0.08] p-6 shadow-xl"
        >
          {error && (
            <div className="rounded-lg bg-tl-error/10 border border-tl-error/20 px-4 py-3 text-sm text-tl-error">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-[11px] font-medium text-white/60 uppercase tracking-[0.08em]"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              autoComplete="off"
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-[11px] font-medium text-white/60 uppercase tracking-[0.08em]"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full h-11" disabled={loading || !email || !password}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-2 text-xs text-white/30">
          <span>A tenon-Link product by</span>
          <Image
            src="/Kneoxt/dark.png"
            alt="Kneoxt"
            width={16}
            height={16}
            className="rounded-sm opacity-60 grayscale hover:opacity-100 transition-opacity"
          />
          <span className="font-medium text-white/50">Kneoxt</span>
        </div>
      </div>
    </main>
  );
}
