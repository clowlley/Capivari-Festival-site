import { toast, type ToastOptions } from 'react-toastify';

export const useToast = () => {
  const defaultOptions: ToastOptions = {
    position: "top-right",
    autoClose: 3000,
  };

  return {
    success: (msg: string) => toast.success(msg, defaultOptions),
    error: (msg: string) => toast.error(msg, defaultOptions),
    info: (msg: string) => toast.info(msg, defaultOptions),
  };
};