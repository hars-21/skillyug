"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/AuthContext";
import Navbar from "@/components/Navbar";
import { XCircle, RefreshCw, HelpCircle, ArrowLeft, Home, MessageCircle } from "lucide-react";
import Link from "next/link";

interface Course {
	id: string;
	courseName: string;
	price: number;
	imageUrl?: string;
}

export default function PaymentFailurePage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { user } = useAuth();

	const [course, setCourse] = useState<Course | null>(null);
	const [loading, setLoading] = useState(true);

	const courseId = searchParams?.get("courseId");
	const errorCode = searchParams?.get("error");
	const errorDescription = searchParams?.get("description");

	useEffect(() => {
		if (!user) {
			router.push("/login");
			return;
		}

		if (courseId) {
			loadCourseDetails();
		} else {
			setLoading(false);
		}
	}, [courseId, user]);

	const loadCourseDetails = async () => {
		try {
			const response = await fetch(`/api/courses/${courseId}`);
			if (response.ok) {
				const data = await response.json();
				setCourse(data.data);
			}
		} catch (error) {
			console.error("Error loading course:", error);
		} finally {
			setLoading(false);
		}
	};

	const getErrorMessage = () => {
		switch (errorCode) {
			case "payment_failed":
				return "Your payment could not be processed. Please check your payment details and try again.";
			case "insufficient_funds":
				return "Your payment was declined due to insufficient funds. Please try with a different payment method.";
			case "card_declined":
				return "Your card was declined. Please check your card details or try with a different card.";
			case "network_error":
				return "There was a network error during payment processing. Please check your internet connection and try again.";
			case "user_cancelled":
				return "Payment was cancelled by you. You can retry the payment anytime.";
			default:
				return (
					errorDescription ||
					"We encountered an issue while processing your payment. Please try again or contact support."
				);
		}
	};

	const retryPayment = () => {
		if (courseId && course) {
			router.push(`/payment?courseId=${courseId}&amount=${course.price}`);
		}
	};

	if (loading) {
		return (
			<div
				className="min-h-screen"
				style={{ background: "linear-gradient(to bottom right, #000000, #2741D6, #051C7F)" }}
			>
				<Navbar />
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="text-center">
						<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
						<p className="text-white">Loading...</p>
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
					{/* Failure Header */}
					<div className="text-center mb-12">
						<div className="mx-auto w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-6">
							<XCircle className="w-12 h-12 text-white" />
						</div>
						<h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Payment Failed</h1>
						<p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">{getErrorMessage()}</p>
						{errorCode && (
							<p className="text-sm text-gray-400">
								Error Code: <span className="font-mono">{errorCode}</span>
							</p>
						)}
					</div>

					{/* Course Card */}
					{course && (
						<div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-8 mb-8">
							<div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
								<div className="flex-shrink-0">
									{course.imageUrl ? (
										<img
											src={course.imageUrl}
											alt={course.courseName}
											className="w-32 h-32 object-cover rounded-lg"
										/>
									) : (
										<div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
											<HelpCircle className="w-16 h-16 text-white" />
										</div>
									)}
								</div>

								<div className="flex-1 text-center md:text-left">
									<h2 className="text-2xl font-bold text-white mb-2">{course.courseName}</h2>
									<p className="text-gray-300 mb-4">
										Don't worry! Your course selection is still available. You can retry the payment
										anytime.
									</p>
									<div className="text-2xl font-bold" style={{ color: "#EB8216" }}>
										₹{course.price.toLocaleString("en-IN")}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Action Buttons */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
						<div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6 text-center">
							<RefreshCw
								className="w-12 h-12 text-white mx-auto mb-4"
								style={{ color: "#EB8216" }}
							/>
							<h3 className="text-xl font-semibold text-white mb-2">Retry Payment</h3>
							<p className="text-gray-300 mb-4">
								Try again with the same or different payment method.
							</p>
							<button
								onClick={retryPayment}
								className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300"
								style={{
									background: "#EB8216",
									boxShadow: "0 4px 15px rgba(235, 130, 22, 0.3)",
								}}
							>
								<RefreshCw className="w-4 h-4 mr-2" />
								Try Again
							</button>
						</div>

						<div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6 text-center">
							<MessageCircle
								className="w-12 h-12 text-white mx-auto mb-4"
								style={{ color: "#EB8216" }}
							/>
							<h3 className="text-xl font-semibold text-white mb-2">Need Help?</h3>
							<p className="text-gray-300 mb-4">
								Contact our support team if you continue to face issues.
							</p>
							<Link
								href="/contactus"
								className="inline-flex items-center px-6 py-3 border-2 text-white font-semibold rounded-lg transition-all duration-300 hover:bg-white/10"
								style={{ borderColor: "#EB8216", color: "#EB8216" }}
							>
								<MessageCircle className="w-4 h-4 mr-2" />
								Contact Support
							</Link>
						</div>
					</div>

					{/* Common Issues */}
					<div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-8">
						<h2 className="text-2xl font-bold text-white mb-6 text-center">
							Common Issues & Solutions
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h3 className="text-lg font-semibold text-white mb-3" style={{ color: "#EB8216" }}>
									Card Declined
								</h3>
								<ul className="text-gray-300 text-sm space-y-2">
									<li>• Check if your card has sufficient balance</li>
									<li>• Verify card details (number, CVV, expiry)</li>
									<li>• Contact your bank for international transactions</li>
									<li>• Try a different card or payment method</li>
								</ul>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-white mb-3" style={{ color: "#EB8216" }}>
									Technical Issues
								</h3>
								<ul className="text-gray-300 text-sm space-y-2">
									<li>• Check your internet connection</li>
									<li>• Clear browser cache and cookies</li>
									<li>• Try using a different browser</li>
									<li>• Disable ad blockers temporarily</li>
								</ul>
							</div>
						</div>
					</div>

					{/* Navigation Links */}
					<div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mt-8">
						<Link
							href="/courses"
							className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Courses
						</Link>
						<Link
							href="/dashboard"
							className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
						>
							<Home className="w-4 h-4 mr-2" />
							Go to Dashboard
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
