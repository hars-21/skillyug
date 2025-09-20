'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CourseCreateModal from '../CourseCreateModal';

export default function NewCoursePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    if (!isModalOpen) {
      router.push('/admin/courses');
    }
  }, [isModalOpen, router]);

  const handleSuccess = () => {
    router.push('/admin/courses');
  };

  const handleClose = () => {
    router.push('/admin/courses');
  };

  return (
    <CourseCreateModal
      isOpen={isModalOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
}