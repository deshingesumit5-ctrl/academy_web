import axiosInstance from '../../../../config/axiosInstance';

export interface ExamDto {
  examId?: number;
  examName: string;
  examType: string;
}

export const getExams = async (): Promise<ExamDto[]> => {
  const res = await axiosInstance.get('/exams');
  return res.data.data || [];
};

export const createExam = async (data: ExamDto): Promise<ExamDto> => {
  const res = await axiosInstance.post('/exams', data);
  return res.data.data;
};

export const updateExam = async (id: number, data: ExamDto): Promise<ExamDto> => {
  const res = await axiosInstance.put(`/exams/${id}`, data);
  return res.data.data;
};

export const deleteExam = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/exams/${id}`);
};
