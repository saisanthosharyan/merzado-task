"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createRFQ } from "@/lib/api";

export default function NewRFQPage() {
  const router = useRouter();

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deadline, setDeadline] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const token = localStorage.getItem("rfq_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (Number(quantity) <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    if (!deadline) {
      setError("Please select a deadline");
      return;
    }

    const selectedDeadline = new Date(deadline);

    if (selectedDeadline <= new Date()) {
      setError("Deadline must be in the future");
      return;
    }

    setLoading(true);

    try {
      await createRFQ(
        {
          productName,
          description,
          quantity: Number(quantity),
          deliveryLocation,
          deadline: selectedDeadline.toISOString(),
        },
        token,
      );

      router.push("/buyer");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create RFQ",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.push("/buyer")}
          className="mb-6 text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Back to Dashboard
        </button>

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Create RFQ
            </h1>

            <p className="mt-2 text-gray-600">
              Tell suppliers what you need and receive competitive
              quotations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="productName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Product / Service Name
              </label>

              <input
                id="productName"
                type="text"
                value={productName}
                onChange={(event) =>
                  setProductName(event.target.value)
                }
                placeholder="e.g. Office Chairs"
                required
                minLength={2}
                maxLength={200}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Requirement Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe your requirements in detail..."
                required
                minLength={10}
                maxLength={5000}
                rows={6}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="quantity"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Quantity
                </label>

                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                  placeholder="e.g. 50"
                  required
                  min="1"
                  step="1"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black"
                />
              </div>

              <div>
                <label
                  htmlFor="deadline"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Submission Deadline
                </label>

                <input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(event) =>
                    setDeadline(event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="deliveryLocation"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Delivery Location
              </label>

              <input
                id="deliveryLocation"
                type="text"
                value={deliveryLocation}
                onChange={(event) =>
                  setDeliveryLocation(event.target.value)
                }
                placeholder="e.g. Hyderabad, Telangana"
                required
                minLength={2}
                maxLength={300}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/buyer")}
                className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating RFQ..." : "Create RFQ"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
