import axiosInstance from '../../../../config/axiosInstance';

export interface CategoryDto {
  id?: number;
  categoryCode: string;
  categoryName: string;
  categoryNameMarathi?: string;
  status?: string;
}

export const getCategories = async (): Promise<CategoryDto[]> => {
  const res = await axiosInstance.get('/categories');
  return res.data.data || [];
};

export const getActiveCategories = async (): Promise<CategoryDto[]> => {
  const res = await axiosInstance.get('/categories/active');
  return res.data.data || [];
};
