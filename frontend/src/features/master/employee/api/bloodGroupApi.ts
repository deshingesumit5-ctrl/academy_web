import axiosInstance from '../../../../config/axiosInstance';

export interface BloodGroupDto {
  bloodGroupId?: number;
  name: string;
  status?: string;
}

export const getBloodGroups = async (): Promise<BloodGroupDto[]> => {
  const res = await axiosInstance.get('/blood-groups');
  return res.data.data || [];
};
