import { useState } from "react";

export default function KhaltiPayment() {
  const [amount, setAmount] = useState("250"); // Default checkout amount in NPR
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentData, setPaymentData] = useState(null);

  // STAGING KEY PROVIDED FOR SANDBOX DEVELOPER PROTOTYPING ONLY
  const KHALTI_SECRET_KEY = "970239348bf345ec978bc60a38ed7969";

  const handlePaymentInitiate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPaymentData(null);

    // Convert to Paisa (1 NPR = 100 Paisa)
    const amountInPaisa = parseFloat(amount) * 100;
    const uniqueOrderId = "INV-" + Date.now();

    const payload = {
      return_url: "http://localhost:5173/payment-callback", // Local validation routing
      website_url: "http://localhost:5173",
      amount: amountInPaisa,
      purchase_order_id: uniqueOrderId,
      purchase_order_name: "React Dynamic QR Purchase",
      customer_info: {
        name: "React Tester",
        email: "tester@example.com",
        phone: "9800000001",
      },
    };

    try {
      // NOTE: For pure frontend testing without a backend, we route via a public CORS proxy.
      // In production, change this endpoint to your own server API route (e.g., /api/khalti/initiate)
      const response = await fetch("/api/khalti/epayment/initiate/", {
        method: "POST",
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.pidx) {
        setPaymentData(data);
        // Automatically redirect user to Khalti's Dynamic QR and payment page
        window.location.href = data.payment_url;
      } else {
        throw new Error(
          data.detail || "Failed to initialize payment framework session.",
        );
      }
    } catch (err) {
      setError(
        err.message || "Something went wrong while connecting to Khalti.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Khalti Dynamic QR Payment</h2>
      <p style={styles.subtitle}>
        Test environment payment checkout flow simulator
      </p>

      <form onSubmit={handlePaymentInitiate} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Amount to Pay (NPR)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="10"
            required
            disabled={loading}
            style={styles.input}
          />
        </div>

        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading
            ? "Generating Payment Session..."
            : `Pay Rs. ${amount} via Khalti`}
        </button>
      </form>

      {paymentData && (
        <div style={styles.successBox}>
          <p>
            <strong>Session Initialized!</strong>
          </p>
          <p>
            Transaction ID (pidx): <code>{paymentData.pidx}</code>
          </p>
          <p>
            If you weren't redirected automatically,{" "}
            <a href={paymentData.payment_url} target="_blank" rel="noreferrer">
              click here to scan QR
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}

// Basic CSS-in-JS style rules for easy standalone copy-pasting
const styles = {
  card: {
    maxWidth: "420px",
    margin: "40px auto",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    fontFamily: "system-ui, sans-serif",
  },
  title: {
    margin: "0 0 4px 0",
    color: "#5C2D91", // Khalti Brand Purple Color
    textAlign: "center",
  },
  subtitle: {
    margin: "0 0 20px 0",
    color: "#666",
    fontSize: "14px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "6px",
    color: "#333",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "12px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#5C2D91",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  errorBox: {
    padding: "10px",
    backgroundColor: "#FFEBEB",
    color: "#CC0000",
    borderRadius: "6px",
    fontSize: "14px",
  },
  successBox: {
    marginTop: "20px",
    padding: "12px",
    backgroundColor: "#E8F5E9",
    color: "#2E7D32",
    borderRadius: "6px",
    fontSize: "13px",
  },
};
