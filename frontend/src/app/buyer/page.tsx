
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, getMyRFQs, RFQ, User } from "@/lib/api";

export default function BuyerPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [rfqLoading, setRfqLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("rfq_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    Promise.all([
      getMe(token),
      getMyRFQs(token),
    ])
      .then(([userResponse, rfqResponse]) => {
        if (!userResponse.data) {
          throw new Error("User information unavailable");
        }

        if (userResponse.data.role !== "BUYER") {
          router.replace("/supplier");
          return;
        }

        setUser(userResponse.data);
        setRfqs(rfqResponse.data ?? []);
      })
      .catch((error) => {
        localStorage.removeItem("rfq_token");
        localStorage.removeItem("rfq_user");
        router.replace("/login");

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard",
        );
      })
      .finally(() => {
        setLoading(false);
        setRfqLoading(false);
      });
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("rfq_token");
    localStorage.removeItem("rfq_user");
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading dashboard...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Merzado
            </h1>

            <p className="text-sm text-gray-500">
              Buyer Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome, {user.name} 👋
            </h2>

            <p className="mt-2 text-gray-600">
              Manage your requests and review supplier quotations.
            </p>
          </div>

          <button
            onClick={() => router.push("/buyer/rfqs/new")}
            className="rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
          >
            + Create RFQ
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total RFQs</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {rfqs.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Open RFQs</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {rfqs.filter((rfq) => rfq.status === "OPEN").length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Closed / Expired</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {
                rfqs.filter(
                  (rfq) =>
                    rfq.status === "CLOSED" ||
                    rfq.status === "EXPIRED",
                ).length
              }
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <h3 className="text-xl font-bold text-gray-900">
              My RFQs
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Requests you have created.
            </p>
          </div>

          {rfqLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading RFQs...
            </div>
          ) : rfqs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">
                You haven't created any RFQs yet.
              </p>

              <button
                onClick={() => router.push("/buyer/rfqs/new")}
                className="mt-4 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Create your first RFQ
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {rfqs.map((rfq) => (
                <div
                  key={rfq._id}
                  className="p-6 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {rfq.productName}
                        </h4>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            rfq.status === "OPEN"
                              ? "bg-green-100 text-green-700"
                              : rfq.status === "CLOSED"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {rfq.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-600">
                        {rfq.description}
                      </p>

                      <div className="mt-4 grid gap-2 text-sm text-gray-500 sm:grid-cols-3">
                        <p>
                          <span className="font-medium text-gray-700">
                            Quantity:
                          </span>{" "}
                          {rfq.quantity}
                        </p>

                        <p>
                          <span className="font-medium text-gray-700">
                            Location:
                          </span>{" "}
                          {rfq.deliveryLocation}
                        </p>

                        <p>
                          <span className="font-medium text-gray-700">
                            Deadline:
                          </span>{" "}
                          {new Date(
                            rfq.deadline,
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        router.push(`/buyer/rfqs/${rfq._id}`)
                      }
                      className="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
