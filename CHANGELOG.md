Changelog format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to slightly modified [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
---
## [v2021.0.6.0b] - 2021-02-14
### Moved into Beta
### Added
- Gameplay
- Selecting beatmaps through the beatmap selection screen
### Changed
- renamed experimental.js to gameplay.js
- moved gameplay.js to src/scripts
### Removed
- Old gameplay files
- experimental.js
- experimental.html
### Fixed
- dependency references in gameplay.js
---
## [v2021.0.5.2a] - 2021-02-13
### Added
- horizontal device support, ensures that devices are horizontal to be compatible
- disabled mobile device scrolling
### Changed
- separated css into files based on their respective sections
- stars in beatmap star rating have 100% opacity
- moved event listeners from html into javascript
- Massively reduced image sizes to reduce image load times and project size
- Moved stylesheets other than style.css from root to src/stylesheet
- Moved inline css to external stylesheets
- utils.replaceAll renamed to utils.removeInstances
- Increased osu!logo size from 50% of screen height to 70%
### Removed
- Beatmap.js (beatmap testing file)
### Fixed
- audio visualiser responsiveness
---
## [v2021.0.5.1a] - 2021-02-12
### Changed
- Scalability of beatmap loading was improved (generated on the fly)
---
## [v2021.0.5.0a] - 2021-02-10
### Changed
- Standardised changelog