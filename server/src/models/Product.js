import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    category: {
      type: String,
      required: true,
      enum: ['Shirts', 'Trousers', 'Skirts', 'Blazers', 'Sweaters', 'PE Uniform', 'Shoes', 'Accessories'],
    },
    gender: { type: String, enum: ['Boys', 'Girls', 'Unisex'], default: 'Unisex' },
    applicableGrades: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    stockBySizes: {
      type: Map,
      of: Number,
      default: { XS: 10, S: 15, M: 20, L: 15, XL: 10, XXL: 5 },
    },
    material: { type: String, default: '65% Polyester, 35% Cotton Premium Blend' },
    careInstructions: { type: String, default: 'Machine wash cold, tumble dry low, warm iron' },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Virtual helper for overall stock
productSchema.virtual('totalStock').get(function () {
  if (!this.stockBySizes) return 0;
  let total = 0;
  for (const count of this.stockBySizes.values()) {
    total += count;
  }
  return total;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);
