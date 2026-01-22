"use client";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function ManualPage() {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/manuals/manual-user.md")
      .then((res) => res.text())
      .then(setContent);
  }, []);

  return (
    <main className="max-w-4xl xl:max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8 prose">
      <ReactMarkdown>{content}</ReactMarkdown>
    </main>
  );
}
