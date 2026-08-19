import axiosInstance from '../../../../config/axiosInstance';

export interface BatchDto {
  batchId?: number;
  batchName: string;
  faculty: string;
  batchTiming: string;
  capacity?: number;
}

export const getBatches = async (): Promise<BatchDto[]> => {
  const res = await axiosInstance.get('/batches');
  return res.data.data || [];
};

export const createBatch = async (data: BatchDto): Promise<BatchDto> => {
  const res = await axiosInstance.post('/batches', data);
  return res.data.data;
};

export const updateBatch = async (id: number, data: BatchDto): Promise<BatchDto> => {
  const res = await axiosInstance.put(`/batches/${id}`, data);
  return res.data.data;
};

export const deleteBatch = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/batches/${id}`);
};
