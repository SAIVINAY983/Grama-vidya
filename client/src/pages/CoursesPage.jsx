import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { courseAPI } from '../services/api';
import CourseCard from '../components/CourseCard';
import Loading from '../components/Loading';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

const CoursesPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        language: searchParams.get('language') || '',
        difficulty: searchParams.get('difficulty') || ''
    });

    useEffect(() => {
        fetchCourses();
    }, [filters]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.category) params.category = filters.category;
            if (filters.language) params.language = filters.language;
            if (filters.difficulty) params.difficulty = filters.difficulty;

            const response = await courseAPI.getAll(params);
            setCourses(response.data.courses || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Update URL params
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v) params.set(k, v);
        });
        setSearchParams(params);
    };

    const clearFilters = () => {
        setFilters({ search: '', category: '', language: '', difficulty: '' });
        setSearchParams({});
    };

    const hasActiveFilters = filters.category || filters.language || filters.difficulty;

    const categories = [
        { value: '', label: 'All Categories' },
        { value: 'mathematics', label: 'Mathematics' },
        { value: 'science', label: 'Science' },
        { value: 'language', label: 'Language' },
        { value: 'social-studies', label: 'Social Studies' },
        { value: 'computer', label: 'Computer Skills' },
        { value: 'life-skills', label: 'Life Skills' },
        { value: 'other', label: 'Other' }
    ];

    const languages = [
        { value: '', label: 'All Languages' },
        { value: 'english', label: 'English' },
        { value: 'hindi', label: 'Hindi' },
        { value: 'regional', label: 'Regional' }
    ];

    const difficulties = [
        { value: '', label: 'All Levels' },
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Explore Courses
                    </h1>
                    <p className="text-gray-500 mt-1">Find the perfect course for your learning journey</p>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="input pl-12"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn ${hasActiveFilters ? 'btn-primary' : 'btn-outline'} md:hidden`}
                    >
                        <FiFilter size={20} />
                        Filters {hasActiveFilters && `(${[filters.category, filters.language, filters.difficulty].filter(Boolean).length})`}
                    </button>
                </div>

                {/* Desktop Filters */}
                <div className="hidden md:flex gap-4 mb-6">
                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="input w-48"
                    >
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                    <select
                        value={filters.language}
                        onChange={(e) => handleFilterChange('language', e.target.value)}
                        className="input w-40"
                    >
                        {languages.map(lang => (
                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                    </select>
                    <select
                        value={filters.difficulty}
                        onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                        className="input w-40"
                    >
                        {difficulties.map(diff => (
                            <option key={diff.value} value={diff.value}>{diff.label}</option>
                        ))}
                    </select>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="btn btn-outline text-red-500 border-red-300 hover:bg-red-50">
                            <FiX size={18} />
                            Clear
                        </button>
                    )}
                </div>

                {/* Mobile Filters Panel */}
                {showFilters && (
                    <div className="md:hidden card mb-6 animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Filters</h3>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-sm text-red-500">
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="label">Category</label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="input"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Language</label>
                                <select
                                    value={filters.language}
                                    onChange={(e) => handleFilterChange('language', e.target.value)}
                                    className="input"
                                >
                                    {languages.map(lang => (
                                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Difficulty</label>
                                <select
                                    value={filters.difficulty}
                                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                                    className="input"
                                >
                                    {difficulties.map(diff => (
                                        <option key={diff.value} value={diff.value}>{diff.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Count */}
                <p className="text-gray-500 mb-6">
                    {loading ? 'Searching...' : `${courses.length} course${courses.length !== 1 ? 's' : ''} found`}
                </p>

                {/* Courses Grid */}
                {loading ? (
                    <Loading text="Loading courses..." />
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <CourseCard key={course._id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-12">
                        <FiSearch size={48} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No courses found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                        <button onClick={clearFilters} className="btn btn-outline">
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoursesPage;
