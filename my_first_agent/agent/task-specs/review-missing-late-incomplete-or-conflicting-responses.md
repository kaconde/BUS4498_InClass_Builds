# review-missing-late-incomplete-or-conflicting-responses Task Specification

*BUS 4498 Team Build Milestone 1. Create one copy for each L3 task. Save it in `our_team_agent/agent/task-specs/` in `BUS4498_Team_Build`. Use the task name in lowercase with hyphens between words; replace `&` with `and` and remove other punctuation.*

*Keep the exact task ID and name from the workflow. Complete all six sections, including Tool Permissions and Boundaries. The reason for assigning L3 belongs only in the team worksheet. Replace prompts and remove template instructions before submitting. Tool scripts are not required.*

```yaml
# BASIC INFORMATION
task_id: "3"
task_name: "Review missing, late, incomplete, or conflicting resposnses"
task_owner: "CPVC"

# Agent Inference Configuration
Provider: [e.g., Groq, OpenAI, Claude, Google Gemini]
Model: "[Exact supported API model ID.]"
Role: [permitted subtasks the model supports]
Maximum inference requests per task run: "[Whole-number limit.]"
On inference failure or exhausted limits: Record the unresolved status and hand the case to [human role].
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

*Name each planned tool and specify its permitted use. Use verb-object names, such as `retrieve_records`, usually matching the task or permitted subtask it supports. Tool name identifies the capability; tool type identifies the proposed implementation. No scripts or working integrations are required.*

### Task-Wide Limits

- **Total task timeout:** [Maximum elapsed time for one task run, with units; include tool calls, retries, and waiting.]
- **Maximum tool calls:** [Maximum total calls across all tools during one task run; retries count toward this total.]

### Tool 1

- **Tool name:** [Proposed verb-object name, used consistently throughout the project.]
- **Tool type:** [For example: Python script, pretrained model, API request, database query, or language-model call.]
- **Supports these permitted subtasks:** [Names from Section 4.]
- **Allowed use:** [What the tool may read, create, change, or send; identify permitted data sources and destinations.]
- **Prohibited use:** [Actions, data, or destinations outside this tool's authority.]
- **Approval required:** [What requires approval, who provides it, and when. Write "None within the allowed use" if applicable.]
- **Timeout per call:** [Maximum duration of a single attempt, with units.]
- **Maximum retries per call:** [Nonnegative whole number of additional attempts after the first; 0 means no retries.]
- **Retry conditions and failure response:** [When a retry is allowed, any waiting interval, and what happens on timeout or exhausted retries. For actions that change state, avoid duplicate actions and hand off if the outcome is uncertain.]

*Copy the Tool block as needed. Tool-specific and task-wide limits both apply; stop at whichever is reached first. Naming a tool does not authorize uses outside its stated permissions.*

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
