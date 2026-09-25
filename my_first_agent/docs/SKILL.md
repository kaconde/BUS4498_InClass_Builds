---
name: "job-finding"
description: "Find job opportunities that go with the users wants and qualifications. Use when the user asks to search for jobs."
---

# job-finding

## User inputs
On each run , the user will supply which type of job they would like, the location, and the  job requirements. When there is some important information missing ask the user before moving on.

## Procedure
1. read the users job requirements 
2. search for job postings that go with the users job, location, and requirements 
3. check that they match the users requirements 
4. remove jobs that don't go with the users requirements 
5. give the user the best job opportunities with the details

## Output
Return a list of matching job postings with the job title, company, location,  and an explanation of why each job goes with the user’s requirements.

## Boundaries
Do not claim a job matches if important requirements are unclear. Do not apply to jobs or contact employers unless the user asks. If no good matches are found, report that and explain which requirements limited the results
