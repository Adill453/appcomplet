import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  month: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { type: String, default: 'Espèces' },
  receiptNumber: { type: String }
});

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  parentPhone: { type: String },
  birthDate: { type: Date },
  birthPlace: { type: String },
  cin: { type: String },
  cne: { type: String },
  photo: { type: String }, // Base64 encoded string for the image
  level: { type: String, enum: ['1ère Année', '2ème Année', '3ème Année', 'Master 1', 'Master 2'] },
  academicYear: { type: String, default: () => {
    const year = new Date().getFullYear();
    return `${year}-${year + 1}`;
  }},
  totalAmount: { type: Number, default: 0 },
  payments: [paymentSchema],
  enrollmentDate: { type: Date, default: Date.now },
  guardianName: { type: String },
  guardianPhone: { type: String }
}, { timestamps: true });

// Calculate recovery rate (percentage of total amount paid)
studentSchema.virtual('recoveryRate').get(function() {
  if (!this.totalAmount || this.totalAmount === 0) return 0;
  
  const totalPaid = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  return Math.round((totalPaid / this.totalAmount) * 100);
});

// Ensure virtuals are included in JSON output
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

const Student = mongoose.model('Student', studentSchema);

export default Student;