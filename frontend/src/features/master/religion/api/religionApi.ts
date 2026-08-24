import axiosInstance from '../../../../config/axiosInstance';

export interface ReligionDto {
  religionId?: number;
  name: string;
  status?: string;
}

export const getReligions = async (): Promise<ReligionDto[]> => {
  const res = await axiosInstance.get('/religions');
  return res.data.data || [];
};

export const getActiveReligions = async (): Promise<ReligionDto[]> => {
  const res = await axiosInstance.get('/religions/active');
  return res.data.data || [];
};

export const createReligion = async (data: ReligionDto): Promise<ReligionDto> => {
  const res = await axiosInstance.post('/religions', data);
  return res.data.data;
};

export const updateReligion = async (id: number, data: ReligionDto): Promise<ReligionDto> => {
  const res = await axiosInstance.put(`/religions/${id}`, data);
  return res.data.data;
};

export const deleteReligion = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/religions/${id}`);
};
