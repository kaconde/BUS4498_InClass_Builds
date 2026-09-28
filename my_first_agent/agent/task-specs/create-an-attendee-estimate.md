# Create an attendee estimate Task Specification


## Basic Information

- **Task ID:** T8
- **Task name:** Create an attendee estimate
- **Task type:** Reason
- **Task owner:** CPVC



## 1. Task Description

The system uses the registration information, attendance updates, and previous attendance rate to estimate attendance and sends it to CPVC for review.

## 2. Inputs

### Input 1

- **Input name:** Reviewed registration information
- **Contents and format:** Available registration information prepared for the estimate.
- **Source:** T5

### Input 2

- **Input name:** Reviewed attendance updates
- **Contents and format:** Attendance update information prepared for use in the estimate.
- **Source:** T6

### Input 3

- **Input name:** Previous attendance-to-registration rate
- **Contents and format:** Historical attendance-to-registration rate.
- **Source:** T7 

- **If a required input is missing or invalid:** Record the issue and send to CPVC. Do not create an estimate using assumed information.


## 3. Outputs

### Output 1

- **Output name:** Attendee estimate
- **Contents and format:** An estimated number of attendees based on the available registration information, attendance updates, and rate.
- **Next task or recipient:** H1 
- **Complete when:** An attendee estimate has been started and is available for CPVC to review.


## 4. Planned Tools

### Tool 1

-- **Tool name:** create_attendee_estimate
- **Input:** Reviewed registration information, attendance updates, and previous attendance to registration rate
- **Output:** Attendee estimate
- **Implementation Route:** Functions
- **Integration approach:** Direct integration
- **Role in this task:** Use the available inputs to calculate the attendee estimate.
- **Task timeout:** Each call may take  5 seconds or the remaining time, which ever one is shorter.
- **Maximum retries:** 0
- **Retry only when:** Not applicable because no additional retries are allowed.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the  issue and send the case to CPVC. Do not treat the estimate as completed or final. 





