export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organization: {
        Row: {
          id: string;
          name: string;
          country: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          country: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          country?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      contact: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          organization_id: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          organization_id?: string;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          organization_id?: string;
          created_at?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contact_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organization";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      view_contact: {
        Row: {
          id: string | null;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          organization_id: string | null;
          created_at: string | null;
          created_by: string | null;
          organization_name: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contact_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organization";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
