// import express from "express";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Book } from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import cloudinary from "cloudinary";

export const addBook = catchAsyncErrors(async (req, res, next) => {
  const { title, author, description, price, quantity, genre } = req.body;

  if (!title || !author || !description || !price || !quantity) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }

  const bookData = {
    title,
    author,
    description,
    price,
    quantity,
    genre: genre || "General",
    availability: quantity > 0,
  };

  // Upload image if provided
  if (req.files && req.files.image) {
    const file = req.files.image;
    
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "library/books",
    });

    bookData.image = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  const book = await Book.create(bookData);

  res.status(201).json({
    success: true,
    message: "Book added successfully",
    book,
  });
});

export const getAllBooks = catchAsyncErrors(async (req, res, next) => {
  const books = await Book.find();
  res.status(200).json({
    success: true,
    books,
  });
});

export const deleteBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const book = await Book.findById(id);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }
  
  // Delete image from cloudinary if exists
  if (book.image && book.image.public_id) {
    await cloudinary.v2.uploader.destroy(book.image.public_id);
  }
  
  await book.deleteOne();
  res.status(200).json({
    success: true,
    message: "Book deleted successfully",
  });
});

export const updateBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { title, author, description, price, quantity, genre } = req.body;

  const book = await Book.findById(id);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  // Update book fields if provided
  if (title) book.title = title;
  if (author) book.author = author;
  if (description) book.description = description;
  if (price) book.price = price;
  if (quantity !== undefined) {
    book.quantity = quantity;
    // Update availability based on quantity
    book.availability = quantity > 0;
  }
  if (genre) book.genre = genre;

  // Update image if provided
  if (req.files && req.files.image) {
    // Delete previous image
    if (book.image && book.image.public_id) {
      await cloudinary.v2.uploader.destroy(book.image.public_id);
    }

    const file = req.files.image;
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "library/books",
    });

    book.image = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  await book.save();

  res.status(200).json({
    success: true,
    message: "Book updated successfully",
    book,
  });
});
