import React, { useState, useEffect } from "react";
import { BookA } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleReadBookPopup } from "../store/slices/popUpSlice";
import { fetchUserBorrowedBooks, resetBorrowSlice } from "../store/slices/borrowSlice";
import { toast } from "react-toastify";
import Header from "../layout/Header";
import ReadBookPopup from "../popups/ReadBookPopup";

const MyBorrowedBooks = () => {
    const dispatch = useDispatch();

    const { books } = useSelector((state) => state.book);
    const { userBorrowedBooks, loading, message, error } = useSelector((state) => state.borrow);

    const { readBookPopup } = useSelector((state) => state.popup);

    const [readBook, setReadBook] = useState({});
    
    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(fetchUserBorrowedBooks());
            dispatch(resetBorrowSlice());
        }
        if (error) {
            toast.error(error);
            dispatch(resetBorrowSlice());
        }
    }, [dispatch, message, error]);
    
    const openReadPopup = (id) => {
        const book = books.find((book) => book._id === id);
        setReadBook(book);
        dispatch(toggleReadBookPopup());
    };

    const formatDate = (timeStamp) => {
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
    
    const formatDateSimple = (timeStamp) => {
        const date = new Date(timeStamp);
        return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getFullYear())}`;
    };

    const [filter, setFilter] = useState("nonReturned");

    const returnedBooks = userBorrowedBooks?.filter((book) => {
        return book.returned === true;
    });

    const nonReturnedBooks = userBorrowedBooks?.filter((book) => {
        return book.returned === false;
    });

    const booksToDisplay =
        filter === "returned" ? returnedBooks : nonReturnedBooks;

    // Kiểm tra sách quá hạn
    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date();
    };

    return (
        <>
            <main className="relative flex-1 p-6 pt-28">
                <Header />
                {/* Sub Header */}
                <header className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
                    <h2 className="text-xl font-medium md:text-2xl md:font-semibold">
                        Borrowed Books
                    </h2>
                </header>

                <header className="flex flex-col gap-3 sm:flex-row md:items-center">
                    <button
                        className={`relative rounded sm:rounded-tr-none sm:rounded-br-none sm:rounded-tl-lg sm:rounded-bl-lg text-center border-2 font-semibold py-2 w-full sm:w-72 ${
                            filter === "returned"
                                ? "bg-black text-white border-black"
                                : "bg-gray-200 text-black border-gray-200 hover:bg-gray-300"
                        }`}
                        onClick={() => setFilter("returned")}
                    >
                        Returned Books
                    </button>
                    <button
                        className={`relative rounded sm:rounded-tl-none sm:rounded-bl-none sm:rounded-tr-lg sm:rounded-br-lg text-center border-2 font-semibold py-2 w-full sm:w-72 ${
                            filter === "nonReturned"
                                ? "bg-black text-white border-black"
                                : "bg-gray-200 text-black border-gray-200 hover:bg-gray-300"
                        }`}
                        onClick={() => setFilter("nonReturned")}
                    >
                        Non-Returned Books
                    </button>
                </header>

                {booksToDisplay && booksToDisplay.length > 0 ? (
                    <div className="mt-6 overflow-auto bg-white rounded-md shadow-lg">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="px-4 py-2 text-left">ID</th>
                                    <th className="px-4 py-2 text-left">
                                        Book Title
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Date & Time
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Due Date
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Status
                                    </th>
                                    <th className="px-4 py-2 text-center">
                                        Extensions
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        View
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {booksToDisplay.map((book, index) => (
                                    <tr
                                        key={index}
                                        className={
                                            isOverdue(book.dueDate) && !book.returned
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
                                            {book.bookTitle}
                                        </td>
                                        <td className="px-4 py-2">
                                            {formatDate(book.borrowedDate)}
                                        </td>
                                        <td className={`px-4 py-2 ${isOverdue(book.dueDate) && !book.returned ? "text-red-600 font-semibold" : ""}`}>
                                            {formatDate(book.dueDate)}
                                        </td>
                                        <td className="px-4 py-2">
                                            {book.returned ? (
                                                <span className="text-green-600">Returned</span>
                                            ) : isOverdue(book.dueDate) ? (
                                                <span className="text-red-600">Overdue</span>
                                            ) : (
                                                <span className="text-blue-600">Active</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                                {book.extensionCount || 0}/2
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <BookA
                                                onClick={() =>
                                                    openReadPopup(book.bookId)
                                                }
                                                className="cursor-pointer hover:text-blue-600"
                                                size={18}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : filter === "returned" ? (
                    <h3 className="text-3xl mt-5 font-medium">
                        No returned books found!
                    </h3>
                ) : (
                    <h3 className="text-3xl mt-5 font-medium">
                        No non-returned books found!
                    </h3>
                )}
            </main>
            {readBookPopup && <ReadBookPopup book={readBook} />}
        </>
    );
};

export default MyBorrowedBooks;
