"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  createQuotation,
  getMe,
  getRFQById,
  type RFQ,
} from "@/lib/api";

export default function SubmitQuotationPage() {
  const router = useRouter();
  const params = useParams();

  const id =
    typeof params.id === "string" ? params.id : "";

  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [quotedPrice, setQuotedPrice] = useState("");
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] =
    useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

        if (response.data.status !== "OPEN") {
          setError(
            "This RFQ is no longer accepting quotations.",
          );
        }
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

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError("");

    if (!id) {
      setError("Invalid RFQ ID.");
      return;
    }

    const price = Number(quotedPrice);

    if (
      !quotedPrice.trim() ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setError("Please enter a valid quoted price.");
      return;
    }

    if (!estimatedDeliveryTime.trim()) {
      setError(
        "Please enter the estimated delivery time.",
      );
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("rfq_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await createQuotation(
        {
          rfqId: id,
          quotedPrice: price,
          estimatedDeliveryTime:
            estimatedDeliveryTime.trim(),
          ...(message.trim()
            ? { message: message.trim() }
            : {}),
        },
        token,
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message ??
            "Failed to submit quotation",
        );
      }

      router.push("/supplier/quotations");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit quotation",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("rfq_token");
    localStorage.removeItem("rfq_user");
    router.replace("/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-500">
          Loading RFQ...
        </p>
      </main>
    );
  }

  if (!rfq) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            RFQ not found
          </h1>

          <button
            type="button"
            onClick={() => router.push("/supplier")}
            className="mt-4 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Back to RFQs
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={() =>
              router.push(`/supplier/rfqs/${id}`)
            }
            disabled={submitting}
            className="text-left text-sm font-medium text-gray-600 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Back to RFQ
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={submitting}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-xl border bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-8">
            <p className="text-sm text-gray-500">
              Submit quotation for
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              {rfq.productName}
            </h1>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  Quantity
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {rfq.quantity}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  Location
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {rfq.deliveryLocation}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  Deadline
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {new Date(
                    rfq.deadline,
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {rfq.status === "OPEN" && (
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="quotedPrice"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Quoted Price
                </label>

                <input
                  id="quotedPrice"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quotedPrice}
                  onChange={(event) =>
                    setQuotedPrice(
                      event.target.value,
                    )
                  }
                  placeholder="Enter your total quoted price"
                  disabled={submitting}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="estimatedDeliveryTime"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Estimated Delivery Time
                </label>

                <input
                  id="estimatedDeliveryTime"
                  type="text"
                  value={estimatedDeliveryTime}
                  onChange={(event) =>
                    setEstimatedDeliveryTime(
                      event.target.value,
                    )
                  }
                  placeholder="Example: 10 business days"
                  disabled={submitting}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Message / Notes
                  <span className="ml-1 font-normal text-gray-500">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="message"
                  rows={5}
                  maxLength={2000}
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  placeholder="Add any important details about your quotation..."
                  disabled={submitting}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black disabled:bg-gray-100"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {message.length}/2000
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-black px-6 py-4 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Quotation"}
              </button>
            </form>
          )}

          {rfq.status !== "OPEN" && (
            <div className="rounded-lg bg-gray-100 p-5 text-center text-sm text-gray-600">
              This RFQ is no longer accepting
              quotations.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
