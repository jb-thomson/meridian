# Course structures & standards used to build this site

This documents where the unit/topic structure for each course came from, so nothing is a guess.

## AP World History: Modern — 9 units, 71 topics (College Board CED)
Verified against the official College Board CED PDF, the AP Students course page, and cross-checked against two independent teacher-resource guides (UWorld CollegePrep, Fiveable) after an initial fetch produced an inaccurate Unit 8 list. Full unit/topic list lives in `build/data/courses/ap-world-history.json`.
Sources: [College Board CED PDF](https://apcentral.collegeboard.org/media/pdf/ap-world-history-modern-course-and-exam-description.pdf) · [AP Students](https://apstudents.collegeboard.org/courses/ap-world-history-modern) · [UWorld CollegePrep](https://collegeprep.uworld.com/ap/ap-world-history-modern/units-topics-and-key-concepts/) · [Fiveable](https://fiveable.me/ap-world)

## AP U.S. Government and Politics — 5 units, 60 topics (College Board CED)
Also requires 9 Foundational Documents and 15 required Supreme Court cases woven across units — listed on each course's index page and in `ap-gov.json`.
Sources: [AP Students](https://apstudents.collegeboard.org/courses/ap-united-states-government-and-politics) · [Fiveable](https://fiveable.me/ap-gov) · [UWorld CollegePrep](https://collegeprep.uworld.com/ap/ap-us-government-and-politics/units-topics-and-key-concepts/)

## AP Comparative Government and Politics — 5 units, 43 topics (College Board CED)
This is the **current, post-2024-25-redesign** structure (six country case studies — China, Iran, Mexico, Nigeria, Russia, UK — studied across five thematic units), confirmed against College Board's official "Course at a Glance" PDF. Do not confuse with the older pre-redesign country-unit structure.
Sources: [Official Course-at-a-Glance PDF](https://apcentral.collegeboard.org/media/pdf/ap-comparative-government-and-politics-course-at-a-glance.pdf) · [AP Students](https://apstudents.collegeboard.org/courses/ap-comparative-government-and-politics) · [Fiveable](https://fiveable.me/ap-comp-gov)

## Economics — 8 units, 32 topics (not an AP course)
Not aligned to a single official "common core" for economics (none exists) — instead mapped to:
- **CEE/NCEE Voluntary National Content Standards in Economics** (20 standards) and the companion **CEE National Standards for Personal Financial Education** (6 categories) — the closest thing to a national economics standard.
- **DoDEA's social studies standards**, which are explicitly built on the **NCSS C3 Framework**; DoDEA's own Grades 9–12 standards PDF was not directly fetchable (robots-blocked), so the C3 Framework's own Economics indicators (D2.Eco.1–15) are used as a well-justified proxy for DoDEA's economics strand.
- Note: DoDEA teaches personal finance in a *separate* course (Business & Personal Finance, PTB301) from its Economics course (SSN401/SSN4010T) — Unit 8 here folds personal finance in for a single semester course, which is a deliberate deviation from DoDEA's own course split, done for your convenience.

Full standards mapping (which CEE standard + which D2.Eco indicator each unit covers) lives in `build/data/courses/economics.json` under `standards` per unit.
Sources: [CEE Voluntary National Content Standards in Economics](https://www.councilforeconed.org/wp-content/uploads/2012/03/voluntary-national-content-standards-2010.pdf) · [CEE Personal Financial Education Standards](https://www.councilforeconed.org/wp-content/uploads/2021/10/2021-National-Standards-for-Personal-Financial-Education.pdf) · [DoDEA Social Studies Standards](https://www.dodea.edu/curriculum/social-studies/standards) · [C3 Framework](https://history.appstate.edu/sites/history.appstate.edu/files/c3_framework_-_dimension_2_-_all_social_studies.pdf)

## What's fully written vs. structural-only right now
- **Fully written** (narrative, vocab, TL;DR, fun facts, AP tips, images, discussion Qs, 5 MCQs, SAQ/LEQ or reflection prompt): AP World History 1.1, Economics 2.3 (includes the interactive supply-and-demand model).
- **Structural only** ("Coming soon" — real page exists, honest placeholder, not fake content): every other topic across all 4 courses. Titles, unit groupings, and numbering are all sourced from the CED/standards above, so the navigation is complete even though the writing isn't yet.
