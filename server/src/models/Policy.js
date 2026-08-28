import mongoose from 'mongoose';

const policySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['Delivery', 'Returns & Exchanges', 'Size Guide', 'Payment', 'School Policies'],
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    highlights: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Policy', policySchema);
