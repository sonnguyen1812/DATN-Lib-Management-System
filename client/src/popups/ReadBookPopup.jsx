import React from "react";
import { useDispatch } from "react-redux";
import { toggleReadBookPopup } from "../store/slices/popUpSlice";
import placeholderImg from "../assets/placeholder.jpg";

const ReadBookPopup = ({ book }) => {
    const dispatch = useDispatch();
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 p-5 flex items-center justify-center z-50">
            <div className="w-11/12 bg-white rounded-lg shadow-lg sm:w-2/3 md:w-1/2 lg:w-2/5">
                <div className="flex justify-between items-center bg-black text-white px-6 py-4 rounded-t-lg">
                    <h2 className="text-lg font-bold">View Book Info</h2>
                    <button
                        className="text-white text-lg font-bold"
                        onClick={() => dispatch(toggleReadBookPopup())}
                    >
                        &times;
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 mb-4">
                        <div className="md:w-1/3 flex justify-center">
                            <img 
                                src={book?.image?.url || placeholderImg} 
                                alt={book?.title} 
                                className="w-40 h-60 object-cover border rounded-md"
                                onError={(e) => {e.target.src = placeholderImg}}
                            />
                        </div>
                        
                        <div className="md:w-2/3 space-y-4">
                            <div>
                        <label className="block text-gray-700 font-semibold">
                            Book Title
                        </label>
                        <p className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-100">
                                    {book?.title}
                        </p>
                    </div>
                            <div>
                        <label className="block text-gray-700 font-semibold">
                            Author
                        </label>
                        <p className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-100">
                                    {book?.author}
                                </p>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold">
                                    Genre
                                </label>
                                <p className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-100">
                                    {book?.genre || "General"}
                                </p>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold">
                                    Price
                                </label>
                                <p className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-100">
                                    ${book?.price}
                                </p>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold">
                                    Quantity
                                </label>
                                <p className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-100">
                                    {book?.quantity} ({book?.availability ? 'Available' : 'Not Available'})
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-gray-700 font-semibold">
                            Description
                        </label>
                        <p className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 max-h-40 overflow-y-auto">
                            {book?.description}
                        </p>
                    </div>
                </div>
                <div className="flex justify-end px-6 py-4 bg-gray-100 rounded-b-lg">
                    <button
                        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                        type="button"
                        onClick={() => dispatch(toggleReadBookPopup())}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReadBookPopup;
