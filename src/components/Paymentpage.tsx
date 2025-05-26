// src/pages/PaymentPage.tsx

import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const paymentOptions = [
  { id: "gpay", name: "Google Pay", logo: "/images/gpay.png" },
  { id: "paytm", name: "Paytm", logo: "/images/paytm.png" },
  { id: "phonepe", name: "PhonePe", logo: "/images/phonepe.png" },
  { id: "netbanking", name: "Net Banking", logo: "/images/netbanking.png" },
];

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { planName, price } = location.state || {};
  const [selectedOption, setSelectedOption] = useState("gpay");

  const handlePayment = () => {
    alert(`Payment successful with ${selectedOption} for ${planName} plan`);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-xl shadow-xl p-10 w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Subscribe to {planName} Plan
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Your 14-day trial has ended. Please choose a payment method below.
        </p>

        <div className="text-center text-2xl font-semibold text-gray-900 mb-8">
          {price} / month
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {paymentOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`flex items-center border rounded-lg p-4 transition hover:shadow-md focus:outline-none justify-center gap-4 ${
                selectedOption === option.id
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-300"
              }`}
            >
              <img src={option.logo} alt={option.name} className="h-8 w-8" />
              <span className="text-gray-800 font-medium">{option.name}</span>
            </button>
          ))}
        </div>

        <Button
          className="w-full bg-orange-600 hover:bg-orange-700"
          onClick={handlePayment}
        >
          Proceed to Pay with {paymentOptions.find(p => p.id === selectedOption)?.name}
        </Button>
      </div>
    </div>
  );
};

export default PaymentPage;
