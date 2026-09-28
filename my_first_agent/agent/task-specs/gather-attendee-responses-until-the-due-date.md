# Gather attendee responses until the due date Task Specification

## Basic Information

- **Task ID:** T3
- **Task name:** Gather attendee responses until the due date
- **Task type:** Retrieve
- **Task owner:** CPVC


## 1. Task Description

The system collects attendance responses until the due date and saves them for review.

## 2. Inputs

### Input 1

- **Input name:** Attendance update requests
- **Contents and format:** Records of the attendance update requests sent to registered individuals.
- **Source:** T2 — Send attendance update requests to those registered individuals

### Input 2

- **Input name:** Attendee responses
- **Contents and format:** Attendance update responses submitted by registered attendees.
- **Source:** Attendees

- **If a required input is missing or invalid:** Record the issue. Responses that are missing, late, incomplete, or conflicting are handled by T4.

## 3. Outputs

### Output 1

- **Output name:** Collected attendee responses
- **Contents and format:** Available attendance update responses and their submission information.
- **Next task or recipient:** T4 — Review missing, late, incomplete, or conflicting responses
- **Complete when:** The response deadline has passed and all current responses up to then have been collected.


## 4. Planned Tools


### Tool 1

- **Tool name:** collect_attendee_responses
- **Input:** Attendance update requests and attendee responses
- **Output:** Collected attendee responses
- **Implementation Route:** Database queries
- **Integration approach:** Direct integration
- **Role in this task:** Collect and keep the available attendee responses until the response deadline
- **Task timeout:** Each call may take 5 seconds or the remaining time, which ever one is shorter.
- **Maximum retries:** 1
- **Retry only when:** A  error prevents available responses from being collected.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the issue and hand the case to CPVC.




