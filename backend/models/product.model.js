import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    SKU: {
      type: String,
      required: true, 
      unique: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    imageDescription: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    imageProduct: {
      type: String,
      default: null
    },
    category: {
      type: String,
      trim: true,
      default: "N/A"
    },

    color: {
      type: String,
      default: "sans color",
      trim: true,
    },
    size: {
      type: String,
      default: null,
      trim: true,
    },
    brand: {
      type: String,
      default: null,
      trim: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },

  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
      }
    }
  }
);


const Product = mongoose.model("Product", productSchema);
export default Product;
