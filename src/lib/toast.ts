import { toast, ToastOptions } from 'react-toastify';

// Default toast options - top-right position
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * Show success toast notification
 */
export const showSuccess = (message: string, options?: ToastOptions) => {
  toast.success(message, { ...defaultOptions, ...options });
};

/**
 * Show error toast notification
 */
export const showError = (message: string, options?: ToastOptions) => {
  toast.error(message, { ...defaultOptions, ...options });
};

/**
 * Show info toast notification
 */
export const showInfo = (message: string, options?: ToastOptions) => {
  toast.info(message, { ...defaultOptions, ...options });
};

/**
 * Show warning toast notification
 */
export const showWarning = (message: string, options?: ToastOptions) => {
  toast.warning(message, { ...defaultOptions, ...options });
};

/**
 * Show loading toast notification
 */
export const showLoading = (message: string, options?: ToastOptions) => {
  return toast.loading(message, { ...defaultOptions, ...options });
};

/**
 * Update existing toast
 */
export const updateToast = (
  toastId: string | number,
  message: string,
  type: 'success' | 'error' | 'info' | 'warning'
) => {
  toast.update(toastId, {
    render: message,
    type: type,
    isLoading: false,
    autoClose: 3000,
  });
};
