export interface TableColumn {
  /** The name of the property containing the value. */
  data_value_name: string;

  /** The columnname for this property. */
  label: string;

  /** Any function to further customize the displayed value. May return HTML. */
  valuefun?: (value: any) => Promise<string>;
}
