import { type DropdownOption } from "$lib/components";

export interface LazyDropdownOption extends DropdownOption {
  /** The label displayed in the list of options. */
  label: string;

  /** The value assigned to the dropdown value variable */
  value: string;

  /** An optional icon displayed left to the label */
  icon_url?: string;

  /** The aspect ratio width of the optional icon */
  icon_width?: number;

  /** The aspect ratio height of the optional icon */
  icon_height?: number;
}
