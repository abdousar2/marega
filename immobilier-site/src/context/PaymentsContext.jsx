import { createContext, useEffect, useState } from "react";

export const PaymentsContext = createContext();

export default function PaymentsProvider({ children }) {
  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem("marega-payments");

    return saved
      ? JSON.parse(saved)
      : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "marega-payments",
      JSON.stringify(payments)
    );
  }, [payments]);

  return (
    <PaymentsContext.Provider
      value={{
        payments,
        setPayments,
      }}
    >
      {children}
    </PaymentsContext.Provider>
  );
}