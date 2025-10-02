'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminCourseAPI, adminUserAPI, CreateCourseInput, UpdateCourseInput, CreateUserInput, UpdateUserInput } from '@/utils/apiAdmin';

// Query Keys
export const QUERY_KEYS = {
  COURSES: ['courses'] as const,
  COURSE: (id: string) => ['courses', id] as const,
  COURSE_ANALYTICS: (id: string) => ['courses', id, 'analytics'] as const,
  COURSE_CATEGORIES: ['courses', 'categories'] as const,
  USERS: ['users'] as const,
  USER: (id: string) => ['users', id] as const,
} as const;

// Course Hooks
export const useCourses = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  difficulty?: string;
  featured?: boolean;
  search?: string;
}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.COURSES, params],
    queryFn: () => adminCourseAPI.getAll(params),
  });
};

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.COURSE(id),
    queryFn: () => adminCourseAPI.getById(id),
    enabled: !!id,
  });
};

export const useCourseAnalytics = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.COURSE_ANALYTICS(id),
    queryFn: () => adminCourseAPI.getAnalytics(id),
    enabled: !!id,
  });
};

export const useCourseCategories = () => {
  return useQuery({
    queryKey: QUERY_KEYS.COURSE_CATEGORIES,
    queryFn: () => adminCourseAPI.getCategories(),
  });
};

// Course Mutations
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseData: CreateCourseInput) => adminCourseAPI.create(courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, courseData }: { id: string; courseData: UpdateCourseInput }) =>
      adminCourseAPI.update(id, courseData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSE(variables.id) });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCourseAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES });
    },
  });
};

export const useToggleCourseFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCourseAPI.toggleFeatured(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSE(variables) });
    },
  });
};

// User Hooks
export const useUsers = (params?: {
  page?: number;
  limit?: number;
  role?: 'user' | 'admin';
  verified?: boolean;
  search?: string;
}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.USERS, params],
    queryFn: () => adminUserAPI.getAll(params),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.USER(id),
    queryFn: () => adminUserAPI.getById(id),
    enabled: !!id,
  });
};

// User Mutations
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserInput) => adminUserAPI.create(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UpdateUserInput }) =>
      adminUserAPI.update(id, userData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER(variables.id) });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminUserAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },
  });
};

export const useToggleUserVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminUserAPI.toggleVerification(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER(variables) });
    },
  });
};

export const useChangeUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'user' | 'admin' }) =>
      adminUserAPI.changeRole(id, role),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER(variables.id) });
    },
  });
};
