import { useEffect, useState } from "react";
import returnIcon from "../assets/redo.png";
import browseIcon from "../assets/pointing.png";
import bookIcon from "../assets/book-square.png";
import { Pie } from "react-chartjs-2";
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
import logo from "../assets/black-logo.png";

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

    useEffect(() => {
        let numberOfTotalBorrowedBooks = userBorrowedBooks.filter(
            (book) => book.returned === false
        );
        let numberOfTotalReturnedBooks = userBorrowedBooks.filter(
            (book) => book.returned === true
        );
        
        setTotalBorrowedBooks(numberOfTotalBorrowedBooks.length);
        setTotalReturnedBooks(numberOfTotalReturnedBooks.length);
        
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

    const data = {
        labels: ["Borrowed Books", "Returned Books"],
        datasets: [
            {
                data: [totalBorrowedBooks, totalReturnedBooks],
                backgroundColor: ["#3D3E3E", "#151619"],
                hoverOffset: 4,
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.raw}`;
                    }
                }
            }
        }
    };

    return (
        <>
            <main className="relative flex-1 p-6 pt-28">
                <Header />
                
                {/* User Welcome Section */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <div className="flex items-center gap-4">
                        {user?.avatar && (
                            <img 
                                src={user.avatar.url} 
                                alt="User avatar" 
                                className="w-16 h-16 rounded-full object-cover"
                            />
                        )}
                        <div>
                            <h2 className="text-2xl font-bold">Welcome, {user?.name}!</h2>
                            <p className="text-gray-600">
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
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-3 rounded shadow-md">
                                <div className="flex items-center mb-1">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
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
                            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md">
                                <div className="flex items-center mb-1">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.35 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
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
                
                <div className="flex flex-col xl:flex-row gap-6">
                    {/* LEFT SIDE */}
                    <div className="flex-[3] flex flex-col gap-7">
                        <div className="flex flex-col gap-7">
                            <h3 className="text-xl font-semibold mb-2">Quick Actions</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Quick Action Cards */}
                                <div onClick={() => {
                                    document.querySelector('[data-component="My Borrowed Books"]')?.click();
                                }} className="flex items-center gap-3 bg-white p-5 h-32 rounded-lg transition hover:bg-gray-50 hover:shadow-md cursor-pointer">
                                    <span className="w-[3px] bg-black h-full"></span>
                                    <span className="bg-gray-200 h-16 w-16 flex justify-center items-center rounded-lg">
                                        <img
                                            src={bookIcon}
                                            alt="book-icon"
                                            className="w-8 h-8"
                                        />
                                    </span>
                                    <div>
                                        <p className="text-lg font-semibold">Borrowed Books</p>
                                        <p className="text-gray-600 text-sm">View and manage your borrowed books</p>
                                    </div>
                                </div>
                                
                                <div onClick={() => {
                                    document.querySelector('[data-component="Catalog"]')?.click();
                                }} className="flex items-center gap-3 bg-white p-5 h-32 rounded-lg transition hover:bg-gray-50 hover:shadow-md cursor-pointer">
                                    <span className="w-[3px] bg-black h-full"></span>
                                    <span className="bg-gray-200 h-16 w-16 flex justify-center items-center rounded-lg">
                                        <img
                                            src={browseIcon}
                                            alt="catalog-icon"
                                            className="w-8 h-8"
                                        />
                                    </span>
                                    <div>
                                        <p className="text-lg font-semibold">Browse Catalog</p>
                                        <p className="text-gray-600 text-sm">Explore our collection of books</p>
                                    </div>
                                </div>
                                
                                <div onClick={() => {
                                    document.querySelector('[data-popup="settingPopup"]')?.click();
                                }} className="flex items-center gap-3 bg-white p-5 h-32 rounded-lg transition hover:bg-gray-50 hover:shadow-md cursor-pointer">
                                    <span className="w-[3px] bg-black h-full"></span>
                                    <span className="bg-gray-200 h-16 w-16 flex justify-center items-center rounded-lg">
                                        <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        </svg>
                                    </span>
                                    <div>
                                        <p className="text-lg font-semibold">Settings</p>
                                        <p className="text-gray-600 text-sm">Update your profile and preferences</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 bg-white p-5 h-32 rounded-lg transition hover:bg-gray-50 hover:shadow-md cursor-pointer">
                                    <span className="w-[3px] bg-black h-full"></span>
                                    <span className="bg-gray-200 h-16 w-16 flex justify-center items-center rounded-lg">
                                        <img
                                            src={returnIcon}
                                            alt="history-icon"
                                            className="w-8 h-8"
                                        />
                                    </span>
                                    <div>
                                        <p className="text-lg font-semibold">Borrow History</p>
                                        <p className="text-gray-600 text-sm">View your complete borrowing history</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-7 text-lg sm:text-xl xl:text-2xl min-h-52 font-semibold relative flex justify-center items-center rounded-2xl mt-6">
                            <h4 className="overflow-y-hidden text-center">
                                &ldquo;Books are a uniquely portable magic. They are the quietest and most constant of friends; they are the most accessible and wisest of counselors, and the most patient of teachers.&rdquo;
                            </h4>
                            <p className="text-gray-700 text-sm sm:text-lg absolute right-[35px] sm:right-[35px] bottom-[20px]">
                                ~ Stephen King
                            </p>
                        </div>
                    </div>
                    
                    {/* RIGHT SIDE - Statistics */}
                    <div className="flex-1 bg-white p-6 rounded-lg shadow-md h-fit">
                        <h3 className="text-lg font-semibold mb-4 text-center">Your Borrowing Summary</h3>
                        
                        {/* Chart container with fixed height */}
                        <div className="mx-auto mb-6" style={{ height: '200px', position: 'relative', maxWidth: '200px' }}>
                            <Pie
                                data={data}
                                options={options}
                                height={200}
                                width={200}
                            />
                        </div>
                        
                        {/* Legend */}
                        <div className="flex flex-col gap-3 mt-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-[#3D3E3E]"></span>
                                    <span>Borrowed</span>
                                </div>
                                <span className="font-bold">{totalBorrowedBooks}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-[#151619]"></span>
                                    <span>Returned</span>
                                </div>
                                <span className="font-bold">{totalReturnedBooks}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                    <span>Overdue</span>
                                </div>
                                <span className="font-bold">{overdueBooks.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default UserDashboard;
