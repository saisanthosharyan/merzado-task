const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Something went wrong");
  }

  return data;
}

export type UserRole = "BUYER" | "SUPPLIER";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthData = {
  token: string;
  user: User;
};

export type SignupData = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type LoginData = {
  email: string;
  password: string;
};

export async function signup(
  data: SignupData,
): Promise<ApiResponse<AuthData>> {
  return request<AuthData>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(
  data: LoginData,
): Promise<ApiResponse<AuthData>> {
  return request<AuthData>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMe(
  token: string,
): Promise<ApiResponse<User>> {
  return request<User>("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
export type RFQ = {
  _id: string;
  buyerId: string;
  productName: string;
  description: string;
  quantity: number;
  deliveryLocation: string;
  deadline: string;
  status: "OPEN" | "CLOSED" | "EXPIRED";
  createdAt: string;
  updatedAt: string;
};

export type CreateRFQData = {
  productName: string;
  description: string;
  quantity: number;
  deliveryLocation: string;
  deadline: string;
};

export async function createRFQ(
  data: CreateRFQData,
  token: string,
): Promise<ApiResponse<RFQ>> {
  return request<RFQ>("/api/rfqs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function getMyRFQs(
  token: string,
): Promise<ApiResponse<RFQ[]>> {
  return request<RFQ[]>("/api/rfqs/my", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
export async function getRFQById(
  id: string,
  token: string,
): Promise<ApiResponse<RFQ>> {
  return request<RFQ>(`/api/rfqs/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}