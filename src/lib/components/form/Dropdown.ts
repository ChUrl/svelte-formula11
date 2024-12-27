export interface DropdownOption {
  /** The label displayed in the list of options. */
  label: string;

  /** The value assigned to the dropdown value variable */
  value: string;

  /** An optional icon displayed left to the label */
  icon_url?: string;

  /** The icon width. Required if icon_url is set */
  icon_width?: number;

  /** The icon height. Required if icon_url is set */
  icon_height?: number;
}
