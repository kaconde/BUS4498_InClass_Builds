# review-registration-information Task Specification


## Basic Information

- **Task ID:** T1
- **Task name:** Review registration information 
- **Task type:** Retrieve
- **Task owner:** CPVC

## 1. Task Description

The system gets and reviews the registration information for the event. It uses rules to get registration for the attendance workflow. This information will be helpful and is needed before the update request are sent out to the individuals. 

## 2. Inputs

### Input 1

- **Input name:** Registration information 
- **Contents and format:** Registration records for those who have registered to the event and with the information that is needed to help identify each registered person. 
- **Source:** Event registration date 

- **If a required input is missing or invalid:** Record the problem and send to CPVC. Don't continue thinking the information for registration was recovered. 
## 3. Outputs

### Output 1

- **Output name:** Reviewed registration information 
- **Contents and format:** The registration records ready to use for attendance requests 
- **Next task or recipient:** Send the attendance update requests to those who are registered individuals 
- **Complete when:** The current registration information has been recovered and ready.  


## 4. Planned Tools

### Tool 1

- **Tool name:** retrieve_registration_information 
- **Input:** Registration information 
- **Output:** Reviewed registration information 
- **Implementation Route:** Database queries 
- **Integration approach:** Direct integration 
- **Role in this task:** Retrieve the availbale registration record that are needed for the attendance update process. 
- **Task timeout:** Every call may take up to 5 seconds or the remaining time, which ever one is shorter. 
- **Maximum retries:** 1
- **Retry only when:** A error prevents the registration information from loading. Retry once if there is time 
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the problem and give the case to CPVC. Do not assume the information was retrieved. 





