import express from 'express';
import Student from '../models/Student.js';

const router = express.Router();

// GET all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des étudiants' });
  }
});
//
router.get("/count", async (req, res) => {
  try {
    const count = await Student.countDocuments(); // Compter les étudiants
    res.json({ total: count });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors du comptage des étudiants" });
  }
});

// GET a single student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    res.json(student);
  } catch (error) {
    console.error(`Error fetching student with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'étudiant' });
  }
});

// POST a new student
router.post('/', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(400).json({ message: 'Erreur lors de la création de l\'étudiant', error: error.message });
  }
});

// PUT/UPDATE a student
router.put('/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    
    res.json(updatedStudent);
  } catch (error) {
    console.error(`Error updating student with ID ${req.params.id}:`, error);
    res.status(400).json({ message: 'Erreur lors de la mise à jour de l\'étudiant', error: error.message });
  }
});

// DELETE a student
router.delete('/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    
    if (!deletedStudent) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    
    res.json({ message: 'Étudiant supprimé avec succès' });
  } catch (error) {
    console.error(`Error deleting student with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'étudiant' });
  }
});

// UPDATE payment for a student
router.post('/:id/payments', async (req, res) => {
  try {
    const { month, amount, method, receiptNumber } = req.body;
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    
    // Add new payment
    student.payments.push({
      month,
      amount: Number(amount),
      date: new Date(),
      method: method || 'Espèces',
      receiptNumber
    });
    
    await student.save();
    res.json(student);
  } catch (error) {
    console.error(`Error updating payment for student ${req.params.id}:`, error);
    res.status(400).json({ message: 'Erreur lors de la mise à jour du paiement', error: error.message });
  }
});

export default router;