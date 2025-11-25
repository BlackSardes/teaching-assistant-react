import React, { useState } from 'react';
import { Student } from '../types/Student';
import { studentService } from '../services/StudentService';
import AcademicStatusBadge from './AcademicStatusBadge';
import AcademicStatusDetailModal from './AcademicStatusDetail';

interface StudentListProps {
  students: Student[];
  onStudentDeleted: () => void;
  onEditStudent: (student: Student) => void;
  onError: (errorMessage: string) => void;
  loading: boolean;
  selectedClass?: { id: string } | null;
}

const StudentList: React.FC<StudentListProps> = ({
  students,
  onStudentDeleted,
  onEditStudent,
  onError,
  loading,
  selectedClass
}) => {

  const [modalOpen, setModalOpen] = useState(false);
  const [modalStudentName, setModalStudentName] = useState("");
  const [modalStatus, setModalStatus] = useState<any>(null);
  const [rowColors, setRowColors] = useState<Record<string, string>>({});

  const handleOpenDetail = (student: Student, status: any) => {
    setModalStudentName(student.name);
    setModalStatus(status);
    setModalOpen(true);
  };

  const handleStatusLoaded = (cpf: string, status: any) => {
    const bgColorMap: Record<string, string> = {
      green: "#dcfce7",
      orange: "#fef3c7",
      red: "#fee2e2",
      invisible: "transparent"
    };

    const bg = bgColorMap[status.color] || "transparent";

    setRowColors(prev => ({
      ...prev,
      [cpf]: bg
    }));
  };

  const handleDelete = async (student: Student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      try {
        await studentService.deleteStudent(student.cpf);
        onStudentDeleted();
      } catch (err) {
        onError("Failed to delete student. Try again.");
      }
    }
  };

  const handleEdit = (student: Student) => {
    onEditStudent(student);
  };

  if (loading) {
    return (
      <div className="students-list">
        <h2>Students ({students.length})</h2>
        <div className="loading">Loading students...</div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="students-list">
        <h2>Students (0)</h2>
        <div className="no-students">
          No students registered yet. Add your first student using the form above.
        </div>
      </div>
    );
  }

  return (
    <div className="students-list">
      <h2>Students ({students.length})</h2>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>CPF</th>
              <th>Email</th>
              <th>Academic Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {students.map(student => {
              const cpfClean = student.cpf.replace(/\D/g, "");

              return (
                <tr
                  key={student.cpf}
                  style={{
                    backgroundColor: rowColors[cpfClean] || "transparent",
                    transition: "0.25s"
                  }}
                  data-testid={`student-row-${student.cpf}`}
                >
                  <td data-testid="student-name">{student.name}</td>
                  <td data-testid="student-cpf">{student.cpf}</td>
                  <td data-testid="student-email">{student.email}</td>

                  <td>
                    {selectedClass ? (
                      <AcademicStatusBadge
                        studentCPF={cpfClean}
                        classId={selectedClass.id}
                        onClick={(status) => handleOpenDetail(student, status)}
                        onStatusLoaded={(status) => handleStatusLoaded(cpfClean, status)}
                      />
                    ) : (
                      <span style={{ color: "#888" }}>Select a class</span>
                    )}
                  </td>

                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(student)}>
                      Edit
                    </button>

                    <button className="delete-btn" onClick={() => handleDelete(student)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      <AcademicStatusDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        studentName={modalStudentName}
        status={modalStatus}
      />
    </div>
  );
};

export default StudentList;
