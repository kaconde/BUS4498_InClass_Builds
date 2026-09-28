# Finalize the attendee estimate Task Specification


## Basic Information

- **Task ID:** T9
- **Task name:** Finalize the attendee estimate
- **Task type:** Act
- **Task owner:** CPVC



## 1. Task Description

The system finalizes the attendance estimate only after CPVC approves it.

## 2. Inputs

### Input 1

- **Input name:** CPVC approval
- **Contents and format:** A recorded decision saying that CPVC approved the  estimate.
- **Source:** H1 — CPVC looks at the attendee estimate

### Input 2

- **Input name:** Attendee estimate
- **Contents and format:** The attendee estimate approved by CPVC.
- **Source:** T8 — Create an attendee estimate

- **If a required input is missing or invalid:** Do not finalize the estimate. Record the issue and send the case to CPVC.
## 3. Outputs

### Output 1

- **Output name:** Final attendee estimate
- **Contents and format:** The approved attendee estimate marked as final.
- **Next task or recipient:** CPVC
- **Complete when:** The approved estimate has been successfully marked as final.

## 4. Planned Tools


### Tool 1

- **Tool name:** finalize_attendee_estimate
- **Input:** CPVC approval and attendee estimate
- **Output:** Final attendee estimate
- **Implementation Route:** Database queries
- **Integration approach:** Direct integration
- **Role in this task:** Mark the attendee estimate as final after confirming that CPVC approved it.
- **Task timeout:** Each call may take 5 seconds or the remaining  time, which ever one is shorter.
- **Maximum retries:** 1
- **Retry only when:** A temporary error happens and the system can confirm that the estimate was not marked as final. This stops numerous updates.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the final status as unresolved and sned the case to CPVC. Do not report the estimate as final.




