import axiosInstance from '../../../../config/axiosInstance';

export interface UserMasterDto {
  userId?: number;
  employeeId?: number;
  employeeName?: string;
  roleId?: number;
  roleName?: string;
  description?: string;
  email: string;
  password?: string;
  status?: string;
}

export const getUsers = async (): Promise<UserMasterDto[]> => {
  const res = await axiosInstance.get('/users');
  return res.data.data || [];
};

export const createUser = async (data: UserMasterDto): Promise<UserMasterDto> => {
  const res = await axiosInstance.post('/users', data);
  return res.data.data;
};

export const updateUser = async (id: number, data: UserMasterDto): Promise<UserMasterDto> => {
  const res = await axiosInstance.put(`/users/${id}`, data);
  return res.data.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/users/${id}`);
};
