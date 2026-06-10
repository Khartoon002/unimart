import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "UniMart <no-reply@unimart.app>";

export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Welcome to UniMart, ${name}!`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h1 style="color:#6C63FF">Welcome to UniMart, ${name}! 🎉</h1>
        <p>You've joined the largest student-to-student marketplace on campus.</p>
        <p>Here's what you can do:</p>
        <ul>
          <li>Browse thousands of products from fellow students</li>
          <li>Sell your own items easily</li>
          <li>Order fresh food from campus kitchens</li>
          <li>All payments are escrow-protected</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/marketplace"
           style="display:inline-block;padding:12px 24px;background:#6C63FF;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Start Shopping
        </a>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  order: { id: string; total: number; items: { title: string; qty: number }[] }
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Order ${order.id} confirmed — UniMart`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#6C63FF">Your order is confirmed!</h2>
        <p>Order <strong>${order.id}</strong> has been received and payment is secured in escrow.</p>
        <ul>
          ${order.items.map((i) => `<li>${i.title} × ${i.qty}</li>`).join("")}
        </ul>
        <p><strong>Total: ₦${order.total.toLocaleString("en-NG")}</strong></p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}"
           style="display:inline-block;padding:12px 24px;background:#6C63FF;color:#fff;border-radius:8px;text-decoration:none">
          Track Order
        </a>
      </div>
    `,
  });
}

export async function sendOrderShippedEmail(to: string, orderId: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Your UniMart order is on the way!",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#22C55E">Your order is on the way! 🚚</h2>
        <p>The merchant has dispatched your order and it's headed to you.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}"
           style="display:inline-block;padding:12px 24px;background:#6C63FF;color:#fff;border-radius:8px;text-decoration:none">
          Track Order
        </a>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, otp: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Your UniMart password reset code",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#6C63FF">Password Reset</h2>
        <p>Use the code below to reset your password. It expires in 15 minutes.</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#F4C430;margin:24px 0">${otp}</div>
        <p style="color:#9090A8;font-size:13px">If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}
