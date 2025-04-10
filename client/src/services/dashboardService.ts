// Dashboard service for fetching dashboard statistics
import { API_BASE_URL, Student } from './mongoDBService';

// Types for dashboard statistics
export interface DashboardStats {
  totalStudents: number;
  totalPayments: number;
  recoveryRate: number;
  recentStudents: Student[];
}

// Get total number of students
export const getTotalStudents = async (level?: string): Promise<number> => {
  try {
    if (level) {
      const students = await fetchStudentsByLevel(level);
      return students.length;
    }

    const response = await fetch(`${API_BASE_URL}/students/count`);

    if (!response.ok) {
      throw new Error('Failed to fetch student count');
    }

    const data = await response.json();
    return data.total || 0;
  } catch (error) {
    console.error('Error fetching total students:', error);
    return 0;
  }
};

// Get total payments received
export const getTotalPayments = async (level?: string): Promise<number> => {
  try {
    const students: Student[] = level
      ? await fetchStudentsByLevel(level)
      : await fetch(`${API_BASE_URL}/students`).then(res => res.json());

    let totalPayments = 0;

    students.forEach(student => {
      if (student.payments && student.payments.length > 0) {
        totalPayments += student.payments.reduce((sum, payment) => sum + payment.amount, 0);
      }
    });

    return totalPayments;
  } catch (error) {
    console.error('Error calculating total payments:', error);
    return 0;
  }
};

// Get overall recovery rate
export const getRecoveryRate = async (level?: string): Promise<number> => {
  try {
    const students: Student[] = level
      ? await fetchStudentsByLevel(level)
      : await fetch(`${API_BASE_URL}/students`).then(res => res.json());

    let totalAmount = 0;
    let totalPaid = 0;

    students.forEach(student => {
      if (student.totalAmount) {
        totalAmount += student.totalAmount;
      }

      if (student.payments && student.payments.length > 0) {
        totalPaid += student.payments.reduce((sum, payment) => sum + payment.amount, 0);
      }
    });

    return totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;
  } catch (error) {
    console.error('Error calculating recovery rate:', error);
    return 0;
  }
};

// Get recent students
export const getRecentStudents = async (
  limit: number = 4,
  level?: string
): Promise<Student[]> => {
  try {
    const students: Student[] = level
      ? await fetchStudentsByLevel(level)
      : await fetch(`${API_BASE_URL}/students`).then(res => res.json());

    return students
      .sort((a, b) => {
        const dateA = a.enrollmentDate ? new Date(a.enrollmentDate).getTime() : 0;
        const dateB = b.enrollmentDate ? new Date(b.enrollmentDate).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent students:', error);
    return [];
  }
};

// Helper function to fetch students by level
export const fetchStudentsByLevel = async (level: string): Promise<Student[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students`);

    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }

    const students: Student[] = await response.json();

    return students.filter(student => student.level === level);
  } catch (error) {
    console.error(`Error fetching students by level "${level}":`, error);
    return [];
  }
};

// Get all dashboard stats in one call
export const getDashboardStats = async (level?: string): Promise<DashboardStats> => {
  try {
    const [totalStudents, totalPayments, recoveryRate, recentStudents] = await Promise.all([
      getTotalStudents(level),
      getTotalPayments(level),
      getRecoveryRate(level),
      getRecentStudents(4, level)
    ]);

    return {
      totalStudents,
      totalPayments,
      recoveryRate,
      recentStudents
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalStudents: 0,
      totalPayments: 0,
      recoveryRate: 0,
      recentStudents: []
    };
  }
};
