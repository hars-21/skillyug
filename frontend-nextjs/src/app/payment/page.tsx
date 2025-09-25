"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/AuthContext";
import Navbar from "@/components/Navbar";
import { formatIndianCurrency, paymentAPI, loadRazorpayScript } from "@/lib/api";
import {
	CreditCard,
	Shield,
	Clock,
	CheckCircle,
	AlertCircle,
	Loader2,
	ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

// Razorpay types
declare global {
	interface Window {
		Razorpay: any;
	}
}

interface Course {
	id: string;
	courseName: string;
	description?: string;
	price: number;
	imageUrl?: string;
	category: string;
	difficulty: string;
	durationHours?: number;
}

export default function PaymentPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { user, loading: authLoading } = useAuth();

	const [course, setCourse] = useState<Course | null>(null);
	const [paymentConfig, setPaymentConfig] = useState<
		{ razorpayKey: string; currency: string } | undefined
	>(undefined);
	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const courseId = searchParams?.get("courseId");
	const amount = searchParams?.get("amount");

	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/login?redirect=" + encodeURIComponent("/payment"));
			return;
		}

		if (courseId && amount) {
			loadPaymentData();
		} else {
			setError("Missing payment information. Please select a course to proceed.");
			setLoading(false);
		}
	}, [courseId, amount, user, authLoading]);

	const loadPaymentData = async () => {
		try {
			setLoading(true);

			// Load payment configuration
			const config = await paymentAPI.getConfig();
			setPaymentConfig(config.data);

			// Load course details
			const courseResponse = await fetch(`/api/courses/${courseId}`);
			if (!courseResponse.ok) {
				throw new Error("Failed to load course details");
			}
			const courseData = await courseResponse.json();
			setCourse(courseData.data);
		} catch (err) {
			console.error("Error loading payment data:", err);
			setError(err instanceof Error ? err.message : "Failed to load payment information");
		} finally {
			setLoading(false);
		}
	};

	const handlePayment = async () => {
		if (!paymentConfig || !course || !user) return;

		try {
			setProcessing(true);
			setError(null);

			// Load Razorpay script
			await loadRazorpayScript();

			// Create payment order
			const orderData = await paymentAPI.createOrder(parseFloat(amount!), courseId!);

			if (!orderData.data) {
				throw new Error("Payment order data is missing. Please try again.");
			}

			// Configure Razorpay options
			const options = {
				key: paymentConfig.razorpayKey,
				amount: orderData.data.amount,
				currency: paymentConfig.currency,
				name: "SkillyUG",
				description: `Payment for ${course.courseName}`,
				order_id: orderData.data.id,
				prefill: {
					name: user.name || "Student",
					email: user.email || "",
				},
				theme: {
					color: "#EB8216",
				},
				handler: async (response: any) => {
					try {
						// Verify payment
						await paymentAPI.verifyPayment({
							razorpayPaymentId: response.razorpay_payment_id,
							razorpayOrderId: response.razorpay_order_id,
							razorpaySignature: response.razorpay_signature,
							courseId: courseId!,
						});

						// Process successful payment
						await paymentAPI.processSuccess(courseId!, response);

						toast.success("Payment successful! You now have access to the course.");
						router.push(
							`/payment/success?courseId=${courseId}&paymentId=${response.razorpay_payment_id}`
						);
					} catch (error) {
						console.error("Payment verification failed:", error);
						toast.error("Payment verification failed. Please contact support.");
						await paymentAPI.handleFailure(courseId!, {
							error: error instanceof Error ? error.message : "Verification failed",
						});
						router.push(
							`/payment/failure?courseId=${courseId}&error=verification_failed&description=${
								error instanceof Error ? error.message : "Verification failed"
							}`
						);
					}
				},
				modal: {
					ondismiss: () => {
						setProcessing(false);
						toast.error("Payment cancelled");
					},
				},
			};

			// Open Razorpay checkout
			const razorpay = new window.Razorpay(options);
			razorpay.open();
		} catch (error) {
			console.error("Payment failed:", error);
			setError(error instanceof Error ? error.message : "Payment failed");
			toast.error("Payment failed. Please try again.");
			await paymentAPI.handleFailure(courseId!, {
				error: error instanceof Error ? error.message : "Payment failed",
			});
		} finally {
			setProcessing(false);
		}
	};

	if (authLoading || loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-blue-800">
				<Navbar />
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="text-center">
						<Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
						<p className="text-white">Loading payment information...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-blue-800">
				<Navbar />
				<div className="py-14 px-4 sm:px-6 lg:px-8">
					<div className="max-w-2xl mx-auto">
						<div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
							<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
							<h2 className="text-xl font-semibold text-red-800 mb-2">Payment Error</h2>
							<p className="text-red-600 mb-4">{error}</p>
							<Link
								href="/courses"
								className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to Courses
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className="min-h-screen"
			style={{ background: "linear-gradient(to bottom right, #000000, #2741D6, #051C7F)" }}
		>
			<Navbar />
			<div className="py-14 px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto">
					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
							Complete Your Payment
						</h1>
						<p className="text-xl text-gray-300">Secure checkout powered by Razorpay</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Course Details */}
						{course && (
							<div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6">
								<h2 className="text-2xl font-bold text-white mb-4">Course Details</h2>

								{course.imageUrl && (
									<div className="h-48 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
										<img
											src={course.imageUrl}
											alt={course.courseName}
											className="w-full h-full object-cover rounded-lg"
										/>
									</div>
								)}

								<h3 className="text-xl font-semibold text-white mb-2">{course.courseName}</h3>
								{course.description && <p className="text-gray-300 mb-4">{course.description}</p>}

								<div className="space-y-2 mb-6">
									<div className="flex justify-between">
										<span className="text-gray-400">Category:</span>
										<span className="text-white capitalize">
											{course.category.replace("_", " ")}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-400">Difficulty:</span>
										<span className="text-white capitalize">{course.difficulty.toLowerCase()}</span>
									</div>
									{course.durationHours && (
										<div className="flex justify-between">
											<span className="text-gray-400">Duration:</span>
											<span className="text-white">{course.durationHours} hours</span>
										</div>
									)}
								</div>

								<div className="border-t border-gray-600 pt-4">
									<div className="flex justify-between items-center">
										<span className="text-xl font-semibold text-white">Total Amount:</span>
										<span className="text-3xl font-bold" style={{ color: "#EB8216" }}>
											{formatIndianCurrency(parseFloat(amount!))}
										</span>
									</div>
								</div>
							</div>
						)}

						{/* Payment Section */}
						<div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6">
							<h2 className="text-2xl font-bold text-white mb-6">Payment Information</h2>

							{/* Security Features */}
							<div className="space-y-4 mb-6">
								<div className="flex items-center space-x-3">
									<Shield className="w-5 h-5" style={{ color: "#EB8216" }} />
									<span className="text-gray-300">256-bit SSL encryption</span>
								</div>
								<div className="flex items-center space-x-3">
									<CreditCard className="w-5 h-5" style={{ color: "#EB8216" }} />
									<span className="text-gray-300">All major cards accepted</span>
								</div>
								<div className="flex items-center space-x-3">
									<Clock className="w-5 h-5" style={{ color: "#EB8216" }} />
									<span className="text-gray-300">Instant course access</span>
								</div>
								<div className="flex items-center space-x-3">
									<CheckCircle className="w-5 h-5" style={{ color: "#EB8216" }} />
									<span className="text-gray-300">30-day money-back guarantee</span>
								</div>
							</div>

							{/* Payment Button */}
							<button
								onClick={handlePayment}
								disabled={processing || !paymentConfig}
								className="w-full py-4 px-6 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
								style={{
									background: processing ? "#6B7280" : "#EB8216",
									boxShadow: processing ? "none" : "0 4px 15px rgba(235, 130, 22, 0.3)",
								}}
							>
								{processing ? (
									<div className="flex items-center justify-center space-x-2">
										<Loader2 className="w-5 h-5 animate-spin" />
										<span>Processing Payment...</span>
									</div>
								) : (
									<div className="flex items-center justify-center space-x-2">
										<CreditCard className="w-5 h-5" />
										<span>Pay {formatIndianCurrency(parseFloat(amount!))}</span>
									</div>
								)}
							</button>

							{/* Powered by Razorpay */}
							<p className="text-center text-sm text-gray-400 mt-4">
								Powered by <span className="font-semibold">Razorpay</span>
							</p>

							{/* Terms */}
							<p className="text-xs text-gray-500 mt-4 text-center">
								By completing this purchase you agree to our{" "}
								<Link href="/terms" className="underline hover:text-gray-300">
									Terms of Service
								</Link>{" "}
								and{" "}
								<Link href="/privacy" className="underline hover:text-gray-300">
									Privacy Policy
								</Link>
							</p>
						</div>
					</div>

					{/* Go Back Link */}
					<div className="text-center mt-8">
						<Link
							href="/courses"
							className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Courses
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
