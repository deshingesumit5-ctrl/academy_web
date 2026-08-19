import axiosInstance from '../../../../config/axiosInstance';

export interface InquirySourceDto {
  sourceId?: number;
  sourceName: string;
}

export const getInquirySources = async (): Promise<InquirySourceDto[]> => {
  const res = await axiosInstance.get('/inquiry-sources');
  return res.data.data || [];
};

export const createInquirySource = async (data: InquirySourceDto): Promise<InquirySourceDto> => {
  const res = await axiosInstance.post('/inquiry-sources', data);
  return res.data.data;
};

export const updateInquirySource = async (id: number, data: InquirySourceDto): Promise<InquirySourceDto> => {
  const res = await axiosInstance.put(`/inquiry-sources/${id}`, data);
  return res.data.data;
};

export const deleteInquirySource = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/inquiry-sources/${id}`);
};
