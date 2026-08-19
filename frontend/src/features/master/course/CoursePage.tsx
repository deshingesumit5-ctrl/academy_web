import React, { useState, useEffect } from 'react';
import { getCourses, createCourse, updateCourse, deleteCourse } from './api/courseApi';
import type { CourseDto } from './api/courseApi';
import { CourseFormModal } from './components/CourseFormModal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { ActionButtons } from '../../../components/ActionButtons';

export const CoursePage: React.FC = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CourseDto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data || []);
    } catch (err) {
      console.error(err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: CourseDto) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: CourseDto) => {
    if (editingItem && editingItem.courseId) {
      await updateCourse(editingItem.courseId, data);
    } else {
      await createCourse(data);
    }
    await fetchCourses();
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteCourse(deletingId);
        await fetchCourses();
      } catch (err) {
        console.error(err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div>
      <div className="section-title">
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <i className="ti ti-plus"></i>Add Course
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="empty">
            <i className="ti ti-notebook"></i>
            <div>No courses added yet</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Course Name</th>
                  <th>Duration</th>
                  <th>Fees</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((item, index) => (
                  <tr key={item.courseId}>
                    <td>{index + 1}</td>
                    <td>{item.courseName}</td>
                    <td>{item.duration}</td>
                    <td>₹{item.fees}</td>
                    <td>{item.description}</td>
                    <td style={{ textAlign: 'right' }}>
                      <ActionButtons
                        onEdit={() => handleOpenEdit(item)}
                        onDelete={() => setDeletingId(item.courseId!)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CourseFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Delete Course"
        message="Do you want to delete this Course? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
