'use client'

import React from "react";
import { useAuth } from "../hooks/AuthContext";
import dynamic from 'next/dynamic';

// Dynamically import dashboard components to avoid SSR issues
const AdminDashboard = dynamic(() => import('../pages/AdminDashboard'), { ssr: false });
const StudentDashboard = dynamic(() => import('../pages/StudentDashboard'), { ssr: false });
const MentorsDashboard = dynamic(() => import('../pages/MentorsDashboard'), { ssr: false });

const DashboardSelector = () => {
  const { profile } = useAuth();
  console.log(profile);
  
  // if (!profile) return null;
  if (profile?.user_type === "ADMIN") return <AdminDashboard />;
  if (profile?.user_type === "student") return <StudentDashboard />;
  if (profile?.user_type === "instructor" || profile?.user_type === "teacher" || profile?.user_type === "mentor") return <MentorsDashboard />;
  // Default fallback
  return <StudentDashboard />;
};

export default DashboardSelector;
