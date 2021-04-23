Changelog format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
---
## [v0.6.2] - 2021-04-24
### Changed
- Star rating to more closely match classical osu!
---
## [v0.6.1b] - 2021-04-22
### Changed
- Adjusted a few animations to feel more lazer-like
### Removed
- Menu blurring (massively increased performance)
---
## [v0.6.0b] - 2021-04-21 - UNSTABLE
### Added
- Ability to upload and save osz files for later
- Ability to play and save maps locally on the user file system
### Changed
- Star rating to now consider jumps and streams more impressive
### Deprecated
- Old maps
### Removed
- Old maps that were fetched via javascript fetch calls
### Fixed
- A small issue where spinners would not spin
- An issue when ending a beatmaps, the back button (and the bar it sits on) will disappear
---
## [v0.5.0b] - 2021-04-04
### Added
- Results screen
- Rank icon images (custom-made)
### Removed
- Unecessary module references
### Fixed
- Restarting, continuing and moving onto another beatmap
- Restarting beatmaps causing sliders to instantly end, fixed by creating clones instead of referencing objects
---
## [v0.4.1b] - 2021-04-02
### Changed
- Star rating now considers the angle between jumps
- Star rating now considers jumps less impressive (moving galaxy collapse [Galactic] from 13.05* to just under 10* )
---
## [v0.4.0b] - 2021-04-01 - Refactor update
### Added
- Combo Numbers
- Combo Colours
- Combo support for beatmap parser
- Custom osw background
### Changed
*From https://github.com/jylescoad-ward
- Warning text when running without web server
### Removed
- Unnecessary Audio Files
- More official osu! files
---
## [0.3.1b] - 2021-03-29
### Added
- HP now only starts draining 2 seconds before the first note
### Changed
- Smoother Auto (less jumpy)
- Auto now spins on spinners
---
## [0.3.0b] - 2021-03-23
### Changed
- rebranded to osw! due to copyright and trademark issues
- New octagonal logo
- changed and removed most osu! copyrighted images
- New intro supports new logo
---
## [0.2.1b] - 2021-03-18
### Added
- When pressing play, a beatmap is randomly selected for you to play! presuming you have any
- Brightening filter whenever a beat is detected
- Added beat bars (near edges of screen that alternate every beat)
### Fixed
- Logo beats from flashing in the wrong spot sometimes
---
## [0.2.0b] - 2021-03-11
### Added
- Automatic beat detection via audio analyser (not perfect but good enough)
### Removed
- Song API (now succeeded by automatic beat detection)
- Reliance on wave.js
---
## [0.2.4b] - 2021-03-11
### Changed
- Mouse sensitivity slider to be more precise
### Fixed
- Slider resolution and mouse sensitivity sliders from not saving properly
---
## [0.2.3b] - 2021-03-08
### Added
*Based off https://github.com/ppy/osu/issues/7048*
- snaking in sliders
- hit effects
### Changed
- Follow circle size from 2.4x to 2.0x (still feels too large)
---
## [0.2.2b] - 2021-03-06
### Added
- Splash screen text to denote heavy developement
- Notelock styles
---
## [0.2.1b] - 2021-02-23
### Changed
- Approach circle minimium size to match osu!
---
## [0.2.0b] - 2021-02-22
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
## [0.1.2b] - 2021-02-16
### Added
- Pause Menu UI functionality
- Continue, Retry and Quit functions for mapss
### Fixed
- Going in and out of maps causing multiple beatmap instances to run
---
## [0.1.1b] - 2021-02-15
### Added
- Pause Menu UI (currently inaccessible)
### Changed
- Doubled triangle-background speed
---
## [0.1.0b] - 2021-02-14
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
## [0.1.2a] - 2021-02-13
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
## [0.1.1a] - 2021-02-12
### Changed
- Scalability of beatmap loading was improved (generated on the fly)
---
## [0.1.0a] - 2021-02-10
### Changed
- Standardised changelog