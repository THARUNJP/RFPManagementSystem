# Install all project dependencies
npm install   

# Run the server in development mode 
npm run dev   

# Build the project 
npm run build 

# Start the production server
npm start 

# Seed the database with default data
npm run seed

# Technology Stack

Node.js + TypeScript

Express.js

Prisma ORM

PostgreSQL

Gemini / LLM Integration

Email Sending: Nodemailer / Email Receiver: IMAP (polling)

# Architecture Decision

I have used the Gemini API for LLM processing. For email handling, I used IMAP, which polls the inbox for the latest emails. It checks the subject line for an RFP link ID. Since we send emails requesting vendors to submit proposals, if a valid RFP ID is found in the subject, the email is considered a proposal submission. The content is then sent to the LLM to generate a proper proposal format and stored in the database.

Regarding the AI recommendation logic:

First-time AI recommendation: When triggered for the first time, the system fetches all proposals and processes them in batches of 10 against the RFP. Each batch produces a “best proposal,” and a final LLM call is made to select the best proposal among all batch winners. Batching improves time complexity and reduces LLM processing time.

Subsequent AI recommendations: For subsequent runs, the system only compares the latest proposals with the previously selected best proposal. By using the created_at timestamp of proposals and the best proposal ID, the system can quickly generate a recommendation. This approach feels like a simple API call and avoids reprocessing all proposals, reducing the response time to just a few seconds instead of 5–10 seconds for full LLM comparison.


# Decision: Background Processing vs Job Queue

We used simple in-process background processing here for quick, non-blocking email sending; a job queue can be added later for better scalability.

When to use a job queue: Best suited for sending hundreds or thousands of emails, or when tasks need retries, batching, or distributed workers.

Adding a job queue like RabbitMQ or similar is unnecessary for this assignment due to the current email volume and scope


# Functional Requirements

The system supports:

Create RFPs

Convert natural language procurement requirements into structured RFPs.

Example: "I need to procure laptops and monitors for our new office. Budget $50,000, delivery within 30 days, 20 laptops with 16GB RAM, 15 monitors 27-inch, net 30 payment terms, 1-year warranty."

Manage Vendors & Send RFPs

Maintain vendor master data.

Choose vendors to send RFPs.

Send RFPs via email.

Receive and Interpret Vendor Responses

Poll emails for vendor responses using IMAP.

Parse messy email content using LLM.

Store parsed proposals automatically.

Compare Proposals & Recommend Vendor

Show proposal comparison (pricing, terms, completeness).

Use AI to generate summaries, scores, and recommendations.

Answer: “Which vendor should I go with, and why?”


# Database Overview (Might miss some column so kindly do refer schema.prisma file)

vendors: Stores vendor details and relations to RFPs, emails, and proposals  
rfps: Stores RFP details, structured description, budget, timeline, and relations to vendors, proposals, and comparisons  
rfp_vendors: Junction table linking RFPs and vendors with email status tracking  
vendor_emails: Stores emails received from vendors with raw content, attachments, and relations to proposals  
proposals: Stores parsed vendor proposals with pricing, delivery, payment terms, completeness score  
comparisons: Stores AI-generated comparison results and recommended proposals  
EmailStatus (enum): Represents email sending status — pending, sent, failed 

# folder structure

RFPManagementSystem
├───node_modules
├───prisma
│   ├───migrations
│   └───seed.ts
├───src
│   ├───config
│   ├───controller
│   ├───design
│   ├───lib
│   │   ├───constant
│   │   ├───errors
│   │   └───helper
│   ├───llm
│   ├───middleware
│   ├───router
│   ├───service
│   ├───types
│   └───validators
├───.env
├───.env.example
├───.gitignore
├───package.json
├───package-lock.json
├───tsconfig.json
└───README.md