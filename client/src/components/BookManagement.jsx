import React, { useEffect, useState } from "react";
import { Edit, Trash2, BookOpen, PlusCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
    toggleAddBookPopup,
    toggleReadBookPopup,
    toggleRecordBookPopup,
    toggleEditBookPopup,
} from "../store/slices/popUpSlice";
import { toast } from "react-toastify";
import { fetchAllBooks, resetBookSlice, deleteBook } from "../store/slices/bookSlice";
import {
    fetchAllBorrowedBooks,
    resetBorrowSlice,
} from "../store/slices/borrowSlice";
import { DEFAULT_BOOK_IMAGE } from "../utils/constants";
import Header from "../layout/Header";
import AddBookPopup from "../popups/AddBookPopup";
import ReadBookPopup from "../popups/ReadBookPopup";
import RecordBookPopup from "../popups/RecordBookPopup";
import EditBookPopup from "../popups/EditBookPopup";
import placeholderImg from "../assets/placeholder.jpg";

const BookManagement = () => {
    const dispatch = useDispatch();

    const { loading, error, message, books } = useSelector(
        (state) => state.book
    );
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { addBookPopup, readBookPopup, recordBookPopup, editBookPopup } = useSelector(
        (state) => state.popup
    );
    const {
        loading: borrowSliceLoading,
        error: borrowSliceError,
        message: borrowSliceMessage,
    } = useSelector((state) => state.borrow);

    const [selectedBook, setSelectedBook] = useState(null);
    const [borrowBookId, setBorrowBookId] = useState("");
    const [searchedKeyword, setSearchedKeyword] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("All");
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Open popups handlers
    const openReadPopup = (book) => {
        setSelectedBook(book);
        dispatch(toggleReadBookPopup());
    };

    const openEditPopup = (book) => {
        setSelectedBook(book);
        dispatch(toggleEditBookPopup());
    };

    const openRecordBookPopup = (bookId) => {
        setBorrowBookId(bookId);
        dispatch(toggleRecordBookPopup());
    };

    const handleDeleteConfirm = (bookId) => {
        setConfirmDelete(bookId);
    };

    const confirmDeleteBook = () => {
        if (confirmDelete) {
            dispatch(deleteBook(confirmDelete));
            setConfirmDelete(null);
        }
    };

    const cancelDelete = () => {
        setConfirmDelete(null);
    };

    useEffect(() => {
        if (message || borrowSliceMessage) {
            toast.success(message || borrowSliceMessage);
            dispatch(fetchAllBooks());
            dispatch(fetchAllBorrowedBooks());
            dispatch(resetBookSlice());
            dispatch(resetBorrowSlice());
        }
        if (error || borrowSliceError) {
            toast.error(error || borrowSliceError);
            dispatch(resetBookSlice());
            dispatch(resetBorrowSlice());
        }
    }, [
        dispatch,
        message,
        error,
        loading,
        borrowSliceError,
        borrowSliceLoading,
        borrowSliceMessage,
    ]);

    const handleSearch = (e) => {
        setSearchedKeyword(e.target.value.toLowerCase());
    };

    const handleGenreFilter = (e) => {
        setSelectedGenre(e.target.value);
    };

    // Filter books by search and genre
    const filteredBooks = books.filter((book) => {
        const matchesSearch = book.title.toLowerCase().includes(searchedKeyword) || 
                           book.author.toLowerCase().includes(searchedKeyword);
        const matchesGenre = selectedGenre === "All" || book.genre === selectedGenre;
        return matchesSearch && matchesGenre;
    });

    // Get unique genres for filter dropdown
    const genres = ["All", ...new Set(books.map(book => book.genre || "General"))];

    return (
        <>
            <main className="relative flex-1 p-6 pt-28">
                <Header />

                {/* Sub Header */}
                <header className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mb-6">
                    <h2 className="text-xl font-medium md:text-2xl md:font-semibold">
                        {user && user.role === "Admin"
                            ? "Book Management"
                            : "Books Catalog"}
                    </h2>
                    <div className="flex flex-col lg:flex-row gap-3">
                        {isAuthenticated && user?.role === "Admin" && (
                            <button
                                onClick={() => dispatch(toggleAddBookPopup())}
                                className="flex gap-2 justify-center items-center py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800"
                            >
                                <PlusCircle size={18} />
                                Add Book
                            </button>
                        )}
                        
                        <select
                            value={selectedGenre}
                            onChange={handleGenreFilter}
                            className="px-4 py-2 border border-gray-300 rounded-md"
                        >
                            {genres.map(genre => (
                                <option key={genre} value={genre}>{genre}</option>
                            ))}
                        </select>

                        <input
                            type="text"
                            placeholder="Search by title or author..."
                            className="px-4 py-2 border border-gray-300 rounded-md"
                            value={searchedKeyword}
                            onChange={handleSearch}
                        />
                    </div>
                </header>

                {/* Books grid */}
                {filteredBooks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredBooks.map((book) => (
                            <div key={book._id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                                {/* Book cover */}
                                <div className="h-60 overflow-hidden">
                                    <img 
                                        src={book.image?.url || placeholderImg} 
                                        alt={book.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                                        onError={(e) => {e.target.src = placeholderImg}}
                                    />
                                </div>
                                
                                {/* Book details */}
                                <div className="p-4 flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-lg line-clamp-2">{book.title}</h3>
                                        <span className="bg-gray-100 text-xs px-2 py-1 rounded">
                                            {book.genre || "General"}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-sm mb-2">By {book.author}</p>
                                    <p className="text-gray-600 text-xs line-clamp-3 mb-3">{book.description}</p>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium">${book.price}</span>
                                        <span className={`${book.availability ? 'text-green-600' : 'text-red-600'}`}>
                                            {book.availability ? `Available (${book.quantity})` : 'Not Available'}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Action buttons */}
                                <div className="p-3 bg-gray-50 border-t flex justify-between">
                                    <button 
                                        onClick={() => openReadPopup(book)}
                                        className="text-gray-600 hover:text-blue-600"
                                        title="View Details"
                                    >
                                        <BookOpen size={18} />
                                    </button>
                                    
                                    {isAuthenticated && user?.role === "Admin" && (
                                        <>
                                            <button 
                                                onClick={() => openRecordBookPopup(book._id)}
                                                className="text-gray-600 hover:text-green-600"
                                                title="Record Borrowing"
                                            >
                                                <PlusCircle size={18} />
                                            </button>
                                            
                                            <button 
                                                onClick={() => openEditPopup(book)}
                                                className="text-gray-600 hover:text-orange-600"
                                                title="Edit Book"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleDeleteConfirm(book._id)}
                                                className="text-gray-600 hover:text-red-600"
                                                title="Delete Book"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
                        <h3 className="text-2xl font-medium mb-3">No books found</h3>
                        <p className="text-gray-600">Try adjusting your search or filters</p>
                    </div>
                )}

                {/* Popups */}
                {addBookPopup && <AddBookPopup />}
                {readBookPopup && <ReadBookPopup book={selectedBook} />}
                {recordBookPopup && <RecordBookPopup bookId={borrowBookId} />}
                {editBookPopup && <EditBookPopup book={selectedBook} />}

                {/* Delete confirmation dialog */}
                {confirmDelete && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-lg font-bold mb-4">Delete Confirmation</h3>
                            <p className="mb-6">Are you sure you want to delete this book? This action cannot be undone.</p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteBook}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
};

export default BookManagement;
