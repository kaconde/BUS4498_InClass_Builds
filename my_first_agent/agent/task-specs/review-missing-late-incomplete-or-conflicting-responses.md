# review-missing-late-incomplete-or-conflicting-responses Task Specification

*BUS 4498 Team Build Milestone 1. Create one copy for each L3 task. Save it in `our_team_agent/agent/task-specs/` in `BUS4498_Team_Build`. Use the task name in lowercase with hyphens between words; replace `&` with `and` and remove other punctuation.*

*Keep the exact task ID and name from the workflow. Complete all six sections, including Tool Permissions and Boundaries. The reason for assigning L3 belongs only in the team worksheet. Replace prompts and remove template instructions before submitting. Tool scripts are not required.*

```yaml
# BASIC INFORMATION
task_id: "3"
task_name: "Review missing, late, incomplete, or conflicting resposnses"
task_owner: "CPVC"

# Agent Inference Configuration
Provider: Groq
Model: "[Exact supported Groq API model ID.]"
Role: Review missing, late, incomplete, or conflicting attendee responses and summarize the information for CPVC without changing attendee information.
Maximum inference requests per task run: 6
On inference failure or exhausted limits: Record the unresolved status and hand the case to CPVC.
```

## 1. Task Goal

- **Objective:** Review missing, late, incomplete, or conflicting responses so CPVC can recognize which responses they should look further into or correct. 

## 2. Inbound Inputs



### Input 1

- **Input name:** Attendee responses
- **What it contains:** The attende that are avaible with updates and responses 
- **Source:** Attendees
### Input 2

- **Input name:** Registration information
- **What it contains:** The attendee registration information is useful to see if the responses are missing, late, incomplete, or conflicting 
- **Source:** Registration system  

## 3. Tool Permissions and Boundaries

### Task-Wide Limits

- **Total task timeout:** 120 seconds for one task run, including tool calls, retries, reasoning, and waiting.
- **Maximum tool calls:** 6 calls across all tools during one task run; retries count toward this total.

### Tool 1

- **Tool name:** retrieve_attendee_information
- **Input:** Attendee responses and registration information.
- **Output:** Relevant attendee response and registration information needed to identify missing, late, incomplete, or conflicting responses.
- **Implementation Route:** Database queries.
- **Integration approach:** Direct integration.
- **Role in this task:** Support reviewing missing, late, incomplete, or conflicting attendee responses by retrieving the needed attendee responses and registration information.
- **Task timeout:** Each call may take at most 5 seconds or the remaining task time, whichever is shorter.
- **Maximum retries:** 1
- **Retry only when:** A temporary access or retrieval error prevents the information from being retrieved. Retry once only if enough task time and tool calls remain.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the unresolved issue and hand the case to CPVC. Do not assume or change attendee information.

### Tool 2

- **Tool name:** compare_attendee_responses
- **Input:** Attendee responses and registration information.
- **Output:** Responses identified as missing, late, incomplete, or conflicting, with the supporting attendee and registration information.
- **Implementation Route:** Functions/scripts.
- **Integration approach:** Direct integration.
- **Role in this task:** Support checking for missing, late, incomplete, or conflicting responses and summarizing the findings for CPVC.
- **Task timeout:** Each call may take at most 5 seconds or the remaining task time, whichever is shorter.
- **Maximum retries:** 0
- **Retry only when:** Not applicable.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the unresolved issue and hand the case to CPVC. Do not decide which information is correct and do not change attendee information.


## 4. How the Agent Should Reason


### Permitted Subtask 1

- **Subtask name:** Check missing responses 
- **Subtask description:** Compare the registration information with the attendee responses  to idenitfy who has a missing repsonse.
- **Subtask boundary:** May only identify missing responses. May not change information of attendee or create a response. 
- **Retry limits:** 0
### Permitted Subtask 2

- **Subtask name:** Check late responses 
- **Subtask description:** Review attendee responses to identify which responses were submitted after the deadline. 
- **Subtask boundary:** May only identify late responses. May not change what CPVC does about the response or change the deadline. 
- **Retry limits:** 0
### Permitted Subtask 3

- **Subtask name:** Check incomplete responses 
- **Subtask description:** Review the attendee responses to identify which responses are missing information. 
- **Subtask boundary:** May only identify incomplete responses. May not add information that is missing for the attendee. 
- **Retry limits:** 0
### Permitted Subtask 4

- **Subtask name:** Check conflicting responses 
- **Subtask description:** Compare attendee responses with registration information to identify information that is inconsistent. 
- **Subtask boundary:** May only identify conflicting responses. May not determine which information is correct or make changes to the attendees information. 
- **Retry limits:** 0

- **Decision guidance:** After each subtask, use its findings to select the permitted subtask most likely to resolve the most important remaining uncertainty. Do not follow a fixed sequence. If no permitted subtask can make useful progress, stop and hand the case to a person.

## 5. When to Stop or Hand Off to a Human

- **Stop successfully when:** All attendee responses have been reviewed and any missing, late, incomplete, or conflicting responses have been recognized. 
- **Hand off early when:** The information that is given is not clear, conflicting information is not able to be solved, or there isn't enough information to continue reviewing the response. 
- **Hand off to:** CPVC

Stop at the first applicable budget limit or handoff condition. While awaiting review, take no further autonomous action.

## 6. Outbound Deliverable

- **Status:** Completed or escalated to human.
- **Result or recommendation:** List the attendee responses that are identifed as missing,  late, incomplete, or conflicting. 
- **Evidence summary:** Summarize the attendee responses and registration information that led to each finding. 
- **Subtasks performed:** Permitted subtasks completed, including repeated attempts.
- **Unresolved issues:** Remaining uncertainties or questions; use none only if no unresolved issue remains.
- **Handoff note:** Reason for stopping, unresolved questions, and what the reviewer needs to decide; write "Not applicable" for a completed task.
- **Next task or recipient:** CPVC
