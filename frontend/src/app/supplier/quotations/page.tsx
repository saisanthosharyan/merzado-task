"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getMe,
  getMyQuotations,
  type Quotation,
  type User,
} from "@/lib/api";

export default function SupplierQuotationsPage() {
  const router = useRouter();

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadQuotations = async () => {
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

        setUser(meResponse.data);

        const response = await getMyQuotations(token);

        if (!response.success || !response.data) {
          throw new Error(
            response.message ?? "Failed to load quotations",
          );
        }

        setQuotations(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load quotations",
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuotations();
  }, [router]);

  const logout = () => {
    localStorage.removeItem("rfq_token");
    localStorage.removeItem("rfq_user");
    router.replace("/login");
  };

  const getRFQDetails = (quotation: Quotation) => {
    if (typeof quotation.rfqId === "string") {
      return null;
    }

    return quotation.rfqId;
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-500">Loading quotations...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              My Quotations
            </h1>

            {user && (
              <p className="text-sm text-gray-500">
                {user.name}
              </p>
            )}
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={() => router.push("/supplier")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:w-auto"
            >
              Browse RFQs
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 sm:w-auto"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Submitted Quotations
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Track the quotations you have submitted to buyers.
          </p>
        </div>

        {quotations.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center shadow-sm sm:p-10">
            <h3 className="text-lg font-semibold text-gray-900">
              No quotations yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Browse available RFQs and submit your first quotation.
            </p>

            <button
              type="button"
              onClick={() => router.push("/supplier")}
              className="mt-5 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              Browse RFQs
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {quotations.map((quotation) => {
              const rfq = getRFQDetails(quotation);

              return (
                <div
                  key={quotation._id}
                  className="rounded-xl border bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Quotation
                      </p>

                      <h3 className="mt-1 text-xl font-bold text-gray-900">
                        {rfq?.productName ?? "RFQ"}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">
                        Quoted Price
                      </p>

                      <p className="mt-1 text-lg font-bold text-gray-900">
                        ₹
                        {quotation.quotedPrice.toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">
                        Estimated Delivery
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {quotation.estimatedDeliveryTime}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">
                        Submitted
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {new Date(
                          quotation.createdAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-medium text-gray-700">
                      Message / Notes
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                      {quotation.message?.trim() ||
                        "No message provided."}
                    </p>
                  </div>

                  {rfq && (
                    <div className="mt-5 border-t pt-5">
                      <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
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
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/supplier/rfqs/${rfq._id}`,
                          )
                        }
                        className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:w-auto"
                      >
                        View RFQ
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}