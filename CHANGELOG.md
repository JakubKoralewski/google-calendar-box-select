# Changelog
This is a changelog for the Google Calendar Box Select extension.

## [Unreleased] 
<small>These are the changes not yet assigned to any release.</small>
#### Added
- Mutation Observers listening to DOM changes on HTMLDivElements containing the elements now let the id of selected shadow be restored instantly.
- added a CHANGELOG.md (what you are looking at right now)

## 0.2 - 2019-02-08
Completely moved the project to TypeScript. Actions made to multiple events at once now get repeated using Fetch requests.

#### Added
- applying these actions to multiple events at the same time:
  - dragging 
  - changing color
  - changing duration
- restoring shadow when event dragged to another day
#### Changed
- object oriented approach

## 0.1 - 2019-01-15
This is where it all started. Good times :) Was using JavaScript like a n00b, could only delete using the shortcut.