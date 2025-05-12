import { useEffect, useState } from "react";
import { PiKeyReturnBold } from "react-icons/pi";
import { FaSquareCheck } from "react-icons/fa6";
import { Calendar } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleReturnBookPopup } from "../store/slices/popUpSlice";
import { toast } from "react-toastify";
import { fetchAllBooks, resetBookSlice } from "../store/slices/bookSlice";
import {
    fetchAllBorrowedBooks,
    resetBorrowSlice,
    extendBorrowPeriod
} from "../store/slices/borrowSlice";
import { fetchAllUsers } from "../store/slices/userSlice";
import ReturnBookPopup from "../popups/ReturnBookPopup";
import Header from "../layout/Header";

const Catalog = () => {
    const dispatch = useDispatch();

    const { returnBookPopup } = useSelector((state) => state.popup);
    const { loading, error, allBorrowedBooks, message } =
        useSelector((state) => state.borrow);
    const [filter, setFilter] = useState("borrowed");
    const [extendingBook, setExtendingBook] = useState(null);

    const formatDateAndTime = (timeStamp) => {
        const date = new Date(timeStamp);
        const formattedDate = `${String(date.getDate()).padStart(
            2,
            "0"
        )}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
            date.getFullYear()
        )}`;
        const formattedTime = `${String(date.getHours()).padStart(
            2,
            "0"
        )}:${String(date.getMinutes()).padStart(2, "0")}:${String(
            date.getSeconds()
        ).padStart(2, "0")}`;
        const result = `${formattedDate} ${formattedTime}`;
        return result;
    };

    const formatDate = (timeStamp) => {
        const date = new Date(timeStamp);
        return `${String(date.getDate()).padStart(2, "0")}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getFullYear())}`;
    };
    
    // Tính tiền phạt cho sách quá hạn
    const calculateCurrentFine = (dueDate) => {
        const finePerHour = 0.1; // 10 cents per hour
        const today = new Date();
        const dueDateObj = new Date(dueDate);
        
        if (today > dueDateObj) {
            const lateHours = Math.ceil((today - dueDateObj) / (1000 * 60 * 60));
            const fine = parseFloat((lateHours * finePerHour).toFixed(2));
            return fine;
        }
        return 0;
    };

    const CurrentDate = new Date();

    const borrowedBooks = allBorrowedBooks?.filter((book) => {
        const dueDate = new Date(book.dueDate);
        return dueDate > CurrentDate && !book.returnDate;
    });

    const overdueBooks = allBorrowedBooks?.filter((book) => {
        const dueDate = new Date(book.dueDate);
        return dueDate <= CurrentDate && !book.returnDate;
    });

    const booksToDisplay = filter === "borrowed" ? borrowedBooks : overdueBooks;

    const [email, setEmail] = useState("");
    const [borrowedBookId, setBorrowedBookId] = useState("");
    const openReturnBookPopup = (bookId, email) => {
        if (typeof bookId === 'object' && bookId !== null) {
            bookId = bookId._id || bookId.toString();
        }
        
        setBorrowedBookId(bookId);
        setEmail(email);
        dispatch(toggleReturnBookPopup());
    };
    
    const handleExtendPeriod = (borrowId) => {
        if (loading) return;
        setExtendingBook(borrowId);
        dispatch(extendBorrowPeriod(borrowId));
    };

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(fetchAllBooks());
            dispatch(fetchAllBorrowedBooks());
            dispatch(fetchAllUsers());
            dispatch(resetBookSlice());
            dispatch(resetBorrowSlice());
            setExtendingBook(null);
        }
        if (error) {
            toast.error(error);
            dispatch(resetBorrowSlice());
            setExtendingBook(null);
        }
    }, [dispatch, error, message, loading]);

    return (
        <>
            <main className="relative flex-1 p-6 pt-28">
                <Header />
                {/* Sub Header */}

                <header className="flex flex-col gap-3 sm:flex-row md:items-center">
                    <button
                        className={`relative rounded sm:rounded-tr-none sm:rounded-br-none sm:rounded-tl-lg sm:rounded-bl-lg text-center border-2 font-semibold py-2 w-full sm:w-72 ${
                            filter === "borrowed"
                                ? "bg-black text-white border-black"
                                : "bg-gray-200 text-black border-gray-200 hover:bg-gray-300"
                        }`}
                        onClick={() => setFilter("borrowed")}
                    >
                        Borrowed Books
                    </button>
                    <button
                        className={`relative rounded sm:rounded-tl-none sm:rounded-bl-none sm:rounded-tr-lg sm:rounded-br-lg text-center border-2 font-semibold py-2 w-full sm:w-72 ${
                            filter === "overdue"
                                ? "bg-black text-white border-black"
                                : "bg-gray-200 text-black border-gray-200 hover:bg-gray-300"
                        }`}
                        onClick={() => setFilter("overdue")}
                    >
                        Overdue Borrowers
                    </button>
                </header>

                {booksToDisplay && booksToDisplay.length > 0 ? (
                    <div className="mt-6 overflow-auto bg-white rounded-md shadow-lg">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="px-4 py-2 text-left">ID</th>
                                    <th className="px-4 py-2 text-left">
                                        Borrower
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Email
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Book Title
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Author
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Price
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Due Date
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Borrowed Date
                                    </th>
                                    {filter === "overdue" && (
                                        <th className="px-4 py-2 text-left">
                                            Fine
                                        </th>
                                    )}
                                    <th className="px-4 py-2 text-center">
                                        Extensions
                                    </th>
                                    <th className="px-4 py-2 text-center w-28">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {booksToDisplay.map((book, index) => (
                                    <tr
                                        key={index}
                                        className={
                                            filter === "overdue"
                                                ? "bg-red-50"
                                                : (index + 1) % 2 === 0
                                                ? "bg-gray-50"
                                                : ""
                                        }
                                    >
                                        <td className="px-4 py-2">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-2">
                                            {book?.user.name}
                                        </td>
                                        <td className="px-4 py-2">
                                            {book?.user.email}
                                        </td>
                                        <td className="px-4 py-2">
                                            {book?.bookTitle || "Unknown Book"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {book?.bookAuthor || "Unknown Author"}
                                        </td>
                                        <td className="px-4 py-2">
                                            ${book.price}
                                        </td>
                                        <td className={`px-4 py-2 ${filter === "overdue" ? "text-red-600 font-semibold" : ""}`}>
                                            {formatDate(book.dueDate)}
                                        </td>
                                        <td className="px-4 py-2">
                                            {formatDateAndTime(book.borrowDate || book.createdAt)}
                                        </td>
                                        {filter === "overdue" && (
                                            <td className="px-4 py-2 text-red-600 font-medium">
                                                ${book.returnDate ? book.fine : calculateCurrentFine(book.dueDate)}
                                            </td>
                                        )}
                                        <td className="px-4 py-2 text-center">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                                {book.extensionCount || 0}/2
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <div className="flex gap-2 justify-center">
                                                {!book.returnDate && (
                                                    <>
                                                        <button
                                                            onClick={() => handleExtendPeriod(book._id)}
                                                            disabled={loading || filter === "overdue" || book.extensionCount >= 2}
                                                            className={`p-1.5 rounded-full flex items-center justify-center ${
                                                                filter === "overdue" || book.extensionCount >= 2
                                                                    ? "bg-gray-200 cursor-not-allowed text-gray-500"
                                                                    : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                                                            }`}
                                                            title={
                                                                filter === "overdue"
                                                                    ? "Cannot extend overdue books"
                                                                    : book.extensionCount >= 2
                                                                    ? "Maximum extensions reached (2)"
                                                                    : "Extend by 7 days"
                                                            }
                                                        >
                                                            {loading && extendingBook === book._id ? 
                                                                <span className="animate-pulse">...</span> :
                                                                <Calendar size={16} />
                                                            }
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                console.log("Book object:", book);
                                                                openReturnBookPopup(book._id, book.user.email);
                                                            }}
                                                            className="p-1.5 rounded-full flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-700"
                                                            title="Return book"
                                                        >
                                                            <PiKeyReturnBold size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {book.returnDate && (
                                                    <span className="text-green-600 flex items-center gap-1">
                                                        <FaSquareCheck size={16} /> Returned
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="mt-6 flex justify-center">
                        <h3 className="text-xl font-semibold">
                            {filter === "borrowed" 
                                ? "No borrowed books found." 
                                : "No overdue books found."}
                        </h3>
                    </div>
                )}

                {returnBookPopup && (
                    <ReturnBookPopup
                        bookId={borrowedBookId}
                        email={email}
                    />
                )}
            </main>
        </>
    );
};

export default Catalog;
