# Notes for future teams
- Recommended setup if you are on windows is to do everything through WSL, it has nice integration with VSCode and makes it easy to get everything up and running quickly. You can do it through docker but I don't recommend that for just development as it can be slow if your computer doesn't have a lot of memory and can take a while to update it for small changes.
- If you are working on the client, you can uncomment the hardcoded student and instructor tokens in the App.tsx file and then run both the client and server at the same time. This will let you access the client at localhost:9000, which lets you do things like hot reloading which can speed up client development. Otherwise, you can just build the client and then run the server for general development mode use.
- Easy things to start with for your first few sprints:
1. Remove the answer_responses table, we had that in our initial design and it got created, but we never used it as we ended up just storing answer data as JSON in the database. It will also help you figure out how to do database migrations.
2. Get muleiple answer questions added, should be able to repurpose most of the multiple choice question component for this.
3. Get confidence ratings added. Dr. Bean started on this between semesters but we never got around to finishing it up and adding it to the project, so you should have a little bit of starter code to work with.

# Changelog
- Ability to set if possible points display or not
- Ability to delete questions from the exam
- Changed student_responses table to not store historical responses
- Run multiple exams and students in development mode

# CodingExam
In this release, the app is still early in development, so it has been marked as pre-release. Instructions for setting up the development environment can be found in the "Developer Documentation" file in the "documentation-testing" folder. This includes how to set up the docker installation, start the application in development, and have the application display in Canvas through an HTTPS proxy. Additionally, a "ResetDatabaseScript.sql" file has been included in the "database" folder if the database needs to be reset in development mode.

# Documentation
User and developer documentation for this sprint can be found in the "documentation-testing" folder as well.

# Testing
To initialize the test database for unit tests, the command "node serverTestEntry.js" should be run first to setup and seed the database. To run the unit tests, navigate to the "server" folder and run the command "npm test".

For testing the client, to test the functionality of the components for the Student and Instructor views, testing plans have been included in the "documentation-testing" folder as well. Additionally, the User Documentation can also be used to supplement the testing plans, as it walks the user through most of the application's functionality.
