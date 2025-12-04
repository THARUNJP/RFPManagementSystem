import { RfpEmailData } from "../../types/types";

export function buildRfpPrompt(descriptionRaw: string) {
  return `
Extract structured procurement details from the following text.

Return ONLY valid JSON in this exact format:

{
  "items": [
    { "type": "string", "quantity": number, "specs": "string" }
  ],
  "budget": number,
  "delivery_timeline": "string",
  "payment_terms": "string",
  "warranty": "string"
}

If a field is missing, return null.

Text:
"""
${descriptionRaw}
"""
`;
}

export function buildProposalPrompt(emailText: string) {
  return `
Extract structured proposal data from the following vendor email.

Return ONLY valid JSON in this exact format:

{
  "items": [
      { "type": "string", "specs": "string", "quantity": number, "unit_price": number, "total_price": number }
    ],
  "total_price":number,
  "budget": number,
  "delivery_timeline": "string",
  "payment_terms": "string",
  "warranty": "string",
  "completeness_score": number
}


If a field is missing, return null.

Vendor Email Text:
"""
${emailText}
"""
`;
}

export function isEmptyResult(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && Object.keys(value).length === 0) return true;
  return false;
}

export const generateRfpEmailHtml = (rfp: RfpEmailData): string => {
  const itemsTable = rfp.description_structured?.items?.length
    ? `<table style="border-collapse: collapse; width: 100%;">
         <thead>
           <tr>
             <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Item</th>
             <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Specs</th>
             <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Quantity</th>
           </tr>
         </thead>
         <tbody>
           ${rfp.description_structured.items
             .map(
               (item) => `
               <tr>
                 <td style="border: 1px solid #ccc; padding: 8px;">${
                   item.type
                 }</td>
                 <td style="border: 1px solid #ccc; padding: 8px;">${
                   item.specs || "-"
                 }</td>
                 <td style="border: 1px solid #ccc; padding: 8px;">${
                   item.quantity
                 }</td>
               </tr>`
             )
             .join("")}
         </tbody>
       </table>`
    : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>RFP Notification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; }
        h1 { color: #1a73e8; }
        .rfp-section { margin-bottom: 20px; }
        .rfp-label { font-weight: bold; }
        .highlight { color: #d32f2f; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 0.9em; color: #666; }
      </style>
    </head>
    <body>
      <h1>New Request for Proposal (RFP)</h1>

      <div class="rfp-section">
        <p class="highlight">
          ⚠️ Important: Please <strong>reply to this same email</strong> without changing the subject line. 
          Include the following RFP Link ID in your reply: 
          Only responses that include this ID will be considered for your proposal.
        </p>
      </div>

      <div class="rfp-section">
        <span class="rfp-label">Title:</span> ${rfp.title}
      </div>

      ${
        rfp.description_raw
          ? `
      <div class="rfp-section">
        <span class="rfp-label">Description:</span>
        <p>${rfp.description_raw}</p>
      </div>`
          : ""
      }

      ${
        itemsTable
          ? `
      <div class="rfp-section">
        <span class="rfp-label">Items:</span>
        ${itemsTable}
      </div>`
          : ""
      }

      ${
        rfp.description_structured?.budget
          ? `
      <div class="rfp-section">
        <span class="rfp-label">Budget:</span> $${rfp.description_structured.budget.toLocaleString()}
      </div>`
          : ""
      }

      ${
        rfp.description_structured?.delivery_timeline
          ? `
      <div class="rfp-section">
        <span class="rfp-label">Delivery Timeline:</span> ${rfp.description_structured.delivery_timeline}
      </div>`
          : ""
      }

      ${
        rfp.description_structured?.payment_terms
          ? `
      <div class="rfp-section">
        <span class="rfp-label">Payment Terms:</span> ${rfp.description_structured.payment_terms}
      </div>`
          : ""
      }

      ${
        rfp.description_structured?.warranty
          ? `
      <div class="rfp-section">
        <span class="rfp-label">Warranty:</span> ${rfp.description_structured.warranty}
      </div>`
          : ""
      }

      ${
        rfp.created_at
          ? `
      <div class="rfp-section">
        <span class="rfp-label">Created At:</span> ${new Date(
          rfp.created_at
        ).toLocaleString()}
      </div>`
          : ""
      }

      <div class="footer">
        This email is automatically generated. Please respond to this RFP at your earliest convenience.
      </div>
    </body>
    </html>
  `;
};

export const mapRfpToEmailData = (rfp: {
  rfp_id: string;
  title: string;
  description_raw: string | null;
  description_structured: any;
  created_at: Date;
}): RfpEmailData => {
  return {
    rfp_id: rfp.rfp_id,
    title: rfp.title,
    description_raw: rfp.description_raw ?? undefined,
    description_structured: rfp.description_structured ?? undefined,
    created_at: rfp.created_at.toISOString(),
  };
};

/**
 * Extract RFP ULID from a string.
 * 1️ Try to match "RFP Link ID: <ULID>"
 * 2️ Fallback: find any 26-character ULID
 */
export const extractRfpUlid = (text: string): string | null => {
  if (!text) return null;

  // Step 1: Try exact "RFP Link ID: <ULID>" format
  const prefixedRegex = /RFP Link ID:\s*([0-7A-Z]{26})/i;
  const prefixedMatch = text.match(prefixedRegex);
  if (prefixedMatch) return prefixedMatch[1];

  // Step 2: Fallback: scan for any 26-character ULID
  const ulidRegex = /[0-7A-Z]{26}/g;
  const fallbackMatch = text.match(ulidRegex);
  return fallbackMatch ? fallbackMatch[0] : null;
};


export function extractEmail(address: any): string {
  if (!address) return "";

  // Case 1: AddressObject (has .text)
  if ("text" in address && typeof address.text === "string") {
    return address.text;
  }

  // Case 2: Array of AddressObject (parsed.to can be an array)
  if (Array.isArray(address)) {
    const texts = address
      .map(a => (a.text ? a.text : ""))
      .filter(Boolean);
    return texts.join(", ");
  }

  return "";
}
