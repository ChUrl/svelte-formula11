import type { ToastSettings } from "@skeletonlabs/skeleton";

export const get_info_toast = (
  message: string,
  timeout: number | null = 2000,
  action_label: string | undefined = undefined,
  action_response: (() => void) | undefined = undefined,
): ToastSettings =>
  get_toast(message, "variant-filled-tertiary", timeout, action_label, action_response);

export const get_warning_toast = (
  message: string,
  timeout: number | null = 2000,
  action_label: string | undefined = undefined,
  action_response: (() => void) | undefined = undefined,
): ToastSettings =>
  get_toast(message, "variant-filled-secondary", timeout, action_label, action_response);

export const get_error_toast = (
  message: string,
  timeout: number | null = 2000,
  action_label: string | undefined = undefined,
  action_response: (() => void) | undefined = undefined,
): ToastSettings =>
  get_toast(message, "variant-filled-primary", timeout, action_label, action_response);

/**
 * Utility function to create [ToastSettings].
 * If [timeout] is defined, the toast will disappear automatically and the dismiss-button will be hidden.
 * If [timeout] is undefined, the toast will stay until dismissed from the dismiss-button.
 * If [action_label] and [action_response] are defined, a callback function will be executed after accepting.
 * In this case, [timeout] behaves as if undefined.
 */
const get_toast = (
  message: string,
  background: string,
  timeout: number | null = 2000,
  action_label: string | undefined = undefined,
  action_response: (() => void) | undefined = undefined,
): ToastSettings => {
  return {
    message,
    background,

    // If we have a timeout and no action, dismiss is hidden
    hideDismiss: !!timeout && (!action_label || !action_response),

    // If we have a timeout and no action, the timeout is used
    timeout: !!timeout && (!action_label || !action_response) ? timeout : undefined,

    // If we have a timeout and no action, autohide is true
    autohide: !!timeout && (!action_label || !action_response),

    // If we have a label and a response, use the action
    action:
      !!action_label && !!action_response
        ? {
            label: action_label,
            response: action_response,
          }
        : undefined,
  };
};
