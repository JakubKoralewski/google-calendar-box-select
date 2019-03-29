# Changelog
This is a changelog for the Google Calendar Box Select extension.

## [Unreleased] 
<small>These are the changes not yet assigned to any release.</small>

## 0.2.1 - 2019-03-29
Mutation Observers, prettify consoles.

#### Added
- Mutation Observers listening to DOM changes on HTMLDivElements containing the elements now let the id of selected shadow be restored instantly.
- on reset (in some cases, because resetting in the whole page is sometimes also done) only the mutation observed containers that changed are reset
- added a CHANGELOG.md (what you are looking at right now)
#### Changed
- use console groups and groupEnds to kind of start prettifying the console in developer mode

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