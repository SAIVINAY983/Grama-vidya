import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data)
};

// Course API
export const courseAPI = {
    getAll: (params) => api.get('/courses', { params }),
    getOne: (id) => api.get(`/courses/${id}`),
    create: (data) => api.post('/courses', data),
    update: (id, data) => api.put(`/courses/${id}`, data),
    delete: (id) => api.delete(`/courses/${id}`),
    enroll: (id) => api.post(`/courses/${id}/enroll`),
    getMyCourses: () => api.get('/courses/teacher/my-courses'),
    getEnrolled: () => api.get('/courses/student/enrolled')
};

// Module API
export const moduleAPI = {
    getByCourse: (courseId) => api.get(`/modules/course/${courseId}`),
    create: (data) => api.post('/modules', data),
    update: (id, data) => api.put(`/modules/${id}`, data),
    delete: (id) => api.delete(`/modules/${id}`)
};

// Lesson API
export const lessonAPI = {
    getByModule: (moduleId) => api.get(`/lessons/module/${moduleId}`),
    getOne: (id) => api.get(`/lessons/${id}`),
    create: (data) => api.post('/lessons', data),
    update: (id, data) => api.put(`/lessons/${id}`, data),
    delete: (id) => api.delete(`/lessons/${id}`),
    uploadVideo: (id, formData) => api.post(`/lessons/${id}/video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    uploadPdf: (id, formData) => api.post(`/lessons/${id}/pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// Progress API
export const progressAPI = {
    getCourseProgress: (courseId) => api.get(`/progress/course/${courseId}`),
    updateProgress: (lessonId, data) => api.post(`/progress/lesson/${lessonId}`, data),
    getMyProgress: () => api.get('/progress/my-progress')
};

// Community API
export const communityAPI = {
    getPosts: (params) => api.get('/community', { params }),
    createPost: (data) => api.post('/community', data),
    replyToPost: (id, data) => api.post(`/community/${id}/reply`, data),
    toggleLike: (id) => api.post(`/community/${id}/like`),
    deletePost: (id) => api.delete(`/community/${id}`)
};

// Admin API
export const adminAPI = {
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getAnalytics: () => api.get('/admin/analytics'),
    getAllCourses: () => api.get('/admin/courses')
};

// Quiz API
export const quizAPI = {
    create: (data) => api.post('/quizzes', data),
    getByCourse: (courseId) => api.get(`/quizzes/course/${courseId}`),
    getOne: (id) => api.get(`/quizzes/${id}`),
    delete: (id) => api.delete(`/quizzes/${id}`),
    submit: (id, answers) => api.post(`/quizzes/${id}/submit`, { answers }),
    getResults: (id) => api.get(`/quizzes/${id}/results`)
};

// Notification API
export const notificationAPI = {
    getMyNotifications: () => api.get('/notifications'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    delete: (id) => api.delete(`/notifications/${id}`)
};

export default api;
