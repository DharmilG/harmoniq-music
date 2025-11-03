import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";


export default function OrderHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrders, setExpandedOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:4000/api/orders", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load order history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const isExpanded = (orderId) => expandedOrders.includes(orderId);

  if (loading) {
    return (
      <section>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            textAlign: "center",
            padding: "var(--space-xl)",
          }}
        >
          <div className="spinner" style={{ margin: "0 auto" }}></div>
          <p className="muted" style={{ marginTop: "var(--space-md)" }}>
            Loading your orders...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-xl)",
          }}
        >
          <div>
            <h2>Order History</h2>
            <p className="small muted">
              View all your past orders and purchases
            </p>
          </div>
          <button className="btn" onClick={() => navigate("/account")}>
            Back to Account
          </button>
        </div>

        {error && <div className="alert error">{error}</div>}

        {orders.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: "center", padding: "var(--space-xl)" }}
          >
            <h3>No Orders Yet</h3>
            <p className="muted">You haven't placed any orders yet.</p>
            <div
              className="actions"
              style={{ justifyContent: "center", marginTop: "var(--space-lg)" }}
            >
              <button
                className="btn primary"
                onClick={() => navigate("/store")}
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-md)",
            }}
          >
            {orders.map((order) => {
              const orderId = order.order_id;
              const expanded = isExpanded(orderId);
              return (
                <div
                  key={orderId}
                  className="card"
                  style={{ padding: "var(--space-lg)" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "var(--space-md)",
                    }}
                  >
                    <div>
                      <h3 style={{ marginBottom: "var(--space-xs)" }}>
                        Order #{order.order_id}
                      </h3>
                      <p className="small muted">
                        {formatDate(order.order_date || order.created_at)}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "bold",
                          color: "var(--success)",
                        }}
                      >
                        {" "}
                        {/* <-- 1. PRICE COLOR CHANGED */}$
                        {parseFloat(order.total_amount).toFixed(2)}
                      </div>
                      <span
                        className="badge"
                        style={{
                          marginTop: "var(--space-xs)",
                          background:
                            "rgba(var(--success-rgb, 5, 150, 105), 0.15)" /* Fallback if CSS vars not set */,
                          color: "var(--success)",
                          border:
                            "1px solid rgba(var(--success-rgb, 5, 150, 105), 0.3)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                          boxShadow:
                            "0 4px 12px rgba(var(--success-rgb, 5, 150, 105), 0.15), 0 0 0 1px rgba(var(--success-rgb, 5, 150, 105), 0.1) inset",
                          fontWeight: "600",
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                          fontSize: "0.65rem",
                          padding: "var(--space-xs) var(--space-sm)",
                          borderRadius: "999px",
                          transition: "all var(--transition-normal)",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform =
                            "translateY(-1px) scale(1.03)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 16px rgba(var(--success-rgb, 5, 150, 105), 0.25), 0 0 0 1px rgba(var(--success-rgb, 5, 150, 105), 0.2) inset, 0 0 20px rgba(var(--success-rgb, 5, 150, 105), 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform =
                            "translateY(0) scale(1)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(var(--success-rgb, 5, 150, 105), 0.15), 0 0 0 1px rgba(var(--success-rgb, 5, 150, 105), 0.1) inset";
                        }}
                      >
                        <span
                          style={{
                            position: "relative",
                            zIndex: 2,
                          }}
                        >
                          {order.status || "Confirmed"}
                        </span>
                        <span
                          style={{
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: "-100%",
                            width: "100%",
                            height: "100%",
                            background:
                              "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                            transition: "left var(--transition-normal)",
                            pointerEvents: "none",
                          }}
                          className="shine"
                        ></span>
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid var(--surface-elevated)",
                      paddingTop: "var(--space-md)",
                      marginBottom: "var(--space-md)",
                    }}
                  >
                    <div style={{ marginBottom: "var(--space-sm)" }}>
                      <strong className="small">Customer:</strong>
                      <span
                        className="small muted"
                        style={{ marginLeft: "var(--space-xs)" }}
                      >
                        {order.full_name}
                      </span>
                    </div>
                    <div>
                      <strong className="small">Items:</strong>
                      <span
                        className="small muted"
                        style={{ marginLeft: "var(--space-xs)" }}
                      >
                        {order.items?.length || 0} item(s)
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn"
                    onClick={() => toggleOrder(orderId)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-xs)",
                      marginLeft: "auto",
                      transition: "var(--transition-normal)",
                    }}
                  >
                    {expanded ? "Hide Details" : "View Details"}
                    <span
                      style={{
                        fontSize: "0.8rem",
                        transition: "transform var(--transition-normal)",
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {expanded && (
                    <div
                      style={{
                        marginTop: "var(--space-lg)",
                        paddingTop: "var(--space-lg)",
                        borderTop: "1px solid var(--surface-elevated)",
                        animation: "fadeInUp var(--transition-normal) ease-out",
                      }}
                    >
                      {/* Order Summary */}
                      <div style={{ marginBottom: "var(--space-lg)" }}>
                        <h4 style={{ marginBottom: "var(--space-sm)" }}>
                          Order Information
                        </h4>
                        <div
                          style={{
                            background: "rgba(255, 255, 255, 0.02)",
                            padding: "var(--space-md)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "120px 1fr",
                              gap: "var(--space-sm)",
                              marginBottom: "var(--space-sm)",
                            }}
                          >
                            <span className="small muted">Order ID:</span>
                            <span className="small">
                              <strong>#{order.order_id}</strong>
                            </span>
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "120px 1fr",
                              gap: "var(--space-sm)",
                              marginBottom: "var(--space-sm)",
                            }}
                          >
                            <span className="small muted">Date:</span>
                            <span className="small">
                              {formatDate(order.order_date || order.created_at)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "120px 1fr",
                              gap: "var(--space-sm)",
                              marginBottom: "var(--space-sm)",
                            }}
                          >
                            <span className="small muted">Status:</span>
                            <span
                              className="badge"
                              style={{
                                marginTop: "var(--space-xs)",
                                background:
                                  "rgba(var(--success-rgb, 5, 150, 105), 0.15)" /* Fallback if CSS vars not set */,
                                color: "var(--success)",
                                border:
                                  "1px solid rgba(var(--success-rgb, 5, 150, 105), 0.3)",
                                backdropFilter: "blur(10px)",
                                WebkitBackdropFilter: "blur(10px)",
                                boxShadow:
                                  "0 4px 12px rgba(var(--success-rgb, 5, 150, 105), 0.15), 0 0 0 1px rgba(var(--success-rgb, 5, 150, 105), 0.1) inset",
                                fontWeight: "600",
                                letterSpacing: "0.5px",
                                textTransform: "uppercase",
                                fontSize: "0.65rem",
                                padding: "var(--space-xs) var(--space-sm)",
                                borderRadius: "999px",
                                transition: "all var(--transition-normal)",
                                position: "relative",
                                overflow: "hidden",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(-1px) scale(1.03)";
                                e.currentTarget.style.boxShadow =
                                  "0 6px 16px rgba(var(--success-rgb, 5, 150, 105), 0.25), 0 0 0 1px rgba(var(--success-rgb, 5, 150, 105), 0.2) inset, 0 0 20px rgba(var(--success-rgb, 5, 150, 105), 0.15)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(0) scale(1)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 12px rgba(var(--success-rgb, 5, 150, 105), 0.15), 0 0 0 1px rgba(var(--success-rgb, 5, 150, 105), 0.1) inset";
                              }}
                            >
                              <span
                                style={{
                                  position: "relative",
                                  zIndex: 2,
                                }}
                              >
                                {order.status || "Confirmed"}
                              </span>
                              <span
                                style={{
                                  content: '""',
                                  position: "absolute",
                                  top: 0,
                                  left: "-100%",
                                  width: "100%",
                                  height: "100%",
                                  background:
                                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                                  transition: "left var(--transition-normal)",
                                  pointerEvents: "none",
                                }}
                                className="shine"
                              ></span>
                            </span>
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "120px 1fr",
                              gap: "var(--space-sm)",
                            }}
                          >
                            <span className="small muted">Total:</span>
                            <span
                              className="small"
                              style={{
                                fontWeight: "bold",
                                color: "var(--success)",
                              }}
                            >
                              {" "}
                              {/* <-- 4. PRICE COLOR CHANGED */}$
                              {parseFloat(order.total_amount).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div style={{ marginBottom: "var(--space-lg)" }}>
                        <h4 style={{ marginBottom: "var(--space-sm)" }}>
                          Customer Details
                        </h4>
                        <div
                          style={{
                            background: "rgba(255, 255, 255, 0.02)",
                            padding: "var(--space-md)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          <div style={{ marginBottom: "var(--space-xs)" }}>
                            <span className="small">
                              <strong>{order.full_name}</strong>
                            </span>
                          </div>
                          <div style={{ marginBottom: "var(--space-xs)" }}>
                            <span className="small muted">{order.email}</span>
                          </div>
                          {order.phone && (
                            <div>
                              <span className="small muted">{order.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div style={{ marginBottom: "var(--space-lg)" }}>
                        <h4 style={{ marginBottom: "var(--space-sm)" }}>
                          Shipping Address
                        </h4>
                        <div
                          style={{
                            background: "rgba(255, 255, 255, 0.02)",
                            padding: "var(--space-md)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          <div className="small" style={{ lineHeight: 1.6 }}>
                            <div>{order.address_line1}</div>
                            {order.address_line2 && (
                              <div>{order.address_line2}</div>
                            )}
                            <div>
                              {order.city}, {order.state} {order.zip_code}
                            </div>
                            <div>{order.country}</div>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div style={{ marginBottom: "var(--space-lg)" }}>
                        <h4 style={{ marginBottom: "var(--space-sm)" }}>
                          Items Ordered
                        </h4>
                        <div
                          style={{
                            background: "rgba(255, 255, 255, 0.02)",
                            padding: "var(--space-md)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          {order.items?.map((item, index) => (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "var(--space-sm) 0",
                                borderBottom:
                                  index < order.items.length - 1
                                    ? "1px solid rgba(255, 255, 255, 0.05)"
                                    : "none",
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div className="small">
                                  <strong>{item.name}</strong>
                                </div>
                                <div className="small muted">
                                  Quantity: {item.qty || item.quantity}
                                </div>
                              </div>
                              <div
                                className="small"
                                style={{ fontWeight: "bold" }}
                              >
                                $
                                {(
                                  parseFloat(item.price) *
                                  (item.qty || item.quantity)
                                ).toFixed(2)}
                              </div>
                            </div>
                          ))}

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "var(--space-md) 0 0 0",
                              marginTop: "var(--space-sm)",
                              borderTop: "2px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <span style={{ fontWeight: "bold" }}>Total</span>
                            <span
                              style={{
                                fontSize: "1.25rem",
                                fontWeight: "bold",
                                color: "var(--success)",
                              }}
                            >
                              {" "}
                              {/* <-- 5. PRICE COLOR CHANGED */}$
                              {parseFloat(order.total_amount).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
