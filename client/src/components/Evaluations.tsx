import React, { useState } from 'react';
import { Class } from '../types/Class';
import { Evaluation } from '../types/Evaluation';
import EnrollmentService from '../services/EnrollmentService';

interface EvaluationsProps {
  selectedClass: Class | null;
  onClassesUpdate: () => void;
  onError: (errorMessage: string) => void;
}

const Evaluations: React.FC<EvaluationsProps> = ({ selectedClass, onClassesUpdate, onError }) => {
  const [editingEvaluations, setEditingEvaluations] = useState<{[key: string]: {[goal: string]: string}}>({});

  const handleEvaluationChange = (studentCPF: string, goal: string, grade: string) => {
    setEditingEvaluations(prev => ({
      ...prev,
      [studentCPF]: {
        ...prev[studentCPF],
        [goal]: grade
      }
    }));
  };

  const saveEvaluation = async (studentCPF: string, goal: string) => {
    if (!selectedClass) {
      onError('No class selected');
      return;
    }

    const grade = editingEvaluations[studentCPF]?.[goal];
    if (grade !== undefined) {
      try {
        await EnrollmentService.updateEvaluation(selectedClass.id, studentCPF, goal, grade);
        onClassesUpdate(); // Refresh enrollment data
        // Clear the editing state for this evaluation
        setEditingEvaluations(prev => {
          const updated = { ...prev };
          if (updated[studentCPF]) {
            delete updated[studentCPF][goal];
            if (Object.keys(updated[studentCPF]).length === 0) {
              delete updated[studentCPF];
            }
          }
          return updated;
        });
      } catch (error) {
        console.error('Error updating evaluation:', error);
        onError(`Error updating evaluation: ${(error as Error).message}`);
      }
    }
  };

  const addNewEvaluation = async (studentCPF: string) => {
    if (!selectedClass) {
      onError('No class selected');
      return;
    }

    const goal = prompt('Enter goal for new evaluation:');
    if (goal && goal.trim()) {
      try {
        await EnrollmentService.updateEvaluation(selectedClass.id, studentCPF, goal.trim(), 'MANA');
        onClassesUpdate(); // Refresh enrollment data
      } catch (error) {
        console.error('Error adding evaluation:', error);
        onError(`Error adding evaluation: ${(error as Error).message}`);
      }
    }
  };

  if (!selectedClass) {
    return (
      <div className="evaluation-section">
        <h3>Evaluations</h3>
        <div style={{ 
          padding: '20px', 
          border: '2px dashed #ccc', 
          borderRadius: '8px', 
          textAlign: 'center',
          color: '#666'
        }}>
          <h4>No Class Selected</h4>
          <p>Please select a class to view and manage evaluations.</p>
          <p>Use the dropdown above to choose a class.</p>
        </div>
      </div>
    );
  }

  const enrollments = selectedClass.enrollments;

  if (enrollments.length === 0) {
    return (
      <div className="evaluation-section">
        <h3>Evaluations - {selectedClass.topic} ({selectedClass.year}/{selectedClass.semester})</h3>
        <div style={{ 
          padding: '20px', 
          border: '2px dashed #ccc', 
          borderRadius: '8px', 
          textAlign: 'center',
          color: '#666'
        }}>
          <h4>No Students Enrolled</h4>
          <p>This class has no enrolled students yet.</p>
          <p>Add students in the Students tab first.</p>
        </div>
      </div>
    );
  }

  // Get all unique goals across all enrollments
  const allGoals = Array.from(new Set(
    enrollments.flatMap(enrollment => 
      enrollment.evaluations.map(evaluation => evaluation.goal)
    )
  )).sort();

  return (
    <div className="evaluation-section">
      <h3>Evaluations - {selectedClass.topic} ({selectedClass.year}/{selectedClass.semester})</h3>
      
      <div className="evaluation-table">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              {allGoals.map(goal => (
                <th key={goal}>{goal}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map(enrollment => {
              const student = enrollment.student;
              const studentEvaluations = enrollment.evaluations.reduce((acc, evaluation) => {
                acc[evaluation.goal] = evaluation;
                return acc;
              }, {} as {[goal: string]: Evaluation});

              return (
                <tr key={student.cpf}>
                  <td>{student.name}</td>
                  {allGoals.map(goal => {
                    const evaluation = studentEvaluations[goal];
                    const editingGrade = editingEvaluations[student.cpf]?.[goal];
                    const currentGrade = editingGrade !== undefined ? editingGrade : (evaluation?.grade || '');
                    const isEditing = editingGrade !== undefined;

                    return (
                      <td key={goal}>
                        <select
                          value={currentGrade}
                          onChange={(e) => handleEvaluationChange(student.cpf, goal, e.target.value)}
                          className={isEditing ? 'editing' : ''}
                        >
                          <option value="">-</option>
                          <option value="MANA">MANA</option>
                          <option value="MPA">MPA</option>
                          <option value="MA">MA</option>
                        </select>
                        {isEditing && (
                          <button 
                            onClick={() => saveEvaluation(student.cpf, goal)}
                            className="save-btn"
                            title="Save"
                          >
                            ✓
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td>
                    <button 
                      onClick={() => addNewEvaluation(student.cpf)}
                      className="add-evaluation-btn"
                    >
                      Add Goal
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Evaluations;