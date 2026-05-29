#!/bin/bash

echo "======================================"
echo "Starting BrightLearn Services..."
echo "======================================"

# Start Backend
echo "Starting Spring Boot Backend..."
cd brightlearn-backend
./mvnw spring-boot:run &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "Starting React Frontend..."
cd brightlearn-frontend
# Using preview if you are expecting port 4173, otherwise change to 'npm run dev'
npm run dev &
FRONTEND_PID=$!
cd ..

echo "======================================"
echo "Services are running."
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop both services."
echo "======================================"

# Trap Ctrl+C and cleanly kill both processes
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT

# Wait to keep the script running
wait
