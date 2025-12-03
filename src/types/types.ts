
export type RfpEmailData = {
  rfp_id: string;
  title: string;
  description_raw?: string;
  description_structured?: {
    items?: { type: string; specs?: string; quantity: number }[];
    budget?: number;
    warranty?: string;
    payment_terms?: string;
    delivery_timeline?: string;
  };
  created_at?: string;
};

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}