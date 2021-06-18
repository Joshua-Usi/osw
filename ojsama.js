// this is free and unencumbered software released into the public
// domain. refer to the attached UNLICENSE or http://unlicense.org/
//
// [![Build Status](
// https://travis-ci.org/Francesco149/ojsama.svg?branch=master)](
// https://travis-ci.org/Francesco149/ojsama)
//
// pure javascript implementation of
// https://github.com/Francesco149/oppai-ng intended to be easier
// to use and set up for js developers as well as more portable
// than straight up bindings at the cost of some performance
//
// installation:
// ----------------------------------------------------------------
// since this is a single-file library, you can just drop the file
// into your project:
// ```sh
// cd my/project
// curl https://waa.ai/ojsama > ojsama.js
// ```
//
// or include it directly in a html page:
// ```html
// <script type="text/javascript" src="ojsama.min.js"></script>
// ```
//
// it's also available as a npm package:
// ```sh
// npm install ojsama
// ```
//
// you can find full documentation of the code at
// http://hnng.moe/stuff/ojsama.html or simply read ojsama.js
//
// usage (nodejs):
// ----------------------------------------------------------------
// (change ./ojsama to ojsama if you installed through npm)
//
// ```js
// var readline = require("readline");
// var osu = require("./ojsama");
//
// var parser = new osu.parser();
// readline.createInterface({
//   input: process.stdin, terminal: falsei
// })
// .on("line", parser.feed_line.bind(parser))
// .on("close", function() {
//   console.log(osu.ppv2({map: parser.map}).toString());
// });
// ```
//
// ```sh
// $ curl https://osu.ppy.sh/osu/67079 | node minexample.js
// 133.24 pp (36.23 aim, 40.61 speed, 54.42 acc)
// ```
//
// advanced usage (nodejs with acc, mods, combo...):
// ----------------------------------------------------------------
// ```js
// var readline = require("readline");
// var osu = require("./ojsama");
//
// var mods = osu.modbits.none;
// var acc_percent;
// var combo;
// var nmiss;
//
// // get mods, acc, combo, misses from command line arguments
// // format: +HDDT 95% 300x 1m
// var argv = process.argv;
//
// for (var i = 2; i < argv.length; ++i)
// {
//   if (argv[i].startsWith("+")) {
//     mods = osu.modbits.from_string(argv[i].slice(1) || "");
//   }
//
//   else if (argv[i].endsWith("%")) {
//     acc_percent = parseFloat(argv[i]);
//   }
//
//   else if (argv[i].endsWith("x")) {
//     combo = parseInt(argv[i]);
//   }
//
//   else if (argv[i].endsWith("m")) {
//     nmiss = parseInt(argv[i]);
//   }
// }
//
// var parser = new osu.parser();
// readline.createInterface({
//   input: process.stdin, terminal: false
// })
// .on("line", parser.feed_line.bind(parser))
// .on("close", function() {
//   var map = parser.map;
//   console.log(map.toString());
//
//   if (mods) {
//     console.log("+" + osu.modbits.string(mods));
//   }
//
//   var stars = new osu.diff().calc({map: map, mods: mods});
//   console.log(stars.toString());
//
//   var pp = osu.ppv2({
//     stars: stars,
//     combo: combo,
//     nmiss: nmiss,
//     acc_percent: acc_percent,
//   });
//
//   var max_combo = map.max_combo();
//   combo = combo || max_combo;
//
//   console.log(pp.computed_accuracy.toString());
//   console.log(combo + "/" + max_combo + "x");
//
//   console.log(pp.toString());
// });
// ```
//
// ```sh
// $ curl https://osu.ppy.sh/osu/67079 | node example.js
// TERRA - Tenjou no Hoshi ~Reimeiki~ [BMax] mapped by ouranhshc
//
// AR5 OD8 CS4 HP8
// 262 circles, 69 sliders, 5 spinners
// 469 max combo
//
// 4.33 stars (2.09 aim, 2.19 speed)
// 100.00% 0x100 0x50 0xmiss
// 469/469x
// 133.24 pp (36.23 aim, 40.61 speed, 54.42 acc)
//
// $ curl https://osu.ppy.sh/osu/67079 \
// | node example.js +HDDT 98% 400x 1m
// ...
// +HDDT
// 6.13 stars (2.92 aim, 3.11 speed)
// 97.92% 9x100 0x50 1xmiss
// 400/469x
// 266.01 pp (99.70 aim, 101.68 speed, 60.41 acc)
// ```
//
// usage (in the browser)
// ----------------------------------------------------------------
// ```html
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="utf-8" />
//   <script type="text/javascript" src="ojsama.min.js"></script>
//   <script type="text/javascript">
//   function load_file()
//   {
//     var frame = document.getElementById("osufile");
//     var contents = frame.contentWindow
//       .document.body.childNodes[0].innerHTML;
//
//     var parser = new osu.parser().feed(contents);
//     console.log(parser.toString());
//
//     var str = parser.map.toString();
//     str += osu.ppv2({map: parser.map}).toString();
//
//     document.getElementById("result").innerHTML = str;
//   }
//   </script>
// </head>
// <body>
//   <iframe id="osufile" src="test.osu" onload="load_file();"
//   style="display: none;">
//   </iframe>
//   <blockquote><pre id="result">calculating...</pre></blockquote>
// </body>
// </html>
// ```
//
// (this example assumes you have a test.osu beatmap in the same
// directory)
//
// performance
// ----------------------------------------------------------------
// this is around 50-60% slower than the C implementation and uses
// ~10 times more memory.
// ```sh
// $ busybox time -v node --use_strict test.js
// ...
// User time (seconds): 16.58
// System time (seconds): 0.43
// Percent of CPU this job got: 101%
// Elapsed (wall clock) time (h:mm:ss or m:ss): 0m 16.70s
// ...
// Maximum resident set size (kbytes): 314080
// Minor (reclaiming a frame) page faults: 20928
// Voluntary context switches: 72138
// Involuntary context switches: 16689
// ```
// # code documentation
// when used outside of node, a osu namespace will be exposed
// without polluting the global scope
var osu = {};
if (typeof exports !== "undefined") {
  osu = exports;
}
(function() {
  osu.VERSION_MAJOR = 2;
  osu.VERSION_MINOR = 2;
  osu.VERSION_PATCH = 0;
  // internal utilities
  // ----------------------------------------------------------------
  // override console with nop when running in a browser
  var log = {
    warn: Function.prototype
  };
  if (typeof exports !== "undefined") {
    log = console;
  }
  var array_toFixed = function(arr, n) {
    var res = new Array(arr.length);
    for (var i = 0; i < res.length; ++i) {
      res[i] = arr[i].toFixed(n);
    }
    return res;
  };

  function isUndefined(val) {
    return typeof val === "undefined";
  }
  // timing point
  // ----------------------------------------------------------------
  // defines parameters such as timing and sampleset for an interval.
  // for pp calculation we only need time and ms_per_beat
  //
  // it can inherit from its preceeding point by having
  // change = false and setting ms_per_beat to a negative value which
  // represents the bpm multiplier as ```-100 * bpm_multiplier```
  function timing(values) {
    this.time = values.time || 0.0;
    this.ms_per_beat = values.ms_per_beat;
    if (this.ms_per_beat === undefined) {
      this.ms_per_beat = 600.0;
    }
    this.change = values.change;
    if (this.change === undefined) {
      this.change = true;
    }
  }
  timing.prototype.toString = function() {
    return "{ time: " + this.time.toFixed(2) + ", " + "ms_per_beat: " + this.ms_per_beat.toFixed(2) + " }";
  }
  // hit objects
  // ----------------------------------------------------------------
  // partial structure of osu! hitobjects with just enough data for
  // pp calculation
  // bitmask constants for object types. note that the type can
  // contain other flags so you should always check type with
  // ```if (type & objtypes.circle) { ... }```
  var objtypes = {
    circle: 1 << 0,
    slider: 1 << 1,
    spinner: 1 << 3,
  };
  // all we need from circles is their position. all positions
  // stored in the objects are in playfield coordinates (512*384
  // rect)
  function circle(values) {
    this.pos = values.pos || [0, 0];
  }
  circle.prototype.toString = function() {
    return "pos: [" + array_toFixed(this.pos, 2) + "]";
  };
  // to calculate max combo we need to compute slider ticks
  //
  // the beatmap stores the distance travelled in one repetition and
  // the number of repetitions. this is enough to calculate distance
  // per tick using timing information and slider velocity.
  //
  // note that 1 repetition means no repeats (1 loop)
  function slider(values) {
    this.pos = values.pos || [0, 0];
    this.distance = values.distance || 0.0;
    this.repetitions = values.repetitions || 1;
  }
  slider.prototype.toString = function() {
    return ("pos: " + array_toFixed(this.pos, 2) + ", " + "distance: " + this.distance.toFixed(2) + ", " + "repetitions: " + this.repetitions);
  };
  // generic hitobject
  //
  // the only common property is start time (in millisecond).
  // object-specific properties are stored in data, which can be
  // an instance of circle, slider, or null
  function hitobject(values) {
    this.time = values.time || 0.0;
    this.type = values.type || 0;
    if (!isUndefined(values.data)) this.data = values.data;
  }
  hitobject.prototype.typestr = function() {
    var res = "";
    if (this.type & objtypes.circle) res += "circle | ";
    if (this.type & objtypes.slider) res += "slider | ";
    if (this.type & objtypes.spinner) res += "spinner | ";
    return res.substring(0, Math.max(0, res.length - 3));
  };
  hitobject.prototype.toString = function() {
    return ("{ time: " + this.time.toFixed(2) + ", " + "type: " + this.typestr() + (this.data ? ", " + this.data.toString() : "") + " }");
  };
  // beatmap
  // ----------------------------------------------------------------
  // gamemode constants
  var modes = {
    std: 0,
  };
  // partial beatmap structure with just enough data for pp
  // calculation
  function beatmap() {
    this.reset();
  }
  beatmap.prototype.reset = function() {
    this.format_version = 1;
    this.mode = modes.std;
    this.title = this.title_unicode = "";
    this.artist = this.artist_unicode = "";
    this.creator = "";
    this.version = "";
    this.ar = undefined;
    this.cs = this.od = this.hp = 5.0;
    this.sv = this.tick_rate = 1.0;
    this.ncircles = this.nsliders = this.nspinners = 0;
    if (!this.objects) {
      this.objects = [];
    } else {
      this.objects.length = 0;
    }
    if (!this.timing_points) {
      this.timing_points = [];
    } else {
      this.timing_points.length = 0;
    }
    return this;
  };
  // max combo calculation
  //
  // this is given by ncircles + nspinners + nsliders * 2
  // (heads and tails) + nsliderticks
  //
  // we approximate slider ticks by calculating the
  // playfield pixels per beat for the current section
  // and dividing the total distance travelled by
  // pixels per beat. this gives us the number of beats,
  // which multiplied by the tick rate gives use the
  // tick count.
  beatmap.prototype.max_combo = function() {
    var res = this.ncircles + this.nspinners;
    var tindex = -1;
    var tnext = Number.NEGATIVE_INFINITY;
    var px_per_beat = 0.0;
    for (var i = 0; i < this.objects.length; ++i) {
      var obj = this.objects[i];
      if (!(obj.type & objtypes.slider)) {
        continue;
      }
      // keep track of the current timing point without
      // looping through all of them for every object
      while (obj.time >= tnext) {
        ++tindex;
        if (this.timing_points.length > tindex + 1) {
          tnext = this.timing_points[tindex + 1].time;
        } else {
          tnext = Number.POSITIVE_INFINITY;
        }
        var t = this.timing_points[tindex];
        var sv_multiplier = 1.0;
        if (!t.change && t.ms_per_beat < 0) {
          sv_multiplier = -100.0 / t.ms_per_beat;
        }
        // beatmaps older than format v8 don't apply
        // the bpm multiplier to slider ticks
        if (this.format_version < 8) {
          px_per_beat = this.sv * 100.0;
        } else {
          px_per_beat = this.sv * 100.0 * sv_multiplier;
        }
      }
      var sl = obj.data;
      var num_beats = (sl.distance * sl.repetitions) / px_per_beat;
      // subtract an epsilon to prevent accidental
      // ceiling of whole values such as 2.00....1 -> 3 due
      // to rounding errors
      var ticks = Math.ceil(
        (num_beats - 0.1) / sl.repetitions * this.tick_rate);
      --ticks;
      ticks *= sl.repetitions;
      ticks += sl.repetitions + 1;
      res += Math.max(0, ticks);
    }
    return res;
  };
  beatmap.prototype.toString = function() {
    var res = this.artist + " - " + this.title + " [";
    if (this.title_unicode || this.artist_unicode) {
      res += "(" + this.artist_unicode + " - " + this.title_unicode + ")";
    }
    res += (this.version + "] mapped by " + this.creator + "\n" + "\n" + "AR" + parseFloat(this.ar.toFixed(2)) + " " + "OD" + parseFloat(this.od.toFixed(2)) + " " + "CS" + parseFloat(this.cs.toFixed(2)) + " " + "HP" + parseFloat(this.hp.toFixed(2)) + "\n" + this.ncircles + " circles, " + this.nsliders + " sliders, " + this.nspinners + " spinners" + "\n" + this.max_combo() + " max combo" + "\n");
    return res;
  };
  // beatmap parser
  // ----------------------------------------------------------------
  // partial .osu file parser built around pp calculation
  function parser() {
    // once you're done feeding data to the parser, you will find
    // the parsed beatmap in this object
    this.map = new beatmap();
    this.reset();
  }
  parser.prototype.reset = function() {
    this.map.reset();
    // parser state: number of lines fed, last touched line,
    // last touched substring and the current section name
    //
    // these can be used to debug syntax errors
    this.nline = 0;
    this.curline = "";
    this.lastpos = "";
    this.section = "";
    return this;
  };
  // you can feed a single line or a whole block of text which
  // will be split into lines. partial lines are not allowed
  //
  // both feed functions return the parser instance for easy
  // chaining
  parser.prototype.feed_line = function(line) {
    this.curline = this.lastpos = line;
    ++this.nline;
    // comments
    if (line.startsWith(" ") || line.startsWith("_")) {
      return this;
    }
    // now that we've handled space comments we can trim space
    line = this.curline = line.trim();
    if (line.length <= 0) {
      return this;
    }
    // c++ style comments
    if (line.startsWith("//")) {
      return this;
    }
    // [SectionName]
    if (line.startsWith("[")) {
      // on old maps there's no ar and ar = od
      if (this.section == "Difficulty" && isUndefined(this.map.ar)) {
        this.map.ar = this.map.od;
      }
      this.section = line.substring(1, line.length - 1);
      return this;
    }
    if (!line) {
      return this;
    }
    switch (this.section) {
      case "Metadata":
        this._metadata();
        break;
      case "General":
        this._general();
        break;
      case "Difficulty":
        this._difficulty();
        break;
      case "TimingPoints":
        this._timing_points();
        break;
      case "HitObjects":
        this._objects();
        break;
      default:
        var fmtpos = line.indexOf("file format v");
        if (fmtpos < 0) {
          break;
        }
        this.map.format_version = parseInt(line.substring(fmtpos + 13));
        break;
    }
    return this;
  };
  parser.prototype.feed = function(str) {
    var lines = lines = str.split("\n");
    for (var i = 0; i < lines.length; ++i) {
      this.feed_line(lines[i]);
    }
    return this;
  };
  // returns the parser state formatted into a string. useful
  // for debugging syntax errors
  parser.prototype.toString = function() {
    return ("at line " + this.nline + "\n" + this.curline + "\n" + "-> " + this.lastpos + " <-");
  };
  // _(internal)_ parser utilities
  parser.prototype._setpos = function(str) {
    this.lastpos = str.trim();
    return this.lastpos;
  };
  parser.prototype._warn = function() {
    log.warn.apply(null, Array.prototype.slice.call(arguments));
    log.warn(this.toString());
  };
  parser.prototype._property = function() {
    var s = this.curline.split(":", 2);
    s[0] = s[0] && this._setpos(s[0]);
    s[1] = s[1] && this._setpos(s[1]);
    return s;
  };
  // _(internal)_ line parsers for each section
  parser.prototype._metadata = function() {
    var p = this._property();
    switch (p[0]) {
      case "Title":
        this.map.title = p[1];
        break;
      case "TitleUnicode":
        this.map.title_unicode = p[1];
        break;
      case "Artist":
        this.map.artist = p[1];
        break;
      case "ArtistUnicode":
        this.map.artist_unicode = p[1];
        break;
      case "Creator":
        this.map.creator = p[1];
        break;
      case "Version":
        this.map.version = p[1];
        break;
      case "BeatmapID":
        this.map.beatmapId = parseInt(p[1]);
        break;
      case "BeatmapSetID":
        this.map.beatmapsetId = parseInt(p[1]);
        break;
    }
  };
  parser.prototype._general = function() {
    var p = this._property();
    if (p[0] !== "Mode") {
      return;
    }
    this.map.mode = parseInt(this._setpos(p[1]));
  };
  parser.prototype._difficulty = function() {
    var p = this._property();
    switch (p[0]) {
      case "CircleSize":
        this.map.cs = parseFloat(this._setpos(p[1]));
        break;
      case "OverallDifficulty":
        this.map.od = parseFloat(this._setpos(p[1]));
        break;
      case "ApproachRate":
        this.map.ar = parseFloat(this._setpos(p[1]));
        break;
      case "HPDrainRate":
        this.map.hp = parseFloat(this._setpos(p[1]));
        break;
      case "SliderMultiplier":
        this.map.sv = parseFloat(this._setpos(p[1]));
        break;
      case "SliderTickRate":
        this.map.tick_rate = parseFloat(this._setpos(p[1]));
        break;
    }
  };
  parser.prototype._timing_points = function() {
    var s = this.curline.split(",");
    if (s.length > 8) {
      this._warn("timing point with trailing values");
    } else if (s.length < 2) {
      this._warn("ignoring malformed timing point");
      return;
    }
    var t = new timing({
      time: parseFloat(this._setpos(s[0])),
      ms_per_beat: parseFloat(this._setpos(s[1])),
    });
    if (s.length >= 7) {
      t.change = s[6].trim() !== "0";
    }
    this.map.timing_points.push(t);
  };
  parser.prototype._objects = function() {
    var s = this.curline.split(",");
    var d;
    if (s.length > 11) {
      this._warn("object with trailing values");
    } else if (s.length < 4) {
      this._warn("ignoring malformed hitobject");
      return;
    }
    var obj = new hitobject({
      time: parseFloat(this._setpos(s[2])),
      type: parseInt(this._setpos(s[3])),
    });
    if (isNaN(obj.time) || isNaN(obj.type)) {
      this._warn("ignoring malformed hitobject");
      return;
    }
    if ((obj.type & objtypes.circle) != 0) {
      ++this.map.ncircles;
      d = obj.data = new circle({
        pos: [
          parseFloat(this._setpos(s[0])),
          parseFloat(this._setpos(s[1])),
        ]
      });
      if (isNaN(d.pos[0]) || isNaN(d.pos[1])) {
        this._warn("ignoring malformed circle");
        return;
      }
    } else if ((obj.type & osu.objtypes.spinner) != 0) {
      ++this.map.nspinners;
    } else if ((obj.type & osu.objtypes.slider) != 0) {
      if (s.length < 8) {
        this._warn("ignoring malformed slider");
        return;
      }
      ++this.map.nsliders;
      d = obj.data = new slider({
        pos: [
          parseFloat(this._setpos(s[0])),
          parseFloat(this._setpos(s[1])),
        ],
        repetitions: parseInt(this._setpos(s[6])),
        distance: parseFloat(this._setpos(s[7])),
      });
      if (isNaN(d.pos[0]) || isNaN(d.pos[1]) || isNaN(d.repetitions) || isNaN(d.distance)) {
        this._warn("ignoring malformed slider");
        return;
      }
    }
    this.map.objects.push(obj);
  }
  // difficulty calculation
  // ----------------------------------------------------------------
  // mods bitmask constants
  // NOTE: td is touch device, but it's also the value for the
  // legacy no video mod
  var modbits = {
    nomod: 0,
    nf: 1 << 0,
    ez: 1 << 1,
    td: 1 << 2,
    hd: 1 << 3,
    hr: 1 << 4,
    dt: 1 << 6,
    ht: 1 << 8,
    nc: 1 << 9,
    fl: 1 << 10,
    so: 1 << 12,
  };
  // construct the mods bitmask from a string such as "HDHR"
  modbits.from_string = function(str) {
    var mask = 0;
    str = str.toLowerCase();
    while (str != "") {
      var nchars = 1;
      for (var property in modbits) {
        if (property.length != 2) {
          continue;
        }
        if (!modbits.hasOwnProperty(property)) {
          continue;
        }
        if (str.startsWith(property)) {
          mask |= modbits[property];
          nchars = 2;
          break;
        }
      }
      str = str.slice(nchars);
    }
    return mask;
  };
  // convert mods bitmask into a string, such as "HDHR"
  modbits.string = function(mods) {
    var res = "";
    for (var property in modbits) {
      if (property.length != 2) {
        continue;
      }
      if (!modbits.hasOwnProperty(property)) {
        continue;
      }
      if (mods & modbits[property]) {
        res += property.toUpperCase();
      }
    }
    if (res.indexOf("DT") >= 0 && res.indexOf("NC") >= 0) {
      res = res.replace("DT", "");
    }
    return res;
  };
  modbits.speed_changing = modbits.dt | modbits.ht | modbits.nc;
  modbits.map_changing = modbits.hr | modbits.ez | modbits.speed_changing;
  // _(internal)_
  // osu!standard stats constants
  var OD0_MS = 80;
  var OD10_MS = 20;
  var AR0_MS = 1800.0;
  var AR5_MS = 1200.0;
  var AR10_MS = 450.0;
  var OD_MS_STEP = (OD0_MS - OD10_MS) / 10.0;
  var AR_MS_STEP1 = (AR0_MS - AR5_MS) / 5.0;
  var AR_MS_STEP2 = (AR5_MS - AR10_MS) / 5.0;
  // _(internal)_
  // utility functions to apply speed and flat multipliers to
  // stats where speed changes apply (ar and od)
  function modify_ar(base_ar, speed_mul, multiplier) {
    var ar = base_ar;
    ar *= multiplier;
    // convert AR into milliseconds window
    var arms = (ar < 5.0 ? AR0_MS - AR_MS_STEP1 * ar : AR5_MS - AR_MS_STEP2 * (ar - 5.0));
    // stats must be capped to 0-10 before HT/DT which
    // brings them to a range of -4.42->11.08 for OD and
    // -5->11 for AR
    arms = Math.min(AR0_MS, Math.max(AR10_MS, arms));
    arms /= speed_mul;
    ar = (arms > AR5_MS ? (AR0_MS - arms) / AR_MS_STEP1 : 5.0 + (AR5_MS - arms) / AR_MS_STEP2);
    return ar;
  }

  function modify_od(base_od, speed_mul, multiplier) {
    var od = base_od;
    od *= multiplier;
    var odms = OD0_MS - Math.ceil(OD_MS_STEP * od);
    odms = Math.min(OD0_MS, Math.max(OD10_MS, odms));
    odms /= speed_mul;
    od = (OD0_MS - odms) / OD_MS_STEP;
    return od;
  }
  // stores osu!standard beatmap stats
  function std_beatmap_stats(values) {
    this.ar = values.ar;
    this.od = values.od;
    this.hp = values.hp;
    this.cs = values.cs;
    this.speed_mul = 1.0;
    // previously calculated mod combinations are cached in a map
    this._mods_cache = {};
  }
  // applies difficulty modifiers to a map's ar, od, cs, hp and
  // returns the modified stats and the speed multiplier.
  //
  // unspecified stats are ignored and not returned
  std_beatmap_stats.prototype.with_mods = function(mods) {
    if (this._mods_cache[mods]) {
      return this._mods_cache[mods];
    }
    var stats = this._mods_cache[mods] = new std_beatmap_stats(this);
    if (!(mods & modbits.map_changing)) {
      return stats;
    }
    if (mods & (modbits.dt | modbits.nc)) {
      stats.speed_mul = 1.5;
    }
    if (mods & modbits.ht) {
      stats.speed_mul *= 0.75;
    }
    var od_ar_hp_multiplier = 1.0;
    if (mods & modbits.hr) od_ar_hp_multiplier = 1.4;
    if (mods & modbits.ez) od_ar_hp_multiplier *= 0.5;
    if (stats.ar) {
      stats.ar = modify_ar(stats.ar, stats.speed_mul, od_ar_hp_multiplier);
    }
    if (stats.od) {
      stats.od = modify_od(stats.od, stats.speed_mul, od_ar_hp_multiplier);
    }
    if (stats.cs) {
      if (mods & modbits.hr) stats.cs *= 1.3;
      if (mods & modbits.ez) stats.cs *= 0.5;
      stats.cs = Math.min(10.0, stats.cs);
    }
    if (stats.hp) {
      stats.hp *= od_ar_hp_multiplier;
      stats.hp = Math.min(10.0, stats.hp);
    }
    return stats;
  };
  // osu! standard hit object with difficulty calculation values
  // obj is the underlying hitobject
  function std_diff_hitobject(obj) {
    this.obj = obj;
    this.reset();
  }
  std_diff_hitobject.prototype.reset = function() {
    this.strains = [0.0, 0.0];
    this.normpos = [0.0, 0.0];
    this.angle = 0.0;
    this.is_single = false;
    this.delta_time = 0.0;
    this.d_distance = 0.0;
    return this;
  };
  std_diff_hitobject.prototype.toString = function() {
    return ("{ strains: [" + array_toFixed(this.strains, 2) + "], normpos: [" + array_toFixed(this.normpos, 2) + "], is_single: " + this.is_single + " }");
  };
  // _(internal)_
  // 2D point operations
  function vec_sub(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
  }

  function vec_mul(a, b) {
    return [a[0] * b[0], a[1] * b[1]];
  }

  function vec_len(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  }

  function vec_dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }
  // _(internal)_
  // difficulty calculation constants
  var DIFF_SPEED = 0;
  var DIFF_AIM = 1;
  var SINGLE_SPACING = 125.0;
  var DECAY_BASE = [0.3, 0.15];
  var WEIGHT_SCALING = [1400.0, 26.25];
  var DECAY_WEIGHT = 0.9;
  var STRAIN_STEP = 400.0;
  var CIRCLESIZE_BUFF_THRESHOLD = 30.0;
  var STAR_SCALING_FACTOR = 0.0675;
  var PLAYFIELD_SIZE = [512.0, 384.0];
  var PLAYFIELD_CENTER = vec_mul(PLAYFIELD_SIZE, [0.5, 0.5]);
  var EXTREME_SCALING_FACTOR = 0.5;
  // osu!standard difficulty calculator
  //
  // does not account for sliders because slider calculations are
  // expensive and not worth the small accuracy increase
  function std_diff() {
    this.objects = [];
    this.reset();
    // make some parameters persist so they can be
    // re-used in subsequent calls if no new value is specified
    this.map = undefined;
    this.mods = modbits.nomod;
    this.singletap_threshold = 125.0;
  }
  std_diff.prototype.reset = function() {
    // star rating
    this.total = 0.0;
    this.aim = 0.0;
    this.aim_difficulty = 0.0;
    this.aim_length_bonus = 0.0;
    this.speed = 0.0;
    this.speed_difficulty = 0.0;
    this.speed_length_bonus = 0.0;
    // number of notes that are seen as singletaps by the
    // difficulty calculator
    this.nsingles = 0;
    // number of notes that are faster than the interval given
    // in calc(). these singletap statistic are not required in
    // star rating, but they are a free byproduct of the
    // calculation which could be useful
    this.nsingles_threshold = 0;
  };
  std_diff.prototype._length_bonus = function(stars, difficulty) {
    return 0.32 + 0.5 * (Math.log10(difficulty + stars) - Math.log10(stars));
  };
  // calculate difficulty and return current instance, which
  // contains the results
  //
  // params:
  // * map: the beatmap we want to calculate difficulty for. if
  //   unspecified, it will default to the last map used
  //   in previous calls.
  // * mods: mods bitmask, defaults to modbits.nomod
  // * singletap_threshold: interval threshold in milliseconds
  //   for singletaps. defaults to 240 bpm 1/2 singletaps
  //   ```(60000 / 240) / 2``` .
  //   see nsingles_threshold
  std_diff.prototype.calc = function(params) {
    var map = this.map = params.map || this.map;
    if (!map) {
      throw new TypeError("no map given");
    }
    var mods = this.mods = params.mods || this.mods;
    var singletap_threshold = this.singletap_threshold = params.singletap_threshold || singletap_threshold;
    // apply mods to the beatmap's stats
    var stats = new std_beatmap_stats({
      cs: map.cs
    }).with_mods(mods);
    var speed_mul = stats.speed_mul;
    this._init_objects(this.objects, map, stats.cs);
    var speed = this._calc_individual(DIFF_SPEED, this.objects, speed_mul);
    this.speed = speed.difficulty;
    this.speed_difficulty = speed.total;
    var aim = this._calc_individual(DIFF_AIM, this.objects, speed_mul);
    this.aim = aim.difficulty;
    this.aim_difficulty = aim.total;
    this.aim_length_bonus = this._length_bonus(this.aim, this.aim_difficulty);
    this.speed_length_bonus = this._length_bonus(this.speed, this.speed_difficulty);
    this.aim = Math.sqrt(this.aim) * STAR_SCALING_FACTOR;
    this.speed = Math.sqrt(this.speed) * STAR_SCALING_FACTOR;
    if (mods & modbits.td) {
      this.aim = Math.pow(this.aim, 0.8);
    }
    // total stars mixes speed and aim in such a way that
    // heavily aim or speed focused maps get a bonus
    this.total = (this.aim + this.speed + Math.abs(this.speed - this.aim) * EXTREME_SCALING_FACTOR);
    // singletap stats
    this.nsingles = 0;
    this.nsingles_threshold = 0;
    for (var i = 1; i < this.objects.length; ++i) {
      var obj = this.objects[i].obj;
      var prev = this.objects[i - 1].obj;
      if (this.objects[i].is_single) {
        ++this.nsingles;
      }
      if (!(obj.type & (objtypes.circle | objtypes.slider))) {
        continue;
      }
      var interval = (obj.time - prev.time) / speed_mul;
      if (interval >= singletap_threshold) {
        ++this.nsingles_threshold;
      }
    }
    return this;
  };
  std_diff.prototype.toString = function() {
    return (this.total.toFixed(2) + " stars (" + this.aim.toFixed(2) + " aim, " + this.speed.toFixed(2) + " speed)");
  };
  // _(internal)_
  // calculate spacing weight for a difficulty type
  // ~200BPM 1/4 streams
  var MIN_SPEED_BONUS = 75.0;
  // ~330BPM 1/4 streams
  var MAX_SPEED_BONUS = 45.0;
  var ANGLE_BONUS_SCALE = 90;
  var AIM_TIMING_THRESHOLD = 107;
  var SPEED_ANGLE_BONUS_BEGIN = 5 * Math.PI / 6;
  var AIM_ANGLE_BONUS_BEGIN = Math.PI / 3;
  std_diff.prototype._spacing_weight = function(type, distance, delta_time, prev_distance, prev_delta_time, angle) {
    var angle_bonus;
    var strain_time = Math.max(delta_time, 50.0);
    switch (type) {
      case DIFF_AIM: {
        var prev_strain_time = Math.max(prev_delta_time, 50.0);
        var result = 0.0;
        if (angle !== null && angle > AIM_ANGLE_BONUS_BEGIN) {
          angle_bonus = Math.sqrt(Math.max(prev_distance - ANGLE_BONUS_SCALE, 0.0) * Math.pow(Math.sin(angle - AIM_ANGLE_BONUS_BEGIN), 2.0) * Math.max(distance - ANGLE_BONUS_SCALE, 0.0));
          result = 1.5 * Math.pow(Math.max(0.0, angle_bonus), 0.99) / Math.max(AIM_TIMING_THRESHOLD, prev_strain_time);
        }
        var weighted_distance = Math.pow(distance, 0.99);
        return Math.max(result + weighted_distance / Math.max(AIM_TIMING_THRESHOLD, strain_time), weighted_distance / strain_time);
      }
      case DIFF_SPEED: {
        distance = Math.min(distance, SINGLE_SPACING);
        delta_time = Math.max(delta_time, MAX_SPEED_BONUS);
        var speed_bonus = 1.0;
        if (delta_time < MIN_SPEED_BONUS) {
          speed_bonus += Math.pow((MIN_SPEED_BONUS - delta_time) / 40.0, 2);
        }
        angle_bonus = 1.0;
        if (angle !== null && angle < SPEED_ANGLE_BONUS_BEGIN) {
          var s = Math.sin(1.5 * (SPEED_ANGLE_BONUS_BEGIN - angle));
          angle_bonus += Math.pow(s, 2) / 3.57;
          if (angle < Math.PI / 2.0) {
            angle_bonus = 1.28;
            if (distance < ANGLE_BONUS_SCALE && angle < Math.PI / 4.0) {
              angle_bonus += (1.0 - angle_bonus) * Math.min((ANGLE_BONUS_SCALE - distance) / 10.0, 1.0);
            } else if (distance < ANGLE_BONUS_SCALE) {
              angle_bonus += (1.0 - angle_bonus) * Math.min((ANGLE_BONUS_SCALE - distance) / 10.0, 1.0) * Math.sin((Math.PI / 2.0 - angle) * 4.0 / Math.PI);
            }
          }
        }
        return (
          (1 + (speed_bonus - 1) * 0.75) * angle_bonus * (0.95 + speed_bonus * Math.pow(distance / SINGLE_SPACING, 3.5))) / strain_time;
      }
    }
    throw {
      name: "NotImplementedError",
      message: "this difficulty type does not exist"
    };
  };
  // _(internal)_
  // calculate a single strain and store it in the diffobj
  std_diff.prototype._calc_strain = function(type, diffobj, prev_diffobj, speed_mul) {
    var obj = diffobj.obj;
    var prev_obj = prev_diffobj.obj;
    var value = 0.0;
    var time_elapsed = (obj.time - prev_obj.time) / speed_mul;
    var decay = Math.pow(DECAY_BASE[type], time_elapsed / 1000.0);
    diffobj.delta_time = time_elapsed;
    if ((obj.type & (objtypes.slider | objtypes.circle)) != 0) {
      var distance = vec_len(vec_sub(diffobj.normpos, prev_diffobj.normpos));
      diffobj.d_distance = distance;
      if (type == DIFF_SPEED) {
        diffobj.is_single = distance > SINGLE_SPACING;
      }
      value = this._spacing_weight(type, distance, time_elapsed, prev_diffobj.d_distance, prev_diffobj.delta_time, diffobj.angle);
      value *= WEIGHT_SCALING[type];
    }
    diffobj.strains[type] = prev_diffobj.strains[type] * decay + value;
  };
  // _(internal)_
  // calculate a specific type of difficulty
  //
  // the map is analyzed in chunks of STRAIN_STEP duration.
  // for each chunk the highest hitobject strains are added to
  // a list which is then collapsed into a weighted sum, much
  // like scores are weighted on a user's profile.
  //
  // for subsequent chunks, the initial max strain is calculated
  // by decaying the previous hitobject's strain until the
  // beginning of the new chunk
  //
  // the first object doesn't generate a strain
  // so we begin with an incremented interval end
  //
  // also don't forget to manually add the peak strain for the last
  // section which would otherwise be ignored
  std_diff.prototype._calc_individual = function(type, diffobjs, speed_mul) {
    var strains = [];
    var strain_step = STRAIN_STEP * speed_mul;
    var interval_end = (Math.ceil(diffobjs[0].obj.time / strain_step) * strain_step);
    var max_strain = 0.0;
    var i;
    for (i = 0; i < diffobjs.length; ++i) {
      if (i > 0) {
        this._calc_strain(type, diffobjs[i], diffobjs[i - 1], speed_mul);
      }
      while (diffobjs[i].obj.time > interval_end) {
        strains.push(max_strain);
        if (i > 0) {
          var decay = Math.pow(DECAY_BASE[type],
            (interval_end - diffobjs[i - 1].obj.time) / 1000.0);
          max_strain = diffobjs[i - 1].strains[type] * decay;
        } else {
          max_strain = 0.0;
        }
        interval_end += strain_step;
      }
      max_strain = Math.max(max_strain, diffobjs[i].strains[type]);
    }
    strains.push(max_strain);
    var weight = 1.0;
    var total = 0.0;
    var difficulty = 0.0;
    strains.sort(function(a, b) {
      return b - a;
    });
    for (i = 0; i < strains.length; ++i) {
      total += Math.pow(strains[i], 1.2);
      difficulty += strains[i] * weight;
      weight *= DECAY_WEIGHT;
    }
    return {
      difficulty: difficulty,
      total: total
    };
  };
  // _(internal)_
  // positions are normalized on circle radius so that we can
  // calc as if everything was the same circlesize.
  //
  // this creates a scaling vector that normalizes positions
  std_diff.prototype._normalizer_vector = function(circlesize) {
    var radius = (PLAYFIELD_SIZE[0] / 16.0) * (1.0 - 0.7 * (circlesize - 5.0) / 5.0);
    var scaling_factor = 52.0 / radius;
    // high circlesize (small circles) bonus
    if (radius < CIRCLESIZE_BUFF_THRESHOLD) {
      scaling_factor *= 1.0 + Math.min(CIRCLESIZE_BUFF_THRESHOLD - radius, 5.0) / 50.0;
    }
    return [scaling_factor, scaling_factor];
  }
  // _(internal)_
  // initialize diffobjs (or reset if already initialized) and
  // populate it with the normalized position of the map's
  // objects
  std_diff.prototype._init_objects = function(diffobjs, map, circlesize) {
    if (diffobjs.length != map.objects.length) {
      diffobjs.length = map.objects.length;
    }
    var scaling_vec = this._normalizer_vector(circlesize);
    var normalized_center = vec_mul(PLAYFIELD_CENTER, scaling_vec);
    for (var i = 0; i < diffobjs.length; ++i) {
      if (!diffobjs[i]) {
        diffobjs[i] = new std_diff_hitobject(map.objects[i]);
      } else {
        diffobjs[i].reset();
      }
      var pos;
      var obj = diffobjs[i].obj;
      if (obj.type & objtypes.spinner) {
        diffobjs[i].normpos = normalized_center.slice();
      } else if (obj.type & (objtypes.slider | objtypes.circle)) {
        diffobjs[i].normpos = vec_mul(obj.data.pos, scaling_vec);
      }
      if (i >= 2) {
        var prev1 = diffobjs[i - 1];
        var prev2 = diffobjs[i - 2];
        var v1 = vec_sub(prev2.normpos, prev1.normpos);
        var v2 = vec_sub(diffobjs[i].normpos, prev1.normpos);
        var dot = vec_dot(v1, v2);
        var det = v1[0] * v2[1] - v1[1] * v2[0];
        diffobjs[i].angle = Math.abs(Math.atan2(det, dot));
      } else {
        diffobjs[i].angle = null;
      }
    }
  };
  // generic difficulty calculator that creates and uses
  // mode-specific calculators based on the map's mode field
  function diff() {
    // calculators for different modes are cached for reuse within
    // this instance
    this.calculators = [];
    this.map = undefined;
  }
  // figures out what difficulty calculator to use based on the
  // beatmap's gamemode and calls it with params
  //
  // if no map is specified in params, the last map used in
  // previous calls will be used. this simplifies subsequent
  // calls for the same beatmap
  //
  // see gamemode-specific calculators above for params
  //
  // returns the chosen gamemode-specific difficulty calculator
  diff.prototype.calc = function(params) {
    var calculator;
    var map = this.map = params.map || this.map;
    if (!map) {
      throw new TypeError("no map given");
    }
    if (!this.calculators[map.mode]) {
      switch (map.mode) {
        case modes.std:
          calculator = new std_diff();
          break;
        default:
          throw {
            name: "NotImplementedError",
              message: "this gamemode is not yet supported"
          };
      }
      this.calculators[map.mode] = calculator;
    } else {
      calculator = this.calculators[map.mode];
    }
    return calculator.calc(params);
  };
  // pp calculation
  // ----------------------------------------------------------------
  // osu!standard accuracy calculator
  //
  // if percent and nobjects are specified, n300, n100 and n50 will
  // be automatically calculated to be the closest to the given
  // acc percent
  function std_accuracy(values) {
    this.nmiss = values.nmiss || 0;
    if (values.n300 === undefined) {
      this.n300 = -1;
    } else {
      this.n300 = values.n300;
    }
    this.n100 = values.n100 || 0;
    this.n50 = values.n50 || 0;
    var nobjects;
    if (values.nobjects) {
      var n300 = this.n300;
      nobjects = values.nobjects;
      var hitcount;
      if (n300 < 0) {
        n300 = Math.max(0, nobjects - this.n100 - this.n50 - this.nmiss);
      }
      hitcount = n300 + this.n100 + this.n50 + this.nmiss;
      if (hitcount > nobjects) {
        n300 -= Math.min(n300, hitcount - nobjects);
      }
      hitcount = n300 + this.n100 + this.n50 + this.nmiss;
      if (hitcount > nobjects) {
        this.n100 -= Math.min(this.n100, hitcount - nobjects);
      }
      hitcount = n300 + this.n100 + this.n50 + this.nmiss;
      if (hitcount > nobjects) {
        this.n50 -= Math.min(this.n50, hitcount - nobjects);
      }
      hitcount = n300 + this.n100 + this.n50 + this.nmiss;
      if (hitcount > nobjects) {
        this.nmiss -= Math.min(this.nmiss, hitcount - nobjects);
      }
      this.n300 = nobjects - this.n100 - this.n50 - this.nmiss;
    }
    if (values.percent !== undefined) {
      nobjects = values.nobjects;
      if (nobjects === undefined) {
        throw new TypeError("nobjects is required when specifying percent");
      }
      var max300 = nobjects - this.nmiss;
      var maxacc = new std_accuracy({
        n300: max300,
        n100: 0,
        n50: 0,
        nmiss: this.nmiss
      }).value() * 100.0;
      var acc_percent = values.percent;
      acc_percent = Math.max(0.0, Math.min(maxacc, acc_percent));
      // just some black magic maths from wolfram alpha
      this.n100 = Math.round(-3.0 * ((acc_percent * 0.01 - 1.0) * nobjects + this.nmiss) * 0.5);
      if (this.n100 > max300) {
        // acc lower than all 100s, use 50s
        this.n100 = 0;
        this.n50 = Math.round(-6.0 * ((acc_percent * 0.01 - 1.0) * nobjects + this.nmiss) * 0.5);
        this.n50 = Math.min(max300, this.n50);
      }
      this.n300 = nobjects - this.n100 - this.n50 - this.nmiss;
    }
  }
  // computes the accuracy value (0.0-1.0)
  //
  // if n300 was specified in the constructor, nobjects is not
  // required and will be automatically computed
  std_accuracy.prototype.value = function(nobjects) {
    var n300 = this.n300;
    if (n300 < 0) {
      if (!nobjects) {
        throw new TypeError("either n300 or nobjects must be specified");
      }
      n300 = nobjects - this.n100 - this.n50 - this.nmiss;
    } else {
      nobjects = n300 + this.n100 + this.n50 + this.nmiss;
    }
    var res = (
      (n300 * 300.0 + this.n100 * 100.0 + this.n50 * 50.0) / (nobjects * 300.0));
    return Math.max(0, Math.min(res, 1.0));
  };
  std_accuracy.prototype.toString = function() {
    return (
      (this.value() * 100.0).toFixed(2) + "% " + this.n100 + "x100 " + this.n50 + "x50 " + this.nmiss + "xmiss");
  }
  // osu! standard ppv2 calculator
  function std_ppv2() {
    this.aim = 0.0;
    this.speed = 0.0;
    this.acc = 0.0;
    // accuracy used in the last calc() call
    this.computed_accuracy = undefined;
  }
  // metaparams:
  // map, stars, acc_percent
  //
  // params:
  // aim_stars, speed_stars, max_combo, nsliders, ncircles,
  // nobjects, base_ar = 5, base_od = 5, mode = modes.std,
  // mods = modbits.nomod, combo = max_combo - nmiss,
  // n300 = nobjects - n100 - n50 - nmiss, n100 = 0, n50 = 0,
  // nmiss = 0, score_version = 1
  //
  // if stars is defined, map and mods are obtained from stars as
  // well as aim_stars and speed_stars
  //
  // if map is defined, max_combo, nsliders, ncircles, nobjects,
  // base_ar, base_od will be obtained from this beatmap
  //
  // if map is defined and stars is not defined, a new difficulty
  // calculator will be created on the fly to compute stars for map
  //
  // if acc_percent is defined, n300, n100, n50 will be automatically
  // calculated to be as close as possible to this value
  std_ppv2.prototype.calc = function(params) {
    // parameters handling
    var stars = params.stars;
    var map = params.map;
    var max_combo, nsliders, ncircles, nobjects, base_ar, base_od;
    var mods;
    var aim_stars, speed_stars;
    if (stars) {
      map = stars.map;
    }
    if (map) {
      max_combo = map.max_combo();
      nsliders = map.nsliders;
      ncircles = map.ncircles;
      nobjects = map.objects.length;
      base_ar = map.ar;
      base_od = map.od;
      if (!stars) {
        stars = new std_diff().calc(params);
      }
    } else {
      max_combo = params.max_combo;
      if (!max_combo || max_combo < 0) {
        throw new TypeError("max_combo must be > 0");
      }
      nsliders = params.nsliders;
      ncircles = params.ncircles;
      nobjects = params.nobjects;
      if ([nsliders, ncircles, nobjects].some(isNaN)) {
        throw new TypeError("nsliders, ncircles, nobjects are required (must be numbers) ");
      }
      if (nobjects < nsliders + ncircles) {
        throw new TypeError("nobjects must be >= nsliders + ncircles");
      }
      base_ar = params.base_ar;
      if (isUndefined(base_ar)) base_ar = 5;
      base_od = params.base_od;
      if (isUndefined(base_od)) base_od = 5;
    }
    if (stars) {
      mods = stars.mods;
      aim_stars = stars.aim;
      speed_stars = stars.speed;
    } else {
      mods = params.mods || modbits.nomod;
      aim_stars = params.aim_stars;
      speed_stars = params.speed_stars;
    }
    if ([aim_stars, speed_stars].some(isNaN)) {
      throw new TypeError("aim and speed stars required (must be numbers)");
    }
    var nmiss = params.nmiss || 0;
    var n50 = params.n50 || 0;
    var n100 = params.n100 || 0;
    var n300 = params.n300;
    if (n300 === undefined) {
      n300 = nobjects - n100 - n50 - nmiss;
    }
    var combo = params.combo;
    if (combo === undefined) {
      combo = max_combo - nmiss;
    }
    var score_version = params.score_version || 1;
    // common values used in all pp calculations
    var nobjects_over_2k = nobjects / 2000.0;
    var length_bonus = 0.95 + 0.4 * Math.min(1.0, nobjects_over_2k);
    if (nobjects > 2000) {
      length_bonus += Math.log10(nobjects_over_2k) * 0.5;
    }
    var combo_break = Math.pow(combo, 0.8) / Math.pow(max_combo, 0.8);
    var mapstats = (new std_beatmap_stats({
      ar: base_ar,
      od: base_od
    }).with_mods(mods));
    this.computed_accuracy = new std_accuracy({
      percent: params.acc_percent,
      nobjects: nobjects,
      n300: n300,
      n100: n100,
      n50: n50,
      nmiss: nmiss
    });
    n300 = this.computed_accuracy.n300;
    n100 = this.computed_accuracy.n100;
    n50 = this.computed_accuracy.n50;
    var doubletap_penalty = Math.pow(0.98, n50 < nobjects / 500.0 ? 0 : n50 - nobjects / 500.0);
    var accuracy = this.computed_accuracy.value();
    // high/low ar bonus
    var ar_bonus = 0.0;
    if (mapstats.ar > 10.33) {
      ar_bonus += 0.4 * (mapstats.ar - 10.33);
    } else if (mapstats.ar < 8.0) {
      ar_bonus += 0.01 * (8.0 - mapstats.ar);
    }
    ar_bonus = 1.0 + Math.min(ar_bonus, ar_bonus * (nobjects / 1000.0));
    // aim pp
    var aim = this._base(aim_stars);
    aim *= length_bonus;
    if (nmiss > 0) {
      aim *= 0.97 * Math.pow(1 - Math.pow(nmiss / nobjects, 0.775), nmiss);
    }
    aim *= combo_break;
    aim *= ar_bonus;
    var hd_bonus = 1.0;
    if (mods & modbits.hd) {
      hd_bonus *= 1.0 + 0.04 * (12.0 - mapstats.ar);
    }
    aim *= hd_bonus;
    if (mods & modbits.fl) {
      var fl_bonus = 1.0 + 0.35 * Math.min(1.0, nobjects / 200.0);
      if (nobjects > 200) {
        fl_bonus += 0.3 * Math.min(1.0, (nobjects - 200) / 300.0);
      }
      if (nobjects > 500) {
        fl_bonus += (nobjects - 500) / 1200.0;
      }
      aim *= fl_bonus;
    }
    var acc_bonus = 0.5 + accuracy / 2.0;
    var od_squared = Math.pow(mapstats.od, 2);
    var od_bonus = 0.98 + od_squared / 2500.0;
    aim *= acc_bonus;
    aim *= od_bonus;
    this.aim = aim;
    // speed pp
    var speed = this._base(speed_stars);
    speed *= length_bonus;
    if (nmiss > 0) {
      speed *= 0.97 * Math.pow(1 - Math.pow(nmiss / nobjects, 0.775), Math.pow(nmiss, 0.875));
    }
    speed *= doubletap_penalty;
    speed *= combo_break;
    if (mapstats.ar > 10.33) {
      speed *= ar_bonus;
    }
    speed *= hd_bonus;
    speed *= (0.95 + od_squared / 750) * Math.pow(accuracy, (14.5 - Math.max(mapstats.od, 8)) / 2);
    this.speed = speed;
    // accuracy pp
    //
    // scorev1 ignores sliders and spinners since they are free
    // 300s
    var real_acc = accuracy;
    switch (score_version) {
      case 1:
        var nspinners = nobjects - nsliders - ncircles;
        real_acc = new std_accuracy({
          n300: Math.max(0, n300 - nsliders - nspinners),
          n100: n100,
          n50: n50,
          nmiss: nmiss
        }).value();
        real_acc = Math.max(0.0, real_acc);
        break;
      case 2:
        ncircles = nobjects;
        break;
      default:
        throw new {
          name: "NotImplementedError",
          message: "unsupported scorev" + score_version
        };
    }
    var acc = (Math.pow(1.52163, mapstats.od) * Math.pow(real_acc, 24.0) * 2.83);
    acc *= Math.min(1.15, Math.pow(ncircles / 1000.0, 0.3));
    if (mods & modbits.hd) acc *= 1.08;
    if (mods & modbits.fl) acc *= 1.02;
    this.acc = acc;
    // total pp
    var final_multiplier = 1.12;
    if (mods & modbits.nf) final_multiplier *= Math.max(0.9, 1.0 - 0.02 * nmiss);
    if (mods & modbits.so) final_multiplier *= 1.0 - Math.pow(nspinners / nobjects, 0.85);
    this.total = Math.pow(Math.pow(aim, 1.1) + Math.pow(speed, 1.1) + Math.pow(acc, 1.1), 1.0 / 1.1) * final_multiplier;
    return this;
  };
  std_ppv2.prototype.toString = function() {
    return (this.total.toFixed(2) + " pp (" + this.aim.toFixed(2) + " aim, " + this.speed.toFixed(2) + " speed, " + this.acc.toFixed(2) + " acc)");
  };
  // _(internal)_ base pp value for stars
  std_ppv2.prototype._base = function(stars) {
    return (Math.pow(5.0 * Math.max(1.0, stars / 0.0675) - 4.0, 3.0) / 100000.0);
  };
  // generic pp calc function that figures out what calculator to use
  // based on the params' mode and passes through params and
  // return value for calc()
  function ppv2(params) {
    var mode;
    if (params.map) {
      mode = params.map.mode;
    } else {
      mode = params.mode || modes.std;
    }
    switch (mode) {
      case modes.std:
        return new std_ppv2().calc(params);
    }
    throw {
      name: "NotImplementedError",
      message: "this gamemode is not yet supported"
    };
  }
  // exports
  // ----------------------------------------------------------------
  osu.timing = timing;
  osu.objtypes = objtypes;
  osu.circle = circle;
  osu.slider = slider;
  osu.hitobject = hitobject;
  osu.modes = modes;
  osu.beatmap = beatmap;
  osu.parser = parser;
  osu.modbits = modbits;
  osu.std_beatmap_stats = std_beatmap_stats;
  osu.std_diff_hitobject = std_diff_hitobject;
  osu.std_diff = std_diff;
  osu.diff = diff;
  osu.std_accuracy = std_accuracy;
  osu.std_ppv2 = std_ppv2;
  osu.ppv2 = ppv2;
})();