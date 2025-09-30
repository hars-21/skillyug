"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/AuthContext";
import Navbar from "@/components/Navbar";
import { CheckCircle, Download, PlayCircle, Book, ArrowRight, Home } from "lucide-react";
import Link from "next/link";

interface Course {
	id: string;
	courseName: string;
	description?: string;
	imageUrl?: string;
	category: string;
	difficulty: string;
}

export default function PaymentSuccessPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { user } = useAuth();

	const [course, setCourse] = useState<Course | null>(null);
	const [loading, setLoading] = useState(true);

	const courseId = searchParams?.get("courseId");
	const paymentId = searchParams?.get("paymentId");

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
					{/* Success Header */}
					<div className="text-center mb-12">
						<div className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6">
							<CheckCircle className="w-12 h-12 text-white" />
						</div>
						<h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Payment Successful!</h1>
						<p className="text-xl text-gray-300 max-w-2xl mx-auto">
							Congratulations! Your payment has been processed successfully. You now have access to
							your course.
						</p>
						{paymentId && (
							<p className="text-sm text-gray-400 mt-4">
								Payment ID: <span className="font-mono">{paymentId}</span>
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
											<Book className="w-16 h-16 text-white" />
										</div>
									)}
								</div>

								<div className="flex-1 text-center md:text-left">
									<h2 className="text-2xl font-bold text-white mb-2">{course.courseName}</h2>
									{course.description && <p className="text-gray-300 mb-4">{course.description}</p>}
									<div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
										<span className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full">
											{course.category.replace("_", " ")}
										</span>
										<span className="px-3 py-1 bg-green-600/30 text-green-300 rounded-full">
											{course.difficulty}
										</span>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Action Buttons */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
						<div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6 text-center">
							<PlayCircle
								className="w-12 h-12 text-white mx-auto mb-4"
								style={{ color: "#EB8216" }}
							/>
							<h3 className="text-xl font-semibold text-white mb-2">Start Learning</h3>
							<p className="text-gray-300 mb-4">
								Begin your learning journey with immediate access to all course materials.
							</p>
							<Link
								href={courseId ? `/courses/${courseId}` : "/dashboard"}
								className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300"
								style={{
									background: "#EB8216",
									boxShadow: "0 4px 15px rgba(235, 130, 22, 0.3)",
								}}
							>
								Access Course
								<ArrowRight className="w-4 h-4 ml-2" />
							</Link>
						</div>

						<div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6 text-center">
							<Download
								className="w-12 h-12 text-white mx-auto mb-4"
								style={{ color: "#EB8216" }}
							/>
							<h3 className="text-xl font-semibold text-white mb-2">Download Receipt</h3>
							<p className="text-gray-300 mb-4">
								Get your payment receipt for your records and expense claims.
							</p>
							<button
								onClick={() => window.print()}
								className="inline-flex items-center px-6 py-3 border-2 text-white font-semibold rounded-lg transition-all duration-300 hover:bg-white/10"
								style={{ borderColor: "#EB8216", color: "#EB8216" }}
							>
								Download Receipt
								<Download className="w-4 h-4 ml-2" />
							</button>
						</div>
					</div>

					{/* What's Next */}
					<div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-8">
						<h2 className="text-2xl font-bold text-white mb-6 text-center">What's Next?</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="text-center">
								<div
									className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
									style={{ background: "#051C7F" }}
								>
									<span className="text-white font-bold" style={{ color: "#EB8216" }}>
										1
									</span>
								</div>
								<h3 className="text-lg font-semibold text-white mb-2">Access Your Course</h3>
								<p className="text-gray-300 text-sm">
									Go to your dashboard and start with the first module.
								</p>
							</div>

							<div className="text-center">
								<div
									className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
									style={{ background: "#051C7F" }}
								>
									<span className="text-white font-bold" style={{ color: "#EB8216" }}>
										2
									</span>
								</div>
								<h3 className="text-lg font-semibold text-white mb-2">Join Community</h3>
								<p className="text-gray-300 text-sm">
									Connect with fellow students and instructors for support.
								</p>
							</div>

							<div className="text-center">
								<div
									className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
									style={{ background: "#051C7F" }}
								>
									<span className="text-white font-bold" style={{ color: "#EB8216" }}>
										3
									</span>
								</div>
								<h3 className="text-lg font-semibold text-white mb-2">Earn Certificate</h3>
								<p className="text-gray-300 text-sm">
									Complete all modules to earn your certificate of completion.
								</p>
							</div>
						</div>
					</div>

					{/* Navigation Links */}
					<div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mt-8">
						<Link
							href="/dashboard"
							className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
						>
							<Home className="w-4 h-4 mr-2" />
							Go to Dashboard
						</Link>
						<Link
							href="/courses"
							className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
						>
							<Book className="w-4 h-4 mr-2" />
							Explore More Courses
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
