import axiosInstance from '../../../../config/axiosInstance';

export interface DistrictDto {
  districtId?: number;
  name: string;
  status?: string;
}

export const getDistricts = async (): Promise<DistrictDto[]> => {
  const res = await axiosInstance.get('/districts');
  return res.data.data || [];
};

export const getActiveDistricts = async (): Promise<DistrictDto[]> => {
  const res = await axiosInstance.get('/districts/active');
  return res.data.data || [];
};

export const createDistrict = async (data: DistrictDto): Promise<DistrictDto> => {
  const res = await axiosInstance.post('/districts', data);
  return res.data.data;
};

export const updateDistrict = async (id: number, data: DistrictDto): Promise<DistrictDto> => {
  const res = await axiosInstance.put(`/districts/${id}`, data);
  return res.data.data;
};

export const deleteDistrict = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/districts/${id}`);
};
