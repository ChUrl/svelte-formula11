import type { ToastSettings } from "@skeletonlabs/skeleton";

export const get_info_toast = (message: string): ToastSettings => {
  return {
    message,
    hideDismiss: true,
    timeout: 2000,
    background: "variant-filled-tertiary",
  };
};

export const get_warning_toast = (message: string): ToastSettings => {
  return {
    message,
    hideDismiss: true,
    timeout: 2000,
    background: "variant-filled-secondary",
  };
};

export const get_error_toast = (message: string): ToastSettings => {
  return {
    message,
    hideDismiss: true,
    timeout: 2000,
    background: "variant-filled-primary",
  };
};
