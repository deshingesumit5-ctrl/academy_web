import axiosInstance from '../../../../config/axiosInstance';

export interface AcademyDto {
  academyId?: number;
  academyName: string;
  branchName: string;
  address: string;
  contactNumber: string;
  createdAt?: string;
}

export const getAcademies = async (): Promise<AcademyDto[]> => {
  const res = await axiosInstance.get('/academies');
  return res.data.data || [];
};

export const createAcademy = async (data: AcademyDto): Promise<AcademyDto> => {
  const res = await axiosInstance.post('/academies', data);
  return res.data.data;
};

export const updateAcademy = async (id: number, data: AcademyDto): Promise<AcademyDto> => {
  const res = await axiosInstance.put(`/academies/${id}`, data);
  return res.data.data;
};

export const deleteAcademy = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/academies/${id}`);
};
