"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getMe,
  getRFQById,
  getRFQQuotations,
  type RFQ,
  type Quotation,
  type User,
} from "@/lib/api";

export default function BuyerQuotationsPage() {
  const router = useRouter();
  const params = useParams();

  const id = typeof params.id === "string" ? params.id : "";

  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("rfq_token");

        if (!token) {
          router.replace("/login");
          return;
        }

        if (!id) {
          throw new Error("Invalid RFQ ID");
        }

        const meResponse = await getMe(token);

        if (!meResponse.success || !meResponse.data) {
          localStorage.removeItem("rfq_token");
          localStorage.removeItem("rfq_user");
          router.replace("/login");
          return;
        }

        if (meResponse.data.role !== "BUYER") {
          router.replace("/supplier");
          return;
        }

        setUser(meResponse.data);

        const [rfqResponse, quotationResponse] =
          await Promise.all([
            getRFQById(id, token),
            getRFQQuotations(id, token),
          ]);

        if (!rfqResponse.success || !rfqResponse.data) {
          throw new Error(
            rfqResponse.message ?? "RFQ not found",
          );
        }

        if (
          !quotationResponse.success ||
          !quotationResponse.data
        ) {
          throw new Error(
            quotationResponse.message ??
              "Failed to load quotations",
          );
        }

        setRfq(rfqResponse.data);
        setQuotations(quotationResponse.data);
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

    loadData();
  }, [id, router]);

  const logout = () => {
    localStorage.removeItem("rfq_token");
    localStorage.removeItem("rfq_user");
    router.replace("/login");
  };

  const getSupplier = (quotation: Quotation) => {
    if (typeof quotation.supplierId === "string") {
      return null;
    }

    return quotation.supplierId;
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading quotations...
        </p>
      </main>
    );
  }

  if (!rfq) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            RFQ not found
          </h1>

          <button
            onClick={() => router.push("/buyer")}
            className="mt-4 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Buyer Dashboard
            </h1>

            {user && (
              <p className="text-sm text-gray-500">
                {user.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={() =>
                router.push(`/buyer/rfqs/${id}`)
              }
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Back to RFQ
            </button>

            <button
              onClick={logout}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Quotations for
          </p>

          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            {rfq.productName}
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
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
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {quotations.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              No quotations yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Suppliers have not submitted any quotations for
              this RFQ yet.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-5">
              <h3 className="text-xl font-bold text-gray-900">
                Supplier Quotations
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {quotations.length} quotation
                {quotations.length !== 1 ? "s" : ""} received
              </p>
            </div>

            <div className="space-y-5">
              {quotations.map((quotation) => {
                const supplier = getSupplier(quotation);

                return (
                  <div
                    key={quotation._id}
                    className="rounded-xl border bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          Supplier
                        </p>

                        <h4 className="mt-1 text-xl font-bold text-gray-900">
                          {supplier?.name ?? "Supplier"}
                        </h4>

                        {supplier?.email && (
                          <p className="mt-1 text-sm text-gray-500">
                            {supplier.email}
                          </p>
                        )}
                      </div>

                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">
                          Quoted Price
                        </p>

                        <p className="mt-1 text-xl font-bold text-gray-900">
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
                          {
                            quotation.estimatedDeliveryTime
                          }
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

                    <div className="mt-5 border-t pt-5">
                      <p className="text-sm font-medium text-gray-700">
                        Message / Notes
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                        {quotation.message?.trim() ||
                          "No message provided."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
