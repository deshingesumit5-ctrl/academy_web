import axiosInstance from '../../../../config/axiosInstance';

export interface CasteDto {
  id?: number;
  casteId?: number;
  casteName?: string;
  name: string; // for backward compatibility
  casteNameMarathi?: string;
  categoryId?: number;
  categoryCode?: string;
  status?: string;
}

export const getCastes = async (): Promise<CasteDto[]> => {
  const res = await axiosInstance.get('/castes');
  const list = res.data.data || [];
  return list.map((item: any) => ({
    ...item,
    id: item.id || item.casteId,
    casteId: item.casteId || item.id,
    name: item.casteName || item.name || '',
    casteName: item.casteName || item.name || '',
  }));
};

export const getActiveCastes = async (): Promise<CasteDto[]> => {
  const res = await axiosInstance.get('/castes/active');
  const list = res.data.data || [];
  return list.map((item: any) => ({
    ...item,
    id: item.id || item.casteId,
    casteId: item.casteId || item.id,
    name: item.casteName || item.name || '',
    casteName: item.casteName || item.name || '',
  }));
};

export const createCaste = async (data: CasteDto): Promise<CasteDto> => {
  const payload = {
    ...data,
    casteName: data.casteName || data.name,
    name: data.casteName || data.name,
  };
  const res = await axiosInstance.post('/castes', payload);
  return res.data.data;
};

export const updateCaste = async (id: number, data: CasteDto): Promise<CasteDto> => {
  const payload = {
    ...data,
    id,
    casteId: id,
    casteName: data.casteName || data.name,
    name: data.casteName || data.name,
  };
  const res = await axiosInstance.put(`/castes/${id}`, payload);
  return res.data.data;
};

export const deleteCaste = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/castes/${id}`);
};
