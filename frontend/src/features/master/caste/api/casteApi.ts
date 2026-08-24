import axiosInstance from '../../../../config/axiosInstance';

export interface CasteDto {
  casteId?: number;
  name: string;
  status?: string;
}

export const getCastes = async (): Promise<CasteDto[]> => {
  const res = await axiosInstance.get('/castes');
  return res.data.data || [];
};

export const getActiveCastes = async (): Promise<CasteDto[]> => {
  const res = await axiosInstance.get('/castes/active');
  return res.data.data || [];
};

export const createCaste = async (data: CasteDto): Promise<CasteDto> => {
  const res = await axiosInstance.post('/castes', data);
  return res.data.data;
};

export const updateCaste = async (id: number, data: CasteDto): Promise<CasteDto> => {
  const res = await axiosInstance.put(`/castes/${id}`, data);
  return res.data.data;
};

export const deleteCaste = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/castes/${id}`);
};
