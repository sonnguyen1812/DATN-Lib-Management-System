import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateBook } from "../store/slices/bookSlice";
import { toggleEditBookPopup } from "../store/slices/popUpSlice";
import placeholderImg from "../assets/placeholder.jpg";

const EditBookPopup = ({ book }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.book);

    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [description, setDescription] = useState("");
    const [genre, setGenre] = useState("General");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (book) {
            setTitle(book.title || "");
            setAuthor(book.author || "");
            setPrice(book.price || "");
            setQuantity(book.quantity || "");
            setDescription(book.description || "");
            setGenre(book.genre || "General");
            setImagePreview(book.image?.url || null);
        }
    }, [book]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setImage(file);
        }
    };

    const handleUpdateBook = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", title);
        formData.append("author", author);
        formData.append("price", price);
        formData.append("quantity", quantity);
        formData.append("description", description);
        formData.append("genre", genre);
        if(image) {
            formData.append("image", image);
        }
        dispatch(updateBook(book._id, formData));
    };

    const genres = [
        "General",
        "Fiction",
        "Non-Fiction",
        "Science Fiction",
        "Fantasy",
        "Mystery",
        "Thriller",
        "Romance",
        "Biography",
        "History",
        "Self-Help",
        "Business",
        "Children",
        "Young Adult",
        "Poetry",
        "Other"
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 p-5 flex items-center justify-center z-50">
            <div className="w-full bg-white rounded-lg shadow-lg md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">Edit Book</h3>
                    <form onSubmit={handleUpdateBook} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-1 space-y-4">
                            <div>
                                <label className="block text-gray-900 font-medium">
                                    Book Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Book Title"
                                    className="w-full px-4 py-2 border-2 border-black rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-900 font-medium">
                                    Book Author
                                </label>
                                <input
                                    type="text"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    placeholder="Book's Author"
                                    className="w-full px-4 py-2 border-2 border-black rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-900 font-medium">
                                    Genre
                                </label>
                                <select 
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-black rounded-md"
                                >
                                    {genres.map((g) => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-900 font-medium">
                                    Book Price (Price for borrowing)
                                </label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="Book Price"
                                    className="w-full px-4 py-2 border-2 border-black rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-900 font-medium">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="Book Quantity"
                                    className="w-full px-4 py-2 border-2 border-black rounded-md"
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-1 space-y-4">
                            <div>
                                <label className="block text-gray-900 font-medium">
                                    Book Cover Image
                                </label>
                                <div className="mt-2 flex flex-col items-center">
                                    <img 
                                        src={imagePreview || placeholderImg} 
                                        alt="Book cover preview" 
                                        className="w-40 h-60 object-cover border rounded-md mb-2"
                                        onError={(e) => {e.target.src = placeholderImg}}
                                    />
                                    <label className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded cursor-pointer">
                                        <span>Change Image</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-900 font-medium">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Book's Description"
                                    rows={7}
                                    className="w-full px-4 py-2 border border-black rounded-md"
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end space-x-4 mt-4">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                                type="button"
                                onClick={() => dispatch(toggleEditBookPopup())}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Update Book"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditBookPopup; 