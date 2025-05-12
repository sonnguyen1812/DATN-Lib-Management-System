import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from "chart.js";
import Header from "../layout/Header";

// Import assets
import adminIcon from "../assets/pointing.png";
import usersIcon from "../assets/people-black.png";
import bookIcon from "../assets/book-square.png";
import logo from "../assets/black-logo.png";
import catalogIcon from "../assets/catalog.png";

// Import icons from Lucide React
import { 
  BookOpen, 
  Users, 
  BookUser, 
  LayoutDashboard, 
  UserCog, 
  BookPlus, 
  LineChart,
  Calendar,
  Activity,
  BookCheck,
  Library,
  Bookmark
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

const AdminDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const { users } = useSelector((state) => state.user);
    const { books } = useSelector((state) => state.book);
    const { allBorrowedBooks } = useSelector((state) => state.borrow);
    const { settingPopup } = useSelector((state) => state.popup);

    const [totalUsers, setTotalUsers] = useState(0);
    const [totalAdmin, setTotalAdmin] = useState(0);
    const [totalBooks, setTotalBooks] = useState((books && books.length) || 0);
    const [totalBorrowedBooks, setTotalBorrowedBooks] = useState(0);
    const [totalReturnedBooks, setTotalReturnedBooks] = useState(0);
    const [recentActivities, setRecentActivities] = useState([]);
    const [overdueBooks, setOverdueBooks] = useState([]);
    const [monthlyData, setMonthlyData] = useState({
        labels: [],
        borrowed: [],
        returned: []
    });

    useEffect(() => {
        // Calculate user stats
        let numberOfUsers = users.filter((user) => user.role === "User");
        let numberOfAdmins = users.filter((user) => user.role === "Admin");
        setTotalUsers(numberOfUsers.length);
        setTotalAdmin(numberOfAdmins.length);

        // Calculate borrowed and returned books
        let numberOfTotalBorrowedBooks = allBorrowedBooks.filter(
            (book) => book.returnDate === null
        );
        let numberOfTotalReturnedBooks = allBorrowedBooks.filter(
            (book) => book.returnDate !== null
        );
        setTotalBorrowedBooks(numberOfTotalBorrowedBooks.length);
        setTotalReturnedBooks(numberOfTotalReturnedBooks.length);

        // Find overdue books
        const currentDate = new Date();
        const overdueItems = allBorrowedBooks.filter(book => {
            return !book.returnDate && new Date(book.dueDate) < currentDate;
        });
        setOverdueBooks(overdueItems);

        // Recent activities - sort the borrowed books by date
        const sortedActivities = [...allBorrowedBooks].sort((a, b) => {
            const dateA = a.returnDate ? new Date(a.returnDate) : new Date(a.borrowDate);
            const dateB = b.returnDate ? new Date(b.returnDate) : new Date(b.borrowDate);
            return dateB - dateA;
        }).slice(0, 5);
        setRecentActivities(sortedActivities);

        // Generate monthly borrowing and return data for the last 6 months
        const months = [];
        const borrowedCounts = [];
        const returnedCounts = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = date.toLocaleString('default', { month: 'short' });
            months.push(month);

            const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const borrowedThisMonth = allBorrowedBooks.filter(book => {
                const borrowDate = new Date(book.borrowDate);
                return borrowDate >= startDate && borrowDate <= endDate;
            }).length;

            const returnedThisMonth = allBorrowedBooks.filter(book => {
                if (!book.returnDate) return false;
                const returnDate = new Date(book.returnDate);
                return returnDate >= startDate && returnDate <= endDate;
            }).length;

            borrowedCounts.push(borrowedThisMonth);
            returnedCounts.push(returnedThisMonth);
        }

        setMonthlyData({
            labels: months,
            borrowed: borrowedCounts,
            returned: returnedCounts
        });
        
    }, [users, allBorrowedBooks]);

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    };

    // Pie chart data for borrowed vs returned books
    const pieData = {
        labels: ["Currently Borrowed", "Returned Books"],
        datasets: [
            {
                data: [totalBorrowedBooks, totalReturnedBooks],
                backgroundColor: ["#1E293B", "#475569"],
                hoverBackgroundColor: ["#0F172A", "#334155"],
                borderWidth: 0,
                hoverOffset: 6,
            },
        ],
    };

    // Bar chart data for monthly book activity
    const barData = {
        labels: monthlyData.labels,
        datasets: [
            {
                label: 'Books Borrowed',
                data: monthlyData.borrowed,
                backgroundColor: '#1E293B',
                borderRadius: 6,
            },
            {
                label: 'Books Returned',
                data: monthlyData.returned,
                backgroundColor: '#475569',
                borderRadius: 6,
            },
        ],
    };

    // Options for the chart
    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    font: {
                        size: 12,
                        weight: 'bold',
                    },
                    padding: 20,
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.raw} (${Math.round(context.raw / (totalBorrowedBooks + totalReturnedBooks) * 100)}%)`;
                    }
                }
            }
        },
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Monthly Book Activity',
                font: {
                    size: 16,
                    weight: 'bold',
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    drawBorder: false,
                },
                ticks: {
                    precision: 0
                }
            },
            x: {
                grid: {
                    display: false,
                }
            }
        }
    };

    // Activity type indicator with colored dot
    const ActivityIndicator = ({ type }) => {
        const color = type === 'borrow' ? 'bg-slate-800' : 'bg-slate-600';
        return <span className={`inline-block w-2 h-2 rounded-full ${color} mr-2`}></span>;
    };

    return (
        <>
            <main className="relative flex-1 p-6 pt-28 bg-white">
                <Header />
                
                {/* Welcome & Stats Summary */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Welcome to Library Administration
                            </h1>
                            <p className="text-gray-600">
                                Here's what's happening with your library today
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 py-2 px-4 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center">
                            <Calendar className="text-gray-700 mr-2 h-5 w-5" />
                            <span className="text-gray-700 font-medium">
                                {new Date().toLocaleDateString('en-US', { 
                                    weekday: 'long',
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-slate-800 border border-gray-200 flex items-center">
                            <div className="bg-slate-100 p-3 rounded-lg mr-4">
                                <Users className="h-6 w-6 text-slate-800" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{totalUsers}</h2>
                                <p className="text-gray-500 text-sm">Users</p>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-slate-700 border border-gray-200 flex items-center">
                            <div className="bg-slate-100 p-3 rounded-lg mr-4">
                                <BookOpen className="h-6 w-6 text-slate-700" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{totalBooks}</h2>
                                <p className="text-gray-500 text-sm">Books</p>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-slate-600 border border-gray-200 flex items-center">
                            <div className="bg-slate-100 p-3 rounded-lg mr-4">
                                <BookUser className="h-6 w-6 text-slate-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{totalBorrowedBooks}</h2>
                                <p className="text-gray-500 text-sm">Borrowed</p>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-slate-500 border border-gray-200 flex items-center">
                            <div className="bg-slate-100 p-3 rounded-lg mr-4">
                                <UserCog className="h-6 w-6 text-slate-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{totalAdmin}</h2>
                                <p className="text-gray-500 text-sm">Admins</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Charts and Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Borrowing Pie Chart */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Borrowing Status</h3>
                        <div className="h-64 relative">
                            <Pie data={pieData} options={pieOptions} />
                        </div>
                    </div>
                    
                    {/* Monthly Bar Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Activity</h3>
                        <div className="h-64 relative">
                            <Bar data={barData} options={barOptions} />
                        </div>
                    </div>
                </div>
                
                {/* Recent Activities and Overdue Books */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Recent Activities */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                            <div className="flex gap-4">
                                <div className="flex items-center">
                                    <ActivityIndicator type="borrow" />
                                    <span className="text-xs text-gray-500">Borrowed</span>
                                </div>
                                <div className="flex items-center">
                                    <ActivityIndicator type="return" />
                                    <span className="text-xs text-gray-500">Returned</span>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y">
                            {recentActivities.length > 0 ? (
                                recentActivities.map((activity, index) => (
                                    <div key={index} className="py-3 flex items-start">
                                        <div className="flex-shrink-0 mt-1">
                                            {activity.returnDate ? (
                                                <BookCheck className="h-5 w-5 text-slate-600" />
                                            ) : (
                                                <BookUser className="h-5 w-5 text-slate-800" />
                                            )}
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <div className="flex justify-between">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {activity.returnDate ? 'Returned' : 'Borrowed'}: {activity.bookTitle}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(activity.returnDate || activity.borrowDate)}
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                by {activity.user.name} ({activity.user.email})
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="py-4 text-gray-500 text-center">No recent activities</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Overdue Books */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Overdue Books <span className="text-sm font-normal text-red-500">({overdueBooks.length})</span>
                        </h3>
                        <div className="divide-y">
                            {overdueBooks.length > 0 ? (
                                overdueBooks.slice(0, 5).map((book, index) => (
                                    <div key={index} className="py-3 flex">
                                        <div className="flex-shrink-0">
                                            <Bookmark className="h-5 w-5 text-red-500" />
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <div className="flex justify-between">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {book.bookTitle}
                                                </p>
                                                <p className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100">
                                                    Due: {formatDate(book.dueDate)}
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Borrowed by {book.user.name} on {formatDate(book.borrowDate)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="py-4 text-gray-500 text-center">No overdue books</p>
                            )}
                            
                            {overdueBooks.length > 5 && (
                                <div className="py-3 text-center">
                                    <button 
                                        onClick={() => document.querySelector('[data-component="Catalog"]')?.click()}
                                        className="text-sm text-slate-800 hover:text-slate-600 font-medium"
                                    >
                                        View all {overdueBooks.length} overdue books
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Inspirational Quote */}
                <div className="mt-8 bg-slate-900 p-8 rounded-xl shadow-sm text-white">
                    <div className="max-w-3xl mx-auto text-center">
                        <h4 className="text-2xl font-bold mb-4">
                            "Embarking on the journey of reading fosters personal growth, nurturing a path towards excellence and the refinement of character."
                        </h4>
                        <p className="text-slate-300 text-lg">~ BookWorm Team</p>
                    </div>
                </div>
            </main>
        </>
    );
};

export default AdminDashboard;
