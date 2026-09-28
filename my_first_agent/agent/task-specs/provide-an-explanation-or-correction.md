# Provide an explanation or correction Task Specification



## Basic Information

- **Task ID:** T10
- **Task name:** Provide an explanation or correction
- **Task type:** Decide
- **Task owner:** CPVC


## 1. Task Description

If CPVC does not approve the estimate, CPVC provides feedback on what needs to change. The system records the feedback.

## 2. Inputs

### Input 1

### Input 1

- **Input name:** Attendee estimate
- **Contents and format:** The attendee estimate that CPVC did not approve.
- **Source:** T8

### Input 2

- **Input name:** CPVC review decision
- **Contents and format:** The human review showing that the estimate was not approved.
- **Source:** H1 
- **If a required input is missing or invalid:** CPVC cannot provide the required correction. Record the issue and let the case stay with CPVC.


## 3. Outputs

### Output 1

- **Output name:** CPVC explanation or correction
- **Contents and format:** Human feedback explaining why estimate was not approved or what is needed to be fixed.
- **Next task or recipient:** T8 
- **Complete when:** CPVC has submitted the explanation or correction needed for another estimate or calculation.



## 4. Planned Tools


### Tool 1

- **Tool name:** Not applicable 
- **Input:** Attendee estimate and CPVC review decision
- **Output:** CPVC explanation or correction
- **Implementation Route:** Not applicable 
- **Integration approach:** Not applicable 
- **Role in this task:** CPVC gives the explanation or correction. The system can record the response but does not create or select the correction.
- **Task timeout:** CPVC should respond by the human response deadline. 
- **Maximum retries:** Not applicable 
- **Retry only when:** Not applicable 
- **On timeout, exhausted retries, or an error that cannot be retried:** If CPVC does not provide explanation or correction by  deadline record the problem as unresolved and let the case stay with CPVC. Do not think the missing response like an approval.



