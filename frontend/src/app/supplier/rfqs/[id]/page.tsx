"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getMe,
  getRFQById,
  type RFQ,
} from "@/lib/api";

export default function SupplierRFQDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const id =
    typeof params.id === "string" ? params.id : "";

  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRFQ = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          throw new Error("Invalid RFQ ID");
        }

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

        const response = await getRFQById(id, token);

        if (!response.success || !response.data) {
          throw new Error(
            response.message ?? "RFQ not found",
          );
        }

        setRfq(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load RFQ",
        );
      } finally {
        setLoading(false);
      }
    };

    loadRFQ();
  }, [id, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-500">Loading RFQ...</p>
      </main>
    );
  }

  if (error || !rfq) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-10">
        <div
          role="alert"
          className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6"
        >
          <h1 className="text-lg font-semibold text-red-700">
            Unable to load RFQ
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error || "RFQ not found"}
          </p>

          <button
            type="button"
            onClick={() => router.push("/supplier")}
            className="mt-5 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Back to RFQs
          </button>
        </div>
      </main>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("rfq_token");
    localStorage.removeItem("rfq_user");
    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={() => router.push("/supplier")}
            className="text-left text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Back to RFQs
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:w-auto"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-xl border bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Request for Quotation
              </p>

              <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                {rfq.productName}
              </h1>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
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

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Requirement
            </h2>

            <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-600">
              {rfq.description}
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Quantity
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {rfq.quantity}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Delivery Location
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {rfq.deliveryLocation}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Deadline
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {new Date(
                  rfq.deadline,
                ).toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Created
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {new Date(
                  rfq.createdAt,
                ).toLocaleString()}
              </p>
            </div>
          </div>

          {rfq.status === "OPEN" && (
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/supplier/rfqs/${rfq._id}/quote`,
                )
              }
              className="mt-8 w-full rounded-lg bg-black px-6 py-4 font-semibold text-white hover:bg-gray-800"
            >
              Submit Quotation
            </button>
          )}

          {rfq.status !== "OPEN" && (
            <div className="mt-8 rounded-lg bg-gray-100 p-4 text-center text-sm text-gray-600">
              This RFQ is no longer accepting quotations.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
