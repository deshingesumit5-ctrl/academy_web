import axiosInstance from '../../../../config/axiosInstance';

export interface EmployeeDto {
  employeeId?: number;
  employeeName: string;
  gender: string;
  dob: string;
  mobileNumber: string;
  emailId: string;
  aadhaarNumber: string;
  panNumber: string;
  bloodGroup: string;
  address: string;
  designation: string;
  dateOfJoining: string;
  shift: string;
  status: string;
  employeePhoto?: string;
}

export const getEmployees = async (): Promise<EmployeeDto[]> => {
  const res = await axiosInstance.get('/employees');
  return res.data.data || [];
};

export const createEmployee = async (data: EmployeeDto): Promise<EmployeeDto> => {
  const res = await axiosInstance.post('/employees', data);
  return res.data.data;
};

export const updateEmployee = async (id: number, data: EmployeeDto): Promise<EmployeeDto> => {
  const res = await axiosInstance.put(`/employees/${id}`, data);
  return res.data.data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/employees/${id}`);
};
