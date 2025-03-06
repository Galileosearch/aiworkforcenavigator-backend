export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ai_use_cases: {
        Row: {
          id: string;
          name: string;
          industry: string;
          description: string;
          implementation_complexity: number;
          success_rate: number;
        };
        Insert: {
          id?: string;
          name: string;
          industry: string;
          description: string;
          implementation_complexity?: number;
          success_rate?: number;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          industry: string;
          size: string;
          profile?: Json;
        };
        Insert: {
          id?: string;
          name: string;
          industry: string;
          size: string;
          profile?: Json;
        };
      };
    };
  }
}