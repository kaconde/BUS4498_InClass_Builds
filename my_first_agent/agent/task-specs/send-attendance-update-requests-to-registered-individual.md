# Send attendance update requests to registered individuals Task Specification

## Basic Information

- **Task ID:** T2
- **Task name:** Send attendance update requests to registered individuals
- **Task type:** Act
- **Task owner:** CPVC



## 1. Task Description

The system sends an attendance update request to each registered attendee using the information from T1 and follows the same rules for everyone.

## 2. Inputs

### Input 1

- **Input name:** Reviewed registration information
- **Contents and format:** Registration records to those individuals who should get an attendance update request.
- **Source:** T1 

- **If a required input is missing or invalid:** Record the issue and send to CPVC. Do not send a request when the required attendee information is missing.

## 3. Outputs

### Output 1

- **Output name:** Attendance update requests
- **Contents and format:** The attendance update requests that were sent and also the record of each request 
- **Next task or recipient:** T3
- **Complete when:** The required attendance update requests have been sent and the send status has been recorded.


## 4. Planned Tools


### Tool 1

- **Tool name:** send_attendance_update_requests
- **Input:** Reviewed registration information
- **Output:** Attendance update requests
- **Implementation Route:** Web API calls
- **Integration approach:** Direct integration
- **Role in this task:** Send attendance update requests to those who are registered individuals and record if each request was sent.
- **Task timeout:** Each call may take 5 seconds or the remaining time, which ever one is shorter.
- **Maximum retries:** 1
- **Retry only when:** An error stop the request from being sent. Do not send a another one. 
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the request as not resolved and send it to CPVC. Do not assume it was sent. 


