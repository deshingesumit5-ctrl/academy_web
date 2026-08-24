import axiosInstance from '../../../../config/axiosInstance';

export interface KitSizeDto {
  kitSizeId?: number;
  name: string;
  status?: string;
}

export const getKitSizes = async (): Promise<KitSizeDto[]> => {
  const res = await axiosInstance.get('/kit-sizes');
  return res.data.data || [];
};

export const getActiveKitSizes = async (): Promise<KitSizeDto[]> => {
  const res = await axiosInstance.get('/kit-sizes/active');
  return res.data.data || [];
};

export const createKitSize = async (data: KitSizeDto): Promise<KitSizeDto> => {
  const res = await axiosInstance.post('/kit-sizes', data);
  return res.data.data;
};

export const updateKitSize = async (id: number, data: KitSizeDto): Promise<KitSizeDto> => {
  const res = await axiosInstance.put(`/kit-sizes/${id}`, data);
  return res.data.data;
};

export const deleteKitSize = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/kit-sizes/${id}`);
};
