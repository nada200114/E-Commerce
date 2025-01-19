import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: 1,
        },
      },
    ],
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: false,
      default: null,
    },
    totalCost: { type: Number, default: 0 },
    discount: {
      type: Number,
      default: 0,

      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const cartModel = mongoose.model("Cart", cartSchema);

export default cartModel;
