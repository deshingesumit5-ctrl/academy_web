import axiosInstance from '../../../../config/axiosInstance';

export interface CourseDto {
  courseId?: number;
  courseName: string;
  duration: string;
  fees: number;
  description: string;
}

export const getCourses = async (): Promise<CourseDto[]> => {
  const res = await axiosInstance.get('/courses');
  return res.data.data || [];
};

export const createCourse = async (data: CourseDto): Promise<CourseDto> => {
  const res = await axiosInstance.post('/courses', data);
  return res.data.data;
};

export const updateCourse = async (id: number, data: CourseDto): Promise<CourseDto> => {
  const res = await axiosInstance.put(`/courses/${id}`, data);
  return res.data.data;
};

export const deleteCourse = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/courses/${id}`);
};
