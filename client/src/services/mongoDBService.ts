
// API base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Types
export interface Payment {
  month: string;
  amount: number;
  date: string;
  method: string;
  receiptNumber?: string;
}

export interface Student {
  _id?: string;
  level: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  parentPhone?: string;
  birthDate?: Date;
  birthPlace?: string;
  cin?: string;
  cne?: string;
  photo?: string;
  academicYear?: string;
  totalAmount?: number;
  guardianName?: string;
  guardianPhone?: string;
  enrollmentDate?: string;
  payments?: Payment[];
  recoveryRate?: number;
}

// Fetch all students
export const fetchStudents = async (): Promise<Student[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching students:', errorData);
      throw new Error(errorData.message || 'Erreur lors de la récupération des étudiants');
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error in fetchStudents:', error);
    throw error;
  }
};

// Fetch a single student by ID
export const fetchStudentById = async (id: string): Promise<Student | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json();
      console.error(`Error fetching student with ID ${id}:`, errorData);
      throw new Error(errorData.message || `Erreur lors de la récupération de l'étudiant ${id}`);
    }
    
    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error('Error in fetchStudentById:', error);
    throw error;
  }
};

// Create a new student
export const createStudent = async (student: Omit<Student, 'id'>): Promise<Student> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(student)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating student:', errorData);
      throw new Error(errorData.message || 'Erreur lors de la création de l\'étudiant');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in createStudent:', error);
    throw error;
  }
};

// Update an existing student
export const updateStudent = async (id: string, student: Partial<Student>): Promise<Student> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(student)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error updating student with ID ${id}:`, errorData);
      throw new Error(errorData.message || `Erreur lors de la mise à jour de l'étudiant ${id}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in updateStudent:', error);
    throw error;
  }
};

// Delete a student
export const deleteStudent = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error deleting student with ID ${id}:`, errorData);
      throw new Error(errorData.message || `Erreur lors de la suppression de l'étudiant ${id}`);
    }
  } catch (error) {
    console.error('Error in deleteStudent:', error);
    throw error;
  }
};

// Update payment for a student
export const updatePayment = async (
  studentId: string, 
  month: string, 
  amount: number,
  method: string = 'Espèces',
  receiptNumber?: string
): Promise<Student> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ month, amount, method, receiptNumber })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error updating payment for student ${studentId}:`, errorData);
      throw new Error(errorData.message || `Erreur lors de la mise à jour du paiement pour l'étudiant ${studentId}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in updatePayment:', error);
    throw error;
  }
};
