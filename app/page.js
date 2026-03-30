"use client"; // This must be at the top to use useState
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: "blue.ti", password: "aws199528" }),
      });
      const data = await res.json();
      setApiResponse(data);
    } catch (err) {
      console.log(err);
      setApiResponse({ error: "Failed to connect to API" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            SASv4 API Integration
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Click the button below to test the encrypted login request to the
            SASradius server.
          </p>
        </div>

        {/* --- Action Section --- */}
        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-white transition-colors hover:bg-[#383838] dark:bg-zinc-50 dark:text-black dark:hover:bg-[#ccc] md:w-[200px]"
          >
            {loading ? "Encrypting..." : "Test SASv4 Login"}
          </button>

          {apiResponse && (
            <div className="mt-4 w-full p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-auto max-h-40">
              <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                Response:
              </p>
              <pre className="text-sm font-mono dark:text-zinc-200">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
        {/* ---------------------- */}

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
