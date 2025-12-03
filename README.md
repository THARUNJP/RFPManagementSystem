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

# Decision: Background Processing vs Job Queue

We used simple in-process background processing here for quick, non-blocking email sending; a job queue can be added later for better scalability.

When to use a job queue: Best suited for sending hundreds or thousands of emails, or when tasks need retries, batching, or distributed workers.

Adding a job queue like RabbitMQ or similar is unnecessary for this assignment due to the current email volume and scope
