"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRFQById, RFQ } from "@/lib/api";

export default function RFQDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("rfq_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const rfqId = params.id;

    if (typeof rfqId !== "string") {
      setError("Invalid RFQ ID");
      setLoading(false);
      return;
    }

    getRFQById(rfqId, token)
      .then((response) => {
        if (!response.data) {
          throw new Error("RFQ not found");
        }

        setRfq(response.data);
      })
      .catch((error) => {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load RFQ",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading RFQ...</p>
      </main>
    );
  }

  if (error || !rfq) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Unable to load RFQ
          </h1>

          <p className="mt-2 text-red-600">
            {error || "RFQ not found"}
          </p>

          <button
            onClick={() => router.push("/buyer")}
            className="mt-6 rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => router.push("/buyer")}
          className="mb-6 text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Back to Dashboard
        </button>

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {rfq.productName}
                </h1>

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

              <p className="mt-2 text-sm text-gray-500">
                Created{" "}
                {new Date(rfq.createdAt).toLocaleString()}
              </p>
            </div>

            {rfq.status === "OPEN" && (
              <button
                onClick={() =>
                  router.push(`/buyer/rfqs/${rfq._id}/edit`)
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Edit RFQ
              </button>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Requirement
            </h2>

            <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-600">
              {rfq.description}
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Quantity</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {rfq.quantity}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Delivery Location
              </p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {rfq.deliveryLocation}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Deadline</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {new Date(rfq.deadline).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Supplier Quotations
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Quotations received for this RFQ will appear here.
            </p>

            <button
              onClick={() =>
                router.push(`/buyer/rfqs/${rfq._id}/quotations`)
              }
              className="mt-4 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              View Quotations
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
