"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Mail } from "lucide-react";

export default function WhitelistEmailsTab() {
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchEmails();
  }, []);

  async function fetchEmails() {
    setLoading(true);
    try {
      const res = await fetch("/api/whitelist-emails");
      let data: any[] = [];
      try {
        data = await res.json();
      } catch {
        data = [];
      }
      if (Array.isArray(data)) {
        setEmails(data.map((e: any) => e.email));
      } else {
        setEmails([]);
      }
    } catch (err) {
      setEmails([]);
    }
    setLoading(false);
  }

  async function addEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!newEmail) return;
    if (emails.includes(newEmail.trim().toLowerCase())) {
      setError("This email is already whitelisted.");
      setTimeout(() => setError("") , 3000);
      return;
    }
    await fetch("/api/whitelist-emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail }),
    });
    setNewEmail("");
    fetchEmails();
  }

  async function removeEmail(email: string) {
    await fetch(`/api/whitelist-emails?email=${encodeURIComponent(email)}`, {
      method: "DELETE",
    });
    fetchEmails();
  }

  return (
    <Card className="p-3 sm:p-6 w-full max-w-2xl mx-auto bg-white border-2 border-blue-400 rounded-xl shadow-md">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
        <Mail className="w-5 h-5 text-blue-500" /> Whitelisted Emails
      </h2>
      <form onSubmit={addEmail} className="flex flex-col sm:flex-row gap-2 mb-4 items-stretch sm:items-center bg-gray-50 rounded-lg p-2 sm:p-3 border-2 border-blue-300">
        <input
          type="email"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          placeholder="Add email..."
          className="border-2 border-blue-300 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
          required
        />
        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow px-4 py-2 font-medium w-full sm:w-auto">Add</Button>
      </form>
      {error && <div className="text-red-600 mb-2 font-medium">{error}</div>}
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : emails.length === 0 ? (
        <div className="text-gray-400">No whitelisted emails found.</div>
      ) : (
        <ul className="flex flex-col gap-2 sm:gap-3 rounded-lg border border-gray-200 bg-white p-1 sm:p-2">
          {emails.map(email => (
            <li key={email} className="flex justify-between items-center px-2 sm:px-4 py-2 bg-gray-50 rounded-lg shadow-sm hover:bg-blue-50 transition border-2 border-blue-300">
              <span className="font-mono text-gray-700 text-sm sm:text-base">{email}</span>
              <Button variant="ghost" size="icon" onClick={() => removeEmail(email)} className="text-red-500 hover:text-red-700 rounded-full p-2">
                <Trash2 size={20} />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
