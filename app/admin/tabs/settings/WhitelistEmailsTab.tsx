"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WhitelistEmailsTab() {
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!newEmail) return;
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
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Whitelisted Emails</h2>
      <form onSubmit={addEmail} className="flex gap-2 mb-4">
        <input
          type="email"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          placeholder="Add email..."
          className="border rounded px-3 py-2 flex-1"
          required
        />
        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">Add</Button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : emails.length === 0 ? (
        <div className="text-gray-500">No whitelisted emails found.</div>
      ) : (
        <ul className="space-y-2">
          {emails.map(email => (
            <li key={email} className="flex justify-between items-center">
              <span>{email}</span>
              <Button variant="outline" size="sm" onClick={() => removeEmail(email)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
