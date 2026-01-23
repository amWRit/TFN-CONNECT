"use client";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import NotFound from "@/components/NotFound";

export default function AdminManualPage() {
  const [content, setContent] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const admin = typeof window !== "undefined" && localStorage.getItem("adminAuth") === "true";
    setIsAdmin(admin);
    if (admin) {
      fetch("/manuals/manual-admin.md")
        .then((res) => res.text())
        .then(setContent);
    }
  }, []);

  if (isAdmin === null) return null; // loading
  if (!isAdmin) return <NotFound />;

  return (
    <main className="max-w-4xl xl:max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8 prose">
      <ReactMarkdown>{content}</ReactMarkdown>
    </main>
  );
}
