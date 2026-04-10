"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { SupportTicket } from "@/types";
import { Button, Badge, EmptyState } from "@/components/ui";
import { formatDate } from "@/utils/helpers";
import Footer from "@/components/Footer";

export default function SupportPage() {
  const { get, post } = useApi();
  const { isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchTickets = async () => {
      try {
        const response = await get("/support/tickets", { showToast: false });
        setTickets(response?.data || []);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isAuthenticated]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTicket = await post("/support/tickets", formData);
      setTickets((prev) => [newTicket, ...prev]);
      setFormData({ title: "", description: "", category: "general" });
      setShowForm(false);
    } catch (err) {
      console.error("Failed to create ticket:", err);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Please sign in
          </h1>
          <a
            href="/auth/login"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Go to login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <Button
            variant="primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Create Ticket"}
          </Button>
        </div>

        {/* Create Ticket Form */}
        {showForm && (
          <div className="bg-white rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Create Support Ticket
            </h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="order">Order Issue</option>
                  <option value="payment">Payment Issue</option>
                  <option value="product">Product Issue</option>
                  <option value="delivery">Delivery Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button variant="primary" type="submit">
                Submit Ticket
              </Button>
            </form>
          </div>
        )}

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <EmptyState
            icon="📞"
            title="No support tickets"
            description="You haven't created any tickets yet"
          />
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="bg-white rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {ticket.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ticket #{ticket._id.slice(-6)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        ticket.status === "resolved"
                          ? "success"
                          : ticket.status === "closed"
                          ? "danger"
                          : "primary"
                      }
                    >
                      {ticket.status}
                    </Badge>
                    <Badge
                      variant={
                        ticket.priority === "high"
                          ? "danger"
                          : ticket.priority === "medium"
                          ? "warning"
                          : "default"
                      }
                    >
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{ticket.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Category: {ticket.category}</span>
                  <span>Created: {formatDate(ticket.createdAt)}</span>
                </div>

                <button className="mt-4 text-blue-600 hover:text-blue-700 font-semibold">
                  View Details →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
