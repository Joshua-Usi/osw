Changelog format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to slightly modified [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
---
## [v2021.0.7.0b] - 2021-02-22
### Added
- Added more default maps
### Changed
- Beatmaps are now loaded via fetch calls, instead of specialised javascript files
### Deprecated
- Loading beatmaps using the require.js template
### Removed
- beatmap template
### Fixed
- Slider heads and ends having the correct symbols
---
## [v2021.0.6.2b] - 2021-02-16
### Added
- Pause Menu UI functionality
- Continue, Retry and Quit functions for mapss
### Fixed
- Going in and out of maps causing multiple beatmap instances to run
---
## [v2021.0.6.1b] - 2021-02-15
### Added
- Pause Menu UI (currently inaccessible)
### Changed
- Doubled triangle-background speed
---
## [v2021.0.6.0b] - 2021-02-14
### Moved into Beta
### Added
- Gameplay
- Selecting beatmaps through the beatmap selection screen
### Changed
- Renamed experimental.js to gameplay.js
- Moved gameplay.js to src/scripts
### Removed
- Old gameplay files
- experimental.js
- experimental.html
### Fixed
- Dependency references in gameplay.js
- Audio in the main menu playing while playing a beatmap
- Centerised audio visualiser
- Fixed backup time (when audio fails to load) from referencing when page first loads
---
## [v2021.0.5.2a] - 2021-02-13
### Added
- Horizontal device support, ensures that devices are horizontal to be compatible
- Disabled mobile device scrolling
### Changed
- Separated css into files based on their respective sections
- Stars in beatmap star rating have 100% opacity
- Moved event listeners from html into javascript
- Massively reduced image sizes to reduce image load times and project size
- Moved stylesheets other than style.css from root to src/stylesheet
- Moved inline css to external stylesheets
- Renamed utils.replaceAll to utils.removeInstances
- Increased osu!logo size from 50% of screen height to 70%
### Removed
- Beatmap.js (beatmap testing file)
### Fixed
- Audio visualiser responsiveness
---
## [v2021.0.5.1a] - 2021-02-12
### Changed
- Scalability of beatmap loading was improved (generated on the fly)
---
## [v2021.0.5.0a] - 2021-02-10
### Changed
- Standardised changelog