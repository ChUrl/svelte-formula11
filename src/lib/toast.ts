import type { ToastSettings } from "@skeletonlabs/skeleton";

export const get_info_toast = (message: string, timeout: number = 2000): ToastSettings => {
  return {
    message,
    hideDismiss: true,
    timeout,
    background: "variant-filled-tertiary",
  };
};

export const get_warning_toast = (message: string, timeout: number = 2000): ToastSettings => {
  return {
    message,
    hideDismiss: true,
    timeout,
    background: "variant-filled-secondary",
  };
};

export const get_error_toast = (message: string, timeout: number = 2000): ToastSettings => {
  return {
    message,
    hideDismiss: true,
    timeout,
    background: "variant-filled-primary",
  };
};
