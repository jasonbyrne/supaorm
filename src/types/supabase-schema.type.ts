export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type ColumnType = string | number | null | undefined | boolean;

export type RowType = Record<string, ColumnType>;

export type Relationship = {
  foreignKeyName: string;
  columns: string[];
  referencedRelation: string;
  referencedColumns: string[];
};

export interface DatabaseStructure {
  public: {
    Tables: {
      [key: string]: {
        Row: Required<RowType>;
        Insert: RowType;
        Update: Partial<RowType>;
        Relationships: Relationship[];
      };
    };
    Views: {
      [key: string]: {
        Row: Required<RowType>;
        Relationships: Relationship[];
      };
    };
    Functions: {
      [key: string]: {
        Args: {
          [key: string]: ColumnType;
        };
        Returns: ColumnType | RowType | RowType[];
      };
    };
  };
}
