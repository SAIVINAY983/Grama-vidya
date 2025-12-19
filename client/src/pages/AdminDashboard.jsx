import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import Loading from '../components/Loading';
import {
    FiUsers,
    FiBook,
    FiTrendingUp,
    FiCheckCircle,
    FiTrash2,
    FiEdit2,
    FiSearch,
    FiFilter
} from 'react-icons/fi';

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [analyticsRes, usersRes, coursesRes] = await Promise.all([
                adminAPI.getAnalytics(),
                adminAPI.getUsers(),
                adminAPI.getAllCourses()
            ]);
            setAnalytics(analyticsRes.data.analytics);
            setUsers(usersRes.data.users || []);
            setCourses(coursesRes.data.courses || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminAPI.updateUserRole(userId, newRole);
            fetchData();
        } catch (error) {
            console.error('Error updating role:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await adminAPI.deleteUser(userId);
                fetchData();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = !roleFilter || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) return <Loading text="Loading admin dashboard..." />;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1">Manage users, courses, and system analytics</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['overview', 'users', 'courses'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && analytics && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <FiUsers size={24} className="mb-2 opacity-80" />
                                <div className="text-3xl font-bold">{analytics.users?.total || 0}</div>
                                <div className="text-white/80 text-sm">Total Users</div>
                            </div>
                            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                                <FiBook size={24} className="mb-2 opacity-80" />
                                <div className="text-3xl font-bold">{analytics.courses?.total || 0}</div>
                                <div className="text-white/80 text-sm">Total Courses</div>
                            </div>
                            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                <FiTrendingUp size={24} className="mb-2 opacity-80" />
                                <div className="text-3xl font-bold">{analytics.enrollments || 0}</div>
                                <div className="text-white/80 text-sm">Enrollments</div>
                            </div>
                            <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                                <FiCheckCircle size={24} className="mb-2 opacity-80" />
                                <div className="text-3xl font-bold">{analytics.completedLessons || 0}</div>
                                <div className="text-white/80 text-sm">Lessons Completed</div>
                            </div>
                        </div>

                        {/* User Breakdown */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card">
                                <h3 className="font-semibold text-gray-800 mb-4">User Distribution</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Students</span>
                                        <span className="font-semibold text-primary-600">{analytics.users?.students || 0}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary-500 h-2 rounded-full"
                                            style={{ width: `${(analytics.users?.students / analytics.users?.total) * 100 || 0}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Teachers</span>
                                        <span className="font-semibold text-secondary-600">{analytics.users?.teachers || 0}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-secondary-500 h-2 rounded-full"
                                            style={{ width: `${(analytics.users?.teachers / analytics.users?.total) * 100 || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <h3 className="font-semibold text-gray-800 mb-4">Recent Users</h3>
                                <div className="space-y-3">
                                    {analytics.recentUsers?.map(user => (
                                        <div key={user._id} className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium">{user.name?.charAt(0)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${user.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="card">
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1 relative">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input pl-12"
                                />
                            </div>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="input w-full md:w-40"
                            >
                                <option value="">All Roles</option>
                                <option value="student">Students</option>
                                <option value="teacher">Teachers</option>
                                <option value="admin">Admins</option>
                            </select>
                        </div>

                        {/* Users Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                                        <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                        <span className="text-primary-600 font-medium">
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-gray-800">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{user.email}</td>
                                            <td className="py-3 px-4">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                    className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="teacher">Teacher</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Courses Tab */}
                {activeTab === 'courses' && (
                    <div className="card">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Course</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Teacher</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Students</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map(course => (
                                        <tr key={course._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div>
                                                    <p className="font-medium text-gray-800">{course.title}</p>
                                                    <p className="text-sm text-gray-500 capitalize">{course.category}</p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{course.teacher?.name || 'N/A'}</td>
                                            <td className="py-3 px-4 text-gray-600">{course.enrolledStudents?.length || 0}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {course.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
