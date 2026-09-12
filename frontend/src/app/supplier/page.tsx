"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, getRFQs, type RFQ } from "@/lib/api";

export default function SupplierPage() {
  const router = useRouter();

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRFQs = async () => {
    if (loading && rfqs.length > 0) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("rfq_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const meResponse = await getMe(token);

      if (!meResponse.success || !meResponse.data) {
        localStorage.removeItem("rfq_token");
        localStorage.removeItem("rfq_user");
        router.replace("/login");
        return;
      }

      if (meResponse.data.role !== "SUPPLIER") {
        router.replace("/buyer");
        return;
      }

      const response = await getRFQs(token, {
        search: search.trim(),
        location: location.trim(),
        status,
      });

      if (!response.success) {
        throw new Error(
          response.message ?? "Failed to load RFQs",
        );
      }

      setRfqs(response.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load RFQs",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRFQs();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("rfq_token");
    localStorage.removeItem("rfq_user");
    router.replace("/login");
  };

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    loadRFQs();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Supplier Dashboard
            </h1>

            <p className="text-sm text-gray-500">
              Find RFQs and submit competitive quotations
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <section className="mb-8 rounded-xl border bg-white p-4 shadow-sm sm:p-5">
          <form
            onSubmit={handleSearch}
            className="grid gap-4 md:grid-cols-4"
          >
            <div className="md:col-span-2">
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Search
              </label>

              <input
                id="search"
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search product or requirement..."
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Location
              </label>

              <input
                id="location"
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                placeholder="e.g. Hyderabad"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black disabled:bg-gray-100"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {loading ? "Searching..." : "Search RFQs"}
              </button>
            </div>
          </form>
        </section>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Available RFQs
            </h2>

            <p className="text-sm text-gray-500">
              {rfqs.length} RFQ{rfqs.length === 1 ? "" : "s"} found
            </p>
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border bg-white p-10 text-center">
            <p className="text-gray-500">
              Loading RFQs...
            </p>
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-6"
          >
            <p className="font-medium text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={loadRFQs}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && rfqs.length === 0 && (
          <div className="rounded-xl border bg-white p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              No RFQs found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Try changing your search or filter criteria.
            </p>
          </div>
        )}

        {!loading && !error && rfqs.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rfqs.map((rfq) => (
              <article
                key={rfq._id}
                className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {rfq.productName}
                  </h3>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
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

                <p className="mb-5 line-clamp-3 text-sm leading-6 text-gray-600">
                  {rfq.description}
                </p>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-900">
                      Quantity:
                    </span>{" "}
                    {rfq.quantity}
                  </p>

                  <p>
                    <span className="font-medium text-gray-900">
                      Location:
                    </span>{" "}
                    {rfq.deliveryLocation}
                  </p>

                  <p>
                    <span className="font-medium text-gray-900">
                      Deadline:
                    </span>{" "}
                    {new Date(
                      rfq.deadline,
                    ).toLocaleString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/supplier/rfqs/${rfq._id}`,
                    )
                  }
                  className="mt-6 w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800"
                >
                  View RFQ
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}