import { Student, fetchStudents, fetchStudentById, createStudent as createStudentInDB, updateStudent as updateStudentInDB, deleteStudent as deleteStudentInDB } from './mongoDBService';

// Type for Student with _id field which is returned from MongoDB
export interface StudentType extends Omit<Student, 'id'> {
  _id?: string;
}

// Service class for student operations
class StudentService {
  // Get all students
  static async getAllStudents(): Promise<StudentType[]> {
    try {
      return await fetchStudents();
    } catch (error) {
      console.error('Error in getAllStudents:', error);
      throw error;
    }
  }

  // Get a student by ID
  static async getStudentById(id: string): Promise<StudentType | null> {
    try {
      return await fetchStudentById(id);
    } catch (error) {
      console.error(`Error in getStudentById for ID ${id}:`, error);
      throw error;
    }
  }

  // Create a new student
  static async createStudent(student: Omit<StudentType, '_id'>): Promise<StudentType> {
    try {
      return await createStudentInDB(student as Omit<Student, 'id'>);
    } catch (error) {
      console.error('Error in createStudent:', error);
      throw error;
    }
  }

  // Update a student
  static async updateStudent(id: string, student: Partial<StudentType>): Promise<StudentType> {
    try {
      return await updateStudentInDB(id, student as Partial<Student>);
    } catch (error) {
      console.error(`Error in updateStudent for ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a student
  static async deleteStudent(id: string): Promise<void> {
    try {
      await deleteStudentInDB(id);
    } catch (error) {
      console.error(`Error in deleteStudent for ID ${id}:`, error);
      throw error;
    }
  }
}

export default StudentService;