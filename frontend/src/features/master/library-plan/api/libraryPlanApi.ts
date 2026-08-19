import axiosInstance from '../../../../config/axiosInstance';

export interface LibraryPlanDto {
  planId?: number;
  planName: string;
  duration: string;
  fees: number;
  description: string;
}

export const getLibraryPlans = async (): Promise<LibraryPlanDto[]> => {
  const res = await axiosInstance.get('/library-plans');
  return res.data.data || [];
};

export const createLibraryPlan = async (data: LibraryPlanDto): Promise<LibraryPlanDto> => {
  const res = await axiosInstance.post('/library-plans', data);
  return res.data.data;
};

export const updateLibraryPlan = async (id: number, data: LibraryPlanDto): Promise<LibraryPlanDto> => {
  const res = await axiosInstance.put(`/library-plans/${id}`, data);
  return res.data.data;
};

export const deleteLibraryPlan = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/library-plans/${id}`);
};
