import axiosInstance from '../../../../config/axiosInstance';

export interface FeeStructureDto {
  academyFeePlanId?: number;
  planName: string;
  totalFee: number;
  duration?: string;
  description?: string;
}

export const getFeeStructures = async (): Promise<FeeStructureDto[]> => {
  const res = await axiosInstance.get('/fee-structures');
  const data = res.data.data;
  if (Array.isArray(data)) return data;
  if (data?.academyFeePlans && Array.isArray(data.academyFeePlans)) return data.academyFeePlans;
  return [];
};

export const createFeeStructure = async (data: FeeStructureDto): Promise<FeeStructureDto> => {
  const res = await axiosInstance.post('/fee-structures/academy-plans', data);
  return res.data.data;
};

export const updateFeeStructure = async (id: number, data: FeeStructureDto): Promise<FeeStructureDto> => {
  const res = await axiosInstance.put(`/fee-structures/academy-plans/${id}`, data);
  return res.data.data;
};

export const deleteFeeStructure = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/fee-structures/academy-plans/${id}`);
};
