import { useState, useEffect } from "react";
import {
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaGlobe,
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp
} from "firebase/firestore";
import { 
  verifyBeforeUpdateEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { toast } from "sonner";

export default function BusinessForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    location: "",
    branch: "",
    contactEmail: "",
    contactPhone: "",
    whatsapp: "",
    secondaryEmail: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    website: "",
    description: "",
    businessType: "",
    branchCount: "",
    customBusinessType: "",
  });

  // Verification states
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [phoneVerificationSent, setPhoneVerificationSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Check if user has existing business data
  useEffect(() => {
    const checkExistingData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const businessData = data.businessDetails || {};

          setFormData({
            businessName: businessData.businessName || "",
            location: businessData.location || "",
            branch: businessData.branch || "",
            contactEmail: businessData.contactEmail || "",
            contactPhone: businessData.contactPhone || "",
            whatsapp: businessData.whatsapp || "",
            secondaryEmail: businessData.secondaryEmail || "",
            facebook: businessData.facebook || "",
            instagram: businessData.instagram || "",
            linkedin: businessData.linkedin || "",
            website: businessData.website || "",
            description: businessData.description || "",
            businessType: businessData.businessType || "",
            branchCount: businessData.branchCount || "",
            customBusinessType: businessData.customBusinessType || "",
          });

          if (data.emailVerified) setEmailVerified(true);
          if (data.phoneVerified) setPhoneVerified(true);

          setIsUpdating(true);
        }
      } catch (error) {
        console.error("Error checking existing data:", error);
      }
    };

    checkExistingData();
  }, []);

  // Initialize reCAPTCHA verifier
  useEffect(() => {
    if (typeof window !== 'undefined' && auth) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {}
      });
      setRecaptchaVerifier(verifier);
      
      return () => {
        verifier.clear();
      };
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'contactEmail') {
      setEmailVerified(false);
      setEmailVerificationSent(false);
    }
    if (name === 'contactPhone') {
      setPhoneVerified(false);
      setPhoneVerificationSent(false);
      setShowOtpField(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) {
      if (!formData.businessName.trim()) return false;
      if (!formData.location.trim()) return false;
      if (!formData.businessType.trim()) return false;
      if (formData.businessType === "Other" && !formData.customBusinessType.trim()) return false;
      if (!formData.branchCount.trim()) return false;
      return true;
    }
    if (step === 2) {
      if (!formData.contactEmail.trim()) return false;
      if (!formData.contactPhone.trim()) return false;
      return true;
    }
    return step !== 5;
  };

  const nextStep = () => {
    if (canGoNext()) setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const verifyEmail = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("You must be logged in to verify email");
      return;
    }
    
    setVerifyingEmail(true);
    
    try {
      if (currentUser.email !== formData.contactEmail) {
        await verifyBeforeUpdateEmail(currentUser, formData.contactEmail);
        setEmailVerificationSent(true);
        toast.success("Verification email sent! Please check your inbox.");
      } else {
        toast.info("Email is already up to date.");
      }
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      toast.error(`Failed to send verification email: ${error.message}`);
    } finally {
      setVerifyingEmail(false);
    }
  };

  const checkEmailVerification = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    try {
      await currentUser.reload();
      if (currentUser.emailVerified) {
        setEmailVerified(true);
        toast.success("Email verified successfully!");
      } else {
        toast.warning("Email not yet verified. Please check your inbox.");
      }
    } catch (error: any) {
      console.error("Error checking email verification:", error);
      toast.error(`Error checking verification: ${error.message}`);
    }
  };

  const sendPhoneOtp = async () => {
    if (!recaptchaVerifier) {
      toast.error("reCAPTCHA not initialized. Please refresh the page.");
      return;
    }
    
    setVerifyingPhone(true);
    
    try {
      const formattedPhone = formatPhoneNumber(formData.contactPhone);
      const confirmation = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        recaptchaVerifier
      );
      
      setConfirmationResult(confirmation);
      setShowOtpField(true);
      setPhoneVerificationSent(true);
      toast.success("OTP sent to your phone number!");
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error(`Failed to send OTP: ${error.message}`);
    } finally {
      setVerifyingPhone(false);
    }
  };

  const verifyPhoneOtp = async () => {
    if (!confirmationResult) {
      toast.error("No OTP sent yet. Please request OTP first.");
      return;
    }
    
    setVerifyingPhone(true);
    
    try {
      await confirmationResult.confirm(otp);
      setPhoneVerified(true);
      toast.success("Phone number verified successfully!");
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast.error(`Failed to verify OTP: ${error.message}`);
    } finally {
      setVerifyingPhone(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    return `+91${digits}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("You must be logged in to submit the form");
      setLoading(false);
      return;
    }
    
    if (!emailVerified) {
      toast.error("Please verify your email before submitting");
      setLoading(false);
      return;
    }
    
    if (!phoneVerified) {
      toast.error("Please verify your phone number before submitting");
      setLoading(false);
      return;
    }
    
    const businessDetails = {
      businessName: formData.businessName,
      location: formData.location,
      branch: formData.branch,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      whatsapp: formData.whatsapp,
      secondaryEmail: formData.secondaryEmail,
      facebook: formData.facebook,
      instagram: formData.instagram,
      linkedin: formData.linkedin,
      website: formData.website,
      description: formData.description,
      businessType: formData.businessType === "Other" 
        ? formData.customBusinessType 
        : formData.businessType,
      branchCount: formData.branchCount,
      userId: currentUser.uid,
      lastUpdated: serverTimestamp()
    };

    try {
      const userRef = doc(db, "users", currentUser.uid);

      await setDoc(userRef, {
        businessFormFilled: true,
        email: formData.contactEmail,
        phoneNumber: formData.contactPhone,
        emailVerified: emailVerified,
        phoneVerified: phoneVerified,
        businessDetails: businessDetails,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast.success(`Business details ${isUpdating ? 'updated' : 'saved'} successfully!`);
      
      setTimeout(() => {
        navigate("/components/business/dashboard");
      }, 1500);
    } catch (error: any) {
      console.error("Error submitting form to Firebase:", error);
      toast.error("There was a problem saving your business details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const animationProps = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
    transition: { duration: 0.5 },
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        toast.error("You must be logged in to access this page");
        navigate("/login");
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white shadow-md rounded-xl border border-gray-300">
      <h2 className="text-3xl font-bold mb-6 text-center text-orange-700">
        {isUpdating ? "Update Business Details" : "Business Details Form"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="business" {...animationProps}>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">1. Business Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Name */}
                <div className="relative">
                  <label className="absolute left-10 top-[-10px] text-xs bg-white text-gray-600 px-1 z-10">
                    Business Name
                  </label>
                  <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-blue-500 transition">
                    <FaBuilding className="text-gray-500" />
                    <input
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                      placeholder="My Company"
                      className="w-full p-2 pl-3 outline-none bg-transparent"
                    />
                  </div>
                </div>
                {/* Location */}
                <div className="relative">
                  <label className="absolute left-10 top-[-10px] text-xs bg-white text-gray-600 px-1 z-10">
                    Location
                  </label>
                  <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-blue-500 transition">
                    <FaMapMarkerAlt className="text-gray-500" />
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder="City, State"
                      className="w-full p-2 pl-3 outline-none bg-transparent"
                    />
                  </div>
                </div>
                {/* Branch */}
                <div className="relative">
                  <label className="absolute left-10 top-[-10px] text-xs bg-white text-gray-600 px-1 z-10">
                    Branch Name
                  </label>
                  <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-blue-500 transition">
                    <FaMapMarkerAlt className="text-gray-500" />
                    <input
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      placeholder="Branch name"
                      className="w-full p-2 pl-3 outline-none bg-transparent"
                    />
                  </div>
                </div>
                {/* Business Type */}
                <div className="relative">
                  <label className="absolute left-3 top-[-10px] text-xs bg-white text-gray-600 px-1 z-10">
                    Business Type
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    required
                    className="w-full border p-2 rounded-md bg-white"
                  >
                    <option value="">Select Type</option>
                    <option value="Retail">Retail</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Service">Service</option>
                    <option value="Tech">Tech</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {formData.businessType === "Other" && (
                  <div className="relative">
                    <label className="absolute left-10 top-[-10px] text-xs bg-white text-gray-600 px-1 z-10">
                      Enter Business Type
                    </label>
                    <input
                      name="customBusinessType"
                      value={formData.customBusinessType}
                      onChange={handleChange}
                      placeholder="Specify business type"
                      className="w-full border p-2 rounded-md"
                      required
                    />
                  </div>
                )}
                {/* Branch Count */}
                <div className="relative">
                  <label className="absolute left-3 top-[-10px] text-xs bg-white text-gray-600 px-1 z-10">
                    Branch Count
                  </label>
                  <select
                    name="branchCount"
                    value={formData.branchCount}
                    onChange={handleChange}
                    required
                    className="w-full border p-2 rounded-md bg-white"
                  >
                    <option value="">Select Count</option>
                    <option value="1">1</option>
                    <option value="2-5">2-5</option>
                    <option value="6-10">6-10</option>
                    <option value="11+">11+</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canGoNext()}
                  className={`px-6 py-2 rounded-lg ${
                    canGoNext()
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : "bg-orange-300 text-white cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="contact" {...animationProps}>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">2. Contact Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Email */}
                <div className="relative">
                  <label className="absolute left-10 top-[-10px] text-xs text-gray-600 bg-white px-1 z-10">
                    Contact Email
                  </label>
                  <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-blue-500 transition">
                    <FaEnvelope className="text-gray-500" />
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      required
                      className="w-full p-2 pl-3 outline-none bg-transparent"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="flex items-center mt-2">
                    {emailVerified ? (
                      <span className="text-green-600 flex items-center text-sm">
                        <FaCheckCircle className="mr-1" /> Email verified
                      </span>
                    ) : emailVerificationSent ? (
                      <>
                        <button
                          type="button"
                          onClick={checkEmailVerification}
                          className="text-blue-600 text-sm flex items-center hover:underline"
                        >
                          Check verification
                        </button>
                        <span className="text-gray-500 text-sm ml-2">
                          (Check your inbox)
                        </span>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={verifyEmail}
                        disabled={verifyingEmail || !formData.contactEmail}
                        className="text-blue-600 text-sm flex items-center hover:underline disabled:text-gray-400"
                      >
                        {verifyingEmail ? (
                          <>
                            <FaSpinner className="animate-spin mr-1" /> Sending...
                          </>
                        ) : (
                          "Verify email"
                        )}
                      </button>
                    )}
                  </div>
                </div>
                {/* Phone */}
                <div className="relative">
                  <label className="absolute left-10 top-[-10px] text-xs text-gray-600 bg-white px-1 z-10">
                    Phone Number
                  </label>
                  <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-blue-500 transition">
                    <FaPhone className="text-gray-500" />
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      pattern="^[0-9+\-() ]+$"
                      required
                      className="w-full p-2 pl-3 outline-none bg-transparent"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  <div className="mt-2">
                    {phoneVerified ? (
                      <span className="text-green-600 flex items-center text-sm">
                        <FaCheckCircle className="mr-1" /> Phone verified
                      </span>
                    ) : showOtpField ? (
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            className="border p-2 rounded-md flex-1"
                          />
                          <button
                            type="button"
                            onClick={verifyPhoneOtp}
                            disabled={verifyingPhone || !otp}
                            className="bg-blue-600 text-white px-3 py-2 rounded-md disabled:bg-blue-300"
                          >
                            {verifyingPhone ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              "Verify"
                            )}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={sendPhoneOtp}
                          className="text-blue-600 text-sm hover:underline"
                        >
                          Resend OTP
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={sendPhoneOtp}
                        disabled={verifyingPhone || !formData.contactPhone}
                        className="text-blue-600 text-sm flex items-center hover:underline disabled:text-gray-400"
                      >
                        {verifyingPhone ? (
                          <>
                            <FaSpinner className="animate-spin mr-1" /> Sending OTP...
                          </>
                        ) : (
                          "Verify phone with OTP"
                        )}
                      </button>
                    )}
                  </div>
                </div>
                {/* WhatsApp */}
                <div className="relative">
                  <label className="absolute left-10 top-[-10px] text-xs text-gray-600 bg-white px-1 z-10">
                    WhatsApp Number (optional)
                  </label>
                  <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-blue-500 transition">
                    <FaPhone className="text-gray-500" />
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      pattern="^[0-9+\-() ]*$"
                      className="w-full p-2 pl-3 outline-none bg-transparent"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                </div>
                {/* Secondary Email */}
                <div className="relative">
                  <label className="absolute left-10 top-[-10px] text-xs text-gray-600 bg-white px-1 z-10">
                    Secondary Email (optional)
                  </label>
                  <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-blue-500 transition">
                    <FaEnvelope className="text-gray-500" />
                    <input
                      type="email"
                      name="secondaryEmail"
                      value={formData.secondaryEmail}
                      onChange={handleChange}
                      className="w-full p-2 pl-3 outline-none bg-transparent"
                      placeholder="secondary@example.com"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canGoNext()}
                  className={`px-6 py-2 rounded-lg ${
                    canGoNext()
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : "bg-orange-300 text-white cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="social" {...animationProps}>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">3. Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facebook */}
                <div className="relative">
                  <label className="absolute left-10 top-[-10px] text-xs bg-white text-gray-600 px-1 z-10">
                    Facebook URL
                  </label>
                  <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-blue-500 transition">
                    <FaFacebook className="text-blue-600" />
                    <input
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleChange}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full p-2 pl-3 outline-none bg-transparent"
                      type="url"
                    />
                  </div>
                </div>
                {/* Instagram */}
                <div className="relative">
                  <label className="absolute left-10 top-[-10px] text-xs bg-white text-gray-600 px-1 z-10">
                    Instagram URL
                  </label>
                  <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-blue-500 transition">
                    <FaInstagram className="text-pink-600" />
                    <input
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      placeholder="https://instagram.com/yourpage"
                      className="w-full p-2 pl-3 outline-none bg-transparent"
                      type="url"
                    />
                  </div>
                </div>
                {/* LinkedIn */}
                <div className="relative">
                  <label className="absolute left-10 top-[-10px] text-xs bg-white text-gray-600 px-1 z-10">
                    LinkedIn URL
                  </label>
                  <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-blue-500 transition">
                    <FaLinkedin className="text-blue-700" />
                    <input
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/company/yourpage"
                      className="w-full p-2 pl-3 outline-none bg-transparent"
                      type="url"
                    />
                  </div>
                </div>
                {/* Website */}
                <div className="relative">
                  <label className="absolute left-10 top-[-10px] text-xs bg-white text-gray-600 px-1 z-10">
                    Website URL
                  </label>
                  <div className="flex items-center border rounded-md px-3 focus-within:ring-2 focus-within:ring-blue-500 transition">
                    <FaGlobe className="text-green-600" />
                    <input
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourbusiness.com"
                      className="w-full p-2 pl-3 outline-none bg-transparent"
                      type="url"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="description" {...animationProps}>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">4. Business Description</h3>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe your business..."
                className="w-full border rounded-md p-3 resize-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-6 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
                >
                  Review
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold text-center text-gray-700 mb-6">
                Review Your Details
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4 max-h-[60vh] overflow-y-auto">
                <DetailRow label="Business Name" value={formData.businessName} />
                <DetailRow label="Location" value={formData.location} />
                <DetailRow label="Branch" value={formData.branch || "—"} />
                <DetailRow
                  label="Business Type"
                  value={
                    formData.businessType === "Other"
                      ? formData.customBusinessType
                      : formData.businessType
                  }
                />
                <DetailRow label="Branch Count" value={formData.branchCount} />
                <DetailRow 
                  label="Contact Email" 
                  value={formData.contactEmail} 
                  verified={emailVerified}
                />
                <DetailRow 
                  label="Contact Phone" 
                  value={formData.contactPhone} 
                  verified={phoneVerified}
                />
                <DetailRow label="WhatsApp" value={formData.whatsapp || "—"} />
                <DetailRow label="Secondary Email" value={formData.secondaryEmail || "—"} />
                <DetailRow label="Facebook" value={formData.facebook || "—"} />
                <DetailRow label="Instagram" value={formData.instagram || "—"} />
                <DetailRow label="LinkedIn" value={formData.linkedin || "—"} />
                <DetailRow label="Website" value={formData.website || "—"} />
                <DetailRow label="Description" value={formData.description || "—"} />
              </div>
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !emailVerified || !phoneVerified}
                  className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-300 ease-in-out group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 group-hover:tracking-wider transition-all duration-300">
                    {loading ? (isUpdating ? "Updating..." : "Submitting...") : (isUpdating ? "Update" : "Submit")}
                  </span>
                  <span className="absolute inset-0 w-0 group-hover:w-full bg-white/10 transition-all duration-300 ease-in-out rounded-xl"></span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
      
      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container" className="hidden"></div>
    </div>
  );
}

function DetailRow({ label, value, verified }: { label: string; value: string; verified?: boolean }) {
  const isFilled = value && value !== "—";
  return (
    <div className="flex justify-between items-center border-b border-gray-200 py-2">
      <div className="font-semibold text-gray-700">{label}:</div>
      <div className="flex items-center gap-2 max-w-[60%] text-right">
        <span
          className={`break-words ${
            isFilled ? "text-gray-900" : "text-gray-400 italic"
          }`}
        >
          {value}
        </span>
        {isFilled && (
          verified !== undefined ? (
            verified ? (
              <FaCheckCircle className="text-green-500" title="Verified" />
            ) : (
              <FaTimesCircle className="text-red-500" title="Not verified" />
            )
          ) : (
            <FaCheckCircle className="text-green-500" title="Filled" />
          )
        )}
      </div>
    </div>
  );
}