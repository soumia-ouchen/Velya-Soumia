import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// Helper function to delete temporary files
const deleteTempFiles = (files) => {
  if (files) {
    if (Array.isArray(files)) {
      files.forEach(file => fs.unlinkSync(file.path));
    } else {
      fs.unlinkSync(files.path);
    }
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { SKU, name, description, price, category, color, size, brand, isFeatured } = req.body;
    let imageProductUrl = null;
    let imageDescriptionUrl = null;

    // Upload product image if provided
    if (req.files?.imageProduct) {
      const result = await cloudinary.uploader.upload(req.files.imageProduct[0].path, {
        folder: "products",
      });
      imageProductUrl = result.secure_url;
    }

    // Upload description image if provided
    if (req.files?.imageDescription) {
      const result = await cloudinary.uploader.upload(req.files.imageDescription[0].path, {
        folder: "products/descriptions",
      });
      imageDescriptionUrl = result.secure_url;
    }

    // Delete temporary files after upload
    deleteTempFiles(req.files?.imageProduct);
    deleteTempFiles(req.files?.imageDescription);

    const newProduct = new Product({
      SKU,
      name,
      description,
      price,
      imageProduct: imageProductUrl,
      imageDescription: imageDescriptionUrl,
      category,
      color,
      size,
      brand,
      isFeatured: isFeatured || false,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    // Clean up uploaded files if error occurs
    if (req.files) {
      deleteTempFiles(req.files.imageProduct);
      deleteTempFiles(req.files.imageDescription);
    }
    res.status(400).json({ message: error.message });
  }
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    
    
    const products = await Product.find().sort({ createdAt: -1 });
    
    res.json({
      products,
  
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/*
export const getAllProducts = async (req, res) => {
  try {
    const { featured, active, category, brand, search, sort, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (featured) query.isFeatured = featured === 'true';
    if (active) query.isActive = active === 'true';
    if (category) query.category = category;
    if (brand) query.brand = brand;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { SKU: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sortOptions = {};
    if (sort) {
      const sortFields = sort.split(',');
      sortFields.forEach(field => {
        const [key, order] = field.split(':');
        sortOptions[key] = order === 'desc' ? -1 : 1;
      });
    } else {
      sortOptions.createdAt = -1; // Default sort by newest
    }
    
    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
*/
// Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single product by SKU
export const getProductBySKU = async (req, res) => {
  try {
    const product = await Product.findOne({ SKU: req.params.sku.toUpperCase() });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ SKU: req.params.SKU });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updates = req.body;
    let imageProductUrl = product.imageProduct;
    let imageDescriptionUrl = product.imageDescription;

    // Handle product image update
    if (req.files?.imageProduct) {

      
      const result = await cloudinary.uploader.upload(req.files.imageProduct[0].path, {
        folder: "products",
      });
      imageProductUrl = result.secure_url;
    }

    // Handle description image update
    if (req.files?.imageDescription) {

      const result = await cloudinary.uploader.upload(req.files.imageDescription[0].path, {
        folder: "products/descriptions",
      });
      imageDescriptionUrl = result.secure_url;
    }

    // Update product fields
    Object.keys(updates).forEach(key => {
      if (key !== 'imageProduct' && key !== 'imageDescription') {
        product[key] = updates[key];
      }
    });

    product.imageProduct = imageProductUrl;
    product.imageDescription = imageDescriptionUrl;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    // Clean up uploaded files if error occurs
    if (req.files) {
      deleteTempFiles(req.files.imageProduct);
      deleteTempFiles(req.files.imageDescription);
    }
    res.status(400).json({ message: error.message });
  }
};

// Toggle product active status
export const toggleProductActive = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isFeatured = !product.isFeatured;
    const updatedProduct = await product.save();

    res.json({
      ...updatedProduct._doc,
      message: `Produit ${updatedProduct.isFeatured ? 'activé' : 'désactivé'} avec succès`
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      error: true
    });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ SKU: req.params.SKU });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete images from Cloudinary if they exist
    if (product.imageProduct) {
      const publicId = product.imageProduct.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`products/${publicId}`);
    }
    
    if (product.imageDescription) {
      const publicId = product.imageDescription.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`products/descriptions/${publicId}`);
    }

    await Product.deleteOne({ SKU: req.params.SKU });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find({ isFeatured: true, isActive: true })
      .limit(limit)
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10, sort } = req.query;
    
    const sortOptions = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions[field] = order === 'desc' ? -1 : 1;
    }
    
    const products = await Product.find({ 
      category, 
      isActive: true 
    })
    .sort(sortOptions)
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Product.countDocuments({ category, isActive: true });
    
    res.json({
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    }).limit(10);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};