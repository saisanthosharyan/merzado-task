"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getMe,
  getRFQById,
  updateRFQ,
  type RFQ,
} from "@/lib/api";

export default function EditRFQPage() {
  const router = useRouter();
  const params = useParams();

  const id = typeof params.id === "string" ? params.id : "";

  const [rfq, setRfq] = useState<RFQ | null>(null);

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deadline, setDeadline] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRFQ = async () => {
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

        if (meResponse.data.role !== "BUYER") {
          router.replace("/supplier");
          return;
        }

        if (!id) {
          throw new Error("Invalid RFQ ID");
        }

        const response = await getRFQById(id, token);

        if (!response.success || !response.data) {
          throw new Error(response.message ?? "RFQ not found");
        }

        const data = response.data;

        setRfq(data);
        setProductName(data.productName);
        setDescription(data.description);
        setQuantity(String(data.quantity));
        setDeliveryLocation(data.deliveryLocation);

        const date = new Date(data.deadline);

        const localDateTime = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000,
        )
          .toISOString()
          .slice(0, 16);

        setDeadline(localDateTime);
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

    if (!productName.trim()) {
      setError("Product or service name is required.");
      return;
    }

    if (productName.trim().length < 2) {
      setError(
        "Product or service name must be at least 2 characters.",
      );
      return;
    }

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }

    const numericQuantity = Number(quantity);

    if (
      !quantity ||
      !Number.isInteger(numericQuantity) ||
      numericQuantity <= 0
    ) {
      setError("Quantity must be a whole number greater than 0.");
      return;
    }

    if (!deliveryLocation.trim()) {
      setError("Delivery location is required.");
      return;
    }

    if (!deadline) {
      setError("Deadline is required.");
      return;
    }

    const deadlineDate = new Date(deadline);

    if (Number.isNaN(deadlineDate.getTime())) {
      setError("Please enter a valid deadline.");
      return;
    }

    if (deadlineDate <= new Date()) {
      setError("Deadline must be in the future.");
      return;
    }

    if (!rfq || rfq.status !== "OPEN") {
      setError("This RFQ cannot be edited.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("rfq_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await updateRFQ(
        id,
        {
          productName: productName.trim(),
          description: description.trim(),
          quantity: numericQuantity,
          deliveryLocation: deliveryLocation.trim(),
          deadline: deadlineDate.toISOString(),
        },
        token,
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message ?? "Failed to update RFQ",
        );
      }

      router.push(`/buyer/rfqs/${id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update RFQ",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading RFQ...</p>
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
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push(`/buyer/rfqs/${id}`)}
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Back to RFQ
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("rfq_token");
              localStorage.removeItem("rfq_user");
              router.replace("/login");
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-8">
            <p className="text-sm text-gray-500">
              Buyer Dashboard
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Edit RFQ
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Update the requirements for your request for
              quotation.
            </p>
          </div>

          {rfq.status !== "OPEN" && (
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              This RFQ is {rfq.status.toLowerCase()} and cannot
              be edited.
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {rfq.status === "OPEN" && (
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  disabled={saving}
                  maxLength={200}
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  disabled={saving}
                  maxLength={5000}
                />
              </div>

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
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  disabled={saving}
                />
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  disabled={saving}
                  maxLength={300}
                />
              </div>

              <div>
                <label
                  htmlFor="deadline"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Deadline
                </label>

                <input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(event) =>
                    setDeadline(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  disabled={saving}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-black px-6 py-4 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(`/buyer/rfqs/${id}`)
                  }
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-6 py-4 font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
