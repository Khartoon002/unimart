const BASE = "https://api.paystack.co";

async function paystackFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const json = await res.json();
  if (!json.status) throw new Error(json.message ?? "Paystack error");
  return json.data as T;
}

export async function initializeTransaction(params: {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, unknown>;
  callback_url?: string;
}) {
  return paystackFetch<{ authorization_url: string; access_code: string; reference: string }>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        ...params,
        amount: Math.round(params.amount * 100),
      }),
    }
  );
}

export async function verifyTransaction(reference: string) {
  return paystackFetch<{
    status: string;
    amount: number;
    reference: string;
    metadata: Record<string, unknown>;
  }>(`/transaction/verify/${reference}`);
}

export async function resolveAccountNumber(params: {
  account_number: string;
  bank_code: string;
}) {
  return paystackFetch<{ account_name: string; account_number: string }>(
    `/bank/resolve?account_number=${params.account_number}&bank_code=${params.bank_code}`
  );
}

export async function createTransferRecipient(params: {
  type: "nuban";
  name: string;
  account_number: string;
  bank_code: string;
  currency: "NGN";
}) {
  return paystackFetch<{ recipient_code: string; id: number }>(
    "/transferrecipient",
    { method: "POST", body: JSON.stringify(params) }
  );
}

export async function initiateTransfer(params: {
  source: "balance";
  amount: number;
  recipient: string;
  reason: string;
}) {
  return paystackFetch<{ transfer_code: string; status: string }>(
    "/transfer",
    {
      method: "POST",
      body: JSON.stringify({
        ...params,
        amount: Math.round(params.amount * 100),
      }),
    }
  );
}
