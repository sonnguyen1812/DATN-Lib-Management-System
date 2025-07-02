import { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { useSelector } from "react-redux";
import Header from "../layout/Header";
import { Link } from "react-router-dom";
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
import { 
  BookOpen, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  BookMarked
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

const UserDashboard = () => {
    const { userBorrowedBooks } = useSelector((state) => state.borrow);
    const { user } = useSelector((state) => state.auth);

    const [totalBorrowedBooks, setTotalBorrowedBooks] = useState(0);
    const [totalReturnedBooks, setTotalReturnedBooks] = useState(0);
    const [overdueBooks, setOverdueBooks] = useState([]);
    const [upcomingDueBooks, setUpcomingDueBooks] = useState([]);
    const [activeBorrowedBooks, setActiveBorrowedBooks] = useState([]);

    useEffect(() => {
        let numberOfTotalBorrowedBooks = userBorrowedBooks.filter(
            (book) => book.returned === false
        );
        let numberOfTotalReturnedBooks = userBorrowedBooks.filter(
            (book) => book.returned === true
        );
        
        setTotalBorrowedBooks(numberOfTotalBorrowedBooks.length);
        setTotalReturnedBooks(numberOfTotalReturnedBooks.length);
        setActiveBorrowedBooks(numberOfTotalBorrowedBooks);
        
        // Filter for overdue books
        const currentDate = new Date();
        const overdueItems = userBorrowedBooks.filter(book => {
            return !book.returned && new Date(book.dueDate) < currentDate;
        });
        setOverdueBooks(overdueItems);
        
        // Filter for books due in the next 3 days
        const threeDaysLater = new Date();
        threeDaysLater.setDate(currentDate.getDate() + 3);
        const upcomingItems = userBorrowedBooks.filter(book => {
            const dueDate = new Date(book.dueDate);
            return !book.returned && dueDate > currentDate && dueDate <= threeDaysLater;
        });
        setUpcomingDueBooks(upcomingItems);
        
    }, [userBorrowedBooks]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    };
    
    // Calculate days remaining or overdue
    const getDaysRemaining = (dueDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        
        const differenceInTime = due.getTime() - today.getTime();
        const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
        
        return differenceInDays;
    };
    
    // Get status color based on days remaining
    const getStatusColor = (daysRemaining) => {
        if (daysRemaining < 0) return "text-red-600";
        if (daysRemaining <= 3) return "text-amber-600";
        return "text-green-600";
    };
    
    // Get status text based on days remaining
    const getStatusText = (daysRemaining) => {
        if (daysRemaining < 0) return `${Math.abs(daysRemaining)} days overdue`;
        if (daysRemaining === 0) return "Due today";
        if (daysRemaining === 1) return "Due tomorrow";
        return `${daysRemaining} days remaining`;
    };

    const pieData = {
        labels: ["Currently Borrowed", "Returned"],
        datasets: [
            {
                data: [totalBorrowedBooks, totalReturnedBooks],
                backgroundColor: ["#334155", "#64748b"],
                hoverBackgroundColor: ["#1e293b", "#475569"],
                borderWidth: 0,
            },
        ],
    };

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
                    },
                    padding: 10,
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.raw} (${Math.round(context.raw / (totalBorrowedBooks + totalReturnedBooks || 1) * 100)}%)`;
                    }
                }
            }
        }
    };

    return (
        <>
            <main className="relative flex-1 p-6 pt-28 bg-gray-50">
                <Header />
                
                {/* User Welcome Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="flex items-center gap-4">
                        {user?.avatar && (
                            <img 
                                src={user.avatar.url} 
                                alt="User avatar" 
                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                            />
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}!</h2>
                            <div className="flex items-center text-gray-600">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>
                                    {new Date().toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </span>
                            </div>
                            <p className="text-gray-600 mt-1">
                                {totalBorrowedBooks > 0 
                                    ? `You currently have ${totalBorrowedBooks} book${totalBorrowedBooks > 1 ? 's' : ''} borrowed.` 
                                    : 'You don\'t have any books borrowed currently.'}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Alerts Section */}
                {(overdueBooks.length > 0 || upcomingDueBooks.length > 0) && (
                    <div className="mb-6">
                        {overdueBooks.length > 0 && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-3 rounded-xl shadow-sm">
                                <div className="flex items-center mb-1">
                                    <AlertTriangle className="w-5 h-5 mr-2" />
                                    <p className="font-bold">Overdue Books</p>
                                </div>
                                <p>You have {overdueBooks.length} overdue book{overdueBooks.length > 1 ? 's' : ''}. Please return as soon as possible.</p>
                                <ul className="mt-2 ml-7 list-disc">
                                    {overdueBooks.slice(0, 2).map((book, index) => (
                                        <li key={index}>{book.bookTitle} (Due: {formatDate(book.dueDate)})</li>
                                    ))}
                                    {overdueBooks.length > 2 && <li>...and {overdueBooks.length - 2} more</li>}
                                </ul>
                            </div>
                        )}
                        
                        {upcomingDueBooks.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl shadow-sm">
                                <div className="flex items-center mb-1">
                                    <Clock className="w-5 h-5 mr-2" />
                                    <p className="font-bold">Books Due Soon</p>
                                </div>
                                <p>You have {upcomingDueBooks.length} book{upcomingDueBooks.length > 1 ? 's' : ''} due in the next 3 days.</p>
                                <ul className="mt-2 ml-7 list-disc">
                                    {upcomingDueBooks.slice(0, 2).map((book, index) => (
                                        <li key={index}>{book.bookTitle} (Due: {formatDate(book.dueDate)})</li>
                                    ))}
                                    {upcomingDueBooks.length > 2 && <li>...and {upcomingDueBooks.length - 2} more</li>}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Currently Borrowed Books */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Currently Borrowed Books</h3>
                            {totalBorrowedBooks > 0 && (
                                <Link 
                                    to="#" 
                                    onClick={() => document.querySelector('[data-component="My Borrowed Books"]')?.click()}
                                    className="text-slate-600 hover:text-slate-800 text-sm font-medium"
                                >
                                    View all
                                </Link>
                            )}
                        </div>
                        
                        {activeBorrowedBooks.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrowed Date</th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {activeBorrowedBooks.slice(0, 5).map((book, index) => {
                                            const daysRemaining = getDaysRemaining(book.dueDate);
                                            const statusColor = getStatusColor(daysRemaining);
                                            const statusText = getStatusText(daysRemaining);
                                            
                                            return (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <BookMarked className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                                                            <div className="ml-1">
                                                                <div className="text-sm font-medium text-gray-900">{book.bookTitle}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(book.borrowedDate)}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(book.dueDate)}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`inline-flex text-xs leading-5 font-semibold ${statusColor}`}>
                                                            {statusText}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                
                                {activeBorrowedBooks.length > 5 && (
                                    <div className="text-center mt-4">
                                        <button 
                                            onClick={() => document.querySelector('[data-component="My Borrowed Books"]')?.click()}
                                            className="text-sm text-slate-600 hover:text-slate-800 font-medium"
                                        >
                                            View all {activeBorrowedBooks.length} borrowed books
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-lg text-center">
                                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600">You don't have any borrowed books at the moment.</p>
                                <button
                                    onClick={() => document.querySelector('[data-component="Books"]')?.click()}
                                    className="mt-3 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 text-sm"
                                >
                                    Browse Books
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Statistics Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Borrowing Summary</h3>
                        
                        {/* Chart container */}
                        <div className="h-52 relative mb-4">
                            <Pie data={pieData} options={pieOptions} />
                        </div>
                        
                        {/* Statistics cards */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="text-xs text-slate-500 mb-1">Currently Borrowed</div>
                                <div className="text-2xl font-bold text-slate-800">{totalBorrowedBooks}</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="text-xs text-slate-500 mb-1">Returned</div>
                                <div className="text-2xl font-bold text-slate-800">{totalReturnedBooks}</div>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <div className="text-xs text-red-500 mb-1">Overdue</div>
                                <div className="text-2xl font-bold text-red-700">{overdueBooks.length}</div>
                            </div>
                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                                <div className="text-xs text-amber-500 mb-1">Due Soon</div>
                                <div className="text-2xl font-bold text-amber-700">{upcomingDueBooks.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Quote Section */}
                <div className="mt-6 bg-slate-900 p-6 rounded-xl shadow-sm text-white">
                    <div className="max-w-3xl mx-auto text-center">
                        <h4 className="text-lg md:text-xl xl:text-2xl font-medium mb-2">
                            &ldquo;Books are a uniquely portable magic. They are the quietest and most constant of friends; they are the most accessible and wisest of counselors, and the most patient of teachers.&rdquo;
                        </h4>
                        <p className="text-slate-300 md:text-lg">~ Stephen King</p>
                    </div>
                </div>
            </main>
        </>
    );
};

export default UserDashboard;
