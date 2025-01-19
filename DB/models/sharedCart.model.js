import mongoose from "mongoose";

const sharedCartSchema = new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      token: { type: String, required: true, unique: true },
      products: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
          quantity: { type: Number, required: true, min: 1 },
        },
      ],
      totalCost: { type: Number, required: true, default: 0 },
      createdAt: { type: Date, default: Date.now, expires: "24h" }, // Automatically delete after 24 hours
    },
    { timestamps: true }
  );
  

  const SharedCartModel= mongoose.model('SharedCart',sharedCartSchema);
  export default SharedCartModel;