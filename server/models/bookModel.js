//
import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    image: {
      public_id: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "/public/placeholder.jpg",
      },
    },
    genre: {
      type: String,
      default: "General",
    },
  },
  {
    timestamps: true,
  },
);

export const Book = mongoose.model("Book", bookSchema);
