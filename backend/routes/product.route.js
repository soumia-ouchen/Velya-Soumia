import express from "express";
import * as productController from "../controllers/product.controller.js";
import multer from "multer";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit (comme indiqué dans votre commentaire)
});

// Product routes
router.route("/")
  .post(
    upload.fields([
      { name: 'imageProduct', maxCount: 1 },
      { name: 'imageDescription', maxCount: 1 } 
    ]),
    productController.createProduct
  )
  .get(productController.getAllProducts);

router.route("/featured")
  .get(productController.getFeaturedProducts);

router.route("/search")
  .get(productController.searchProducts);

router.route("/category/:category")
  .get(productController.getProductsByCategory);

router.route("/:id")
  .get(productController.getProductById)

router.route("/:SKU")
  .put(upload.fields([
    { name: 'imageProduct', maxCount: 1 },
    { name: 'imageDescription', maxCount: 1 }
  ]),
    productController.updateProduct);

router.route("/sku/:sku")
  .get(productController.getProductBySKU);

router.route("/:id/toggle-active")
  .put(productController.toggleProductActive);

router.route("/:SKU")
  .delete(productController.deleteProduct);

router.patch('/:id/toggle-active', productController.toggleProductActive);

export default router;