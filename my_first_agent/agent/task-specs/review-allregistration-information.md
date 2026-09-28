# Review all registration information Task Specification


## Basic Information

- **Task ID:** T5
- **Task name:** Review all registration information
- **Task type:** Retrieve
- **Task owner:** CPVC


## 1. Task Description

The system gets and organizes the registration information needed to create the attendance estimate.

## 2. Inputs

### Input 1

- **Input name:** Registration information
- **Contents and format:** Available event registration records for registered attendees.
- **Source:** Event registration data

- **If a required input is missing or invalid:** Record the issue and hand the case to CPVC. Do not guess or assume any missing registration information.

## 3. Outputs

### Output 1

- **Output name:** Reviewed registration information
- **Contents and format:** Available registration information organized for the the attendance estimate.
- **Next task or recipient:** T8 — Create an attendee estimate
- **Complete when:** The available registration information has been retcovered and ready to be used in the estimate.



## 4. Planned Tools


### Tool 1

- **Tool name:** retrieve_registration_information
- **Input:** Registration information
- **Output:** Reviewed registration information
- **Implementation Route:** Database queries
- **Integration approach:** Direct integration
- **Role in this task:** Retrieve and organize the registration information for the attendance estimate.
- **Task timeout:** Each call may take  5 seconds or the remaining time, which ever one is shorter.
- **Maximum retries:** 1
- **Retry only when:** A temporary error stops the registration information from being recovered.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the issue and send the case to CPVC.




