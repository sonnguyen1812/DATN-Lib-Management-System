//
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Borrow } from "../models/borrowModel.js";
import { User } from "../models/userModel.js";
import { Book } from "../models/bookModel.js";
import { calculateFine } from "../utils/fineCalculator.js";

export const recordBorrowedBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { email } = req.body;

  const book = await Book.findById(id);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  if (book.quantity === 0) {
    return next(new ErrorHandler("Book not available", 400));
  }
  const isAlreadyBorrowed = user.borrowedBooks.find(
    (b) => b.bookId.toString() === id && b.returned === false,
  );
  if (isAlreadyBorrowed) {
    return next(new ErrorHandler("Book already borrowed", 400));
  }
  book.quantity -= 1;
  book.availability = book.quantity > 0;
  await book.save();

  user.borrowedBooks.push({
    bookId: book._id,
    bookTitle: book.title,
    borrowedDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  });
  await user.save();
  
  // Lưu thêm thông tin sách trong bảng Borrow
  await Borrow.create({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    book: book._id,
    bookTitle: book.title,
    bookAuthor: book.author,
    borrowDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    price: book.price,
  });
  
  res.status(200).json({
    success: true,
    message: "Borrowed book recorded successfully.",
  });
});

export const returnBorrowBook = catchAsyncErrors(async (req, res, next) => {
  const { bookId } = req.params; // Đây thực ra là ID của bản ghi mượn (borrowId)
  const { email } = req.body;

  console.log("Return Book Request - BorrowID:", bookId, "Type:", typeof bookId);
  
  // Tìm bản ghi mượn sách
  const borrow = await Borrow.findById(bookId);
  if (!borrow) {
    return next(new ErrorHandler(`Borrow record not found with ID: ${bookId}`, 404));
  }
  
  // Kiểm tra email
  if (borrow.user.email !== email) {
    return next(new ErrorHandler("User email does not match borrow record", 400));
  }
  
  // Tìm sách
  const book = await Book.findById(borrow.book);
  if (!book) {
    return next(new ErrorHandler(`Book not found with ID: ${borrow.book}`, 404));
  }
  
  // Tìm user
  const user = await User.findById(borrow.user.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  // Cập nhật thông tin mượn sách trong user
  const borrowedBook = user.borrowedBooks.find(
    (b) => b.bookId.toString() === borrow.book.toString() && b.returned === false,
  );
  
  if (borrowedBook) {
    borrowedBook.returned = true;
    await user.save();
  }

  // Cập nhật số lượng sách
  book.quantity += 1;
  book.availability = book.quantity > 0;
  await book.save();

  // Cập nhật thông tin trả sách
  if (borrow.returnDate) {
    return next(new ErrorHandler("This book has already been returned", 400));
  }
  
  borrow.returnDate = new Date();
  const fine = calculateFine(borrow.dueDate);
  borrow.fine = fine;
  await borrow.save();
  
  res.status(200).json({
    success: true,
    message:
      fine !== 0
        ? `The book has been returned successfully. The total charges, including a fine, are $${fine + book.price}`
        : `The book has been returned successfully. The total charges are $${book.price}`,
  });
});

export const borrowedBooks = catchAsyncErrors(async (req, res, next) => {
  const { borrowedBooks } = req.user;
  res.status(200).json({
    success: true,
    borrowedBooks,
  });
});

export const getBorrowedBooksForAdmin = catchAsyncErrors(
  async (req, res, next) => {
    const borrowedBooks = await Borrow.find().populate({
      path: "book",
      select: "title author price image"
    });
    
    // Thêm bookTitle vào mỗi đối tượng borrow từ document book đã populate
    const borrowsWithTitle = borrowedBooks.map(borrow => {
      const borrowObj = borrow.toObject();
      borrowObj.bookTitle = borrow.book ? borrow.book.title : "Unknown Book";
      borrowObj.bookAuthor = borrow.book ? borrow.book.author : "Unknown Author";
      borrowObj.bookImage = borrow.book ? borrow.book.image : null;
      return borrowObj;
    });
    
    res.status(200).json({
      success: true,
      borrowedBooks: borrowsWithTitle,
    });
  },
);

export const extendBorrowPeriod = catchAsyncErrors(async (req, res, next) => {
  const { borrowId } = req.params;
  
  // Tìm bản ghi mượn sách
  const borrow = await Borrow.findById(borrowId);
  if (!borrow) {
    return next(new ErrorHandler(`Borrow record not found with ID: ${borrowId}`, 404));
  }
  
  // Kiểm tra xem người dùng có quyền gia hạn không
  if (borrow.user.id.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
    return next(new ErrorHandler("You are not authorized to extend this borrow period", 403));
  }
  
  // Kiểm tra xem đã trả sách chưa
  if (borrow.returnDate) {
    return next(new ErrorHandler("Cannot extend period for a returned book", 400));
  }
  
  // Kiểm tra xem đã gia hạn quá 2 lần chưa
  if (borrow.extensionCount >= 2) {
    return next(new ErrorHandler("You have reached the maximum number of extensions (2)", 400));
  }
  
  // Kiểm tra xem có đang quá hạn không
  const currentDate = new Date();
  if (currentDate > borrow.dueDate) {
    return next(new ErrorHandler("Cannot extend period for an overdue book. Please return the book first.", 400));
  }
  
  // Cập nhật ngày hạn trả
  const newDueDate = new Date(borrow.dueDate);
  newDueDate.setDate(newDueDate.getDate() + 7); // Thêm 7 ngày
  
  borrow.dueDate = newDueDate;
  borrow.extensionCount = (borrow.extensionCount || 0) + 1;
  
  await borrow.save();
  
  // Cập nhật thông tin mượn trong user model
  const user = await User.findById(borrow.user.id);
  if (user) {
    const borrowedBook = user.borrowedBooks.find(
      (b) => b.bookId.toString() === borrow.book.toString() && b.returned === false
    );
    
    if (borrowedBook) {
      borrowedBook.dueDate = newDueDate;
      await user.save();
    }
  }
  
  res.status(200).json({
    success: true,
    message: `Borrow period extended successfully. New due date: ${newDueDate.toDateString()}`,
    borrow
  });
});
