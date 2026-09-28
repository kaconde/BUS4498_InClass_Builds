# Review the previous attendance to registration Task Specification


## Basic Information

- **Task ID:** T7
- **Task name:** Review the previous attendance-to-registration rate
- **Task type:** Retrieve
- **Task owner:** CPVC



## 1. Task Description

The system gets the previous attendance rate to help estimate current event attendance.

## 2. Inputs

### Input 1

- **Input name:** Previous attendance data
- **Contents and format:** Previous registration totals and attendance totals used to decide the attendance to registration rate.
- **Source:** Previous event records

- **If a required input is missing or invalid:** Record the issue and send the case to CPVC. Do not create a replacement rate 

## 3. Outputs

### Output 1

- **Output name:** Previous attendance to registration rate
- **Contents and format:** The  attendance toregistration rate prepared for use in the estimate.
- **Next task or recipient:** T8 — Create an attendee estimate
- **Complete when:** The previous rate has been successfully retrieved or calculated. 


## 4. Planned Tools

### Tool 1

- **Tool name:** retrieve_previous_attendance_rate
- **Input:** Previous attendance data
- **Output:** Previous attendance-to-registration rate
- **Implementation Route:** Database queries
- **Integration approach:** Direct integration
- **Role in this task:** Retrieve the previous registration and attendance data and provide the attendance to registration rate.
- **Task timeout:** Each call may take 5 seconds or the remaining time, which ever one is shorter.
- **Maximum retries:** 1
- **Retry only when:** A temporary error stops the information from being retrieved.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the issue and send the case to CPVC.





