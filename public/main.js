(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

(function(global) {
  'use strict';

  var dateFormat = (function() {
      var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g;
      var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
      var timezoneClip = /[^-+\dA-Z]/g;
  
      // Regexes and supporting functions are cached through closure
      return function (date, mask, utc, gmt) {
  
        // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
        if (arguments.length === 1 && kindOf(date) === 'string' && !/\d/.test(date)) {
          mask = date;
          date = undefined;
        }
  
        date = date || new Date;
  
        if(!(date instanceof Date)) {
          date = new Date(date);
        }
  
        if (isNaN(date)) {
          throw TypeError('Invalid date');
        }
  
        mask = String(dateFormat.masks[mask] || mask || dateFormat.masks['default']);
  
        // Allow setting the utc/gmt argument via the mask
        var maskSlice = mask.slice(0, 4);
        if (maskSlice === 'UTC:' || maskSlice === 'GMT:') {
          mask = mask.slice(4);
          utc = true;
          if (maskSlice === 'GMT:') {
            gmt = true;
          }
        }
  
        var _ = utc ? 'getUTC' : 'get';
        var d = date[_ + 'Date']();
        var D = date[_ + 'Day']();
        var m = date[_ + 'Month']();
        var y = date[_ + 'FullYear']();
        var H = date[_ + 'Hours']();
        var M = date[_ + 'Minutes']();
        var s = date[_ + 'Seconds']();
        var L = date[_ + 'Milliseconds']();
        var o = utc ? 0 : date.getTimezoneOffset();
        var W = getWeek(date);
        var N = getDayOfWeek(date);
        var flags = {
          d:    d,
          dd:   pad(d),
          ddd:  dateFormat.i18n.dayNames[D],
          dddd: dateFormat.i18n.dayNames[D + 7],
          m:    m + 1,
          mm:   pad(m + 1),
          mmm:  dateFormat.i18n.monthNames[m],
          mmmm: dateFormat.i18n.monthNames[m + 12],
          yy:   String(y).slice(2),
          yyyy: y,
          h:    H % 12 || 12,
          hh:   pad(H % 12 || 12),
          H:    H,
          HH:   pad(H),
          M:    M,
          MM:   pad(M),
          s:    s,
          ss:   pad(s),
          l:    pad(L, 3),
          L:    pad(Math.round(L / 10)),
          t:    H < 12 ? 'a'  : 'p',
          tt:   H < 12 ? 'am' : 'pm',
          T:    H < 12 ? 'A'  : 'P',
          TT:   H < 12 ? 'AM' : 'PM',
          Z:    gmt ? 'GMT' : utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
          o:    (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
          S:    ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
          W:    W,
          N:    N
        };
  
        return mask.replace(token, function (match) {
          if (match in flags) {
            return flags[match];
          }
          return match.slice(1, match.length - 1);
        });
      };
    })();

  dateFormat.masks = {
    'default':               'ddd mmm dd yyyy HH:MM:ss',
    'shortDate':             'm/d/yy',
    'mediumDate':            'mmm d, yyyy',
    'longDate':              'mmmm d, yyyy',
    'fullDate':              'dddd, mmmm d, yyyy',
    'shortTime':             'h:MM TT',
    'mediumTime':            'h:MM:ss TT',
    'longTime':              'h:MM:ss TT Z',
    'isoDate':               'yyyy-mm-dd',
    'isoTime':               'HH:MM:ss',
    'isoDateTime':           'yyyy-mm-dd\'T\'HH:MM:sso',
    'isoUtcDateTime':        'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
    'expiresHeaderFormat':   'ddd, dd mmm yyyy HH:MM:ss Z'
  };

  // Internationalization strings
  dateFormat.i18n = {
    dayNames: [
      'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ],
    monthNames: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ]
  };

function pad(val, len) {
  val = String(val);
  len = len || 2;
  while (val.length < len) {
    val = '0' + val;
  }
  return val;
}

/**
 * Get the ISO 8601 week number
 * Based on comments from
 * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
 *
 * @param  {Object} `date`
 * @return {Number}
 */
function getWeek(date) {
  // Remove time components of date
  var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Change date to Thursday same week
  targetThursday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3);

  // Take January 4th as it is always in week 1 (see ISO 8601)
  var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);

  // Change date to Thursday same week
  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);

  // Check if daylight-saving-time-switch occurred and correct for it
  var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
  targetThursday.setHours(targetThursday.getHours() - ds);

  // Number of weeks between target Thursday and first Thursday
  var weekDiff = (targetThursday - firstThursday) / (86400000*7);
  return 1 + Math.floor(weekDiff);
}

/**
 * Get ISO-8601 numeric representation of the day of the week
 * 1 (for Monday) through 7 (for Sunday)
 * 
 * @param  {Object} `date`
 * @return {Number}
 */
function getDayOfWeek(date) {
  var dow = date.getDay();
  if(dow === 0) {
    dow = 7;
  }
  return dow;
}

/**
 * kind-of shortcut
 * @param  {*} val
 * @return {String}
 */
function kindOf(val) {
  if (val === null) {
    return 'null';
  }

  if (val === undefined) {
    return 'undefined';
  }

  if (typeof val !== 'object') {
    return typeof val;
  }

  if (Array.isArray(val)) {
    return 'array';
  }

  return {}.toString.call(val)
    .slice(8, -1).toLowerCase();
};



  if (typeof define === 'function' && define.amd) {
    define(function () {
      return dateFormat;
    });
  } else if (typeof exports === 'object') {
    module.exports = dateFormat;
  } else {
    global.dateFormat = dateFormat;
  }
})(this);

},{}],2:[function(require,module,exports){
(function (global){
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? this.options.sanitizer
          ? this.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0]
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.text(escape(this.smartypants(cap[0])));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) return text;
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
	// explicitly match decimal, hex, and named HTML entities 
  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  sanitizer: null,
  mangle: true,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof module !== 'undefined' && typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
(function (global){
;(function() {
"use strict"
function Vnode(tag, key, attrs0, children, text, dom) {
	return {tag: tag, key: key, attrs: attrs0, children: children, text: text, dom: dom, domSize: undefined, state: undefined, _state: undefined, events: undefined, instance: undefined, skip: false}
}
Vnode.normalize = function(node) {
	if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
	if (node != null && typeof node !== "object") return Vnode("#", undefined, undefined, node === false ? "" : node, undefined, undefined)
	return node
}
Vnode.normalizeChildren = function normalizeChildren(children) {
	for (var i = 0; i < children.length; i++) {
		children[i] = Vnode.normalize(children[i])
	}
	return children
}
var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
var selectorCache = {}
var hasOwn = {}.hasOwnProperty
function compileSelector(selector) {
	var match, tag = "div", classes = [], attrs = {}
	while (match = selectorParser.exec(selector)) {
		var type = match[1], value = match[2]
		if (type === "" && value !== "") tag = value
		else if (type === "#") attrs.id = value
		else if (type === ".") classes.push(value)
		else if (match[3][0] === "[") {
			var attrValue = match[6]
			if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")
			if (match[4] === "class") classes.push(attrValue)
			else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true
		}
	}
	if (classes.length > 0) attrs.className = classes.join(" ")
	return selectorCache[selector] = {tag: tag, attrs: attrs}
}
function execSelector(state, attrs, children) {
	var hasAttrs = false, childList, text
	var className = attrs.className || attrs.class
	for (var key in state.attrs) {
		if (hasOwn.call(state.attrs, key)) {
			attrs[key] = state.attrs[key]
		}
	}
	if (className !== undefined) {
		if (attrs.class !== undefined) {
			attrs.class = undefined
			attrs.className = className
		}
		if (state.attrs.className != null) {
			attrs.className = state.attrs.className + " " + className
		}
	}
	for (var key in attrs) {
		if (hasOwn.call(attrs, key) && key !== "key") {
			hasAttrs = true
			break
		}
	}
	if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
		text = children[0].children
	} else {
		childList = children
	}
	return Vnode(state.tag, attrs.key, hasAttrs ? attrs : undefined, childList, text)
}
function hyperscript(selector) {
	// Because sloppy mode sucks
	var attrs = arguments[1], start = 2, children
	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.");
	}
	if (typeof selector === "string") {
		var cached = selectorCache[selector] || compileSelector(selector)
	}
	if (attrs == null) {
		attrs = {}
	} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
		attrs = {}
		start = 1
	}
	if (arguments.length === start + 1) {
		children = arguments[start]
		if (!Array.isArray(children)) children = [children]
	} else {
		children = []
		while (start < arguments.length) children.push(arguments[start++])
	}
	var normalized = Vnode.normalizeChildren(children)
	if (typeof selector === "string") {
		return execSelector(cached, attrs, normalized)
	} else {
		return Vnode(selector, attrs.key, attrs, normalized)
	}
}
hyperscript.trust = function(html) {
	if (html == null) html = ""
	return Vnode("<", undefined, undefined, html, undefined, undefined)
}
hyperscript.fragment = function(attrs1, children) {
	return Vnode("[", attrs1.key, attrs1, Vnode.normalizeChildren(children), undefined, undefined)
}
var m = hyperscript
/** @constructor */
var PromisePolyfill = function(executor) {
	if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with `new`")
	if (typeof executor !== "function") throw new TypeError("executor must be a function")
	var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false)
	var instance = self._instance = {resolvers: resolvers, rejectors: rejectors}
	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
	function handler(list, shouldAbsorb) {
		return function execute(value) {
			var then
			try {
				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
					if (value === self) throw new TypeError("Promise can't be resolved w/ itself")
					executeOnce(then.bind(value))
				}
				else {
					callAsync(function() {
						if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value)
						for (var i = 0; i < list.length; i++) list[i](value)
						resolvers.length = 0, rejectors.length = 0
						instance.state = shouldAbsorb
						instance.retry = function() {execute(value)}
					})
				}
			}
			catch (e) {
				rejectCurrent(e)
			}
		}
	}
	function executeOnce(then) {
		var runs = 0
		function run(fn) {
			return function(value) {
				if (runs++ > 0) return
				fn(value)
			}
		}
		var onerror = run(rejectCurrent)
		try {then(run(resolveCurrent), onerror)} catch (e) {onerror(e)}
	}
	executeOnce(executor)
}
PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
	var self = this, instance = self._instance
	function handle(callback, list, next, state) {
		list.push(function(value) {
			if (typeof callback !== "function") next(value)
			else try {resolveNext(callback(value))} catch (e) {if (rejectNext) rejectNext(e)}
		})
		if (typeof instance.retry === "function" && state === instance.state) instance.retry()
	}
	var resolveNext, rejectNext
	var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject})
	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false)
	return promise
}
PromisePolyfill.prototype.catch = function(onRejection) {
	return this.then(null, onRejection)
}
PromisePolyfill.resolve = function(value) {
	if (value instanceof PromisePolyfill) return value
	return new PromisePolyfill(function(resolve) {resolve(value)})
}
PromisePolyfill.reject = function(value) {
	return new PromisePolyfill(function(resolve, reject) {reject(value)})
}
PromisePolyfill.all = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		var total = list.length, count = 0, values = []
		if (list.length === 0) resolve([])
		else for (var i = 0; i < list.length; i++) {
			(function(i) {
				function consume(value) {
					count++
					values[i] = value
					if (count === total) resolve(values)
				}
				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
					list[i].then(consume, reject)
				}
				else consume(list[i])
			})(i)
		}
	})
}
PromisePolyfill.race = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		for (var i = 0; i < list.length; i++) {
			list[i].then(resolve, reject)
		}
	})
}
if (typeof window !== "undefined") {
	if (typeof window.Promise === "undefined") window.Promise = PromisePolyfill
	var PromisePolyfill = window.Promise
} else if (typeof global !== "undefined") {
	if (typeof global.Promise === "undefined") global.Promise = PromisePolyfill
	var PromisePolyfill = global.Promise
} else {
}
var buildQueryString = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") return ""
	var args = []
	for (var key0 in object) {
		destructure(key0, object[key0])
	}
	return args.join("&")
	function destructure(key0, value) {
		if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
				destructure(key0 + "[" + i + "]", value[i])
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key0 + "[" + i + "]", value[i])
			}
		}
		else args.push(encodeURIComponent(key0) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
	}
}
var FILE_PROTOCOL_REGEX = new RegExp("^file://", "i")
var _8 = function($window, Promise) {
	var callbackCount = 0
	var oncompletion
	function setCompletionCallback(callback) {oncompletion = callback}
	function finalizer() {
		var count = 0
		function complete() {if (--count === 0 && typeof oncompletion === "function") oncompletion()}
		return function finalize(promise0) {
			var then0 = promise0.then
			promise0.then = function() {
				count++
				var next = then0.apply(promise0, arguments)
				next.then(complete, function(e) {
					complete()
					if (count === 0) throw e
				})
				return finalize(next)
			}
			return promise0
		}
	}
	function normalize(args, extra) {
		if (typeof args === "string") {
			var url = args
			args = extra || {}
			if (args.url == null) args.url = url
		}
		return args
	}
	function request(args, extra) {
		var finalize = finalizer()
		args = normalize(args, extra)
		var promise0 = new Promise(function(resolve, reject) {
			if (args.method == null) args.method = "GET"
			args.method = args.method.toUpperCase()
			var useBody = (args.method === "GET" || args.method === "TRACE") ? false : (typeof args.useBody === "boolean" ? args.useBody : true)
			if (typeof args.serialize !== "function") args.serialize = typeof FormData !== "undefined" && args.data instanceof FormData ? function(value) {return value} : JSON.stringify
			if (typeof args.deserialize !== "function") args.deserialize = deserialize
			if (typeof args.extract !== "function") args.extract = extract
			args.url = interpolate(args.url, args.data)
			if (useBody) args.data = args.serialize(args.data)
			else args.url = assemble(args.url, args.data)
			var xhr = new $window.XMLHttpRequest(),
				aborted = false,
				_abort = xhr.abort
			xhr.abort = function abort() {
				aborted = true
				_abort.call(xhr)
			}
			xhr.open(args.method, args.url, typeof args.async === "boolean" ? args.async : true, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined)
			if (args.serialize === JSON.stringify && useBody) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
			}
			if (args.deserialize === deserialize) {
				xhr.setRequestHeader("Accept", "application/json, text/*")
			}
			if (args.withCredentials) xhr.withCredentials = args.withCredentials
			for (var key in args.headers) if ({}.hasOwnProperty.call(args.headers, key)) {
				xhr.setRequestHeader(key, args.headers[key])
			}
			if (typeof args.config === "function") xhr = args.config(xhr, args) || xhr
			xhr.onreadystatechange = function() {
				// Don't throw errors on xhr.abort().
				if(aborted) return
				if (xhr.readyState === 4) {
					try {
						var response = (args.extract !== extract) ? args.extract(xhr, args) : args.deserialize(args.extract(xhr, args))
						if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || FILE_PROTOCOL_REGEX.test(args.url)) {
							resolve(cast(args.type, response))
						}
						else {
							var error = new Error(xhr.responseText)
							for (var key in response) error[key] = response[key]
							reject(error)
						}
					}
					catch (e) {
						reject(e)
					}
				}
			}
			if (useBody && (args.data != null)) xhr.send(args.data)
			else xhr.send()
		})
		return args.background === true ? promise0 : finalize(promise0)
	}
	function jsonp(args, extra) {
		var finalize = finalizer()
		args = normalize(args, extra)
		var promise0 = new Promise(function(resolve, reject) {
			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++
			var script = $window.document.createElement("script")
			$window[callbackName] = function(data) {
				script.parentNode.removeChild(script)
				resolve(cast(args.type, data))
				delete $window[callbackName]
			}
			script.onerror = function() {
				script.parentNode.removeChild(script)
				reject(new Error("JSONP request failed"))
				delete $window[callbackName]
			}
			if (args.data == null) args.data = {}
			args.url = interpolate(args.url, args.data)
			args.data[args.callbackKey || "callback"] = callbackName
			script.src = assemble(args.url, args.data)
			$window.document.documentElement.appendChild(script)
		})
		return args.background === true? promise0 : finalize(promise0)
	}
	function interpolate(url, data) {
		if (data == null) return url
		var tokens = url.match(/:[^\/]+/gi) || []
		for (var i = 0; i < tokens.length; i++) {
			var key = tokens[i].slice(1)
			if (data[key] != null) {
				url = url.replace(tokens[i], data[key])
			}
		}
		return url
	}
	function assemble(url, data) {
		var querystring = buildQueryString(data)
		if (querystring !== "") {
			var prefix = url.indexOf("?") < 0 ? "?" : "&"
			url += prefix + querystring
		}
		return url
	}
	function deserialize(data) {
		try {return data !== "" ? JSON.parse(data) : null}
		catch (e) {throw new Error(data)}
	}
	function extract(xhr) {return xhr.responseText}
	function cast(type0, data) {
		if (typeof type0 === "function") {
			if (Array.isArray(data)) {
				for (var i = 0; i < data.length; i++) {
					data[i] = new type0(data[i])
				}
			}
			else return new type0(data)
		}
		return data
	}
	return {request: request, jsonp: jsonp, setCompletionCallback: setCompletionCallback}
}
var requestService = _8(window, PromisePolyfill)
var coreRenderer = function($window) {
	var $doc = $window.document
	var $emptyFragment = $doc.createDocumentFragment()
	var nameSpace = {
		svg: "http://www.w3.org/2000/svg",
		math: "http://www.w3.org/1998/Math/MathML"
	}
	var onevent
	function setEventCallback(callback) {return onevent = callback}
	function getNameSpace(vnode) {
		return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
	}
	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				createNode(parent, vnode, hooks, ns, nextSibling)
			}
		}
	}
	function createNode(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		if (typeof tag === "string") {
			vnode.state = {}
			if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
			switch (tag) {
				case "#": return createText(parent, vnode, nextSibling)
				case "<": return createHTML(parent, vnode, nextSibling)
				case "[": return createFragment(parent, vnode, hooks, ns, nextSibling)
				default: return createElement(parent, vnode, hooks, ns, nextSibling)
			}
		}
		else return createComponent(parent, vnode, hooks, ns, nextSibling)
	}
	function createText(parent, vnode, nextSibling) {
		vnode.dom = $doc.createTextNode(vnode.children)
		insertNode(parent, vnode.dom, nextSibling)
		return vnode.dom
	}
	function createHTML(parent, vnode, nextSibling) {
		var match1 = vnode.children.match(/^\s*?<(\w+)/im) || []
		var parent1 = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}[match1[1]] || "div"
		var temp = $doc.createElement(parent1)
		temp.innerHTML = vnode.children
		vnode.dom = temp.firstChild
		vnode.domSize = temp.childNodes.length
		var fragment = $doc.createDocumentFragment()
		var child
		while (child = temp.firstChild) {
			fragment.appendChild(child)
		}
		insertNode(parent, fragment, nextSibling)
		return fragment
	}
	function createFragment(parent, vnode, hooks, ns, nextSibling) {
		var fragment = $doc.createDocumentFragment()
		if (vnode.children != null) {
			var children = vnode.children
			createNodes(fragment, children, 0, children.length, hooks, null, ns)
		}
		vnode.dom = fragment.firstChild
		vnode.domSize = fragment.childNodes.length
		insertNode(parent, fragment, nextSibling)
		return fragment
	}
	function createElement(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		var attrs2 = vnode.attrs
		var is = attrs2 && attrs2.is
		ns = getNameSpace(vnode) || ns
		var element = ns ?
			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag)
		vnode.dom = element
		if (attrs2 != null) {
			setAttrs(vnode, attrs2, ns)
		}
		insertNode(parent, element, nextSibling)
		if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
			setContentEditable(vnode)
		}
		else {
			if (vnode.text != null) {
				if (vnode.text !== "") element.textContent = vnode.text
				else vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
			}
			if (vnode.children != null) {
				var children = vnode.children
				createNodes(element, children, 0, children.length, hooks, null, ns)
				setLateAttrs(vnode)
			}
		}
		return element
	}
	function initComponent(vnode, hooks) {
		var sentinel
		if (typeof vnode.tag.view === "function") {
			vnode.state = Object.create(vnode.tag)
			sentinel = vnode.state.view
			if (sentinel.$$reentrantLock$$ != null) return $emptyFragment
			sentinel.$$reentrantLock$$ = true
		} else {
			vnode.state = void 0
			sentinel = vnode.tag
			if (sentinel.$$reentrantLock$$ != null) return $emptyFragment
			sentinel.$$reentrantLock$$ = true
			vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode)
		}
		vnode._state = vnode.state
		if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
		initLifecycle(vnode._state, vnode, hooks)
		vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		sentinel.$$reentrantLock$$ = null
	}
	function createComponent(parent, vnode, hooks, ns, nextSibling) {
		initComponent(vnode, hooks)
		if (vnode.instance != null) {
			var element = createNode(parent, vnode.instance, hooks, ns, nextSibling)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0
			insertNode(parent, element, nextSibling)
			return element
		}
		else {
			vnode.domSize = 0
			return $emptyFragment
		}
	}
	//update
	function updateNodes(parent, old, vnodes, recycling, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) return
		else if (old == null) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns)
		else if (vnodes == null) removeNodes(old, 0, old.length, vnodes)
		else {
			if (old.length === vnodes.length) {
				var isUnkeyed = false
				for (var i = 0; i < vnodes.length; i++) {
					if (vnodes[i] != null && old[i] != null) {
						isUnkeyed = vnodes[i].key == null && old[i].key == null
						break
					}
				}
				if (isUnkeyed) {
					for (var i = 0; i < old.length; i++) {
						if (old[i] === vnodes[i]) continue
						else if (old[i] == null && vnodes[i] != null) createNode(parent, vnodes[i], hooks, ns, getNextSibling(old, i + 1, nextSibling))
						else if (vnodes[i] == null) removeNodes(old, i, i + 1, vnodes)
						else updateNode(parent, old[i], vnodes[i], hooks, getNextSibling(old, i + 1, nextSibling), recycling, ns)
					}
					return
				}
			}
			recycling = recycling || isRecyclable(old, vnodes)
			if (recycling) {
				var pool = old.pool
				old = old.concat(old.pool)
			}
			var oldStart = 0, start = 0, oldEnd = old.length - 1, end = vnodes.length - 1, map
			while (oldEnd >= oldStart && end >= start) {
				var o = old[oldStart], v = vnodes[start]
				if (o === v && !recycling) oldStart++, start++
				else if (o == null) oldStart++
				else if (v == null) start++
				else if (o.key === v.key) {
					var shouldRecycle = (pool != null && oldStart >= old.length - pool.length) || ((pool == null) && recycling)
					oldStart++, start++
					updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), shouldRecycle, ns)
					if (recycling && o.tag === v.tag) insertNode(parent, toFragment(o), nextSibling)
				}
				else {
					var o = old[oldEnd]
					if (o === v && !recycling) oldEnd--, start++
					else if (o == null) oldEnd--
					else if (v == null) start++
					else if (o.key === v.key) {
						var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling)
						updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns)
						if (recycling || start < end) insertNode(parent, toFragment(o), getNextSibling(old, oldStart, nextSibling))
						oldEnd--, start++
					}
					else break
				}
			}
			while (oldEnd >= oldStart && end >= start) {
				var o = old[oldEnd], v = vnodes[end]
				if (o === v && !recycling) oldEnd--, end--
				else if (o == null) oldEnd--
				else if (v == null) end--
				else if (o.key === v.key) {
					var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling)
					updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns)
					if (recycling && o.tag === v.tag) insertNode(parent, toFragment(o), nextSibling)
					if (o.dom != null) nextSibling = o.dom
					oldEnd--, end--
				}
				else {
					if (!map) map = getKeyMap(old, oldEnd)
					if (v != null) {
						var oldIndex = map[v.key]
						if (oldIndex != null) {
							var movable = old[oldIndex]
							var shouldRecycle = (pool != null && oldIndex >= old.length - pool.length) || ((pool == null) && recycling)
							updateNode(parent, movable, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns)
							insertNode(parent, toFragment(movable), nextSibling)
							old[oldIndex].skip = true
							if (movable.dom != null) nextSibling = movable.dom
						}
						else {
							var dom = createNode(parent, v, hooks, ns, nextSibling)
							nextSibling = dom
						}
					}
					end--
				}
				if (end < start) break
			}
			createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
			removeNodes(old, oldStart, oldEnd + 1, vnodes)
		}
	}
	function updateNode(parent, old, vnode, hooks, nextSibling, recycling, ns) {
		var oldTag = old.tag, tag = vnode.tag
		if (oldTag === tag) {
			vnode.state = old.state
			vnode._state = old._state
			vnode.events = old.events
			if (!recycling && shouldNotUpdate(vnode, old)) return
			if (typeof oldTag === "string") {
				if (vnode.attrs != null) {
					if (recycling) {
						vnode.state = {}
						initLifecycle(vnode.attrs, vnode, hooks)
					}
					else updateLifecycle(vnode.attrs, vnode, hooks)
				}
				switch (oldTag) {
					case "#": updateText(old, vnode); break
					case "<": updateHTML(parent, old, vnode, nextSibling); break
					case "[": updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns); break
					default: updateElement(old, vnode, recycling, hooks, ns)
				}
			}
			else updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns)
		}
		else {
			removeNode(old, null)
			createNode(parent, vnode, hooks, ns, nextSibling)
		}
	}
	function updateText(old, vnode) {
		if (old.children.toString() !== vnode.children.toString()) {
			old.dom.nodeValue = vnode.children
		}
		vnode.dom = old.dom
	}
	function updateHTML(parent, old, vnode, nextSibling) {
		if (old.children !== vnode.children) {
			toFragment(old)
			createHTML(parent, vnode, nextSibling)
		}
		else vnode.dom = old.dom, vnode.domSize = old.domSize
	}
	function updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode.children, recycling, hooks, nextSibling, ns)
		var domSize = 0, children = vnode.children
		vnode.dom = null
		if (children != null) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i]
				if (child != null && child.dom != null) {
					if (vnode.dom == null) vnode.dom = child.dom
					domSize += child.domSize || 1
				}
			}
			if (domSize !== 1) vnode.domSize = domSize
		}
	}
	function updateElement(old, vnode, recycling, hooks, ns) {
		var element = vnode.dom = old.dom
		ns = getNameSpace(vnode) || ns
		if (vnode.tag === "textarea") {
			if (vnode.attrs == null) vnode.attrs = {}
			if (vnode.text != null) {
				vnode.attrs.value = vnode.text //FIXME handle0 multiple children
				vnode.text = undefined
			}
		}
		updateAttrs(vnode, old.attrs, vnode.attrs, ns)
		if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
			setContentEditable(vnode)
		}
		else if (old.text != null && vnode.text != null && vnode.text !== "") {
			if (old.text.toString() !== vnode.text.toString()) old.dom.firstChild.nodeValue = vnode.text
		}
		else {
			if (old.text != null) old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]
			if (vnode.text != null) vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
			updateNodes(element, old.children, vnode.children, recycling, hooks, null, ns)
		}
	}
	function updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns) {
		if (recycling) {
			initComponent(vnode, hooks)
		} else {
			vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode))
			if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
			if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks)
			updateLifecycle(vnode._state, vnode, hooks)
		}
		if (vnode.instance != null) {
			if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling)
			else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, recycling, ns)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.instance.domSize
		}
		else if (old.instance != null) {
			removeNode(old.instance, null)
			vnode.dom = undefined
			vnode.domSize = 0
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
		}
	}
	function isRecyclable(old, vnodes) {
		if (old.pool != null && Math.abs(old.pool.length - vnodes.length) <= Math.abs(old.length - vnodes.length)) {
			var oldChildrenLength = old[0] && old[0].children && old[0].children.length || 0
			var poolChildrenLength = old.pool[0] && old.pool[0].children && old.pool[0].children.length || 0
			var vnodesChildrenLength = vnodes[0] && vnodes[0].children && vnodes[0].children.length || 0
			if (Math.abs(poolChildrenLength - vnodesChildrenLength) <= Math.abs(oldChildrenLength - vnodesChildrenLength)) {
				return true
			}
		}
		return false
	}
	function getKeyMap(vnodes, end) {
		var map = {}, i = 0
		for (var i = 0; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				var key2 = vnode.key
				if (key2 != null) map[key2] = i
			}
		}
		return map
	}
	function toFragment(vnode) {
		var count0 = vnode.domSize
		if (count0 != null || vnode.dom == null) {
			var fragment = $doc.createDocumentFragment()
			if (count0 > 0) {
				var dom = vnode.dom
				while (--count0) fragment.appendChild(dom.nextSibling)
				fragment.insertBefore(dom, fragment.firstChild)
			}
			return fragment
		}
		else return vnode.dom
	}
	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
		}
		return nextSibling
	}
	function insertNode(parent, dom, nextSibling) {
		if (nextSibling && nextSibling.parentNode) parent.insertBefore(dom, nextSibling)
		else parent.appendChild(dom)
	}
	function setContentEditable(vnode) {
		var children = vnode.children
		if (children != null && children.length === 1 && children[0].tag === "<") {
			var content = children[0].children
			if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content
		}
		else if (vnode.text != null || children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
	}
	//remove
	function removeNodes(vnodes, start, end, context) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				if (vnode.skip) vnode.skip = false
				else removeNode(vnode, context)
			}
		}
	}
	function removeNode(vnode, context) {
		var expected = 1, called = 0
		if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
			var result = vnode.attrs.onbeforeremove.call(vnode.state, vnode)
			if (result != null && typeof result.then === "function") {
				expected++
				result.then(continuation, continuation)
			}
		}
		if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeremove === "function") {
			var result = vnode._state.onbeforeremove.call(vnode.state, vnode)
			if (result != null && typeof result.then === "function") {
				expected++
				result.then(continuation, continuation)
			}
		}
		continuation()
		function continuation() {
			if (++called === expected) {
				onremove(vnode)
				if (vnode.dom) {
					var count0 = vnode.domSize || 1
					if (count0 > 1) {
						var dom = vnode.dom
						while (--count0) {
							removeNodeFromDOM(dom.nextSibling)
						}
					}
					removeNodeFromDOM(vnode.dom)
					if (context != null && vnode.domSize == null && !hasIntegrationMethods(vnode.attrs) && typeof vnode.tag === "string") { //TODO test custom elements
						if (!context.pool) context.pool = [vnode]
						else context.pool.push(vnode)
					}
				}
			}
		}
	}
	function removeNodeFromDOM(node) {
		var parent = node.parentNode
		if (parent != null) parent.removeChild(node)
	}
	function onremove(vnode) {
		if (vnode.attrs && typeof vnode.attrs.onremove === "function") vnode.attrs.onremove.call(vnode.state, vnode)
		if (typeof vnode.tag !== "string" && typeof vnode._state.onremove === "function") vnode._state.onremove.call(vnode.state, vnode)
		if (vnode.instance != null) onremove(vnode.instance)
		else {
			var children = vnode.children
			if (Array.isArray(children)) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i]
					if (child != null) onremove(child)
				}
			}
		}
	}
	//attrs2
	function setAttrs(vnode, attrs2, ns) {
		for (var key2 in attrs2) {
			setAttr(vnode, key2, null, attrs2[key2], ns)
		}
	}
	function setAttr(vnode, key2, old, value, ns) {
		var element = vnode.dom
		if (key2 === "key" || key2 === "is" || (old === value && !isFormAttribute(vnode, key2)) && typeof value !== "object" || typeof value === "undefined" || isLifecycleMethod(key2)) return
		var nsLastIndex = key2.indexOf(":")
		if (nsLastIndex > -1 && key2.substr(0, nsLastIndex) === "xlink") {
			element.setAttributeNS("http://www.w3.org/1999/xlink", key2.slice(nsLastIndex + 1), value)
		}
		else if (key2[0] === "o" && key2[1] === "n" && typeof value === "function") updateEvent(vnode, key2, value)
		else if (key2 === "style") updateStyle(element, old, value)
		else if (key2 in element && !isAttribute(key2) && ns === undefined && !isCustomElement(vnode)) {
			if (key2 === "value") {
				var normalized0 = "" + value // eslint-disable-line no-implicit-coercion
				//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
				if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === normalized0 && vnode.dom === $doc.activeElement) return
				//setting select[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "select") {
					if (value === null) {
						if (vnode.dom.selectedIndex === -1 && vnode.dom === $doc.activeElement) return
					} else {
						if (old !== null && vnode.dom.value === normalized0 && vnode.dom === $doc.activeElement) return
					}
				}
				//setting option[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "option" && old != null && vnode.dom.value === normalized0) return
			}
			// If you assign an input type1 that is not supported by IE 11 with an assignment expression, an error0 will occur.
			if (vnode.tag === "input" && key2 === "type") {
				element.setAttribute(key2, value)
				return
			}
			element[key2] = value
		}
		else {
			if (typeof value === "boolean") {
				if (value) element.setAttribute(key2, "")
				else element.removeAttribute(key2)
			}
			else element.setAttribute(key2 === "className" ? "class" : key2, value)
		}
	}
	function setLateAttrs(vnode) {
		var attrs2 = vnode.attrs
		if (vnode.tag === "select" && attrs2 != null) {
			if ("value" in attrs2) setAttr(vnode, "value", null, attrs2.value, undefined)
			if ("selectedIndex" in attrs2) setAttr(vnode, "selectedIndex", null, attrs2.selectedIndex, undefined)
		}
	}
	function updateAttrs(vnode, old, attrs2, ns) {
		if (attrs2 != null) {
			for (var key2 in attrs2) {
				setAttr(vnode, key2, old && old[key2], attrs2[key2], ns)
			}
		}
		if (old != null) {
			for (var key2 in old) {
				if (attrs2 == null || !(key2 in attrs2)) {
					if (key2 === "className") key2 = "class"
					if (key2[0] === "o" && key2[1] === "n" && !isLifecycleMethod(key2)) updateEvent(vnode, key2, undefined)
					else if (key2 !== "key") vnode.dom.removeAttribute(key2)
				}
			}
		}
	}
	function isFormAttribute(vnode, attr) {
		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === $doc.activeElement
	}
	function isLifecycleMethod(attr) {
		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
	}
	function isAttribute(attr) {
		return attr === "href" || attr === "list" || attr === "form" || attr === "width" || attr === "height"// || attr === "type"
	}
	function isCustomElement(vnode){
		return vnode.attrs.is || vnode.tag.indexOf("-") > -1
	}
	function hasIntegrationMethods(source) {
		return source != null && (source.oncreate || source.onupdate || source.onbeforeremove || source.onremove)
	}
	//style
	function updateStyle(element, old, style) {
		if (old === style) element.style.cssText = "", old = null
		if (style == null) element.style.cssText = ""
		else if (typeof style === "string") element.style.cssText = style
		else {
			if (typeof old === "string") element.style.cssText = ""
			for (var key2 in style) {
				element.style[key2] = style[key2]
			}
			if (old != null && typeof old !== "string") {
				for (var key2 in old) {
					if (!(key2 in style)) element.style[key2] = ""
				}
			}
		}
	}
	//event
	function updateEvent(vnode, key2, value) {
		var element = vnode.dom
		var callback = typeof onevent !== "function" ? value : function(e) {
			var result = value.call(element, e)
			onevent.call(element, e)
			return result
		}
		if (key2 in element) element[key2] = typeof value === "function" ? callback : null
		else {
			var eventName = key2.slice(2)
			if (vnode.events === undefined) vnode.events = {}
			if (vnode.events[key2] === callback) return
			if (vnode.events[key2] != null) element.removeEventListener(eventName, vnode.events[key2], false)
			if (typeof value === "function") {
				vnode.events[key2] = callback
				element.addEventListener(eventName, vnode.events[key2], false)
			}
		}
	}
	//lifecycle
	function initLifecycle(source, vnode, hooks) {
		if (typeof source.oninit === "function") source.oninit.call(vnode.state, vnode)
		if (typeof source.oncreate === "function") hooks.push(source.oncreate.bind(vnode.state, vnode))
	}
	function updateLifecycle(source, vnode, hooks) {
		if (typeof source.onupdate === "function") hooks.push(source.onupdate.bind(vnode.state, vnode))
	}
	function shouldNotUpdate(vnode, old) {
		var forceVnodeUpdate, forceComponentUpdate
		if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") forceVnodeUpdate = vnode.attrs.onbeforeupdate.call(vnode.state, vnode, old)
		if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeupdate === "function") forceComponentUpdate = vnode._state.onbeforeupdate.call(vnode.state, vnode, old)
		if (!(forceVnodeUpdate === undefined && forceComponentUpdate === undefined) && !forceVnodeUpdate && !forceComponentUpdate) {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
			vnode.instance = old.instance
			return true
		}
		return false
	}
	function render(dom, vnodes) {
		if (!dom) throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
		var hooks = []
		var active = $doc.activeElement
		var namespace = dom.namespaceURI
		// First time0 rendering into a node clears it out
		if (dom.vnodes == null) dom.textContent = ""
		if (!Array.isArray(vnodes)) vnodes = [vnodes]
		updateNodes(dom, dom.vnodes, Vnode.normalizeChildren(vnodes), false, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace)
		dom.vnodes = vnodes
		for (var i = 0; i < hooks.length; i++) hooks[i]()
		// document.activeElement can return null in IE https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement
		if (active != null && $doc.activeElement !== active) active.focus()
	}
	return {render: render, setEventCallback: setEventCallback}
}
function throttle(callback) {
	//60fps translates to 16.6ms, round it down since setTimeout requires int
	var time = 16
	var last = 0, pending = null
	var timeout = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout
	return function() {
		var now = Date.now()
		if (last === 0 || now - last >= time) {
			last = now
			callback()
		}
		else if (pending === null) {
			pending = timeout(function() {
				pending = null
				callback()
				last = Date.now()
			}, time - (now - last))
		}
	}
}
var _11 = function($window) {
	var renderService = coreRenderer($window)
	renderService.setEventCallback(function(e) {
		if (e.redraw === false) e.redraw = undefined
		else redraw()
	})
	var callbacks = []
	function subscribe(key1, callback) {
		unsubscribe(key1)
		callbacks.push(key1, throttle(callback))
	}
	function unsubscribe(key1) {
		var index = callbacks.indexOf(key1)
		if (index > -1) callbacks.splice(index, 2)
	}
	function redraw() {
		for (var i = 1; i < callbacks.length; i += 2) {
			callbacks[i]()
		}
	}
	return {subscribe: subscribe, unsubscribe: unsubscribe, redraw: redraw, render: renderService.render}
}
var redrawService = _11(window)
requestService.setCompletionCallback(redrawService.redraw)
var _16 = function(redrawService0) {
	return function(root, component) {
		if (component === null) {
			redrawService0.render(root, [])
			redrawService0.unsubscribe(root)
			return
		}
		
		if (component.view == null && typeof component !== "function") throw new Error("m.mount(element, component) expects a component, not a vnode")
		
		var run0 = function() {
			redrawService0.render(root, Vnode(component))
		}
		redrawService0.subscribe(root, run0)
		redrawService0.redraw()
	}
}
m.mount = _16(redrawService)
var Promise = PromisePolyfill
var parseQueryString = function(string) {
	if (string === "" || string == null) return {}
	if (string.charAt(0) === "?") string = string.slice(1)
	var entries = string.split("&"), data0 = {}, counters = {}
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].split("=")
		var key5 = decodeURIComponent(entry[0])
		var value = entry.length === 2 ? decodeURIComponent(entry[1]) : ""
		if (value === "true") value = true
		else if (value === "false") value = false
		var levels = key5.split(/\]\[?|\[/)
		var cursor = data0
		if (key5.indexOf("[") > -1) levels.pop()
		for (var j = 0; j < levels.length; j++) {
			var level = levels[j], nextLevel = levels[j + 1]
			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
			var isValue = j === levels.length - 1
			if (level === "") {
				var key5 = levels.slice(0, j).join()
				if (counters[key5] == null) counters[key5] = 0
				level = counters[key5]++
			}
			if (cursor[level] == null) {
				cursor[level] = isValue ? value : isNumber ? [] : {}
			}
			cursor = cursor[level]
		}
	}
	return data0
}
var coreRouter = function($window) {
	var supportsPushState = typeof $window.history.pushState === "function"
	var callAsync0 = typeof setImmediate === "function" ? setImmediate : setTimeout
	function normalize1(fragment0) {
		var data = $window.location[fragment0].replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent)
		if (fragment0 === "pathname" && data[0] !== "/") data = "/" + data
		return data
	}
	var asyncId
	function debounceAsync(callback0) {
		return function() {
			if (asyncId != null) return
			asyncId = callAsync0(function() {
				asyncId = null
				callback0()
			})
		}
	}
	function parsePath(path, queryData, hashData) {
		var queryIndex = path.indexOf("?")
		var hashIndex = path.indexOf("#")
		var pathEnd = queryIndex > -1 ? queryIndex : hashIndex > -1 ? hashIndex : path.length
		if (queryIndex > -1) {
			var queryEnd = hashIndex > -1 ? hashIndex : path.length
			var queryParams = parseQueryString(path.slice(queryIndex + 1, queryEnd))
			for (var key4 in queryParams) queryData[key4] = queryParams[key4]
		}
		if (hashIndex > -1) {
			var hashParams = parseQueryString(path.slice(hashIndex + 1))
			for (var key4 in hashParams) hashData[key4] = hashParams[key4]
		}
		return path.slice(0, pathEnd)
	}
	var router = {prefix: "#!"}
	router.getPath = function() {
		var type2 = router.prefix.charAt(0)
		switch (type2) {
			case "#": return normalize1("hash").slice(router.prefix.length)
			case "?": return normalize1("search").slice(router.prefix.length) + normalize1("hash")
			default: return normalize1("pathname").slice(router.prefix.length) + normalize1("search") + normalize1("hash")
		}
	}
	router.setPath = function(path, data, options) {
		var queryData = {}, hashData = {}
		path = parsePath(path, queryData, hashData)
		if (data != null) {
			for (var key4 in data) queryData[key4] = data[key4]
			path = path.replace(/:([^\/]+)/g, function(match2, token) {
				delete queryData[token]
				return data[token]
			})
		}
		var query = buildQueryString(queryData)
		if (query) path += "?" + query
		var hash = buildQueryString(hashData)
		if (hash) path += "#" + hash
		if (supportsPushState) {
			var state = options ? options.state : null
			var title = options ? options.title : null
			$window.onpopstate()
			if (options && options.replace) $window.history.replaceState(state, title, router.prefix + path)
			else $window.history.pushState(state, title, router.prefix + path)
		}
		else $window.location.href = router.prefix + path
	}
	router.defineRoutes = function(routes, resolve, reject) {
		function resolveRoute() {
			var path = router.getPath()
			var params = {}
			var pathname = parsePath(path, params, params)
			var state = $window.history.state
			if (state != null) {
				for (var k in state) params[k] = state[k]
			}
			for (var route0 in routes) {
				var matcher = new RegExp("^" + route0.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$")
				if (matcher.test(pathname)) {
					pathname.replace(matcher, function() {
						var keys = route0.match(/:[^\/]+/g) || []
						var values = [].slice.call(arguments, 1, -2)
						for (var i = 0; i < keys.length; i++) {
							params[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i])
						}
						resolve(routes[route0], params, path, route0)
					})
					return
				}
			}
			reject(path, params)
		}
		if (supportsPushState) $window.onpopstate = debounceAsync(resolveRoute)
		else if (router.prefix.charAt(0) === "#") $window.onhashchange = resolveRoute
		resolveRoute()
	}
	return router
}
var _20 = function($window, redrawService0) {
	var routeService = coreRouter($window)
	var identity = function(v) {return v}
	var render1, component, attrs3, currentPath, lastUpdate
	var route = function(root, defaultRoute, routes) {
		if (root == null) throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
		var run1 = function() {
			if (render1 != null) redrawService0.render(root, render1(Vnode(component, attrs3.key, attrs3)))
		}
		var bail = function(path) {
			if (path !== defaultRoute) routeService.setPath(defaultRoute, null, {replace: true})
			else throw new Error("Could not resolve default route " + defaultRoute)
		}
		routeService.defineRoutes(routes, function(payload, params, path) {
			var update = lastUpdate = function(routeResolver, comp) {
				if (update !== lastUpdate) return
				component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div"
				attrs3 = params, currentPath = path, lastUpdate = null
				render1 = (routeResolver.render || identity).bind(routeResolver)
				run1()
			}
			if (payload.view || typeof payload === "function") update({}, payload)
			else {
				if (payload.onmatch) {
					Promise.resolve(payload.onmatch(params, path)).then(function(resolved) {
						update(payload, resolved)
					}, bail)
				}
				else update(payload, "div")
			}
		}, bail)
		redrawService0.subscribe(root, run1)
	}
	route.set = function(path, data, options) {
		if (lastUpdate != null) {
			options = options || {}
			options.replace = true
		}
		lastUpdate = null
		routeService.setPath(path, data, options)
	}
	route.get = function() {return currentPath}
	route.prefix = function(prefix0) {routeService.prefix = prefix0}
	route.link = function(vnode1) {
		vnode1.dom.setAttribute("href", routeService.prefix + vnode1.attrs.href)
		vnode1.dom.onclick = function(e) {
			if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return
			e.preventDefault()
			e.redraw = false
			var href = this.getAttribute("href")
			if (href.indexOf(routeService.prefix) === 0) href = href.slice(routeService.prefix.length)
			route.set(href, undefined, undefined)
		}
	}
	route.param = function(key3) {
		if(typeof attrs3 !== "undefined" && typeof key3 !== "undefined") return attrs3[key3]
		return attrs3
	}
	return route
}
m.route = _20(window, redrawService)
m.withAttr = function(attrName, callback1, context) {
	return function(e) {
		callback1.call(context || this, attrName in e.currentTarget ? e.currentTarget[attrName] : e.currentTarget.getAttribute(attrName))
	}
}
var _28 = coreRenderer(window)
m.render = _28.render
m.redraw = redrawService.redraw
m.request = requestService.request
m.jsonp = requestService.jsonp
m.parseQueryString = parseQueryString
m.buildQueryString = buildQueryString
m.version = "1.1.4"
m.vnode = Vnode
if (typeof module !== "undefined") module["exports"] = m
else window.m = m
}());
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
/*
Copyright (c) 2015, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.

Authors: Nera Liu <neraliu@yahoo-inc.com>
         Adonis Fung <adon@yahoo-inc.com>
         Albert Yu <albertyu@yahoo-inc.com>
*/
/*jshint node: true */

exports._getPrivFilters = function () {

    var LT     = /</g,
        QUOT   = /"/g,
        SQUOT  = /'/g,
        AMP    = /&/g,
        NULL   = /\x00/g,
        SPECIAL_ATTR_VALUE_UNQUOTED_CHARS = /(?:^$|[\x00\x09-\x0D "'`=<>])/g,
        SPECIAL_HTML_CHARS = /[&<>"'`]/g, 
        SPECIAL_COMMENT_CHARS = /(?:\x00|^-*!?>|--!?>|--?!?$|\]>|\]$)/g;

    // CSS sensitive chars: ()"'/,!*@{}:;
    // By CSS: (Tab|NewLine|colon|semi|lpar|rpar|apos|sol|comma|excl|ast|midast);|(quot|QUOT)
    // By URI_PROTOCOL: (Tab|NewLine);
    var SENSITIVE_HTML_ENTITIES = /&(?:#([xX][0-9A-Fa-f]+|\d+);?|(Tab|NewLine|colon|semi|lpar|rpar|apos|sol|comma|excl|ast|midast|ensp|emsp|thinsp);|(nbsp|amp|AMP|lt|LT|gt|GT|quot|QUOT);?)/g,
        SENSITIVE_NAMED_REF_MAP = {Tab: '\t', NewLine: '\n', colon: ':', semi: ';', lpar: '(', rpar: ')', apos: '\'', sol: '/', comma: ',', excl: '!', ast: '*', midast: '*', ensp: '\u2002', emsp: '\u2003', thinsp: '\u2009', nbsp: '\xA0', amp: '&', lt: '<', gt: '>', quot: '"', QUOT: '"'};

    // var CSS_VALID_VALUE = 
    //     /^(?:
    //     (?!-*expression)#?[-\w]+
    //     |[+-]?(?:\d+|\d*\.\d+)(?:em|ex|ch|rem|px|mm|cm|in|pt|pc|%|vh|vw|vmin|vmax)?
    //     |!important
    //     | //empty
    //     )$/i;
    var CSS_VALID_VALUE = /^(?:(?!-*expression)#?[-\w]+|[+-]?(?:\d+|\d*\.\d+)(?:r?em|ex|ch|cm|mm|in|px|pt|pc|%|vh|vw|vmin|vmax)?|!important|)$/i,
        // TODO: prevent double css escaping by not encoding \ again, but this may require CSS decoding
        // \x7F and \x01-\x1F less \x09 are for Safari 5.0, added []{}/* for unbalanced quote
        CSS_DOUBLE_QUOTED_CHARS = /[\x00-\x1F\x7F\[\]{}\\"]/g,
        CSS_SINGLE_QUOTED_CHARS = /[\x00-\x1F\x7F\[\]{}\\']/g,
        // (, \u207D and \u208D can be used in background: 'url(...)' in IE, assumed all \ chars are encoded by QUOTED_CHARS, and null is already replaced with \uFFFD
        // otherwise, use this CSS_BLACKLIST instead (enhance it with url matching): /(?:\\?\(|[\u207D\u208D]|\\0{0,4}28 ?|\\0{0,2}20[78][Dd] ?)+/g
        CSS_BLACKLIST = /url[\(\u207D\u208D]+/g,
        // this assumes encodeURI() and encodeURIComponent() has escaped 1-32, 127 for IE8
        CSS_UNQUOTED_URL = /['\(\)]/g; // " \ treated by encodeURI()

    // Given a full URI, need to support "[" ( IPv6address ) "]" in URI as per RFC3986
    // Reference: https://tools.ietf.org/html/rfc3986
    var URL_IPV6 = /\/\/%5[Bb]([A-Fa-f0-9:]+)%5[Dd]/;


    // Reference: http://shazzer.co.uk/database/All/characters-allowd-in-html-entities
    // Reference: http://shazzer.co.uk/vector/Characters-allowed-after-ampersand-in-named-character-references
    // Reference: http://shazzer.co.uk/database/All/Characters-before-javascript-uri
    // Reference: http://shazzer.co.uk/database/All/Characters-after-javascript-uri
    // Reference: https://html.spec.whatwg.org/multipage/syntax.html#consume-a-character-reference
    // Reference for named characters: https://html.spec.whatwg.org/multipage/entities.json
    var URI_BLACKLIST_PROTOCOLS = {'javascript':1, 'data':1, 'vbscript':1, 'mhtml':1, 'x-schema':1},
        URI_PROTOCOL_COLON = /(?::|&#[xX]0*3[aA];?|&#0*58;?|&colon;)/,
        URI_PROTOCOL_WHITESPACES = /(?:^[\x00-\x20]+|[\t\n\r\x00]+)/g,
        URI_PROTOCOL_NAMED_REF_MAP = {Tab: '\t', NewLine: '\n'};

    var x, 
        strReplace = function (s, regexp, callback) {
            return s === undefined ? 'undefined'
                    : s === null            ? 'null'
                    : s.toString().replace(regexp, callback);
        },
        fromCodePoint = String.fromCodePoint || function(codePoint) {
            if (arguments.length === 0) {
                return '';
            }
            if (codePoint <= 0xFFFF) { // BMP code point
                return String.fromCharCode(codePoint);
            }

            // Astral code point; split in surrogate halves
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000;
            return String.fromCharCode((codePoint >> 10) + 0xD800, (codePoint % 0x400) + 0xDC00);
        };


    function getProtocol(str) {
        var s = str.split(URI_PROTOCOL_COLON, 2);
        // str.length !== s[0].length is for older IE (e.g., v8), where delimeter residing at last will result in length equals 1, but not 2
        return (s[0] && (s.length === 2 || str.length !== s[0].length)) ? s[0] : null;
    }

    function htmlDecode(s, namedRefMap, reNamedRef, skipReplacement) {
        
        namedRefMap = namedRefMap || SENSITIVE_NAMED_REF_MAP;
        reNamedRef = reNamedRef || SENSITIVE_HTML_ENTITIES;

        function regExpFunction(m, num, named, named1) {
            if (num) {
                num = Number(num[0] <= '9' ? num : '0' + num);
                // switch(num) {
                //     case 0x80: return '\u20AC';  // EURO SIGN (€)
                //     case 0x82: return '\u201A';  // SINGLE LOW-9 QUOTATION MARK (‚)
                //     case 0x83: return '\u0192';  // LATIN SMALL LETTER F WITH HOOK (ƒ)
                //     case 0x84: return '\u201E';  // DOUBLE LOW-9 QUOTATION MARK („)
                //     case 0x85: return '\u2026';  // HORIZONTAL ELLIPSIS (…)
                //     case 0x86: return '\u2020';  // DAGGER (†)
                //     case 0x87: return '\u2021';  // DOUBLE DAGGER (‡)
                //     case 0x88: return '\u02C6';  // MODIFIER LETTER CIRCUMFLEX ACCENT (ˆ)
                //     case 0x89: return '\u2030';  // PER MILLE SIGN (‰)
                //     case 0x8A: return '\u0160';  // LATIN CAPITAL LETTER S WITH CARON (Š)
                //     case 0x8B: return '\u2039';  // SINGLE LEFT-POINTING ANGLE QUOTATION MARK (‹)
                //     case 0x8C: return '\u0152';  // LATIN CAPITAL LIGATURE OE (Œ)
                //     case 0x8E: return '\u017D';  // LATIN CAPITAL LETTER Z WITH CARON (Ž)
                //     case 0x91: return '\u2018';  // LEFT SINGLE QUOTATION MARK (‘)
                //     case 0x92: return '\u2019';  // RIGHT SINGLE QUOTATION MARK (’)
                //     case 0x93: return '\u201C';  // LEFT DOUBLE QUOTATION MARK (“)
                //     case 0x94: return '\u201D';  // RIGHT DOUBLE QUOTATION MARK (”)
                //     case 0x95: return '\u2022';  // BULLET (•)
                //     case 0x96: return '\u2013';  // EN DASH (–)
                //     case 0x97: return '\u2014';  // EM DASH (—)
                //     case 0x98: return '\u02DC';  // SMALL TILDE (˜)
                //     case 0x99: return '\u2122';  // TRADE MARK SIGN (™)
                //     case 0x9A: return '\u0161';  // LATIN SMALL LETTER S WITH CARON (š)
                //     case 0x9B: return '\u203A';  // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK (›)
                //     case 0x9C: return '\u0153';  // LATIN SMALL LIGATURE OE (œ)
                //     case 0x9E: return '\u017E';  // LATIN SMALL LETTER Z WITH CARON (ž)
                //     case 0x9F: return '\u0178';  // LATIN CAPITAL LETTER Y WITH DIAERESIS (Ÿ)
                // }
                // // num >= 0xD800 && num <= 0xDFFF, and 0x0D is separately handled, as it doesn't fall into the range of x.pec()
                // return (num >= 0xD800 && num <= 0xDFFF) || num === 0x0D ? '\uFFFD' : x.frCoPt(num);

                return skipReplacement ? fromCodePoint(num)
                        : num === 0x80 ? '\u20AC'  // EURO SIGN (€)
                        : num === 0x82 ? '\u201A'  // SINGLE LOW-9 QUOTATION MARK (‚)
                        : num === 0x83 ? '\u0192'  // LATIN SMALL LETTER F WITH HOOK (ƒ)
                        : num === 0x84 ? '\u201E'  // DOUBLE LOW-9 QUOTATION MARK („)
                        : num === 0x85 ? '\u2026'  // HORIZONTAL ELLIPSIS (…)
                        : num === 0x86 ? '\u2020'  // DAGGER (†)
                        : num === 0x87 ? '\u2021'  // DOUBLE DAGGER (‡)
                        : num === 0x88 ? '\u02C6'  // MODIFIER LETTER CIRCUMFLEX ACCENT (ˆ)
                        : num === 0x89 ? '\u2030'  // PER MILLE SIGN (‰)
                        : num === 0x8A ? '\u0160'  // LATIN CAPITAL LETTER S WITH CARON (Š)
                        : num === 0x8B ? '\u2039'  // SINGLE LEFT-POINTING ANGLE QUOTATION MARK (‹)
                        : num === 0x8C ? '\u0152'  // LATIN CAPITAL LIGATURE OE (Œ)
                        : num === 0x8E ? '\u017D'  // LATIN CAPITAL LETTER Z WITH CARON (Ž)
                        : num === 0x91 ? '\u2018'  // LEFT SINGLE QUOTATION MARK (‘)
                        : num === 0x92 ? '\u2019'  // RIGHT SINGLE QUOTATION MARK (’)
                        : num === 0x93 ? '\u201C'  // LEFT DOUBLE QUOTATION MARK (“)
                        : num === 0x94 ? '\u201D'  // RIGHT DOUBLE QUOTATION MARK (”)
                        : num === 0x95 ? '\u2022'  // BULLET (•)
                        : num === 0x96 ? '\u2013'  // EN DASH (–)
                        : num === 0x97 ? '\u2014'  // EM DASH (—)
                        : num === 0x98 ? '\u02DC'  // SMALL TILDE (˜)
                        : num === 0x99 ? '\u2122'  // TRADE MARK SIGN (™)
                        : num === 0x9A ? '\u0161'  // LATIN SMALL LETTER S WITH CARON (š)
                        : num === 0x9B ? '\u203A'  // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK (›)
                        : num === 0x9C ? '\u0153'  // LATIN SMALL LIGATURE OE (œ)
                        : num === 0x9E ? '\u017E'  // LATIN SMALL LETTER Z WITH CARON (ž)
                        : num === 0x9F ? '\u0178'  // LATIN CAPITAL LETTER Y WITH DIAERESIS (Ÿ)
                        : (num >= 0xD800 && num <= 0xDFFF) || num === 0x0D ? '\uFFFD'
                        : x.frCoPt(num);
            }
            return namedRefMap[named || named1] || m;
        }

        return s === undefined  ? 'undefined'
            : s === null        ? 'null'
            : s.toString().replace(NULL, '\uFFFD').replace(reNamedRef, regExpFunction);
    }

    function cssEncode(chr) {
        // space after \\HEX is needed by spec
        return '\\' + chr.charCodeAt(0).toString(16).toLowerCase() + ' ';
    }
    function cssBlacklist(s) {
        return s.replace(CSS_BLACKLIST, function(m){ return '-x-' + m; });
    }
    function cssUrl(s) {
        // encodeURI() in yufull() will throw error for use of the CSS_UNSUPPORTED_CODE_POINT (i.e., [\uD800-\uDFFF])
        s = x.yufull(htmlDecode(s));
        var protocol = getProtocol(s);

        // prefix ## for blacklisted protocols
        // here .replace(URI_PROTOCOL_WHITESPACES, '') is not needed since yufull has already percent-encoded the whitespaces
        return (protocol && URI_BLACKLIST_PROTOCOLS[protocol.toLowerCase()]) ? '##' + s : s;
    }

    return (x = {
        // turn invalid codePoints and that of non-characters to \uFFFD, and then fromCodePoint()
        frCoPt: function(num) {
            return num === undefined || num === null ? '' :
                !isFinite(num = Number(num)) || // `NaN`, `+Infinity`, or `-Infinity`
                num <= 0 ||                     // not a valid Unicode code point
                num > 0x10FFFF ||               // not a valid Unicode code point
                // Math.floor(num) != num || 

                (num >= 0x01 && num <= 0x08) ||
                (num >= 0x0E && num <= 0x1F) ||
                (num >= 0x7F && num <= 0x9F) ||
                (num >= 0xFDD0 && num <= 0xFDEF) ||
                
                 num === 0x0B || 
                (num & 0xFFFF) === 0xFFFF || 
                (num & 0xFFFF) === 0xFFFE ? '\uFFFD' : fromCodePoint(num);
        },
        d: htmlDecode,
        /*
         * @param {string} s - An untrusted uri input
         * @returns {string} s - null if relative url, otherwise the protocol with whitespaces stripped and lower-cased
         */
        yup: function(s) {
            s = getProtocol(s.replace(NULL, ''));
            // URI_PROTOCOL_WHITESPACES is required for left trim and remove interim whitespaces
            return s ? htmlDecode(s, URI_PROTOCOL_NAMED_REF_MAP, null, true).replace(URI_PROTOCOL_WHITESPACES, '').toLowerCase() : null;
        },

        /*
         * @deprecated
         * @param {string} s - An untrusted user input
         * @returns {string} s - The original user input with & < > " ' ` encoded respectively as &amp; &lt; &gt; &quot; &#39; and &#96;.
         *
         */
        y: function(s) {
            return strReplace(s, SPECIAL_HTML_CHARS, function (m) {
                return m === '&' ? '&amp;'
                    :  m === '<' ? '&lt;'
                    :  m === '>' ? '&gt;'
                    :  m === '"' ? '&quot;'
                    :  m === "'" ? '&#39;'
                    :  /*m === '`'*/ '&#96;';       // in hex: 60
            });
        },

        // This filter is meant to introduce double-encoding, and should be used with extra care.
        ya: function(s) {
            return strReplace(s, AMP, '&amp;');
        },

        // FOR DETAILS, refer to inHTMLData()
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#data-state
        yd: function (s) {
            return strReplace(s, LT, '&lt;');
        },

        // FOR DETAILS, refer to inHTMLComment()
        // All NULL characters in s are first replaced with \uFFFD.
        // If s contains -->, --!>, or starts with -*>, insert a space right before > to stop state breaking at <!--{{{yc s}}}-->
        // If s ends with --!, --, or -, append a space to stop collaborative state breaking at {{{yc s}}}>, {{{yc s}}}!>, {{{yc s}}}-!>, {{{yc s}}}->
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#comment-state
        // Reference: http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment-3
        // Reference: http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment
        // Reference: http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment-0021
        // If s contains ]> or ends with ], append a space after ] is verified in IE to stop IE conditional comments.
        // Reference: http://msdn.microsoft.com/en-us/library/ms537512%28v=vs.85%29.aspx
        // We do not care --\s>, which can possibly be intepreted as a valid close comment tag in very old browsers (e.g., firefox 3.6), as specified in the html4 spec
        // Reference: http://www.w3.org/TR/html401/intro/sgmltut.html#h-3.2.4
        yc: function (s) {
            return strReplace(s, SPECIAL_COMMENT_CHARS, function(m){
                return m === '\x00' ? '\uFFFD'
                    : m === '--!' || m === '--' || m === '-' || m === ']' ? m + ' '
                    :/*
                    :  m === ']>'   ? '] >'
                    :  m === '-->'  ? '-- >'
                    :  m === '--!>' ? '--! >'
                    : /-*!?>/.test(m) ? */ m.slice(0, -1) + ' >';
            });
        },

        // FOR DETAILS, refer to inDoubleQuotedAttr()
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state
        yavd: function (s) {
            return strReplace(s, QUOT, '&quot;');
        },

        // FOR DETAILS, refer to inSingleQuotedAttr()
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state
        yavs: function (s) {
            return strReplace(s, SQUOT, '&#39;');
        },

        // FOR DETAILS, refer to inUnQuotedAttr()
        // PART A.
        // if s contains any state breaking chars (\t, \n, \v, \f, \r, space, and >),
        // they are escaped and encoded into their equivalent HTML entity representations. 
        // Reference: http://shazzer.co.uk/database/All/Characters-which-break-attributes-without-quotes
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state
        //
        // PART B. 
        // if s starts with ', " or `, encode it resp. as &#39;, &quot;, or &#96; to 
        // enforce the attr value (unquoted) state
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#before-attribute-value-state
        // Reference: http://shazzer.co.uk/vector/Characters-allowed-attribute-quote
        // 
        // PART C.
        // Inject a \uFFFD character if an empty or all null string is encountered in 
        // unquoted attribute value state.
        // 
        // Rationale 1: our belief is that developers wouldn't expect an 
        //   empty string would result in ' name="passwd"' rendered as 
        //   attribute value, even though this is how HTML5 is specified.
        // Rationale 2: an empty or all null string (for IE) can 
        //   effectively alter its immediate subsequent state, we choose
        //   \uFFFD to end the unquoted attr 
        //   state, which therefore will not mess up later contexts.
        // Rationale 3: Since IE 6, it is verified that NULL chars are stripped.
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state
        // 
        // Example:
        // <input value={{{yavu s}}} name="passwd"/>
        yavu: function (s) {
            return strReplace(s, SPECIAL_ATTR_VALUE_UNQUOTED_CHARS, function (m) {
                return m === '\t'   ? '&#9;'  // in hex: 09
                    :  m === '\n'   ? '&#10;' // in hex: 0A
                    :  m === '\x0B' ? '&#11;' // in hex: 0B  for IE. IE<9 \v equals v, so use \x0B instead
                    :  m === '\f'   ? '&#12;' // in hex: 0C
                    :  m === '\r'   ? '&#13;' // in hex: 0D
                    :  m === ' '    ? '&#32;' // in hex: 20
                    :  m === '='    ? '&#61;' // in hex: 3D
                    :  m === '<'    ? '&lt;'
                    :  m === '>'    ? '&gt;'
                    :  m === '"'    ? '&quot;'
                    :  m === "'"    ? '&#39;'
                    :  m === '`'    ? '&#96;'
                    : /*empty or null*/ '\uFFFD';
            });
        },

        yu: encodeURI,
        yuc: encodeURIComponent,

        // Notice that yubl MUST BE APPLIED LAST, and will not be used independently (expected output from encodeURI/encodeURIComponent and yavd/yavs/yavu)
        // This is used to disable JS execution capabilities by prefixing x- to ^javascript:, ^vbscript: or ^data: that possibly could trigger script execution in URI attribute context
        yubl: function (s) {
            return URI_BLACKLIST_PROTOCOLS[x.yup(s)] ? 'x-' + s : s;
        },

        // This is NOT a security-critical filter.
        // Reference: https://tools.ietf.org/html/rfc3986
        yufull: function (s) {
            return x.yu(s).replace(URL_IPV6, function(m, p) {
                return '//[' + p + ']';
            });
        },

        // chain yufull() with yubl()
        yublf: function (s) {
            return x.yubl(x.yufull(s));
        },

        // The design principle of the CSS filter MUST meet the following goal(s).
        // (1) The input cannot break out of the context (expr) and this is to fulfill the just sufficient encoding principle.
        // (2) The input cannot introduce CSS parsing error and this is to address the concern of UI redressing.
        //
        // term
        //   : unary_operator?
        //     [ NUMBER S* | PERCENTAGE S* | LENGTH S* | EMS S* | EXS S* | ANGLE S* |
        //     TIME S* | FREQ S* ]
        //   | STRING S* | IDENT S* | URI S* | hexcolor | function
        // 
        // Reference:
        // * http://www.w3.org/TR/CSS21/grammar.html 
        // * http://www.w3.org/TR/css-syntax-3/
        // 
        // NOTE: delimiter in CSS -  \  _  :  ;  (  )  "  '  /  ,  %  #  !  *  @  .  {  }
        //                        2d 5c 5f 3a 3b 28 29 22 27 2f 2c 25 23 21 2a 40 2e 7b 7d

        yceu: function(s) {
            s = htmlDecode(s);
            return CSS_VALID_VALUE.test(s) ? s : ";-x:'" + cssBlacklist(s.replace(CSS_SINGLE_QUOTED_CHARS, cssEncode)) + "';-v:";
        },

        // string1 = \"([^\n\r\f\\"]|\\{nl}|\\[^\n\r\f0-9a-f]|\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)*\"
        yced: function(s) {
            return cssBlacklist(htmlDecode(s).replace(CSS_DOUBLE_QUOTED_CHARS, cssEncode));
        },

        // string2 = \'([^\n\r\f\\']|\\{nl}|\\[^\n\r\f0-9a-f]|\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)*\'
        yces: function(s) {
            return cssBlacklist(htmlDecode(s).replace(CSS_SINGLE_QUOTED_CHARS, cssEncode));
        },

        // for url({{{yceuu url}}}
        // unquoted_url = ([!#$%&*-~]|\\{h}{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])* (CSS 2.1 definition)
        // unquoted_url = ([^"'()\\ \t\n\r\f\v\u0000\u0008\u000b\u000e-\u001f\u007f]|\\{h}{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])* (CSS 3.0 definition)
        // The state machine in CSS 3.0 is more well defined - http://www.w3.org/TR/css-syntax-3/#consume-a-url-token0
        // CSS_UNQUOTED_URL = /['\(\)]/g; // " \ treated by encodeURI()   
        yceuu: function(s) {
            return cssUrl(s).replace(CSS_UNQUOTED_URL, function (chr) {
                return  chr === '\''        ? '\\27 ' :
                        chr === '('         ? '%28' :
                        /* chr === ')' ? */   '%29';
            });
        },

        // for url("{{{yceud url}}}
        yceud: function(s) { 
            return cssUrl(s);
        },

        // for url('{{{yceus url}}}
        yceus: function(s) { 
            return cssUrl(s).replace(SQUOT, '\\27 ');
        }
    });
};

// exposing privFilters
// this is an undocumented feature, and please use it with extra care
var privFilters = exports._privFilters = exports._getPrivFilters();


/* chaining filters */

// uriInAttr and literally uriPathInAttr
// yubl is always used 
// Rationale: given pattern like this: <a href="{{{uriPathInDoubleQuotedAttr s}}}">
//            developer may expect s is always prefixed with ? or /, but an attacker can abuse it with 'javascript:alert(1)'
function uriInAttr (s, yav, yu) {
    return privFilters.yubl(yav((yu || privFilters.yufull)(s)));
}

/** 
* Yahoo Secure XSS Filters - just sufficient output filtering to prevent XSS!
* @module xss-filters 
*/

/**
* @function module:xss-filters#inHTMLData
*
* @param {string} s - An untrusted user input
* @returns {string} The string s with '<' encoded as '&amp;lt;'
*
* @description
* This filter is to be placed in HTML Data context to encode all '<' characters into '&amp;lt;'
* <ul>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <div>{{{inHTMLData htmlData}}}</div>
*
*/
exports.inHTMLData = privFilters.yd;

/**
* @function module:xss-filters#inHTMLComment
*
* @param {string} s - An untrusted user input
* @returns {string} All NULL characters in s are first replaced with \uFFFD. If s contains -->, --!>, or starts with -*>, insert a space right before > to stop state breaking at <!--{{{yc s}}}-->. If s ends with --!, --, or -, append a space to stop collaborative state breaking at {{{yc s}}}>, {{{yc s}}}!>, {{{yc s}}}-!>, {{{yc s}}}->. If s contains ]> or ends with ], append a space after ] is verified in IE to stop IE conditional comments.
*
* @description
* This filter is to be placed in HTML Comment context
* <ul>
* <li><a href="http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment-3">Shazzer - Closing comments for -.-></a>
* <li><a href="http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment">Shazzer - Closing comments for --.></a>
* <li><a href="http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment-0021">Shazzer - Closing comments for .></a>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-start-state">HTML5 Comment Start State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-start-dash-state">HTML5 Comment Start Dash State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-state">HTML5 Comment State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-end-dash-state">HTML5 Comment End Dash State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-end-state">HTML5 Comment End State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-end-bang-state">HTML5 Comment End Bang State</a></li>
* <li><a href="http://msdn.microsoft.com/en-us/library/ms537512%28v=vs.85%29.aspx">Conditional Comments in Internet Explorer</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <!-- {{{inHTMLComment html_comment}}} -->
*
*/
exports.inHTMLComment = privFilters.yc;

/**
* @function module:xss-filters#inSingleQuotedAttr
*
* @param {string} s - An untrusted user input
* @returns {string} The string s with any single-quote characters encoded into '&amp;&#39;'.
*
* @description
* <p class="warning">Warning: This is NOT designed for any onX (e.g., onclick) attributes!</p>
* <p class="warning">Warning: If you're working on URI/components, use the more specific uri___InSingleQuotedAttr filter </p>
* This filter is to be placed in HTML Attribute Value (single-quoted) state to encode all single-quote characters into '&amp;&#39;'
*
* <ul>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state">HTML5 Attribute Value (Single-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <input name='firstname' value='{{{inSingleQuotedAttr firstname}}}' />
*
*/
exports.inSingleQuotedAttr = privFilters.yavs;

/**
* @function module:xss-filters#inDoubleQuotedAttr
*
* @param {string} s - An untrusted user input
* @returns {string} The string s with any single-quote characters encoded into '&amp;&quot;'.
*
* @description
* <p class="warning">Warning: This is NOT designed for any onX (e.g., onclick) attributes!</p>
* <p class="warning">Warning: If you're working on URI/components, use the more specific uri___InDoubleQuotedAttr filter </p>
* This filter is to be placed in HTML Attribute Value (double-quoted) state to encode all single-quote characters into '&amp;&quot;'
*
* <ul>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state">HTML5 Attribute Value (Double-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <input name="firstname" value="{{{inDoubleQuotedAttr firstname}}}" />
*
*/
exports.inDoubleQuotedAttr = privFilters.yavd;

/**
* @function module:xss-filters#inUnQuotedAttr
*
* @param {string} s - An untrusted user input
* @returns {string} If s contains any state breaking chars (\t, \n, \v, \f, \r, space, null, ', ", `, <, >, and =), they are escaped and encoded into their equivalent HTML entity representations. If the string is empty, inject a \uFFFD character.
*
* @description
* <p class="warning">Warning: This is NOT designed for any onX (e.g., onclick) attributes!</p>
* <p class="warning">Warning: If you're working on URI/components, use the more specific uri___InUnQuotedAttr filter </p>
* <p>Regarding \uFFFD injection, given <a id={{{id}}} name="passwd">,<br/>
*        Rationale 1: our belief is that developers wouldn't expect when id equals an
*          empty string would result in ' name="passwd"' rendered as 
*          attribute value, even though this is how HTML5 is specified.<br/>
*        Rationale 2: an empty or all null string (for IE) can 
*          effectively alter its immediate subsequent state, we choose
*          \uFFFD to end the unquoted attr 
*          state, which therefore will not mess up later contexts.<br/>
*        Rationale 3: Since IE 6, it is verified that NULL chars are stripped.<br/>
*        Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state</p>
* <ul>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state">HTML5 Attribute Value (Unquoted) State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#before-attribute-value-state">HTML5 Before Attribute Value State</a></li>
* <li><a href="http://shazzer.co.uk/database/All/Characters-which-break-attributes-without-quotes">Shazzer - Characters-which-break-attributes-without-quotes</a></li>
* <li><a href="http://shazzer.co.uk/vector/Characters-allowed-attribute-quote">Shazzer - Characters-allowed-attribute-quote</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <input name="firstname" value={{{inUnQuotedAttr firstname}}} />
*
*/
exports.inUnQuotedAttr = privFilters.yavu;


/**
* @function module:xss-filters#uriInSingleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly an <strong>absolute</strong> URI
* @returns {string} The string s encoded first by window.encodeURI(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (single-quoted) state for an <strong>absolute</strong> URI.<br/>
* The correct order of encoders is thus: first window.encodeURI(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <p>Notice: This filter is IPv6 friendly by not encoding '[' and ']'.</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state">HTML5 Attribute Value (Single-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href='{{{uriInSingleQuotedAttr full_uri}}}'>link</a>
* 
*/
exports.uriInSingleQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavs);
};

/**
* @function module:xss-filters#uriInDoubleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly an <strong>absolute</strong> URI
* @returns {string} The string s encoded first by window.encodeURI(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (double-quoted) state for an <strong>absolute</strong> URI.<br/>
* The correct order of encoders is thus: first window.encodeURI(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <p>Notice: This filter is IPv6 friendly by not encoding '[' and ']'.</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state">HTML5 Attribute Value (Double-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="{{{uriInDoubleQuotedAttr full_uri}}}">link</a>
* 
*/
exports.uriInDoubleQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavd);
};


/**
* @function module:xss-filters#uriInUnQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly an <strong>absolute</strong> URI
* @returns {string} The string s encoded first by window.encodeURI(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (unquoted) state for an <strong>absolute</strong> URI.<br/>
* The correct order of encoders is thus: first the built-in encodeURI(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <p>Notice: This filter is IPv6 friendly by not encoding '[' and ']'.</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state">HTML5 Attribute Value (Unquoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href={{{uriInUnQuotedAttr full_uri}}}>link</a>
* 
*/
exports.uriInUnQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavu);
};

/**
* @function module:xss-filters#uriInHTMLData
*
* @param {string} s - An untrusted user input, supposedly an <strong>absolute</strong> URI
* @returns {string} The string s encoded by window.encodeURI() and then inHTMLData()
*
* @description
* This filter is to be placed in HTML Data state for an <strong>absolute</strong> URI.
*
* <p>Notice: The actual implementation skips inHTMLData(), since '<' is already encoded as '%3C' by encodeURI().</p>
* <p>Notice: This filter is IPv6 friendly by not encoding '[' and ']'.</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="/somewhere">{{{uriInHTMLData full_uri}}}</a>
* 
*/
exports.uriInHTMLData = privFilters.yufull;


/**
* @function module:xss-filters#uriInHTMLComment
*
* @param {string} s - An untrusted user input, supposedly an <strong>absolute</strong> URI
* @returns {string} The string s encoded by window.encodeURI(), and finally inHTMLComment()
*
* @description
* This filter is to be placed in HTML Comment state for an <strong>absolute</strong> URI.
*
* <p>Notice: This filter is IPv6 friendly by not encoding '[' and ']'.</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-state">HTML5 Comment State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <!-- {{{uriInHTMLComment full_uri}}} -->
* 
*/
exports.uriInHTMLComment = function (s) {
    return privFilters.yc(privFilters.yufull(s));
};




/**
* @function module:xss-filters#uriPathInSingleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Path/Query or relative URI
* @returns {string} The string s encoded first by window.encodeURI(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (single-quoted) state for a URI Path/Query or relative URI.<br/>
* The correct order of encoders is thus: first window.encodeURI(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state">HTML5 Attribute Value (Single-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href='http://example.com/{{{uriPathInSingleQuotedAttr uri_path}}}'>link</a>
* <a href='http://example.com/?{{{uriQueryInSingleQuotedAttr uri_query}}}'>link</a>
* 
*/
exports.uriPathInSingleQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavs, privFilters.yu);
};

/**
* @function module:xss-filters#uriPathInDoubleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Path/Query or relative URI
* @returns {string} The string s encoded first by window.encodeURI(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (double-quoted) state for a URI Path/Query or relative URI.<br/>
* The correct order of encoders is thus: first window.encodeURI(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state">HTML5 Attribute Value (Double-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="http://example.com/{{{uriPathInDoubleQuotedAttr uri_path}}}">link</a>
* <a href="http://example.com/?{{{uriQueryInDoubleQuotedAttr uri_query}}}">link</a>
* 
*/
exports.uriPathInDoubleQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavd, privFilters.yu);
};


/**
* @function module:xss-filters#uriPathInUnQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Path/Query or relative URI
* @returns {string} The string s encoded first by window.encodeURI(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (unquoted) state for a URI Path/Query or relative URI.<br/>
* The correct order of encoders is thus: first the built-in encodeURI(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state">HTML5 Attribute Value (Unquoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href=http://example.com/{{{uriPathInUnQuotedAttr uri_path}}}>link</a>
* <a href=http://example.com/?{{{uriQueryInUnQuotedAttr uri_query}}}>link</a>
* 
*/
exports.uriPathInUnQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavu, privFilters.yu);
};

/**
* @function module:xss-filters#uriPathInHTMLData
*
* @param {string} s - An untrusted user input, supposedly a URI Path/Query or relative URI
* @returns {string} The string s encoded by window.encodeURI() and then inHTMLData()
*
* @description
* This filter is to be placed in HTML Data state for a URI Path/Query or relative URI.
*
* <p>Notice: The actual implementation skips inHTMLData(), since '<' is already encoded as '%3C' by encodeURI().</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="http://example.com/">http://example.com/{{{uriPathInHTMLData uri_path}}}</a>
* <a href="http://example.com/">http://example.com/?{{{uriQueryInHTMLData uri_query}}}</a>
* 
*/
exports.uriPathInHTMLData = privFilters.yu;


/**
* @function module:xss-filters#uriPathInHTMLComment
*
* @param {string} s - An untrusted user input, supposedly a URI Path/Query or relative URI
* @returns {string} The string s encoded by window.encodeURI(), and finally inHTMLComment()
*
* @description
* This filter is to be placed in HTML Comment state for a URI Path/Query or relative URI.
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-state">HTML5 Comment State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <!-- http://example.com/{{{uriPathInHTMLComment uri_path}}} -->
* <!-- http://example.com/?{{{uriQueryInHTMLComment uri_query}}} -->
*/
exports.uriPathInHTMLComment = function (s) {
    return privFilters.yc(privFilters.yu(s));
};


/**
* @function module:xss-filters#uriQueryInSingleQuotedAttr
* @description This is an alias of {@link module:xss-filters#uriPathInSingleQuotedAttr}
* 
* @alias module:xss-filters#uriPathInSingleQuotedAttr
*/
exports.uriQueryInSingleQuotedAttr = exports.uriPathInSingleQuotedAttr;

/**
* @function module:xss-filters#uriQueryInDoubleQuotedAttr
* @description This is an alias of {@link module:xss-filters#uriPathInDoubleQuotedAttr}
* 
* @alias module:xss-filters#uriPathInDoubleQuotedAttr
*/
exports.uriQueryInDoubleQuotedAttr = exports.uriPathInDoubleQuotedAttr;

/**
* @function module:xss-filters#uriQueryInUnQuotedAttr
* @description This is an alias of {@link module:xss-filters#uriPathInUnQuotedAttr}
* 
* @alias module:xss-filters#uriPathInUnQuotedAttr
*/
exports.uriQueryInUnQuotedAttr = exports.uriPathInUnQuotedAttr;

/**
* @function module:xss-filters#uriQueryInHTMLData
* @description This is an alias of {@link module:xss-filters#uriPathInHTMLData}
* 
* @alias module:xss-filters#uriPathInHTMLData
*/
exports.uriQueryInHTMLData = exports.uriPathInHTMLData;

/**
* @function module:xss-filters#uriQueryInHTMLComment
* @description This is an alias of {@link module:xss-filters#uriPathInHTMLComment}
* 
* @alias module:xss-filters#uriPathInHTMLComment
*/
exports.uriQueryInHTMLComment = exports.uriPathInHTMLComment;



/**
* @function module:xss-filters#uriComponentInSingleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Component
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inSingleQuotedAttr()
*
* @description
* This filter is to be placed in HTML Attribute Value (single-quoted) state for a URI Component.<br/>
* The correct order of encoders is thus: first window.encodeURIComponent(), then inSingleQuotedAttr()
*
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state">HTML5 Attribute Value (Single-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href='http://example.com/?q={{{uriComponentInSingleQuotedAttr uri_component}}}'>link</a>
* 
*/
exports.uriComponentInSingleQuotedAttr = function (s) {
    return privFilters.yavs(privFilters.yuc(s));
};

/**
* @function module:xss-filters#uriComponentInDoubleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Component
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inDoubleQuotedAttr()
*
* @description
* This filter is to be placed in HTML Attribute Value (double-quoted) state for a URI Component.<br/>
* The correct order of encoders is thus: first window.encodeURIComponent(), then inDoubleQuotedAttr()
*
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state">HTML5 Attribute Value (Double-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="http://example.com/?q={{{uriComponentInDoubleQuotedAttr uri_component}}}">link</a>
* 
*/
exports.uriComponentInDoubleQuotedAttr = function (s) {
    return privFilters.yavd(privFilters.yuc(s));
};


/**
* @function module:xss-filters#uriComponentInUnQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Component
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inUnQuotedAttr()
*
* @description
* This filter is to be placed in HTML Attribute Value (unquoted) state for a URI Component.<br/>
* The correct order of encoders is thus: first the built-in encodeURIComponent(), then inUnQuotedAttr()
*
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state">HTML5 Attribute Value (Unquoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href=http://example.com/?q={{{uriComponentInUnQuotedAttr uri_component}}}>link</a>
* 
*/
exports.uriComponentInUnQuotedAttr = function (s) {
    return privFilters.yavu(privFilters.yuc(s));
};

/**
* @function module:xss-filters#uriComponentInHTMLData
*
* @param {string} s - An untrusted user input, supposedly a URI Component
* @returns {string} The string s encoded by window.encodeURIComponent() and then inHTMLData()
*
* @description
* This filter is to be placed in HTML Data state for a URI Component.
*
* <p>Notice: The actual implementation skips inHTMLData(), since '<' is already encoded as '%3C' by encodeURIComponent().</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="http://example.com/">http://example.com/?q={{{uriComponentInHTMLData uri_component}}}</a>
* <a href="http://example.com/">http://example.com/#{{{uriComponentInHTMLData uri_fragment}}}</a>
* 
*/
exports.uriComponentInHTMLData = privFilters.yuc;


/**
* @function module:xss-filters#uriComponentInHTMLComment
*
* @param {string} s - An untrusted user input, supposedly a URI Component
* @returns {string} The string s encoded by window.encodeURIComponent(), and finally inHTMLComment()
*
* @description
* This filter is to be placed in HTML Comment state for a URI Component.
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-state">HTML5 Comment State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <!-- http://example.com/?q={{{uriComponentInHTMLComment uri_component}}} -->
* <!-- http://example.com/#{{{uriComponentInHTMLComment uri_fragment}}} -->
*/
exports.uriComponentInHTMLComment = function (s) {
    return privFilters.yc(privFilters.yuc(s));
};


// uriFragmentInSingleQuotedAttr
// added yubl on top of uriComponentInAttr 
// Rationale: given pattern like this: <a href='{{{uriFragmentInSingleQuotedAttr s}}}'>
//            developer may expect s is always prefixed with #, but an attacker can abuse it with 'javascript:alert(1)'

/**
* @function module:xss-filters#uriFragmentInSingleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Fragment
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (single-quoted) state for a URI Fragment.<br/>
* The correct order of encoders is thus: first window.encodeURIComponent(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state">HTML5 Attribute Value (Single-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href='http://example.com/#{{{uriFragmentInSingleQuotedAttr uri_fragment}}}'>link</a>
* 
*/
exports.uriFragmentInSingleQuotedAttr = function (s) {
    return privFilters.yubl(privFilters.yavs(privFilters.yuc(s)));
};

// uriFragmentInDoubleQuotedAttr
// added yubl on top of uriComponentInAttr 
// Rationale: given pattern like this: <a href="{{{uriFragmentInDoubleQuotedAttr s}}}">
//            developer may expect s is always prefixed with #, but an attacker can abuse it with 'javascript:alert(1)'

/**
* @function module:xss-filters#uriFragmentInDoubleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Fragment
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (double-quoted) state for a URI Fragment.<br/>
* The correct order of encoders is thus: first window.encodeURIComponent(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state">HTML5 Attribute Value (Double-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="http://example.com/#{{{uriFragmentInDoubleQuotedAttr uri_fragment}}}">link</a>
* 
*/
exports.uriFragmentInDoubleQuotedAttr = function (s) {
    return privFilters.yubl(privFilters.yavd(privFilters.yuc(s)));
};

// uriFragmentInUnQuotedAttr
// added yubl on top of uriComponentInAttr 
// Rationale: given pattern like this: <a href={{{uriFragmentInUnQuotedAttr s}}}>
//            developer may expect s is always prefixed with #, but an attacker can abuse it with 'javascript:alert(1)'

/**
* @function module:xss-filters#uriFragmentInUnQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Fragment
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (unquoted) state for a URI Fragment.<br/>
* The correct order of encoders is thus: first the built-in encodeURIComponent(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state">HTML5 Attribute Value (Unquoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href=http://example.com/#{{{uriFragmentInUnQuotedAttr uri_fragment}}}>link</a>
* 
*/
exports.uriFragmentInUnQuotedAttr = function (s) {
    return privFilters.yubl(privFilters.yavu(privFilters.yuc(s)));
};


/**
* @function module:xss-filters#uriFragmentInHTMLData
* @description This is an alias of {@link module:xss-filters#uriComponentInHTMLData}
* 
* @alias module:xss-filters#uriComponentInHTMLData
*/
exports.uriFragmentInHTMLData = exports.uriComponentInHTMLData;

/**
* @function module:xss-filters#uriFragmentInHTMLComment
* @description This is an alias of {@link module:xss-filters#uriComponentInHTMLComment}
* 
* @alias module:xss-filters#uriComponentInHTMLComment
*/
exports.uriFragmentInHTMLComment = exports.uriComponentInHTMLComment;

},{}],5:[function(require,module,exports){
'use strict';


var m = require('mithril');


var state = {
	appTitle: 'Conduit',
	selectedArticles: {
		isLoading: false,
		list: null,
		author: '',
		favorited: '',
		limit: 10,
		offset: 0,
		total: 0,
		type: {
			name: 'GLOBAL',
			label: 'Global Feed'
		},
	},
	articleListTypes: {
		GLOBAL: {
			name: 'GLOBAL',
			label: 'Global Feed'
		},
		USER_FAVORITED: {
			name: 'USER_FAVORITED',
			label: 'Your Feed'
		},
		USER_OWNED: {
			name: 'USER_OWNED',
			label: 'My Articles'
		}
	},
	articlesByTag: {},
	tags: {},
	selectedArticle: {
		data: null,
		isLoading: false
	},
	selectedArticleComments: {
		data: null,
		isLoading: false
	},
	isArticleCommentCreationBusy: false,
	userAuthorizationToken: null,
	isUserLoginBusy: false,
	userLoginErrors: null,
	isUserRegistrationBusy: false,
	userRegistrationErrors: null,
	isUserSettingsUpdateBusy: false,
	userUpdateSettingsErrors: null,
	isCreateArticleBusy: false,
	createArticleErrors: null,
	isDeleteArticleBusy: false,
	user: null,
	selectedUserProfile: {
		data: null,
		isLoading: false
	}
};


var API_BASE_URI = '//conduit.productionready.io/api';


function init() {
	actions.getLoggedInUser(window.localStorage.getItem('jwt'));
}


function getErrorMessageFromAPIErrorObject(e) {
	var response = null;

	try {
		response = JSON.parse(e.message).errors;
	} catch (error) {
		response = {
			'An unhandled error occurred': []
		};
	}

	return response;
}


function redirectToPreviousPageOrHome() {
	if (window.history.length > 0) {
		window.history.back();
	} else {
		m.route.set('/');
	}
}


function getArticles(payload) {
	/*
	TODO

	Filter by author:

	?author=jake

	Favorited by user:

	?favorited=jake

	Limit number of articles (default is 20):

	?limit=20

	Offset/skip number of articles (default is 0):

	?offset=0
	*/

	// if (!payload) {
	// 	payload = {
	// 		limit: 3
	// 	};
	// }

	var queryString = m.buildQueryString(payload);

	return m.request({
		method: 'GET',
		url: API_BASE_URI + '/articles?' + queryString
	})
		.then(function (response) {
			// return []; // Test empty response
			return response;
		});
}


function isValueNullOrUndefined(value) {
	return (value === null) || typeof value === 'undefined';
}


function getValueFromSuppliedOrOther(supplied, other) {
	return !isValueNullOrUndefined(supplied) ? supplied : other;
}


function setupSelectedArticlesStateForRequest(payload, selectedArticles) {
	var selectedArticles = {
		isLoading: true,
		list: null,
		total: 0,
		type: getValueFromSuppliedOrOther(payload.type, state.articleListTypes.type),
		limit: getValueFromSuppliedOrOther(payload.limit, state.articleListTypes.limit),
		offset: getValueFromSuppliedOrOther(payload.offset, state.articleListTypes.offset),
		author: getValueFromSuppliedOrOther(payload.author, state.articleListTypes.author),
		favorited: getValueFromSuppliedOrOther(payload.favorited, state.articleListTypes.favorited)
	};

	return selectedArticles;
}



var actions = {

	setCurrentlyActiveArticles: function (payload) {
		var request = {};
		payload = payload || {};

		state.selectedArticles = setupSelectedArticlesStateForRequest(payload);

		request.limit = state.selectedArticles.limit;
		request.offset = state.selectedArticles.offset;
		request.author = state.selectedArticles.author;
		request.favorited = state.selectedArticles.favorited;

		console.info('domain.setCurrentlyActiveArticles()', payload, request);

		return getArticles(request)
			.then(function (response) {
				state.selectedArticles.list = response.articles;
				state.selectedArticles.total = response.articlesCount;
				state.selectedArticles.isLoading = false;
			});
	},


	getArticlesByTag: function (tag) {
		return getArticles({ tag: tag })
			.then(function (response) {
				state.articlesByTag.tag = tag;
				state.articlesByTag.list = response.articles;
			});
	},


	setSelectedArticle: function (slug) {
		state.selectedArticle.data = null;
		state.selectedArticle.isLoading = true;

		return m.request({
			method: 'GET',
			url: API_BASE_URI + '/articles/' + slug
		})
			.then(function (response) {
				state.selectedArticle.data = response.article;
			})
			.then(function () {
				state.selectedArticle.isLoading = false;
			});
	},


	setSelectedArticleComments: function (slug) {
		state.selectedArticleComments.data = null;
		state.selectedArticleComments.isLoading = true;

		return m.request({
			method: 'GET',
			url: API_BASE_URI + '/articles/' + slug + '/comments'
		})
			.then(function (response) {
				state.selectedArticleComments.data = response.comments;
			})
			.then(function () {
				state.selectedArticleComments.isLoading = true;
			});
	},


	createArticle: function (payload) {
		state.isCreateArticleBusy = true;
		state.createArticleErrors = null;

		// Format tagList before sending to API
		var tagList = payload.tagList
			.split(',')
			.join('-|-')
			.split(' ')
			.join('-|-')
			.split('-|-')
			.filter(function (tag) {
				return tag !== '';
			});

		m.request({
			method: 'POST',
			url: API_BASE_URI + '/articles',
			headers: {
				'Authorization': 'Token ' + state.user.token
			},
			data: {
				article: {
					title: payload.title,
					description: payload.description,
					body: payload.body,
					tagList: tagList
				}
			}
		})
			.then(function (response) {
				state.createArticleErrors = null;
				state.newArticle = response.article;
				m.route.set('/article/' + state.newArticle.slug);
			})
			.catch(function (e) {
				state.createArticleErrors = getErrorMessageFromAPIErrorObject(e);
			})
			.then(function () {
				state.isCreateArticleBusy = false;
			});
	},


	deleteArticle: function (slug) {
		state.isDeleteArticleBusy = true;
		m.redraw(); // This shouldn't be necessary

		m.request({
			method: 'DELETE',
			url: API_BASE_URI + '/articles/' + slug,
			headers: {
				'Authorization': 'Token ' + state.user.token
			}
		})
			.then(function (response) {
				console.info(response);
				state.isDeleteArticleBusy = false;
				// if (response) {
				redirectToPreviousPageOrHome();
				// }
			})
			.catch(function (e) {
				state.isDeleteArticleBusy = false;
				console.warn(getErrorMessageFromAPIErrorObject(e));
			});
	},


	createArticleComment: function (payload) {
		state.isArticleCommentCreationBusy = true;

		m.request({
			method: 'POST',
			url: API_BASE_URI + '/articles/' + payload.articleSlug + '/comments',
			headers: {
				'Authorization': 'Token ' + state.user.token
			},
			data: {
				comment: {
					body: payload.body
				}
			}
		})
			.then(function () {
				state.isArticleCommentCreationBusy = false;
			})
			.then(function () {
				actions.setSelectedArticleComments(payload.articleSlug);
			});
	},


	goToArticleEditScreen: function (articleSlug) {
		m.route.set('/editor/' + articleSlug);
	},


	registerNewUser: function (payload) {
		state.isUserRegistrationBusy = true;
		state.userRegistrationErrors = null;

		m.request({
			method: 'POST',
			url: API_BASE_URI + '/users',
			data: {
				user: {
					email: payload.email,
					password: payload.password,
					username: payload.username
				}
			}
		})
			.then(function (response) {
				state.userRegistrationErrors = null;
				state.user = response.user;
				window.localStorage.setItem('jwt', state.user.token);
			})
			.catch(function (e) {
				state.userRegistrationErrors = getErrorMessageFromAPIErrorObject(e);
			})
			.then(function () {
				state.isUserRegistrationBusy = false;
			});
	},


	attemptUserLogin: function (email, password) {
		window.localStorage.setItem('jwt', null);
		state.user = null;
		state.isUserLoginBusy = true;
		state.userLoginErrors = null;

		m.request({
			method: 'POST',
			url: API_BASE_URI + '/users/login',
			data: {
				user: {
					email: email,
					password: password
				}
			}
		})
			.then(function (response) {
				state.userLoginErrors = null;
				state.user = response.user;
				window.localStorage.setItem('jwt', state.user.token);
			})
			.catch(function (e) {
				state.userLoginErrors = getErrorMessageFromAPIErrorObject(e);
			})
			.then(function () {
				state.isUserLoginBusy = false;
			});
	},


	redirectAfterUserLoginSuccess: function () {
		redirectToPreviousPageOrHome();
	},


	redirectAfterUserRegistrationSuccess: function () {
		redirectToPreviousPageOrHome();
	},


	getLoggedInUser: function (token) {
		var userToken = state.user ? state.user.token : '';

		if (token) {
			userToken = token;
		}

		m.request({
			method: 'GET',
			url: API_BASE_URI + '/user',
			headers: {
				'Authorization': 'Token ' + userToken
			}
		})
			.then(function (response) {
				state.user = response.user;
			})
			.catch(function (e) {
				console.warn('domain.getLoggedInUser()', e, getErrorMessageFromAPIErrorObject(e));
			});
	},


	updateUserSettings: function (payload) {
		state.isUserSettingsUpdateBusy = true;
		state.userUpdateSettingsErrors = null;

		if (!payload.password) {
			delete payload.password;
		}

		m.request({
			method: 'PUT',
			url: API_BASE_URI + '/user',
			headers: {
				'Authorization': 'Token ' + state.user.token
			},
			data: {
				user: payload
			}
		})
			.then(function (response) {
				state.user = response.user;
			})
			.catch(function (e) {
				state.userUpdateSettingsErrors = getErrorMessageFromAPIErrorObject(e);
			})
			.then(function () {
				state.isUserSettingsUpdateBusy = false;
			});
	},


	getUserProfile: function (username) {
		state.selectedUserProfile.isLoading = true;
		state.selectedUserProfile.data = null;

		m.request({
			method: 'GET',
			url: API_BASE_URI + '/profiles/' + username
		})
			.then(function (response) {
				state.selectedUserProfile.data = response.profile;
			})
			.then(function () {
				state.selectedUserProfile.isLoading = false;
			});
	},


	followUser: function (username) {
		return alert('followUser() -> ' +  username);
		m.request({
			method: 'POST',
			url: API_BASE_URI + '/profiles/' + username + '/follow',
			headers: {
				'Authorization': 'Token ' + state.user.token
			},
		})
			.then(function () {
				// TODO
			});
	},


	unfollowUser: function (username) {
		return alert('unfollowUser() -> ' +  username);
		m.request({
			method: 'DELETE',
			url: API_BASE_URI + '/profiles/' + username + '/follow',
			headers: {
				'Authorization': 'Token ' + state.user.token
			},
		})
			.then(function () {
				// TODO
			});
	},


	logUserOut: function () {
		state.user = null;
		window.localStorage.setItem('jwt', null);
		m.route.set('/');
	},


	getTags: function () {
		state.tags.isLoading = true;

		m.request({
			method: 'GET',
			url: API_BASE_URI + '/tags',
		})
			.then(function (response) {
				state.tags.list = response.tags;
			})
			.then(function () {
				state.tags.isLoading = false;
			});
	}

};


module.exports = {
	init: init,
	store: state,
	actions: actions
};

},{"mithril":3}],6:[function(require,module,exports){
'use strict';


require('./domain').init();
require('./ui/router').init();

},{"./domain":5,"./ui/router":40}],7:[function(require,module,exports){
'use strict';


var m = require('mithril');


function view() {
	return m('footer',
		m('.container', [
			m('a.logo-font', { href: '/' }, 'conduit'),
			m('span.attribution',
				m.trust('An interactive learning project from <a href="https://thinkster.io">Thinkster</a>. Code &amp; design licensed under MIT.')
			)
		])
	);
};


module.exports = {
	view: view
};

},{"mithril":3}],8:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var MainNav = require('./MainNav');
var Link = require('./Link');


function view() {
	return m('header',
		m('nav.navbar.navbar-light',
			m('.container',
				m(Link, { className: 'navbar-brand pull-xs-none pull-md-left', to: '/' }, 'conduit'),
				m(MainNav, { className: 'nav navbar-nav pull-xs-none pull-md-right text-xs-center', currentUser: domain.store.user })
			)
		)
	);
};


module.exports = {
	view: view
};

},{"./../../domain":5,"./Link":23,"./MainNav":25,"mithril":3}],9:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var ArticleFavoriteButton = require('./ArticleFavoriteButton');
var ArticleUpdateButton = require('./ArticleUpdateButton');
var ArticleDeleteButton = require('./ArticleDeleteButton');
var UserFollowUnfollowButton = require('./UserFollowUnfollowButton');


function updateState(vnode) {
	vnode.state = {
		article: vnode.attrs.article.data,
		isDeleteArticleBusy: domain.store.isDeleteArticleBusy
	};
}


function oninit(vnode) {
	updateState(vnode);
}


function onupdate(vnode) {
	updateState(vnode);
}


function view(vnode) {
	var article = vnode.attrs.article.data ? vnode.attrs.article.data : {
		author: {
			username: null
		}
	};

	var loggedInUsername = domain.store.user ? domain.store.user.username : '';

	return [
		m(ArticleUpdateButton, { action: domain.actions.goToArticleEditScreen.bind(null, article.slug) }),
		m('span', ' '),
		m(ArticleDeleteButton, { action: domain.actions.deleteArticle.bind(null, article.slug) }),
		m('span', ' '),
		m(UserFollowUnfollowButton, { isFollowing: article.author.following, username: article.author.username, loggedInUsername: loggedInUsername }),
		m('span', ' '),
		m(ArticleFavoriteButton, { article: article })
	];
};


module.exports = {
	oninit: oninit,
	onupdate: onupdate,
	view: view
};

},{"./../../domain":5,"./ArticleDeleteButton":12,"./ArticleFavoriteButton":13,"./ArticleUpdateButton":18,"./UserFollowUnfollowButton":33,"mithril":3}],10:[function(require,module,exports){
'use strict';


var m = require('mithril');


var ArticleMetaAndActions = require('./ArticleMetaAndActions');


function view(vnode) {
	var title = vnode.attrs.article.data ? vnode.attrs.article.data.title : '...';

	return m('div', [
		m('h1', title),
		m(ArticleMetaAndActions, { article: vnode.attrs.article })
	]);
};


module.exports = {
	view: view
};

},{"./ArticleMetaAndActions":16,"mithril":3}],11:[function(require,module,exports){
'use strict';


var m = require('mithril');


var utils = require('./../utils');
var TagList = require('./TagList');


function view(vnode) {
	var article = vnode.attrs.article.data;
	var content = m('div', '...');

	if (article) {
		content = [
			m('div.col-xs-12', [
				m('div', m.trust(utils.convertMarkdownToHTML(article.body))),
				m(TagList, { list: article.tagList, style: TagList.styles.OUTLINE })
			])
		];
	}

	return m('div.article-content', content);
};


module.exports = {
	view: view
};

},{"./../utils":49,"./TagList":31,"mithril":3}],12:[function(require,module,exports){
'use strict';


var m = require('mithril');


function view(vnode) {
	return [
		m('span',
			m('button.btn.btn-outline-danger.btn-sm', { onclick: vnode.attrs.action }, [
				m('i.ion-trash-a'), m('span', ' Delete Article')
			])
		)
	];
};


module.exports = {
	view: view
};

},{"mithril":3}],13:[function(require,module,exports){
'use strict';


var m = require('mithril');


function onFavoriteButtonClick(e) {
	e.preventDefault();
}


function view(vnode) {
	var count = typeof vnode.attrs.article.favoritesCount === 'number' ? vnode.attrs.article.favoritesCount : '...';

	return [
		m('span',
			m('button.btn.btn-sm.btn-outline-primary', { onclick: onFavoriteButtonClick.bind(this) }, [
				m('i.ion-heart'), m('span', ' Favorite Article (' + count + ')')
			])
		)
	];
};


module.exports = {
	view: view
};

},{"mithril":3}],14:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var ArticlePreview = require('./ArticlePreview');
var Pagination = require('./Pagination');


function getTotalPages(limit, total) {
	return Math.ceil(total / (limit || total));
}


function getCurrentPage(limit, offset) {
	return Math.ceil((offset + 1) / limit);
}


function getOffsetFromPageNumber(pageNumber, limit) {
	return Math.ceil((pageNumber - 1) * limit);
}


function getCurrentLimitFromArticles(articles) {
	return articles.limit || 0;
}


function updateSelectedArticles() {
	// domain.actions.setCurrentlyActiveArticles({
		// limit: limit,
		// offset: offset,
		// author: author
	// });
}


function selectPage(pageNumber) {
	var limit = getCurrentLimitFromArticles(domain.store.selectedArticles);
	updateSelectedArticles(limit, getOffsetFromPageNumber(pageNumber, limit), this.author);
}


function updateStateFromAttributes(state, attrs) {
	state.limit = attrs.limit || 10;
	state.offset = attrs.offset || 0;
	state.author = attrs.author || '';

	return state;
}


function oninit(vnode) {
	updateStateFromAttributes(this, vnode.attrs);
	updateSelectedArticles(this.limit, this.offset, this.author);
}


function onbeforeupdate(vnode, vnodePrevious) {
	if (JSON.stringify(vnode.attrs) !== JSON.stringify(vnodePrevious.attrs)) {
		updateStateFromAttributes(this, vnode.attrs);
		updateSelectedArticles(this.limit, this.offset, this.author);
	}
}


function view() {
	var totalPages = 1,
		currentPage = 1;

	if (domain.store.selectedArticles.isLoading) {
		return m('div.article-preview', 'Loading...');
	}

	if (domain.store.selectedArticles.list.length === 0) {
		return m('div.article-preview', 'No articles are here... yet.');
	}

	totalPages = getTotalPages(domain.store.selectedArticles.limit, domain.store.selectedArticles.total);
	currentPage = getCurrentPage(domain.store.selectedArticles.limit, domain.store.selectedArticles.offset);

	return m('div', [
		domain.store.selectedArticles.list.map(function (article) {
			return m(ArticlePreview, { key: article.slug, article: article });
		}),
		m(Pagination, { totalPages: totalPages, currentPage: currentPage, fn_onItemClick: selectPage.bind(this) })
	]);
};


module.exports = {
	oninit: oninit,
	onbeforeupdate: onbeforeupdate,
	view: view
};

},{"./../../domain":5,"./ArticlePreview":17,"./Pagination":28,"mithril":3}],15:[function(require,module,exports){
'use strict';


var m = require('mithril');


var utils = require('./../utils');
var Link = require('./Link');


function view(vnode) {
	var article = vnode.attrs.article ? vnode.attrs.article.data : null;
	var content = m('div', '...');

	if (article) {
		content = [
			m(Link, { to: '/@' + article.author.username },
				m('img', { src: article.author.image })
			),
			m('div.info',
				m(Link, { className: 'author', to: '/@' + article.author.username }, article.author.username),
				m('span.date', utils.formatDate(article.createdAt))
			)
		];
	}

	return m('div.article-meta', { style: vnode.attrs.style }, [
		content
	]);
};


module.exports = {
	view: view
};

},{"./../utils":49,"./Link":23,"mithril":3}],16:[function(require,module,exports){
'use strict';


var m = require('mithril');


var ArticleMeta = require('./ArticleMeta');
var ArticleActions = require('./ArticleActions');


function view(vnode) {
	return [
		m(ArticleMeta, { article: vnode.attrs.article, style: 'display:inline-block; ' }),
		m(ArticleActions, { article: vnode.attrs.article })
	];
};


module.exports = {
	view: view
};

},{"./ArticleActions":9,"./ArticleMeta":15,"mithril":3}],17:[function(require,module,exports){
'use strict';


var m = require('mithril');


var Link = require('./Link');


var FAVORITED_CLASS = 'btn btn-sm btn-primary';
var NOT_FAVORITED_CLASS = 'btn btn-sm btn-outline-primary';


function onFavoriteButtonClick(e) {
	e.preventDefault();
	// TODO add implementation
}


function view(vnode) {
	var article = vnode.attrs.article,
		favoriteButtonClass = article.favorited ?
			FAVORITED_CLASS :
			NOT_FAVORITED_CLASS;

	return m('.article-preview',
		m('.container', [
			m('.article-meta', [
				m(Link, { to: '/@' + article.author.username },
					m('img', { src: article.author.image })
				),

				m('.info', [
					m(Link, { to: '/@' + article.author.username, className: 'author' }, article.author.username),
					m('.date', new Date(article.createdAt).toDateString())
				]),

				m('.pull-xs-right',
					m('button', { className: favoriteButtonClass, onclick: onFavoriteButtonClick }, [
						m('i.ion-heart'),
						m('span', ' ' + article.favoritesCount)
					])
				)

			]),

			m(Link, { to: '/article/' + article.slug, className: 'preview-link' }, [
				m('h1', article.title),
				m('p', article.description),
				m('span', 'Read more...'),
				m('ul.tag-list', article.tagList.map(function (tag) {
					return m('li.tag-default tag-pill tag-outline', { key: tag }, tag);
				}))
			])

		])
	);
};


module.exports = {
	view: view
};

},{"./Link":23,"mithril":3}],18:[function(require,module,exports){
'use strict';


var m = require('mithril');


function view(vnode) {
	return [
		m('span',
			m('button.btn.btn-outline-secondary.btn-sm', { onclick: vnode.attrs.action }, [
				m('i.ion-edit'), m('span', ' Edit Article')
			])
		)
	];
};


module.exports = {
	view: view
};

},{"mithril":3}],19:[function(require,module,exports){
'use strict';


var m = require('mithril');


function view(vnode) {
	var content = [
		m('h1.logo-font', 'conduit'),
		m('p', 'A place to share your knowledge.')
	];

	if (vnode.children.length > 0) {
		content = vnode.children;
	}

	return m('.banner',
		m('.container', content)
	);
};


module.exports = {
	view: view
};

},{"mithril":3}],20:[function(require,module,exports){
'use strict';


var m = require('mithril');


var utils = require('./../utils');
var Link = require('./Link');


function view(vnode) {
	var comment = vnode.attrs.comment;

	return m('div.card', [
		m('div.card-block',
			m('div.card-text', m.trust(utils.formatArticleCommentBodyText(comment.body)))
		),
		m('div.card-footer', [
			m(Link, { className: 'comment-author', to: utils.getLinkToUserProfile(comment.author.username) },
				m('img.comment-author-img', { src: comment.author.image })
			),
			m('span', m.trust('&nbsp; ')),
			m(Link, { className: 'comment-author', to: utils.getLinkToUserProfile(comment.author.username) },
				comment.author.username
			),
			m('span.date-posted', utils.formatDate(comment.createdAt, utils.dateFormats.DEFAULT_WITH_TIME))
		])
	]);
};


module.exports = {
	view: view
};

},{"./../utils":49,"./Link":23,"mithril":3}],21:[function(require,module,exports){
'use strict';


var m = require('mithril');


var Link = require('./Link');
var NewCommentForm = require('./NewCommentForm');
var Comment = require('./Comment');


function view(vnode) {
	var comments = vnode.attrs.comments.data || [];
	var header = m('p', [
		m(Link, { to: '/login' }, 'Sign in'),
		m('span', ' or '),
		m(Link, { to: '/register' }, 'Sign up'),
		m('span', ' to add comments on this article.')
	]);
	var body = null;

	if (vnode.attrs.currentUser) {
		header = m(NewCommentForm);
	}

	if (vnode.attrs.comments.isLoading) {
		body = m('div', 'Loading...');
	}

	if (comments) {
		body = comments.map(function (comment) {
			return m(Comment, { comment: comment, key: comment.id });
		});
	}

	return m('div.comments', [
		header,
		body
	]);
};


module.exports = {
	view: view
};

},{"./Comment":20,"./Link":23,"./NewCommentForm":27,"mithril":3}],22:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');


function setCurrentlyActiveArticles(vnode, type) {
	var payload = {
		type: type
	};

	switch (type.name) {
		case domain.store.articleListTypes.USER_FAVORITED.name:
			payload.author = '';
			payload.favorited = vnode.state.username;
			break;

		case domain.store.articleListTypes.USER_OWNED.name:
			payload.author = vnode.state.username;
			payload.favorited = '';
			break;
	}

	domain.actions.setCurrentlyActiveArticles(payload);
}


function onLinkClick(vnode, type, e) {
	e.preventDefault();

	setCurrentlyActiveArticles(vnode, type);
}


function buildLink(vnode, linkType, currentType) {
	var linkClassName = linkType.name === currentType.name ? '.active' : '';

	return m('li.nav-item',
		m('a.nav-link' + linkClassName, {
			href: '', onclick: onLinkClick.bind(null, vnode, linkType)
		}, linkType.label)
	);
}


function oninit(vnode) {
	console.log('vnode.attrs.currentType', vnode.attrs.currentType);
	setCurrentlyActiveArticles(vnode, vnode.attrs.linkTypes[0]);
}


function view(vnode) {
	var currentType = vnode.attrs.currentType ? vnode.attrs.currentType : '';
	var linkTypes = vnode.attrs.linkTypes ? vnode.attrs.linkTypes : [];
	vnode.state.username = vnode.attrs.username ? vnode.attrs.username : '';

	return m('div.feed-toggle',
		m('ul.nav.nav-pills.outline-active', linkTypes.map(function (linkType) {
			return buildLink(vnode, linkType, currentType);
		}))
	);
};


module.exports = {
	oninit: oninit,
	view: view
};

},{"./../../domain":5,"mithril":3}],23:[function(require,module,exports){
'use strict';


var m = require('mithril');


function view(vnode) {
	var onclick = vnode.attrs.onclick ? vnode.attrs.onclick : null;

	return m('a', { className: vnode.attrs.className, href: vnode.attrs.to, oncreate: m.route.link, onupdate: m.route.link, onclick: onclick }, vnode.children);
};


module.exports = {
	view: view
};

},{"mithril":3}],24:[function(require,module,exports){
'use strict';


var m = require('mithril');


function view(vnode) {
	var errors = vnode.attrs.errors;

	if (errors) {
		return m('ul.error-messages',
			Object.keys(errors).map(function (errorKey) {
				return m('li', {key: errorKey}, errorKey + ' ' + errors[errorKey]);
			})
		);
	}


	return null;
};


module.exports = {
	view: view
};

},{"mithril":3}],25:[function(require,module,exports){
'use strict';


var m = require('mithril');


var utils = require('./../utils');
var Link = require('./Link');


function view(vnode) {
	var currentUser = vnode.attrs.currentUser ? vnode.attrs.currentUser : {
		username: ''
	};

	var allLinks = {
		home: { route: '/', label: 'Home' },
		login: { route: '/login', label: 'Sign in' },
		register: { route: '/register', label: 'Sign up' },
		editor: { route: '/editor', label: '<i class="ion-compose"></i> New Article' },
		settings: { route: '/settings', label: '<i class="ion-gear-a"></i> Settings' },
		user: { route: '/@' + currentUser.username, label: '<img class="user-pic" src="' + utils.getUserImageOrDefault(currentUser) + '" /> ' + currentUser.username }
	};

	var linksForGuest = [
		allLinks.home,
		allLinks.login,
		allLinks.register
	];

	var linksForMember = [
		allLinks.home,
		allLinks.editor,
		allLinks.settings,
		allLinks.user
	];


	var linksToDisplay = linksForGuest;
	if (currentUser.username) {
		linksToDisplay = linksForMember;
	}

	return m('ul', { className: vnode.attrs.className },
		linksToDisplay.map(function (link) {
			var className = 'nav-link';

			if (m.route.get() === link.route) {
				className += ' active';
			}

			return m('li.nav-item', m(Link, { className: className, to: link.route }, m.trust(link.label)));
		})
	);

};


module.exports = {
	view: view
};

},{"./../utils":49,"./Link":23,"mithril":3}],26:[function(require,module,exports){
'use strict';


var m = require('mithril');


var state = {
	fn_submit: null,
	formData: {}
};


function setInputValue(name, value) {
	state.formData[name] = value;
}


function onSubmitButtonClick(e) {
	e.preventDefault();

	state.fn_submit(state.formData);
}


function oninit(vnode) {
	setupFormData(vnode.attrs.article);

	state.fn_submit = vnode.attrs.fn_submit;
}


function setupFormData(data) {
	var articleData = data ? data : {
		title: '',
		description: '',
		body: '',
		tagList: ''
	};

	state.formData = {
		title: articleData.title,
		description: articleData.description,
		body: articleData.body,
		tagList: articleData.tagList
	};
}


function onbeforeupdate(vnode, vnodeOld) {
	if (vnodeOld.attrs.article !== vnode.attrs.article) {
		setupFormData(vnode.attrs.article);
	}

	return true;
}


function view(vnode) {

	return m('form',
		m('fieldset',
			[
				m('fieldset.form-group',
					m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'title')), value: state.formData.title, type: 'text', autocomplete: 'off', placeholder: 'Article Title', disabled: vnode.attrs.isSubmitBusy })
				),
				m('fieldset.form-group',
					m('input.form-control', { oninput: m.withAttr('value', setInputValue.bind(null, 'description')), value: state.formData.description, type: 'text', autocomplete: 'off', placeholder: 'What\'s this article about?', disabled: vnode.attrs.isSubmitBusy })
				),
				m('fieldset.form-group',
					m('textarea.form-control', { oninput: m.withAttr('value', setInputValue.bind(null, 'body')), value: state.formData.body, autocomplete: 'off', rows: '8', placeholder: 'Write your article (in markdown)', disabled: vnode.attrs.isSubmitBusy })
				),
				m('fieldset.form-group',
					m('input.form-control', { oninput: m.withAttr('value', setInputValue.bind(null, 'tagList')), value: state.formData.tagList, type: 'text', autocomplete: 'off', placeholder: 'Enter tags', disabled: vnode.attrs.isSubmitBusy })
				),
				m('button.btn.btn-lg.btn-primary.pull-xs-right', { onclick: onSubmitButtonClick, disabled: vnode.attrs.isSubmitBusy }, 'Publish Article')
			]
		)
	);
};


module.exports = {
	oninit: oninit,
	onbeforeupdate: onbeforeupdate,
	view: view
};

},{"mithril":3}],27:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');


var state = {
	formData: {
		articleSlug: '',
		body: ''
	}
};


function setInputValue(name, value) {
	state.formData[name] = value;
}


function isFormSubmissionBusy() {
	return domain.store.isArticleCommentCreationBusy;
}

function isFormSubmitDisabled() {
	return state.formData.body === '' || domain.store.selectedArticle.data === null || isFormSubmissionBusy() === true;
}


function onFormSubmit(e) {
	e.preventDefault();

	setInputValue('articleSlug', domain.store.selectedArticle.data.slug);
	domain.actions.createArticleComment(state.formData);
	setInputValue('body', '');
}


function view() {
	return m('div', [
		m('form.card comment-form', { disabled: isFormSubmissionBusy(), onsubmit: onFormSubmit },
			m('div.card-block',
				m('textarea.form-control', { oninput: m.withAttr('value', setInputValue.bind(null, 'body')), value: state.formData.body, autocomplete: 'off', disabled: isFormSubmissionBusy(), rows: '3', placeholder: 'Write a comment...' })
			),
			m('div.card-footer', [
				m('img.comment-author-img', { src: utils.getUserImageOrDefault(domain.store.user) }),
				m('button.btn.btn-sm.btn-primary', { type: 'submit', disabled: isFormSubmitDisabled() }, 'Post Comment')
			])
		)
	]);
};


module.exports = {
	view: view
};

},{"./../../domain":5,"./../utils":49,"mithril":3}],28:[function(require,module,exports){
'use strict';


var m = require('mithril');


var Link = require('./Link');


function view(vnode) {
	var totalPages = vnode.attrs.totalPages || 1;
	var currentPage = vnode.attrs.currentPage || 1;
	var pageList = Array.apply(null, Array(totalPages));

	// console.log(vnode.attrs);

	return m('nav',
		m('ul.pagination',
			pageList.map(function (tag, i) {
				var activeClassName = '';

				if (currentPage === (i + 1)) {
					activeClassName = '.active';
				}

				return m('li.page-item' + activeClassName, { key: i },
					m(Link, {
						className: 'page-link',
						to: '',
						onclick: function (e) {
							e.preventDefault();
							vnode.attrs.fn_onItemClick(i + 1);
						}
					}, String(i + 1))
				);
			})
		)
	);
};


module.exports = {
	view: view
};

},{"./Link":23,"mithril":3}],29:[function(require,module,exports){
'use strict';


var m = require('mithril');


var TagList = require('./TagList');


function view(vnode) {
	var tagsContent = m('div', 'Loading Tags...');

	if (vnode.attrs.isLoading === false) {
		tagsContent = m(TagList, { list: vnode.attrs.list });
	}

	return m('div', [
		m('p', 'Popular Tags'),
		tagsContent
	]);
};


module.exports = {
	view: view
};

},{"./TagList":31,"mithril":3}],30:[function(require,module,exports){
'use strict';


var m = require('mithril');


function view(vnode) {
	return m('section', vnode.children);
};


module.exports = {
	view: view
};

},{"mithril":3}],31:[function(require,module,exports){
'use strict';


var m = require('mithril');


var Link = require('./Link');
var styles = {
	OUTLINE: 'OUTLINE'
};


function view(vnode) {
	var list = vnode.attrs.list ? vnode.attrs.list : [];
	var linkClassName = 'tag-default tag-pill';

	if (vnode.attrs.style === styles.OUTLINE) {
		linkClassName += ' tag-outline';
	}

	return m('ul.tag-list',
		list.map(function (tag) {
			return m('li',
				m(Link, {
					className: linkClassName, key: tag, to: '', onclick: function (e) {
						e.preventDefault();
					}
				}, tag)
			);
		})
	);
};


module.exports = {
	styles: styles,
	view: view
};

},{"./Link":23,"mithril":3}],32:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');


function view(vnode) {
	var action = vnode.attrs.action || domain.actions.followUser.bind(null, vnode.attrs.username);
	var label = vnode.attrs.username ? ' Follow ' + vnode.attrs.username : '';

	return [
		m('span',
			m('button.btn.btn-sm.btn-secondary', { onclick: function () { action(); } }, [
				m('i.ion-plus-round'), m('span', label)
			])
		)
	];
};


module.exports = {
	view: view
};

},{"./../../domain":5,"mithril":3}],33:[function(require,module,exports){
'use strict';


var m = require('mithril');


var UserFollowButton = require('./UserFollowButton');
var UserUnfollowButton = require('./UserUnfollowButton');


function getActionButton(isFollowing, username, loggedInUsername) {

	if (!loggedInUsername) {
		return m(UserFollowButton, { username: username, action: m.route.set.bind(null, '/register') });
	}

	if (username === loggedInUsername) {
		return null;
	}

	if (isFollowing === true) {
		return m(UserUnfollowButton, { username: username });
	}

	return m(UserFollowButton, { username: username });
}


function view(vnode) {
	return getActionButton(vnode.attrs.isFollowing, vnode.attrs.username, vnode.attrs.loggedInUsername);
};


module.exports = {
	view: view
};

},{"./UserFollowButton":32,"./UserUnfollowButton":38,"mithril":3}],34:[function(require,module,exports){
'use strict';


var m = require('mithril');


var UserFollowUnfollowButton = require('./UserFollowUnfollowButton');


function view(vnode) {
	var selectedUser = vnode.attrs.selectedUser ? vnode.attrs.selectedUser : {
		bio: '',
		image: '',
		username: ''
	};

	var loggedInUser = vnode.attrs.loggedInUser ? vnode.attrs.loggedInUser : {
		username: ''
	};

	return m('.user-info',
		m('.container',
			[
				m('.row',
					[
						m('.col-xs-12 col-md-10 offset-md-1', [
							m('img.user-img', { src: selectedUser.image }),
							m('h4', selectedUser.username || '...'),
							m('p', selectedUser.bio),
							m(UserFollowUnfollowButton, { isFollowing: selectedUser.following, username: selectedUser.username, loggedInUsername: loggedInUser.username })
						]),
					]
				)
			]
		)
	);
};


module.exports = {
	view: view
};

},{"./UserFollowUnfollowButton":33,"mithril":3}],35:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');


var state = {
	email: '',
	password: '',
	setEmail: function (v) { state.email = v; },
	setPassword: function (v) { state.password = v; }
};


function onLoginButtonClick(e) {
	e.preventDefault();

	domain.actions.attemptUserLogin(state.email, state.password);
}


function view(vnode) {
	return m('form',
		m('fieldset',
			[
				m('fieldset.form-group',
					m('input.form-control.form-control-lg', { oninput: m.withAttr('value', state.setEmail), value: state.email, type: 'email', autocomplete: 'off', placeholder: 'Email', disabled: vnode.attrs.isUserLoginBusy })
				),
				m('fieldset.form-group',
					m('input.form-control.form-control-lg', { oninput: m.withAttr('value', state.setPassword), value: state.password, type: 'password', autocomplete: 'off', placeholder: 'Password', disabled: vnode.attrs.isUserLoginBusy })
				),
				m('button.btn.btn-lg.btn-primary.pull-xs-right', { onclick: onLoginButtonClick, disabled: vnode.attrs.isUserLoginBusy }, 'Sign In')
			]
		)
	);
};


module.exports = {
	view: view
};

},{"./../../domain":5,"mithril":3}],36:[function(require,module,exports){
'use strict';


var m = require('mithril');


var state = {
	fn_registerUser: null,
	formData: {}
};


function setInputValue(name, value) {
	state.formData[name] = value;
}


function onRegisterButtonClick(e) {
	e.preventDefault();

	state.fn_registerUser(state.formData);
}


function oninit(vnode) {
	state.formData = {
		email: '',
		password: '',
		username: ''
	};

	state.fn_registerUser = vnode.attrs.fn_registerUser;
}



function view(vnode) {
	return m('form',
		m('fieldset',
			[
				m('fieldset.form-group',
					m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'username')), value: state.formData.username, type: 'text', autocomplete: 'off', placeholder: 'Username', disabled: vnode.attrs.isUserRegistrationBusy })
				),
				m('fieldset.form-group',
					m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'email')), value: state.formData.email, type: 'email', autocomplete: 'off', placeholder: 'Email', disabled: vnode.attrs.isUserRegistrationBusy })
				),
				m('fieldset.form-group',
					m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'password')), value: state.formData.password, type: 'password', autocomplete: 'off', placeholder: 'Password', disabled: vnode.attrs.isUserRegistrationBusy })
				),
				m('button.btn.btn-lg.btn-primary.pull-xs-right', { onclick: onRegisterButtonClick, disabled: vnode.attrs.isUserRegistrationBusy }, 'Sign up')
			]
		)
	);
};


module.exports = {
	oninit: oninit,
	view: view
};

},{"mithril":3}],37:[function(require,module,exports){
'use strict';


var m = require('mithril');


var state = {
	fn_updateUserSettings: null,
	fn_logUserOut: null,
	formData: {}
};


function setInputValue(name, value) {
	state.formData[name] = value;
}


function onSubmitButtonClick(e) {
	e.preventDefault();

	state.fn_updateUserSettings(state.formData);
}


function onLogoutButtonClick(e) {
	e.preventDefault();

	state.fn_logUserOut();
}


function oninit(vnode) {
	setupFormData(vnode.attrs.currentUser);

	state.fn_updateUserSettings = vnode.attrs.fn_updateUserSettings;
	state.fn_logUserOut = vnode.attrs.fn_logUserOut;
}


function setupFormData(data) {
	var userData = data ? data : {
		bio: '',
		email: '',
		image: '',
		username: ''
	};

	state.formData = {
		bio: userData.bio,
		email: userData.email,
		image: userData.image,
		username: userData.username
	};
}


function onbeforeupdate(vnode, vnodeOld) {
	if (vnodeOld.attrs.currentUser !== vnode.attrs.currentUser) {
		setupFormData(vnode.attrs.currentUser);
	}

	return true;
}


function view(vnode) {

	return m('div', [
		m('form',
			m('fieldset',
				[
					m('fieldset.form-group',
						m('input.form-control', { oninput: m.withAttr('value', setInputValue.bind(null, 'image')), value: state.formData.image, type: 'text', autocomplete: 'off', placeholder: 'URL of profile picture', disabled: vnode.attrs.isUserSettingsUpdateBusy })
					),
					m('fieldset.form-group',
						m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'username')), value: state.formData.username, type: 'email', autocomplete: 'off', placeholder: 'Username', disabled: vnode.attrs.isUserSettingsUpdateBusy })
					),
					m('fieldset.form-group',
						m('textarea.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'bio')), value: state.formData.bio, autocomplete: 'off', rows: '8', placeholder: 'Short bio about you', disabled: vnode.attrs.isUserSettingsUpdateBusy })
					),
					m('fieldset.form-group',
						m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'email')), value: state.formData.email, type: 'email', autocomplete: 'off', placeholder: 'Email', disabled: vnode.attrs.isUserSettingsUpdateBusy })
					),
					m('fieldset.form-group',
						m('input.form-control.form-control-lg', { oninput: m.withAttr('value', setInputValue.bind(null, 'password')), value: state.formData.password, type: 'password', autocomplete: 'off', placeholder: 'Password', disabled: vnode.attrs.isUserSettingsUpdateBusy })
					),
					m('button.btn.btn-lg.btn-primary.pull-xs-right', { onclick: onSubmitButtonClick, disabled: vnode.attrs.isUserSettingsUpdateBusy }, 'Update Settings')
				]
			)
		),
		m('hr'),
		m('button.btn.btn-outline-danger', { onclick: onLogoutButtonClick, disabled: vnode.attrs.isUserSettingsUpdateBusy }, 'Or click here to logout')
	]);
};


module.exports = {
	oninit: oninit,
	onbeforeupdate: onbeforeupdate,
	view: view
};

},{"mithril":3}],38:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');


function view(vnode) {
	var action = domain.actions.unfollowUser.bind(null, vnode.attrs.username);
	var label = vnode.attrs.username ? ' Unfollow ' + vnode.attrs.username : '';

	return [
		m('span',
			m('button.btn.btn-sm.btn-secondary', { onclick: function () { action(); } }, [
				m('i.ion-minus-round'), m('span', label)
			])
		)
	];
};


module.exports = {
	view: view
};

},{"./../../domain":5,"mithril":3}],39:[function(require,module,exports){
'use strict';


var m = require('mithril');


var name = 'LayoutDefault';


var AppHeader = require('./../components/AppHeader');
var ScreenContent = require('./../components/ScreenContent');
var AppFooter = require('./../components/AppFooter');


function view(vnode) {
	return m('div', { className: name },
		[
			m(AppHeader),
			m(ScreenContent, {}, vnode.children),
			m(AppFooter)
		]
	);
}


module.exports = {
	view: view
};

},{"./../components/AppFooter":7,"./../components/AppHeader":8,"./../components/ScreenContent":30,"mithril":3}],40:[function(require,module,exports){
'use strict';


var m = require('mithril');


var LayoutDefault = require('./layouts/LayoutDefault');


var ScreenHome = require('./screens/ScreenHome');
var ScreenArticle = require('./screens/ScreenArticle');
var ScreenUserLogin = require('./screens/ScreenUserLogin');
var ScreenUserRegister = require('./screens/ScreenUserRegister');
var ScreenUserProfile = require('./screens/ScreenUserProfile');
var ScreenUserSettings = require('./screens/ScreenUserSettings');
var ScreenUserFavorites = require('./screens/ScreenUserFavorites');
var ScreenEditor = require('./screens/ScreenEditor');


var routes = {
	'/': buildRoute(ScreenHome),
	'/article/:slug': buildRoute(ScreenArticle),
	'/register': buildRoute(ScreenUserRegister),
	'/login': buildRoute(ScreenUserLogin),
	'/@:username': buildRoute(ScreenUserProfile),
	'/@:username/favorites': buildRoute(ScreenUserFavorites),
	'/settings': buildRoute(ScreenUserSettings),
	'/editor': buildRoute(ScreenEditor),
	'/editor/:slug': buildRoute(ScreenEditor)
};


function buildRoute(screen, layout) {
	layout = layout || LayoutDefault;

	return {
		render: function () {
			return m(layout, m(screen));
		}
	};
}


function init() {
	m.route.prefix('?');
	m.route(document.getElementById('app'), '/', routes);
}


module.exports = {
	init: init
};

},{"./layouts/LayoutDefault":39,"./screens/ScreenArticle":41,"./screens/ScreenEditor":42,"./screens/ScreenHome":43,"./screens/ScreenUserFavorites":44,"./screens/ScreenUserLogin":45,"./screens/ScreenUserProfile":46,"./screens/ScreenUserRegister":47,"./screens/ScreenUserSettings":48,"mithril":3}],41:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Banner = require('./../components/Banner');
var ArticleBanner = require('./../components/ArticleBanner');
var ArticleContent = require('./../components/ArticleContent');
var ArticleMetaAndActions = require('./../components/ArticleMetaAndActions');
var Comments = require('./../components/Comments');


var state = {
	slug: ''
};


function getArticle() {
	state.slug = m.route.param('slug');
	domain.actions.setSelectedArticle(state.slug);
	domain.actions.setSelectedArticleComments(state.slug);
	document.body.scrollTop = 0;
}


function oninit() {
	getArticle();
}


function onbeforeupdate() {
	if (state.slug !== m.route.param('slug')) {
		getArticle();
	}

	return true;
}


function onupdate() {
	if (domain.store.selectedArticle.data) {
		utils.updateDocumentTitle(domain.store.selectedArticle.data.title);
	}
}


function view() {
	return m('div.article-page',
		[
			m(Banner,
				m(ArticleBanner, { article: domain.store.selectedArticle })
			),
			m('div.container', [
				m('div.row', [
					m(ArticleContent, { article: domain.store.selectedArticle }),
				]),
				m('hr'),
				m('div.article-actions', [
					m(ArticleMetaAndActions, { article: domain.store.selectedArticle })
				]),
				m('div.row',
					m('div.col-xs-12.col-md-8.offset-md-2',
						m(Comments, { comments: domain.store.selectedArticleComments, currentUser: domain.store.user })
					)
				)
			])
		]
	);
};


module.exports = {
	oninit: oninit,
	onbeforeupdate: onbeforeupdate,
	onupdate: onupdate,
	view: view
};

},{"./../../domain":5,"./../components/ArticleBanner":10,"./../components/ArticleContent":11,"./../components/ArticleMetaAndActions":16,"./../components/Banner":19,"./../components/Comments":21,"./../utils":49,"mithril":3}],42:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var NewArticleForm = require('./../components/NewArticleForm');
var ListErrors = require('./../components/ListErrors');


function oninit() {
	utils.updateDocumentTitle('Editor');
}


function view() {
	return m('.container.page', [
		m('.row', [
			m('.col-md-10.offset-md-1.col-xs-12', [
				m(ListErrors, { errors: domain.store.createArticleErrors }),
				m(NewArticleForm, { isSubmitBusy: domain.store.isCreateArticleBusy, fn_submit: domain.actions.createArticle })
			])
		])
	]);
};


module.exports = {
	oninit: oninit,
	view: view
};

},{"./../../domain":5,"./../components/ListErrors":24,"./../components/NewArticleForm":26,"./../utils":49,"mithril":3}],43:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Banner = require('./../components/Banner');
var ArticleList = require('./../components/ArticleList');
var FeedToggle = require('./../components/FeedToggle');
var PopularTagList = require('./../components/PopularTagList');


function onTagItemClick(tag) {
	domain.actions.getArticlesByTag(tag);
}


function oninit() {
	utils.updateDocumentTitle('Home');
	domain.actions.getTags();
}


function view() {
	var banner = m(Banner);

	if (domain.store.user) {
		banner = null;
	}

	return m('div.home-page',
		[
			banner,
			m('.container.page', [
				m('.row', [
					m('.col-md-9', [
						m(FeedToggle, {
							currentType: domain.store.selectedArticles.type, username: domain.store.user ? domain.store.user.username : '', linkTypes: [
								domain.store.articleListTypes.USER_FAVORITED,
								domain.store.articleListTypes.GLOBAL,
								domain.store.articleListTypes.USER_OWNED
							]
						}),
						m(ArticleList, { limit: 10 })
					]),
					m('.col-md-3', [
						m('.sidebar', m(PopularTagList, { fn_onTagItemClick: onTagItemClick, isLoading: domain.store.tags.isLoading, list: domain.store.tags.list }))
					])
				])
			])
		]
	);
};


module.exports = {
	oninit: oninit,
	view: view
};

},{"./../../domain":5,"./../components/ArticleList":14,"./../components/Banner":19,"./../components/FeedToggle":22,"./../components/PopularTagList":29,"./../utils":49,"mithril":3}],44:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Banner = require('./../components/Banner');


var state = {
	username: ''
};


function getUserProfile() {
	state.username = m.route.param('username');
	domain.actions.getUserProfile(state.username);
	document.body.scrollTop = 0;
}


function oninit() {
	getUserProfile();
}


function onbeforeupdate() {
	if (state.username !== m.route.param('username')) {
		getUserProfile();
	}

	return true;
}


function onupdate() {
	utils.updateDocumentTitle('Articles favourited by ' + state.username);
}


function view() {
	return m('div',
		[
			m(Banner),
			m('h1', 'ScreenUserFavorites')
		]
	);
};


module.exports = {
	oninit: oninit,
	onbeforeupdate: onbeforeupdate,
	onupdate: onupdate,
	view: view
};

},{"./../../domain":5,"./../components/Banner":19,"./../utils":49,"mithril":3}],45:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Link = require('./../components/Link');
var UserLoginForm = require('./../components/UserLoginForm');
var ListErrors = require('./../components/ListErrors');


function redirectIfUserLoggedIn() {
	if (domain.store.user) {
		domain.actions.redirectAfterUserLoginSuccess();
	}
}


function oninit() {
	utils.updateDocumentTitle('Sign in');

	redirectIfUserLoggedIn();
}


function onupdate() {
	redirectIfUserLoggedIn();
}


function view() {
	return m('div',
		[
			m('.container.page', [
				m('.row', [
					m('.col-md-6.offset-md-3.col-xs-12', [
						m('h1.text-xs-center', 'Sign in'),
						m('p.text-xs-center',
							m(Link, { to: '/register' }, 'Need an account?')
						),
						m(ListErrors, { errors: domain.store.userLoginErrors }),
						m(UserLoginForm, { isUserLoginBusy: domain.store.isUserLoginBusy })
					])
				])
			])
		]
	);
};


module.exports = {
	oninit: oninit,
	onupdate: onupdate,
	view: view
};

},{"./../../domain":5,"./../components/Link":23,"./../components/ListErrors":24,"./../components/UserLoginForm":35,"./../utils":49,"mithril":3}],46:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var UserInfoBanner = require('./../components/UserInfoBanner');
var FeedToggle = require('./../components/FeedToggle');
var ArticleList = require('./../components/ArticleList');


var state = {
	username: ''
};


function getUserProfile() {
	state.username = m.route.param('username');
	domain.actions.getUserProfile(state.username);
	document.body.scrollTop = 0;
}


function oninit() {
	getUserProfile();
}


function onbeforeupdate() {
	if (state.username !== m.route.param('username')) {
		getUserProfile();
	}

	return true;
}


function onupdate() {
	utils.updateDocumentTitle('@' + state.username);
}


function view() {
	var username = m.route.param('username') || '';

	return m('.profile-page',
		[
			m(UserInfoBanner, { loggedInUser: domain.store.user, selectedUser: domain.store.selectedUserProfile.data, isLoading: domain.store.selectedUserProfile.isLoading }),
			m('.container', [
				m('.row', [
					m('.col-md-12', [
						m(FeedToggle, {
							currentType: domain.store.selectedArticles.type, username: username, linkTypes: [
								domain.store.articleListTypes.USER_OWNED,
								domain.store.articleListTypes.USER_FAVORITED
							]
						}),
						m(ArticleList, { limit: 5 })
					])
				])
			])
		]
	);
};


module.exports = {
	oninit: oninit,
	onbeforeupdate: onbeforeupdate,
	onupdate: onupdate,
	view: view
};

},{"./../../domain":5,"./../components/ArticleList":14,"./../components/FeedToggle":22,"./../components/UserInfoBanner":34,"./../utils":49,"mithril":3}],47:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var Link = require('./../components/Link');
var ListErrors = require('./../components/ListErrors');
var UserRegistrationForm = require('./../components/UserRegistrationForm');


function oninit() {
	utils.updateDocumentTitle('Sign up');
}


function onupdate() {
	if (domain.store.user) {
		domain.actions.redirectAfterUserRegistrationSuccess();
	}
}


function view() {
	return m('div',
		[
			m('.container.page', [
				m('.row', [
					m('.col-md-6.offset-md-3.col-xs-12', [
						m('h1.text-xs-center', 'Sign up'),
						m('p.text-xs-center',
							m(Link, { to: '/login' }, 'Have an account?')
						),
						m(ListErrors, { errors: domain.store.userRegistrationErrors }),
						m(UserRegistrationForm, { isUserRegistrationBusy: domain.store.isUserRegistrationBusy, fn_registerUser: domain.actions.registerNewUser })
					])
				])
			])
		]
	);
};


module.exports = {
	oninit: oninit,
	onupdate: onupdate,
	view: view
};

},{"./../../domain":5,"./../components/Link":23,"./../components/ListErrors":24,"./../components/UserRegistrationForm":36,"./../utils":49,"mithril":3}],48:[function(require,module,exports){
'use strict';


var m = require('mithril');


var domain = require('./../../domain');
var utils = require('./../utils');
var ListErrors = require('./../components/ListErrors');
var UserSettingsForm = require('./../components/UserSettingsForm');


function oninit() {
	utils.updateDocumentTitle('Settings');
}


function view() {
	return m('.container.page', [
		m('.row', [
			m('.col-md-6.offset-md-3.col-xs-12', [
				m('h1.text-xs-center', 'Your Settings'),
				m(ListErrors, { errors: domain.store.userUpdateSettingsErrors }),
				m(UserSettingsForm, { currentUser: domain.store.user, isUserSettingsUpdateBusy: domain.store.isUserSettingsUpdateBusy, fn_updateUserSettings: domain.actions.updateUserSettings, fn_logUserOut: domain.actions.logUserOut })
			])
		])
	]);
};


module.exports = {
	oninit: oninit,
	view: view
};

},{"./../../domain":5,"./../components/ListErrors":24,"./../components/UserSettingsForm":37,"./../utils":49,"mithril":3}],49:[function(require,module,exports){
'use strict';


var domain = require('./../domain');


var xssFilters = require('xss-filters');
var dateFormatTypes = {
	DEFAULT: 'mmmm d, yyyy',
	DEFAULT_WITH_TIME: 'mmmm d, yyyy @ HH:MM:ss'
};


function updateDocumentTitle(text) {
	document.title = text + ' — ' + domain.store.appTitle;
}


function formatDate(dateString, format) {
	// Could use Date.toLocaleString() in future, but currently mobile support is terrible
	var dateFormat = require('dateformat');

	if (!format) {
		format = dateFormatTypes.DEFAULT;
	}

	try {
		var date = new Date(dateString);
		return dateFormat(date, format);
	} catch (e) {
		return dateString;
	}
}


function convertMarkdownToHTML(content) {
	var marked = require('marked');

	return marked(content);
}


function formatArticleCommentBodyText(content) {
	return convertMarkdownToHTML(xssFilters.inSingleQuotedAttr(content));
}


function getLinkToUserProfile(username) {
	return '/@' + username;
}


function getUserImageOrDefault(user) {
	if (user && (user.image)) {
		return user.image;
	}

	return 'https://static.productionready.io/images/smiley-cyrus.jpg';
}


module.exports = {
	updateDocumentTitle: updateDocumentTitle,
	dateFormats: dateFormatTypes,
	formatDate: formatDate,
	formatArticleCommentBodyText: formatArticleCommentBodyText,
	convertMarkdownToHTML: convertMarkdownToHTML,
	getLinkToUserProfile: getLinkToUserProfile,
	getUserImageOrDefault: getUserImageOrDefault
};

},{"./../domain":5,"dateformat":1,"marked":2,"xss-filters":4}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZGF0ZWZvcm1hdC9saWIvZGF0ZWZvcm1hdC5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZWQvbGliL21hcmtlZC5qcyIsIm5vZGVfbW9kdWxlcy9taXRocmlsL21pdGhyaWwuanMiLCJub2RlX21vZHVsZXMveHNzLWZpbHRlcnMvc3JjL3hzcy1maWx0ZXJzLmpzIiwic3JjL2RvbWFpbi9pbmRleC5qcyIsInNyYy9pbmRleC5qcyIsInNyYy91aS9jb21wb25lbnRzL0FwcEZvb3Rlci5qcyIsInNyYy91aS9jb21wb25lbnRzL0FwcEhlYWRlci5qcyIsInNyYy91aS9jb21wb25lbnRzL0FydGljbGVBY3Rpb25zLmpzIiwic3JjL3VpL2NvbXBvbmVudHMvQXJ0aWNsZUJhbm5lci5qcyIsInNyYy91aS9jb21wb25lbnRzL0FydGljbGVDb250ZW50LmpzIiwic3JjL3VpL2NvbXBvbmVudHMvQXJ0aWNsZURlbGV0ZUJ1dHRvbi5qcyIsInNyYy91aS9jb21wb25lbnRzL0FydGljbGVGYXZvcml0ZUJ1dHRvbi5qcyIsInNyYy91aS9jb21wb25lbnRzL0FydGljbGVMaXN0LmpzIiwic3JjL3VpL2NvbXBvbmVudHMvQXJ0aWNsZU1ldGEuanMiLCJzcmMvdWkvY29tcG9uZW50cy9BcnRpY2xlTWV0YUFuZEFjdGlvbnMuanMiLCJzcmMvdWkvY29tcG9uZW50cy9BcnRpY2xlUHJldmlldy5qcyIsInNyYy91aS9jb21wb25lbnRzL0FydGljbGVVcGRhdGVCdXR0b24uanMiLCJzcmMvdWkvY29tcG9uZW50cy9CYW5uZXIuanMiLCJzcmMvdWkvY29tcG9uZW50cy9Db21tZW50LmpzIiwic3JjL3VpL2NvbXBvbmVudHMvQ29tbWVudHMuanMiLCJzcmMvdWkvY29tcG9uZW50cy9GZWVkVG9nZ2xlLmpzIiwic3JjL3VpL2NvbXBvbmVudHMvTGluay5qcyIsInNyYy91aS9jb21wb25lbnRzL0xpc3RFcnJvcnMuanMiLCJzcmMvdWkvY29tcG9uZW50cy9NYWluTmF2LmpzIiwic3JjL3VpL2NvbXBvbmVudHMvTmV3QXJ0aWNsZUZvcm0uanMiLCJzcmMvdWkvY29tcG9uZW50cy9OZXdDb21tZW50Rm9ybS5qcyIsInNyYy91aS9jb21wb25lbnRzL1BhZ2luYXRpb24uanMiLCJzcmMvdWkvY29tcG9uZW50cy9Qb3B1bGFyVGFnTGlzdC5qcyIsInNyYy91aS9jb21wb25lbnRzL1NjcmVlbkNvbnRlbnQuanMiLCJzcmMvdWkvY29tcG9uZW50cy9UYWdMaXN0LmpzIiwic3JjL3VpL2NvbXBvbmVudHMvVXNlckZvbGxvd0J1dHRvbi5qcyIsInNyYy91aS9jb21wb25lbnRzL1VzZXJGb2xsb3dVbmZvbGxvd0J1dHRvbi5qcyIsInNyYy91aS9jb21wb25lbnRzL1VzZXJJbmZvQmFubmVyLmpzIiwic3JjL3VpL2NvbXBvbmVudHMvVXNlckxvZ2luRm9ybS5qcyIsInNyYy91aS9jb21wb25lbnRzL1VzZXJSZWdpc3RyYXRpb25Gb3JtLmpzIiwic3JjL3VpL2NvbXBvbmVudHMvVXNlclNldHRpbmdzRm9ybS5qcyIsInNyYy91aS9jb21wb25lbnRzL1VzZXJVbmZvbGxvd0J1dHRvbi5qcyIsInNyYy91aS9sYXlvdXRzL0xheW91dERlZmF1bHQuanMiLCJzcmMvdWkvcm91dGVyLmpzIiwic3JjL3VpL3NjcmVlbnMvU2NyZWVuQXJ0aWNsZS5qcyIsInNyYy91aS9zY3JlZW5zL1NjcmVlbkVkaXRvci5qcyIsInNyYy91aS9zY3JlZW5zL1NjcmVlbkhvbWUuanMiLCJzcmMvdWkvc2NyZWVucy9TY3JlZW5Vc2VyRmF2b3JpdGVzLmpzIiwic3JjL3VpL3NjcmVlbnMvU2NyZWVuVXNlckxvZ2luLmpzIiwic3JjL3VpL3NjcmVlbnMvU2NyZWVuVXNlclByb2ZpbGUuanMiLCJzcmMvdWkvc2NyZWVucy9TY3JlZW5Vc2VyUmVnaXN0ZXIuanMiLCJzcmMvdWkvc2NyZWVucy9TY3JlZW5Vc2VyU2V0dGluZ3MuanMiLCJzcmMvdWkvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3R3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM2tDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2dCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxyXG4gKiBEYXRlIEZvcm1hdCAxLjIuM1xyXG4gKiAoYykgMjAwNy0yMDA5IFN0ZXZlbiBMZXZpdGhhbiA8c3RldmVubGV2aXRoYW4uY29tPlxyXG4gKiBNSVQgbGljZW5zZVxyXG4gKlxyXG4gKiBJbmNsdWRlcyBlbmhhbmNlbWVudHMgYnkgU2NvdHQgVHJlbmRhIDxzY290dC50cmVuZGEubmV0PlxyXG4gKiBhbmQgS3JpcyBLb3dhbCA8Y2l4YXIuY29tL35rcmlzLmtvd2FsLz5cclxuICpcclxuICogQWNjZXB0cyBhIGRhdGUsIGEgbWFzaywgb3IgYSBkYXRlIGFuZCBhIG1hc2suXHJcbiAqIFJldHVybnMgYSBmb3JtYXR0ZWQgdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gZGF0ZS5cclxuICogVGhlIGRhdGUgZGVmYXVsdHMgdG8gdGhlIGN1cnJlbnQgZGF0ZS90aW1lLlxyXG4gKiBUaGUgbWFzayBkZWZhdWx0cyB0byBkYXRlRm9ybWF0Lm1hc2tzLmRlZmF1bHQuXHJcbiAqL1xyXG5cclxuKGZ1bmN0aW9uKGdsb2JhbCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgdmFyIGRhdGVGb3JtYXQgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciB0b2tlbiA9IC9kezEsNH18bXsxLDR9fHl5KD86eXkpP3woW0hoTXNUdF0pXFwxP3xbTGxvU1pXTl18J1teJ10qJ3wnW14nXSonL2c7XHJcbiAgICAgIHZhciB0aW1lem9uZSA9IC9cXGIoPzpbUE1DRUFdW1NEUF1UfCg/OlBhY2lmaWN8TW91bnRhaW58Q2VudHJhbHxFYXN0ZXJufEF0bGFudGljKSAoPzpTdGFuZGFyZHxEYXlsaWdodHxQcmV2YWlsaW5nKSBUaW1lfCg/OkdNVHxVVEMpKD86Wy0rXVxcZHs0fSk/KVxcYi9nO1xyXG4gICAgICB2YXIgdGltZXpvbmVDbGlwID0gL1teLStcXGRBLVpdL2c7XHJcbiAgXHJcbiAgICAgIC8vIFJlZ2V4ZXMgYW5kIHN1cHBvcnRpbmcgZnVuY3Rpb25zIGFyZSBjYWNoZWQgdGhyb3VnaCBjbG9zdXJlXHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZGF0ZSwgbWFzaywgdXRjLCBnbXQpIHtcclxuICBcclxuICAgICAgICAvLyBZb3UgY2FuJ3QgcHJvdmlkZSB1dGMgaWYgeW91IHNraXAgb3RoZXIgYXJncyAodXNlIHRoZSAnVVRDOicgbWFzayBwcmVmaXgpXHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYga2luZE9mKGRhdGUpID09PSAnc3RyaW5nJyAmJiAhL1xcZC8udGVzdChkYXRlKSkge1xyXG4gICAgICAgICAgbWFzayA9IGRhdGU7XHJcbiAgICAgICAgICBkYXRlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICBcclxuICAgICAgICBkYXRlID0gZGF0ZSB8fCBuZXcgRGF0ZTtcclxuICBcclxuICAgICAgICBpZighKGRhdGUgaW5zdGFuY2VvZiBEYXRlKSkge1xyXG4gICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKGRhdGUpO1xyXG4gICAgICAgIH1cclxuICBcclxuICAgICAgICBpZiAoaXNOYU4oZGF0ZSkpIHtcclxuICAgICAgICAgIHRocm93IFR5cGVFcnJvcignSW52YWxpZCBkYXRlJyk7XHJcbiAgICAgICAgfVxyXG4gIFxyXG4gICAgICAgIG1hc2sgPSBTdHJpbmcoZGF0ZUZvcm1hdC5tYXNrc1ttYXNrXSB8fCBtYXNrIHx8IGRhdGVGb3JtYXQubWFza3NbJ2RlZmF1bHQnXSk7XHJcbiAgXHJcbiAgICAgICAgLy8gQWxsb3cgc2V0dGluZyB0aGUgdXRjL2dtdCBhcmd1bWVudCB2aWEgdGhlIG1hc2tcclxuICAgICAgICB2YXIgbWFza1NsaWNlID0gbWFzay5zbGljZSgwLCA0KTtcclxuICAgICAgICBpZiAobWFza1NsaWNlID09PSAnVVRDOicgfHwgbWFza1NsaWNlID09PSAnR01UOicpIHtcclxuICAgICAgICAgIG1hc2sgPSBtYXNrLnNsaWNlKDQpO1xyXG4gICAgICAgICAgdXRjID0gdHJ1ZTtcclxuICAgICAgICAgIGlmIChtYXNrU2xpY2UgPT09ICdHTVQ6Jykge1xyXG4gICAgICAgICAgICBnbXQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICBcclxuICAgICAgICB2YXIgXyA9IHV0YyA/ICdnZXRVVEMnIDogJ2dldCc7XHJcbiAgICAgICAgdmFyIGQgPSBkYXRlW18gKyAnRGF0ZSddKCk7XHJcbiAgICAgICAgdmFyIEQgPSBkYXRlW18gKyAnRGF5J10oKTtcclxuICAgICAgICB2YXIgbSA9IGRhdGVbXyArICdNb250aCddKCk7XHJcbiAgICAgICAgdmFyIHkgPSBkYXRlW18gKyAnRnVsbFllYXInXSgpO1xyXG4gICAgICAgIHZhciBIID0gZGF0ZVtfICsgJ0hvdXJzJ10oKTtcclxuICAgICAgICB2YXIgTSA9IGRhdGVbXyArICdNaW51dGVzJ10oKTtcclxuICAgICAgICB2YXIgcyA9IGRhdGVbXyArICdTZWNvbmRzJ10oKTtcclxuICAgICAgICB2YXIgTCA9IGRhdGVbXyArICdNaWxsaXNlY29uZHMnXSgpO1xyXG4gICAgICAgIHZhciBvID0gdXRjID8gMCA6IGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuICAgICAgICB2YXIgVyA9IGdldFdlZWsoZGF0ZSk7XHJcbiAgICAgICAgdmFyIE4gPSBnZXREYXlPZldlZWsoZGF0ZSk7XHJcbiAgICAgICAgdmFyIGZsYWdzID0ge1xyXG4gICAgICAgICAgZDogICAgZCxcclxuICAgICAgICAgIGRkOiAgIHBhZChkKSxcclxuICAgICAgICAgIGRkZDogIGRhdGVGb3JtYXQuaTE4bi5kYXlOYW1lc1tEXSxcclxuICAgICAgICAgIGRkZGQ6IGRhdGVGb3JtYXQuaTE4bi5kYXlOYW1lc1tEICsgN10sXHJcbiAgICAgICAgICBtOiAgICBtICsgMSxcclxuICAgICAgICAgIG1tOiAgIHBhZChtICsgMSksXHJcbiAgICAgICAgICBtbW06ICBkYXRlRm9ybWF0LmkxOG4ubW9udGhOYW1lc1ttXSxcclxuICAgICAgICAgIG1tbW06IGRhdGVGb3JtYXQuaTE4bi5tb250aE5hbWVzW20gKyAxMl0sXHJcbiAgICAgICAgICB5eTogICBTdHJpbmcoeSkuc2xpY2UoMiksXHJcbiAgICAgICAgICB5eXl5OiB5LFxyXG4gICAgICAgICAgaDogICAgSCAlIDEyIHx8IDEyLFxyXG4gICAgICAgICAgaGg6ICAgcGFkKEggJSAxMiB8fCAxMiksXHJcbiAgICAgICAgICBIOiAgICBILFxyXG4gICAgICAgICAgSEg6ICAgcGFkKEgpLFxyXG4gICAgICAgICAgTTogICAgTSxcclxuICAgICAgICAgIE1NOiAgIHBhZChNKSxcclxuICAgICAgICAgIHM6ICAgIHMsXHJcbiAgICAgICAgICBzczogICBwYWQocyksXHJcbiAgICAgICAgICBsOiAgICBwYWQoTCwgMyksXHJcbiAgICAgICAgICBMOiAgICBwYWQoTWF0aC5yb3VuZChMIC8gMTApKSxcclxuICAgICAgICAgIHQ6ICAgIEggPCAxMiA/ICdhJyAgOiAncCcsXHJcbiAgICAgICAgICB0dDogICBIIDwgMTIgPyAnYW0nIDogJ3BtJyxcclxuICAgICAgICAgIFQ6ICAgIEggPCAxMiA/ICdBJyAgOiAnUCcsXHJcbiAgICAgICAgICBUVDogICBIIDwgMTIgPyAnQU0nIDogJ1BNJyxcclxuICAgICAgICAgIFo6ICAgIGdtdCA/ICdHTVQnIDogdXRjID8gJ1VUQycgOiAoU3RyaW5nKGRhdGUpLm1hdGNoKHRpbWV6b25lKSB8fCBbJyddKS5wb3AoKS5yZXBsYWNlKHRpbWV6b25lQ2xpcCwgJycpLFxyXG4gICAgICAgICAgbzogICAgKG8gPiAwID8gJy0nIDogJysnKSArIHBhZChNYXRoLmZsb29yKE1hdGguYWJzKG8pIC8gNjApICogMTAwICsgTWF0aC5hYnMobykgJSA2MCwgNCksXHJcbiAgICAgICAgICBTOiAgICBbJ3RoJywgJ3N0JywgJ25kJywgJ3JkJ11bZCAlIDEwID4gMyA/IDAgOiAoZCAlIDEwMCAtIGQgJSAxMCAhPSAxMCkgKiBkICUgMTBdLFxyXG4gICAgICAgICAgVzogICAgVyxcclxuICAgICAgICAgIE46ICAgIE5cclxuICAgICAgICB9O1xyXG4gIFxyXG4gICAgICAgIHJldHVybiBtYXNrLnJlcGxhY2UodG9rZW4sIGZ1bmN0aW9uIChtYXRjaCkge1xyXG4gICAgICAgICAgaWYgKG1hdGNoIGluIGZsYWdzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmbGFnc1ttYXRjaF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gbWF0Y2guc2xpY2UoMSwgbWF0Y2gubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH07XHJcbiAgICB9KSgpO1xyXG5cclxuICBkYXRlRm9ybWF0Lm1hc2tzID0ge1xyXG4gICAgJ2RlZmF1bHQnOiAgICAgICAgICAgICAgICdkZGQgbW1tIGRkIHl5eXkgSEg6TU06c3MnLFxyXG4gICAgJ3Nob3J0RGF0ZSc6ICAgICAgICAgICAgICdtL2QveXknLFxyXG4gICAgJ21lZGl1bURhdGUnOiAgICAgICAgICAgICdtbW0gZCwgeXl5eScsXHJcbiAgICAnbG9uZ0RhdGUnOiAgICAgICAgICAgICAgJ21tbW0gZCwgeXl5eScsXHJcbiAgICAnZnVsbERhdGUnOiAgICAgICAgICAgICAgJ2RkZGQsIG1tbW0gZCwgeXl5eScsXHJcbiAgICAnc2hvcnRUaW1lJzogICAgICAgICAgICAgJ2g6TU0gVFQnLFxyXG4gICAgJ21lZGl1bVRpbWUnOiAgICAgICAgICAgICdoOk1NOnNzIFRUJyxcclxuICAgICdsb25nVGltZSc6ICAgICAgICAgICAgICAnaDpNTTpzcyBUVCBaJyxcclxuICAgICdpc29EYXRlJzogICAgICAgICAgICAgICAneXl5eS1tbS1kZCcsXHJcbiAgICAnaXNvVGltZSc6ICAgICAgICAgICAgICAgJ0hIOk1NOnNzJyxcclxuICAgICdpc29EYXRlVGltZSc6ICAgICAgICAgICAneXl5eS1tbS1kZFxcJ1RcXCdISDpNTTpzc28nLFxyXG4gICAgJ2lzb1V0Y0RhdGVUaW1lJzogICAgICAgICdVVEM6eXl5eS1tbS1kZFxcJ1RcXCdISDpNTTpzc1xcJ1pcXCcnLFxyXG4gICAgJ2V4cGlyZXNIZWFkZXJGb3JtYXQnOiAgICdkZGQsIGRkIG1tbSB5eXl5IEhIOk1NOnNzIFonXHJcbiAgfTtcclxuXHJcbiAgLy8gSW50ZXJuYXRpb25hbGl6YXRpb24gc3RyaW5nc1xyXG4gIGRhdGVGb3JtYXQuaTE4biA9IHtcclxuICAgIGRheU5hbWVzOiBbXHJcbiAgICAgICdTdW4nLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnLFxyXG4gICAgICAnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXHJcbiAgICBdLFxyXG4gICAgbW9udGhOYW1lczogW1xyXG4gICAgICAnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnLFxyXG4gICAgICAnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlcidcclxuICAgIF1cclxuICB9O1xyXG5cclxuZnVuY3Rpb24gcGFkKHZhbCwgbGVuKSB7XHJcbiAgdmFsID0gU3RyaW5nKHZhbCk7XHJcbiAgbGVuID0gbGVuIHx8IDI7XHJcbiAgd2hpbGUgKHZhbC5sZW5ndGggPCBsZW4pIHtcclxuICAgIHZhbCA9ICcwJyArIHZhbDtcclxuICB9XHJcbiAgcmV0dXJuIHZhbDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCB0aGUgSVNPIDg2MDEgd2VlayBudW1iZXJcclxuICogQmFzZWQgb24gY29tbWVudHMgZnJvbVxyXG4gKiBodHRwOi8vdGVjaGJsb2cucHJvY3VyaW9zLm5sL2svbjYxOC9uZXdzL3ZpZXcvMzM3OTYvMTQ4NjMvQ2FsY3VsYXRlLUlTTy04NjAxLXdlZWstYW5kLXllYXItaW4tamF2YXNjcmlwdC5odG1sXHJcbiAqXHJcbiAqIEBwYXJhbSAge09iamVjdH0gYGRhdGVgXHJcbiAqIEByZXR1cm4ge051bWJlcn1cclxuICovXHJcbmZ1bmN0aW9uIGdldFdlZWsoZGF0ZSkge1xyXG4gIC8vIFJlbW92ZSB0aW1lIGNvbXBvbmVudHMgb2YgZGF0ZVxyXG4gIHZhciB0YXJnZXRUaHVyc2RheSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSk7XHJcblxyXG4gIC8vIENoYW5nZSBkYXRlIHRvIFRodXJzZGF5IHNhbWUgd2Vla1xyXG4gIHRhcmdldFRodXJzZGF5LnNldERhdGUodGFyZ2V0VGh1cnNkYXkuZ2V0RGF0ZSgpIC0gKCh0YXJnZXRUaHVyc2RheS5nZXREYXkoKSArIDYpICUgNykgKyAzKTtcclxuXHJcbiAgLy8gVGFrZSBKYW51YXJ5IDR0aCBhcyBpdCBpcyBhbHdheXMgaW4gd2VlayAxIChzZWUgSVNPIDg2MDEpXHJcbiAgdmFyIGZpcnN0VGh1cnNkYXkgPSBuZXcgRGF0ZSh0YXJnZXRUaHVyc2RheS5nZXRGdWxsWWVhcigpLCAwLCA0KTtcclxuXHJcbiAgLy8gQ2hhbmdlIGRhdGUgdG8gVGh1cnNkYXkgc2FtZSB3ZWVrXHJcbiAgZmlyc3RUaHVyc2RheS5zZXREYXRlKGZpcnN0VGh1cnNkYXkuZ2V0RGF0ZSgpIC0gKChmaXJzdFRodXJzZGF5LmdldERheSgpICsgNikgJSA3KSArIDMpO1xyXG5cclxuICAvLyBDaGVjayBpZiBkYXlsaWdodC1zYXZpbmctdGltZS1zd2l0Y2ggb2NjdXJyZWQgYW5kIGNvcnJlY3QgZm9yIGl0XHJcbiAgdmFyIGRzID0gdGFyZ2V0VGh1cnNkYXkuZ2V0VGltZXpvbmVPZmZzZXQoKSAtIGZpcnN0VGh1cnNkYXkuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuICB0YXJnZXRUaHVyc2RheS5zZXRIb3Vycyh0YXJnZXRUaHVyc2RheS5nZXRIb3VycygpIC0gZHMpO1xyXG5cclxuICAvLyBOdW1iZXIgb2Ygd2Vla3MgYmV0d2VlbiB0YXJnZXQgVGh1cnNkYXkgYW5kIGZpcnN0IFRodXJzZGF5XHJcbiAgdmFyIHdlZWtEaWZmID0gKHRhcmdldFRodXJzZGF5IC0gZmlyc3RUaHVyc2RheSkgLyAoODY0MDAwMDAqNyk7XHJcbiAgcmV0dXJuIDEgKyBNYXRoLmZsb29yKHdlZWtEaWZmKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldCBJU08tODYwMSBudW1lcmljIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXkgb2YgdGhlIHdlZWtcclxuICogMSAoZm9yIE1vbmRheSkgdGhyb3VnaCA3IChmb3IgU3VuZGF5KVxyXG4gKiBcclxuICogQHBhcmFtICB7T2JqZWN0fSBgZGF0ZWBcclxuICogQHJldHVybiB7TnVtYmVyfVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0RGF5T2ZXZWVrKGRhdGUpIHtcclxuICB2YXIgZG93ID0gZGF0ZS5nZXREYXkoKTtcclxuICBpZihkb3cgPT09IDApIHtcclxuICAgIGRvdyA9IDc7XHJcbiAgfVxyXG4gIHJldHVybiBkb3c7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBraW5kLW9mIHNob3J0Y3V0XHJcbiAqIEBwYXJhbSAgeyp9IHZhbFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAqL1xyXG5mdW5jdGlvbiBraW5kT2YodmFsKSB7XHJcbiAgaWYgKHZhbCA9PT0gbnVsbCkge1xyXG4gICAgcmV0dXJuICdudWxsJztcclxuICB9XHJcblxyXG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgcmV0dXJuICd1bmRlZmluZWQnO1xyXG4gIH1cclxuXHJcbiAgaWYgKHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHZhbDtcclxuICB9XHJcblxyXG4gIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcclxuICAgIHJldHVybiAnYXJyYXknO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHt9LnRvU3RyaW5nLmNhbGwodmFsKVxyXG4gICAgLnNsaWNlKDgsIC0xKS50b0xvd2VyQ2FzZSgpO1xyXG59O1xyXG5cclxuXHJcblxyXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiBkYXRlRm9ybWF0O1xyXG4gICAgfSk7XHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuICAgIG1vZHVsZS5leHBvcnRzID0gZGF0ZUZvcm1hdDtcclxuICB9IGVsc2Uge1xyXG4gICAgZ2xvYmFsLmRhdGVGb3JtYXQgPSBkYXRlRm9ybWF0O1xyXG4gIH1cclxufSkodGhpcyk7XHJcbiIsIi8qKlxuICogbWFya2VkIC0gYSBtYXJrZG93biBwYXJzZXJcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDE0LCBDaHJpc3RvcGhlciBKZWZmcmV5LiAoTUlUIExpY2Vuc2VkKVxuICogaHR0cHM6Ly9naXRodWIuY29tL2NoamovbWFya2VkXG4gKi9cblxuOyhmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBCbG9jay1MZXZlbCBHcmFtbWFyXG4gKi9cblxudmFyIGJsb2NrID0ge1xuICBuZXdsaW5lOiAvXlxcbisvLFxuICBjb2RlOiAvXiggezR9W15cXG5dK1xcbiopKy8sXG4gIGZlbmNlczogbm9vcCxcbiAgaHI6IC9eKCAqWy0qX10pezMsfSAqKD86XFxuK3wkKS8sXG4gIGhlYWRpbmc6IC9eICooI3sxLDZ9KSAqKFteXFxuXSs/KSAqIyogKig/Olxcbit8JCkvLFxuICBucHRhYmxlOiBub29wLFxuICBsaGVhZGluZzogL14oW15cXG5dKylcXG4gKig9fC0pezIsfSAqKD86XFxuK3wkKS8sXG4gIGJsb2NrcXVvdGU6IC9eKCAqPlteXFxuXSsoXFxuKD8hZGVmKVteXFxuXSspKlxcbiopKy8sXG4gIGxpc3Q6IC9eKCAqKShidWxsKSBbXFxzXFxTXSs/KD86aHJ8ZGVmfFxcbnsyLH0oPyEgKSg/IVxcMWJ1bGwgKVxcbip8XFxzKiQpLyxcbiAgaHRtbDogL14gKig/OmNvbW1lbnQgKig/OlxcbnxcXHMqJCl8Y2xvc2VkICooPzpcXG57Mix9fFxccyokKXxjbG9zaW5nICooPzpcXG57Mix9fFxccyokKSkvLFxuICBkZWY6IC9eICpcXFsoW15cXF1dKylcXF06ICo8PyhbXlxccz5dKyk+Pyg/OiArW1wiKF0oW15cXG5dKylbXCIpXSk/ICooPzpcXG4rfCQpLyxcbiAgdGFibGU6IG5vb3AsXG4gIHBhcmFncmFwaDogL14oKD86W15cXG5dK1xcbj8oPyFocnxoZWFkaW5nfGxoZWFkaW5nfGJsb2NrcXVvdGV8dGFnfGRlZikpKylcXG4qLyxcbiAgdGV4dDogL15bXlxcbl0rL1xufTtcblxuYmxvY2suYnVsbGV0ID0gLyg/OlsqKy1dfFxcZCtcXC4pLztcbmJsb2NrLml0ZW0gPSAvXiggKikoYnVsbCkgW15cXG5dKig/Olxcbig/IVxcMWJ1bGwgKVteXFxuXSopKi87XG5ibG9jay5pdGVtID0gcmVwbGFjZShibG9jay5pdGVtLCAnZ20nKVxuICAoL2J1bGwvZywgYmxvY2suYnVsbGV0KVxuICAoKTtcblxuYmxvY2subGlzdCA9IHJlcGxhY2UoYmxvY2subGlzdClcbiAgKC9idWxsL2csIGJsb2NrLmJ1bGxldClcbiAgKCdocicsICdcXFxcbisoPz1cXFxcMT8oPzpbLSpfXSAqKXszLH0oPzpcXFxcbit8JCkpJylcbiAgKCdkZWYnLCAnXFxcXG4rKD89JyArIGJsb2NrLmRlZi5zb3VyY2UgKyAnKScpXG4gICgpO1xuXG5ibG9jay5ibG9ja3F1b3RlID0gcmVwbGFjZShibG9jay5ibG9ja3F1b3RlKVxuICAoJ2RlZicsIGJsb2NrLmRlZilcbiAgKCk7XG5cbmJsb2NrLl90YWcgPSAnKD8hKD86J1xuICArICdhfGVtfHN0cm9uZ3xzbWFsbHxzfGNpdGV8cXxkZm58YWJicnxkYXRhfHRpbWV8Y29kZSdcbiAgKyAnfHZhcnxzYW1wfGtiZHxzdWJ8c3VwfGl8Ynx1fG1hcmt8cnVieXxydHxycHxiZGl8YmRvJ1xuICArICd8c3Bhbnxicnx3YnJ8aW5zfGRlbHxpbWcpXFxcXGIpXFxcXHcrKD8hOi98W15cXFxcd1xcXFxzQF0qQClcXFxcYic7XG5cbmJsb2NrLmh0bWwgPSByZXBsYWNlKGJsb2NrLmh0bWwpXG4gICgnY29tbWVudCcsIC88IS0tW1xcc1xcU10qPy0tPi8pXG4gICgnY2xvc2VkJywgLzwodGFnKVtcXHNcXFNdKz88XFwvXFwxPi8pXG4gICgnY2xvc2luZycsIC88dGFnKD86XCJbXlwiXSpcInwnW14nXSonfFteJ1wiPl0pKj8+LylcbiAgKC90YWcvZywgYmxvY2suX3RhZylcbiAgKCk7XG5cbmJsb2NrLnBhcmFncmFwaCA9IHJlcGxhY2UoYmxvY2sucGFyYWdyYXBoKVxuICAoJ2hyJywgYmxvY2suaHIpXG4gICgnaGVhZGluZycsIGJsb2NrLmhlYWRpbmcpXG4gICgnbGhlYWRpbmcnLCBibG9jay5saGVhZGluZylcbiAgKCdibG9ja3F1b3RlJywgYmxvY2suYmxvY2txdW90ZSlcbiAgKCd0YWcnLCAnPCcgKyBibG9jay5fdGFnKVxuICAoJ2RlZicsIGJsb2NrLmRlZilcbiAgKCk7XG5cbi8qKlxuICogTm9ybWFsIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5ub3JtYWwgPSBtZXJnZSh7fSwgYmxvY2spO1xuXG4vKipcbiAqIEdGTSBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2suZ2ZtID0gbWVyZ2Uoe30sIGJsb2NrLm5vcm1hbCwge1xuICBmZW5jZXM6IC9eICooYHszLH18fnszLH0pWyBcXC5dKihcXFMrKT8gKlxcbihbXFxzXFxTXSo/KVxccypcXDEgKig/Olxcbit8JCkvLFxuICBwYXJhZ3JhcGg6IC9eLyxcbiAgaGVhZGluZzogL14gKigjezEsNn0pICsoW15cXG5dKz8pICojKiAqKD86XFxuK3wkKS9cbn0pO1xuXG5ibG9jay5nZm0ucGFyYWdyYXBoID0gcmVwbGFjZShibG9jay5wYXJhZ3JhcGgpXG4gICgnKD8hJywgJyg/ISdcbiAgICArIGJsb2NrLmdmbS5mZW5jZXMuc291cmNlLnJlcGxhY2UoJ1xcXFwxJywgJ1xcXFwyJykgKyAnfCdcbiAgICArIGJsb2NrLmxpc3Quc291cmNlLnJlcGxhY2UoJ1xcXFwxJywgJ1xcXFwzJykgKyAnfCcpXG4gICgpO1xuXG4vKipcbiAqIEdGTSArIFRhYmxlcyBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2sudGFibGVzID0gbWVyZ2Uoe30sIGJsb2NrLmdmbSwge1xuICBucHRhYmxlOiAvXiAqKFxcUy4qXFx8LiopXFxuICooWy06XSsgKlxcfFstfCA6XSopXFxuKCg/Oi4qXFx8LiooPzpcXG58JCkpKilcXG4qLyxcbiAgdGFibGU6IC9eICpcXHwoLispXFxuICpcXHwoICpbLTpdK1stfCA6XSopXFxuKCg/OiAqXFx8LiooPzpcXG58JCkpKilcXG4qL1xufSk7XG5cbi8qKlxuICogQmxvY2sgTGV4ZXJcbiAqL1xuXG5mdW5jdGlvbiBMZXhlcihvcHRpb25zKSB7XG4gIHRoaXMudG9rZW5zID0gW107XG4gIHRoaXMudG9rZW5zLmxpbmtzID0ge307XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xuICB0aGlzLnJ1bGVzID0gYmxvY2subm9ybWFsO1xuXG4gIGlmICh0aGlzLm9wdGlvbnMuZ2ZtKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy50YWJsZXMpIHtcbiAgICAgIHRoaXMucnVsZXMgPSBibG9jay50YWJsZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucnVsZXMgPSBibG9jay5nZm07XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRXhwb3NlIEJsb2NrIFJ1bGVzXG4gKi9cblxuTGV4ZXIucnVsZXMgPSBibG9jaztcblxuLyoqXG4gKiBTdGF0aWMgTGV4IE1ldGhvZFxuICovXG5cbkxleGVyLmxleCA9IGZ1bmN0aW9uKHNyYywgb3B0aW9ucykge1xuICB2YXIgbGV4ZXIgPSBuZXcgTGV4ZXIob3B0aW9ucyk7XG4gIHJldHVybiBsZXhlci5sZXgoc3JjKTtcbn07XG5cbi8qKlxuICogUHJlcHJvY2Vzc2luZ1xuICovXG5cbkxleGVyLnByb3RvdHlwZS5sZXggPSBmdW5jdGlvbihzcmMpIHtcbiAgc3JjID0gc3JjXG4gICAgLnJlcGxhY2UoL1xcclxcbnxcXHIvZywgJ1xcbicpXG4gICAgLnJlcGxhY2UoL1xcdC9nLCAnICAgICcpXG4gICAgLnJlcGxhY2UoL1xcdTAwYTAvZywgJyAnKVxuICAgIC5yZXBsYWNlKC9cXHUyNDI0L2csICdcXG4nKTtcblxuICByZXR1cm4gdGhpcy50b2tlbihzcmMsIHRydWUpO1xufTtcblxuLyoqXG4gKiBMZXhpbmdcbiAqL1xuXG5MZXhlci5wcm90b3R5cGUudG9rZW4gPSBmdW5jdGlvbihzcmMsIHRvcCwgYnEpIHtcbiAgdmFyIHNyYyA9IHNyYy5yZXBsYWNlKC9eICskL2dtLCAnJylcbiAgICAsIG5leHRcbiAgICAsIGxvb3NlXG4gICAgLCBjYXBcbiAgICAsIGJ1bGxcbiAgICAsIGJcbiAgICAsIGl0ZW1cbiAgICAsIHNwYWNlXG4gICAgLCBpXG4gICAgLCBsO1xuXG4gIHdoaWxlIChzcmMpIHtcbiAgICAvLyBuZXdsaW5lXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubmV3bGluZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBpZiAoY2FwWzBdLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ3NwYWNlJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjb2RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuY29kZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBjYXAgPSBjYXBbMF0ucmVwbGFjZSgvXiB7NH0vZ20sICcnKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgIHRleHQ6ICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgICA/IGNhcC5yZXBsYWNlKC9cXG4rJC8sICcnKVxuICAgICAgICAgIDogY2FwXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGZlbmNlcyAoZ2ZtKVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmZlbmNlcy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICBsYW5nOiBjYXBbMl0sXG4gICAgICAgIHRleHQ6IGNhcFszXSB8fCAnJ1xuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBoZWFkaW5nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuaGVhZGluZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICBkZXB0aDogY2FwWzFdLmxlbmd0aCxcbiAgICAgICAgdGV4dDogY2FwWzJdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhYmxlIG5vIGxlYWRpbmcgcGlwZSAoZ2ZtKVxuICAgIGlmICh0b3AgJiYgKGNhcCA9IHRoaXMucnVsZXMubnB0YWJsZS5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuXG4gICAgICBpdGVtID0ge1xuICAgICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgICBoZWFkZXI6IGNhcFsxXS5yZXBsYWNlKC9eICp8ICpcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGFsaWduOiBjYXBbMl0ucmVwbGFjZSgvXiAqfFxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgY2VsbHM6IGNhcFszXS5yZXBsYWNlKC9cXG4kLywgJycpLnNwbGl0KCdcXG4nKVxuICAgICAgfTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uYWxpZ24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKC9eICotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ3JpZ2h0JztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnY2VudGVyJztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdsZWZ0JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVtLmNlbGxzW2ldID0gaXRlbS5jZWxsc1tpXS5zcGxpdCgvICpcXHwgKi8pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKGl0ZW0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsaGVhZGluZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxoZWFkaW5nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgICAgIGRlcHRoOiBjYXBbMl0gPT09ICc9JyA/IDEgOiAyLFxuICAgICAgICB0ZXh0OiBjYXBbMV1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaHJcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5oci5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2hyJ1xuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBibG9ja3F1b3RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuYmxvY2txdW90ZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnYmxvY2txdW90ZV9zdGFydCdcbiAgICAgIH0pO1xuXG4gICAgICBjYXAgPSBjYXBbMF0ucmVwbGFjZSgvXiAqPiA/L2dtLCAnJyk7XG5cbiAgICAgIC8vIFBhc3MgYHRvcGAgdG8ga2VlcCB0aGUgY3VycmVudFxuICAgICAgLy8gXCJ0b3BsZXZlbFwiIHN0YXRlLiBUaGlzIGlzIGV4YWN0bHlcbiAgICAgIC8vIGhvdyBtYXJrZG93bi5wbCB3b3Jrcy5cbiAgICAgIHRoaXMudG9rZW4oY2FwLCB0b3AsIHRydWUpO1xuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2Jsb2NrcXVvdGVfZW5kJ1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxpc3RcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5saXN0LmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGJ1bGwgPSBjYXBbMl07XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnbGlzdF9zdGFydCcsXG4gICAgICAgIG9yZGVyZWQ6IGJ1bGwubGVuZ3RoID4gMVxuICAgICAgfSk7XG5cbiAgICAgIC8vIEdldCBlYWNoIHRvcC1sZXZlbCBpdGVtLlxuICAgICAgY2FwID0gY2FwWzBdLm1hdGNoKHRoaXMucnVsZXMuaXRlbSk7XG5cbiAgICAgIG5leHQgPSBmYWxzZTtcbiAgICAgIGwgPSBjYXAubGVuZ3RoO1xuICAgICAgaSA9IDA7XG5cbiAgICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGl0ZW0gPSBjYXBbaV07XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBsaXN0IGl0ZW0ncyBidWxsZXRcbiAgICAgICAgLy8gc28gaXQgaXMgc2VlbiBhcyB0aGUgbmV4dCB0b2tlbi5cbiAgICAgICAgc3BhY2UgPSBpdGVtLmxlbmd0aDtcbiAgICAgICAgaXRlbSA9IGl0ZW0ucmVwbGFjZSgvXiAqKFsqKy1dfFxcZCtcXC4pICsvLCAnJyk7XG5cbiAgICAgICAgLy8gT3V0ZGVudCB3aGF0ZXZlciB0aGVcbiAgICAgICAgLy8gbGlzdCBpdGVtIGNvbnRhaW5zLiBIYWNreS5cbiAgICAgICAgaWYgKH5pdGVtLmluZGV4T2YoJ1xcbiAnKSkge1xuICAgICAgICAgIHNwYWNlIC09IGl0ZW0ubGVuZ3RoO1xuICAgICAgICAgIGl0ZW0gPSAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgICAgICA/IGl0ZW0ucmVwbGFjZShuZXcgUmVnRXhwKCdeIHsxLCcgKyBzcGFjZSArICd9JywgJ2dtJyksICcnKVxuICAgICAgICAgICAgOiBpdGVtLnJlcGxhY2UoL14gezEsNH0vZ20sICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIHRoZSBuZXh0IGxpc3QgaXRlbSBiZWxvbmdzIGhlcmUuXG4gICAgICAgIC8vIEJhY2twZWRhbCBpZiBpdCBkb2VzIG5vdCBiZWxvbmcgaW4gdGhpcyBsaXN0LlxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNtYXJ0TGlzdHMgJiYgaSAhPT0gbCAtIDEpIHtcbiAgICAgICAgICBiID0gYmxvY2suYnVsbGV0LmV4ZWMoY2FwW2kgKyAxXSlbMF07XG4gICAgICAgICAgaWYgKGJ1bGwgIT09IGIgJiYgIShidWxsLmxlbmd0aCA+IDEgJiYgYi5sZW5ndGggPiAxKSkge1xuICAgICAgICAgICAgc3JjID0gY2FwLnNsaWNlKGkgKyAxKS5qb2luKCdcXG4nKSArIHNyYztcbiAgICAgICAgICAgIGkgPSBsIC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hldGhlciBpdGVtIGlzIGxvb3NlIG9yIG5vdC5cbiAgICAgICAgLy8gVXNlOiAvKF58XFxuKSg/ISApW15cXG5dK1xcblxcbig/IVxccyokKS9cbiAgICAgICAgLy8gZm9yIGRpc2NvdW50IGJlaGF2aW9yLlxuICAgICAgICBsb29zZSA9IG5leHQgfHwgL1xcblxcbig/IVxccyokKS8udGVzdChpdGVtKTtcbiAgICAgICAgaWYgKGkgIT09IGwgLSAxKSB7XG4gICAgICAgICAgbmV4dCA9IGl0ZW0uY2hhckF0KGl0ZW0ubGVuZ3RoIC0gMSkgPT09ICdcXG4nO1xuICAgICAgICAgIGlmICghbG9vc2UpIGxvb3NlID0gbmV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICAgIHR5cGU6IGxvb3NlXG4gICAgICAgICAgICA/ICdsb29zZV9pdGVtX3N0YXJ0J1xuICAgICAgICAgICAgOiAnbGlzdF9pdGVtX3N0YXJ0J1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZWN1cnNlLlxuICAgICAgICB0aGlzLnRva2VuKGl0ZW0sIGZhbHNlLCBicSk7XG5cbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ2xpc3RfaXRlbV9lbmQnXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2xpc3RfZW5kJ1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGh0bWxcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5odG1sLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiB0aGlzLm9wdGlvbnMuc2FuaXRpemVcbiAgICAgICAgICA/ICdwYXJhZ3JhcGgnXG4gICAgICAgICAgOiAnaHRtbCcsXG4gICAgICAgIHByZTogIXRoaXMub3B0aW9ucy5zYW5pdGl6ZXJcbiAgICAgICAgICAmJiAoY2FwWzFdID09PSAncHJlJyB8fCBjYXBbMV0gPT09ICdzY3JpcHQnIHx8IGNhcFsxXSA9PT0gJ3N0eWxlJyksXG4gICAgICAgIHRleHQ6IGNhcFswXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBkZWZcbiAgICBpZiAoKCFicSAmJiB0b3ApICYmIChjYXAgPSB0aGlzLnJ1bGVzLmRlZi5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMubGlua3NbY2FwWzFdLnRvTG93ZXJDYXNlKCldID0ge1xuICAgICAgICBocmVmOiBjYXBbMl0sXG4gICAgICAgIHRpdGxlOiBjYXBbM11cbiAgICAgIH07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWJsZSAoZ2ZtKVxuICAgIGlmICh0b3AgJiYgKGNhcCA9IHRoaXMucnVsZXMudGFibGUuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgaXRlbSA9IHtcbiAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgaGVhZGVyOiBjYXBbMV0ucmVwbGFjZSgvXiAqfCAqXFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBhbGlnbjogY2FwWzJdLnJlcGxhY2UoL14gKnxcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGNlbGxzOiBjYXBbM10ucmVwbGFjZSgvKD86ICpcXHwgKik/XFxuJC8sICcnKS5zcGxpdCgnXFxuJylcbiAgICAgIH07XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmFsaWduLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICgvXiAqLSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdyaWdodCc7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2NlbnRlcic7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnbGVmdCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlbS5jZWxsc1tpXSA9IGl0ZW0uY2VsbHNbaV1cbiAgICAgICAgICAucmVwbGFjZSgvXiAqXFx8ICp8ICpcXHwgKiQvZywgJycpXG4gICAgICAgICAgLnNwbGl0KC8gKlxcfCAqLyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goaXRlbSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRvcC1sZXZlbCBwYXJhZ3JhcGhcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLnBhcmFncmFwaC5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdwYXJhZ3JhcGgnLFxuICAgICAgICB0ZXh0OiBjYXBbMV0uY2hhckF0KGNhcFsxXS5sZW5ndGggLSAxKSA9PT0gJ1xcbidcbiAgICAgICAgICA/IGNhcFsxXS5zbGljZSgwLCAtMSlcbiAgICAgICAgICA6IGNhcFsxXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0ZXh0XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGV4dC5leGVjKHNyYykpIHtcbiAgICAgIC8vIFRvcC1sZXZlbCBzaG91bGQgbmV2ZXIgcmVhY2ggaGVyZS5cbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICB0ZXh0OiBjYXBbMF1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHNyYykge1xuICAgICAgdGhyb3cgbmV3XG4gICAgICAgIEVycm9yKCdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXMudG9rZW5zO1xufTtcblxuLyoqXG4gKiBJbmxpbmUtTGV2ZWwgR3JhbW1hclxuICovXG5cbnZhciBpbmxpbmUgPSB7XG4gIGVzY2FwZTogL15cXFxcKFtcXFxcYCp7fVxcW1xcXSgpIytcXC0uIV8+XSkvLFxuICBhdXRvbGluazogL148KFteID5dKyhAfDpcXC8pW14gPl0rKT4vLFxuICB1cmw6IG5vb3AsXG4gIHRhZzogL148IS0tW1xcc1xcU10qPy0tPnxePFxcLz9cXHcrKD86XCJbXlwiXSpcInwnW14nXSonfFteJ1wiPl0pKj8+LyxcbiAgbGluazogL14hP1xcWyhpbnNpZGUpXFxdXFwoaHJlZlxcKS8sXG4gIHJlZmxpbms6IC9eIT9cXFsoaW5zaWRlKVxcXVxccypcXFsoW15cXF1dKilcXF0vLFxuICBub2xpbms6IC9eIT9cXFsoKD86XFxbW15cXF1dKlxcXXxbXlxcW1xcXV0pKilcXF0vLFxuICBzdHJvbmc6IC9eX18oW1xcc1xcU10rPylfXyg/IV8pfF5cXCpcXCooW1xcc1xcU10rPylcXCpcXCooPyFcXCopLyxcbiAgZW06IC9eXFxiXygoPzpbXl9dfF9fKSs/KV9cXGJ8XlxcKigoPzpcXCpcXCp8W1xcc1xcU10pKz8pXFwqKD8hXFwqKS8sXG4gIGNvZGU6IC9eKGArKVxccyooW1xcc1xcU10qP1teYF0pXFxzKlxcMSg/IWApLyxcbiAgYnI6IC9eIHsyLH1cXG4oPyFcXHMqJCkvLFxuICBkZWw6IG5vb3AsXG4gIHRleHQ6IC9eW1xcc1xcU10rPyg/PVtcXFxcPCFcXFtfKmBdfCB7Mix9XFxufCQpL1xufTtcblxuaW5saW5lLl9pbnNpZGUgPSAvKD86XFxbW15cXF1dKlxcXXxbXlxcW1xcXV18XFxdKD89W15cXFtdKlxcXSkpKi87XG5pbmxpbmUuX2hyZWYgPSAvXFxzKjw/KFtcXHNcXFNdKj8pPj8oPzpcXHMrWydcIl0oW1xcc1xcU10qPylbJ1wiXSk/XFxzKi87XG5cbmlubGluZS5saW5rID0gcmVwbGFjZShpbmxpbmUubGluaylcbiAgKCdpbnNpZGUnLCBpbmxpbmUuX2luc2lkZSlcbiAgKCdocmVmJywgaW5saW5lLl9ocmVmKVxuICAoKTtcblxuaW5saW5lLnJlZmxpbmsgPSByZXBsYWNlKGlubGluZS5yZWZsaW5rKVxuICAoJ2luc2lkZScsIGlubGluZS5faW5zaWRlKVxuICAoKTtcblxuLyoqXG4gKiBOb3JtYWwgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUubm9ybWFsID0gbWVyZ2Uoe30sIGlubGluZSk7XG5cbi8qKlxuICogUGVkYW50aWMgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUucGVkYW50aWMgPSBtZXJnZSh7fSwgaW5saW5lLm5vcm1hbCwge1xuICBzdHJvbmc6IC9eX18oPz1cXFMpKFtcXHNcXFNdKj9cXFMpX18oPyFfKXxeXFwqXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKlxcKig/IVxcKikvLFxuICBlbTogL15fKD89XFxTKShbXFxzXFxTXSo/XFxTKV8oPyFfKXxeXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKig/IVxcKikvXG59KTtcblxuLyoqXG4gKiBHRk0gSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuZ2ZtID0gbWVyZ2Uoe30sIGlubGluZS5ub3JtYWwsIHtcbiAgZXNjYXBlOiByZXBsYWNlKGlubGluZS5lc2NhcGUpKCddKScsICd+fF0pJykoKSxcbiAgdXJsOiAvXihodHRwcz86XFwvXFwvW15cXHM8XStbXjwuLDo7XCInKVxcXVxcc10pLyxcbiAgZGVsOiAvXn5+KD89XFxTKShbXFxzXFxTXSo/XFxTKX5+LyxcbiAgdGV4dDogcmVwbGFjZShpbmxpbmUudGV4dClcbiAgICAoJ118JywgJ35dfCcpXG4gICAgKCd8JywgJ3xodHRwcz86Ly98JylcbiAgICAoKVxufSk7XG5cbi8qKlxuICogR0ZNICsgTGluZSBCcmVha3MgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuYnJlYWtzID0gbWVyZ2Uoe30sIGlubGluZS5nZm0sIHtcbiAgYnI6IHJlcGxhY2UoaW5saW5lLmJyKSgnezIsfScsICcqJykoKSxcbiAgdGV4dDogcmVwbGFjZShpbmxpbmUuZ2ZtLnRleHQpKCd7Mix9JywgJyonKSgpXG59KTtcblxuLyoqXG4gKiBJbmxpbmUgTGV4ZXIgJiBDb21waWxlclxuICovXG5cbmZ1bmN0aW9uIElubGluZUxleGVyKGxpbmtzLCBvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xuICB0aGlzLmxpbmtzID0gbGlua3M7XG4gIHRoaXMucnVsZXMgPSBpbmxpbmUubm9ybWFsO1xuICB0aGlzLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyIHx8IG5ldyBSZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gIGlmICghdGhpcy5saW5rcykge1xuICAgIHRocm93IG5ld1xuICAgICAgRXJyb3IoJ1Rva2VucyBhcnJheSByZXF1aXJlcyBhIGBsaW5rc2AgcHJvcGVydHkuJyk7XG4gIH1cblxuICBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuYnJlYWtzKSB7XG4gICAgICB0aGlzLnJ1bGVzID0gaW5saW5lLmJyZWFrcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ydWxlcyA9IGlubGluZS5nZm07XG4gICAgfVxuICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgIHRoaXMucnVsZXMgPSBpbmxpbmUucGVkYW50aWM7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2UgSW5saW5lIFJ1bGVzXG4gKi9cblxuSW5saW5lTGV4ZXIucnVsZXMgPSBpbmxpbmU7XG5cbi8qKlxuICogU3RhdGljIExleGluZy9Db21waWxpbmcgTWV0aG9kXG4gKi9cblxuSW5saW5lTGV4ZXIub3V0cHV0ID0gZnVuY3Rpb24oc3JjLCBsaW5rcywgb3B0aW9ucykge1xuICB2YXIgaW5saW5lID0gbmV3IElubGluZUxleGVyKGxpbmtzLCBvcHRpb25zKTtcbiAgcmV0dXJuIGlubGluZS5vdXRwdXQoc3JjKTtcbn07XG5cbi8qKlxuICogTGV4aW5nL0NvbXBpbGluZ1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5vdXRwdXQgPSBmdW5jdGlvbihzcmMpIHtcbiAgdmFyIG91dCA9ICcnXG4gICAgLCBsaW5rXG4gICAgLCB0ZXh0XG4gICAgLCBocmVmXG4gICAgLCBjYXA7XG5cbiAgd2hpbGUgKHNyYykge1xuICAgIC8vIGVzY2FwZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmVzY2FwZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gY2FwWzFdO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYXV0b2xpbmtcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5hdXRvbGluay5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBpZiAoY2FwWzJdID09PSAnQCcpIHtcbiAgICAgICAgdGV4dCA9IGNhcFsxXS5jaGFyQXQoNikgPT09ICc6J1xuICAgICAgICAgID8gdGhpcy5tYW5nbGUoY2FwWzFdLnN1YnN0cmluZyg3KSlcbiAgICAgICAgICA6IHRoaXMubWFuZ2xlKGNhcFsxXSk7XG4gICAgICAgIGhyZWYgPSB0aGlzLm1hbmdsZSgnbWFpbHRvOicpICsgdGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzFdKTtcbiAgICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICB9XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIG51bGwsIHRleHQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdXJsIChnZm0pXG4gICAgaWYgKCF0aGlzLmluTGluayAmJiAoY2FwID0gdGhpcy5ydWxlcy51cmwuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzFdKTtcbiAgICAgIGhyZWYgPSB0ZXh0O1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIubGluayhocmVmLCBudWxsLCB0ZXh0KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRhZy5leGVjKHNyYykpIHtcbiAgICAgIGlmICghdGhpcy5pbkxpbmsgJiYgL148YSAvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmluTGluayAmJiAvXjxcXC9hPi9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmluTGluayA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLm9wdGlvbnMuc2FuaXRpemVcbiAgICAgICAgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyXG4gICAgICAgICAgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyKGNhcFswXSlcbiAgICAgICAgICA6IGVzY2FwZShjYXBbMF0pXG4gICAgICAgIDogY2FwWzBdXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsaW5rXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGluay5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICBvdXQgKz0gdGhpcy5vdXRwdXRMaW5rKGNhcCwge1xuICAgICAgICBocmVmOiBjYXBbMl0sXG4gICAgICAgIHRpdGxlOiBjYXBbM11cbiAgICAgIH0pO1xuICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHJlZmxpbmssIG5vbGlua1xuICAgIGlmICgoY2FwID0gdGhpcy5ydWxlcy5yZWZsaW5rLmV4ZWMoc3JjKSlcbiAgICAgICAgfHwgKGNhcCA9IHRoaXMucnVsZXMubm9saW5rLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBsaW5rID0gKGNhcFsyXSB8fCBjYXBbMV0pLnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgICAgIGxpbmsgPSB0aGlzLmxpbmtzW2xpbmsudG9Mb3dlckNhc2UoKV07XG4gICAgICBpZiAoIWxpbmsgfHwgIWxpbmsuaHJlZikge1xuICAgICAgICBvdXQgKz0gY2FwWzBdLmNoYXJBdCgwKTtcbiAgICAgICAgc3JjID0gY2FwWzBdLnN1YnN0cmluZygxKSArIHNyYztcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICBvdXQgKz0gdGhpcy5vdXRwdXRMaW5rKGNhcCwgbGluayk7XG4gICAgICB0aGlzLmluTGluayA9IGZhbHNlO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gc3Ryb25nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuc3Ryb25nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnN0cm9uZyh0aGlzLm91dHB1dChjYXBbMl0gfHwgY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBlbVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmVtLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmVtKHRoaXMub3V0cHV0KGNhcFsyXSB8fCBjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGNvZGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5jb2RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmNvZGVzcGFuKGVzY2FwZShjYXBbMl0sIHRydWUpKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGJyXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuYnIuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuYnIoKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGRlbCAoZ2ZtKVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmRlbC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5kZWwodGhpcy5vdXRwdXQoY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0ZXh0XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGV4dC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci50ZXh0KGVzY2FwZSh0aGlzLnNtYXJ0eXBhbnRzKGNhcFswXSkpKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChzcmMpIHtcbiAgICAgIHRocm93IG5ld1xuICAgICAgICBFcnJvcignSW5maW5pdGUgbG9vcCBvbiBieXRlOiAnICsgc3JjLmNoYXJDb2RlQXQoMCkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvbXBpbGUgTGlua1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5vdXRwdXRMaW5rID0gZnVuY3Rpb24oY2FwLCBsaW5rKSB7XG4gIHZhciBocmVmID0gZXNjYXBlKGxpbmsuaHJlZilcbiAgICAsIHRpdGxlID0gbGluay50aXRsZSA/IGVzY2FwZShsaW5rLnRpdGxlKSA6IG51bGw7XG5cbiAgcmV0dXJuIGNhcFswXS5jaGFyQXQoMCkgIT09ICchJ1xuICAgID8gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIHRpdGxlLCB0aGlzLm91dHB1dChjYXBbMV0pKVxuICAgIDogdGhpcy5yZW5kZXJlci5pbWFnZShocmVmLCB0aXRsZSwgZXNjYXBlKGNhcFsxXSkpO1xufTtcblxuLyoqXG4gKiBTbWFydHlwYW50cyBUcmFuc2Zvcm1hdGlvbnNcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUuc21hcnR5cGFudHMgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIGlmICghdGhpcy5vcHRpb25zLnNtYXJ0eXBhbnRzKSByZXR1cm4gdGV4dDtcbiAgcmV0dXJuIHRleHRcbiAgICAvLyBlbS1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0tL2csICdcXHUyMDE0JylcbiAgICAvLyBlbi1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0vZywgJ1xcdTIwMTMnKVxuICAgIC8vIG9wZW5pbmcgc2luZ2xlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcIlxcc10pJy9nLCAnJDFcXHUyMDE4JylcbiAgICAvLyBjbG9zaW5nIHNpbmdsZXMgJiBhcG9zdHJvcGhlc1xuICAgIC5yZXBsYWNlKC8nL2csICdcXHUyMDE5JylcbiAgICAvLyBvcGVuaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvKF58Wy1cXHUyMDE0LyhcXFt7XFx1MjAxOFxcc10pXCIvZywgJyQxXFx1MjAxYycpXG4gICAgLy8gY2xvc2luZyBkb3VibGVzXG4gICAgLnJlcGxhY2UoL1wiL2csICdcXHUyMDFkJylcbiAgICAvLyBlbGxpcHNlc1xuICAgIC5yZXBsYWNlKC9cXC57M30vZywgJ1xcdTIwMjYnKTtcbn07XG5cbi8qKlxuICogTWFuZ2xlIExpbmtzXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm1hbmdsZSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgaWYgKCF0aGlzLm9wdGlvbnMubWFuZ2xlKSByZXR1cm4gdGV4dDtcbiAgdmFyIG91dCA9ICcnXG4gICAgLCBsID0gdGV4dC5sZW5ndGhcbiAgICAsIGkgPSAwXG4gICAgLCBjaDtcblxuICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgIGNoID0gdGV4dC5jaGFyQ29kZUF0KGkpO1xuICAgIGlmIChNYXRoLnJhbmRvbSgpID4gMC41KSB7XG4gICAgICBjaCA9ICd4JyArIGNoLnRvU3RyaW5nKDE2KTtcbiAgICB9XG4gICAgb3V0ICs9ICcmIycgKyBjaCArICc7JztcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJlbmRlcmVyXG4gKi9cblxuZnVuY3Rpb24gUmVuZGVyZXIob3B0aW9ucykge1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xufVxuXG5SZW5kZXJlci5wcm90b3R5cGUuY29kZSA9IGZ1bmN0aW9uKGNvZGUsIGxhbmcsIGVzY2FwZWQpIHtcbiAgaWYgKHRoaXMub3B0aW9ucy5oaWdobGlnaHQpIHtcbiAgICB2YXIgb3V0ID0gdGhpcy5vcHRpb25zLmhpZ2hsaWdodChjb2RlLCBsYW5nKTtcbiAgICBpZiAob3V0ICE9IG51bGwgJiYgb3V0ICE9PSBjb2RlKSB7XG4gICAgICBlc2NhcGVkID0gdHJ1ZTtcbiAgICAgIGNvZGUgPSBvdXQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFsYW5nKSB7XG4gICAgcmV0dXJuICc8cHJlPjxjb2RlPidcbiAgICAgICsgKGVzY2FwZWQgPyBjb2RlIDogZXNjYXBlKGNvZGUsIHRydWUpKVxuICAgICAgKyAnXFxuPC9jb2RlPjwvcHJlPic7XG4gIH1cblxuICByZXR1cm4gJzxwcmU+PGNvZGUgY2xhc3M9XCInXG4gICAgKyB0aGlzLm9wdGlvbnMubGFuZ1ByZWZpeFxuICAgICsgZXNjYXBlKGxhbmcsIHRydWUpXG4gICAgKyAnXCI+J1xuICAgICsgKGVzY2FwZWQgPyBjb2RlIDogZXNjYXBlKGNvZGUsIHRydWUpKVxuICAgICsgJ1xcbjwvY29kZT48L3ByZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmJsb2NrcXVvdGUgPSBmdW5jdGlvbihxdW90ZSkge1xuICByZXR1cm4gJzxibG9ja3F1b3RlPlxcbicgKyBxdW90ZSArICc8L2Jsb2NrcXVvdGU+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5odG1sID0gZnVuY3Rpb24oaHRtbCkge1xuICByZXR1cm4gaHRtbDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5oZWFkaW5nID0gZnVuY3Rpb24odGV4dCwgbGV2ZWwsIHJhdykge1xuICByZXR1cm4gJzxoJ1xuICAgICsgbGV2ZWxcbiAgICArICcgaWQ9XCInXG4gICAgKyB0aGlzLm9wdGlvbnMuaGVhZGVyUHJlZml4XG4gICAgKyByYXcudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXlxcd10rL2csICctJylcbiAgICArICdcIj4nXG4gICAgKyB0ZXh0XG4gICAgKyAnPC9oJ1xuICAgICsgbGV2ZWxcbiAgICArICc+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5ociA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5vcHRpb25zLnhodG1sID8gJzxoci8+XFxuJyA6ICc8aHI+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5saXN0ID0gZnVuY3Rpb24oYm9keSwgb3JkZXJlZCkge1xuICB2YXIgdHlwZSA9IG9yZGVyZWQgPyAnb2wnIDogJ3VsJztcbiAgcmV0dXJuICc8JyArIHR5cGUgKyAnPlxcbicgKyBib2R5ICsgJzwvJyArIHR5cGUgKyAnPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGlzdGl0ZW0gPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGxpPicgKyB0ZXh0ICsgJzwvbGk+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5wYXJhZ3JhcGggPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPHA+JyArIHRleHQgKyAnPC9wPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGUgPSBmdW5jdGlvbihoZWFkZXIsIGJvZHkpIHtcbiAgcmV0dXJuICc8dGFibGU+XFxuJ1xuICAgICsgJzx0aGVhZD5cXG4nXG4gICAgKyBoZWFkZXJcbiAgICArICc8L3RoZWFkPlxcbidcbiAgICArICc8dGJvZHk+XFxuJ1xuICAgICsgYm9keVxuICAgICsgJzwvdGJvZHk+XFxuJ1xuICAgICsgJzwvdGFibGU+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZXJvdyA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgcmV0dXJuICc8dHI+XFxuJyArIGNvbnRlbnQgKyAnPC90cj5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlY2VsbCA9IGZ1bmN0aW9uKGNvbnRlbnQsIGZsYWdzKSB7XG4gIHZhciB0eXBlID0gZmxhZ3MuaGVhZGVyID8gJ3RoJyA6ICd0ZCc7XG4gIHZhciB0YWcgPSBmbGFncy5hbGlnblxuICAgID8gJzwnICsgdHlwZSArICcgc3R5bGU9XCJ0ZXh0LWFsaWduOicgKyBmbGFncy5hbGlnbiArICdcIj4nXG4gICAgOiAnPCcgKyB0eXBlICsgJz4nO1xuICByZXR1cm4gdGFnICsgY29udGVudCArICc8LycgKyB0eXBlICsgJz5cXG4nO1xufTtcblxuLy8gc3BhbiBsZXZlbCByZW5kZXJlclxuUmVuZGVyZXIucHJvdG90eXBlLnN0cm9uZyA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8c3Ryb25nPicgKyB0ZXh0ICsgJzwvc3Ryb25nPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuZW0gPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGVtPicgKyB0ZXh0ICsgJzwvZW0+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5jb2Rlc3BhbiA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8Y29kZT4nICsgdGV4dCArICc8L2NvZGU+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5iciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5vcHRpb25zLnhodG1sID8gJzxici8+JyA6ICc8YnI+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5kZWwgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGRlbD4nICsgdGV4dCArICc8L2RlbD4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpbmsgPSBmdW5jdGlvbihocmVmLCB0aXRsZSwgdGV4dCkge1xuICBpZiAodGhpcy5vcHRpb25zLnNhbml0aXplKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBwcm90ID0gZGVjb2RlVVJJQ29tcG9uZW50KHVuZXNjYXBlKGhyZWYpKVxuICAgICAgICAucmVwbGFjZSgvW15cXHc6XS9nLCAnJylcbiAgICAgICAgLnRvTG93ZXJDYXNlKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBpZiAocHJvdC5pbmRleE9mKCdqYXZhc2NyaXB0OicpID09PSAwIHx8IHByb3QuaW5kZXhPZigndmJzY3JpcHQ6JykgPT09IDApIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH1cbiAgdmFyIG91dCA9ICc8YSBocmVmPVwiJyArIGhyZWYgKyAnXCInO1xuICBpZiAodGl0bGUpIHtcbiAgICBvdXQgKz0gJyB0aXRsZT1cIicgKyB0aXRsZSArICdcIic7XG4gIH1cbiAgb3V0ICs9ICc+JyArIHRleHQgKyAnPC9hPic7XG4gIHJldHVybiBvdXQ7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaW1hZ2UgPSBmdW5jdGlvbihocmVmLCB0aXRsZSwgdGV4dCkge1xuICB2YXIgb3V0ID0gJzxpbWcgc3JjPVwiJyArIGhyZWYgKyAnXCIgYWx0PVwiJyArIHRleHQgKyAnXCInO1xuICBpZiAodGl0bGUpIHtcbiAgICBvdXQgKz0gJyB0aXRsZT1cIicgKyB0aXRsZSArICdcIic7XG4gIH1cbiAgb3V0ICs9IHRoaXMub3B0aW9ucy54aHRtbCA/ICcvPicgOiAnPic7XG4gIHJldHVybiBvdXQ7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGV4dCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuIHRleHQ7XG59O1xuXG4vKipcbiAqIFBhcnNpbmcgJiBDb21waWxpbmdcbiAqL1xuXG5mdW5jdGlvbiBQYXJzZXIob3B0aW9ucykge1xuICB0aGlzLnRva2VucyA9IFtdO1xuICB0aGlzLnRva2VuID0gbnVsbDtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMub3B0aW9ucy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbn1cblxuLyoqXG4gKiBTdGF0aWMgUGFyc2UgTWV0aG9kXG4gKi9cblxuUGFyc2VyLnBhcnNlID0gZnVuY3Rpb24oc3JjLCBvcHRpb25zLCByZW5kZXJlcikge1xuICB2YXIgcGFyc2VyID0gbmV3IFBhcnNlcihvcHRpb25zLCByZW5kZXJlcik7XG4gIHJldHVybiBwYXJzZXIucGFyc2Uoc3JjKTtcbn07XG5cbi8qKlxuICogUGFyc2UgTG9vcFxuICovXG5cblBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihzcmMpIHtcbiAgdGhpcy5pbmxpbmUgPSBuZXcgSW5saW5lTGV4ZXIoc3JjLmxpbmtzLCB0aGlzLm9wdGlvbnMsIHRoaXMucmVuZGVyZXIpO1xuICB0aGlzLnRva2VucyA9IHNyYy5yZXZlcnNlKCk7XG5cbiAgdmFyIG91dCA9ICcnO1xuICB3aGlsZSAodGhpcy5uZXh0KCkpIHtcbiAgICBvdXQgKz0gdGhpcy50b2soKTtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIE5leHQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudG9rZW4gPSB0aGlzLnRva2Vucy5wb3AoKTtcbn07XG5cbi8qKlxuICogUHJldmlldyBOZXh0IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLnRva2Vucy5sZW5ndGggLSAxXSB8fCAwO1xufTtcblxuLyoqXG4gKiBQYXJzZSBUZXh0IFRva2Vuc1xuICovXG5cblBhcnNlci5wcm90b3R5cGUucGFyc2VUZXh0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBib2R5ID0gdGhpcy50b2tlbi50ZXh0O1xuXG4gIHdoaWxlICh0aGlzLnBlZWsoKS50eXBlID09PSAndGV4dCcpIHtcbiAgICBib2R5ICs9ICdcXG4nICsgdGhpcy5uZXh0KCkudGV4dDtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmlubGluZS5vdXRwdXQoYm9keSk7XG59O1xuXG4vKipcbiAqIFBhcnNlIEN1cnJlbnQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnRvayA9IGZ1bmN0aW9uKCkge1xuICBzd2l0Y2ggKHRoaXMudG9rZW4udHlwZSkge1xuICAgIGNhc2UgJ3NwYWNlJzoge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBjYXNlICdocic6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmhyKCk7XG4gICAgfVxuICAgIGNhc2UgJ2hlYWRpbmcnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5oZWFkaW5nKFxuICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi50ZXh0KSxcbiAgICAgICAgdGhpcy50b2tlbi5kZXB0aCxcbiAgICAgICAgdGhpcy50b2tlbi50ZXh0KTtcbiAgICB9XG4gICAgY2FzZSAnY29kZSc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmNvZGUodGhpcy50b2tlbi50ZXh0LFxuICAgICAgICB0aGlzLnRva2VuLmxhbmcsXG4gICAgICAgIHRoaXMudG9rZW4uZXNjYXBlZCk7XG4gICAgfVxuICAgIGNhc2UgJ3RhYmxlJzoge1xuICAgICAgdmFyIGhlYWRlciA9ICcnXG4gICAgICAgICwgYm9keSA9ICcnXG4gICAgICAgICwgaVxuICAgICAgICAsIHJvd1xuICAgICAgICAsIGNlbGxcbiAgICAgICAgLCBmbGFnc1xuICAgICAgICAsIGo7XG5cbiAgICAgIC8vIGhlYWRlclxuICAgICAgY2VsbCA9ICcnO1xuICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMudG9rZW4uaGVhZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZsYWdzID0geyBoZWFkZXI6IHRydWUsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2ldIH07XG4gICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4uaGVhZGVyW2ldKSxcbiAgICAgICAgICB7IGhlYWRlcjogdHJ1ZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25baV0gfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaGVhZGVyICs9IHRoaXMucmVuZGVyZXIudGFibGVyb3coY2VsbCk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnRva2VuLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJvdyA9IHRoaXMudG9rZW4uY2VsbHNbaV07XG5cbiAgICAgICAgY2VsbCA9ICcnO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgcm93Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY2VsbCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlY2VsbChcbiAgICAgICAgICAgIHRoaXMuaW5saW5lLm91dHB1dChyb3dbal0pLFxuICAgICAgICAgICAgeyBoZWFkZXI6IGZhbHNlLCBhbGlnbjogdGhpcy50b2tlbi5hbGlnbltqXSB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJvZHkgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnRhYmxlKGhlYWRlciwgYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2Jsb2NrcXVvdGVfc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2Jsb2NrcXVvdGVfZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmJsb2NrcXVvdGUoYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2xpc3Rfc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnXG4gICAgICAgICwgb3JkZXJlZCA9IHRoaXMudG9rZW4ub3JkZXJlZDtcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5saXN0KGJvZHksIG9yZGVyZWQpO1xuICAgIH1cbiAgICBjYXNlICdsaXN0X2l0ZW1fc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfaXRlbV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2tlbi50eXBlID09PSAndGV4dCdcbiAgICAgICAgICA/IHRoaXMucGFyc2VUZXh0KClcbiAgICAgICAgICA6IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdsb29zZV9pdGVtX3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJztcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2l0ZW1fZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdodG1sJzoge1xuICAgICAgdmFyIGh0bWwgPSAhdGhpcy50b2tlbi5wcmUgJiYgIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICA/IHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpXG4gICAgICAgIDogdGhpcy50b2tlbi50ZXh0O1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaHRtbChodG1sKTtcbiAgICB9XG4gICAgY2FzZSAncGFyYWdyYXBoJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpKTtcbiAgICB9XG4gICAgY2FzZSAndGV4dCc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnBhcmFncmFwaCh0aGlzLnBhcnNlVGV4dCgpKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogSGVscGVyc1xuICovXG5cbmZ1bmN0aW9uIGVzY2FwZShodG1sLCBlbmNvZGUpIHtcbiAgcmV0dXJuIGh0bWxcbiAgICAucmVwbGFjZSghZW5jb2RlID8gLyYoPyEjP1xcdys7KS9nIDogLyYvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAucmVwbGFjZSgvJy9nLCAnJiMzOTsnKTtcbn1cblxuZnVuY3Rpb24gdW5lc2NhcGUoaHRtbCkge1xuXHQvLyBleHBsaWNpdGx5IG1hdGNoIGRlY2ltYWwsIGhleCwgYW5kIG5hbWVkIEhUTUwgZW50aXRpZXMgXG4gIHJldHVybiBodG1sLnJlcGxhY2UoLyYoIyg/OlxcZCspfCg/OiN4WzAtOUEtRmEtZl0rKXwoPzpcXHcrKSk7Py9nLCBmdW5jdGlvbihfLCBuKSB7XG4gICAgbiA9IG4udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAobiA9PT0gJ2NvbG9uJykgcmV0dXJuICc6JztcbiAgICBpZiAobi5jaGFyQXQoMCkgPT09ICcjJykge1xuICAgICAgcmV0dXJuIG4uY2hhckF0KDEpID09PSAneCdcbiAgICAgICAgPyBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KG4uc3Vic3RyaW5nKDIpLCAxNikpXG4gICAgICAgIDogU3RyaW5nLmZyb21DaGFyQ29kZSgrbi5zdWJzdHJpbmcoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlKHJlZ2V4LCBvcHQpIHtcbiAgcmVnZXggPSByZWdleC5zb3VyY2U7XG4gIG9wdCA9IG9wdCB8fCAnJztcbiAgcmV0dXJuIGZ1bmN0aW9uIHNlbGYobmFtZSwgdmFsKSB7XG4gICAgaWYgKCFuYW1lKSByZXR1cm4gbmV3IFJlZ0V4cChyZWdleCwgb3B0KTtcbiAgICB2YWwgPSB2YWwuc291cmNlIHx8IHZhbDtcbiAgICB2YWwgPSB2YWwucmVwbGFjZSgvKF58W15cXFtdKVxcXi9nLCAnJDEnKTtcbiAgICByZWdleCA9IHJlZ2V4LnJlcGxhY2UobmFtZSwgdmFsKTtcbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5ub29wLmV4ZWMgPSBub29wO1xuXG5mdW5jdGlvbiBtZXJnZShvYmopIHtcbiAgdmFyIGkgPSAxXG4gICAgLCB0YXJnZXRcbiAgICAsIGtleTtcblxuICBmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHRhcmdldCA9IGFyZ3VtZW50c1tpXTtcbiAgICBmb3IgKGtleSBpbiB0YXJnZXQpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGFyZ2V0LCBrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gdGFyZ2V0W2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuXG4vKipcbiAqIE1hcmtlZFxuICovXG5cbmZ1bmN0aW9uIG1hcmtlZChzcmMsIG9wdCwgY2FsbGJhY2spIHtcbiAgaWYgKGNhbGxiYWNrIHx8IHR5cGVvZiBvcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdDtcbiAgICAgIG9wdCA9IG51bGw7XG4gICAgfVxuXG4gICAgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0IHx8IHt9KTtcblxuICAgIHZhciBoaWdobGlnaHQgPSBvcHQuaGlnaGxpZ2h0XG4gICAgICAsIHRva2Vuc1xuICAgICAgLCBwZW5kaW5nXG4gICAgICAsIGkgPSAwO1xuXG4gICAgdHJ5IHtcbiAgICAgIHRva2VucyA9IExleGVyLmxleChzcmMsIG9wdClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZSk7XG4gICAgfVxuXG4gICAgcGVuZGluZyA9IHRva2Vucy5sZW5ndGg7XG5cbiAgICB2YXIgZG9uZSA9IGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBvcHQuaGlnaGxpZ2h0ID0gaGlnaGxpZ2h0O1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgIH1cblxuICAgICAgdmFyIG91dDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgb3V0ID0gUGFyc2VyLnBhcnNlKHRva2Vucywgb3B0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZXJyID0gZTtcbiAgICAgIH1cblxuICAgICAgb3B0LmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcblxuICAgICAgcmV0dXJuIGVyclxuICAgICAgICA/IGNhbGxiYWNrKGVycilcbiAgICAgICAgOiBjYWxsYmFjayhudWxsLCBvdXQpO1xuICAgIH07XG5cbiAgICBpZiAoIWhpZ2hsaWdodCB8fCBoaWdobGlnaHQubGVuZ3RoIDwgMykge1xuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9XG5cbiAgICBkZWxldGUgb3B0LmhpZ2hsaWdodDtcblxuICAgIGlmICghcGVuZGluZykgcmV0dXJuIGRvbmUoKTtcblxuICAgIGZvciAoOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAoZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgIT09ICdjb2RlJykge1xuICAgICAgICAgIHJldHVybiAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoaWdobGlnaHQodG9rZW4udGV4dCwgdG9rZW4ubGFuZywgZnVuY3Rpb24oZXJyLCBjb2RlKSB7XG4gICAgICAgICAgaWYgKGVycikgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgICBpZiAoY29kZSA9PSBudWxsIHx8IGNvZGUgPT09IHRva2VuLnRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0b2tlbi50ZXh0ID0gY29kZTtcbiAgICAgICAgICB0b2tlbi5lc2NhcGVkID0gdHJ1ZTtcbiAgICAgICAgICAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pKHRva2Vuc1tpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG4gIHRyeSB7XG4gICAgaWYgKG9wdCkgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0KTtcbiAgICByZXR1cm4gUGFyc2VyLnBhcnNlKExleGVyLmxleChzcmMsIG9wdCksIG9wdCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlLm1lc3NhZ2UgKz0gJ1xcblBsZWFzZSByZXBvcnQgdGhpcyB0byBodHRwczovL2dpdGh1Yi5jb20vY2hqai9tYXJrZWQuJztcbiAgICBpZiAoKG9wdCB8fCBtYXJrZWQuZGVmYXVsdHMpLnNpbGVudCkge1xuICAgICAgcmV0dXJuICc8cD5BbiBlcnJvciBvY2N1cmVkOjwvcD48cHJlPidcbiAgICAgICAgKyBlc2NhcGUoZS5tZXNzYWdlICsgJycsIHRydWUpXG4gICAgICAgICsgJzwvcHJlPic7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbn1cblxuLyoqXG4gKiBPcHRpb25zXG4gKi9cblxubWFya2VkLm9wdGlvbnMgPVxubWFya2VkLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHQpIHtcbiAgbWVyZ2UobWFya2VkLmRlZmF1bHRzLCBvcHQpO1xuICByZXR1cm4gbWFya2VkO1xufTtcblxubWFya2VkLmRlZmF1bHRzID0ge1xuICBnZm06IHRydWUsXG4gIHRhYmxlczogdHJ1ZSxcbiAgYnJlYWtzOiBmYWxzZSxcbiAgcGVkYW50aWM6IGZhbHNlLFxuICBzYW5pdGl6ZTogZmFsc2UsXG4gIHNhbml0aXplcjogbnVsbCxcbiAgbWFuZ2xlOiB0cnVlLFxuICBzbWFydExpc3RzOiBmYWxzZSxcbiAgc2lsZW50OiBmYWxzZSxcbiAgaGlnaGxpZ2h0OiBudWxsLFxuICBsYW5nUHJlZml4OiAnbGFuZy0nLFxuICBzbWFydHlwYW50czogZmFsc2UsXG4gIGhlYWRlclByZWZpeDogJycsXG4gIHJlbmRlcmVyOiBuZXcgUmVuZGVyZXIsXG4gIHhodG1sOiBmYWxzZVxufTtcblxuLyoqXG4gKiBFeHBvc2VcbiAqL1xuXG5tYXJrZWQuUGFyc2VyID0gUGFyc2VyO1xubWFya2VkLnBhcnNlciA9IFBhcnNlci5wYXJzZTtcblxubWFya2VkLlJlbmRlcmVyID0gUmVuZGVyZXI7XG5cbm1hcmtlZC5MZXhlciA9IExleGVyO1xubWFya2VkLmxleGVyID0gTGV4ZXIubGV4O1xuXG5tYXJrZWQuSW5saW5lTGV4ZXIgPSBJbmxpbmVMZXhlcjtcbm1hcmtlZC5pbmxpbmVMZXhlciA9IElubGluZUxleGVyLm91dHB1dDtcblxubWFya2VkLnBhcnNlID0gbWFya2VkO1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gbWFya2VkO1xufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gbWFya2VkOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMubWFya2VkID0gbWFya2VkO1xufVxuXG59KS5jYWxsKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcyB8fCAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWwpO1xufSgpKTtcbiIsIjsoZnVuY3Rpb24oKSB7XG5cInVzZSBzdHJpY3RcIlxuZnVuY3Rpb24gVm5vZGUodGFnLCBrZXksIGF0dHJzMCwgY2hpbGRyZW4sIHRleHQsIGRvbSkge1xuXHRyZXR1cm4ge3RhZzogdGFnLCBrZXk6IGtleSwgYXR0cnM6IGF0dHJzMCwgY2hpbGRyZW46IGNoaWxkcmVuLCB0ZXh0OiB0ZXh0LCBkb206IGRvbSwgZG9tU2l6ZTogdW5kZWZpbmVkLCBzdGF0ZTogdW5kZWZpbmVkLCBfc3RhdGU6IHVuZGVmaW5lZCwgZXZlbnRzOiB1bmRlZmluZWQsIGluc3RhbmNlOiB1bmRlZmluZWQsIHNraXA6IGZhbHNlfVxufVxuVm5vZGUubm9ybWFsaXplID0gZnVuY3Rpb24obm9kZSkge1xuXHRpZiAoQXJyYXkuaXNBcnJheShub2RlKSkgcmV0dXJuIFZub2RlKFwiW1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgVm5vZGUubm9ybWFsaXplQ2hpbGRyZW4obm9kZSksIHVuZGVmaW5lZCwgdW5kZWZpbmVkKVxuXHRpZiAobm9kZSAhPSBudWxsICYmIHR5cGVvZiBub2RlICE9PSBcIm9iamVjdFwiKSByZXR1cm4gVm5vZGUoXCIjXCIsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBub2RlID09PSBmYWxzZSA/IFwiXCIgOiBub2RlLCB1bmRlZmluZWQsIHVuZGVmaW5lZClcblx0cmV0dXJuIG5vZGVcbn1cblZub2RlLm5vcm1hbGl6ZUNoaWxkcmVuID0gZnVuY3Rpb24gbm9ybWFsaXplQ2hpbGRyZW4oY2hpbGRyZW4pIHtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuXHRcdGNoaWxkcmVuW2ldID0gVm5vZGUubm9ybWFsaXplKGNoaWxkcmVuW2ldKVxuXHR9XG5cdHJldHVybiBjaGlsZHJlblxufVxudmFyIHNlbGVjdG9yUGFyc2VyID0gLyg/OihefCN8XFwuKShbXiNcXC5cXFtcXF1dKykpfChcXFsoLis/KSg/Olxccyo9XFxzKihcInwnfCkoKD86XFxcXFtcIidcXF1dfC4pKj8pXFw1KT9cXF0pL2dcbnZhciBzZWxlY3RvckNhY2hlID0ge31cbnZhciBoYXNPd24gPSB7fS5oYXNPd25Qcm9wZXJ0eVxuZnVuY3Rpb24gY29tcGlsZVNlbGVjdG9yKHNlbGVjdG9yKSB7XG5cdHZhciBtYXRjaCwgdGFnID0gXCJkaXZcIiwgY2xhc3NlcyA9IFtdLCBhdHRycyA9IHt9XG5cdHdoaWxlIChtYXRjaCA9IHNlbGVjdG9yUGFyc2VyLmV4ZWMoc2VsZWN0b3IpKSB7XG5cdFx0dmFyIHR5cGUgPSBtYXRjaFsxXSwgdmFsdWUgPSBtYXRjaFsyXVxuXHRcdGlmICh0eXBlID09PSBcIlwiICYmIHZhbHVlICE9PSBcIlwiKSB0YWcgPSB2YWx1ZVxuXHRcdGVsc2UgaWYgKHR5cGUgPT09IFwiI1wiKSBhdHRycy5pZCA9IHZhbHVlXG5cdFx0ZWxzZSBpZiAodHlwZSA9PT0gXCIuXCIpIGNsYXNzZXMucHVzaCh2YWx1ZSlcblx0XHRlbHNlIGlmIChtYXRjaFszXVswXSA9PT0gXCJbXCIpIHtcblx0XHRcdHZhciBhdHRyVmFsdWUgPSBtYXRjaFs2XVxuXHRcdFx0aWYgKGF0dHJWYWx1ZSkgYXR0clZhbHVlID0gYXR0clZhbHVlLnJlcGxhY2UoL1xcXFwoW1wiJ10pL2csIFwiJDFcIikucmVwbGFjZSgvXFxcXFxcXFwvZywgXCJcXFxcXCIpXG5cdFx0XHRpZiAobWF0Y2hbNF0gPT09IFwiY2xhc3NcIikgY2xhc3Nlcy5wdXNoKGF0dHJWYWx1ZSlcblx0XHRcdGVsc2UgYXR0cnNbbWF0Y2hbNF1dID0gYXR0clZhbHVlID09PSBcIlwiID8gYXR0clZhbHVlIDogYXR0clZhbHVlIHx8IHRydWVcblx0XHR9XG5cdH1cblx0aWYgKGNsYXNzZXMubGVuZ3RoID4gMCkgYXR0cnMuY2xhc3NOYW1lID0gY2xhc3Nlcy5qb2luKFwiIFwiKVxuXHRyZXR1cm4gc2VsZWN0b3JDYWNoZVtzZWxlY3Rvcl0gPSB7dGFnOiB0YWcsIGF0dHJzOiBhdHRyc31cbn1cbmZ1bmN0aW9uIGV4ZWNTZWxlY3RvcihzdGF0ZSwgYXR0cnMsIGNoaWxkcmVuKSB7XG5cdHZhciBoYXNBdHRycyA9IGZhbHNlLCBjaGlsZExpc3QsIHRleHRcblx0dmFyIGNsYXNzTmFtZSA9IGF0dHJzLmNsYXNzTmFtZSB8fCBhdHRycy5jbGFzc1xuXHRmb3IgKHZhciBrZXkgaW4gc3RhdGUuYXR0cnMpIHtcblx0XHRpZiAoaGFzT3duLmNhbGwoc3RhdGUuYXR0cnMsIGtleSkpIHtcblx0XHRcdGF0dHJzW2tleV0gPSBzdGF0ZS5hdHRyc1trZXldXG5cdFx0fVxuXHR9XG5cdGlmIChjbGFzc05hbWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChhdHRycy5jbGFzcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRhdHRycy5jbGFzcyA9IHVuZGVmaW5lZFxuXHRcdFx0YXR0cnMuY2xhc3NOYW1lID0gY2xhc3NOYW1lXG5cdFx0fVxuXHRcdGlmIChzdGF0ZS5hdHRycy5jbGFzc05hbWUgIT0gbnVsbCkge1xuXHRcdFx0YXR0cnMuY2xhc3NOYW1lID0gc3RhdGUuYXR0cnMuY2xhc3NOYW1lICsgXCIgXCIgKyBjbGFzc05hbWVcblx0XHR9XG5cdH1cblx0Zm9yICh2YXIga2V5IGluIGF0dHJzKSB7XG5cdFx0aWYgKGhhc093bi5jYWxsKGF0dHJzLCBrZXkpICYmIGtleSAhPT0gXCJrZXlcIikge1xuXHRcdFx0aGFzQXR0cnMgPSB0cnVlXG5cdFx0XHRicmVha1xuXHRcdH1cblx0fVxuXHRpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbikgJiYgY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmIGNoaWxkcmVuWzBdICE9IG51bGwgJiYgY2hpbGRyZW5bMF0udGFnID09PSBcIiNcIikge1xuXHRcdHRleHQgPSBjaGlsZHJlblswXS5jaGlsZHJlblxuXHR9IGVsc2Uge1xuXHRcdGNoaWxkTGlzdCA9IGNoaWxkcmVuXG5cdH1cblx0cmV0dXJuIFZub2RlKHN0YXRlLnRhZywgYXR0cnMua2V5LCBoYXNBdHRycyA/IGF0dHJzIDogdW5kZWZpbmVkLCBjaGlsZExpc3QsIHRleHQpXG59XG5mdW5jdGlvbiBoeXBlcnNjcmlwdChzZWxlY3Rvcikge1xuXHQvLyBCZWNhdXNlIHNsb3BweSBtb2RlIHN1Y2tzXG5cdHZhciBhdHRycyA9IGFyZ3VtZW50c1sxXSwgc3RhcnQgPSAyLCBjaGlsZHJlblxuXHRpZiAoc2VsZWN0b3IgPT0gbnVsbCB8fCB0eXBlb2Ygc2VsZWN0b3IgIT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHNlbGVjdG9yICE9PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIHNlbGVjdG9yLnZpZXcgIT09IFwiZnVuY3Rpb25cIikge1xuXHRcdHRocm93IEVycm9yKFwiVGhlIHNlbGVjdG9yIG11c3QgYmUgZWl0aGVyIGEgc3RyaW5nIG9yIGEgY29tcG9uZW50LlwiKTtcblx0fVxuXHRpZiAodHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiKSB7XG5cdFx0dmFyIGNhY2hlZCA9IHNlbGVjdG9yQ2FjaGVbc2VsZWN0b3JdIHx8IGNvbXBpbGVTZWxlY3RvcihzZWxlY3Rvcilcblx0fVxuXHRpZiAoYXR0cnMgPT0gbnVsbCkge1xuXHRcdGF0dHJzID0ge31cblx0fSBlbHNlIGlmICh0eXBlb2YgYXR0cnMgIT09IFwib2JqZWN0XCIgfHwgYXR0cnMudGFnICE9IG51bGwgfHwgQXJyYXkuaXNBcnJheShhdHRycykpIHtcblx0XHRhdHRycyA9IHt9XG5cdFx0c3RhcnQgPSAxXG5cdH1cblx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IHN0YXJ0ICsgMSkge1xuXHRcdGNoaWxkcmVuID0gYXJndW1lbnRzW3N0YXJ0XVxuXHRcdGlmICghQXJyYXkuaXNBcnJheShjaGlsZHJlbikpIGNoaWxkcmVuID0gW2NoaWxkcmVuXVxuXHR9IGVsc2Uge1xuXHRcdGNoaWxkcmVuID0gW11cblx0XHR3aGlsZSAoc3RhcnQgPCBhcmd1bWVudHMubGVuZ3RoKSBjaGlsZHJlbi5wdXNoKGFyZ3VtZW50c1tzdGFydCsrXSlcblx0fVxuXHR2YXIgbm9ybWFsaXplZCA9IFZub2RlLm5vcm1hbGl6ZUNoaWxkcmVuKGNoaWxkcmVuKVxuXHRpZiAodHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiKSB7XG5cdFx0cmV0dXJuIGV4ZWNTZWxlY3RvcihjYWNoZWQsIGF0dHJzLCBub3JtYWxpemVkKVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBWbm9kZShzZWxlY3RvciwgYXR0cnMua2V5LCBhdHRycywgbm9ybWFsaXplZClcblx0fVxufVxuaHlwZXJzY3JpcHQudHJ1c3QgPSBmdW5jdGlvbihodG1sKSB7XG5cdGlmIChodG1sID09IG51bGwpIGh0bWwgPSBcIlwiXG5cdHJldHVybiBWbm9kZShcIjxcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGh0bWwsIHVuZGVmaW5lZCwgdW5kZWZpbmVkKVxufVxuaHlwZXJzY3JpcHQuZnJhZ21lbnQgPSBmdW5jdGlvbihhdHRyczEsIGNoaWxkcmVuKSB7XG5cdHJldHVybiBWbm9kZShcIltcIiwgYXR0cnMxLmtleSwgYXR0cnMxLCBWbm9kZS5ub3JtYWxpemVDaGlsZHJlbihjaGlsZHJlbiksIHVuZGVmaW5lZCwgdW5kZWZpbmVkKVxufVxudmFyIG0gPSBoeXBlcnNjcmlwdFxuLyoqIEBjb25zdHJ1Y3RvciAqL1xudmFyIFByb21pc2VQb2x5ZmlsbCA9IGZ1bmN0aW9uKGV4ZWN1dG9yKSB7XG5cdGlmICghKHRoaXMgaW5zdGFuY2VvZiBQcm9taXNlUG9seWZpbGwpKSB0aHJvdyBuZXcgRXJyb3IoXCJQcm9taXNlIG11c3QgYmUgY2FsbGVkIHdpdGggYG5ld2BcIilcblx0aWYgKHR5cGVvZiBleGVjdXRvciAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpXG5cdHZhciBzZWxmID0gdGhpcywgcmVzb2x2ZXJzID0gW10sIHJlamVjdG9ycyA9IFtdLCByZXNvbHZlQ3VycmVudCA9IGhhbmRsZXIocmVzb2x2ZXJzLCB0cnVlKSwgcmVqZWN0Q3VycmVudCA9IGhhbmRsZXIocmVqZWN0b3JzLCBmYWxzZSlcblx0dmFyIGluc3RhbmNlID0gc2VsZi5faW5zdGFuY2UgPSB7cmVzb2x2ZXJzOiByZXNvbHZlcnMsIHJlamVjdG9yczogcmVqZWN0b3JzfVxuXHR2YXIgY2FsbEFzeW5jID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gc2V0SW1tZWRpYXRlIDogc2V0VGltZW91dFxuXHRmdW5jdGlvbiBoYW5kbGVyKGxpc3QsIHNob3VsZEFic29yYikge1xuXHRcdHJldHVybiBmdW5jdGlvbiBleGVjdXRlKHZhbHVlKSB7XG5cdFx0XHR2YXIgdGhlblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKHNob3VsZEFic29yYiAmJiB2YWx1ZSAhPSBudWxsICYmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpICYmIHR5cGVvZiAodGhlbiA9IHZhbHVlLnRoZW4pID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHRpZiAodmFsdWUgPT09IHNlbGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcm9taXNlIGNhbid0IGJlIHJlc29sdmVkIHcvIGl0c2VsZlwiKVxuXHRcdFx0XHRcdGV4ZWN1dGVPbmNlKHRoZW4uYmluZCh2YWx1ZSkpXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y2FsbEFzeW5jKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKCFzaG91bGRBYnNvcmIgJiYgbGlzdC5sZW5ndGggPT09IDApIGNvbnNvbGUuZXJyb3IoXCJQb3NzaWJsZSB1bmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb246XCIsIHZhbHVlKVxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSBsaXN0W2ldKHZhbHVlKVxuXHRcdFx0XHRcdFx0cmVzb2x2ZXJzLmxlbmd0aCA9IDAsIHJlamVjdG9ycy5sZW5ndGggPSAwXG5cdFx0XHRcdFx0XHRpbnN0YW5jZS5zdGF0ZSA9IHNob3VsZEFic29yYlxuXHRcdFx0XHRcdFx0aW5zdGFuY2UucmV0cnkgPSBmdW5jdGlvbigpIHtleGVjdXRlKHZhbHVlKX1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZSkge1xuXHRcdFx0XHRyZWplY3RDdXJyZW50KGUpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIGV4ZWN1dGVPbmNlKHRoZW4pIHtcblx0XHR2YXIgcnVucyA9IDBcblx0XHRmdW5jdGlvbiBydW4oZm4pIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0XHRpZiAocnVucysrID4gMCkgcmV0dXJuXG5cdFx0XHRcdGZuKHZhbHVlKVxuXHRcdFx0fVxuXHRcdH1cblx0XHR2YXIgb25lcnJvciA9IHJ1bihyZWplY3RDdXJyZW50KVxuXHRcdHRyeSB7dGhlbihydW4ocmVzb2x2ZUN1cnJlbnQpLCBvbmVycm9yKX0gY2F0Y2ggKGUpIHtvbmVycm9yKGUpfVxuXHR9XG5cdGV4ZWN1dGVPbmNlKGV4ZWN1dG9yKVxufVxuUHJvbWlzZVBvbHlmaWxsLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24ob25GdWxmaWxsZWQsIG9uUmVqZWN0aW9uKSB7XG5cdHZhciBzZWxmID0gdGhpcywgaW5zdGFuY2UgPSBzZWxmLl9pbnN0YW5jZVxuXHRmdW5jdGlvbiBoYW5kbGUoY2FsbGJhY2ssIGxpc3QsIG5leHQsIHN0YXRlKSB7XG5cdFx0bGlzdC5wdXNoKGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIG5leHQodmFsdWUpXG5cdFx0XHRlbHNlIHRyeSB7cmVzb2x2ZU5leHQoY2FsbGJhY2sodmFsdWUpKX0gY2F0Y2ggKGUpIHtpZiAocmVqZWN0TmV4dCkgcmVqZWN0TmV4dChlKX1cblx0XHR9KVxuXHRcdGlmICh0eXBlb2YgaW5zdGFuY2UucmV0cnkgPT09IFwiZnVuY3Rpb25cIiAmJiBzdGF0ZSA9PT0gaW5zdGFuY2Uuc3RhdGUpIGluc3RhbmNlLnJldHJ5KClcblx0fVxuXHR2YXIgcmVzb2x2ZU5leHQsIHJlamVjdE5leHRcblx0dmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZVBvbHlmaWxsKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge3Jlc29sdmVOZXh0ID0gcmVzb2x2ZSwgcmVqZWN0TmV4dCA9IHJlamVjdH0pXG5cdGhhbmRsZShvbkZ1bGZpbGxlZCwgaW5zdGFuY2UucmVzb2x2ZXJzLCByZXNvbHZlTmV4dCwgdHJ1ZSksIGhhbmRsZShvblJlamVjdGlvbiwgaW5zdGFuY2UucmVqZWN0b3JzLCByZWplY3ROZXh0LCBmYWxzZSlcblx0cmV0dXJuIHByb21pc2Vcbn1cblByb21pc2VQb2x5ZmlsbC5wcm90b3R5cGUuY2F0Y2ggPSBmdW5jdGlvbihvblJlamVjdGlvbikge1xuXHRyZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0aW9uKVxufVxuUHJvbWlzZVBvbHlmaWxsLnJlc29sdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlUG9seWZpbGwpIHJldHVybiB2YWx1ZVxuXHRyZXR1cm4gbmV3IFByb21pc2VQb2x5ZmlsbChmdW5jdGlvbihyZXNvbHZlKSB7cmVzb2x2ZSh2YWx1ZSl9KVxufVxuUHJvbWlzZVBvbHlmaWxsLnJlamVjdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZVBvbHlmaWxsKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge3JlamVjdCh2YWx1ZSl9KVxufVxuUHJvbWlzZVBvbHlmaWxsLmFsbCA9IGZ1bmN0aW9uKGxpc3QpIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlUG9seWZpbGwoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0dmFyIHRvdGFsID0gbGlzdC5sZW5ndGgsIGNvdW50ID0gMCwgdmFsdWVzID0gW11cblx0XHRpZiAobGlzdC5sZW5ndGggPT09IDApIHJlc29sdmUoW10pXG5cdFx0ZWxzZSBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdChmdW5jdGlvbihpKSB7XG5cdFx0XHRcdGZ1bmN0aW9uIGNvbnN1bWUodmFsdWUpIHtcblx0XHRcdFx0XHRjb3VudCsrXG5cdFx0XHRcdFx0dmFsdWVzW2ldID0gdmFsdWVcblx0XHRcdFx0XHRpZiAoY291bnQgPT09IHRvdGFsKSByZXNvbHZlKHZhbHVlcylcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAobGlzdFtpXSAhPSBudWxsICYmICh0eXBlb2YgbGlzdFtpXSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgbGlzdFtpXSA9PT0gXCJmdW5jdGlvblwiKSAmJiB0eXBlb2YgbGlzdFtpXS50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHRsaXN0W2ldLnRoZW4oY29uc3VtZSwgcmVqZWN0KVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgY29uc3VtZShsaXN0W2ldKVxuXHRcdFx0fSkoaSlcblx0XHR9XG5cdH0pXG59XG5Qcm9taXNlUG9seWZpbGwucmFjZSA9IGZ1bmN0aW9uKGxpc3QpIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlUG9seWZpbGwoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsaXN0W2ldLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KVxuXHRcdH1cblx0fSlcbn1cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdGlmICh0eXBlb2Ygd2luZG93LlByb21pc2UgPT09IFwidW5kZWZpbmVkXCIpIHdpbmRvdy5Qcm9taXNlID0gUHJvbWlzZVBvbHlmaWxsXG5cdHZhciBQcm9taXNlUG9seWZpbGwgPSB3aW5kb3cuUHJvbWlzZVxufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsLlByb21pc2UgPT09IFwidW5kZWZpbmVkXCIpIGdsb2JhbC5Qcm9taXNlID0gUHJvbWlzZVBvbHlmaWxsXG5cdHZhciBQcm9taXNlUG9seWZpbGwgPSBnbG9iYWwuUHJvbWlzZVxufSBlbHNlIHtcbn1cbnZhciBidWlsZFF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24ob2JqZWN0KSB7XG5cdGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSAhPT0gXCJbb2JqZWN0IE9iamVjdF1cIikgcmV0dXJuIFwiXCJcblx0dmFyIGFyZ3MgPSBbXVxuXHRmb3IgKHZhciBrZXkwIGluIG9iamVjdCkge1xuXHRcdGRlc3RydWN0dXJlKGtleTAsIG9iamVjdFtrZXkwXSlcblx0fVxuXHRyZXR1cm4gYXJncy5qb2luKFwiJlwiKVxuXHRmdW5jdGlvbiBkZXN0cnVjdHVyZShrZXkwLCB2YWx1ZSkge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRkZXN0cnVjdHVyZShrZXkwICsgXCJbXCIgKyBpICsgXCJdXCIsIHZhbHVlW2ldKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSBcIltvYmplY3QgT2JqZWN0XVwiKSB7XG5cdFx0XHRmb3IgKHZhciBpIGluIHZhbHVlKSB7XG5cdFx0XHRcdGRlc3RydWN0dXJlKGtleTAgKyBcIltcIiArIGkgKyBcIl1cIiwgdmFsdWVbaV0pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgYXJncy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkwKSArICh2YWx1ZSAhPSBudWxsICYmIHZhbHVlICE9PSBcIlwiID8gXCI9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpIDogXCJcIikpXG5cdH1cbn1cbnZhciBGSUxFX1BST1RPQ09MX1JFR0VYID0gbmV3IFJlZ0V4cChcIl5maWxlOi8vXCIsIFwiaVwiKVxudmFyIF84ID0gZnVuY3Rpb24oJHdpbmRvdywgUHJvbWlzZSkge1xuXHR2YXIgY2FsbGJhY2tDb3VudCA9IDBcblx0dmFyIG9uY29tcGxldGlvblxuXHRmdW5jdGlvbiBzZXRDb21wbGV0aW9uQ2FsbGJhY2soY2FsbGJhY2spIHtvbmNvbXBsZXRpb24gPSBjYWxsYmFja31cblx0ZnVuY3Rpb24gZmluYWxpemVyKCkge1xuXHRcdHZhciBjb3VudCA9IDBcblx0XHRmdW5jdGlvbiBjb21wbGV0ZSgpIHtpZiAoLS1jb3VudCA9PT0gMCAmJiB0eXBlb2Ygb25jb21wbGV0aW9uID09PSBcImZ1bmN0aW9uXCIpIG9uY29tcGxldGlvbigpfVxuXHRcdHJldHVybiBmdW5jdGlvbiBmaW5hbGl6ZShwcm9taXNlMCkge1xuXHRcdFx0dmFyIHRoZW4wID0gcHJvbWlzZTAudGhlblxuXHRcdFx0cHJvbWlzZTAudGhlbiA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb3VudCsrXG5cdFx0XHRcdHZhciBuZXh0ID0gdGhlbjAuYXBwbHkocHJvbWlzZTAsIGFyZ3VtZW50cylcblx0XHRcdFx0bmV4dC50aGVuKGNvbXBsZXRlLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0Y29tcGxldGUoKVxuXHRcdFx0XHRcdGlmIChjb3VudCA9PT0gMCkgdGhyb3cgZVxuXHRcdFx0XHR9KVxuXHRcdFx0XHRyZXR1cm4gZmluYWxpemUobmV4dClcblx0XHRcdH1cblx0XHRcdHJldHVybiBwcm9taXNlMFxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBub3JtYWxpemUoYXJncywgZXh0cmEpIHtcblx0XHRpZiAodHlwZW9mIGFyZ3MgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHZhciB1cmwgPSBhcmdzXG5cdFx0XHRhcmdzID0gZXh0cmEgfHwge31cblx0XHRcdGlmIChhcmdzLnVybCA9PSBudWxsKSBhcmdzLnVybCA9IHVybFxuXHRcdH1cblx0XHRyZXR1cm4gYXJnc1xuXHR9XG5cdGZ1bmN0aW9uIHJlcXVlc3QoYXJncywgZXh0cmEpIHtcblx0XHR2YXIgZmluYWxpemUgPSBmaW5hbGl6ZXIoKVxuXHRcdGFyZ3MgPSBub3JtYWxpemUoYXJncywgZXh0cmEpXG5cdFx0dmFyIHByb21pc2UwID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0XHRpZiAoYXJncy5tZXRob2QgPT0gbnVsbCkgYXJncy5tZXRob2QgPSBcIkdFVFwiXG5cdFx0XHRhcmdzLm1ldGhvZCA9IGFyZ3MubWV0aG9kLnRvVXBwZXJDYXNlKClcblx0XHRcdHZhciB1c2VCb2R5ID0gKGFyZ3MubWV0aG9kID09PSBcIkdFVFwiIHx8IGFyZ3MubWV0aG9kID09PSBcIlRSQUNFXCIpID8gZmFsc2UgOiAodHlwZW9mIGFyZ3MudXNlQm9keSA9PT0gXCJib29sZWFuXCIgPyBhcmdzLnVzZUJvZHkgOiB0cnVlKVxuXHRcdFx0aWYgKHR5cGVvZiBhcmdzLnNlcmlhbGl6ZSAhPT0gXCJmdW5jdGlvblwiKSBhcmdzLnNlcmlhbGl6ZSA9IHR5cGVvZiBGb3JtRGF0YSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBhcmdzLmRhdGEgaW5zdGFuY2VvZiBGb3JtRGF0YSA/IGZ1bmN0aW9uKHZhbHVlKSB7cmV0dXJuIHZhbHVlfSA6IEpTT04uc3RyaW5naWZ5XG5cdFx0XHRpZiAodHlwZW9mIGFyZ3MuZGVzZXJpYWxpemUgIT09IFwiZnVuY3Rpb25cIikgYXJncy5kZXNlcmlhbGl6ZSA9IGRlc2VyaWFsaXplXG5cdFx0XHRpZiAodHlwZW9mIGFyZ3MuZXh0cmFjdCAhPT0gXCJmdW5jdGlvblwiKSBhcmdzLmV4dHJhY3QgPSBleHRyYWN0XG5cdFx0XHRhcmdzLnVybCA9IGludGVycG9sYXRlKGFyZ3MudXJsLCBhcmdzLmRhdGEpXG5cdFx0XHRpZiAodXNlQm9keSkgYXJncy5kYXRhID0gYXJncy5zZXJpYWxpemUoYXJncy5kYXRhKVxuXHRcdFx0ZWxzZSBhcmdzLnVybCA9IGFzc2VtYmxlKGFyZ3MudXJsLCBhcmdzLmRhdGEpXG5cdFx0XHR2YXIgeGhyID0gbmV3ICR3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKSxcblx0XHRcdFx0YWJvcnRlZCA9IGZhbHNlLFxuXHRcdFx0XHRfYWJvcnQgPSB4aHIuYWJvcnRcblx0XHRcdHhoci5hYm9ydCA9IGZ1bmN0aW9uIGFib3J0KCkge1xuXHRcdFx0XHRhYm9ydGVkID0gdHJ1ZVxuXHRcdFx0XHRfYWJvcnQuY2FsbCh4aHIpXG5cdFx0XHR9XG5cdFx0XHR4aHIub3BlbihhcmdzLm1ldGhvZCwgYXJncy51cmwsIHR5cGVvZiBhcmdzLmFzeW5jID09PSBcImJvb2xlYW5cIiA/IGFyZ3MuYXN5bmMgOiB0cnVlLCB0eXBlb2YgYXJncy51c2VyID09PSBcInN0cmluZ1wiID8gYXJncy51c2VyIDogdW5kZWZpbmVkLCB0eXBlb2YgYXJncy5wYXNzd29yZCA9PT0gXCJzdHJpbmdcIiA/IGFyZ3MucGFzc3dvcmQgOiB1bmRlZmluZWQpXG5cdFx0XHRpZiAoYXJncy5zZXJpYWxpemUgPT09IEpTT04uc3RyaW5naWZ5ICYmIHVzZUJvZHkpIHtcblx0XHRcdFx0eGhyLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04XCIpXG5cdFx0XHR9XG5cdFx0XHRpZiAoYXJncy5kZXNlcmlhbGl6ZSA9PT0gZGVzZXJpYWxpemUpIHtcblx0XHRcdFx0eGhyLnNldFJlcXVlc3RIZWFkZXIoXCJBY2NlcHRcIiwgXCJhcHBsaWNhdGlvbi9qc29uLCB0ZXh0LypcIilcblx0XHRcdH1cblx0XHRcdGlmIChhcmdzLndpdGhDcmVkZW50aWFscykgeGhyLndpdGhDcmVkZW50aWFscyA9IGFyZ3Mud2l0aENyZWRlbnRpYWxzXG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gYXJncy5oZWFkZXJzKSBpZiAoe30uaGFzT3duUHJvcGVydHkuY2FsbChhcmdzLmhlYWRlcnMsIGtleSkpIHtcblx0XHRcdFx0eGhyLnNldFJlcXVlc3RIZWFkZXIoa2V5LCBhcmdzLmhlYWRlcnNba2V5XSlcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlb2YgYXJncy5jb25maWcgPT09IFwiZnVuY3Rpb25cIikgeGhyID0gYXJncy5jb25maWcoeGhyLCBhcmdzKSB8fCB4aHJcblx0XHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0Ly8gRG9uJ3QgdGhyb3cgZXJyb3JzIG9uIHhoci5hYm9ydCgpLlxuXHRcdFx0XHRpZihhYm9ydGVkKSByZXR1cm5cblx0XHRcdFx0aWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdHZhciByZXNwb25zZSA9IChhcmdzLmV4dHJhY3QgIT09IGV4dHJhY3QpID8gYXJncy5leHRyYWN0KHhociwgYXJncykgOiBhcmdzLmRlc2VyaWFsaXplKGFyZ3MuZXh0cmFjdCh4aHIsIGFyZ3MpKVxuXHRcdFx0XHRcdFx0aWYgKCh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwKSB8fCB4aHIuc3RhdHVzID09PSAzMDQgfHwgRklMRV9QUk9UT0NPTF9SRUdFWC50ZXN0KGFyZ3MudXJsKSkge1xuXHRcdFx0XHRcdFx0XHRyZXNvbHZlKGNhc3QoYXJncy50eXBlLCByZXNwb25zZSkpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdFx0dmFyIGVycm9yID0gbmV3IEVycm9yKHhoci5yZXNwb25zZVRleHQpXG5cdFx0XHRcdFx0XHRcdGZvciAodmFyIGtleSBpbiByZXNwb25zZSkgZXJyb3Jba2V5XSA9IHJlc3BvbnNlW2tleV1cblx0XHRcdFx0XHRcdFx0cmVqZWN0KGVycm9yKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXRjaCAoZSkge1xuXHRcdFx0XHRcdFx0cmVqZWN0KGUpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAodXNlQm9keSAmJiAoYXJncy5kYXRhICE9IG51bGwpKSB4aHIuc2VuZChhcmdzLmRhdGEpXG5cdFx0XHRlbHNlIHhoci5zZW5kKClcblx0XHR9KVxuXHRcdHJldHVybiBhcmdzLmJhY2tncm91bmQgPT09IHRydWUgPyBwcm9taXNlMCA6IGZpbmFsaXplKHByb21pc2UwKVxuXHR9XG5cdGZ1bmN0aW9uIGpzb25wKGFyZ3MsIGV4dHJhKSB7XG5cdFx0dmFyIGZpbmFsaXplID0gZmluYWxpemVyKClcblx0XHRhcmdzID0gbm9ybWFsaXplKGFyZ3MsIGV4dHJhKVxuXHRcdHZhciBwcm9taXNlMCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFx0dmFyIGNhbGxiYWNrTmFtZSA9IGFyZ3MuY2FsbGJhY2tOYW1lIHx8IFwiX21pdGhyaWxfXCIgKyBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxZTE2KSArIFwiX1wiICsgY2FsbGJhY2tDb3VudCsrXG5cdFx0XHR2YXIgc2NyaXB0ID0gJHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpXG5cdFx0XHQkd2luZG93W2NhbGxiYWNrTmFtZV0gPSBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdClcblx0XHRcdFx0cmVzb2x2ZShjYXN0KGFyZ3MudHlwZSwgZGF0YSkpXG5cdFx0XHRcdGRlbGV0ZSAkd2luZG93W2NhbGxiYWNrTmFtZV1cblx0XHRcdH1cblx0XHRcdHNjcmlwdC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdClcblx0XHRcdFx0cmVqZWN0KG5ldyBFcnJvcihcIkpTT05QIHJlcXVlc3QgZmFpbGVkXCIpKVxuXHRcdFx0XHRkZWxldGUgJHdpbmRvd1tjYWxsYmFja05hbWVdXG5cdFx0XHR9XG5cdFx0XHRpZiAoYXJncy5kYXRhID09IG51bGwpIGFyZ3MuZGF0YSA9IHt9XG5cdFx0XHRhcmdzLnVybCA9IGludGVycG9sYXRlKGFyZ3MudXJsLCBhcmdzLmRhdGEpXG5cdFx0XHRhcmdzLmRhdGFbYXJncy5jYWxsYmFja0tleSB8fCBcImNhbGxiYWNrXCJdID0gY2FsbGJhY2tOYW1lXG5cdFx0XHRzY3JpcHQuc3JjID0gYXNzZW1ibGUoYXJncy51cmwsIGFyZ3MuZGF0YSlcblx0XHRcdCR3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKHNjcmlwdClcblx0XHR9KVxuXHRcdHJldHVybiBhcmdzLmJhY2tncm91bmQgPT09IHRydWU/IHByb21pc2UwIDogZmluYWxpemUocHJvbWlzZTApXG5cdH1cblx0ZnVuY3Rpb24gaW50ZXJwb2xhdGUodXJsLCBkYXRhKSB7XG5cdFx0aWYgKGRhdGEgPT0gbnVsbCkgcmV0dXJuIHVybFxuXHRcdHZhciB0b2tlbnMgPSB1cmwubWF0Y2goLzpbXlxcL10rL2dpKSB8fCBbXVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIga2V5ID0gdG9rZW5zW2ldLnNsaWNlKDEpXG5cdFx0XHRpZiAoZGF0YVtrZXldICE9IG51bGwpIHtcblx0XHRcdFx0dXJsID0gdXJsLnJlcGxhY2UodG9rZW5zW2ldLCBkYXRhW2tleV0pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB1cmxcblx0fVxuXHRmdW5jdGlvbiBhc3NlbWJsZSh1cmwsIGRhdGEpIHtcblx0XHR2YXIgcXVlcnlzdHJpbmcgPSBidWlsZFF1ZXJ5U3RyaW5nKGRhdGEpXG5cdFx0aWYgKHF1ZXJ5c3RyaW5nICE9PSBcIlwiKSB7XG5cdFx0XHR2YXIgcHJlZml4ID0gdXJsLmluZGV4T2YoXCI/XCIpIDwgMCA/IFwiP1wiIDogXCImXCJcblx0XHRcdHVybCArPSBwcmVmaXggKyBxdWVyeXN0cmluZ1xuXHRcdH1cblx0XHRyZXR1cm4gdXJsXG5cdH1cblx0ZnVuY3Rpb24gZGVzZXJpYWxpemUoZGF0YSkge1xuXHRcdHRyeSB7cmV0dXJuIGRhdGEgIT09IFwiXCIgPyBKU09OLnBhcnNlKGRhdGEpIDogbnVsbH1cblx0XHRjYXRjaCAoZSkge3Rocm93IG5ldyBFcnJvcihkYXRhKX1cblx0fVxuXHRmdW5jdGlvbiBleHRyYWN0KHhocikge3JldHVybiB4aHIucmVzcG9uc2VUZXh0fVxuXHRmdW5jdGlvbiBjYXN0KHR5cGUwLCBkYXRhKSB7XG5cdFx0aWYgKHR5cGVvZiB0eXBlMCA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRkYXRhW2ldID0gbmV3IHR5cGUwKGRhdGFbaV0pXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgcmV0dXJuIG5ldyB0eXBlMChkYXRhKVxuXHRcdH1cblx0XHRyZXR1cm4gZGF0YVxuXHR9XG5cdHJldHVybiB7cmVxdWVzdDogcmVxdWVzdCwganNvbnA6IGpzb25wLCBzZXRDb21wbGV0aW9uQ2FsbGJhY2s6IHNldENvbXBsZXRpb25DYWxsYmFja31cbn1cbnZhciByZXF1ZXN0U2VydmljZSA9IF84KHdpbmRvdywgUHJvbWlzZVBvbHlmaWxsKVxudmFyIGNvcmVSZW5kZXJlciA9IGZ1bmN0aW9uKCR3aW5kb3cpIHtcblx0dmFyICRkb2MgPSAkd2luZG93LmRvY3VtZW50XG5cdHZhciAkZW1wdHlGcmFnbWVudCA9ICRkb2MuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cdHZhciBuYW1lU3BhY2UgPSB7XG5cdFx0c3ZnOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXG5cdFx0bWF0aDogXCJodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGgvTWF0aE1MXCJcblx0fVxuXHR2YXIgb25ldmVudFxuXHRmdW5jdGlvbiBzZXRFdmVudENhbGxiYWNrKGNhbGxiYWNrKSB7cmV0dXJuIG9uZXZlbnQgPSBjYWxsYmFja31cblx0ZnVuY3Rpb24gZ2V0TmFtZVNwYWNlKHZub2RlKSB7XG5cdFx0cmV0dXJuIHZub2RlLmF0dHJzICYmIHZub2RlLmF0dHJzLnhtbG5zIHx8IG5hbWVTcGFjZVt2bm9kZS50YWddXG5cdH1cblx0Ly9jcmVhdGVcblx0ZnVuY3Rpb24gY3JlYXRlTm9kZXMocGFyZW50LCB2bm9kZXMsIHN0YXJ0LCBlbmQsIGhvb2tzLCBuZXh0U2libGluZywgbnMpIHtcblx0XHRmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuXHRcdFx0dmFyIHZub2RlID0gdm5vZGVzW2ldXG5cdFx0XHRpZiAodm5vZGUgIT0gbnVsbCkge1xuXHRcdFx0XHRjcmVhdGVOb2RlKHBhcmVudCwgdm5vZGUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZU5vZGUocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZykge1xuXHRcdHZhciB0YWcgPSB2bm9kZS50YWdcblx0XHRpZiAodHlwZW9mIHRhZyA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0dm5vZGUuc3RhdGUgPSB7fVxuXHRcdFx0aWYgKHZub2RlLmF0dHJzICE9IG51bGwpIGluaXRMaWZlY3ljbGUodm5vZGUuYXR0cnMsIHZub2RlLCBob29rcylcblx0XHRcdHN3aXRjaCAodGFnKSB7XG5cdFx0XHRcdGNhc2UgXCIjXCI6IHJldHVybiBjcmVhdGVUZXh0KHBhcmVudCwgdm5vZGUsIG5leHRTaWJsaW5nKVxuXHRcdFx0XHRjYXNlIFwiPFwiOiByZXR1cm4gY3JlYXRlSFRNTChwYXJlbnQsIHZub2RlLCBuZXh0U2libGluZylcblx0XHRcdFx0Y2FzZSBcIltcIjogcmV0dXJuIGNyZWF0ZUZyYWdtZW50KHBhcmVudCwgdm5vZGUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcpXG5cdFx0XHRcdGRlZmF1bHQ6IHJldHVybiBjcmVhdGVFbGVtZW50KHBhcmVudCwgdm5vZGUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgcmV0dXJuIGNyZWF0ZUNvbXBvbmVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKVxuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZVRleHQocGFyZW50LCB2bm9kZSwgbmV4dFNpYmxpbmcpIHtcblx0XHR2bm9kZS5kb20gPSAkZG9jLmNyZWF0ZVRleHROb2RlKHZub2RlLmNoaWxkcmVuKVxuXHRcdGluc2VydE5vZGUocGFyZW50LCB2bm9kZS5kb20sIG5leHRTaWJsaW5nKVxuXHRcdHJldHVybiB2bm9kZS5kb21cblx0fVxuXHRmdW5jdGlvbiBjcmVhdGVIVE1MKHBhcmVudCwgdm5vZGUsIG5leHRTaWJsaW5nKSB7XG5cdFx0dmFyIG1hdGNoMSA9IHZub2RlLmNoaWxkcmVuLm1hdGNoKC9eXFxzKj88KFxcdyspL2ltKSB8fCBbXVxuXHRcdHZhciBwYXJlbnQxID0ge2NhcHRpb246IFwidGFibGVcIiwgdGhlYWQ6IFwidGFibGVcIiwgdGJvZHk6IFwidGFibGVcIiwgdGZvb3Q6IFwidGFibGVcIiwgdHI6IFwidGJvZHlcIiwgdGg6IFwidHJcIiwgdGQ6IFwidHJcIiwgY29sZ3JvdXA6IFwidGFibGVcIiwgY29sOiBcImNvbGdyb3VwXCJ9W21hdGNoMVsxXV0gfHwgXCJkaXZcIlxuXHRcdHZhciB0ZW1wID0gJGRvYy5jcmVhdGVFbGVtZW50KHBhcmVudDEpXG5cdFx0dGVtcC5pbm5lckhUTUwgPSB2bm9kZS5jaGlsZHJlblxuXHRcdHZub2RlLmRvbSA9IHRlbXAuZmlyc3RDaGlsZFxuXHRcdHZub2RlLmRvbVNpemUgPSB0ZW1wLmNoaWxkTm9kZXMubGVuZ3RoXG5cdFx0dmFyIGZyYWdtZW50ID0gJGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcblx0XHR2YXIgY2hpbGRcblx0XHR3aGlsZSAoY2hpbGQgPSB0ZW1wLmZpcnN0Q2hpbGQpIHtcblx0XHRcdGZyYWdtZW50LmFwcGVuZENoaWxkKGNoaWxkKVxuXHRcdH1cblx0XHRpbnNlcnROb2RlKHBhcmVudCwgZnJhZ21lbnQsIG5leHRTaWJsaW5nKVxuXHRcdHJldHVybiBmcmFnbWVudFxuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZUZyYWdtZW50KHBhcmVudCwgdm5vZGUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcpIHtcblx0XHR2YXIgZnJhZ21lbnQgPSAkZG9jLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXHRcdGlmICh2bm9kZS5jaGlsZHJlbiAhPSBudWxsKSB7XG5cdFx0XHR2YXIgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlblxuXHRcdFx0Y3JlYXRlTm9kZXMoZnJhZ21lbnQsIGNoaWxkcmVuLCAwLCBjaGlsZHJlbi5sZW5ndGgsIGhvb2tzLCBudWxsLCBucylcblx0XHR9XG5cdFx0dm5vZGUuZG9tID0gZnJhZ21lbnQuZmlyc3RDaGlsZFxuXHRcdHZub2RlLmRvbVNpemUgPSBmcmFnbWVudC5jaGlsZE5vZGVzLmxlbmd0aFxuXHRcdGluc2VydE5vZGUocGFyZW50LCBmcmFnbWVudCwgbmV4dFNpYmxpbmcpXG5cdFx0cmV0dXJuIGZyYWdtZW50XG5cdH1cblx0ZnVuY3Rpb24gY3JlYXRlRWxlbWVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKSB7XG5cdFx0dmFyIHRhZyA9IHZub2RlLnRhZ1xuXHRcdHZhciBhdHRyczIgPSB2bm9kZS5hdHRyc1xuXHRcdHZhciBpcyA9IGF0dHJzMiAmJiBhdHRyczIuaXNcblx0XHRucyA9IGdldE5hbWVTcGFjZSh2bm9kZSkgfHwgbnNcblx0XHR2YXIgZWxlbWVudCA9IG5zID9cblx0XHRcdGlzID8gJGRvYy5jcmVhdGVFbGVtZW50TlMobnMsIHRhZywge2lzOiBpc30pIDogJGRvYy5jcmVhdGVFbGVtZW50TlMobnMsIHRhZykgOlxuXHRcdFx0aXMgPyAkZG9jLmNyZWF0ZUVsZW1lbnQodGFnLCB7aXM6IGlzfSkgOiAkZG9jLmNyZWF0ZUVsZW1lbnQodGFnKVxuXHRcdHZub2RlLmRvbSA9IGVsZW1lbnRcblx0XHRpZiAoYXR0cnMyICE9IG51bGwpIHtcblx0XHRcdHNldEF0dHJzKHZub2RlLCBhdHRyczIsIG5zKVxuXHRcdH1cblx0XHRpbnNlcnROb2RlKHBhcmVudCwgZWxlbWVudCwgbmV4dFNpYmxpbmcpXG5cdFx0aWYgKHZub2RlLmF0dHJzICE9IG51bGwgJiYgdm5vZGUuYXR0cnMuY29udGVudGVkaXRhYmxlICE9IG51bGwpIHtcblx0XHRcdHNldENvbnRlbnRFZGl0YWJsZSh2bm9kZSlcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAodm5vZGUudGV4dCAhPSBudWxsKSB7XG5cdFx0XHRcdGlmICh2bm9kZS50ZXh0ICE9PSBcIlwiKSBlbGVtZW50LnRleHRDb250ZW50ID0gdm5vZGUudGV4dFxuXHRcdFx0XHRlbHNlIHZub2RlLmNoaWxkcmVuID0gW1Zub2RlKFwiI1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdm5vZGUudGV4dCwgdW5kZWZpbmVkLCB1bmRlZmluZWQpXVxuXHRcdFx0fVxuXHRcdFx0aWYgKHZub2RlLmNoaWxkcmVuICE9IG51bGwpIHtcblx0XHRcdFx0dmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW5cblx0XHRcdFx0Y3JlYXRlTm9kZXMoZWxlbWVudCwgY2hpbGRyZW4sIDAsIGNoaWxkcmVuLmxlbmd0aCwgaG9va3MsIG51bGwsIG5zKVxuXHRcdFx0XHRzZXRMYXRlQXR0cnModm5vZGUpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBlbGVtZW50XG5cdH1cblx0ZnVuY3Rpb24gaW5pdENvbXBvbmVudCh2bm9kZSwgaG9va3MpIHtcblx0XHR2YXIgc2VudGluZWxcblx0XHRpZiAodHlwZW9mIHZub2RlLnRhZy52aWV3ID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdHZub2RlLnN0YXRlID0gT2JqZWN0LmNyZWF0ZSh2bm9kZS50YWcpXG5cdFx0XHRzZW50aW5lbCA9IHZub2RlLnN0YXRlLnZpZXdcblx0XHRcdGlmIChzZW50aW5lbC4kJHJlZW50cmFudExvY2skJCAhPSBudWxsKSByZXR1cm4gJGVtcHR5RnJhZ21lbnRcblx0XHRcdHNlbnRpbmVsLiQkcmVlbnRyYW50TG9jayQkID0gdHJ1ZVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2bm9kZS5zdGF0ZSA9IHZvaWQgMFxuXHRcdFx0c2VudGluZWwgPSB2bm9kZS50YWdcblx0XHRcdGlmIChzZW50aW5lbC4kJHJlZW50cmFudExvY2skJCAhPSBudWxsKSByZXR1cm4gJGVtcHR5RnJhZ21lbnRcblx0XHRcdHNlbnRpbmVsLiQkcmVlbnRyYW50TG9jayQkID0gdHJ1ZVxuXHRcdFx0dm5vZGUuc3RhdGUgPSAodm5vZGUudGFnLnByb3RvdHlwZSAhPSBudWxsICYmIHR5cGVvZiB2bm9kZS50YWcucHJvdG90eXBlLnZpZXcgPT09IFwiZnVuY3Rpb25cIikgPyBuZXcgdm5vZGUudGFnKHZub2RlKSA6IHZub2RlLnRhZyh2bm9kZSlcblx0XHR9XG5cdFx0dm5vZGUuX3N0YXRlID0gdm5vZGUuc3RhdGVcblx0XHRpZiAodm5vZGUuYXR0cnMgIT0gbnVsbCkgaW5pdExpZmVjeWNsZSh2bm9kZS5hdHRycywgdm5vZGUsIGhvb2tzKVxuXHRcdGluaXRMaWZlY3ljbGUodm5vZGUuX3N0YXRlLCB2bm9kZSwgaG9va3MpXG5cdFx0dm5vZGUuaW5zdGFuY2UgPSBWbm9kZS5ub3JtYWxpemUodm5vZGUuX3N0YXRlLnZpZXcuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUpKVxuXHRcdGlmICh2bm9kZS5pbnN0YW5jZSA9PT0gdm5vZGUpIHRocm93IEVycm9yKFwiQSB2aWV3IGNhbm5vdCByZXR1cm4gdGhlIHZub2RlIGl0IHJlY2VpdmVkIGFzIGFyZ3VtZW50XCIpXG5cdFx0c2VudGluZWwuJCRyZWVudHJhbnRMb2NrJCQgPSBudWxsXG5cdH1cblx0ZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KHBhcmVudCwgdm5vZGUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcpIHtcblx0XHRpbml0Q29tcG9uZW50KHZub2RlLCBob29rcylcblx0XHRpZiAodm5vZGUuaW5zdGFuY2UgIT0gbnVsbCkge1xuXHRcdFx0dmFyIGVsZW1lbnQgPSBjcmVhdGVOb2RlKHBhcmVudCwgdm5vZGUuaW5zdGFuY2UsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcpXG5cdFx0XHR2bm9kZS5kb20gPSB2bm9kZS5pbnN0YW5jZS5kb21cblx0XHRcdHZub2RlLmRvbVNpemUgPSB2bm9kZS5kb20gIT0gbnVsbCA/IHZub2RlLmluc3RhbmNlLmRvbVNpemUgOiAwXG5cdFx0XHRpbnNlcnROb2RlKHBhcmVudCwgZWxlbWVudCwgbmV4dFNpYmxpbmcpXG5cdFx0XHRyZXR1cm4gZWxlbWVudFxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHZub2RlLmRvbVNpemUgPSAwXG5cdFx0XHRyZXR1cm4gJGVtcHR5RnJhZ21lbnRcblx0XHR9XG5cdH1cblx0Ly91cGRhdGVcblx0ZnVuY3Rpb24gdXBkYXRlTm9kZXMocGFyZW50LCBvbGQsIHZub2RlcywgcmVjeWNsaW5nLCBob29rcywgbmV4dFNpYmxpbmcsIG5zKSB7XG5cdFx0aWYgKG9sZCA9PT0gdm5vZGVzIHx8IG9sZCA9PSBudWxsICYmIHZub2RlcyA9PSBudWxsKSByZXR1cm5cblx0XHRlbHNlIGlmIChvbGQgPT0gbnVsbCkgY3JlYXRlTm9kZXMocGFyZW50LCB2bm9kZXMsIDAsIHZub2Rlcy5sZW5ndGgsIGhvb2tzLCBuZXh0U2libGluZywgbnMpXG5cdFx0ZWxzZSBpZiAodm5vZGVzID09IG51bGwpIHJlbW92ZU5vZGVzKG9sZCwgMCwgb2xkLmxlbmd0aCwgdm5vZGVzKVxuXHRcdGVsc2Uge1xuXHRcdFx0aWYgKG9sZC5sZW5ndGggPT09IHZub2Rlcy5sZW5ndGgpIHtcblx0XHRcdFx0dmFyIGlzVW5rZXllZCA9IGZhbHNlXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdm5vZGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aWYgKHZub2Rlc1tpXSAhPSBudWxsICYmIG9sZFtpXSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRpc1Vua2V5ZWQgPSB2bm9kZXNbaV0ua2V5ID09IG51bGwgJiYgb2xkW2ldLmtleSA9PSBudWxsXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoaXNVbmtleWVkKSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvbGQubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGlmIChvbGRbaV0gPT09IHZub2Rlc1tpXSkgY29udGludWVcblx0XHRcdFx0XHRcdGVsc2UgaWYgKG9sZFtpXSA9PSBudWxsICYmIHZub2Rlc1tpXSAhPSBudWxsKSBjcmVhdGVOb2RlKHBhcmVudCwgdm5vZGVzW2ldLCBob29rcywgbnMsIGdldE5leHRTaWJsaW5nKG9sZCwgaSArIDEsIG5leHRTaWJsaW5nKSlcblx0XHRcdFx0XHRcdGVsc2UgaWYgKHZub2Rlc1tpXSA9PSBudWxsKSByZW1vdmVOb2RlcyhvbGQsIGksIGkgKyAxLCB2bm9kZXMpXG5cdFx0XHRcdFx0XHRlbHNlIHVwZGF0ZU5vZGUocGFyZW50LCBvbGRbaV0sIHZub2Rlc1tpXSwgaG9va3MsIGdldE5leHRTaWJsaW5nKG9sZCwgaSArIDEsIG5leHRTaWJsaW5nKSwgcmVjeWNsaW5nLCBucylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJlY3ljbGluZyA9IHJlY3ljbGluZyB8fCBpc1JlY3ljbGFibGUob2xkLCB2bm9kZXMpXG5cdFx0XHRpZiAocmVjeWNsaW5nKSB7XG5cdFx0XHRcdHZhciBwb29sID0gb2xkLnBvb2xcblx0XHRcdFx0b2xkID0gb2xkLmNvbmNhdChvbGQucG9vbClcblx0XHRcdH1cblx0XHRcdHZhciBvbGRTdGFydCA9IDAsIHN0YXJ0ID0gMCwgb2xkRW5kID0gb2xkLmxlbmd0aCAtIDEsIGVuZCA9IHZub2Rlcy5sZW5ndGggLSAxLCBtYXBcblx0XHRcdHdoaWxlIChvbGRFbmQgPj0gb2xkU3RhcnQgJiYgZW5kID49IHN0YXJ0KSB7XG5cdFx0XHRcdHZhciBvID0gb2xkW29sZFN0YXJ0XSwgdiA9IHZub2Rlc1tzdGFydF1cblx0XHRcdFx0aWYgKG8gPT09IHYgJiYgIXJlY3ljbGluZykgb2xkU3RhcnQrKywgc3RhcnQrK1xuXHRcdFx0XHRlbHNlIGlmIChvID09IG51bGwpIG9sZFN0YXJ0Kytcblx0XHRcdFx0ZWxzZSBpZiAodiA9PSBudWxsKSBzdGFydCsrXG5cdFx0XHRcdGVsc2UgaWYgKG8ua2V5ID09PSB2LmtleSkge1xuXHRcdFx0XHRcdHZhciBzaG91bGRSZWN5Y2xlID0gKHBvb2wgIT0gbnVsbCAmJiBvbGRTdGFydCA+PSBvbGQubGVuZ3RoIC0gcG9vbC5sZW5ndGgpIHx8ICgocG9vbCA9PSBudWxsKSAmJiByZWN5Y2xpbmcpXG5cdFx0XHRcdFx0b2xkU3RhcnQrKywgc3RhcnQrK1xuXHRcdFx0XHRcdHVwZGF0ZU5vZGUocGFyZW50LCBvLCB2LCBob29rcywgZ2V0TmV4dFNpYmxpbmcob2xkLCBvbGRTdGFydCwgbmV4dFNpYmxpbmcpLCBzaG91bGRSZWN5Y2xlLCBucylcblx0XHRcdFx0XHRpZiAocmVjeWNsaW5nICYmIG8udGFnID09PSB2LnRhZykgaW5zZXJ0Tm9kZShwYXJlbnQsIHRvRnJhZ21lbnQobyksIG5leHRTaWJsaW5nKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdHZhciBvID0gb2xkW29sZEVuZF1cblx0XHRcdFx0XHRpZiAobyA9PT0gdiAmJiAhcmVjeWNsaW5nKSBvbGRFbmQtLSwgc3RhcnQrK1xuXHRcdFx0XHRcdGVsc2UgaWYgKG8gPT0gbnVsbCkgb2xkRW5kLS1cblx0XHRcdFx0XHRlbHNlIGlmICh2ID09IG51bGwpIHN0YXJ0Kytcblx0XHRcdFx0XHRlbHNlIGlmIChvLmtleSA9PT0gdi5rZXkpIHtcblx0XHRcdFx0XHRcdHZhciBzaG91bGRSZWN5Y2xlID0gKHBvb2wgIT0gbnVsbCAmJiBvbGRFbmQgPj0gb2xkLmxlbmd0aCAtIHBvb2wubGVuZ3RoKSB8fCAoKHBvb2wgPT0gbnVsbCkgJiYgcmVjeWNsaW5nKVxuXHRcdFx0XHRcdFx0dXBkYXRlTm9kZShwYXJlbnQsIG8sIHYsIGhvb2tzLCBnZXROZXh0U2libGluZyhvbGQsIG9sZEVuZCArIDEsIG5leHRTaWJsaW5nKSwgc2hvdWxkUmVjeWNsZSwgbnMpXG5cdFx0XHRcdFx0XHRpZiAocmVjeWNsaW5nIHx8IHN0YXJ0IDwgZW5kKSBpbnNlcnROb2RlKHBhcmVudCwgdG9GcmFnbWVudChvKSwgZ2V0TmV4dFNpYmxpbmcob2xkLCBvbGRTdGFydCwgbmV4dFNpYmxpbmcpKVxuXHRcdFx0XHRcdFx0b2xkRW5kLS0sIHN0YXJ0Kytcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBicmVha1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAob2xkRW5kID49IG9sZFN0YXJ0ICYmIGVuZCA+PSBzdGFydCkge1xuXHRcdFx0XHR2YXIgbyA9IG9sZFtvbGRFbmRdLCB2ID0gdm5vZGVzW2VuZF1cblx0XHRcdFx0aWYgKG8gPT09IHYgJiYgIXJlY3ljbGluZykgb2xkRW5kLS0sIGVuZC0tXG5cdFx0XHRcdGVsc2UgaWYgKG8gPT0gbnVsbCkgb2xkRW5kLS1cblx0XHRcdFx0ZWxzZSBpZiAodiA9PSBudWxsKSBlbmQtLVxuXHRcdFx0XHRlbHNlIGlmIChvLmtleSA9PT0gdi5rZXkpIHtcblx0XHRcdFx0XHR2YXIgc2hvdWxkUmVjeWNsZSA9IChwb29sICE9IG51bGwgJiYgb2xkRW5kID49IG9sZC5sZW5ndGggLSBwb29sLmxlbmd0aCkgfHwgKChwb29sID09IG51bGwpICYmIHJlY3ljbGluZylcblx0XHRcdFx0XHR1cGRhdGVOb2RlKHBhcmVudCwgbywgdiwgaG9va3MsIGdldE5leHRTaWJsaW5nKG9sZCwgb2xkRW5kICsgMSwgbmV4dFNpYmxpbmcpLCBzaG91bGRSZWN5Y2xlLCBucylcblx0XHRcdFx0XHRpZiAocmVjeWNsaW5nICYmIG8udGFnID09PSB2LnRhZykgaW5zZXJ0Tm9kZShwYXJlbnQsIHRvRnJhZ21lbnQobyksIG5leHRTaWJsaW5nKVxuXHRcdFx0XHRcdGlmIChvLmRvbSAhPSBudWxsKSBuZXh0U2libGluZyA9IG8uZG9tXG5cdFx0XHRcdFx0b2xkRW5kLS0sIGVuZC0tXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0aWYgKCFtYXApIG1hcCA9IGdldEtleU1hcChvbGQsIG9sZEVuZClcblx0XHRcdFx0XHRpZiAodiAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHR2YXIgb2xkSW5kZXggPSBtYXBbdi5rZXldXG5cdFx0XHRcdFx0XHRpZiAob2xkSW5kZXggIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHR2YXIgbW92YWJsZSA9IG9sZFtvbGRJbmRleF1cblx0XHRcdFx0XHRcdFx0dmFyIHNob3VsZFJlY3ljbGUgPSAocG9vbCAhPSBudWxsICYmIG9sZEluZGV4ID49IG9sZC5sZW5ndGggLSBwb29sLmxlbmd0aCkgfHwgKChwb29sID09IG51bGwpICYmIHJlY3ljbGluZylcblx0XHRcdFx0XHRcdFx0dXBkYXRlTm9kZShwYXJlbnQsIG1vdmFibGUsIHYsIGhvb2tzLCBnZXROZXh0U2libGluZyhvbGQsIG9sZEVuZCArIDEsIG5leHRTaWJsaW5nKSwgcmVjeWNsaW5nLCBucylcblx0XHRcdFx0XHRcdFx0aW5zZXJ0Tm9kZShwYXJlbnQsIHRvRnJhZ21lbnQobW92YWJsZSksIG5leHRTaWJsaW5nKVxuXHRcdFx0XHRcdFx0XHRvbGRbb2xkSW5kZXhdLnNraXAgPSB0cnVlXG5cdFx0XHRcdFx0XHRcdGlmIChtb3ZhYmxlLmRvbSAhPSBudWxsKSBuZXh0U2libGluZyA9IG1vdmFibGUuZG9tXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdFx0dmFyIGRvbSA9IGNyZWF0ZU5vZGUocGFyZW50LCB2LCBob29rcywgbnMsIG5leHRTaWJsaW5nKVxuXHRcdFx0XHRcdFx0XHRuZXh0U2libGluZyA9IGRvbVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbmQtLVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChlbmQgPCBzdGFydCkgYnJlYWtcblx0XHRcdH1cblx0XHRcdGNyZWF0ZU5vZGVzKHBhcmVudCwgdm5vZGVzLCBzdGFydCwgZW5kICsgMSwgaG9va3MsIG5leHRTaWJsaW5nLCBucylcblx0XHRcdHJlbW92ZU5vZGVzKG9sZCwgb2xkU3RhcnQsIG9sZEVuZCArIDEsIHZub2Rlcylcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlTm9kZShwYXJlbnQsIG9sZCwgdm5vZGUsIGhvb2tzLCBuZXh0U2libGluZywgcmVjeWNsaW5nLCBucykge1xuXHRcdHZhciBvbGRUYWcgPSBvbGQudGFnLCB0YWcgPSB2bm9kZS50YWdcblx0XHRpZiAob2xkVGFnID09PSB0YWcpIHtcblx0XHRcdHZub2RlLnN0YXRlID0gb2xkLnN0YXRlXG5cdFx0XHR2bm9kZS5fc3RhdGUgPSBvbGQuX3N0YXRlXG5cdFx0XHR2bm9kZS5ldmVudHMgPSBvbGQuZXZlbnRzXG5cdFx0XHRpZiAoIXJlY3ljbGluZyAmJiBzaG91bGROb3RVcGRhdGUodm5vZGUsIG9sZCkpIHJldHVyblxuXHRcdFx0aWYgKHR5cGVvZiBvbGRUYWcgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0aWYgKHZub2RlLmF0dHJzICE9IG51bGwpIHtcblx0XHRcdFx0XHRpZiAocmVjeWNsaW5nKSB7XG5cdFx0XHRcdFx0XHR2bm9kZS5zdGF0ZSA9IHt9XG5cdFx0XHRcdFx0XHRpbml0TGlmZWN5Y2xlKHZub2RlLmF0dHJzLCB2bm9kZSwgaG9va3MpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgdXBkYXRlTGlmZWN5Y2xlKHZub2RlLmF0dHJzLCB2bm9kZSwgaG9va3MpXG5cdFx0XHRcdH1cblx0XHRcdFx0c3dpdGNoIChvbGRUYWcpIHtcblx0XHRcdFx0XHRjYXNlIFwiI1wiOiB1cGRhdGVUZXh0KG9sZCwgdm5vZGUpOyBicmVha1xuXHRcdFx0XHRcdGNhc2UgXCI8XCI6IHVwZGF0ZUhUTUwocGFyZW50LCBvbGQsIHZub2RlLCBuZXh0U2libGluZyk7IGJyZWFrXG5cdFx0XHRcdFx0Y2FzZSBcIltcIjogdXBkYXRlRnJhZ21lbnQocGFyZW50LCBvbGQsIHZub2RlLCByZWN5Y2xpbmcsIGhvb2tzLCBuZXh0U2libGluZywgbnMpOyBicmVha1xuXHRcdFx0XHRcdGRlZmF1bHQ6IHVwZGF0ZUVsZW1lbnQob2xkLCB2bm9kZSwgcmVjeWNsaW5nLCBob29rcywgbnMpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgdXBkYXRlQ29tcG9uZW50KHBhcmVudCwgb2xkLCB2bm9kZSwgaG9va3MsIG5leHRTaWJsaW5nLCByZWN5Y2xpbmcsIG5zKVxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHJlbW92ZU5vZGUob2xkLCBudWxsKVxuXHRcdFx0Y3JlYXRlTm9kZShwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVUZXh0KG9sZCwgdm5vZGUpIHtcblx0XHRpZiAob2xkLmNoaWxkcmVuLnRvU3RyaW5nKCkgIT09IHZub2RlLmNoaWxkcmVuLnRvU3RyaW5nKCkpIHtcblx0XHRcdG9sZC5kb20ubm9kZVZhbHVlID0gdm5vZGUuY2hpbGRyZW5cblx0XHR9XG5cdFx0dm5vZGUuZG9tID0gb2xkLmRvbVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZUhUTUwocGFyZW50LCBvbGQsIHZub2RlLCBuZXh0U2libGluZykge1xuXHRcdGlmIChvbGQuY2hpbGRyZW4gIT09IHZub2RlLmNoaWxkcmVuKSB7XG5cdFx0XHR0b0ZyYWdtZW50KG9sZClcblx0XHRcdGNyZWF0ZUhUTUwocGFyZW50LCB2bm9kZSwgbmV4dFNpYmxpbmcpXG5cdFx0fVxuXHRcdGVsc2Ugdm5vZGUuZG9tID0gb2xkLmRvbSwgdm5vZGUuZG9tU2l6ZSA9IG9sZC5kb21TaXplXG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlRnJhZ21lbnQocGFyZW50LCBvbGQsIHZub2RlLCByZWN5Y2xpbmcsIGhvb2tzLCBuZXh0U2libGluZywgbnMpIHtcblx0XHR1cGRhdGVOb2RlcyhwYXJlbnQsIG9sZC5jaGlsZHJlbiwgdm5vZGUuY2hpbGRyZW4sIHJlY3ljbGluZywgaG9va3MsIG5leHRTaWJsaW5nLCBucylcblx0XHR2YXIgZG9tU2l6ZSA9IDAsIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW5cblx0XHR2bm9kZS5kb20gPSBudWxsXG5cdFx0aWYgKGNoaWxkcmVuICE9IG51bGwpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGNoaWxkID0gY2hpbGRyZW5baV1cblx0XHRcdFx0aWYgKGNoaWxkICE9IG51bGwgJiYgY2hpbGQuZG9tICE9IG51bGwpIHtcblx0XHRcdFx0XHRpZiAodm5vZGUuZG9tID09IG51bGwpIHZub2RlLmRvbSA9IGNoaWxkLmRvbVxuXHRcdFx0XHRcdGRvbVNpemUgKz0gY2hpbGQuZG9tU2l6ZSB8fCAxXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChkb21TaXplICE9PSAxKSB2bm9kZS5kb21TaXplID0gZG9tU2l6ZVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVFbGVtZW50KG9sZCwgdm5vZGUsIHJlY3ljbGluZywgaG9va3MsIG5zKSB7XG5cdFx0dmFyIGVsZW1lbnQgPSB2bm9kZS5kb20gPSBvbGQuZG9tXG5cdFx0bnMgPSBnZXROYW1lU3BhY2Uodm5vZGUpIHx8IG5zXG5cdFx0aWYgKHZub2RlLnRhZyA9PT0gXCJ0ZXh0YXJlYVwiKSB7XG5cdFx0XHRpZiAodm5vZGUuYXR0cnMgPT0gbnVsbCkgdm5vZGUuYXR0cnMgPSB7fVxuXHRcdFx0aWYgKHZub2RlLnRleHQgIT0gbnVsbCkge1xuXHRcdFx0XHR2bm9kZS5hdHRycy52YWx1ZSA9IHZub2RlLnRleHQgLy9GSVhNRSBoYW5kbGUwIG11bHRpcGxlIGNoaWxkcmVuXG5cdFx0XHRcdHZub2RlLnRleHQgPSB1bmRlZmluZWRcblx0XHRcdH1cblx0XHR9XG5cdFx0dXBkYXRlQXR0cnModm5vZGUsIG9sZC5hdHRycywgdm5vZGUuYXR0cnMsIG5zKVxuXHRcdGlmICh2bm9kZS5hdHRycyAhPSBudWxsICYmIHZub2RlLmF0dHJzLmNvbnRlbnRlZGl0YWJsZSAhPSBudWxsKSB7XG5cdFx0XHRzZXRDb250ZW50RWRpdGFibGUodm5vZGUpXG5cdFx0fVxuXHRcdGVsc2UgaWYgKG9sZC50ZXh0ICE9IG51bGwgJiYgdm5vZGUudGV4dCAhPSBudWxsICYmIHZub2RlLnRleHQgIT09IFwiXCIpIHtcblx0XHRcdGlmIChvbGQudGV4dC50b1N0cmluZygpICE9PSB2bm9kZS50ZXh0LnRvU3RyaW5nKCkpIG9sZC5kb20uZmlyc3RDaGlsZC5ub2RlVmFsdWUgPSB2bm9kZS50ZXh0XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0aWYgKG9sZC50ZXh0ICE9IG51bGwpIG9sZC5jaGlsZHJlbiA9IFtWbm9kZShcIiNcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIG9sZC50ZXh0LCB1bmRlZmluZWQsIG9sZC5kb20uZmlyc3RDaGlsZCldXG5cdFx0XHRpZiAodm5vZGUudGV4dCAhPSBudWxsKSB2bm9kZS5jaGlsZHJlbiA9IFtWbm9kZShcIiNcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHZub2RlLnRleHQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkKV1cblx0XHRcdHVwZGF0ZU5vZGVzKGVsZW1lbnQsIG9sZC5jaGlsZHJlbiwgdm5vZGUuY2hpbGRyZW4sIHJlY3ljbGluZywgaG9va3MsIG51bGwsIG5zKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVDb21wb25lbnQocGFyZW50LCBvbGQsIHZub2RlLCBob29rcywgbmV4dFNpYmxpbmcsIHJlY3ljbGluZywgbnMpIHtcblx0XHRpZiAocmVjeWNsaW5nKSB7XG5cdFx0XHRpbml0Q29tcG9uZW50KHZub2RlLCBob29rcylcblx0XHR9IGVsc2Uge1xuXHRcdFx0dm5vZGUuaW5zdGFuY2UgPSBWbm9kZS5ub3JtYWxpemUodm5vZGUuX3N0YXRlLnZpZXcuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUpKVxuXHRcdFx0aWYgKHZub2RlLmluc3RhbmNlID09PSB2bm9kZSkgdGhyb3cgRXJyb3IoXCJBIHZpZXcgY2Fubm90IHJldHVybiB0aGUgdm5vZGUgaXQgcmVjZWl2ZWQgYXMgYXJndW1lbnRcIilcblx0XHRcdGlmICh2bm9kZS5hdHRycyAhPSBudWxsKSB1cGRhdGVMaWZlY3ljbGUodm5vZGUuYXR0cnMsIHZub2RlLCBob29rcylcblx0XHRcdHVwZGF0ZUxpZmVjeWNsZSh2bm9kZS5fc3RhdGUsIHZub2RlLCBob29rcylcblx0XHR9XG5cdFx0aWYgKHZub2RlLmluc3RhbmNlICE9IG51bGwpIHtcblx0XHRcdGlmIChvbGQuaW5zdGFuY2UgPT0gbnVsbCkgY3JlYXRlTm9kZShwYXJlbnQsIHZub2RlLmluc3RhbmNlLCBob29rcywgbnMsIG5leHRTaWJsaW5nKVxuXHRcdFx0ZWxzZSB1cGRhdGVOb2RlKHBhcmVudCwgb2xkLmluc3RhbmNlLCB2bm9kZS5pbnN0YW5jZSwgaG9va3MsIG5leHRTaWJsaW5nLCByZWN5Y2xpbmcsIG5zKVxuXHRcdFx0dm5vZGUuZG9tID0gdm5vZGUuaW5zdGFuY2UuZG9tXG5cdFx0XHR2bm9kZS5kb21TaXplID0gdm5vZGUuaW5zdGFuY2UuZG9tU2l6ZVxuXHRcdH1cblx0XHRlbHNlIGlmIChvbGQuaW5zdGFuY2UgIT0gbnVsbCkge1xuXHRcdFx0cmVtb3ZlTm9kZShvbGQuaW5zdGFuY2UsIG51bGwpXG5cdFx0XHR2bm9kZS5kb20gPSB1bmRlZmluZWRcblx0XHRcdHZub2RlLmRvbVNpemUgPSAwXG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dm5vZGUuZG9tID0gb2xkLmRvbVxuXHRcdFx0dm5vZGUuZG9tU2l6ZSA9IG9sZC5kb21TaXplXG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIGlzUmVjeWNsYWJsZShvbGQsIHZub2Rlcykge1xuXHRcdGlmIChvbGQucG9vbCAhPSBudWxsICYmIE1hdGguYWJzKG9sZC5wb29sLmxlbmd0aCAtIHZub2Rlcy5sZW5ndGgpIDw9IE1hdGguYWJzKG9sZC5sZW5ndGggLSB2bm9kZXMubGVuZ3RoKSkge1xuXHRcdFx0dmFyIG9sZENoaWxkcmVuTGVuZ3RoID0gb2xkWzBdICYmIG9sZFswXS5jaGlsZHJlbiAmJiBvbGRbMF0uY2hpbGRyZW4ubGVuZ3RoIHx8IDBcblx0XHRcdHZhciBwb29sQ2hpbGRyZW5MZW5ndGggPSBvbGQucG9vbFswXSAmJiBvbGQucG9vbFswXS5jaGlsZHJlbiAmJiBvbGQucG9vbFswXS5jaGlsZHJlbi5sZW5ndGggfHwgMFxuXHRcdFx0dmFyIHZub2Rlc0NoaWxkcmVuTGVuZ3RoID0gdm5vZGVzWzBdICYmIHZub2Rlc1swXS5jaGlsZHJlbiAmJiB2bm9kZXNbMF0uY2hpbGRyZW4ubGVuZ3RoIHx8IDBcblx0XHRcdGlmIChNYXRoLmFicyhwb29sQ2hpbGRyZW5MZW5ndGggLSB2bm9kZXNDaGlsZHJlbkxlbmd0aCkgPD0gTWF0aC5hYnMob2xkQ2hpbGRyZW5MZW5ndGggLSB2bm9kZXNDaGlsZHJlbkxlbmd0aCkpIHtcblx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cblx0ZnVuY3Rpb24gZ2V0S2V5TWFwKHZub2RlcywgZW5kKSB7XG5cdFx0dmFyIG1hcCA9IHt9LCBpID0gMFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZW5kOyBpKyspIHtcblx0XHRcdHZhciB2bm9kZSA9IHZub2Rlc1tpXVxuXHRcdFx0aWYgKHZub2RlICE9IG51bGwpIHtcblx0XHRcdFx0dmFyIGtleTIgPSB2bm9kZS5rZXlcblx0XHRcdFx0aWYgKGtleTIgIT0gbnVsbCkgbWFwW2tleTJdID0gaVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gbWFwXG5cdH1cblx0ZnVuY3Rpb24gdG9GcmFnbWVudCh2bm9kZSkge1xuXHRcdHZhciBjb3VudDAgPSB2bm9kZS5kb21TaXplXG5cdFx0aWYgKGNvdW50MCAhPSBudWxsIHx8IHZub2RlLmRvbSA9PSBudWxsKSB7XG5cdFx0XHR2YXIgZnJhZ21lbnQgPSAkZG9jLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXHRcdFx0aWYgKGNvdW50MCA+IDApIHtcblx0XHRcdFx0dmFyIGRvbSA9IHZub2RlLmRvbVxuXHRcdFx0XHR3aGlsZSAoLS1jb3VudDApIGZyYWdtZW50LmFwcGVuZENoaWxkKGRvbS5uZXh0U2libGluZylcblx0XHRcdFx0ZnJhZ21lbnQuaW5zZXJ0QmVmb3JlKGRvbSwgZnJhZ21lbnQuZmlyc3RDaGlsZClcblx0XHRcdH1cblx0XHRcdHJldHVybiBmcmFnbWVudFxuXHRcdH1cblx0XHRlbHNlIHJldHVybiB2bm9kZS5kb21cblx0fVxuXHRmdW5jdGlvbiBnZXROZXh0U2libGluZyh2bm9kZXMsIGksIG5leHRTaWJsaW5nKSB7XG5cdFx0Zm9yICg7IGkgPCB2bm9kZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmICh2bm9kZXNbaV0gIT0gbnVsbCAmJiB2bm9kZXNbaV0uZG9tICE9IG51bGwpIHJldHVybiB2bm9kZXNbaV0uZG9tXG5cdFx0fVxuXHRcdHJldHVybiBuZXh0U2libGluZ1xuXHR9XG5cdGZ1bmN0aW9uIGluc2VydE5vZGUocGFyZW50LCBkb20sIG5leHRTaWJsaW5nKSB7XG5cdFx0aWYgKG5leHRTaWJsaW5nICYmIG5leHRTaWJsaW5nLnBhcmVudE5vZGUpIHBhcmVudC5pbnNlcnRCZWZvcmUoZG9tLCBuZXh0U2libGluZylcblx0XHRlbHNlIHBhcmVudC5hcHBlbmRDaGlsZChkb20pXG5cdH1cblx0ZnVuY3Rpb24gc2V0Q29udGVudEVkaXRhYmxlKHZub2RlKSB7XG5cdFx0dmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW5cblx0XHRpZiAoY2hpbGRyZW4gIT0gbnVsbCAmJiBjaGlsZHJlbi5sZW5ndGggPT09IDEgJiYgY2hpbGRyZW5bMF0udGFnID09PSBcIjxcIikge1xuXHRcdFx0dmFyIGNvbnRlbnQgPSBjaGlsZHJlblswXS5jaGlsZHJlblxuXHRcdFx0aWYgKHZub2RlLmRvbS5pbm5lckhUTUwgIT09IGNvbnRlbnQpIHZub2RlLmRvbS5pbm5lckhUTUwgPSBjb250ZW50XG5cdFx0fVxuXHRcdGVsc2UgaWYgKHZub2RlLnRleHQgIT0gbnVsbCB8fCBjaGlsZHJlbiAhPSBudWxsICYmIGNoaWxkcmVuLmxlbmd0aCAhPT0gMCkgdGhyb3cgbmV3IEVycm9yKFwiQ2hpbGQgbm9kZSBvZiBhIGNvbnRlbnRlZGl0YWJsZSBtdXN0IGJlIHRydXN0ZWRcIilcblx0fVxuXHQvL3JlbW92ZVxuXHRmdW5jdGlvbiByZW1vdmVOb2Rlcyh2bm9kZXMsIHN0YXJ0LCBlbmQsIGNvbnRleHQpIHtcblx0XHRmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuXHRcdFx0dmFyIHZub2RlID0gdm5vZGVzW2ldXG5cdFx0XHRpZiAodm5vZGUgIT0gbnVsbCkge1xuXHRcdFx0XHRpZiAodm5vZGUuc2tpcCkgdm5vZGUuc2tpcCA9IGZhbHNlXG5cdFx0XHRcdGVsc2UgcmVtb3ZlTm9kZSh2bm9kZSwgY29udGV4dClcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gcmVtb3ZlTm9kZSh2bm9kZSwgY29udGV4dCkge1xuXHRcdHZhciBleHBlY3RlZCA9IDEsIGNhbGxlZCA9IDBcblx0XHRpZiAodm5vZGUuYXR0cnMgJiYgdHlwZW9mIHZub2RlLmF0dHJzLm9uYmVmb3JlcmVtb3ZlID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdHZhciByZXN1bHQgPSB2bm9kZS5hdHRycy5vbmJlZm9yZXJlbW92ZS5jYWxsKHZub2RlLnN0YXRlLCB2bm9kZSlcblx0XHRcdGlmIChyZXN1bHQgIT0gbnVsbCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRleHBlY3RlZCsrXG5cdFx0XHRcdHJlc3VsdC50aGVuKGNvbnRpbnVhdGlvbiwgY29udGludWF0aW9uKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAodHlwZW9mIHZub2RlLnRhZyAhPT0gXCJzdHJpbmdcIiAmJiB0eXBlb2Ygdm5vZGUuX3N0YXRlLm9uYmVmb3JlcmVtb3ZlID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdHZhciByZXN1bHQgPSB2bm9kZS5fc3RhdGUub25iZWZvcmVyZW1vdmUuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUpXG5cdFx0XHRpZiAocmVzdWx0ICE9IG51bGwgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0ZXhwZWN0ZWQrK1xuXHRcdFx0XHRyZXN1bHQudGhlbihjb250aW51YXRpb24sIGNvbnRpbnVhdGlvbilcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29udGludWF0aW9uKClcblx0XHRmdW5jdGlvbiBjb250aW51YXRpb24oKSB7XG5cdFx0XHRpZiAoKytjYWxsZWQgPT09IGV4cGVjdGVkKSB7XG5cdFx0XHRcdG9ucmVtb3ZlKHZub2RlKVxuXHRcdFx0XHRpZiAodm5vZGUuZG9tKSB7XG5cdFx0XHRcdFx0dmFyIGNvdW50MCA9IHZub2RlLmRvbVNpemUgfHwgMVxuXHRcdFx0XHRcdGlmIChjb3VudDAgPiAxKSB7XG5cdFx0XHRcdFx0XHR2YXIgZG9tID0gdm5vZGUuZG9tXG5cdFx0XHRcdFx0XHR3aGlsZSAoLS1jb3VudDApIHtcblx0XHRcdFx0XHRcdFx0cmVtb3ZlTm9kZUZyb21ET00oZG9tLm5leHRTaWJsaW5nKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZW1vdmVOb2RlRnJvbURPTSh2bm9kZS5kb20pXG5cdFx0XHRcdFx0aWYgKGNvbnRleHQgIT0gbnVsbCAmJiB2bm9kZS5kb21TaXplID09IG51bGwgJiYgIWhhc0ludGVncmF0aW9uTWV0aG9kcyh2bm9kZS5hdHRycykgJiYgdHlwZW9mIHZub2RlLnRhZyA9PT0gXCJzdHJpbmdcIikgeyAvL1RPRE8gdGVzdCBjdXN0b20gZWxlbWVudHNcblx0XHRcdFx0XHRcdGlmICghY29udGV4dC5wb29sKSBjb250ZXh0LnBvb2wgPSBbdm5vZGVdXG5cdFx0XHRcdFx0XHRlbHNlIGNvbnRleHQucG9vbC5wdXNoKHZub2RlKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiByZW1vdmVOb2RlRnJvbURPTShub2RlKSB7XG5cdFx0dmFyIHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZVxuXHRcdGlmIChwYXJlbnQgIT0gbnVsbCkgcGFyZW50LnJlbW92ZUNoaWxkKG5vZGUpXG5cdH1cblx0ZnVuY3Rpb24gb25yZW1vdmUodm5vZGUpIHtcblx0XHRpZiAodm5vZGUuYXR0cnMgJiYgdHlwZW9mIHZub2RlLmF0dHJzLm9ucmVtb3ZlID09PSBcImZ1bmN0aW9uXCIpIHZub2RlLmF0dHJzLm9ucmVtb3ZlLmNhbGwodm5vZGUuc3RhdGUsIHZub2RlKVxuXHRcdGlmICh0eXBlb2Ygdm5vZGUudGFnICE9PSBcInN0cmluZ1wiICYmIHR5cGVvZiB2bm9kZS5fc3RhdGUub25yZW1vdmUgPT09IFwiZnVuY3Rpb25cIikgdm5vZGUuX3N0YXRlLm9ucmVtb3ZlLmNhbGwodm5vZGUuc3RhdGUsIHZub2RlKVxuXHRcdGlmICh2bm9kZS5pbnN0YW5jZSAhPSBudWxsKSBvbnJlbW92ZSh2bm9kZS5pbnN0YW5jZSlcblx0XHRlbHNlIHtcblx0XHRcdHZhciBjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuXG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbikpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG5cdFx0XHRcdFx0aWYgKGNoaWxkICE9IG51bGwpIG9ucmVtb3ZlKGNoaWxkKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdC8vYXR0cnMyXG5cdGZ1bmN0aW9uIHNldEF0dHJzKHZub2RlLCBhdHRyczIsIG5zKSB7XG5cdFx0Zm9yICh2YXIga2V5MiBpbiBhdHRyczIpIHtcblx0XHRcdHNldEF0dHIodm5vZGUsIGtleTIsIG51bGwsIGF0dHJzMltrZXkyXSwgbnMpXG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHNldEF0dHIodm5vZGUsIGtleTIsIG9sZCwgdmFsdWUsIG5zKSB7XG5cdFx0dmFyIGVsZW1lbnQgPSB2bm9kZS5kb21cblx0XHRpZiAoa2V5MiA9PT0gXCJrZXlcIiB8fCBrZXkyID09PSBcImlzXCIgfHwgKG9sZCA9PT0gdmFsdWUgJiYgIWlzRm9ybUF0dHJpYnV0ZSh2bm9kZSwga2V5MikpICYmIHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgdmFsdWUgPT09IFwidW5kZWZpbmVkXCIgfHwgaXNMaWZlY3ljbGVNZXRob2Qoa2V5MikpIHJldHVyblxuXHRcdHZhciBuc0xhc3RJbmRleCA9IGtleTIuaW5kZXhPZihcIjpcIilcblx0XHRpZiAobnNMYXN0SW5kZXggPiAtMSAmJiBrZXkyLnN1YnN0cigwLCBuc0xhc3RJbmRleCkgPT09IFwieGxpbmtcIikge1xuXHRcdFx0ZWxlbWVudC5zZXRBdHRyaWJ1dGVOUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiwga2V5Mi5zbGljZShuc0xhc3RJbmRleCArIDEpLCB2YWx1ZSlcblx0XHR9XG5cdFx0ZWxzZSBpZiAoa2V5MlswXSA9PT0gXCJvXCIgJiYga2V5MlsxXSA9PT0gXCJuXCIgJiYgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHVwZGF0ZUV2ZW50KHZub2RlLCBrZXkyLCB2YWx1ZSlcblx0XHRlbHNlIGlmIChrZXkyID09PSBcInN0eWxlXCIpIHVwZGF0ZVN0eWxlKGVsZW1lbnQsIG9sZCwgdmFsdWUpXG5cdFx0ZWxzZSBpZiAoa2V5MiBpbiBlbGVtZW50ICYmICFpc0F0dHJpYnV0ZShrZXkyKSAmJiBucyA9PT0gdW5kZWZpbmVkICYmICFpc0N1c3RvbUVsZW1lbnQodm5vZGUpKSB7XG5cdFx0XHRpZiAoa2V5MiA9PT0gXCJ2YWx1ZVwiKSB7XG5cdFx0XHRcdHZhciBub3JtYWxpemVkMCA9IFwiXCIgKyB2YWx1ZSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWltcGxpY2l0LWNvZXJjaW9uXG5cdFx0XHRcdC8vc2V0dGluZyBpbnB1dFt2YWx1ZV0gdG8gc2FtZSB2YWx1ZSBieSB0eXBpbmcgb24gZm9jdXNlZCBlbGVtZW50IG1vdmVzIGN1cnNvciB0byBlbmQgaW4gQ2hyb21lXG5cdFx0XHRcdGlmICgodm5vZGUudGFnID09PSBcImlucHV0XCIgfHwgdm5vZGUudGFnID09PSBcInRleHRhcmVhXCIpICYmIHZub2RlLmRvbS52YWx1ZSA9PT0gbm9ybWFsaXplZDAgJiYgdm5vZGUuZG9tID09PSAkZG9jLmFjdGl2ZUVsZW1lbnQpIHJldHVyblxuXHRcdFx0XHQvL3NldHRpbmcgc2VsZWN0W3ZhbHVlXSB0byBzYW1lIHZhbHVlIHdoaWxlIGhhdmluZyBzZWxlY3Qgb3BlbiBibGlua3Mgc2VsZWN0IGRyb3Bkb3duIGluIENocm9tZVxuXHRcdFx0XHRpZiAodm5vZGUudGFnID09PSBcInNlbGVjdFwiKSB7XG5cdFx0XHRcdFx0aWYgKHZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRpZiAodm5vZGUuZG9tLnNlbGVjdGVkSW5kZXggPT09IC0xICYmIHZub2RlLmRvbSA9PT0gJGRvYy5hY3RpdmVFbGVtZW50KSByZXR1cm5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYgKG9sZCAhPT0gbnVsbCAmJiB2bm9kZS5kb20udmFsdWUgPT09IG5vcm1hbGl6ZWQwICYmIHZub2RlLmRvbSA9PT0gJGRvYy5hY3RpdmVFbGVtZW50KSByZXR1cm5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly9zZXR0aW5nIG9wdGlvblt2YWx1ZV0gdG8gc2FtZSB2YWx1ZSB3aGlsZSBoYXZpbmcgc2VsZWN0IG9wZW4gYmxpbmtzIHNlbGVjdCBkcm9wZG93biBpbiBDaHJvbWVcblx0XHRcdFx0aWYgKHZub2RlLnRhZyA9PT0gXCJvcHRpb25cIiAmJiBvbGQgIT0gbnVsbCAmJiB2bm9kZS5kb20udmFsdWUgPT09IG5vcm1hbGl6ZWQwKSByZXR1cm5cblx0XHRcdH1cblx0XHRcdC8vIElmIHlvdSBhc3NpZ24gYW4gaW5wdXQgdHlwZTEgdGhhdCBpcyBub3Qgc3VwcG9ydGVkIGJ5IElFIDExIHdpdGggYW4gYXNzaWdubWVudCBleHByZXNzaW9uLCBhbiBlcnJvcjAgd2lsbCBvY2N1ci5cblx0XHRcdGlmICh2bm9kZS50YWcgPT09IFwiaW5wdXRcIiAmJiBrZXkyID09PSBcInR5cGVcIikge1xuXHRcdFx0XHRlbGVtZW50LnNldEF0dHJpYnV0ZShrZXkyLCB2YWx1ZSlcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cdFx0XHRlbGVtZW50W2tleTJdID0gdmFsdWVcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIikge1xuXHRcdFx0XHRpZiAodmFsdWUpIGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleTIsIFwiXCIpXG5cdFx0XHRcdGVsc2UgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoa2V5Milcblx0XHRcdH1cblx0XHRcdGVsc2UgZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5MiA9PT0gXCJjbGFzc05hbWVcIiA/IFwiY2xhc3NcIiA6IGtleTIsIHZhbHVlKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBzZXRMYXRlQXR0cnModm5vZGUpIHtcblx0XHR2YXIgYXR0cnMyID0gdm5vZGUuYXR0cnNcblx0XHRpZiAodm5vZGUudGFnID09PSBcInNlbGVjdFwiICYmIGF0dHJzMiAhPSBudWxsKSB7XG5cdFx0XHRpZiAoXCJ2YWx1ZVwiIGluIGF0dHJzMikgc2V0QXR0cih2bm9kZSwgXCJ2YWx1ZVwiLCBudWxsLCBhdHRyczIudmFsdWUsIHVuZGVmaW5lZClcblx0XHRcdGlmIChcInNlbGVjdGVkSW5kZXhcIiBpbiBhdHRyczIpIHNldEF0dHIodm5vZGUsIFwic2VsZWN0ZWRJbmRleFwiLCBudWxsLCBhdHRyczIuc2VsZWN0ZWRJbmRleCwgdW5kZWZpbmVkKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVBdHRycyh2bm9kZSwgb2xkLCBhdHRyczIsIG5zKSB7XG5cdFx0aWYgKGF0dHJzMiAhPSBudWxsKSB7XG5cdFx0XHRmb3IgKHZhciBrZXkyIGluIGF0dHJzMikge1xuXHRcdFx0XHRzZXRBdHRyKHZub2RlLCBrZXkyLCBvbGQgJiYgb2xkW2tleTJdLCBhdHRyczJba2V5Ml0sIG5zKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAob2xkICE9IG51bGwpIHtcblx0XHRcdGZvciAodmFyIGtleTIgaW4gb2xkKSB7XG5cdFx0XHRcdGlmIChhdHRyczIgPT0gbnVsbCB8fCAhKGtleTIgaW4gYXR0cnMyKSkge1xuXHRcdFx0XHRcdGlmIChrZXkyID09PSBcImNsYXNzTmFtZVwiKSBrZXkyID0gXCJjbGFzc1wiXG5cdFx0XHRcdFx0aWYgKGtleTJbMF0gPT09IFwib1wiICYmIGtleTJbMV0gPT09IFwiblwiICYmICFpc0xpZmVjeWNsZU1ldGhvZChrZXkyKSkgdXBkYXRlRXZlbnQodm5vZGUsIGtleTIsIHVuZGVmaW5lZClcblx0XHRcdFx0XHRlbHNlIGlmIChrZXkyICE9PSBcImtleVwiKSB2bm9kZS5kb20ucmVtb3ZlQXR0cmlidXRlKGtleTIpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gaXNGb3JtQXR0cmlidXRlKHZub2RlLCBhdHRyKSB7XG5cdFx0cmV0dXJuIGF0dHIgPT09IFwidmFsdWVcIiB8fCBhdHRyID09PSBcImNoZWNrZWRcIiB8fCBhdHRyID09PSBcInNlbGVjdGVkSW5kZXhcIiB8fCBhdHRyID09PSBcInNlbGVjdGVkXCIgJiYgdm5vZGUuZG9tID09PSAkZG9jLmFjdGl2ZUVsZW1lbnRcblx0fVxuXHRmdW5jdGlvbiBpc0xpZmVjeWNsZU1ldGhvZChhdHRyKSB7XG5cdFx0cmV0dXJuIGF0dHIgPT09IFwib25pbml0XCIgfHwgYXR0ciA9PT0gXCJvbmNyZWF0ZVwiIHx8IGF0dHIgPT09IFwib251cGRhdGVcIiB8fCBhdHRyID09PSBcIm9ucmVtb3ZlXCIgfHwgYXR0ciA9PT0gXCJvbmJlZm9yZXJlbW92ZVwiIHx8IGF0dHIgPT09IFwib25iZWZvcmV1cGRhdGVcIlxuXHR9XG5cdGZ1bmN0aW9uIGlzQXR0cmlidXRlKGF0dHIpIHtcblx0XHRyZXR1cm4gYXR0ciA9PT0gXCJocmVmXCIgfHwgYXR0ciA9PT0gXCJsaXN0XCIgfHwgYXR0ciA9PT0gXCJmb3JtXCIgfHwgYXR0ciA9PT0gXCJ3aWR0aFwiIHx8IGF0dHIgPT09IFwiaGVpZ2h0XCIvLyB8fCBhdHRyID09PSBcInR5cGVcIlxuXHR9XG5cdGZ1bmN0aW9uIGlzQ3VzdG9tRWxlbWVudCh2bm9kZSl7XG5cdFx0cmV0dXJuIHZub2RlLmF0dHJzLmlzIHx8IHZub2RlLnRhZy5pbmRleE9mKFwiLVwiKSA+IC0xXG5cdH1cblx0ZnVuY3Rpb24gaGFzSW50ZWdyYXRpb25NZXRob2RzKHNvdXJjZSkge1xuXHRcdHJldHVybiBzb3VyY2UgIT0gbnVsbCAmJiAoc291cmNlLm9uY3JlYXRlIHx8IHNvdXJjZS5vbnVwZGF0ZSB8fCBzb3VyY2Uub25iZWZvcmVyZW1vdmUgfHwgc291cmNlLm9ucmVtb3ZlKVxuXHR9XG5cdC8vc3R5bGVcblx0ZnVuY3Rpb24gdXBkYXRlU3R5bGUoZWxlbWVudCwgb2xkLCBzdHlsZSkge1xuXHRcdGlmIChvbGQgPT09IHN0eWxlKSBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSBcIlwiLCBvbGQgPSBudWxsXG5cdFx0aWYgKHN0eWxlID09IG51bGwpIGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IFwiXCJcblx0XHRlbHNlIGlmICh0eXBlb2Ygc3R5bGUgPT09IFwic3RyaW5nXCIpIGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IHN0eWxlXG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAodHlwZW9mIG9sZCA9PT0gXCJzdHJpbmdcIikgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gXCJcIlxuXHRcdFx0Zm9yICh2YXIga2V5MiBpbiBzdHlsZSkge1xuXHRcdFx0XHRlbGVtZW50LnN0eWxlW2tleTJdID0gc3R5bGVba2V5Ml1cblx0XHRcdH1cblx0XHRcdGlmIChvbGQgIT0gbnVsbCAmJiB0eXBlb2Ygb2xkICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdGZvciAodmFyIGtleTIgaW4gb2xkKSB7XG5cdFx0XHRcdFx0aWYgKCEoa2V5MiBpbiBzdHlsZSkpIGVsZW1lbnQuc3R5bGVba2V5Ml0gPSBcIlwiXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0Ly9ldmVudFxuXHRmdW5jdGlvbiB1cGRhdGVFdmVudCh2bm9kZSwga2V5MiwgdmFsdWUpIHtcblx0XHR2YXIgZWxlbWVudCA9IHZub2RlLmRvbVxuXHRcdHZhciBjYWxsYmFjayA9IHR5cGVvZiBvbmV2ZW50ICE9PSBcImZ1bmN0aW9uXCIgPyB2YWx1ZSA6IGZ1bmN0aW9uKGUpIHtcblx0XHRcdHZhciByZXN1bHQgPSB2YWx1ZS5jYWxsKGVsZW1lbnQsIGUpXG5cdFx0XHRvbmV2ZW50LmNhbGwoZWxlbWVudCwgZSlcblx0XHRcdHJldHVybiByZXN1bHRcblx0XHR9XG5cdFx0aWYgKGtleTIgaW4gZWxlbWVudCkgZWxlbWVudFtrZXkyXSA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gY2FsbGJhY2sgOiBudWxsXG5cdFx0ZWxzZSB7XG5cdFx0XHR2YXIgZXZlbnROYW1lID0ga2V5Mi5zbGljZSgyKVxuXHRcdFx0aWYgKHZub2RlLmV2ZW50cyA9PT0gdW5kZWZpbmVkKSB2bm9kZS5ldmVudHMgPSB7fVxuXHRcdFx0aWYgKHZub2RlLmV2ZW50c1trZXkyXSA9PT0gY2FsbGJhY2spIHJldHVyblxuXHRcdFx0aWYgKHZub2RlLmV2ZW50c1trZXkyXSAhPSBudWxsKSBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB2bm9kZS5ldmVudHNba2V5Ml0sIGZhbHNlKVxuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdHZub2RlLmV2ZW50c1trZXkyXSA9IGNhbGxiYWNrXG5cdFx0XHRcdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHZub2RlLmV2ZW50c1trZXkyXSwgZmFsc2UpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdC8vbGlmZWN5Y2xlXG5cdGZ1bmN0aW9uIGluaXRMaWZlY3ljbGUoc291cmNlLCB2bm9kZSwgaG9va3MpIHtcblx0XHRpZiAodHlwZW9mIHNvdXJjZS5vbmluaXQgPT09IFwiZnVuY3Rpb25cIikgc291cmNlLm9uaW5pdC5jYWxsKHZub2RlLnN0YXRlLCB2bm9kZSlcblx0XHRpZiAodHlwZW9mIHNvdXJjZS5vbmNyZWF0ZSA9PT0gXCJmdW5jdGlvblwiKSBob29rcy5wdXNoKHNvdXJjZS5vbmNyZWF0ZS5iaW5kKHZub2RlLnN0YXRlLCB2bm9kZSkpXG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlTGlmZWN5Y2xlKHNvdXJjZSwgdm5vZGUsIGhvb2tzKSB7XG5cdFx0aWYgKHR5cGVvZiBzb3VyY2Uub251cGRhdGUgPT09IFwiZnVuY3Rpb25cIikgaG9va3MucHVzaChzb3VyY2Uub251cGRhdGUuYmluZCh2bm9kZS5zdGF0ZSwgdm5vZGUpKVxuXHR9XG5cdGZ1bmN0aW9uIHNob3VsZE5vdFVwZGF0ZSh2bm9kZSwgb2xkKSB7XG5cdFx0dmFyIGZvcmNlVm5vZGVVcGRhdGUsIGZvcmNlQ29tcG9uZW50VXBkYXRlXG5cdFx0aWYgKHZub2RlLmF0dHJzICE9IG51bGwgJiYgdHlwZW9mIHZub2RlLmF0dHJzLm9uYmVmb3JldXBkYXRlID09PSBcImZ1bmN0aW9uXCIpIGZvcmNlVm5vZGVVcGRhdGUgPSB2bm9kZS5hdHRycy5vbmJlZm9yZXVwZGF0ZS5jYWxsKHZub2RlLnN0YXRlLCB2bm9kZSwgb2xkKVxuXHRcdGlmICh0eXBlb2Ygdm5vZGUudGFnICE9PSBcInN0cmluZ1wiICYmIHR5cGVvZiB2bm9kZS5fc3RhdGUub25iZWZvcmV1cGRhdGUgPT09IFwiZnVuY3Rpb25cIikgZm9yY2VDb21wb25lbnRVcGRhdGUgPSB2bm9kZS5fc3RhdGUub25iZWZvcmV1cGRhdGUuY2FsbCh2bm9kZS5zdGF0ZSwgdm5vZGUsIG9sZClcblx0XHRpZiAoIShmb3JjZVZub2RlVXBkYXRlID09PSB1bmRlZmluZWQgJiYgZm9yY2VDb21wb25lbnRVcGRhdGUgPT09IHVuZGVmaW5lZCkgJiYgIWZvcmNlVm5vZGVVcGRhdGUgJiYgIWZvcmNlQ29tcG9uZW50VXBkYXRlKSB7XG5cdFx0XHR2bm9kZS5kb20gPSBvbGQuZG9tXG5cdFx0XHR2bm9kZS5kb21TaXplID0gb2xkLmRvbVNpemVcblx0XHRcdHZub2RlLmluc3RhbmNlID0gb2xkLmluc3RhbmNlXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXHRmdW5jdGlvbiByZW5kZXIoZG9tLCB2bm9kZXMpIHtcblx0XHRpZiAoIWRvbSkgdGhyb3cgbmV3IEVycm9yKFwiRW5zdXJlIHRoZSBET00gZWxlbWVudCBiZWluZyBwYXNzZWQgdG8gbS5yb3V0ZS9tLm1vdW50L20ucmVuZGVyIGlzIG5vdCB1bmRlZmluZWQuXCIpXG5cdFx0dmFyIGhvb2tzID0gW11cblx0XHR2YXIgYWN0aXZlID0gJGRvYy5hY3RpdmVFbGVtZW50XG5cdFx0dmFyIG5hbWVzcGFjZSA9IGRvbS5uYW1lc3BhY2VVUklcblx0XHQvLyBGaXJzdCB0aW1lMCByZW5kZXJpbmcgaW50byBhIG5vZGUgY2xlYXJzIGl0IG91dFxuXHRcdGlmIChkb20udm5vZGVzID09IG51bGwpIGRvbS50ZXh0Q29udGVudCA9IFwiXCJcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkodm5vZGVzKSkgdm5vZGVzID0gW3Zub2Rlc11cblx0XHR1cGRhdGVOb2Rlcyhkb20sIGRvbS52bm9kZXMsIFZub2RlLm5vcm1hbGl6ZUNoaWxkcmVuKHZub2RlcyksIGZhbHNlLCBob29rcywgbnVsbCwgbmFtZXNwYWNlID09PSBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIiA/IHVuZGVmaW5lZCA6IG5hbWVzcGFjZSlcblx0XHRkb20udm5vZGVzID0gdm5vZGVzXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBob29rcy5sZW5ndGg7IGkrKykgaG9va3NbaV0oKVxuXHRcdC8vIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgY2FuIHJldHVybiBudWxsIGluIElFIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Eb2N1bWVudC9hY3RpdmVFbGVtZW50XG5cdFx0aWYgKGFjdGl2ZSAhPSBudWxsICYmICRkb2MuYWN0aXZlRWxlbWVudCAhPT0gYWN0aXZlKSBhY3RpdmUuZm9jdXMoKVxuXHR9XG5cdHJldHVybiB7cmVuZGVyOiByZW5kZXIsIHNldEV2ZW50Q2FsbGJhY2s6IHNldEV2ZW50Q2FsbGJhY2t9XG59XG5mdW5jdGlvbiB0aHJvdHRsZShjYWxsYmFjaykge1xuXHQvLzYwZnBzIHRyYW5zbGF0ZXMgdG8gMTYuNm1zLCByb3VuZCBpdCBkb3duIHNpbmNlIHNldFRpbWVvdXQgcmVxdWlyZXMgaW50XG5cdHZhciB0aW1lID0gMTZcblx0dmFyIGxhc3QgPSAwLCBwZW5kaW5nID0gbnVsbFxuXHR2YXIgdGltZW91dCA9IHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT09IFwiZnVuY3Rpb25cIiA/IHJlcXVlc3RBbmltYXRpb25GcmFtZSA6IHNldFRpbWVvdXRcblx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBub3cgPSBEYXRlLm5vdygpXG5cdFx0aWYgKGxhc3QgPT09IDAgfHwgbm93IC0gbGFzdCA+PSB0aW1lKSB7XG5cdFx0XHRsYXN0ID0gbm93XG5cdFx0XHRjYWxsYmFjaygpXG5cdFx0fVxuXHRcdGVsc2UgaWYgKHBlbmRpbmcgPT09IG51bGwpIHtcblx0XHRcdHBlbmRpbmcgPSB0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRwZW5kaW5nID0gbnVsbFxuXHRcdFx0XHRjYWxsYmFjaygpXG5cdFx0XHRcdGxhc3QgPSBEYXRlLm5vdygpXG5cdFx0XHR9LCB0aW1lIC0gKG5vdyAtIGxhc3QpKVxuXHRcdH1cblx0fVxufVxudmFyIF8xMSA9IGZ1bmN0aW9uKCR3aW5kb3cpIHtcblx0dmFyIHJlbmRlclNlcnZpY2UgPSBjb3JlUmVuZGVyZXIoJHdpbmRvdylcblx0cmVuZGVyU2VydmljZS5zZXRFdmVudENhbGxiYWNrKGZ1bmN0aW9uKGUpIHtcblx0XHRpZiAoZS5yZWRyYXcgPT09IGZhbHNlKSBlLnJlZHJhdyA9IHVuZGVmaW5lZFxuXHRcdGVsc2UgcmVkcmF3KClcblx0fSlcblx0dmFyIGNhbGxiYWNrcyA9IFtdXG5cdGZ1bmN0aW9uIHN1YnNjcmliZShrZXkxLCBjYWxsYmFjaykge1xuXHRcdHVuc3Vic2NyaWJlKGtleTEpXG5cdFx0Y2FsbGJhY2tzLnB1c2goa2V5MSwgdGhyb3R0bGUoY2FsbGJhY2spKVxuXHR9XG5cdGZ1bmN0aW9uIHVuc3Vic2NyaWJlKGtleTEpIHtcblx0XHR2YXIgaW5kZXggPSBjYWxsYmFja3MuaW5kZXhPZihrZXkxKVxuXHRcdGlmIChpbmRleCA+IC0xKSBjYWxsYmFja3Muc3BsaWNlKGluZGV4LCAyKVxuXHR9XG5cdGZ1bmN0aW9uIHJlZHJhdygpIHtcblx0XHRmb3IgKHZhciBpID0gMTsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkgKz0gMikge1xuXHRcdFx0Y2FsbGJhY2tzW2ldKClcblx0XHR9XG5cdH1cblx0cmV0dXJuIHtzdWJzY3JpYmU6IHN1YnNjcmliZSwgdW5zdWJzY3JpYmU6IHVuc3Vic2NyaWJlLCByZWRyYXc6IHJlZHJhdywgcmVuZGVyOiByZW5kZXJTZXJ2aWNlLnJlbmRlcn1cbn1cbnZhciByZWRyYXdTZXJ2aWNlID0gXzExKHdpbmRvdylcbnJlcXVlc3RTZXJ2aWNlLnNldENvbXBsZXRpb25DYWxsYmFjayhyZWRyYXdTZXJ2aWNlLnJlZHJhdylcbnZhciBfMTYgPSBmdW5jdGlvbihyZWRyYXdTZXJ2aWNlMCkge1xuXHRyZXR1cm4gZnVuY3Rpb24ocm9vdCwgY29tcG9uZW50KSB7XG5cdFx0aWYgKGNvbXBvbmVudCA9PT0gbnVsbCkge1xuXHRcdFx0cmVkcmF3U2VydmljZTAucmVuZGVyKHJvb3QsIFtdKVxuXHRcdFx0cmVkcmF3U2VydmljZTAudW5zdWJzY3JpYmUocm9vdClcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRcblx0XHRpZiAoY29tcG9uZW50LnZpZXcgPT0gbnVsbCAmJiB0eXBlb2YgY29tcG9uZW50ICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihcIm0ubW91bnQoZWxlbWVudCwgY29tcG9uZW50KSBleHBlY3RzIGEgY29tcG9uZW50LCBub3QgYSB2bm9kZVwiKVxuXHRcdFxuXHRcdHZhciBydW4wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZWRyYXdTZXJ2aWNlMC5yZW5kZXIocm9vdCwgVm5vZGUoY29tcG9uZW50KSlcblx0XHR9XG5cdFx0cmVkcmF3U2VydmljZTAuc3Vic2NyaWJlKHJvb3QsIHJ1bjApXG5cdFx0cmVkcmF3U2VydmljZTAucmVkcmF3KClcblx0fVxufVxubS5tb3VudCA9IF8xNihyZWRyYXdTZXJ2aWNlKVxudmFyIFByb21pc2UgPSBQcm9taXNlUG9seWZpbGxcbnZhciBwYXJzZVF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24oc3RyaW5nKSB7XG5cdGlmIChzdHJpbmcgPT09IFwiXCIgfHwgc3RyaW5nID09IG51bGwpIHJldHVybiB7fVxuXHRpZiAoc3RyaW5nLmNoYXJBdCgwKSA9PT0gXCI/XCIpIHN0cmluZyA9IHN0cmluZy5zbGljZSgxKVxuXHR2YXIgZW50cmllcyA9IHN0cmluZy5zcGxpdChcIiZcIiksIGRhdGEwID0ge30sIGNvdW50ZXJzID0ge31cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGVudHJ5ID0gZW50cmllc1tpXS5zcGxpdChcIj1cIilcblx0XHR2YXIga2V5NSA9IGRlY29kZVVSSUNvbXBvbmVudChlbnRyeVswXSlcblx0XHR2YXIgdmFsdWUgPSBlbnRyeS5sZW5ndGggPT09IDIgPyBkZWNvZGVVUklDb21wb25lbnQoZW50cnlbMV0pIDogXCJcIlxuXHRcdGlmICh2YWx1ZSA9PT0gXCJ0cnVlXCIpIHZhbHVlID0gdHJ1ZVxuXHRcdGVsc2UgaWYgKHZhbHVlID09PSBcImZhbHNlXCIpIHZhbHVlID0gZmFsc2Vcblx0XHR2YXIgbGV2ZWxzID0ga2V5NS5zcGxpdCgvXFxdXFxbP3xcXFsvKVxuXHRcdHZhciBjdXJzb3IgPSBkYXRhMFxuXHRcdGlmIChrZXk1LmluZGV4T2YoXCJbXCIpID4gLTEpIGxldmVscy5wb3AoKVxuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgbGV2ZWxzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHR2YXIgbGV2ZWwgPSBsZXZlbHNbal0sIG5leHRMZXZlbCA9IGxldmVsc1tqICsgMV1cblx0XHRcdHZhciBpc051bWJlciA9IG5leHRMZXZlbCA9PSBcIlwiIHx8ICFpc05hTihwYXJzZUludChuZXh0TGV2ZWwsIDEwKSlcblx0XHRcdHZhciBpc1ZhbHVlID0gaiA9PT0gbGV2ZWxzLmxlbmd0aCAtIDFcblx0XHRcdGlmIChsZXZlbCA9PT0gXCJcIikge1xuXHRcdFx0XHR2YXIga2V5NSA9IGxldmVscy5zbGljZSgwLCBqKS5qb2luKClcblx0XHRcdFx0aWYgKGNvdW50ZXJzW2tleTVdID09IG51bGwpIGNvdW50ZXJzW2tleTVdID0gMFxuXHRcdFx0XHRsZXZlbCA9IGNvdW50ZXJzW2tleTVdKytcblx0XHRcdH1cblx0XHRcdGlmIChjdXJzb3JbbGV2ZWxdID09IG51bGwpIHtcblx0XHRcdFx0Y3Vyc29yW2xldmVsXSA9IGlzVmFsdWUgPyB2YWx1ZSA6IGlzTnVtYmVyID8gW10gOiB7fVxuXHRcdFx0fVxuXHRcdFx0Y3Vyc29yID0gY3Vyc29yW2xldmVsXVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gZGF0YTBcbn1cbnZhciBjb3JlUm91dGVyID0gZnVuY3Rpb24oJHdpbmRvdykge1xuXHR2YXIgc3VwcG9ydHNQdXNoU3RhdGUgPSB0eXBlb2YgJHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSA9PT0gXCJmdW5jdGlvblwiXG5cdHZhciBjYWxsQXN5bmMwID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gc2V0SW1tZWRpYXRlIDogc2V0VGltZW91dFxuXHRmdW5jdGlvbiBub3JtYWxpemUxKGZyYWdtZW50MCkge1xuXHRcdHZhciBkYXRhID0gJHdpbmRvdy5sb2NhdGlvbltmcmFnbWVudDBdLnJlcGxhY2UoLyg/OiVbYS1mODldW2EtZjAtOV0pKy9naW0sIGRlY29kZVVSSUNvbXBvbmVudClcblx0XHRpZiAoZnJhZ21lbnQwID09PSBcInBhdGhuYW1lXCIgJiYgZGF0YVswXSAhPT0gXCIvXCIpIGRhdGEgPSBcIi9cIiArIGRhdGFcblx0XHRyZXR1cm4gZGF0YVxuXHR9XG5cdHZhciBhc3luY0lkXG5cdGZ1bmN0aW9uIGRlYm91bmNlQXN5bmMoY2FsbGJhY2swKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKGFzeW5jSWQgIT0gbnVsbCkgcmV0dXJuXG5cdFx0XHRhc3luY0lkID0gY2FsbEFzeW5jMChmdW5jdGlvbigpIHtcblx0XHRcdFx0YXN5bmNJZCA9IG51bGxcblx0XHRcdFx0Y2FsbGJhY2swKClcblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHBhcnNlUGF0aChwYXRoLCBxdWVyeURhdGEsIGhhc2hEYXRhKSB7XG5cdFx0dmFyIHF1ZXJ5SW5kZXggPSBwYXRoLmluZGV4T2YoXCI/XCIpXG5cdFx0dmFyIGhhc2hJbmRleCA9IHBhdGguaW5kZXhPZihcIiNcIilcblx0XHR2YXIgcGF0aEVuZCA9IHF1ZXJ5SW5kZXggPiAtMSA/IHF1ZXJ5SW5kZXggOiBoYXNoSW5kZXggPiAtMSA/IGhhc2hJbmRleCA6IHBhdGgubGVuZ3RoXG5cdFx0aWYgKHF1ZXJ5SW5kZXggPiAtMSkge1xuXHRcdFx0dmFyIHF1ZXJ5RW5kID0gaGFzaEluZGV4ID4gLTEgPyBoYXNoSW5kZXggOiBwYXRoLmxlbmd0aFxuXHRcdFx0dmFyIHF1ZXJ5UGFyYW1zID0gcGFyc2VRdWVyeVN0cmluZyhwYXRoLnNsaWNlKHF1ZXJ5SW5kZXggKyAxLCBxdWVyeUVuZCkpXG5cdFx0XHRmb3IgKHZhciBrZXk0IGluIHF1ZXJ5UGFyYW1zKSBxdWVyeURhdGFba2V5NF0gPSBxdWVyeVBhcmFtc1trZXk0XVxuXHRcdH1cblx0XHRpZiAoaGFzaEluZGV4ID4gLTEpIHtcblx0XHRcdHZhciBoYXNoUGFyYW1zID0gcGFyc2VRdWVyeVN0cmluZyhwYXRoLnNsaWNlKGhhc2hJbmRleCArIDEpKVxuXHRcdFx0Zm9yICh2YXIga2V5NCBpbiBoYXNoUGFyYW1zKSBoYXNoRGF0YVtrZXk0XSA9IGhhc2hQYXJhbXNba2V5NF1cblx0XHR9XG5cdFx0cmV0dXJuIHBhdGguc2xpY2UoMCwgcGF0aEVuZClcblx0fVxuXHR2YXIgcm91dGVyID0ge3ByZWZpeDogXCIjIVwifVxuXHRyb3V0ZXIuZ2V0UGF0aCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciB0eXBlMiA9IHJvdXRlci5wcmVmaXguY2hhckF0KDApXG5cdFx0c3dpdGNoICh0eXBlMikge1xuXHRcdFx0Y2FzZSBcIiNcIjogcmV0dXJuIG5vcm1hbGl6ZTEoXCJoYXNoXCIpLnNsaWNlKHJvdXRlci5wcmVmaXgubGVuZ3RoKVxuXHRcdFx0Y2FzZSBcIj9cIjogcmV0dXJuIG5vcm1hbGl6ZTEoXCJzZWFyY2hcIikuc2xpY2Uocm91dGVyLnByZWZpeC5sZW5ndGgpICsgbm9ybWFsaXplMShcImhhc2hcIilcblx0XHRcdGRlZmF1bHQ6IHJldHVybiBub3JtYWxpemUxKFwicGF0aG5hbWVcIikuc2xpY2Uocm91dGVyLnByZWZpeC5sZW5ndGgpICsgbm9ybWFsaXplMShcInNlYXJjaFwiKSArIG5vcm1hbGl6ZTEoXCJoYXNoXCIpXG5cdFx0fVxuXHR9XG5cdHJvdXRlci5zZXRQYXRoID0gZnVuY3Rpb24ocGF0aCwgZGF0YSwgb3B0aW9ucykge1xuXHRcdHZhciBxdWVyeURhdGEgPSB7fSwgaGFzaERhdGEgPSB7fVxuXHRcdHBhdGggPSBwYXJzZVBhdGgocGF0aCwgcXVlcnlEYXRhLCBoYXNoRGF0YSlcblx0XHRpZiAoZGF0YSAhPSBudWxsKSB7XG5cdFx0XHRmb3IgKHZhciBrZXk0IGluIGRhdGEpIHF1ZXJ5RGF0YVtrZXk0XSA9IGRhdGFba2V5NF1cblx0XHRcdHBhdGggPSBwYXRoLnJlcGxhY2UoLzooW15cXC9dKykvZywgZnVuY3Rpb24obWF0Y2gyLCB0b2tlbikge1xuXHRcdFx0XHRkZWxldGUgcXVlcnlEYXRhW3Rva2VuXVxuXHRcdFx0XHRyZXR1cm4gZGF0YVt0b2tlbl1cblx0XHRcdH0pXG5cdFx0fVxuXHRcdHZhciBxdWVyeSA9IGJ1aWxkUXVlcnlTdHJpbmcocXVlcnlEYXRhKVxuXHRcdGlmIChxdWVyeSkgcGF0aCArPSBcIj9cIiArIHF1ZXJ5XG5cdFx0dmFyIGhhc2ggPSBidWlsZFF1ZXJ5U3RyaW5nKGhhc2hEYXRhKVxuXHRcdGlmIChoYXNoKSBwYXRoICs9IFwiI1wiICsgaGFzaFxuXHRcdGlmIChzdXBwb3J0c1B1c2hTdGF0ZSkge1xuXHRcdFx0dmFyIHN0YXRlID0gb3B0aW9ucyA/IG9wdGlvbnMuc3RhdGUgOiBudWxsXG5cdFx0XHR2YXIgdGl0bGUgPSBvcHRpb25zID8gb3B0aW9ucy50aXRsZSA6IG51bGxcblx0XHRcdCR3aW5kb3cub25wb3BzdGF0ZSgpXG5cdFx0XHRpZiAob3B0aW9ucyAmJiBvcHRpb25zLnJlcGxhY2UpICR3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoc3RhdGUsIHRpdGxlLCByb3V0ZXIucHJlZml4ICsgcGF0aClcblx0XHRcdGVsc2UgJHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShzdGF0ZSwgdGl0bGUsIHJvdXRlci5wcmVmaXggKyBwYXRoKVxuXHRcdH1cblx0XHRlbHNlICR3aW5kb3cubG9jYXRpb24uaHJlZiA9IHJvdXRlci5wcmVmaXggKyBwYXRoXG5cdH1cblx0cm91dGVyLmRlZmluZVJvdXRlcyA9IGZ1bmN0aW9uKHJvdXRlcywgcmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0ZnVuY3Rpb24gcmVzb2x2ZVJvdXRlKCkge1xuXHRcdFx0dmFyIHBhdGggPSByb3V0ZXIuZ2V0UGF0aCgpXG5cdFx0XHR2YXIgcGFyYW1zID0ge31cblx0XHRcdHZhciBwYXRobmFtZSA9IHBhcnNlUGF0aChwYXRoLCBwYXJhbXMsIHBhcmFtcylcblx0XHRcdHZhciBzdGF0ZSA9ICR3aW5kb3cuaGlzdG9yeS5zdGF0ZVxuXHRcdFx0aWYgKHN0YXRlICE9IG51bGwpIHtcblx0XHRcdFx0Zm9yICh2YXIgayBpbiBzdGF0ZSkgcGFyYW1zW2tdID0gc3RhdGVba11cblx0XHRcdH1cblx0XHRcdGZvciAodmFyIHJvdXRlMCBpbiByb3V0ZXMpIHtcblx0XHRcdFx0dmFyIG1hdGNoZXIgPSBuZXcgUmVnRXhwKFwiXlwiICsgcm91dGUwLnJlcGxhY2UoLzpbXlxcL10rP1xcLnszfS9nLCBcIiguKj8pXCIpLnJlcGxhY2UoLzpbXlxcL10rL2csIFwiKFteXFxcXC9dKylcIikgKyBcIlxcLz8kXCIpXG5cdFx0XHRcdGlmIChtYXRjaGVyLnRlc3QocGF0aG5hbWUpKSB7XG5cdFx0XHRcdFx0cGF0aG5hbWUucmVwbGFjZShtYXRjaGVyLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciBrZXlzID0gcm91dGUwLm1hdGNoKC86W15cXC9dKy9nKSB8fCBbXVxuXHRcdFx0XHRcdFx0dmFyIHZhbHVlcyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxLCAtMilcblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRwYXJhbXNba2V5c1tpXS5yZXBsYWNlKC86fFxcLi9nLCBcIlwiKV0gPSBkZWNvZGVVUklDb21wb25lbnQodmFsdWVzW2ldKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmVzb2x2ZShyb3V0ZXNbcm91dGUwXSwgcGFyYW1zLCBwYXRoLCByb3V0ZTApXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmVqZWN0KHBhdGgsIHBhcmFtcylcblx0XHR9XG5cdFx0aWYgKHN1cHBvcnRzUHVzaFN0YXRlKSAkd2luZG93Lm9ucG9wc3RhdGUgPSBkZWJvdW5jZUFzeW5jKHJlc29sdmVSb3V0ZSlcblx0XHRlbHNlIGlmIChyb3V0ZXIucHJlZml4LmNoYXJBdCgwKSA9PT0gXCIjXCIpICR3aW5kb3cub25oYXNoY2hhbmdlID0gcmVzb2x2ZVJvdXRlXG5cdFx0cmVzb2x2ZVJvdXRlKClcblx0fVxuXHRyZXR1cm4gcm91dGVyXG59XG52YXIgXzIwID0gZnVuY3Rpb24oJHdpbmRvdywgcmVkcmF3U2VydmljZTApIHtcblx0dmFyIHJvdXRlU2VydmljZSA9IGNvcmVSb3V0ZXIoJHdpbmRvdylcblx0dmFyIGlkZW50aXR5ID0gZnVuY3Rpb24odikge3JldHVybiB2fVxuXHR2YXIgcmVuZGVyMSwgY29tcG9uZW50LCBhdHRyczMsIGN1cnJlbnRQYXRoLCBsYXN0VXBkYXRlXG5cdHZhciByb3V0ZSA9IGZ1bmN0aW9uKHJvb3QsIGRlZmF1bHRSb3V0ZSwgcm91dGVzKSB7XG5cdFx0aWYgKHJvb3QgPT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwiRW5zdXJlIHRoZSBET00gZWxlbWVudCB0aGF0IHdhcyBwYXNzZWQgdG8gYG0ucm91dGVgIGlzIG5vdCB1bmRlZmluZWRcIilcblx0XHR2YXIgcnVuMSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKHJlbmRlcjEgIT0gbnVsbCkgcmVkcmF3U2VydmljZTAucmVuZGVyKHJvb3QsIHJlbmRlcjEoVm5vZGUoY29tcG9uZW50LCBhdHRyczMua2V5LCBhdHRyczMpKSlcblx0XHR9XG5cdFx0dmFyIGJhaWwgPSBmdW5jdGlvbihwYXRoKSB7XG5cdFx0XHRpZiAocGF0aCAhPT0gZGVmYXVsdFJvdXRlKSByb3V0ZVNlcnZpY2Uuc2V0UGF0aChkZWZhdWx0Um91dGUsIG51bGwsIHtyZXBsYWNlOiB0cnVlfSlcblx0XHRcdGVsc2UgdGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IHJlc29sdmUgZGVmYXVsdCByb3V0ZSBcIiArIGRlZmF1bHRSb3V0ZSlcblx0XHR9XG5cdFx0cm91dGVTZXJ2aWNlLmRlZmluZVJvdXRlcyhyb3V0ZXMsIGZ1bmN0aW9uKHBheWxvYWQsIHBhcmFtcywgcGF0aCkge1xuXHRcdFx0dmFyIHVwZGF0ZSA9IGxhc3RVcGRhdGUgPSBmdW5jdGlvbihyb3V0ZVJlc29sdmVyLCBjb21wKSB7XG5cdFx0XHRcdGlmICh1cGRhdGUgIT09IGxhc3RVcGRhdGUpIHJldHVyblxuXHRcdFx0XHRjb21wb25lbnQgPSBjb21wICE9IG51bGwgJiYgKHR5cGVvZiBjb21wLnZpZXcgPT09IFwiZnVuY3Rpb25cIiB8fCB0eXBlb2YgY29tcCA9PT0gXCJmdW5jdGlvblwiKT8gY29tcCA6IFwiZGl2XCJcblx0XHRcdFx0YXR0cnMzID0gcGFyYW1zLCBjdXJyZW50UGF0aCA9IHBhdGgsIGxhc3RVcGRhdGUgPSBudWxsXG5cdFx0XHRcdHJlbmRlcjEgPSAocm91dGVSZXNvbHZlci5yZW5kZXIgfHwgaWRlbnRpdHkpLmJpbmQocm91dGVSZXNvbHZlcilcblx0XHRcdFx0cnVuMSgpXG5cdFx0XHR9XG5cdFx0XHRpZiAocGF5bG9hZC52aWV3IHx8IHR5cGVvZiBwYXlsb2FkID09PSBcImZ1bmN0aW9uXCIpIHVwZGF0ZSh7fSwgcGF5bG9hZClcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRpZiAocGF5bG9hZC5vbm1hdGNoKSB7XG5cdFx0XHRcdFx0UHJvbWlzZS5yZXNvbHZlKHBheWxvYWQub25tYXRjaChwYXJhbXMsIHBhdGgpKS50aGVuKGZ1bmN0aW9uKHJlc29sdmVkKSB7XG5cdFx0XHRcdFx0XHR1cGRhdGUocGF5bG9hZCwgcmVzb2x2ZWQpXG5cdFx0XHRcdFx0fSwgYmFpbClcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHVwZGF0ZShwYXlsb2FkLCBcImRpdlwiKVxuXHRcdFx0fVxuXHRcdH0sIGJhaWwpXG5cdFx0cmVkcmF3U2VydmljZTAuc3Vic2NyaWJlKHJvb3QsIHJ1bjEpXG5cdH1cblx0cm91dGUuc2V0ID0gZnVuY3Rpb24ocGF0aCwgZGF0YSwgb3B0aW9ucykge1xuXHRcdGlmIChsYXN0VXBkYXRlICE9IG51bGwpIHtcblx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cdFx0XHRvcHRpb25zLnJlcGxhY2UgPSB0cnVlXG5cdFx0fVxuXHRcdGxhc3RVcGRhdGUgPSBudWxsXG5cdFx0cm91dGVTZXJ2aWNlLnNldFBhdGgocGF0aCwgZGF0YSwgb3B0aW9ucylcblx0fVxuXHRyb3V0ZS5nZXQgPSBmdW5jdGlvbigpIHtyZXR1cm4gY3VycmVudFBhdGh9XG5cdHJvdXRlLnByZWZpeCA9IGZ1bmN0aW9uKHByZWZpeDApIHtyb3V0ZVNlcnZpY2UucHJlZml4ID0gcHJlZml4MH1cblx0cm91dGUubGluayA9IGZ1bmN0aW9uKHZub2RlMSkge1xuXHRcdHZub2RlMS5kb20uc2V0QXR0cmlidXRlKFwiaHJlZlwiLCByb3V0ZVNlcnZpY2UucHJlZml4ICsgdm5vZGUxLmF0dHJzLmhyZWYpXG5cdFx0dm5vZGUxLmRvbS5vbmNsaWNrID0gZnVuY3Rpb24oZSkge1xuXHRcdFx0aWYgKGUuY3RybEtleSB8fCBlLm1ldGFLZXkgfHwgZS5zaGlmdEtleSB8fCBlLndoaWNoID09PSAyKSByZXR1cm5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdFx0ZS5yZWRyYXcgPSBmYWxzZVxuXHRcdFx0dmFyIGhyZWYgPSB0aGlzLmdldEF0dHJpYnV0ZShcImhyZWZcIilcblx0XHRcdGlmIChocmVmLmluZGV4T2Yocm91dGVTZXJ2aWNlLnByZWZpeCkgPT09IDApIGhyZWYgPSBocmVmLnNsaWNlKHJvdXRlU2VydmljZS5wcmVmaXgubGVuZ3RoKVxuXHRcdFx0cm91dGUuc2V0KGhyZWYsIHVuZGVmaW5lZCwgdW5kZWZpbmVkKVxuXHRcdH1cblx0fVxuXHRyb3V0ZS5wYXJhbSA9IGZ1bmN0aW9uKGtleTMpIHtcblx0XHRpZih0eXBlb2YgYXR0cnMzICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBrZXkzICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gYXR0cnMzW2tleTNdXG5cdFx0cmV0dXJuIGF0dHJzM1xuXHR9XG5cdHJldHVybiByb3V0ZVxufVxubS5yb3V0ZSA9IF8yMCh3aW5kb3csIHJlZHJhd1NlcnZpY2UpXG5tLndpdGhBdHRyID0gZnVuY3Rpb24oYXR0ck5hbWUsIGNhbGxiYWNrMSwgY29udGV4dCkge1xuXHRyZXR1cm4gZnVuY3Rpb24oZSkge1xuXHRcdGNhbGxiYWNrMS5jYWxsKGNvbnRleHQgfHwgdGhpcywgYXR0ck5hbWUgaW4gZS5jdXJyZW50VGFyZ2V0ID8gZS5jdXJyZW50VGFyZ2V0W2F0dHJOYW1lXSA6IGUuY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoYXR0ck5hbWUpKVxuXHR9XG59XG52YXIgXzI4ID0gY29yZVJlbmRlcmVyKHdpbmRvdylcbm0ucmVuZGVyID0gXzI4LnJlbmRlclxubS5yZWRyYXcgPSByZWRyYXdTZXJ2aWNlLnJlZHJhd1xubS5yZXF1ZXN0ID0gcmVxdWVzdFNlcnZpY2UucmVxdWVzdFxubS5qc29ucCA9IHJlcXVlc3RTZXJ2aWNlLmpzb25wXG5tLnBhcnNlUXVlcnlTdHJpbmcgPSBwYXJzZVF1ZXJ5U3RyaW5nXG5tLmJ1aWxkUXVlcnlTdHJpbmcgPSBidWlsZFF1ZXJ5U3RyaW5nXG5tLnZlcnNpb24gPSBcIjEuMS40XCJcbm0udm5vZGUgPSBWbm9kZVxuaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIpIG1vZHVsZVtcImV4cG9ydHNcIl0gPSBtXG5lbHNlIHdpbmRvdy5tID0gbVxufSgpKTsiLCIvKlxuQ29weXJpZ2h0IChjKSAyMDE1LCBZYWhvbyEgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuQ29weXJpZ2h0cyBsaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBMaWNlbnNlLlxuU2VlIHRoZSBhY2NvbXBhbnlpbmcgTElDRU5TRSBmaWxlIGZvciB0ZXJtcy5cblxuQXV0aG9yczogTmVyYSBMaXUgPG5lcmFsaXVAeWFob28taW5jLmNvbT5cbiAgICAgICAgIEFkb25pcyBGdW5nIDxhZG9uQHlhaG9vLWluYy5jb20+XG4gICAgICAgICBBbGJlcnQgWXUgPGFsYmVydHl1QHlhaG9vLWluYy5jb20+XG4qL1xuLypqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuXG5leHBvcnRzLl9nZXRQcml2RmlsdGVycyA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBMVCAgICAgPSAvPC9nLFxuICAgICAgICBRVU9UICAgPSAvXCIvZyxcbiAgICAgICAgU1FVT1QgID0gLycvZyxcbiAgICAgICAgQU1QICAgID0gLyYvZyxcbiAgICAgICAgTlVMTCAgID0gL1xceDAwL2csXG4gICAgICAgIFNQRUNJQUxfQVRUUl9WQUxVRV9VTlFVT1RFRF9DSEFSUyA9IC8oPzpeJHxbXFx4MDBcXHgwOS1cXHgwRCBcIidgPTw+XSkvZyxcbiAgICAgICAgU1BFQ0lBTF9IVE1MX0NIQVJTID0gL1smPD5cIidgXS9nLCBcbiAgICAgICAgU1BFQ0lBTF9DT01NRU5UX0NIQVJTID0gLyg/OlxceDAwfF4tKiE/PnwtLSE/PnwtLT8hPyR8XFxdPnxcXF0kKS9nO1xuXG4gICAgLy8gQ1NTIHNlbnNpdGl2ZSBjaGFyczogKClcIicvLCEqQHt9OjtcbiAgICAvLyBCeSBDU1M6IChUYWJ8TmV3TGluZXxjb2xvbnxzZW1pfGxwYXJ8cnBhcnxhcG9zfHNvbHxjb21tYXxleGNsfGFzdHxtaWRhc3QpO3wocXVvdHxRVU9UKVxuICAgIC8vIEJ5IFVSSV9QUk9UT0NPTDogKFRhYnxOZXdMaW5lKTtcbiAgICB2YXIgU0VOU0lUSVZFX0hUTUxfRU5USVRJRVMgPSAvJig/OiMoW3hYXVswLTlBLUZhLWZdK3xcXGQrKTs/fChUYWJ8TmV3TGluZXxjb2xvbnxzZW1pfGxwYXJ8cnBhcnxhcG9zfHNvbHxjb21tYXxleGNsfGFzdHxtaWRhc3R8ZW5zcHxlbXNwfHRoaW5zcCk7fChuYnNwfGFtcHxBTVB8bHR8TFR8Z3R8R1R8cXVvdHxRVU9UKTs/KS9nLFxuICAgICAgICBTRU5TSVRJVkVfTkFNRURfUkVGX01BUCA9IHtUYWI6ICdcXHQnLCBOZXdMaW5lOiAnXFxuJywgY29sb246ICc6Jywgc2VtaTogJzsnLCBscGFyOiAnKCcsIHJwYXI6ICcpJywgYXBvczogJ1xcJycsIHNvbDogJy8nLCBjb21tYTogJywnLCBleGNsOiAnIScsIGFzdDogJyonLCBtaWRhc3Q6ICcqJywgZW5zcDogJ1xcdTIwMDInLCBlbXNwOiAnXFx1MjAwMycsIHRoaW5zcDogJ1xcdTIwMDknLCBuYnNwOiAnXFx4QTAnLCBhbXA6ICcmJywgbHQ6ICc8JywgZ3Q6ICc+JywgcXVvdDogJ1wiJywgUVVPVDogJ1wiJ307XG5cbiAgICAvLyB2YXIgQ1NTX1ZBTElEX1ZBTFVFID0gXG4gICAgLy8gICAgIC9eKD86XG4gICAgLy8gICAgICg/IS0qZXhwcmVzc2lvbikjP1stXFx3XStcbiAgICAvLyAgICAgfFsrLV0/KD86XFxkK3xcXGQqXFwuXFxkKykoPzplbXxleHxjaHxyZW18cHh8bW18Y218aW58cHR8cGN8JXx2aHx2d3x2bWlufHZtYXgpP1xuICAgIC8vICAgICB8IWltcG9ydGFudFxuICAgIC8vICAgICB8IC8vZW1wdHlcbiAgICAvLyAgICAgKSQvaTtcbiAgICB2YXIgQ1NTX1ZBTElEX1ZBTFVFID0gL14oPzooPyEtKmV4cHJlc3Npb24pIz9bLVxcd10rfFsrLV0/KD86XFxkK3xcXGQqXFwuXFxkKykoPzpyP2VtfGV4fGNofGNtfG1tfGlufHB4fHB0fHBjfCV8dmh8dnd8dm1pbnx2bWF4KT98IWltcG9ydGFudHwpJC9pLFxuICAgICAgICAvLyBUT0RPOiBwcmV2ZW50IGRvdWJsZSBjc3MgZXNjYXBpbmcgYnkgbm90IGVuY29kaW5nIFxcIGFnYWluLCBidXQgdGhpcyBtYXkgcmVxdWlyZSBDU1MgZGVjb2RpbmdcbiAgICAgICAgLy8gXFx4N0YgYW5kIFxceDAxLVxceDFGIGxlc3MgXFx4MDkgYXJlIGZvciBTYWZhcmkgNS4wLCBhZGRlZCBbXXt9LyogZm9yIHVuYmFsYW5jZWQgcXVvdGVcbiAgICAgICAgQ1NTX0RPVUJMRV9RVU9URURfQ0hBUlMgPSAvW1xceDAwLVxceDFGXFx4N0ZcXFtcXF17fVxcXFxcIl0vZyxcbiAgICAgICAgQ1NTX1NJTkdMRV9RVU9URURfQ0hBUlMgPSAvW1xceDAwLVxceDFGXFx4N0ZcXFtcXF17fVxcXFwnXS9nLFxuICAgICAgICAvLyAoLCBcXHUyMDdEIGFuZCBcXHUyMDhEIGNhbiBiZSB1c2VkIGluIGJhY2tncm91bmQ6ICd1cmwoLi4uKScgaW4gSUUsIGFzc3VtZWQgYWxsIFxcIGNoYXJzIGFyZSBlbmNvZGVkIGJ5IFFVT1RFRF9DSEFSUywgYW5kIG51bGwgaXMgYWxyZWFkeSByZXBsYWNlZCB3aXRoIFxcdUZGRkRcbiAgICAgICAgLy8gb3RoZXJ3aXNlLCB1c2UgdGhpcyBDU1NfQkxBQ0tMSVNUIGluc3RlYWQgKGVuaGFuY2UgaXQgd2l0aCB1cmwgbWF0Y2hpbmcpOiAvKD86XFxcXD9cXCh8W1xcdTIwN0RcXHUyMDhEXXxcXFxcMHswLDR9MjggP3xcXFxcMHswLDJ9MjBbNzhdW0RkXSA/KSsvZ1xuICAgICAgICBDU1NfQkxBQ0tMSVNUID0gL3VybFtcXChcXHUyMDdEXFx1MjA4RF0rL2csXG4gICAgICAgIC8vIHRoaXMgYXNzdW1lcyBlbmNvZGVVUkkoKSBhbmQgZW5jb2RlVVJJQ29tcG9uZW50KCkgaGFzIGVzY2FwZWQgMS0zMiwgMTI3IGZvciBJRThcbiAgICAgICAgQ1NTX1VOUVVPVEVEX1VSTCA9IC9bJ1xcKFxcKV0vZzsgLy8gXCIgXFwgdHJlYXRlZCBieSBlbmNvZGVVUkkoKVxuXG4gICAgLy8gR2l2ZW4gYSBmdWxsIFVSSSwgbmVlZCB0byBzdXBwb3J0IFwiW1wiICggSVB2NmFkZHJlc3MgKSBcIl1cIiBpbiBVUkkgYXMgcGVyIFJGQzM5ODZcbiAgICAvLyBSZWZlcmVuY2U6IGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2XG4gICAgdmFyIFVSTF9JUFY2ID0gL1xcL1xcLyU1W0JiXShbQS1GYS1mMC05Ol0rKSU1W0RkXS87XG5cblxuICAgIC8vIFJlZmVyZW5jZTogaHR0cDovL3NoYXp6ZXIuY28udWsvZGF0YWJhc2UvQWxsL2NoYXJhY3RlcnMtYWxsb3dkLWluLWh0bWwtZW50aXRpZXNcbiAgICAvLyBSZWZlcmVuY2U6IGh0dHA6Ly9zaGF6emVyLmNvLnVrL3ZlY3Rvci9DaGFyYWN0ZXJzLWFsbG93ZWQtYWZ0ZXItYW1wZXJzYW5kLWluLW5hbWVkLWNoYXJhY3Rlci1yZWZlcmVuY2VzXG4gICAgLy8gUmVmZXJlbmNlOiBodHRwOi8vc2hhenplci5jby51ay9kYXRhYmFzZS9BbGwvQ2hhcmFjdGVycy1iZWZvcmUtamF2YXNjcmlwdC11cmlcbiAgICAvLyBSZWZlcmVuY2U6IGh0dHA6Ly9zaGF6emVyLmNvLnVrL2RhdGFiYXNlL0FsbC9DaGFyYWN0ZXJzLWFmdGVyLWphdmFzY3JpcHQtdXJpXG4gICAgLy8gUmVmZXJlbmNlOiBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNjb25zdW1lLWEtY2hhcmFjdGVyLXJlZmVyZW5jZVxuICAgIC8vIFJlZmVyZW5jZSBmb3IgbmFtZWQgY2hhcmFjdGVyczogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvZW50aXRpZXMuanNvblxuICAgIHZhciBVUklfQkxBQ0tMSVNUX1BST1RPQ09MUyA9IHsnamF2YXNjcmlwdCc6MSwgJ2RhdGEnOjEsICd2YnNjcmlwdCc6MSwgJ21odG1sJzoxLCAneC1zY2hlbWEnOjF9LFxuICAgICAgICBVUklfUFJPVE9DT0xfQ09MT04gPSAvKD86OnwmI1t4WF0wKjNbYUFdOz98JiMwKjU4Oz98JmNvbG9uOykvLFxuICAgICAgICBVUklfUFJPVE9DT0xfV0hJVEVTUEFDRVMgPSAvKD86XltcXHgwMC1cXHgyMF0rfFtcXHRcXG5cXHJcXHgwMF0rKS9nLFxuICAgICAgICBVUklfUFJPVE9DT0xfTkFNRURfUkVGX01BUCA9IHtUYWI6ICdcXHQnLCBOZXdMaW5lOiAnXFxuJ307XG5cbiAgICB2YXIgeCwgXG4gICAgICAgIHN0clJlcGxhY2UgPSBmdW5jdGlvbiAocywgcmVnZXhwLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIHMgPT09IHVuZGVmaW5lZCA/ICd1bmRlZmluZWQnXG4gICAgICAgICAgICAgICAgICAgIDogcyA9PT0gbnVsbCAgICAgICAgICAgID8gJ251bGwnXG4gICAgICAgICAgICAgICAgICAgIDogcy50b1N0cmluZygpLnJlcGxhY2UocmVnZXhwLCBjYWxsYmFjayk7XG4gICAgICAgIH0sXG4gICAgICAgIGZyb21Db2RlUG9pbnQgPSBTdHJpbmcuZnJvbUNvZGVQb2ludCB8fCBmdW5jdGlvbihjb2RlUG9pbnQpIHtcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvZGVQb2ludCA8PSAweEZGRkYpIHsgLy8gQk1QIGNvZGUgcG9pbnRcbiAgICAgICAgICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlUG9pbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBc3RyYWwgY29kZSBwb2ludDsgc3BsaXQgaW4gc3Vycm9nYXRlIGhhbHZlc1xuICAgICAgICAgICAgLy8gaHR0cDovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZyNzdXJyb2dhdGUtZm9ybXVsYWVcbiAgICAgICAgICAgIGNvZGVQb2ludCAtPSAweDEwMDAwO1xuICAgICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoKGNvZGVQb2ludCA+PiAxMCkgKyAweEQ4MDAsIChjb2RlUG9pbnQgJSAweDQwMCkgKyAweERDMDApO1xuICAgICAgICB9O1xuXG5cbiAgICBmdW5jdGlvbiBnZXRQcm90b2NvbChzdHIpIHtcbiAgICAgICAgdmFyIHMgPSBzdHIuc3BsaXQoVVJJX1BST1RPQ09MX0NPTE9OLCAyKTtcbiAgICAgICAgLy8gc3RyLmxlbmd0aCAhPT0gc1swXS5sZW5ndGggaXMgZm9yIG9sZGVyIElFIChlLmcuLCB2OCksIHdoZXJlIGRlbGltZXRlciByZXNpZGluZyBhdCBsYXN0IHdpbGwgcmVzdWx0IGluIGxlbmd0aCBlcXVhbHMgMSwgYnV0IG5vdCAyXG4gICAgICAgIHJldHVybiAoc1swXSAmJiAocy5sZW5ndGggPT09IDIgfHwgc3RyLmxlbmd0aCAhPT0gc1swXS5sZW5ndGgpKSA/IHNbMF0gOiBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGh0bWxEZWNvZGUocywgbmFtZWRSZWZNYXAsIHJlTmFtZWRSZWYsIHNraXBSZXBsYWNlbWVudCkge1xuICAgICAgICBcbiAgICAgICAgbmFtZWRSZWZNYXAgPSBuYW1lZFJlZk1hcCB8fCBTRU5TSVRJVkVfTkFNRURfUkVGX01BUDtcbiAgICAgICAgcmVOYW1lZFJlZiA9IHJlTmFtZWRSZWYgfHwgU0VOU0lUSVZFX0hUTUxfRU5USVRJRVM7XG5cbiAgICAgICAgZnVuY3Rpb24gcmVnRXhwRnVuY3Rpb24obSwgbnVtLCBuYW1lZCwgbmFtZWQxKSB7XG4gICAgICAgICAgICBpZiAobnVtKSB7XG4gICAgICAgICAgICAgICAgbnVtID0gTnVtYmVyKG51bVswXSA8PSAnOScgPyBudW0gOiAnMCcgKyBudW0pO1xuICAgICAgICAgICAgICAgIC8vIHN3aXRjaChudW0pIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDgwOiByZXR1cm4gJ1xcdTIwQUMnOyAgLy8gRVVSTyBTSUdOICjigqwpXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg4MjogcmV0dXJuICdcXHUyMDFBJzsgIC8vIFNJTkdMRSBMT1ctOSBRVU9UQVRJT04gTUFSSyAo4oCaKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4ODM6IHJldHVybiAnXFx1MDE5Mic7ICAvLyBMQVRJTiBTTUFMTCBMRVRURVIgRiBXSVRIIEhPT0sgKMaSKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4ODQ6IHJldHVybiAnXFx1MjAxRSc7ICAvLyBET1VCTEUgTE9XLTkgUVVPVEFUSU9OIE1BUksgKOKAnilcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDg1OiByZXR1cm4gJ1xcdTIwMjYnOyAgLy8gSE9SSVpPTlRBTCBFTExJUFNJUyAo4oCmKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4ODY6IHJldHVybiAnXFx1MjAyMCc7ICAvLyBEQUdHRVIgKOKAoClcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDg3OiByZXR1cm4gJ1xcdTIwMjEnOyAgLy8gRE9VQkxFIERBR0dFUiAo4oChKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4ODg6IHJldHVybiAnXFx1MDJDNic7ICAvLyBNT0RJRklFUiBMRVRURVIgQ0lSQ1VNRkxFWCBBQ0NFTlQgKMuGKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4ODk6IHJldHVybiAnXFx1MjAzMCc7ICAvLyBQRVIgTUlMTEUgU0lHTiAo4oCwKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4OEE6IHJldHVybiAnXFx1MDE2MCc7ICAvLyBMQVRJTiBDQVBJVEFMIExFVFRFUiBTIFdJVEggQ0FST04gKMWgKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4OEI6IHJldHVybiAnXFx1MjAzOSc7ICAvLyBTSU5HTEUgTEVGVC1QT0lOVElORyBBTkdMRSBRVU9UQVRJT04gTUFSSyAo4oC5KVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4OEM6IHJldHVybiAnXFx1MDE1Mic7ICAvLyBMQVRJTiBDQVBJVEFMIExJR0FUVVJFIE9FICjFkilcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDhFOiByZXR1cm4gJ1xcdTAxN0QnOyAgLy8gTEFUSU4gQ0FQSVRBTCBMRVRURVIgWiBXSVRIIENBUk9OICjFvSlcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDkxOiByZXR1cm4gJ1xcdTIwMTgnOyAgLy8gTEVGVCBTSU5HTEUgUVVPVEFUSU9OIE1BUksgKOKAmClcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDkyOiByZXR1cm4gJ1xcdTIwMTknOyAgLy8gUklHSFQgU0lOR0xFIFFVT1RBVElPTiBNQVJLICjigJkpXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg5MzogcmV0dXJuICdcXHUyMDFDJzsgIC8vIExFRlQgRE9VQkxFIFFVT1RBVElPTiBNQVJLICjigJwpXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg5NDogcmV0dXJuICdcXHUyMDFEJzsgIC8vIFJJR0hUIERPVUJMRSBRVU9UQVRJT04gTUFSSyAo4oCdKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4OTU6IHJldHVybiAnXFx1MjAyMic7ICAvLyBCVUxMRVQgKOKAoilcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDk2OiByZXR1cm4gJ1xcdTIwMTMnOyAgLy8gRU4gREFTSCAo4oCTKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4OTc6IHJldHVybiAnXFx1MjAxNCc7ICAvLyBFTSBEQVNIICjigJQpXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg5ODogcmV0dXJuICdcXHUwMkRDJzsgIC8vIFNNQUxMIFRJTERFICjLnClcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDk5OiByZXR1cm4gJ1xcdTIxMjInOyAgLy8gVFJBREUgTUFSSyBTSUdOICjihKIpXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg5QTogcmV0dXJuICdcXHUwMTYxJzsgIC8vIExBVElOIFNNQUxMIExFVFRFUiBTIFdJVEggQ0FST04gKMWhKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4OUI6IHJldHVybiAnXFx1MjAzQSc7ICAvLyBTSU5HTEUgUklHSFQtUE9JTlRJTkcgQU5HTEUgUVVPVEFUSU9OIE1BUksgKOKAuilcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDlDOiByZXR1cm4gJ1xcdTAxNTMnOyAgLy8gTEFUSU4gU01BTEwgTElHQVRVUkUgT0UgKMWTKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4OUU6IHJldHVybiAnXFx1MDE3RSc7ICAvLyBMQVRJTiBTTUFMTCBMRVRURVIgWiBXSVRIIENBUk9OICjFvilcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDlGOiByZXR1cm4gJ1xcdTAxNzgnOyAgLy8gTEFUSU4gQ0FQSVRBTCBMRVRURVIgWSBXSVRIIERJQUVSRVNJUyAoxbgpXG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIC8vIC8vIG51bSA+PSAweEQ4MDAgJiYgbnVtIDw9IDB4REZGRiwgYW5kIDB4MEQgaXMgc2VwYXJhdGVseSBoYW5kbGVkLCBhcyBpdCBkb2Vzbid0IGZhbGwgaW50byB0aGUgcmFuZ2Ugb2YgeC5wZWMoKVxuICAgICAgICAgICAgICAgIC8vIHJldHVybiAobnVtID49IDB4RDgwMCAmJiBudW0gPD0gMHhERkZGKSB8fCBudW0gPT09IDB4MEQgPyAnXFx1RkZGRCcgOiB4LmZyQ29QdChudW0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBSZXBsYWNlbWVudCA/IGZyb21Db2RlUG9pbnQobnVtKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4ODAgPyAnXFx1MjBBQycgIC8vIEVVUk8gU0lHTiAo4oKsKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4ODIgPyAnXFx1MjAxQScgIC8vIFNJTkdMRSBMT1ctOSBRVU9UQVRJT04gTUFSSyAo4oCaKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4ODMgPyAnXFx1MDE5MicgIC8vIExBVElOIFNNQUxMIExFVFRFUiBGIFdJVEggSE9PSyAoxpIpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg4NCA/ICdcXHUyMDFFJyAgLy8gRE9VQkxFIExPVy05IFFVT1RBVElPTiBNQVJLICjigJ4pXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg4NSA/ICdcXHUyMDI2JyAgLy8gSE9SSVpPTlRBTCBFTExJUFNJUyAo4oCmKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4ODYgPyAnXFx1MjAyMCcgIC8vIERBR0dFUiAo4oCgKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4ODcgPyAnXFx1MjAyMScgIC8vIERPVUJMRSBEQUdHRVIgKOKAoSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDg4ID8gJ1xcdTAyQzYnICAvLyBNT0RJRklFUiBMRVRURVIgQ0lSQ1VNRkxFWCBBQ0NFTlQgKMuGKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4ODkgPyAnXFx1MjAzMCcgIC8vIFBFUiBNSUxMRSBTSUdOICjigLApXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg4QSA/ICdcXHUwMTYwJyAgLy8gTEFUSU4gQ0FQSVRBTCBMRVRURVIgUyBXSVRIIENBUk9OICjFoClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDhCID8gJ1xcdTIwMzknICAvLyBTSU5HTEUgTEVGVC1QT0lOVElORyBBTkdMRSBRVU9UQVRJT04gTUFSSyAo4oC5KVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4OEMgPyAnXFx1MDE1MicgIC8vIExBVElOIENBUElUQUwgTElHQVRVUkUgT0UgKMWSKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4OEUgPyAnXFx1MDE3RCcgIC8vIExBVElOIENBUElUQUwgTEVUVEVSIFogV0lUSCBDQVJPTiAoxb0pXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg5MSA/ICdcXHUyMDE4JyAgLy8gTEVGVCBTSU5HTEUgUVVPVEFUSU9OIE1BUksgKOKAmClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDkyID8gJ1xcdTIwMTknICAvLyBSSUdIVCBTSU5HTEUgUVVPVEFUSU9OIE1BUksgKOKAmSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDkzID8gJ1xcdTIwMUMnICAvLyBMRUZUIERPVUJMRSBRVU9UQVRJT04gTUFSSyAo4oCcKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4OTQgPyAnXFx1MjAxRCcgIC8vIFJJR0hUIERPVUJMRSBRVU9UQVRJT04gTUFSSyAo4oCdKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4OTUgPyAnXFx1MjAyMicgIC8vIEJVTExFVCAo4oCiKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4OTYgPyAnXFx1MjAxMycgIC8vIEVOIERBU0ggKOKAkylcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDk3ID8gJ1xcdTIwMTQnICAvLyBFTSBEQVNIICjigJQpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg5OCA/ICdcXHUwMkRDJyAgLy8gU01BTEwgVElMREUgKMucKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4OTkgPyAnXFx1MjEyMicgIC8vIFRSQURFIE1BUksgU0lHTiAo4oSiKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4OUEgPyAnXFx1MDE2MScgIC8vIExBVElOIFNNQUxMIExFVFRFUiBTIFdJVEggQ0FST04gKMWhKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4OUIgPyAnXFx1MjAzQScgIC8vIFNJTkdMRSBSSUdIVC1QT0lOVElORyBBTkdMRSBRVU9UQVRJT04gTUFSSyAo4oC6KVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4OUMgPyAnXFx1MDE1MycgIC8vIExBVElOIFNNQUxMIExJR0FUVVJFIE9FICjFkylcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDlFID8gJ1xcdTAxN0UnICAvLyBMQVRJTiBTTUFMTCBMRVRURVIgWiBXSVRIIENBUk9OICjFvilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDlGID8gJ1xcdTAxNzgnICAvLyBMQVRJTiBDQVBJVEFMIExFVFRFUiBZIFdJVEggRElBRVJFU0lTICjFuClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogKG51bSA+PSAweEQ4MDAgJiYgbnVtIDw9IDB4REZGRikgfHwgbnVtID09PSAweDBEID8gJ1xcdUZGRkQnXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHguZnJDb1B0KG51bSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmFtZWRSZWZNYXBbbmFtZWQgfHwgbmFtZWQxXSB8fCBtO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHMgPT09IHVuZGVmaW5lZCAgPyAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgOiBzID09PSBudWxsICAgICAgICA/ICdudWxsJ1xuICAgICAgICAgICAgOiBzLnRvU3RyaW5nKCkucmVwbGFjZShOVUxMLCAnXFx1RkZGRCcpLnJlcGxhY2UocmVOYW1lZFJlZiwgcmVnRXhwRnVuY3Rpb24pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNzc0VuY29kZShjaHIpIHtcbiAgICAgICAgLy8gc3BhY2UgYWZ0ZXIgXFxcXEhFWCBpcyBuZWVkZWQgYnkgc3BlY1xuICAgICAgICByZXR1cm4gJ1xcXFwnICsgY2hyLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvTG93ZXJDYXNlKCkgKyAnICc7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNzc0JsYWNrbGlzdChzKSB7XG4gICAgICAgIHJldHVybiBzLnJlcGxhY2UoQ1NTX0JMQUNLTElTVCwgZnVuY3Rpb24obSl7IHJldHVybiAnLXgtJyArIG07IH0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjc3NVcmwocykge1xuICAgICAgICAvLyBlbmNvZGVVUkkoKSBpbiB5dWZ1bGwoKSB3aWxsIHRocm93IGVycm9yIGZvciB1c2Ugb2YgdGhlIENTU19VTlNVUFBPUlRFRF9DT0RFX1BPSU5UIChpLmUuLCBbXFx1RDgwMC1cXHVERkZGXSlcbiAgICAgICAgcyA9IHgueXVmdWxsKGh0bWxEZWNvZGUocykpO1xuICAgICAgICB2YXIgcHJvdG9jb2wgPSBnZXRQcm90b2NvbChzKTtcblxuICAgICAgICAvLyBwcmVmaXggIyMgZm9yIGJsYWNrbGlzdGVkIHByb3RvY29sc1xuICAgICAgICAvLyBoZXJlIC5yZXBsYWNlKFVSSV9QUk9UT0NPTF9XSElURVNQQUNFUywgJycpIGlzIG5vdCBuZWVkZWQgc2luY2UgeXVmdWxsIGhhcyBhbHJlYWR5IHBlcmNlbnQtZW5jb2RlZCB0aGUgd2hpdGVzcGFjZXNcbiAgICAgICAgcmV0dXJuIChwcm90b2NvbCAmJiBVUklfQkxBQ0tMSVNUX1BST1RPQ09MU1twcm90b2NvbC50b0xvd2VyQ2FzZSgpXSkgPyAnIyMnICsgcyA6IHM7XG4gICAgfVxuXG4gICAgcmV0dXJuICh4ID0ge1xuICAgICAgICAvLyB0dXJuIGludmFsaWQgY29kZVBvaW50cyBhbmQgdGhhdCBvZiBub24tY2hhcmFjdGVycyB0byBcXHVGRkZELCBhbmQgdGhlbiBmcm9tQ29kZVBvaW50KClcbiAgICAgICAgZnJDb1B0OiBmdW5jdGlvbihudW0pIHtcbiAgICAgICAgICAgIHJldHVybiBudW0gPT09IHVuZGVmaW5lZCB8fCBudW0gPT09IG51bGwgPyAnJyA6XG4gICAgICAgICAgICAgICAgIWlzRmluaXRlKG51bSA9IE51bWJlcihudW0pKSB8fCAvLyBgTmFOYCwgYCtJbmZpbml0eWAsIG9yIGAtSW5maW5pdHlgXG4gICAgICAgICAgICAgICAgbnVtIDw9IDAgfHwgICAgICAgICAgICAgICAgICAgICAvLyBub3QgYSB2YWxpZCBVbmljb2RlIGNvZGUgcG9pbnRcbiAgICAgICAgICAgICAgICBudW0gPiAweDEwRkZGRiB8fCAgICAgICAgICAgICAgIC8vIG5vdCBhIHZhbGlkIFVuaWNvZGUgY29kZSBwb2ludFxuICAgICAgICAgICAgICAgIC8vIE1hdGguZmxvb3IobnVtKSAhPSBudW0gfHwgXG5cbiAgICAgICAgICAgICAgICAobnVtID49IDB4MDEgJiYgbnVtIDw9IDB4MDgpIHx8XG4gICAgICAgICAgICAgICAgKG51bSA+PSAweDBFICYmIG51bSA8PSAweDFGKSB8fFxuICAgICAgICAgICAgICAgIChudW0gPj0gMHg3RiAmJiBudW0gPD0gMHg5RikgfHxcbiAgICAgICAgICAgICAgICAobnVtID49IDB4RkREMCAmJiBudW0gPD0gMHhGREVGKSB8fFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICBudW0gPT09IDB4MEIgfHwgXG4gICAgICAgICAgICAgICAgKG51bSAmIDB4RkZGRikgPT09IDB4RkZGRiB8fCBcbiAgICAgICAgICAgICAgICAobnVtICYgMHhGRkZGKSA9PT0gMHhGRkZFID8gJ1xcdUZGRkQnIDogZnJvbUNvZGVQb2ludChudW0pO1xuICAgICAgICB9LFxuICAgICAgICBkOiBodG1sRGVjb2RlLFxuICAgICAgICAvKlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1cmkgaW5wdXRcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gcyAtIG51bGwgaWYgcmVsYXRpdmUgdXJsLCBvdGhlcndpc2UgdGhlIHByb3RvY29sIHdpdGggd2hpdGVzcGFjZXMgc3RyaXBwZWQgYW5kIGxvd2VyLWNhc2VkXG4gICAgICAgICAqL1xuICAgICAgICB5dXA6IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgICAgIHMgPSBnZXRQcm90b2NvbChzLnJlcGxhY2UoTlVMTCwgJycpKTtcbiAgICAgICAgICAgIC8vIFVSSV9QUk9UT0NPTF9XSElURVNQQUNFUyBpcyByZXF1aXJlZCBmb3IgbGVmdCB0cmltIGFuZCByZW1vdmUgaW50ZXJpbSB3aGl0ZXNwYWNlc1xuICAgICAgICAgICAgcmV0dXJuIHMgPyBodG1sRGVjb2RlKHMsIFVSSV9QUk9UT0NPTF9OQU1FRF9SRUZfTUFQLCBudWxsLCB0cnVlKS5yZXBsYWNlKFVSSV9QUk9UT0NPTF9XSElURVNQQUNFUywgJycpLnRvTG93ZXJDYXNlKCkgOiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qXG4gICAgICAgICAqIEBkZXByZWNhdGVkXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXRcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gcyAtIFRoZSBvcmlnaW5hbCB1c2VyIGlucHV0IHdpdGggJiA8ID4gXCIgJyBgIGVuY29kZWQgcmVzcGVjdGl2ZWx5IGFzICZhbXA7ICZsdDsgJmd0OyAmcXVvdDsgJiMzOTsgYW5kICYjOTY7LlxuICAgICAgICAgKlxuICAgICAgICAgKi9cbiAgICAgICAgeTogZnVuY3Rpb24ocykge1xuICAgICAgICAgICAgcmV0dXJuIHN0clJlcGxhY2UocywgU1BFQ0lBTF9IVE1MX0NIQVJTLCBmdW5jdGlvbiAobSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtID09PSAnJicgPyAnJmFtcDsnXG4gICAgICAgICAgICAgICAgICAgIDogIG0gPT09ICc8JyA/ICcmbHQ7J1xuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSAnPicgPyAnJmd0OydcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJ1wiJyA/ICcmcXVvdDsnXG4gICAgICAgICAgICAgICAgICAgIDogIG0gPT09IFwiJ1wiID8gJyYjMzk7J1xuICAgICAgICAgICAgICAgICAgICA6ICAvKm0gPT09ICdgJyovICcmIzk2Oyc7ICAgICAgIC8vIGluIGhleDogNjBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFRoaXMgZmlsdGVyIGlzIG1lYW50IHRvIGludHJvZHVjZSBkb3VibGUtZW5jb2RpbmcsIGFuZCBzaG91bGQgYmUgdXNlZCB3aXRoIGV4dHJhIGNhcmUuXG4gICAgICAgIHlhOiBmdW5jdGlvbihzKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyUmVwbGFjZShzLCBBTVAsICcmYW1wOycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIEZPUiBERVRBSUxTLCByZWZlciB0byBpbkhUTUxEYXRhKClcbiAgICAgICAgLy8gUmVmZXJlbmNlOiBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNkYXRhLXN0YXRlXG4gICAgICAgIHlkOiBmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgcmV0dXJuIHN0clJlcGxhY2UocywgTFQsICcmbHQ7Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gRk9SIERFVEFJTFMsIHJlZmVyIHRvIGluSFRNTENvbW1lbnQoKVxuICAgICAgICAvLyBBbGwgTlVMTCBjaGFyYWN0ZXJzIGluIHMgYXJlIGZpcnN0IHJlcGxhY2VkIHdpdGggXFx1RkZGRC5cbiAgICAgICAgLy8gSWYgcyBjb250YWlucyAtLT4sIC0tIT4sIG9yIHN0YXJ0cyB3aXRoIC0qPiwgaW5zZXJ0IGEgc3BhY2UgcmlnaHQgYmVmb3JlID4gdG8gc3RvcCBzdGF0ZSBicmVha2luZyBhdCA8IS0te3t7eWMgc319fS0tPlxuICAgICAgICAvLyBJZiBzIGVuZHMgd2l0aCAtLSEsIC0tLCBvciAtLCBhcHBlbmQgYSBzcGFjZSB0byBzdG9wIGNvbGxhYm9yYXRpdmUgc3RhdGUgYnJlYWtpbmcgYXQge3t7eWMgc319fT4sIHt7e3ljIHN9fX0hPiwge3t7eWMgc319fS0hPiwge3t7eWMgc319fS0+XG4gICAgICAgIC8vIFJlZmVyZW5jZTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjY29tbWVudC1zdGF0ZVxuICAgICAgICAvLyBSZWZlcmVuY2U6IGh0dHA6Ly9zaGF6emVyLmNvLnVrL3ZlY3Rvci9DaGFyYWN0ZXJzLXRoYXQtY2xvc2UtYS1IVE1MLWNvbW1lbnQtM1xuICAgICAgICAvLyBSZWZlcmVuY2U6IGh0dHA6Ly9zaGF6emVyLmNvLnVrL3ZlY3Rvci9DaGFyYWN0ZXJzLXRoYXQtY2xvc2UtYS1IVE1MLWNvbW1lbnRcbiAgICAgICAgLy8gUmVmZXJlbmNlOiBodHRwOi8vc2hhenplci5jby51ay92ZWN0b3IvQ2hhcmFjdGVycy10aGF0LWNsb3NlLWEtSFRNTC1jb21tZW50LTAwMjFcbiAgICAgICAgLy8gSWYgcyBjb250YWlucyBdPiBvciBlbmRzIHdpdGggXSwgYXBwZW5kIGEgc3BhY2UgYWZ0ZXIgXSBpcyB2ZXJpZmllZCBpbiBJRSB0byBzdG9wIElFIGNvbmRpdGlvbmFsIGNvbW1lbnRzLlxuICAgICAgICAvLyBSZWZlcmVuY2U6IGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9tczUzNzUxMiUyOHY9dnMuODUlMjkuYXNweFxuICAgICAgICAvLyBXZSBkbyBub3QgY2FyZSAtLVxccz4sIHdoaWNoIGNhbiBwb3NzaWJseSBiZSBpbnRlcHJldGVkIGFzIGEgdmFsaWQgY2xvc2UgY29tbWVudCB0YWcgaW4gdmVyeSBvbGQgYnJvd3NlcnMgKGUuZy4sIGZpcmVmb3ggMy42KSwgYXMgc3BlY2lmaWVkIGluIHRoZSBodG1sNCBzcGVjXG4gICAgICAgIC8vIFJlZmVyZW5jZTogaHR0cDovL3d3dy53My5vcmcvVFIvaHRtbDQwMS9pbnRyby9zZ21sdHV0Lmh0bWwjaC0zLjIuNFxuICAgICAgICB5YzogZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJSZXBsYWNlKHMsIFNQRUNJQUxfQ09NTUVOVF9DSEFSUywgZnVuY3Rpb24obSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0gPT09ICdcXHgwMCcgPyAnXFx1RkZGRCdcbiAgICAgICAgICAgICAgICAgICAgOiBtID09PSAnLS0hJyB8fCBtID09PSAnLS0nIHx8IG0gPT09ICctJyB8fCBtID09PSAnXScgPyBtICsgJyAnXG4gICAgICAgICAgICAgICAgICAgIDovKlxuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSAnXT4nICAgPyAnXSA+J1xuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSAnLS0+JyAgPyAnLS0gPidcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJy0tIT4nID8gJy0tISA+J1xuICAgICAgICAgICAgICAgICAgICA6IC8tKiE/Pi8udGVzdChtKSA/ICovIG0uc2xpY2UoMCwgLTEpICsgJyA+JztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIEZPUiBERVRBSUxTLCByZWZlciB0byBpbkRvdWJsZVF1b3RlZEF0dHIoKVxuICAgICAgICAvLyBSZWZlcmVuY2U6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0oZG91YmxlLXF1b3RlZCktc3RhdGVcbiAgICAgICAgeWF2ZDogZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJSZXBsYWNlKHMsIFFVT1QsICcmcXVvdDsnKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBGT1IgREVUQUlMUywgcmVmZXIgdG8gaW5TaW5nbGVRdW90ZWRBdHRyKClcbiAgICAgICAgLy8gUmVmZXJlbmNlOiBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGUtdmFsdWUtKHNpbmdsZS1xdW90ZWQpLXN0YXRlXG4gICAgICAgIHlhdnM6IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyUmVwbGFjZShzLCBTUVVPVCwgJyYjMzk7Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gRk9SIERFVEFJTFMsIHJlZmVyIHRvIGluVW5RdW90ZWRBdHRyKClcbiAgICAgICAgLy8gUEFSVCBBLlxuICAgICAgICAvLyBpZiBzIGNvbnRhaW5zIGFueSBzdGF0ZSBicmVha2luZyBjaGFycyAoXFx0LCBcXG4sIFxcdiwgXFxmLCBcXHIsIHNwYWNlLCBhbmQgPiksXG4gICAgICAgIC8vIHRoZXkgYXJlIGVzY2FwZWQgYW5kIGVuY29kZWQgaW50byB0aGVpciBlcXVpdmFsZW50IEhUTUwgZW50aXR5IHJlcHJlc2VudGF0aW9ucy4gXG4gICAgICAgIC8vIFJlZmVyZW5jZTogaHR0cDovL3NoYXp6ZXIuY28udWsvZGF0YWJhc2UvQWxsL0NoYXJhY3RlcnMtd2hpY2gtYnJlYWstYXR0cmlidXRlcy13aXRob3V0LXF1b3Rlc1xuICAgICAgICAvLyBSZWZlcmVuY2U6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0odW5xdW90ZWQpLXN0YXRlXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFBBUlQgQi4gXG4gICAgICAgIC8vIGlmIHMgc3RhcnRzIHdpdGggJywgXCIgb3IgYCwgZW5jb2RlIGl0IHJlc3AuIGFzICYjMzk7LCAmcXVvdDssIG9yICYjOTY7IHRvIFxuICAgICAgICAvLyBlbmZvcmNlIHRoZSBhdHRyIHZhbHVlICh1bnF1b3RlZCkgc3RhdGVcbiAgICAgICAgLy8gUmVmZXJlbmNlOiBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNiZWZvcmUtYXR0cmlidXRlLXZhbHVlLXN0YXRlXG4gICAgICAgIC8vIFJlZmVyZW5jZTogaHR0cDovL3NoYXp6ZXIuY28udWsvdmVjdG9yL0NoYXJhY3RlcnMtYWxsb3dlZC1hdHRyaWJ1dGUtcXVvdGVcbiAgICAgICAgLy8gXG4gICAgICAgIC8vIFBBUlQgQy5cbiAgICAgICAgLy8gSW5qZWN0IGEgXFx1RkZGRCBjaGFyYWN0ZXIgaWYgYW4gZW1wdHkgb3IgYWxsIG51bGwgc3RyaW5nIGlzIGVuY291bnRlcmVkIGluIFxuICAgICAgICAvLyB1bnF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUgc3RhdGUuXG4gICAgICAgIC8vIFxuICAgICAgICAvLyBSYXRpb25hbGUgMTogb3VyIGJlbGllZiBpcyB0aGF0IGRldmVsb3BlcnMgd291bGRuJ3QgZXhwZWN0IGFuIFxuICAgICAgICAvLyAgIGVtcHR5IHN0cmluZyB3b3VsZCByZXN1bHQgaW4gJyBuYW1lPVwicGFzc3dkXCInIHJlbmRlcmVkIGFzIFxuICAgICAgICAvLyAgIGF0dHJpYnV0ZSB2YWx1ZSwgZXZlbiB0aG91Z2ggdGhpcyBpcyBob3cgSFRNTDUgaXMgc3BlY2lmaWVkLlxuICAgICAgICAvLyBSYXRpb25hbGUgMjogYW4gZW1wdHkgb3IgYWxsIG51bGwgc3RyaW5nIChmb3IgSUUpIGNhbiBcbiAgICAgICAgLy8gICBlZmZlY3RpdmVseSBhbHRlciBpdHMgaW1tZWRpYXRlIHN1YnNlcXVlbnQgc3RhdGUsIHdlIGNob29zZVxuICAgICAgICAvLyAgIFxcdUZGRkQgdG8gZW5kIHRoZSB1bnF1b3RlZCBhdHRyIFxuICAgICAgICAvLyAgIHN0YXRlLCB3aGljaCB0aGVyZWZvcmUgd2lsbCBub3QgbWVzcyB1cCBsYXRlciBjb250ZXh0cy5cbiAgICAgICAgLy8gUmF0aW9uYWxlIDM6IFNpbmNlIElFIDYsIGl0IGlzIHZlcmlmaWVkIHRoYXQgTlVMTCBjaGFycyBhcmUgc3RyaXBwZWQuXG4gICAgICAgIC8vIFJlZmVyZW5jZTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLSh1bnF1b3RlZCktc3RhdGVcbiAgICAgICAgLy8gXG4gICAgICAgIC8vIEV4YW1wbGU6XG4gICAgICAgIC8vIDxpbnB1dCB2YWx1ZT17e3t5YXZ1IHN9fX0gbmFtZT1cInBhc3N3ZFwiLz5cbiAgICAgICAgeWF2dTogZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJSZXBsYWNlKHMsIFNQRUNJQUxfQVRUUl9WQUxVRV9VTlFVT1RFRF9DSEFSUywgZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSA9PT0gJ1xcdCcgICA/ICcmIzk7JyAgLy8gaW4gaGV4OiAwOVxuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSAnXFxuJyAgID8gJyYjMTA7JyAvLyBpbiBoZXg6IDBBXG4gICAgICAgICAgICAgICAgICAgIDogIG0gPT09ICdcXHgwQicgPyAnJiMxMTsnIC8vIGluIGhleDogMEIgIGZvciBJRS4gSUU8OSBcXHYgZXF1YWxzIHYsIHNvIHVzZSBcXHgwQiBpbnN0ZWFkXG4gICAgICAgICAgICAgICAgICAgIDogIG0gPT09ICdcXGYnICAgPyAnJiMxMjsnIC8vIGluIGhleDogMENcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJ1xccicgICA/ICcmIzEzOycgLy8gaW4gaGV4OiAwRFxuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSAnICcgICAgPyAnJiMzMjsnIC8vIGluIGhleDogMjBcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJz0nICAgID8gJyYjNjE7JyAvLyBpbiBoZXg6IDNEXG4gICAgICAgICAgICAgICAgICAgIDogIG0gPT09ICc8JyAgICA/ICcmbHQ7J1xuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSAnPicgICAgPyAnJmd0OydcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJ1wiJyAgICA/ICcmcXVvdDsnXG4gICAgICAgICAgICAgICAgICAgIDogIG0gPT09IFwiJ1wiICAgID8gJyYjMzk7J1xuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSAnYCcgICAgPyAnJiM5NjsnXG4gICAgICAgICAgICAgICAgICAgIDogLyplbXB0eSBvciBudWxsKi8gJ1xcdUZGRkQnO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgeXU6IGVuY29kZVVSSSxcbiAgICAgICAgeXVjOiBlbmNvZGVVUklDb21wb25lbnQsXG5cbiAgICAgICAgLy8gTm90aWNlIHRoYXQgeXVibCBNVVNUIEJFIEFQUExJRUQgTEFTVCwgYW5kIHdpbGwgbm90IGJlIHVzZWQgaW5kZXBlbmRlbnRseSAoZXhwZWN0ZWQgb3V0cHV0IGZyb20gZW5jb2RlVVJJL2VuY29kZVVSSUNvbXBvbmVudCBhbmQgeWF2ZC95YXZzL3lhdnUpXG4gICAgICAgIC8vIFRoaXMgaXMgdXNlZCB0byBkaXNhYmxlIEpTIGV4ZWN1dGlvbiBjYXBhYmlsaXRpZXMgYnkgcHJlZml4aW5nIHgtIHRvIF5qYXZhc2NyaXB0OiwgXnZic2NyaXB0OiBvciBeZGF0YTogdGhhdCBwb3NzaWJseSBjb3VsZCB0cmlnZ2VyIHNjcmlwdCBleGVjdXRpb24gaW4gVVJJIGF0dHJpYnV0ZSBjb250ZXh0XG4gICAgICAgIHl1Ymw6IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICByZXR1cm4gVVJJX0JMQUNLTElTVF9QUk9UT0NPTFNbeC55dXAocyldID8gJ3gtJyArIHMgOiBzO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFRoaXMgaXMgTk9UIGEgc2VjdXJpdHktY3JpdGljYWwgZmlsdGVyLlxuICAgICAgICAvLyBSZWZlcmVuY2U6IGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2XG4gICAgICAgIHl1ZnVsbDogZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgIHJldHVybiB4Lnl1KHMpLnJlcGxhY2UoVVJMX0lQVjYsIGZ1bmN0aW9uKG0sIHApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJy8vWycgKyBwICsgJ10nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gY2hhaW4geXVmdWxsKCkgd2l0aCB5dWJsKClcbiAgICAgICAgeXVibGY6IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICByZXR1cm4geC55dWJsKHgueXVmdWxsKHMpKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBUaGUgZGVzaWduIHByaW5jaXBsZSBvZiB0aGUgQ1NTIGZpbHRlciBNVVNUIG1lZXQgdGhlIGZvbGxvd2luZyBnb2FsKHMpLlxuICAgICAgICAvLyAoMSkgVGhlIGlucHV0IGNhbm5vdCBicmVhayBvdXQgb2YgdGhlIGNvbnRleHQgKGV4cHIpIGFuZCB0aGlzIGlzIHRvIGZ1bGZpbGwgdGhlIGp1c3Qgc3VmZmljaWVudCBlbmNvZGluZyBwcmluY2lwbGUuXG4gICAgICAgIC8vICgyKSBUaGUgaW5wdXQgY2Fubm90IGludHJvZHVjZSBDU1MgcGFyc2luZyBlcnJvciBhbmQgdGhpcyBpcyB0byBhZGRyZXNzIHRoZSBjb25jZXJuIG9mIFVJIHJlZHJlc3NpbmcuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIHRlcm1cbiAgICAgICAgLy8gICA6IHVuYXJ5X29wZXJhdG9yP1xuICAgICAgICAvLyAgICAgWyBOVU1CRVIgUyogfCBQRVJDRU5UQUdFIFMqIHwgTEVOR1RIIFMqIHwgRU1TIFMqIHwgRVhTIFMqIHwgQU5HTEUgUyogfFxuICAgICAgICAvLyAgICAgVElNRSBTKiB8IEZSRVEgUyogXVxuICAgICAgICAvLyAgIHwgU1RSSU5HIFMqIHwgSURFTlQgUyogfCBVUkkgUyogfCBoZXhjb2xvciB8IGZ1bmN0aW9uXG4gICAgICAgIC8vIFxuICAgICAgICAvLyBSZWZlcmVuY2U6XG4gICAgICAgIC8vICogaHR0cDovL3d3dy53My5vcmcvVFIvQ1NTMjEvZ3JhbW1hci5odG1sIFxuICAgICAgICAvLyAqIGh0dHA6Ly93d3cudzMub3JnL1RSL2Nzcy1zeW50YXgtMy9cbiAgICAgICAgLy8gXG4gICAgICAgIC8vIE5PVEU6IGRlbGltaXRlciBpbiBDU1MgLSAgXFwgIF8gIDogIDsgICggICkgIFwiICAnICAvICAsICAlICAjICAhICAqICBAICAuICB7ICB9XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgMmQgNWMgNWYgM2EgM2IgMjggMjkgMjIgMjcgMmYgMmMgMjUgMjMgMjEgMmEgNDAgMmUgN2IgN2RcblxuICAgICAgICB5Y2V1OiBmdW5jdGlvbihzKSB7XG4gICAgICAgICAgICBzID0gaHRtbERlY29kZShzKTtcbiAgICAgICAgICAgIHJldHVybiBDU1NfVkFMSURfVkFMVUUudGVzdChzKSA/IHMgOiBcIjsteDonXCIgKyBjc3NCbGFja2xpc3Qocy5yZXBsYWNlKENTU19TSU5HTEVfUVVPVEVEX0NIQVJTLCBjc3NFbmNvZGUpKSArIFwiJzstdjpcIjtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBzdHJpbmcxID0gXFxcIihbXlxcblxcclxcZlxcXFxcIl18XFxcXHtubH18XFxcXFteXFxuXFxyXFxmMC05YS1mXXxcXFxcWzAtOWEtZl17MSw2fShcXHJcXG58WyBcXG5cXHJcXHRcXGZdKT8pKlxcXCJcbiAgICAgICAgeWNlZDogZnVuY3Rpb24ocykge1xuICAgICAgICAgICAgcmV0dXJuIGNzc0JsYWNrbGlzdChodG1sRGVjb2RlKHMpLnJlcGxhY2UoQ1NTX0RPVUJMRV9RVU9URURfQ0hBUlMsIGNzc0VuY29kZSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHN0cmluZzIgPSBcXCcoW15cXG5cXHJcXGZcXFxcJ118XFxcXHtubH18XFxcXFteXFxuXFxyXFxmMC05YS1mXXxcXFxcWzAtOWEtZl17MSw2fShcXHJcXG58WyBcXG5cXHJcXHRcXGZdKT8pKlxcJ1xuICAgICAgICB5Y2VzOiBmdW5jdGlvbihzKSB7XG4gICAgICAgICAgICByZXR1cm4gY3NzQmxhY2tsaXN0KGh0bWxEZWNvZGUocykucmVwbGFjZShDU1NfU0lOR0xFX1FVT1RFRF9DSEFSUywgY3NzRW5jb2RlKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gZm9yIHVybCh7e3t5Y2V1dSB1cmx9fX1cbiAgICAgICAgLy8gdW5xdW90ZWRfdXJsID0gKFshIyQlJiotfl18XFxcXHtofXsxLDZ9KFxcclxcbnxbIFxcdFxcclxcblxcZl0pP3xcXFxcW15cXHJcXG5cXGYwLTlhLWZdKSogKENTUyAyLjEgZGVmaW5pdGlvbilcbiAgICAgICAgLy8gdW5xdW90ZWRfdXJsID0gKFteXCInKClcXFxcIFxcdFxcblxcclxcZlxcdlxcdTAwMDBcXHUwMDA4XFx1MDAwYlxcdTAwMGUtXFx1MDAxZlxcdTAwN2ZdfFxcXFx7aH17MSw2fShcXHJcXG58WyBcXHRcXHJcXG5cXGZdKT98XFxcXFteXFxyXFxuXFxmMC05YS1mXSkqIChDU1MgMy4wIGRlZmluaXRpb24pXG4gICAgICAgIC8vIFRoZSBzdGF0ZSBtYWNoaW5lIGluIENTUyAzLjAgaXMgbW9yZSB3ZWxsIGRlZmluZWQgLSBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3Mtc3ludGF4LTMvI2NvbnN1bWUtYS11cmwtdG9rZW4wXG4gICAgICAgIC8vIENTU19VTlFVT1RFRF9VUkwgPSAvWydcXChcXCldL2c7IC8vIFwiIFxcIHRyZWF0ZWQgYnkgZW5jb2RlVVJJKCkgICBcbiAgICAgICAgeWNldXU6IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgICAgIHJldHVybiBjc3NVcmwocykucmVwbGFjZShDU1NfVU5RVU9URURfVVJMLCBmdW5jdGlvbiAoY2hyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICBjaHIgPT09ICdcXCcnICAgICAgICA/ICdcXFxcMjcgJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICBjaHIgPT09ICcoJyAgICAgICAgID8gJyUyOCcgOlxuICAgICAgICAgICAgICAgICAgICAgICAgLyogY2hyID09PSAnKScgPyAqLyAgICclMjknO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gZm9yIHVybChcInt7e3ljZXVkIHVybH19fVxuICAgICAgICB5Y2V1ZDogZnVuY3Rpb24ocykgeyBcbiAgICAgICAgICAgIHJldHVybiBjc3NVcmwocyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gZm9yIHVybCgne3t7eWNldXMgdXJsfX19XG4gICAgICAgIHljZXVzOiBmdW5jdGlvbihzKSB7IFxuICAgICAgICAgICAgcmV0dXJuIGNzc1VybChzKS5yZXBsYWNlKFNRVU9ULCAnXFxcXDI3ICcpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vLyBleHBvc2luZyBwcml2RmlsdGVyc1xuLy8gdGhpcyBpcyBhbiB1bmRvY3VtZW50ZWQgZmVhdHVyZSwgYW5kIHBsZWFzZSB1c2UgaXQgd2l0aCBleHRyYSBjYXJlXG52YXIgcHJpdkZpbHRlcnMgPSBleHBvcnRzLl9wcml2RmlsdGVycyA9IGV4cG9ydHMuX2dldFByaXZGaWx0ZXJzKCk7XG5cblxuLyogY2hhaW5pbmcgZmlsdGVycyAqL1xuXG4vLyB1cmlJbkF0dHIgYW5kIGxpdGVyYWxseSB1cmlQYXRoSW5BdHRyXG4vLyB5dWJsIGlzIGFsd2F5cyB1c2VkIFxuLy8gUmF0aW9uYWxlOiBnaXZlbiBwYXR0ZXJuIGxpa2UgdGhpczogPGEgaHJlZj1cInt7e3VyaVBhdGhJbkRvdWJsZVF1b3RlZEF0dHIgc319fVwiPlxuLy8gICAgICAgICAgICBkZXZlbG9wZXIgbWF5IGV4cGVjdCBzIGlzIGFsd2F5cyBwcmVmaXhlZCB3aXRoID8gb3IgLywgYnV0IGFuIGF0dGFja2VyIGNhbiBhYnVzZSBpdCB3aXRoICdqYXZhc2NyaXB0OmFsZXJ0KDEpJ1xuZnVuY3Rpb24gdXJpSW5BdHRyIChzLCB5YXYsIHl1KSB7XG4gICAgcmV0dXJuIHByaXZGaWx0ZXJzLnl1YmwoeWF2KCh5dSB8fCBwcml2RmlsdGVycy55dWZ1bGwpKHMpKSk7XG59XG5cbi8qKiBcbiogWWFob28gU2VjdXJlIFhTUyBGaWx0ZXJzIC0ganVzdCBzdWZmaWNpZW50IG91dHB1dCBmaWx0ZXJpbmcgdG8gcHJldmVudCBYU1MhXG4qIEBtb2R1bGUgeHNzLWZpbHRlcnMgXG4qL1xuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyNpbkhUTUxEYXRhXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXRcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIHdpdGggJzwnIGVuY29kZWQgYXMgJyZhbXA7bHQ7J1xuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgRGF0YSBjb250ZXh0IHRvIGVuY29kZSBhbGwgJzwnIGNoYXJhY3RlcnMgaW50byAnJmFtcDtsdDsnXG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNkYXRhLXN0YXRlXCI+SFRNTDUgRGF0YSBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8ZGl2Pnt7e2luSFRNTERhdGEgaHRtbERhdGF9fX08L2Rpdj5cbipcbiovXG5leHBvcnRzLmluSFRNTERhdGEgPSBwcml2RmlsdGVycy55ZDtcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjaW5IVE1MQ29tbWVudFxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0XG4qIEByZXR1cm5zIHtzdHJpbmd9IEFsbCBOVUxMIGNoYXJhY3RlcnMgaW4gcyBhcmUgZmlyc3QgcmVwbGFjZWQgd2l0aCBcXHVGRkZELiBJZiBzIGNvbnRhaW5zIC0tPiwgLS0hPiwgb3Igc3RhcnRzIHdpdGggLSo+LCBpbnNlcnQgYSBzcGFjZSByaWdodCBiZWZvcmUgPiB0byBzdG9wIHN0YXRlIGJyZWFraW5nIGF0IDwhLS17e3t5YyBzfX19LS0+LiBJZiBzIGVuZHMgd2l0aCAtLSEsIC0tLCBvciAtLCBhcHBlbmQgYSBzcGFjZSB0byBzdG9wIGNvbGxhYm9yYXRpdmUgc3RhdGUgYnJlYWtpbmcgYXQge3t7eWMgc319fT4sIHt7e3ljIHN9fX0hPiwge3t7eWMgc319fS0hPiwge3t7eWMgc319fS0+LiBJZiBzIGNvbnRhaW5zIF0+IG9yIGVuZHMgd2l0aCBdLCBhcHBlbmQgYSBzcGFjZSBhZnRlciBdIGlzIHZlcmlmaWVkIGluIElFIHRvIHN0b3AgSUUgY29uZGl0aW9uYWwgY29tbWVudHMuXG4qXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBDb21tZW50IGNvbnRleHRcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly9zaGF6emVyLmNvLnVrL3ZlY3Rvci9DaGFyYWN0ZXJzLXRoYXQtY2xvc2UtYS1IVE1MLWNvbW1lbnQtM1wiPlNoYXp6ZXIgLSBDbG9zaW5nIGNvbW1lbnRzIGZvciAtLi0+PC9hPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly9zaGF6emVyLmNvLnVrL3ZlY3Rvci9DaGFyYWN0ZXJzLXRoYXQtY2xvc2UtYS1IVE1MLWNvbW1lbnRcIj5TaGF6emVyIC0gQ2xvc2luZyBjb21tZW50cyBmb3IgLS0uPjwvYT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vc2hhenplci5jby51ay92ZWN0b3IvQ2hhcmFjdGVycy10aGF0LWNsb3NlLWEtSFRNTC1jb21tZW50LTAwMjFcIj5TaGF6emVyIC0gQ2xvc2luZyBjb21tZW50cyBmb3IgLj48L2E+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjY29tbWVudC1zdGFydC1zdGF0ZVwiPkhUTUw1IENvbW1lbnQgU3RhcnQgU3RhdGU8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNjb21tZW50LXN0YXJ0LWRhc2gtc3RhdGVcIj5IVE1MNSBDb21tZW50IFN0YXJ0IERhc2ggU3RhdGU8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNjb21tZW50LXN0YXRlXCI+SFRNTDUgQ29tbWVudCBTdGF0ZTwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2NvbW1lbnQtZW5kLWRhc2gtc3RhdGVcIj5IVE1MNSBDb21tZW50IEVuZCBEYXNoIFN0YXRlPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjY29tbWVudC1lbmQtc3RhdGVcIj5IVE1MNSBDb21tZW50IEVuZCBTdGF0ZTwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2NvbW1lbnQtZW5kLWJhbmctc3RhdGVcIj5IVE1MNSBDb21tZW50IEVuZCBCYW5nIFN0YXRlPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L21zNTM3NTEyJTI4dj12cy44NSUyOS5hc3B4XCI+Q29uZGl0aW9uYWwgQ29tbWVudHMgaW4gSW50ZXJuZXQgRXhwbG9yZXI8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPCEtLSB7e3tpbkhUTUxDb21tZW50IGh0bWxfY29tbWVudH19fSAtLT5cbipcbiovXG5leHBvcnRzLmluSFRNTENvbW1lbnQgPSBwcml2RmlsdGVycy55YztcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjaW5TaW5nbGVRdW90ZWRBdHRyXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXRcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIHdpdGggYW55IHNpbmdsZS1xdW90ZSBjaGFyYWN0ZXJzIGVuY29kZWQgaW50byAnJmFtcDsmIzM5OycuXG4qXG4qIEBkZXNjcmlwdGlvblxuKiA8cCBjbGFzcz1cIndhcm5pbmdcIj5XYXJuaW5nOiBUaGlzIGlzIE5PVCBkZXNpZ25lZCBmb3IgYW55IG9uWCAoZS5nLiwgb25jbGljaykgYXR0cmlidXRlcyE8L3A+XG4qIDxwIGNsYXNzPVwid2FybmluZ1wiPldhcm5pbmc6IElmIHlvdSdyZSB3b3JraW5nIG9uIFVSSS9jb21wb25lbnRzLCB1c2UgdGhlIG1vcmUgc3BlY2lmaWMgdXJpX19fSW5TaW5nbGVRdW90ZWRBdHRyIGZpbHRlciA8L3A+XG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIEF0dHJpYnV0ZSBWYWx1ZSAoc2luZ2xlLXF1b3RlZCkgc3RhdGUgdG8gZW5jb2RlIGFsbCBzaW5nbGUtcXVvdGUgY2hhcmFjdGVycyBpbnRvICcmYW1wOyYjMzk7J1xuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLShzaW5nbGUtcXVvdGVkKS1zdGF0ZVwiPkhUTUw1IEF0dHJpYnV0ZSBWYWx1ZSAoU2luZ2xlLVF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGlucHV0IG5hbWU9J2ZpcnN0bmFtZScgdmFsdWU9J3t7e2luU2luZ2xlUXVvdGVkQXR0ciBmaXJzdG5hbWV9fX0nIC8+XG4qXG4qL1xuZXhwb3J0cy5pblNpbmdsZVF1b3RlZEF0dHIgPSBwcml2RmlsdGVycy55YXZzO1xuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyNpbkRvdWJsZVF1b3RlZEF0dHJcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dFxuKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHMgd2l0aCBhbnkgc2luZ2xlLXF1b3RlIGNoYXJhY3RlcnMgZW5jb2RlZCBpbnRvICcmYW1wOyZxdW90OycuXG4qXG4qIEBkZXNjcmlwdGlvblxuKiA8cCBjbGFzcz1cIndhcm5pbmdcIj5XYXJuaW5nOiBUaGlzIGlzIE5PVCBkZXNpZ25lZCBmb3IgYW55IG9uWCAoZS5nLiwgb25jbGljaykgYXR0cmlidXRlcyE8L3A+XG4qIDxwIGNsYXNzPVwid2FybmluZ1wiPldhcm5pbmc6IElmIHlvdSdyZSB3b3JraW5nIG9uIFVSSS9jb21wb25lbnRzLCB1c2UgdGhlIG1vcmUgc3BlY2lmaWMgdXJpX19fSW5Eb3VibGVRdW90ZWRBdHRyIGZpbHRlciA8L3A+XG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIEF0dHJpYnV0ZSBWYWx1ZSAoZG91YmxlLXF1b3RlZCkgc3RhdGUgdG8gZW5jb2RlIGFsbCBzaW5nbGUtcXVvdGUgY2hhcmFjdGVycyBpbnRvICcmYW1wOyZxdW90OydcbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0oZG91YmxlLXF1b3RlZCktc3RhdGVcIj5IVE1MNSBBdHRyaWJ1dGUgVmFsdWUgKERvdWJsZS1RdW90ZWQpIFN0YXRlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDxpbnB1dCBuYW1lPVwiZmlyc3RuYW1lXCIgdmFsdWU9XCJ7e3tpbkRvdWJsZVF1b3RlZEF0dHIgZmlyc3RuYW1lfX19XCIgLz5cbipcbiovXG5leHBvcnRzLmluRG91YmxlUXVvdGVkQXR0ciA9IHByaXZGaWx0ZXJzLnlhdmQ7XG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI2luVW5RdW90ZWRBdHRyXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXRcbiogQHJldHVybnMge3N0cmluZ30gSWYgcyBjb250YWlucyBhbnkgc3RhdGUgYnJlYWtpbmcgY2hhcnMgKFxcdCwgXFxuLCBcXHYsIFxcZiwgXFxyLCBzcGFjZSwgbnVsbCwgJywgXCIsIGAsIDwsID4sIGFuZCA9KSwgdGhleSBhcmUgZXNjYXBlZCBhbmQgZW5jb2RlZCBpbnRvIHRoZWlyIGVxdWl2YWxlbnQgSFRNTCBlbnRpdHkgcmVwcmVzZW50YXRpb25zLiBJZiB0aGUgc3RyaW5nIGlzIGVtcHR5LCBpbmplY3QgYSBcXHVGRkZEIGNoYXJhY3Rlci5cbipcbiogQGRlc2NyaXB0aW9uXG4qIDxwIGNsYXNzPVwid2FybmluZ1wiPldhcm5pbmc6IFRoaXMgaXMgTk9UIGRlc2lnbmVkIGZvciBhbnkgb25YIChlLmcuLCBvbmNsaWNrKSBhdHRyaWJ1dGVzITwvcD5cbiogPHAgY2xhc3M9XCJ3YXJuaW5nXCI+V2FybmluZzogSWYgeW91J3JlIHdvcmtpbmcgb24gVVJJL2NvbXBvbmVudHMsIHVzZSB0aGUgbW9yZSBzcGVjaWZpYyB1cmlfX19JblVuUXVvdGVkQXR0ciBmaWx0ZXIgPC9wPlxuKiA8cD5SZWdhcmRpbmcgXFx1RkZGRCBpbmplY3Rpb24sIGdpdmVuIDxhIGlkPXt7e2lkfX19IG5hbWU9XCJwYXNzd2RcIj4sPGJyLz5cbiogICAgICAgIFJhdGlvbmFsZSAxOiBvdXIgYmVsaWVmIGlzIHRoYXQgZGV2ZWxvcGVycyB3b3VsZG4ndCBleHBlY3Qgd2hlbiBpZCBlcXVhbHMgYW5cbiogICAgICAgICAgZW1wdHkgc3RyaW5nIHdvdWxkIHJlc3VsdCBpbiAnIG5hbWU9XCJwYXNzd2RcIicgcmVuZGVyZWQgYXMgXG4qICAgICAgICAgIGF0dHJpYnV0ZSB2YWx1ZSwgZXZlbiB0aG91Z2ggdGhpcyBpcyBob3cgSFRNTDUgaXMgc3BlY2lmaWVkLjxici8+XG4qICAgICAgICBSYXRpb25hbGUgMjogYW4gZW1wdHkgb3IgYWxsIG51bGwgc3RyaW5nIChmb3IgSUUpIGNhbiBcbiogICAgICAgICAgZWZmZWN0aXZlbHkgYWx0ZXIgaXRzIGltbWVkaWF0ZSBzdWJzZXF1ZW50IHN0YXRlLCB3ZSBjaG9vc2VcbiogICAgICAgICAgXFx1RkZGRCB0byBlbmQgdGhlIHVucXVvdGVkIGF0dHIgXG4qICAgICAgICAgIHN0YXRlLCB3aGljaCB0aGVyZWZvcmUgd2lsbCBub3QgbWVzcyB1cCBsYXRlciBjb250ZXh0cy48YnIvPlxuKiAgICAgICAgUmF0aW9uYWxlIDM6IFNpbmNlIElFIDYsIGl0IGlzIHZlcmlmaWVkIHRoYXQgTlVMTCBjaGFycyBhcmUgc3RyaXBwZWQuPGJyLz5cbiogICAgICAgIFJlZmVyZW5jZTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLSh1bnF1b3RlZCktc3RhdGU8L3A+XG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGUtdmFsdWUtKHVucXVvdGVkKS1zdGF0ZVwiPkhUTUw1IEF0dHJpYnV0ZSBWYWx1ZSAoVW5xdW90ZWQpIFN0YXRlPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYmVmb3JlLWF0dHJpYnV0ZS12YWx1ZS1zdGF0ZVwiPkhUTUw1IEJlZm9yZSBBdHRyaWJ1dGUgVmFsdWUgU3RhdGU8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vc2hhenplci5jby51ay9kYXRhYmFzZS9BbGwvQ2hhcmFjdGVycy13aGljaC1icmVhay1hdHRyaWJ1dGVzLXdpdGhvdXQtcXVvdGVzXCI+U2hhenplciAtIENoYXJhY3RlcnMtd2hpY2gtYnJlYWstYXR0cmlidXRlcy13aXRob3V0LXF1b3RlczwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly9zaGF6emVyLmNvLnVrL3ZlY3Rvci9DaGFyYWN0ZXJzLWFsbG93ZWQtYXR0cmlidXRlLXF1b3RlXCI+U2hhenplciAtIENoYXJhY3RlcnMtYWxsb3dlZC1hdHRyaWJ1dGUtcXVvdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGlucHV0IG5hbWU9XCJmaXJzdG5hbWVcIiB2YWx1ZT17e3tpblVuUXVvdGVkQXR0ciBmaXJzdG5hbWV9fX0gLz5cbipcbiovXG5leHBvcnRzLmluVW5RdW90ZWRBdHRyID0gcHJpdkZpbHRlcnMueWF2dTtcblxuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlJblNpbmdsZVF1b3RlZEF0dHJcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dCwgc3VwcG9zZWRseSBhbiA8c3Ryb25nPmFic29sdXRlPC9zdHJvbmc+IFVSSVxuKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHMgZW5jb2RlZCBmaXJzdCBieSB3aW5kb3cuZW5jb2RlVVJJKCksIHRoZW4gaW5TaW5nbGVRdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBBdHRyaWJ1dGUgVmFsdWUgKHNpbmdsZS1xdW90ZWQpIHN0YXRlIGZvciBhbiA8c3Ryb25nPmFic29sdXRlPC9zdHJvbmc+IFVSSS48YnIvPlxuKiBUaGUgY29ycmVjdCBvcmRlciBvZiBlbmNvZGVycyBpcyB0aHVzOiBmaXJzdCB3aW5kb3cuZW5jb2RlVVJJKCksIHRoZW4gaW5TaW5nbGVRdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qIDxwPk5vdGljZTogVGhpcyBmaWx0ZXIgaXMgSVB2NiBmcmllbmRseSBieSBub3QgZW5jb2RpbmcgJ1snIGFuZCAnXScuPC9wPlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJXCI+ZW5jb2RlVVJJIHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLShzaW5nbGUtcXVvdGVkKS1zdGF0ZVwiPkhUTUw1IEF0dHJpYnV0ZSBWYWx1ZSAoU2luZ2xlLVF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj0ne3t7dXJpSW5TaW5nbGVRdW90ZWRBdHRyIGZ1bGxfdXJpfX19Jz5saW5rPC9hPlxuKiBcbiovXG5leHBvcnRzLnVyaUluU2luZ2xlUXVvdGVkQXR0ciA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHVyaUluQXR0cihzLCBwcml2RmlsdGVycy55YXZzKTtcbn07XG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUluRG91YmxlUXVvdGVkQXR0clxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGFuIDxzdHJvbmc+YWJzb2x1dGU8L3N0cm9uZz4gVVJJXG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGZpcnN0IGJ5IHdpbmRvdy5lbmNvZGVVUkkoKSwgdGhlbiBpbkRvdWJsZVF1b3RlZEF0dHIoKSwgYW5kIGZpbmFsbHkgcHJlZml4IHRoZSByZXN1bHRlZCBzdHJpbmcgd2l0aCAneC0nIGlmIGl0IGJlZ2lucyB3aXRoICdqYXZhc2NyaXB0Oicgb3IgJ3Zic2NyaXB0OicgdGhhdCBjb3VsZCBwb3NzaWJseSBsZWFkIHRvIHNjcmlwdCBleGVjdXRpb25cbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIEF0dHJpYnV0ZSBWYWx1ZSAoZG91YmxlLXF1b3RlZCkgc3RhdGUgZm9yIGFuIDxzdHJvbmc+YWJzb2x1dGU8L3N0cm9uZz4gVVJJLjxici8+XG4qIFRoZSBjb3JyZWN0IG9yZGVyIG9mIGVuY29kZXJzIGlzIHRodXM6IGZpcnN0IHdpbmRvdy5lbmNvZGVVUkkoKSwgdGhlbiBpbkRvdWJsZVF1b3RlZEF0dHIoKSwgYW5kIGZpbmFsbHkgcHJlZml4IHRoZSByZXN1bHRlZCBzdHJpbmcgd2l0aCAneC0nIGlmIGl0IGJlZ2lucyB3aXRoICdqYXZhc2NyaXB0Oicgb3IgJ3Zic2NyaXB0OicgdGhhdCBjb3VsZCBwb3NzaWJseSBsZWFkIHRvIHNjcmlwdCBleGVjdXRpb25cbipcbiogPHA+Tm90aWNlOiBUaGlzIGZpbHRlciBpcyBJUHY2IGZyaWVuZGx5IGJ5IG5vdCBlbmNvZGluZyAnWycgYW5kICddJy48L3A+XG4qXG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9lbmNvZGVVUklcIj5lbmNvZGVVUkkgfCBNRE48L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2XCI+UkZDIDM5ODY8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGUtdmFsdWUtKGRvdWJsZS1xdW90ZWQpLXN0YXRlXCI+SFRNTDUgQXR0cmlidXRlIFZhbHVlIChEb3VibGUtUXVvdGVkKSBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8YSBocmVmPVwie3t7dXJpSW5Eb3VibGVRdW90ZWRBdHRyIGZ1bGxfdXJpfX19XCI+bGluazwvYT5cbiogXG4qL1xuZXhwb3J0cy51cmlJbkRvdWJsZVF1b3RlZEF0dHIgPSBmdW5jdGlvbiAocykge1xuICAgIHJldHVybiB1cmlJbkF0dHIocywgcHJpdkZpbHRlcnMueWF2ZCk7XG59O1xuXG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUluVW5RdW90ZWRBdHRyXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYW4gPHN0cm9uZz5hYnNvbHV0ZTwvc3Ryb25nPiBVUklcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgZmlyc3QgYnkgd2luZG93LmVuY29kZVVSSSgpLCB0aGVuIGluVW5RdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBBdHRyaWJ1dGUgVmFsdWUgKHVucXVvdGVkKSBzdGF0ZSBmb3IgYW4gPHN0cm9uZz5hYnNvbHV0ZTwvc3Ryb25nPiBVUkkuPGJyLz5cbiogVGhlIGNvcnJlY3Qgb3JkZXIgb2YgZW5jb2RlcnMgaXMgdGh1czogZmlyc3QgdGhlIGJ1aWx0LWluIGVuY29kZVVSSSgpLCB0aGVuIGluVW5RdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qIDxwPk5vdGljZTogVGhpcyBmaWx0ZXIgaXMgSVB2NiBmcmllbmRseSBieSBub3QgZW5jb2RpbmcgJ1snIGFuZCAnXScuPC9wPlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJXCI+ZW5jb2RlVVJJIHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLSh1bnF1b3RlZCktc3RhdGVcIj5IVE1MNSBBdHRyaWJ1dGUgVmFsdWUgKFVucXVvdGVkKSBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8YSBocmVmPXt7e3VyaUluVW5RdW90ZWRBdHRyIGZ1bGxfdXJpfX19Pmxpbms8L2E+XG4qIFxuKi9cbmV4cG9ydHMudXJpSW5VblF1b3RlZEF0dHIgPSBmdW5jdGlvbiAocykge1xuICAgIHJldHVybiB1cmlJbkF0dHIocywgcHJpdkZpbHRlcnMueWF2dSk7XG59O1xuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlJbkhUTUxEYXRhXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYW4gPHN0cm9uZz5hYnNvbHV0ZTwvc3Ryb25nPiBVUklcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgYnkgd2luZG93LmVuY29kZVVSSSgpIGFuZCB0aGVuIGluSFRNTERhdGEoKVxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgRGF0YSBzdGF0ZSBmb3IgYW4gPHN0cm9uZz5hYnNvbHV0ZTwvc3Ryb25nPiBVUkkuXG4qXG4qIDxwPk5vdGljZTogVGhlIGFjdHVhbCBpbXBsZW1lbnRhdGlvbiBza2lwcyBpbkhUTUxEYXRhKCksIHNpbmNlICc8JyBpcyBhbHJlYWR5IGVuY29kZWQgYXMgJyUzQycgYnkgZW5jb2RlVVJJKCkuPC9wPlxuKiA8cD5Ob3RpY2U6IFRoaXMgZmlsdGVyIGlzIElQdjYgZnJpZW5kbHkgYnkgbm90IGVuY29kaW5nICdbJyBhbmQgJ10nLjwvcD5cbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSVwiPmVuY29kZVVSSSB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2RhdGEtc3RhdGVcIj5IVE1MNSBEYXRhIFN0YXRlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDxhIGhyZWY9XCIvc29tZXdoZXJlXCI+e3t7dXJpSW5IVE1MRGF0YSBmdWxsX3VyaX19fTwvYT5cbiogXG4qL1xuZXhwb3J0cy51cmlJbkhUTUxEYXRhID0gcHJpdkZpbHRlcnMueXVmdWxsO1xuXG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUluSFRNTENvbW1lbnRcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dCwgc3VwcG9zZWRseSBhbiA8c3Ryb25nPmFic29sdXRlPC9zdHJvbmc+IFVSSVxuKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHMgZW5jb2RlZCBieSB3aW5kb3cuZW5jb2RlVVJJKCksIGFuZCBmaW5hbGx5IGluSFRNTENvbW1lbnQoKVxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQ29tbWVudCBzdGF0ZSBmb3IgYW4gPHN0cm9uZz5hYnNvbHV0ZTwvc3Ryb25nPiBVUkkuXG4qXG4qIDxwPk5vdGljZTogVGhpcyBmaWx0ZXIgaXMgSVB2NiBmcmllbmRseSBieSBub3QgZW5jb2RpbmcgJ1snIGFuZCAnXScuPC9wPlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJXCI+ZW5jb2RlVVJJIHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjZGF0YS1zdGF0ZVwiPkhUTUw1IERhdGEgU3RhdGU8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNjb21tZW50LXN0YXRlXCI+SFRNTDUgQ29tbWVudCBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8IS0tIHt7e3VyaUluSFRNTENvbW1lbnQgZnVsbF91cml9fX0gLS0+XG4qIFxuKi9cbmV4cG9ydHMudXJpSW5IVE1MQ29tbWVudCA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHByaXZGaWx0ZXJzLnljKHByaXZGaWx0ZXJzLnl1ZnVsbChzKSk7XG59O1xuXG5cblxuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlQYXRoSW5TaW5nbGVRdW90ZWRBdHRyXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYSBVUkkgUGF0aC9RdWVyeSBvciByZWxhdGl2ZSBVUklcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgZmlyc3QgYnkgd2luZG93LmVuY29kZVVSSSgpLCB0aGVuIGluU2luZ2xlUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQXR0cmlidXRlIFZhbHVlIChzaW5nbGUtcXVvdGVkKSBzdGF0ZSBmb3IgYSBVUkkgUGF0aC9RdWVyeSBvciByZWxhdGl2ZSBVUkkuPGJyLz5cbiogVGhlIGNvcnJlY3Qgb3JkZXIgb2YgZW5jb2RlcnMgaXMgdGh1czogZmlyc3Qgd2luZG93LmVuY29kZVVSSSgpLCB0aGVuIGluU2luZ2xlUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJXCI+ZW5jb2RlVVJJIHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLShzaW5nbGUtcXVvdGVkKS1zdGF0ZVwiPkhUTUw1IEF0dHJpYnV0ZSBWYWx1ZSAoU2luZ2xlLVF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj0naHR0cDovL2V4YW1wbGUuY29tL3t7e3VyaVBhdGhJblNpbmdsZVF1b3RlZEF0dHIgdXJpX3BhdGh9fX0nPmxpbms8L2E+XG4qIDxhIGhyZWY9J2h0dHA6Ly9leGFtcGxlLmNvbS8/e3t7dXJpUXVlcnlJblNpbmdsZVF1b3RlZEF0dHIgdXJpX3F1ZXJ5fX19Jz5saW5rPC9hPlxuKiBcbiovXG5leHBvcnRzLnVyaVBhdGhJblNpbmdsZVF1b3RlZEF0dHIgPSBmdW5jdGlvbiAocykge1xuICAgIHJldHVybiB1cmlJbkF0dHIocywgcHJpdkZpbHRlcnMueWF2cywgcHJpdkZpbHRlcnMueXUpO1xufTtcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUGF0aEluRG91YmxlUXVvdGVkQXR0clxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGEgVVJJIFBhdGgvUXVlcnkgb3IgcmVsYXRpdmUgVVJJXG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGZpcnN0IGJ5IHdpbmRvdy5lbmNvZGVVUkkoKSwgdGhlbiBpbkRvdWJsZVF1b3RlZEF0dHIoKSwgYW5kIGZpbmFsbHkgcHJlZml4IHRoZSByZXN1bHRlZCBzdHJpbmcgd2l0aCAneC0nIGlmIGl0IGJlZ2lucyB3aXRoICdqYXZhc2NyaXB0Oicgb3IgJ3Zic2NyaXB0OicgdGhhdCBjb3VsZCBwb3NzaWJseSBsZWFkIHRvIHNjcmlwdCBleGVjdXRpb25cbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIEF0dHJpYnV0ZSBWYWx1ZSAoZG91YmxlLXF1b3RlZCkgc3RhdGUgZm9yIGEgVVJJIFBhdGgvUXVlcnkgb3IgcmVsYXRpdmUgVVJJLjxici8+XG4qIFRoZSBjb3JyZWN0IG9yZGVyIG9mIGVuY29kZXJzIGlzIHRodXM6IGZpcnN0IHdpbmRvdy5lbmNvZGVVUkkoKSwgdGhlbiBpbkRvdWJsZVF1b3RlZEF0dHIoKSwgYW5kIGZpbmFsbHkgcHJlZml4IHRoZSByZXN1bHRlZCBzdHJpbmcgd2l0aCAneC0nIGlmIGl0IGJlZ2lucyB3aXRoICdqYXZhc2NyaXB0Oicgb3IgJ3Zic2NyaXB0OicgdGhhdCBjb3VsZCBwb3NzaWJseSBsZWFkIHRvIHNjcmlwdCBleGVjdXRpb25cbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSVwiPmVuY29kZVVSSSB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0oZG91YmxlLXF1b3RlZCktc3RhdGVcIj5IVE1MNSBBdHRyaWJ1dGUgVmFsdWUgKERvdWJsZS1RdW90ZWQpIFN0YXRlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDxhIGhyZWY9XCJodHRwOi8vZXhhbXBsZS5jb20ve3t7dXJpUGF0aEluRG91YmxlUXVvdGVkQXR0ciB1cmlfcGF0aH19fVwiPmxpbms8L2E+XG4qIDxhIGhyZWY9XCJodHRwOi8vZXhhbXBsZS5jb20vP3t7e3VyaVF1ZXJ5SW5Eb3VibGVRdW90ZWRBdHRyIHVyaV9xdWVyeX19fVwiPmxpbms8L2E+XG4qIFxuKi9cbmV4cG9ydHMudXJpUGF0aEluRG91YmxlUXVvdGVkQXR0ciA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHVyaUluQXR0cihzLCBwcml2RmlsdGVycy55YXZkLCBwcml2RmlsdGVycy55dSk7XG59O1xuXG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVBhdGhJblVuUXVvdGVkQXR0clxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGEgVVJJIFBhdGgvUXVlcnkgb3IgcmVsYXRpdmUgVVJJXG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGZpcnN0IGJ5IHdpbmRvdy5lbmNvZGVVUkkoKSwgdGhlbiBpblVuUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQXR0cmlidXRlIFZhbHVlICh1bnF1b3RlZCkgc3RhdGUgZm9yIGEgVVJJIFBhdGgvUXVlcnkgb3IgcmVsYXRpdmUgVVJJLjxici8+XG4qIFRoZSBjb3JyZWN0IG9yZGVyIG9mIGVuY29kZXJzIGlzIHRodXM6IGZpcnN0IHRoZSBidWlsdC1pbiBlbmNvZGVVUkkoKSwgdGhlbiBpblVuUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJXCI+ZW5jb2RlVVJJIHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLSh1bnF1b3RlZCktc3RhdGVcIj5IVE1MNSBBdHRyaWJ1dGUgVmFsdWUgKFVucXVvdGVkKSBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8YSBocmVmPWh0dHA6Ly9leGFtcGxlLmNvbS97e3t1cmlQYXRoSW5VblF1b3RlZEF0dHIgdXJpX3BhdGh9fX0+bGluazwvYT5cbiogPGEgaHJlZj1odHRwOi8vZXhhbXBsZS5jb20vP3t7e3VyaVF1ZXJ5SW5VblF1b3RlZEF0dHIgdXJpX3F1ZXJ5fX19Pmxpbms8L2E+XG4qIFxuKi9cbmV4cG9ydHMudXJpUGF0aEluVW5RdW90ZWRBdHRyID0gZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gdXJpSW5BdHRyKHMsIHByaXZGaWx0ZXJzLnlhdnUsIHByaXZGaWx0ZXJzLnl1KTtcbn07XG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVBhdGhJbkhUTUxEYXRhXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYSBVUkkgUGF0aC9RdWVyeSBvciByZWxhdGl2ZSBVUklcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgYnkgd2luZG93LmVuY29kZVVSSSgpIGFuZCB0aGVuIGluSFRNTERhdGEoKVxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgRGF0YSBzdGF0ZSBmb3IgYSBVUkkgUGF0aC9RdWVyeSBvciByZWxhdGl2ZSBVUkkuXG4qXG4qIDxwPk5vdGljZTogVGhlIGFjdHVhbCBpbXBsZW1lbnRhdGlvbiBza2lwcyBpbkhUTUxEYXRhKCksIHNpbmNlICc8JyBpcyBhbHJlYWR5IGVuY29kZWQgYXMgJyUzQycgYnkgZW5jb2RlVVJJKCkuPC9wPlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJXCI+ZW5jb2RlVVJJIHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjZGF0YS1zdGF0ZVwiPkhUTUw1IERhdGEgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj1cImh0dHA6Ly9leGFtcGxlLmNvbS9cIj5odHRwOi8vZXhhbXBsZS5jb20ve3t7dXJpUGF0aEluSFRNTERhdGEgdXJpX3BhdGh9fX08L2E+XG4qIDxhIGhyZWY9XCJodHRwOi8vZXhhbXBsZS5jb20vXCI+aHR0cDovL2V4YW1wbGUuY29tLz97e3t1cmlRdWVyeUluSFRNTERhdGEgdXJpX3F1ZXJ5fX19PC9hPlxuKiBcbiovXG5leHBvcnRzLnVyaVBhdGhJbkhUTUxEYXRhID0gcHJpdkZpbHRlcnMueXU7XG5cblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUGF0aEluSFRNTENvbW1lbnRcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dCwgc3VwcG9zZWRseSBhIFVSSSBQYXRoL1F1ZXJ5IG9yIHJlbGF0aXZlIFVSSVxuKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHMgZW5jb2RlZCBieSB3aW5kb3cuZW5jb2RlVVJJKCksIGFuZCBmaW5hbGx5IGluSFRNTENvbW1lbnQoKVxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQ29tbWVudCBzdGF0ZSBmb3IgYSBVUkkgUGF0aC9RdWVyeSBvciByZWxhdGl2ZSBVUkkuXG4qXG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9lbmNvZGVVUklcIj5lbmNvZGVVUkkgfCBNRE48L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2XCI+UkZDIDM5ODY8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNkYXRhLXN0YXRlXCI+SFRNTDUgRGF0YSBTdGF0ZTwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2NvbW1lbnQtc3RhdGVcIj5IVE1MNSBDb21tZW50IFN0YXRlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDwhLS0gaHR0cDovL2V4YW1wbGUuY29tL3t7e3VyaVBhdGhJbkhUTUxDb21tZW50IHVyaV9wYXRofX19IC0tPlxuKiA8IS0tIGh0dHA6Ly9leGFtcGxlLmNvbS8/e3t7dXJpUXVlcnlJbkhUTUxDb21tZW50IHVyaV9xdWVyeX19fSAtLT5cbiovXG5leHBvcnRzLnVyaVBhdGhJbkhUTUxDb21tZW50ID0gZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gcHJpdkZpbHRlcnMueWMocHJpdkZpbHRlcnMueXUocykpO1xufTtcblxuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlRdWVyeUluU2luZ2xlUXVvdGVkQXR0clxuKiBAZGVzY3JpcHRpb24gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVBhdGhJblNpbmdsZVF1b3RlZEF0dHJ9XG4qIFxuKiBAYWxpYXMgbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVBhdGhJblNpbmdsZVF1b3RlZEF0dHJcbiovXG5leHBvcnRzLnVyaVF1ZXJ5SW5TaW5nbGVRdW90ZWRBdHRyID0gZXhwb3J0cy51cmlQYXRoSW5TaW5nbGVRdW90ZWRBdHRyO1xuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlRdWVyeUluRG91YmxlUXVvdGVkQXR0clxuKiBAZGVzY3JpcHRpb24gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVBhdGhJbkRvdWJsZVF1b3RlZEF0dHJ9XG4qIFxuKiBAYWxpYXMgbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVBhdGhJbkRvdWJsZVF1b3RlZEF0dHJcbiovXG5leHBvcnRzLnVyaVF1ZXJ5SW5Eb3VibGVRdW90ZWRBdHRyID0gZXhwb3J0cy51cmlQYXRoSW5Eb3VibGVRdW90ZWRBdHRyO1xuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlRdWVyeUluVW5RdW90ZWRBdHRyXG4qIEBkZXNjcmlwdGlvbiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUGF0aEluVW5RdW90ZWRBdHRyfVxuKiBcbiogQGFsaWFzIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlQYXRoSW5VblF1b3RlZEF0dHJcbiovXG5leHBvcnRzLnVyaVF1ZXJ5SW5VblF1b3RlZEF0dHIgPSBleHBvcnRzLnVyaVBhdGhJblVuUXVvdGVkQXR0cjtcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUXVlcnlJbkhUTUxEYXRhXG4qIEBkZXNjcmlwdGlvbiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUGF0aEluSFRNTERhdGF9XG4qIFxuKiBAYWxpYXMgbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVBhdGhJbkhUTUxEYXRhXG4qL1xuZXhwb3J0cy51cmlRdWVyeUluSFRNTERhdGEgPSBleHBvcnRzLnVyaVBhdGhJbkhUTUxEYXRhO1xuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlRdWVyeUluSFRNTENvbW1lbnRcbiogQGRlc2NyaXB0aW9uIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlQYXRoSW5IVE1MQ29tbWVudH1cbiogXG4qIEBhbGlhcyBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUGF0aEluSFRNTENvbW1lbnRcbiovXG5leHBvcnRzLnVyaVF1ZXJ5SW5IVE1MQ29tbWVudCA9IGV4cG9ydHMudXJpUGF0aEluSFRNTENvbW1lbnQ7XG5cblxuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlDb21wb25lbnRJblNpbmdsZVF1b3RlZEF0dHJcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dCwgc3VwcG9zZWRseSBhIFVSSSBDb21wb25lbnRcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgZmlyc3QgYnkgd2luZG93LmVuY29kZVVSSUNvbXBvbmVudCgpLCB0aGVuIGluU2luZ2xlUXVvdGVkQXR0cigpXG4qXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBBdHRyaWJ1dGUgVmFsdWUgKHNpbmdsZS1xdW90ZWQpIHN0YXRlIGZvciBhIFVSSSBDb21wb25lbnQuPGJyLz5cbiogVGhlIGNvcnJlY3Qgb3JkZXIgb2YgZW5jb2RlcnMgaXMgdGh1czogZmlyc3Qgd2luZG93LmVuY29kZVVSSUNvbXBvbmVudCgpLCB0aGVuIGluU2luZ2xlUXVvdGVkQXR0cigpXG4qXG4qXG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9lbmNvZGVVUklDb21wb25lbnRcIj5lbmNvZGVVUklDb21wb25lbnQgfCBNRE48L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2XCI+UkZDIDM5ODY8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGUtdmFsdWUtKHNpbmdsZS1xdW90ZWQpLXN0YXRlXCI+SFRNTDUgQXR0cmlidXRlIFZhbHVlIChTaW5nbGUtUXVvdGVkKSBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8YSBocmVmPSdodHRwOi8vZXhhbXBsZS5jb20vP3E9e3t7dXJpQ29tcG9uZW50SW5TaW5nbGVRdW90ZWRBdHRyIHVyaV9jb21wb25lbnR9fX0nPmxpbms8L2E+XG4qIFxuKi9cbmV4cG9ydHMudXJpQ29tcG9uZW50SW5TaW5nbGVRdW90ZWRBdHRyID0gZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gcHJpdkZpbHRlcnMueWF2cyhwcml2RmlsdGVycy55dWMocykpO1xufTtcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpQ29tcG9uZW50SW5Eb3VibGVRdW90ZWRBdHRyXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYSBVUkkgQ29tcG9uZW50XG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGZpcnN0IGJ5IHdpbmRvdy5lbmNvZGVVUklDb21wb25lbnQoKSwgdGhlbiBpbkRvdWJsZVF1b3RlZEF0dHIoKVxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQXR0cmlidXRlIFZhbHVlIChkb3VibGUtcXVvdGVkKSBzdGF0ZSBmb3IgYSBVUkkgQ29tcG9uZW50Ljxici8+XG4qIFRoZSBjb3JyZWN0IG9yZGVyIG9mIGVuY29kZXJzIGlzIHRodXM6IGZpcnN0IHdpbmRvdy5lbmNvZGVVUklDb21wb25lbnQoKSwgdGhlbiBpbkRvdWJsZVF1b3RlZEF0dHIoKVxuKlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJQ29tcG9uZW50XCI+ZW5jb2RlVVJJQ29tcG9uZW50IHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLShkb3VibGUtcXVvdGVkKS1zdGF0ZVwiPkhUTUw1IEF0dHJpYnV0ZSBWYWx1ZSAoRG91YmxlLVF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj1cImh0dHA6Ly9leGFtcGxlLmNvbS8/cT17e3t1cmlDb21wb25lbnRJbkRvdWJsZVF1b3RlZEF0dHIgdXJpX2NvbXBvbmVudH19fVwiPmxpbms8L2E+XG4qIFxuKi9cbmV4cG9ydHMudXJpQ29tcG9uZW50SW5Eb3VibGVRdW90ZWRBdHRyID0gZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gcHJpdkZpbHRlcnMueWF2ZChwcml2RmlsdGVycy55dWMocykpO1xufTtcblxuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlDb21wb25lbnRJblVuUXVvdGVkQXR0clxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGEgVVJJIENvbXBvbmVudFxuKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHMgZW5jb2RlZCBmaXJzdCBieSB3aW5kb3cuZW5jb2RlVVJJQ29tcG9uZW50KCksIHRoZW4gaW5VblF1b3RlZEF0dHIoKVxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQXR0cmlidXRlIFZhbHVlICh1bnF1b3RlZCkgc3RhdGUgZm9yIGEgVVJJIENvbXBvbmVudC48YnIvPlxuKiBUaGUgY29ycmVjdCBvcmRlciBvZiBlbmNvZGVycyBpcyB0aHVzOiBmaXJzdCB0aGUgYnVpbHQtaW4gZW5jb2RlVVJJQ29tcG9uZW50KCksIHRoZW4gaW5VblF1b3RlZEF0dHIoKVxuKlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJQ29tcG9uZW50XCI+ZW5jb2RlVVJJQ29tcG9uZW50IHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLSh1bnF1b3RlZCktc3RhdGVcIj5IVE1MNSBBdHRyaWJ1dGUgVmFsdWUgKFVucXVvdGVkKSBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8YSBocmVmPWh0dHA6Ly9leGFtcGxlLmNvbS8/cT17e3t1cmlDb21wb25lbnRJblVuUXVvdGVkQXR0ciB1cmlfY29tcG9uZW50fX19Pmxpbms8L2E+XG4qIFxuKi9cbmV4cG9ydHMudXJpQ29tcG9uZW50SW5VblF1b3RlZEF0dHIgPSBmdW5jdGlvbiAocykge1xuICAgIHJldHVybiBwcml2RmlsdGVycy55YXZ1KHByaXZGaWx0ZXJzLnl1YyhzKSk7XG59O1xuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlDb21wb25lbnRJbkhUTUxEYXRhXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYSBVUkkgQ29tcG9uZW50XG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGJ5IHdpbmRvdy5lbmNvZGVVUklDb21wb25lbnQoKSBhbmQgdGhlbiBpbkhUTUxEYXRhKClcbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIERhdGEgc3RhdGUgZm9yIGEgVVJJIENvbXBvbmVudC5cbipcbiogPHA+Tm90aWNlOiBUaGUgYWN0dWFsIGltcGxlbWVudGF0aW9uIHNraXBzIGluSFRNTERhdGEoKSwgc2luY2UgJzwnIGlzIGFscmVhZHkgZW5jb2RlZCBhcyAnJTNDJyBieSBlbmNvZGVVUklDb21wb25lbnQoKS48L3A+XG4qXG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9lbmNvZGVVUklDb21wb25lbnRcIj5lbmNvZGVVUklDb21wb25lbnQgfCBNRE48L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2XCI+UkZDIDM5ODY8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNkYXRhLXN0YXRlXCI+SFRNTDUgRGF0YSBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8YSBocmVmPVwiaHR0cDovL2V4YW1wbGUuY29tL1wiPmh0dHA6Ly9leGFtcGxlLmNvbS8/cT17e3t1cmlDb21wb25lbnRJbkhUTUxEYXRhIHVyaV9jb21wb25lbnR9fX08L2E+XG4qIDxhIGhyZWY9XCJodHRwOi8vZXhhbXBsZS5jb20vXCI+aHR0cDovL2V4YW1wbGUuY29tLyN7e3t1cmlDb21wb25lbnRJbkhUTUxEYXRhIHVyaV9mcmFnbWVudH19fTwvYT5cbiogXG4qL1xuZXhwb3J0cy51cmlDb21wb25lbnRJbkhUTUxEYXRhID0gcHJpdkZpbHRlcnMueXVjO1xuXG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUNvbXBvbmVudEluSFRNTENvbW1lbnRcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dCwgc3VwcG9zZWRseSBhIFVSSSBDb21wb25lbnRcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgYnkgd2luZG93LmVuY29kZVVSSUNvbXBvbmVudCgpLCBhbmQgZmluYWxseSBpbkhUTUxDb21tZW50KClcbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIENvbW1lbnQgc3RhdGUgZm9yIGEgVVJJIENvbXBvbmVudC5cbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSUNvbXBvbmVudFwiPmVuY29kZVVSSUNvbXBvbmVudCB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2RhdGEtc3RhdGVcIj5IVE1MNSBEYXRhIFN0YXRlPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjY29tbWVudC1zdGF0ZVwiPkhUTUw1IENvbW1lbnQgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPCEtLSBodHRwOi8vZXhhbXBsZS5jb20vP3E9e3t7dXJpQ29tcG9uZW50SW5IVE1MQ29tbWVudCB1cmlfY29tcG9uZW50fX19IC0tPlxuKiA8IS0tIGh0dHA6Ly9leGFtcGxlLmNvbS8je3t7dXJpQ29tcG9uZW50SW5IVE1MQ29tbWVudCB1cmlfZnJhZ21lbnR9fX0gLS0+XG4qL1xuZXhwb3J0cy51cmlDb21wb25lbnRJbkhUTUxDb21tZW50ID0gZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gcHJpdkZpbHRlcnMueWMocHJpdkZpbHRlcnMueXVjKHMpKTtcbn07XG5cblxuLy8gdXJpRnJhZ21lbnRJblNpbmdsZVF1b3RlZEF0dHJcbi8vIGFkZGVkIHl1Ymwgb24gdG9wIG9mIHVyaUNvbXBvbmVudEluQXR0ciBcbi8vIFJhdGlvbmFsZTogZ2l2ZW4gcGF0dGVybiBsaWtlIHRoaXM6IDxhIGhyZWY9J3t7e3VyaUZyYWdtZW50SW5TaW5nbGVRdW90ZWRBdHRyIHN9fX0nPlxuLy8gICAgICAgICAgICBkZXZlbG9wZXIgbWF5IGV4cGVjdCBzIGlzIGFsd2F5cyBwcmVmaXhlZCB3aXRoICMsIGJ1dCBhbiBhdHRhY2tlciBjYW4gYWJ1c2UgaXQgd2l0aCAnamF2YXNjcmlwdDphbGVydCgxKSdcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpRnJhZ21lbnRJblNpbmdsZVF1b3RlZEF0dHJcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dCwgc3VwcG9zZWRseSBhIFVSSSBGcmFnbWVudFxuKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHMgZW5jb2RlZCBmaXJzdCBieSB3aW5kb3cuZW5jb2RlVVJJQ29tcG9uZW50KCksIHRoZW4gaW5TaW5nbGVRdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBBdHRyaWJ1dGUgVmFsdWUgKHNpbmdsZS1xdW90ZWQpIHN0YXRlIGZvciBhIFVSSSBGcmFnbWVudC48YnIvPlxuKiBUaGUgY29ycmVjdCBvcmRlciBvZiBlbmNvZGVycyBpcyB0aHVzOiBmaXJzdCB3aW5kb3cuZW5jb2RlVVJJQ29tcG9uZW50KCksIHRoZW4gaW5TaW5nbGVRdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qXG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9lbmNvZGVVUklDb21wb25lbnRcIj5lbmNvZGVVUklDb21wb25lbnQgfCBNRE48L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2XCI+UkZDIDM5ODY8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGUtdmFsdWUtKHNpbmdsZS1xdW90ZWQpLXN0YXRlXCI+SFRNTDUgQXR0cmlidXRlIFZhbHVlIChTaW5nbGUtUXVvdGVkKSBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8YSBocmVmPSdodHRwOi8vZXhhbXBsZS5jb20vI3t7e3VyaUZyYWdtZW50SW5TaW5nbGVRdW90ZWRBdHRyIHVyaV9mcmFnbWVudH19fSc+bGluazwvYT5cbiogXG4qL1xuZXhwb3J0cy51cmlGcmFnbWVudEluU2luZ2xlUXVvdGVkQXR0ciA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHByaXZGaWx0ZXJzLnl1YmwocHJpdkZpbHRlcnMueWF2cyhwcml2RmlsdGVycy55dWMocykpKTtcbn07XG5cbi8vIHVyaUZyYWdtZW50SW5Eb3VibGVRdW90ZWRBdHRyXG4vLyBhZGRlZCB5dWJsIG9uIHRvcCBvZiB1cmlDb21wb25lbnRJbkF0dHIgXG4vLyBSYXRpb25hbGU6IGdpdmVuIHBhdHRlcm4gbGlrZSB0aGlzOiA8YSBocmVmPVwie3t7dXJpRnJhZ21lbnRJbkRvdWJsZVF1b3RlZEF0dHIgc319fVwiPlxuLy8gICAgICAgICAgICBkZXZlbG9wZXIgbWF5IGV4cGVjdCBzIGlzIGFsd2F5cyBwcmVmaXhlZCB3aXRoICMsIGJ1dCBhbiBhdHRhY2tlciBjYW4gYWJ1c2UgaXQgd2l0aCAnamF2YXNjcmlwdDphbGVydCgxKSdcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpRnJhZ21lbnRJbkRvdWJsZVF1b3RlZEF0dHJcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dCwgc3VwcG9zZWRseSBhIFVSSSBGcmFnbWVudFxuKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHMgZW5jb2RlZCBmaXJzdCBieSB3aW5kb3cuZW5jb2RlVVJJQ29tcG9uZW50KCksIHRoZW4gaW5Eb3VibGVRdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBBdHRyaWJ1dGUgVmFsdWUgKGRvdWJsZS1xdW90ZWQpIHN0YXRlIGZvciBhIFVSSSBGcmFnbWVudC48YnIvPlxuKiBUaGUgY29ycmVjdCBvcmRlciBvZiBlbmNvZGVycyBpcyB0aHVzOiBmaXJzdCB3aW5kb3cuZW5jb2RlVVJJQ29tcG9uZW50KCksIHRoZW4gaW5Eb3VibGVRdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qXG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9lbmNvZGVVUklDb21wb25lbnRcIj5lbmNvZGVVUklDb21wb25lbnQgfCBNRE48L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2XCI+UkZDIDM5ODY8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGUtdmFsdWUtKGRvdWJsZS1xdW90ZWQpLXN0YXRlXCI+SFRNTDUgQXR0cmlidXRlIFZhbHVlIChEb3VibGUtUXVvdGVkKSBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8YSBocmVmPVwiaHR0cDovL2V4YW1wbGUuY29tLyN7e3t1cmlGcmFnbWVudEluRG91YmxlUXVvdGVkQXR0ciB1cmlfZnJhZ21lbnR9fX1cIj5saW5rPC9hPlxuKiBcbiovXG5leHBvcnRzLnVyaUZyYWdtZW50SW5Eb3VibGVRdW90ZWRBdHRyID0gZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gcHJpdkZpbHRlcnMueXVibChwcml2RmlsdGVycy55YXZkKHByaXZGaWx0ZXJzLnl1YyhzKSkpO1xufTtcblxuLy8gdXJpRnJhZ21lbnRJblVuUXVvdGVkQXR0clxuLy8gYWRkZWQgeXVibCBvbiB0b3Agb2YgdXJpQ29tcG9uZW50SW5BdHRyIFxuLy8gUmF0aW9uYWxlOiBnaXZlbiBwYXR0ZXJuIGxpa2UgdGhpczogPGEgaHJlZj17e3t1cmlGcmFnbWVudEluVW5RdW90ZWRBdHRyIHN9fX0+XG4vLyAgICAgICAgICAgIGRldmVsb3BlciBtYXkgZXhwZWN0IHMgaXMgYWx3YXlzIHByZWZpeGVkIHdpdGggIywgYnV0IGFuIGF0dGFja2VyIGNhbiBhYnVzZSBpdCB3aXRoICdqYXZhc2NyaXB0OmFsZXJ0KDEpJ1xuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlGcmFnbWVudEluVW5RdW90ZWRBdHRyXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYSBVUkkgRnJhZ21lbnRcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgZmlyc3QgYnkgd2luZG93LmVuY29kZVVSSUNvbXBvbmVudCgpLCB0aGVuIGluVW5RdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBBdHRyaWJ1dGUgVmFsdWUgKHVucXVvdGVkKSBzdGF0ZSBmb3IgYSBVUkkgRnJhZ21lbnQuPGJyLz5cbiogVGhlIGNvcnJlY3Qgb3JkZXIgb2YgZW5jb2RlcnMgaXMgdGh1czogZmlyc3QgdGhlIGJ1aWx0LWluIGVuY29kZVVSSUNvbXBvbmVudCgpLCB0aGVuIGluVW5RdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9lbmNvZGVVUklDb21wb25lbnRcIj5lbmNvZGVVUklDb21wb25lbnQgfCBNRE48L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2XCI+UkZDIDM5ODY8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGUtdmFsdWUtKHVucXVvdGVkKS1zdGF0ZVwiPkhUTUw1IEF0dHJpYnV0ZSBWYWx1ZSAoVW5xdW90ZWQpIFN0YXRlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDxhIGhyZWY9aHR0cDovL2V4YW1wbGUuY29tLyN7e3t1cmlGcmFnbWVudEluVW5RdW90ZWRBdHRyIHVyaV9mcmFnbWVudH19fT5saW5rPC9hPlxuKiBcbiovXG5leHBvcnRzLnVyaUZyYWdtZW50SW5VblF1b3RlZEF0dHIgPSBmdW5jdGlvbiAocykge1xuICAgIHJldHVybiBwcml2RmlsdGVycy55dWJsKHByaXZGaWx0ZXJzLnlhdnUocHJpdkZpbHRlcnMueXVjKHMpKSk7XG59O1xuXG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUZyYWdtZW50SW5IVE1MRGF0YVxuKiBAZGVzY3JpcHRpb24gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUNvbXBvbmVudEluSFRNTERhdGF9XG4qIFxuKiBAYWxpYXMgbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUNvbXBvbmVudEluSFRNTERhdGFcbiovXG5leHBvcnRzLnVyaUZyYWdtZW50SW5IVE1MRGF0YSA9IGV4cG9ydHMudXJpQ29tcG9uZW50SW5IVE1MRGF0YTtcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpRnJhZ21lbnRJbkhUTUxDb21tZW50XG4qIEBkZXNjcmlwdGlvbiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpQ29tcG9uZW50SW5IVE1MQ29tbWVudH1cbiogXG4qIEBhbGlhcyBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpQ29tcG9uZW50SW5IVE1MQ29tbWVudFxuKi9cbmV4cG9ydHMudXJpRnJhZ21lbnRJbkhUTUxDb21tZW50ID0gZXhwb3J0cy51cmlDb21wb25lbnRJbkhUTUxDb21tZW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBzdGF0ZSA9IHtcblx0YXBwVGl0bGU6ICdDb25kdWl0Jyxcblx0c2VsZWN0ZWRBcnRpY2xlczoge1xuXHRcdGlzTG9hZGluZzogZmFsc2UsXG5cdFx0bGlzdDogbnVsbCxcblx0XHRhdXRob3I6ICcnLFxuXHRcdGZhdm9yaXRlZDogJycsXG5cdFx0bGltaXQ6IDEwLFxuXHRcdG9mZnNldDogMCxcblx0XHR0b3RhbDogMCxcblx0XHR0eXBlOiB7XG5cdFx0XHRuYW1lOiAnR0xPQkFMJyxcblx0XHRcdGxhYmVsOiAnR2xvYmFsIEZlZWQnXG5cdFx0fSxcblx0fSxcblx0YXJ0aWNsZUxpc3RUeXBlczoge1xuXHRcdEdMT0JBTDoge1xuXHRcdFx0bmFtZTogJ0dMT0JBTCcsXG5cdFx0XHRsYWJlbDogJ0dsb2JhbCBGZWVkJ1xuXHRcdH0sXG5cdFx0VVNFUl9GQVZPUklURUQ6IHtcblx0XHRcdG5hbWU6ICdVU0VSX0ZBVk9SSVRFRCcsXG5cdFx0XHRsYWJlbDogJ1lvdXIgRmVlZCdcblx0XHR9LFxuXHRcdFVTRVJfT1dORUQ6IHtcblx0XHRcdG5hbWU6ICdVU0VSX09XTkVEJyxcblx0XHRcdGxhYmVsOiAnTXkgQXJ0aWNsZXMnXG5cdFx0fVxuXHR9LFxuXHRhcnRpY2xlc0J5VGFnOiB7fSxcblx0dGFnczoge30sXG5cdHNlbGVjdGVkQXJ0aWNsZToge1xuXHRcdGRhdGE6IG51bGwsXG5cdFx0aXNMb2FkaW5nOiBmYWxzZVxuXHR9LFxuXHRzZWxlY3RlZEFydGljbGVDb21tZW50czoge1xuXHRcdGRhdGE6IG51bGwsXG5cdFx0aXNMb2FkaW5nOiBmYWxzZVxuXHR9LFxuXHRpc0FydGljbGVDb21tZW50Q3JlYXRpb25CdXN5OiBmYWxzZSxcblx0dXNlckF1dGhvcml6YXRpb25Ub2tlbjogbnVsbCxcblx0aXNVc2VyTG9naW5CdXN5OiBmYWxzZSxcblx0dXNlckxvZ2luRXJyb3JzOiBudWxsLFxuXHRpc1VzZXJSZWdpc3RyYXRpb25CdXN5OiBmYWxzZSxcblx0dXNlclJlZ2lzdHJhdGlvbkVycm9yczogbnVsbCxcblx0aXNVc2VyU2V0dGluZ3NVcGRhdGVCdXN5OiBmYWxzZSxcblx0dXNlclVwZGF0ZVNldHRpbmdzRXJyb3JzOiBudWxsLFxuXHRpc0NyZWF0ZUFydGljbGVCdXN5OiBmYWxzZSxcblx0Y3JlYXRlQXJ0aWNsZUVycm9yczogbnVsbCxcblx0aXNEZWxldGVBcnRpY2xlQnVzeTogZmFsc2UsXG5cdHVzZXI6IG51bGwsXG5cdHNlbGVjdGVkVXNlclByb2ZpbGU6IHtcblx0XHRkYXRhOiBudWxsLFxuXHRcdGlzTG9hZGluZzogZmFsc2Vcblx0fVxufTtcblxuXG52YXIgQVBJX0JBU0VfVVJJID0gJy8vY29uZHVpdC5wcm9kdWN0aW9ucmVhZHkuaW8vYXBpJztcblxuXG5mdW5jdGlvbiBpbml0KCkge1xuXHRhY3Rpb25zLmdldExvZ2dlZEluVXNlcih3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2p3dCcpKTtcbn1cblxuXG5mdW5jdGlvbiBnZXRFcnJvck1lc3NhZ2VGcm9tQVBJRXJyb3JPYmplY3QoZSkge1xuXHR2YXIgcmVzcG9uc2UgPSBudWxsO1xuXG5cdHRyeSB7XG5cdFx0cmVzcG9uc2UgPSBKU09OLnBhcnNlKGUubWVzc2FnZSkuZXJyb3JzO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdHJlc3BvbnNlID0ge1xuXHRcdFx0J0FuIHVuaGFuZGxlZCBlcnJvciBvY2N1cnJlZCc6IFtdXG5cdFx0fTtcblx0fVxuXG5cdHJldHVybiByZXNwb25zZTtcbn1cblxuXG5mdW5jdGlvbiByZWRpcmVjdFRvUHJldmlvdXNQYWdlT3JIb21lKCkge1xuXHRpZiAod2luZG93Lmhpc3RvcnkubGVuZ3RoID4gMCkge1xuXHRcdHdpbmRvdy5oaXN0b3J5LmJhY2soKTtcblx0fSBlbHNlIHtcblx0XHRtLnJvdXRlLnNldCgnLycpO1xuXHR9XG59XG5cblxuZnVuY3Rpb24gZ2V0QXJ0aWNsZXMocGF5bG9hZCkge1xuXHQvKlxuXHRUT0RPXG5cblx0RmlsdGVyIGJ5IGF1dGhvcjpcblxuXHQ/YXV0aG9yPWpha2VcblxuXHRGYXZvcml0ZWQgYnkgdXNlcjpcblxuXHQ/ZmF2b3JpdGVkPWpha2VcblxuXHRMaW1pdCBudW1iZXIgb2YgYXJ0aWNsZXMgKGRlZmF1bHQgaXMgMjApOlxuXG5cdD9saW1pdD0yMFxuXG5cdE9mZnNldC9za2lwIG51bWJlciBvZiBhcnRpY2xlcyAoZGVmYXVsdCBpcyAwKTpcblxuXHQ/b2Zmc2V0PTBcblx0Ki9cblxuXHQvLyBpZiAoIXBheWxvYWQpIHtcblx0Ly8gXHRwYXlsb2FkID0ge1xuXHQvLyBcdFx0bGltaXQ6IDNcblx0Ly8gXHR9O1xuXHQvLyB9XG5cblx0dmFyIHF1ZXJ5U3RyaW5nID0gbS5idWlsZFF1ZXJ5U3RyaW5nKHBheWxvYWQpO1xuXG5cdHJldHVybiBtLnJlcXVlc3Qoe1xuXHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0dXJsOiBBUElfQkFTRV9VUkkgKyAnL2FydGljbGVzPycgKyBxdWVyeVN0cmluZ1xuXHR9KVxuXHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHRcdFx0Ly8gcmV0dXJuIFtdOyAvLyBUZXN0IGVtcHR5IHJlc3BvbnNlXG5cdFx0XHRyZXR1cm4gcmVzcG9uc2U7XG5cdFx0fSk7XG59XG5cblxuZnVuY3Rpb24gaXNWYWx1ZU51bGxPclVuZGVmaW5lZCh2YWx1ZSkge1xuXHRyZXR1cm4gKHZhbHVlID09PSBudWxsKSB8fCB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnO1xufVxuXG5cbmZ1bmN0aW9uIGdldFZhbHVlRnJvbVN1cHBsaWVkT3JPdGhlcihzdXBwbGllZCwgb3RoZXIpIHtcblx0cmV0dXJuICFpc1ZhbHVlTnVsbE9yVW5kZWZpbmVkKHN1cHBsaWVkKSA/IHN1cHBsaWVkIDogb3RoZXI7XG59XG5cblxuZnVuY3Rpb24gc2V0dXBTZWxlY3RlZEFydGljbGVzU3RhdGVGb3JSZXF1ZXN0KHBheWxvYWQsIHNlbGVjdGVkQXJ0aWNsZXMpIHtcblx0dmFyIHNlbGVjdGVkQXJ0aWNsZXMgPSB7XG5cdFx0aXNMb2FkaW5nOiB0cnVlLFxuXHRcdGxpc3Q6IG51bGwsXG5cdFx0dG90YWw6IDAsXG5cdFx0dHlwZTogZ2V0VmFsdWVGcm9tU3VwcGxpZWRPck90aGVyKHBheWxvYWQudHlwZSwgc3RhdGUuYXJ0aWNsZUxpc3RUeXBlcy50eXBlKSxcblx0XHRsaW1pdDogZ2V0VmFsdWVGcm9tU3VwcGxpZWRPck90aGVyKHBheWxvYWQubGltaXQsIHN0YXRlLmFydGljbGVMaXN0VHlwZXMubGltaXQpLFxuXHRcdG9mZnNldDogZ2V0VmFsdWVGcm9tU3VwcGxpZWRPck90aGVyKHBheWxvYWQub2Zmc2V0LCBzdGF0ZS5hcnRpY2xlTGlzdFR5cGVzLm9mZnNldCksXG5cdFx0YXV0aG9yOiBnZXRWYWx1ZUZyb21TdXBwbGllZE9yT3RoZXIocGF5bG9hZC5hdXRob3IsIHN0YXRlLmFydGljbGVMaXN0VHlwZXMuYXV0aG9yKSxcblx0XHRmYXZvcml0ZWQ6IGdldFZhbHVlRnJvbVN1cHBsaWVkT3JPdGhlcihwYXlsb2FkLmZhdm9yaXRlZCwgc3RhdGUuYXJ0aWNsZUxpc3RUeXBlcy5mYXZvcml0ZWQpXG5cdH07XG5cblx0cmV0dXJuIHNlbGVjdGVkQXJ0aWNsZXM7XG59XG5cblxuXG52YXIgYWN0aW9ucyA9IHtcblxuXHRzZXRDdXJyZW50bHlBY3RpdmVBcnRpY2xlczogZnVuY3Rpb24gKHBheWxvYWQpIHtcblx0XHR2YXIgcmVxdWVzdCA9IHt9O1xuXHRcdHBheWxvYWQgPSBwYXlsb2FkIHx8IHt9O1xuXG5cdFx0c3RhdGUuc2VsZWN0ZWRBcnRpY2xlcyA9IHNldHVwU2VsZWN0ZWRBcnRpY2xlc1N0YXRlRm9yUmVxdWVzdChwYXlsb2FkKTtcblxuXHRcdHJlcXVlc3QubGltaXQgPSBzdGF0ZS5zZWxlY3RlZEFydGljbGVzLmxpbWl0O1xuXHRcdHJlcXVlc3Qub2Zmc2V0ID0gc3RhdGUuc2VsZWN0ZWRBcnRpY2xlcy5vZmZzZXQ7XG5cdFx0cmVxdWVzdC5hdXRob3IgPSBzdGF0ZS5zZWxlY3RlZEFydGljbGVzLmF1dGhvcjtcblx0XHRyZXF1ZXN0LmZhdm9yaXRlZCA9IHN0YXRlLnNlbGVjdGVkQXJ0aWNsZXMuZmF2b3JpdGVkO1xuXG5cdFx0Y29uc29sZS5pbmZvKCdkb21haW4uc2V0Q3VycmVudGx5QWN0aXZlQXJ0aWNsZXMoKScsIHBheWxvYWQsIHJlcXVlc3QpO1xuXG5cdFx0cmV0dXJuIGdldEFydGljbGVzKHJlcXVlc3QpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblx0XHRcdFx0c3RhdGUuc2VsZWN0ZWRBcnRpY2xlcy5saXN0ID0gcmVzcG9uc2UuYXJ0aWNsZXM7XG5cdFx0XHRcdHN0YXRlLnNlbGVjdGVkQXJ0aWNsZXMudG90YWwgPSByZXNwb25zZS5hcnRpY2xlc0NvdW50O1xuXHRcdFx0XHRzdGF0ZS5zZWxlY3RlZEFydGljbGVzLmlzTG9hZGluZyA9IGZhbHNlO1xuXHRcdFx0fSk7XG5cdH0sXG5cblxuXHRnZXRBcnRpY2xlc0J5VGFnOiBmdW5jdGlvbiAodGFnKSB7XG5cdFx0cmV0dXJuIGdldEFydGljbGVzKHsgdGFnOiB0YWcgfSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHRcdFx0XHRzdGF0ZS5hcnRpY2xlc0J5VGFnLnRhZyA9IHRhZztcblx0XHRcdFx0c3RhdGUuYXJ0aWNsZXNCeVRhZy5saXN0ID0gcmVzcG9uc2UuYXJ0aWNsZXM7XG5cdFx0XHR9KTtcblx0fSxcblxuXG5cdHNldFNlbGVjdGVkQXJ0aWNsZTogZnVuY3Rpb24gKHNsdWcpIHtcblx0XHRzdGF0ZS5zZWxlY3RlZEFydGljbGUuZGF0YSA9IG51bGw7XG5cdFx0c3RhdGUuc2VsZWN0ZWRBcnRpY2xlLmlzTG9hZGluZyA9IHRydWU7XG5cblx0XHRyZXR1cm4gbS5yZXF1ZXN0KHtcblx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0XHR1cmw6IEFQSV9CQVNFX1VSSSArICcvYXJ0aWNsZXMvJyArIHNsdWdcblx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cdFx0XHRcdHN0YXRlLnNlbGVjdGVkQXJ0aWNsZS5kYXRhID0gcmVzcG9uc2UuYXJ0aWNsZTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHN0YXRlLnNlbGVjdGVkQXJ0aWNsZS5pc0xvYWRpbmcgPSBmYWxzZTtcblx0XHRcdH0pO1xuXHR9LFxuXG5cblx0c2V0U2VsZWN0ZWRBcnRpY2xlQ29tbWVudHM6IGZ1bmN0aW9uIChzbHVnKSB7XG5cdFx0c3RhdGUuc2VsZWN0ZWRBcnRpY2xlQ29tbWVudHMuZGF0YSA9IG51bGw7XG5cdFx0c3RhdGUuc2VsZWN0ZWRBcnRpY2xlQ29tbWVudHMuaXNMb2FkaW5nID0gdHJ1ZTtcblxuXHRcdHJldHVybiBtLnJlcXVlc3Qoe1xuXHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdHVybDogQVBJX0JBU0VfVVJJICsgJy9hcnRpY2xlcy8nICsgc2x1ZyArICcvY29tbWVudHMnXG5cdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHRcdFx0XHRzdGF0ZS5zZWxlY3RlZEFydGljbGVDb21tZW50cy5kYXRhID0gcmVzcG9uc2UuY29tbWVudHM7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRzdGF0ZS5zZWxlY3RlZEFydGljbGVDb21tZW50cy5pc0xvYWRpbmcgPSB0cnVlO1xuXHRcdFx0fSk7XG5cdH0sXG5cblxuXHRjcmVhdGVBcnRpY2xlOiBmdW5jdGlvbiAocGF5bG9hZCkge1xuXHRcdHN0YXRlLmlzQ3JlYXRlQXJ0aWNsZUJ1c3kgPSB0cnVlO1xuXHRcdHN0YXRlLmNyZWF0ZUFydGljbGVFcnJvcnMgPSBudWxsO1xuXG5cdFx0Ly8gRm9ybWF0IHRhZ0xpc3QgYmVmb3JlIHNlbmRpbmcgdG8gQVBJXG5cdFx0dmFyIHRhZ0xpc3QgPSBwYXlsb2FkLnRhZ0xpc3Rcblx0XHRcdC5zcGxpdCgnLCcpXG5cdFx0XHQuam9pbignLXwtJylcblx0XHRcdC5zcGxpdCgnICcpXG5cdFx0XHQuam9pbignLXwtJylcblx0XHRcdC5zcGxpdCgnLXwtJylcblx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKHRhZykge1xuXHRcdFx0XHRyZXR1cm4gdGFnICE9PSAnJztcblx0XHRcdH0pO1xuXG5cdFx0bS5yZXF1ZXN0KHtcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0dXJsOiBBUElfQkFTRV9VUkkgKyAnL2FydGljbGVzJyxcblx0XHRcdGhlYWRlcnM6IHtcblx0XHRcdFx0J0F1dGhvcml6YXRpb24nOiAnVG9rZW4gJyArIHN0YXRlLnVzZXIudG9rZW5cblx0XHRcdH0sXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdGFydGljbGU6IHtcblx0XHRcdFx0XHR0aXRsZTogcGF5bG9hZC50aXRsZSxcblx0XHRcdFx0XHRkZXNjcmlwdGlvbjogcGF5bG9hZC5kZXNjcmlwdGlvbixcblx0XHRcdFx0XHRib2R5OiBwYXlsb2FkLmJvZHksXG5cdFx0XHRcdFx0dGFnTGlzdDogdGFnTGlzdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHRcdFx0XHRzdGF0ZS5jcmVhdGVBcnRpY2xlRXJyb3JzID0gbnVsbDtcblx0XHRcdFx0c3RhdGUubmV3QXJ0aWNsZSA9IHJlc3BvbnNlLmFydGljbGU7XG5cdFx0XHRcdG0ucm91dGUuc2V0KCcvYXJ0aWNsZS8nICsgc3RhdGUubmV3QXJ0aWNsZS5zbHVnKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0c3RhdGUuY3JlYXRlQXJ0aWNsZUVycm9ycyA9IGdldEVycm9yTWVzc2FnZUZyb21BUElFcnJvck9iamVjdChlKTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHN0YXRlLmlzQ3JlYXRlQXJ0aWNsZUJ1c3kgPSBmYWxzZTtcblx0XHRcdH0pO1xuXHR9LFxuXG5cblx0ZGVsZXRlQXJ0aWNsZTogZnVuY3Rpb24gKHNsdWcpIHtcblx0XHRzdGF0ZS5pc0RlbGV0ZUFydGljbGVCdXN5ID0gdHJ1ZTtcblx0XHRtLnJlZHJhdygpOyAvLyBUaGlzIHNob3VsZG4ndCBiZSBuZWNlc3NhcnlcblxuXHRcdG0ucmVxdWVzdCh7XG5cdFx0XHRtZXRob2Q6ICdERUxFVEUnLFxuXHRcdFx0dXJsOiBBUElfQkFTRV9VUkkgKyAnL2FydGljbGVzLycgKyBzbHVnLFxuXHRcdFx0aGVhZGVyczoge1xuXHRcdFx0XHQnQXV0aG9yaXphdGlvbic6ICdUb2tlbiAnICsgc3RhdGUudXNlci50b2tlblxuXHRcdFx0fVxuXHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblx0XHRcdFx0Y29uc29sZS5pbmZvKHJlc3BvbnNlKTtcblx0XHRcdFx0c3RhdGUuaXNEZWxldGVBcnRpY2xlQnVzeSA9IGZhbHNlO1xuXHRcdFx0XHQvLyBpZiAocmVzcG9uc2UpIHtcblx0XHRcdFx0cmVkaXJlY3RUb1ByZXZpb3VzUGFnZU9ySG9tZSgpO1xuXHRcdFx0XHQvLyB9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdHN0YXRlLmlzRGVsZXRlQXJ0aWNsZUJ1c3kgPSBmYWxzZTtcblx0XHRcdFx0Y29uc29sZS53YXJuKGdldEVycm9yTWVzc2FnZUZyb21BUElFcnJvck9iamVjdChlKSk7XG5cdFx0XHR9KTtcblx0fSxcblxuXG5cdGNyZWF0ZUFydGljbGVDb21tZW50OiBmdW5jdGlvbiAocGF5bG9hZCkge1xuXHRcdHN0YXRlLmlzQXJ0aWNsZUNvbW1lbnRDcmVhdGlvbkJ1c3kgPSB0cnVlO1xuXG5cdFx0bS5yZXF1ZXN0KHtcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0dXJsOiBBUElfQkFTRV9VUkkgKyAnL2FydGljbGVzLycgKyBwYXlsb2FkLmFydGljbGVTbHVnICsgJy9jb21tZW50cycsXG5cdFx0XHRoZWFkZXJzOiB7XG5cdFx0XHRcdCdBdXRob3JpemF0aW9uJzogJ1Rva2VuICcgKyBzdGF0ZS51c2VyLnRva2VuXG5cdFx0XHR9LFxuXHRcdFx0ZGF0YToge1xuXHRcdFx0XHRjb21tZW50OiB7XG5cdFx0XHRcdFx0Ym9keTogcGF5bG9hZC5ib2R5XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRzdGF0ZS5pc0FydGljbGVDb21tZW50Q3JlYXRpb25CdXN5ID0gZmFsc2U7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRhY3Rpb25zLnNldFNlbGVjdGVkQXJ0aWNsZUNvbW1lbnRzKHBheWxvYWQuYXJ0aWNsZVNsdWcpO1xuXHRcdFx0fSk7XG5cdH0sXG5cblxuXHRnb1RvQXJ0aWNsZUVkaXRTY3JlZW46IGZ1bmN0aW9uIChhcnRpY2xlU2x1Zykge1xuXHRcdG0ucm91dGUuc2V0KCcvZWRpdG9yLycgKyBhcnRpY2xlU2x1Zyk7XG5cdH0sXG5cblxuXHRyZWdpc3Rlck5ld1VzZXI6IGZ1bmN0aW9uIChwYXlsb2FkKSB7XG5cdFx0c3RhdGUuaXNVc2VyUmVnaXN0cmF0aW9uQnVzeSA9IHRydWU7XG5cdFx0c3RhdGUudXNlclJlZ2lzdHJhdGlvbkVycm9ycyA9IG51bGw7XG5cblx0XHRtLnJlcXVlc3Qoe1xuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHR1cmw6IEFQSV9CQVNFX1VSSSArICcvdXNlcnMnLFxuXHRcdFx0ZGF0YToge1xuXHRcdFx0XHR1c2VyOiB7XG5cdFx0XHRcdFx0ZW1haWw6IHBheWxvYWQuZW1haWwsXG5cdFx0XHRcdFx0cGFzc3dvcmQ6IHBheWxvYWQucGFzc3dvcmQsXG5cdFx0XHRcdFx0dXNlcm5hbWU6IHBheWxvYWQudXNlcm5hbWVcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblx0XHRcdFx0c3RhdGUudXNlclJlZ2lzdHJhdGlvbkVycm9ycyA9IG51bGw7XG5cdFx0XHRcdHN0YXRlLnVzZXIgPSByZXNwb25zZS51c2VyO1xuXHRcdFx0XHR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2p3dCcsIHN0YXRlLnVzZXIudG9rZW4pO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRzdGF0ZS51c2VyUmVnaXN0cmF0aW9uRXJyb3JzID0gZ2V0RXJyb3JNZXNzYWdlRnJvbUFQSUVycm9yT2JqZWN0KGUpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0c3RhdGUuaXNVc2VyUmVnaXN0cmF0aW9uQnVzeSA9IGZhbHNlO1xuXHRcdFx0fSk7XG5cdH0sXG5cblxuXHRhdHRlbXB0VXNlckxvZ2luOiBmdW5jdGlvbiAoZW1haWwsIHBhc3N3b3JkKSB7XG5cdFx0d2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdqd3QnLCBudWxsKTtcblx0XHRzdGF0ZS51c2VyID0gbnVsbDtcblx0XHRzdGF0ZS5pc1VzZXJMb2dpbkJ1c3kgPSB0cnVlO1xuXHRcdHN0YXRlLnVzZXJMb2dpbkVycm9ycyA9IG51bGw7XG5cblx0XHRtLnJlcXVlc3Qoe1xuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHR1cmw6IEFQSV9CQVNFX1VSSSArICcvdXNlcnMvbG9naW4nLFxuXHRcdFx0ZGF0YToge1xuXHRcdFx0XHR1c2VyOiB7XG5cdFx0XHRcdFx0ZW1haWw6IGVtYWlsLFxuXHRcdFx0XHRcdHBhc3N3b3JkOiBwYXNzd29yZFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHRcdFx0XHRzdGF0ZS51c2VyTG9naW5FcnJvcnMgPSBudWxsO1xuXHRcdFx0XHRzdGF0ZS51c2VyID0gcmVzcG9uc2UudXNlcjtcblx0XHRcdFx0d2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdqd3QnLCBzdGF0ZS51c2VyLnRva2VuKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0c3RhdGUudXNlckxvZ2luRXJyb3JzID0gZ2V0RXJyb3JNZXNzYWdlRnJvbUFQSUVycm9yT2JqZWN0KGUpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0c3RhdGUuaXNVc2VyTG9naW5CdXN5ID0gZmFsc2U7XG5cdFx0XHR9KTtcblx0fSxcblxuXG5cdHJlZGlyZWN0QWZ0ZXJVc2VyTG9naW5TdWNjZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmVkaXJlY3RUb1ByZXZpb3VzUGFnZU9ySG9tZSgpO1xuXHR9LFxuXG5cblx0cmVkaXJlY3RBZnRlclVzZXJSZWdpc3RyYXRpb25TdWNjZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmVkaXJlY3RUb1ByZXZpb3VzUGFnZU9ySG9tZSgpO1xuXHR9LFxuXG5cblx0Z2V0TG9nZ2VkSW5Vc2VyOiBmdW5jdGlvbiAodG9rZW4pIHtcblx0XHR2YXIgdXNlclRva2VuID0gc3RhdGUudXNlciA/IHN0YXRlLnVzZXIudG9rZW4gOiAnJztcblxuXHRcdGlmICh0b2tlbikge1xuXHRcdFx0dXNlclRva2VuID0gdG9rZW47XG5cdFx0fVxuXG5cdFx0bS5yZXF1ZXN0KHtcblx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0XHR1cmw6IEFQSV9CQVNFX1VSSSArICcvdXNlcicsXG5cdFx0XHRoZWFkZXJzOiB7XG5cdFx0XHRcdCdBdXRob3JpemF0aW9uJzogJ1Rva2VuICcgKyB1c2VyVG9rZW5cblx0XHRcdH1cblx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cdFx0XHRcdHN0YXRlLnVzZXIgPSByZXNwb25zZS51c2VyO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oJ2RvbWFpbi5nZXRMb2dnZWRJblVzZXIoKScsIGUsIGdldEVycm9yTWVzc2FnZUZyb21BUElFcnJvck9iamVjdChlKSk7XG5cdFx0XHR9KTtcblx0fSxcblxuXG5cdHVwZGF0ZVVzZXJTZXR0aW5nczogZnVuY3Rpb24gKHBheWxvYWQpIHtcblx0XHRzdGF0ZS5pc1VzZXJTZXR0aW5nc1VwZGF0ZUJ1c3kgPSB0cnVlO1xuXHRcdHN0YXRlLnVzZXJVcGRhdGVTZXR0aW5nc0Vycm9ycyA9IG51bGw7XG5cblx0XHRpZiAoIXBheWxvYWQucGFzc3dvcmQpIHtcblx0XHRcdGRlbGV0ZSBwYXlsb2FkLnBhc3N3b3JkO1xuXHRcdH1cblxuXHRcdG0ucmVxdWVzdCh7XG5cdFx0XHRtZXRob2Q6ICdQVVQnLFxuXHRcdFx0dXJsOiBBUElfQkFTRV9VUkkgKyAnL3VzZXInLFxuXHRcdFx0aGVhZGVyczoge1xuXHRcdFx0XHQnQXV0aG9yaXphdGlvbic6ICdUb2tlbiAnICsgc3RhdGUudXNlci50b2tlblxuXHRcdFx0fSxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0dXNlcjogcGF5bG9hZFxuXHRcdFx0fVxuXHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblx0XHRcdFx0c3RhdGUudXNlciA9IHJlc3BvbnNlLnVzZXI7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdHN0YXRlLnVzZXJVcGRhdGVTZXR0aW5nc0Vycm9ycyA9IGdldEVycm9yTWVzc2FnZUZyb21BUElFcnJvck9iamVjdChlKTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHN0YXRlLmlzVXNlclNldHRpbmdzVXBkYXRlQnVzeSA9IGZhbHNlO1xuXHRcdFx0fSk7XG5cdH0sXG5cblxuXHRnZXRVc2VyUHJvZmlsZTogZnVuY3Rpb24gKHVzZXJuYW1lKSB7XG5cdFx0c3RhdGUuc2VsZWN0ZWRVc2VyUHJvZmlsZS5pc0xvYWRpbmcgPSB0cnVlO1xuXHRcdHN0YXRlLnNlbGVjdGVkVXNlclByb2ZpbGUuZGF0YSA9IG51bGw7XG5cblx0XHRtLnJlcXVlc3Qoe1xuXHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdHVybDogQVBJX0JBU0VfVVJJICsgJy9wcm9maWxlcy8nICsgdXNlcm5hbWVcblx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cdFx0XHRcdHN0YXRlLnNlbGVjdGVkVXNlclByb2ZpbGUuZGF0YSA9IHJlc3BvbnNlLnByb2ZpbGU7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRzdGF0ZS5zZWxlY3RlZFVzZXJQcm9maWxlLmlzTG9hZGluZyA9IGZhbHNlO1xuXHRcdFx0fSk7XG5cdH0sXG5cblxuXHRmb2xsb3dVc2VyOiBmdW5jdGlvbiAodXNlcm5hbWUpIHtcblx0XHRyZXR1cm4gYWxlcnQoJ2ZvbGxvd1VzZXIoKSAtPiAnICsgIHVzZXJuYW1lKTtcblx0XHRtLnJlcXVlc3Qoe1xuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHR1cmw6IEFQSV9CQVNFX1VSSSArICcvcHJvZmlsZXMvJyArIHVzZXJuYW1lICsgJy9mb2xsb3cnLFxuXHRcdFx0aGVhZGVyczoge1xuXHRcdFx0XHQnQXV0aG9yaXphdGlvbic6ICdUb2tlbiAnICsgc3RhdGUudXNlci50b2tlblxuXHRcdFx0fSxcblx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQvLyBUT0RPXG5cdFx0XHR9KTtcblx0fSxcblxuXG5cdHVuZm9sbG93VXNlcjogZnVuY3Rpb24gKHVzZXJuYW1lKSB7XG5cdFx0cmV0dXJuIGFsZXJ0KCd1bmZvbGxvd1VzZXIoKSAtPiAnICsgIHVzZXJuYW1lKTtcblx0XHRtLnJlcXVlc3Qoe1xuXHRcdFx0bWV0aG9kOiAnREVMRVRFJyxcblx0XHRcdHVybDogQVBJX0JBU0VfVVJJICsgJy9wcm9maWxlcy8nICsgdXNlcm5hbWUgKyAnL2ZvbGxvdycsXG5cdFx0XHRoZWFkZXJzOiB7XG5cdFx0XHRcdCdBdXRob3JpemF0aW9uJzogJ1Rva2VuICcgKyBzdGF0ZS51c2VyLnRva2VuXG5cdFx0XHR9LFxuXHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8vIFRPRE9cblx0XHRcdH0pO1xuXHR9LFxuXG5cblx0bG9nVXNlck91dDogZnVuY3Rpb24gKCkge1xuXHRcdHN0YXRlLnVzZXIgPSBudWxsO1xuXHRcdHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnand0JywgbnVsbCk7XG5cdFx0bS5yb3V0ZS5zZXQoJy8nKTtcblx0fSxcblxuXG5cdGdldFRhZ3M6IGZ1bmN0aW9uICgpIHtcblx0XHRzdGF0ZS50YWdzLmlzTG9hZGluZyA9IHRydWU7XG5cblx0XHRtLnJlcXVlc3Qoe1xuXHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdHVybDogQVBJX0JBU0VfVVJJICsgJy90YWdzJyxcblx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cdFx0XHRcdHN0YXRlLnRhZ3MubGlzdCA9IHJlc3BvbnNlLnRhZ3M7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRzdGF0ZS50YWdzLmlzTG9hZGluZyA9IGZhbHNlO1xuXHRcdFx0fSk7XG5cdH1cblxufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0aW5pdDogaW5pdCxcblx0c3RvcmU6IHN0YXRlLFxuXHRhY3Rpb25zOiBhY3Rpb25zXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnJlcXVpcmUoJy4vZG9tYWluJykuaW5pdCgpO1xucmVxdWlyZSgnLi91aS9yb3V0ZXInKS5pbml0KCk7XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxuZnVuY3Rpb24gdmlldygpIHtcblx0cmV0dXJuIG0oJ2Zvb3RlcicsXG5cdFx0bSgnLmNvbnRhaW5lcicsIFtcblx0XHRcdG0oJ2EubG9nby1mb250JywgeyBocmVmOiAnLycgfSwgJ2NvbmR1aXQnKSxcblx0XHRcdG0oJ3NwYW4uYXR0cmlidXRpb24nLFxuXHRcdFx0XHRtLnRydXN0KCdBbiBpbnRlcmFjdGl2ZSBsZWFybmluZyBwcm9qZWN0IGZyb20gPGEgaHJlZj1cImh0dHBzOi8vdGhpbmtzdGVyLmlvXCI+VGhpbmtzdGVyPC9hPi4gQ29kZSAmYW1wOyBkZXNpZ24gbGljZW5zZWQgdW5kZXIgTUlULicpXG5cdFx0XHQpXG5cdFx0XSlcblx0KTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIGRvbWFpbiA9IHJlcXVpcmUoJy4vLi4vLi4vZG9tYWluJyk7XG52YXIgTWFpbk5hdiA9IHJlcXVpcmUoJy4vTWFpbk5hdicpO1xudmFyIExpbmsgPSByZXF1aXJlKCcuL0xpbmsnKTtcblxuXG5mdW5jdGlvbiB2aWV3KCkge1xuXHRyZXR1cm4gbSgnaGVhZGVyJyxcblx0XHRtKCduYXYubmF2YmFyLm5hdmJhci1saWdodCcsXG5cdFx0XHRtKCcuY29udGFpbmVyJyxcblx0XHRcdFx0bShMaW5rLCB7IGNsYXNzTmFtZTogJ25hdmJhci1icmFuZCBwdWxsLXhzLW5vbmUgcHVsbC1tZC1sZWZ0JywgdG86ICcvJyB9LCAnY29uZHVpdCcpLFxuXHRcdFx0XHRtKE1haW5OYXYsIHsgY2xhc3NOYW1lOiAnbmF2IG5hdmJhci1uYXYgcHVsbC14cy1ub25lIHB1bGwtbWQtcmlnaHQgdGV4dC14cy1jZW50ZXInLCBjdXJyZW50VXNlcjogZG9tYWluLnN0b3JlLnVzZXIgfSlcblx0XHRcdClcblx0XHQpXG5cdCk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHR2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBkb21haW4gPSByZXF1aXJlKCcuLy4uLy4uL2RvbWFpbicpO1xudmFyIEFydGljbGVGYXZvcml0ZUJ1dHRvbiA9IHJlcXVpcmUoJy4vQXJ0aWNsZUZhdm9yaXRlQnV0dG9uJyk7XG52YXIgQXJ0aWNsZVVwZGF0ZUJ1dHRvbiA9IHJlcXVpcmUoJy4vQXJ0aWNsZVVwZGF0ZUJ1dHRvbicpO1xudmFyIEFydGljbGVEZWxldGVCdXR0b24gPSByZXF1aXJlKCcuL0FydGljbGVEZWxldGVCdXR0b24nKTtcbnZhciBVc2VyRm9sbG93VW5mb2xsb3dCdXR0b24gPSByZXF1aXJlKCcuL1VzZXJGb2xsb3dVbmZvbGxvd0J1dHRvbicpO1xuXG5cbmZ1bmN0aW9uIHVwZGF0ZVN0YXRlKHZub2RlKSB7XG5cdHZub2RlLnN0YXRlID0ge1xuXHRcdGFydGljbGU6IHZub2RlLmF0dHJzLmFydGljbGUuZGF0YSxcblx0XHRpc0RlbGV0ZUFydGljbGVCdXN5OiBkb21haW4uc3RvcmUuaXNEZWxldGVBcnRpY2xlQnVzeVxuXHR9O1xufVxuXG5cbmZ1bmN0aW9uIG9uaW5pdCh2bm9kZSkge1xuXHR1cGRhdGVTdGF0ZSh2bm9kZSk7XG59XG5cblxuZnVuY3Rpb24gb251cGRhdGUodm5vZGUpIHtcblx0dXBkYXRlU3RhdGUodm5vZGUpO1xufVxuXG5cbmZ1bmN0aW9uIHZpZXcodm5vZGUpIHtcblx0dmFyIGFydGljbGUgPSB2bm9kZS5hdHRycy5hcnRpY2xlLmRhdGEgPyB2bm9kZS5hdHRycy5hcnRpY2xlLmRhdGEgOiB7XG5cdFx0YXV0aG9yOiB7XG5cdFx0XHR1c2VybmFtZTogbnVsbFxuXHRcdH1cblx0fTtcblxuXHR2YXIgbG9nZ2VkSW5Vc2VybmFtZSA9IGRvbWFpbi5zdG9yZS51c2VyID8gZG9tYWluLnN0b3JlLnVzZXIudXNlcm5hbWUgOiAnJztcblxuXHRyZXR1cm4gW1xuXHRcdG0oQXJ0aWNsZVVwZGF0ZUJ1dHRvbiwgeyBhY3Rpb246IGRvbWFpbi5hY3Rpb25zLmdvVG9BcnRpY2xlRWRpdFNjcmVlbi5iaW5kKG51bGwsIGFydGljbGUuc2x1ZykgfSksXG5cdFx0bSgnc3BhbicsICcgJyksXG5cdFx0bShBcnRpY2xlRGVsZXRlQnV0dG9uLCB7IGFjdGlvbjogZG9tYWluLmFjdGlvbnMuZGVsZXRlQXJ0aWNsZS5iaW5kKG51bGwsIGFydGljbGUuc2x1ZykgfSksXG5cdFx0bSgnc3BhbicsICcgJyksXG5cdFx0bShVc2VyRm9sbG93VW5mb2xsb3dCdXR0b24sIHsgaXNGb2xsb3dpbmc6IGFydGljbGUuYXV0aG9yLmZvbGxvd2luZywgdXNlcm5hbWU6IGFydGljbGUuYXV0aG9yLnVzZXJuYW1lLCBsb2dnZWRJblVzZXJuYW1lOiBsb2dnZWRJblVzZXJuYW1lIH0pLFxuXHRcdG0oJ3NwYW4nLCAnICcpLFxuXHRcdG0oQXJ0aWNsZUZhdm9yaXRlQnV0dG9uLCB7IGFydGljbGU6IGFydGljbGUgfSlcblx0XTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdG9uaW5pdDogb25pbml0LFxuXHRvbnVwZGF0ZTogb251cGRhdGUsXG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIEFydGljbGVNZXRhQW5kQWN0aW9ucyA9IHJlcXVpcmUoJy4vQXJ0aWNsZU1ldGFBbmRBY3Rpb25zJyk7XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuXHR2YXIgdGl0bGUgPSB2bm9kZS5hdHRycy5hcnRpY2xlLmRhdGEgPyB2bm9kZS5hdHRycy5hcnRpY2xlLmRhdGEudGl0bGUgOiAnLi4uJztcblxuXHRyZXR1cm4gbSgnZGl2JywgW1xuXHRcdG0oJ2gxJywgdGl0bGUpLFxuXHRcdG0oQXJ0aWNsZU1ldGFBbmRBY3Rpb25zLCB7IGFydGljbGU6IHZub2RlLmF0dHJzLmFydGljbGUgfSlcblx0XSk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHR2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBUYWdMaXN0ID0gcmVxdWlyZSgnLi9UYWdMaXN0Jyk7XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuXHR2YXIgYXJ0aWNsZSA9IHZub2RlLmF0dHJzLmFydGljbGUuZGF0YTtcblx0dmFyIGNvbnRlbnQgPSBtKCdkaXYnLCAnLi4uJyk7XG5cblx0aWYgKGFydGljbGUpIHtcblx0XHRjb250ZW50ID0gW1xuXHRcdFx0bSgnZGl2LmNvbC14cy0xMicsIFtcblx0XHRcdFx0bSgnZGl2JywgbS50cnVzdCh1dGlscy5jb252ZXJ0TWFya2Rvd25Ub0hUTUwoYXJ0aWNsZS5ib2R5KSkpLFxuXHRcdFx0XHRtKFRhZ0xpc3QsIHsgbGlzdDogYXJ0aWNsZS50YWdMaXN0LCBzdHlsZTogVGFnTGlzdC5zdHlsZXMuT1VUTElORSB9KVxuXHRcdFx0XSlcblx0XHRdO1xuXHR9XG5cblx0cmV0dXJuIG0oJ2Rpdi5hcnRpY2xlLWNvbnRlbnQnLCBjb250ZW50KTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuXHRyZXR1cm4gW1xuXHRcdG0oJ3NwYW4nLFxuXHRcdFx0bSgnYnV0dG9uLmJ0bi5idG4tb3V0bGluZS1kYW5nZXIuYnRuLXNtJywgeyBvbmNsaWNrOiB2bm9kZS5hdHRycy5hY3Rpb24gfSwgW1xuXHRcdFx0XHRtKCdpLmlvbi10cmFzaC1hJyksIG0oJ3NwYW4nLCAnIERlbGV0ZSBBcnRpY2xlJylcblx0XHRcdF0pXG5cdFx0KVxuXHRdO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0dmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG5mdW5jdGlvbiBvbkZhdm9yaXRlQnV0dG9uQ2xpY2soZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuXHR2YXIgY291bnQgPSB0eXBlb2Ygdm5vZGUuYXR0cnMuYXJ0aWNsZS5mYXZvcml0ZXNDb3VudCA9PT0gJ251bWJlcicgPyB2bm9kZS5hdHRycy5hcnRpY2xlLmZhdm9yaXRlc0NvdW50IDogJy4uLic7XG5cblx0cmV0dXJuIFtcblx0XHRtKCdzcGFuJyxcblx0XHRcdG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1vdXRsaW5lLXByaW1hcnknLCB7IG9uY2xpY2s6IG9uRmF2b3JpdGVCdXR0b25DbGljay5iaW5kKHRoaXMpIH0sIFtcblx0XHRcdFx0bSgnaS5pb24taGVhcnQnKSwgbSgnc3BhbicsICcgRmF2b3JpdGUgQXJ0aWNsZSAoJyArIGNvdW50ICsgJyknKVxuXHRcdFx0XSlcblx0XHQpXG5cdF07XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHR2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBkb21haW4gPSByZXF1aXJlKCcuLy4uLy4uL2RvbWFpbicpO1xudmFyIEFydGljbGVQcmV2aWV3ID0gcmVxdWlyZSgnLi9BcnRpY2xlUHJldmlldycpO1xudmFyIFBhZ2luYXRpb24gPSByZXF1aXJlKCcuL1BhZ2luYXRpb24nKTtcblxuXG5mdW5jdGlvbiBnZXRUb3RhbFBhZ2VzKGxpbWl0LCB0b3RhbCkge1xuXHRyZXR1cm4gTWF0aC5jZWlsKHRvdGFsIC8gKGxpbWl0IHx8IHRvdGFsKSk7XG59XG5cblxuZnVuY3Rpb24gZ2V0Q3VycmVudFBhZ2UobGltaXQsIG9mZnNldCkge1xuXHRyZXR1cm4gTWF0aC5jZWlsKChvZmZzZXQgKyAxKSAvIGxpbWl0KTtcbn1cblxuXG5mdW5jdGlvbiBnZXRPZmZzZXRGcm9tUGFnZU51bWJlcihwYWdlTnVtYmVyLCBsaW1pdCkge1xuXHRyZXR1cm4gTWF0aC5jZWlsKChwYWdlTnVtYmVyIC0gMSkgKiBsaW1pdCk7XG59XG5cblxuZnVuY3Rpb24gZ2V0Q3VycmVudExpbWl0RnJvbUFydGljbGVzKGFydGljbGVzKSB7XG5cdHJldHVybiBhcnRpY2xlcy5saW1pdCB8fCAwO1xufVxuXG5cbmZ1bmN0aW9uIHVwZGF0ZVNlbGVjdGVkQXJ0aWNsZXMoKSB7XG5cdC8vIGRvbWFpbi5hY3Rpb25zLnNldEN1cnJlbnRseUFjdGl2ZUFydGljbGVzKHtcblx0XHQvLyBsaW1pdDogbGltaXQsXG5cdFx0Ly8gb2Zmc2V0OiBvZmZzZXQsXG5cdFx0Ly8gYXV0aG9yOiBhdXRob3Jcblx0Ly8gfSk7XG59XG5cblxuZnVuY3Rpb24gc2VsZWN0UGFnZShwYWdlTnVtYmVyKSB7XG5cdHZhciBsaW1pdCA9IGdldEN1cnJlbnRMaW1pdEZyb21BcnRpY2xlcyhkb21haW4uc3RvcmUuc2VsZWN0ZWRBcnRpY2xlcyk7XG5cdHVwZGF0ZVNlbGVjdGVkQXJ0aWNsZXMobGltaXQsIGdldE9mZnNldEZyb21QYWdlTnVtYmVyKHBhZ2VOdW1iZXIsIGxpbWl0KSwgdGhpcy5hdXRob3IpO1xufVxuXG5cbmZ1bmN0aW9uIHVwZGF0ZVN0YXRlRnJvbUF0dHJpYnV0ZXMoc3RhdGUsIGF0dHJzKSB7XG5cdHN0YXRlLmxpbWl0ID0gYXR0cnMubGltaXQgfHwgMTA7XG5cdHN0YXRlLm9mZnNldCA9IGF0dHJzLm9mZnNldCB8fCAwO1xuXHRzdGF0ZS5hdXRob3IgPSBhdHRycy5hdXRob3IgfHwgJyc7XG5cblx0cmV0dXJuIHN0YXRlO1xufVxuXG5cbmZ1bmN0aW9uIG9uaW5pdCh2bm9kZSkge1xuXHR1cGRhdGVTdGF0ZUZyb21BdHRyaWJ1dGVzKHRoaXMsIHZub2RlLmF0dHJzKTtcblx0dXBkYXRlU2VsZWN0ZWRBcnRpY2xlcyh0aGlzLmxpbWl0LCB0aGlzLm9mZnNldCwgdGhpcy5hdXRob3IpO1xufVxuXG5cbmZ1bmN0aW9uIG9uYmVmb3JldXBkYXRlKHZub2RlLCB2bm9kZVByZXZpb3VzKSB7XG5cdGlmIChKU09OLnN0cmluZ2lmeSh2bm9kZS5hdHRycykgIT09IEpTT04uc3RyaW5naWZ5KHZub2RlUHJldmlvdXMuYXR0cnMpKSB7XG5cdFx0dXBkYXRlU3RhdGVGcm9tQXR0cmlidXRlcyh0aGlzLCB2bm9kZS5hdHRycyk7XG5cdFx0dXBkYXRlU2VsZWN0ZWRBcnRpY2xlcyh0aGlzLmxpbWl0LCB0aGlzLm9mZnNldCwgdGhpcy5hdXRob3IpO1xuXHR9XG59XG5cblxuZnVuY3Rpb24gdmlldygpIHtcblx0dmFyIHRvdGFsUGFnZXMgPSAxLFxuXHRcdGN1cnJlbnRQYWdlID0gMTtcblxuXHRpZiAoZG9tYWluLnN0b3JlLnNlbGVjdGVkQXJ0aWNsZXMuaXNMb2FkaW5nKSB7XG5cdFx0cmV0dXJuIG0oJ2Rpdi5hcnRpY2xlLXByZXZpZXcnLCAnTG9hZGluZy4uLicpO1xuXHR9XG5cblx0aWYgKGRvbWFpbi5zdG9yZS5zZWxlY3RlZEFydGljbGVzLmxpc3QubGVuZ3RoID09PSAwKSB7XG5cdFx0cmV0dXJuIG0oJ2Rpdi5hcnRpY2xlLXByZXZpZXcnLCAnTm8gYXJ0aWNsZXMgYXJlIGhlcmUuLi4geWV0LicpO1xuXHR9XG5cblx0dG90YWxQYWdlcyA9IGdldFRvdGFsUGFnZXMoZG9tYWluLnN0b3JlLnNlbGVjdGVkQXJ0aWNsZXMubGltaXQsIGRvbWFpbi5zdG9yZS5zZWxlY3RlZEFydGljbGVzLnRvdGFsKTtcblx0Y3VycmVudFBhZ2UgPSBnZXRDdXJyZW50UGFnZShkb21haW4uc3RvcmUuc2VsZWN0ZWRBcnRpY2xlcy5saW1pdCwgZG9tYWluLnN0b3JlLnNlbGVjdGVkQXJ0aWNsZXMub2Zmc2V0KTtcblxuXHRyZXR1cm4gbSgnZGl2JywgW1xuXHRcdGRvbWFpbi5zdG9yZS5zZWxlY3RlZEFydGljbGVzLmxpc3QubWFwKGZ1bmN0aW9uIChhcnRpY2xlKSB7XG5cdFx0XHRyZXR1cm4gbShBcnRpY2xlUHJldmlldywgeyBrZXk6IGFydGljbGUuc2x1ZywgYXJ0aWNsZTogYXJ0aWNsZSB9KTtcblx0XHR9KSxcblx0XHRtKFBhZ2luYXRpb24sIHsgdG90YWxQYWdlczogdG90YWxQYWdlcywgY3VycmVudFBhZ2U6IGN1cnJlbnRQYWdlLCBmbl9vbkl0ZW1DbGljazogc2VsZWN0UGFnZS5iaW5kKHRoaXMpIH0pXG5cdF0pO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0b25pbml0OiBvbmluaXQsXG5cdG9uYmVmb3JldXBkYXRlOiBvbmJlZm9yZXVwZGF0ZSxcblx0dmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgTGluayA9IHJlcXVpcmUoJy4vTGluaycpO1xuXG5cbmZ1bmN0aW9uIHZpZXcodm5vZGUpIHtcblx0dmFyIGFydGljbGUgPSB2bm9kZS5hdHRycy5hcnRpY2xlID8gdm5vZGUuYXR0cnMuYXJ0aWNsZS5kYXRhIDogbnVsbDtcblx0dmFyIGNvbnRlbnQgPSBtKCdkaXYnLCAnLi4uJyk7XG5cblx0aWYgKGFydGljbGUpIHtcblx0XHRjb250ZW50ID0gW1xuXHRcdFx0bShMaW5rLCB7IHRvOiAnL0AnICsgYXJ0aWNsZS5hdXRob3IudXNlcm5hbWUgfSxcblx0XHRcdFx0bSgnaW1nJywgeyBzcmM6IGFydGljbGUuYXV0aG9yLmltYWdlIH0pXG5cdFx0XHQpLFxuXHRcdFx0bSgnZGl2LmluZm8nLFxuXHRcdFx0XHRtKExpbmssIHsgY2xhc3NOYW1lOiAnYXV0aG9yJywgdG86ICcvQCcgKyBhcnRpY2xlLmF1dGhvci51c2VybmFtZSB9LCBhcnRpY2xlLmF1dGhvci51c2VybmFtZSksXG5cdFx0XHRcdG0oJ3NwYW4uZGF0ZScsIHV0aWxzLmZvcm1hdERhdGUoYXJ0aWNsZS5jcmVhdGVkQXQpKVxuXHRcdFx0KVxuXHRcdF07XG5cdH1cblxuXHRyZXR1cm4gbSgnZGl2LmFydGljbGUtbWV0YScsIHsgc3R5bGU6IHZub2RlLmF0dHJzLnN0eWxlIH0sIFtcblx0XHRjb250ZW50XG5cdF0pO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0dmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgQXJ0aWNsZU1ldGEgPSByZXF1aXJlKCcuL0FydGljbGVNZXRhJyk7XG52YXIgQXJ0aWNsZUFjdGlvbnMgPSByZXF1aXJlKCcuL0FydGljbGVBY3Rpb25zJyk7XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuXHRyZXR1cm4gW1xuXHRcdG0oQXJ0aWNsZU1ldGEsIHsgYXJ0aWNsZTogdm5vZGUuYXR0cnMuYXJ0aWNsZSwgc3R5bGU6ICdkaXNwbGF5OmlubGluZS1ibG9jazsgJyB9KSxcblx0XHRtKEFydGljbGVBY3Rpb25zLCB7IGFydGljbGU6IHZub2RlLmF0dHJzLmFydGljbGUgfSlcblx0XTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIExpbmsgPSByZXF1aXJlKCcuL0xpbmsnKTtcblxuXG52YXIgRkFWT1JJVEVEX0NMQVNTID0gJ2J0biBidG4tc20gYnRuLXByaW1hcnknO1xudmFyIE5PVF9GQVZPUklURURfQ0xBU1MgPSAnYnRuIGJ0bi1zbSBidG4tb3V0bGluZS1wcmltYXJ5JztcblxuXG5mdW5jdGlvbiBvbkZhdm9yaXRlQnV0dG9uQ2xpY2soZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdC8vIFRPRE8gYWRkIGltcGxlbWVudGF0aW9uXG59XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuXHR2YXIgYXJ0aWNsZSA9IHZub2RlLmF0dHJzLmFydGljbGUsXG5cdFx0ZmF2b3JpdGVCdXR0b25DbGFzcyA9IGFydGljbGUuZmF2b3JpdGVkID9cblx0XHRcdEZBVk9SSVRFRF9DTEFTUyA6XG5cdFx0XHROT1RfRkFWT1JJVEVEX0NMQVNTO1xuXG5cdHJldHVybiBtKCcuYXJ0aWNsZS1wcmV2aWV3Jyxcblx0XHRtKCcuY29udGFpbmVyJywgW1xuXHRcdFx0bSgnLmFydGljbGUtbWV0YScsIFtcblx0XHRcdFx0bShMaW5rLCB7IHRvOiAnL0AnICsgYXJ0aWNsZS5hdXRob3IudXNlcm5hbWUgfSxcblx0XHRcdFx0XHRtKCdpbWcnLCB7IHNyYzogYXJ0aWNsZS5hdXRob3IuaW1hZ2UgfSlcblx0XHRcdFx0KSxcblxuXHRcdFx0XHRtKCcuaW5mbycsIFtcblx0XHRcdFx0XHRtKExpbmssIHsgdG86ICcvQCcgKyBhcnRpY2xlLmF1dGhvci51c2VybmFtZSwgY2xhc3NOYW1lOiAnYXV0aG9yJyB9LCBhcnRpY2xlLmF1dGhvci51c2VybmFtZSksXG5cdFx0XHRcdFx0bSgnLmRhdGUnLCBuZXcgRGF0ZShhcnRpY2xlLmNyZWF0ZWRBdCkudG9EYXRlU3RyaW5nKCkpXG5cdFx0XHRcdF0pLFxuXG5cdFx0XHRcdG0oJy5wdWxsLXhzLXJpZ2h0Jyxcblx0XHRcdFx0XHRtKCdidXR0b24nLCB7IGNsYXNzTmFtZTogZmF2b3JpdGVCdXR0b25DbGFzcywgb25jbGljazogb25GYXZvcml0ZUJ1dHRvbkNsaWNrIH0sIFtcblx0XHRcdFx0XHRcdG0oJ2kuaW9uLWhlYXJ0JyksXG5cdFx0XHRcdFx0XHRtKCdzcGFuJywgJyAnICsgYXJ0aWNsZS5mYXZvcml0ZXNDb3VudClcblx0XHRcdFx0XHRdKVxuXHRcdFx0XHQpXG5cblx0XHRcdF0pLFxuXG5cdFx0XHRtKExpbmssIHsgdG86ICcvYXJ0aWNsZS8nICsgYXJ0aWNsZS5zbHVnLCBjbGFzc05hbWU6ICdwcmV2aWV3LWxpbmsnIH0sIFtcblx0XHRcdFx0bSgnaDEnLCBhcnRpY2xlLnRpdGxlKSxcblx0XHRcdFx0bSgncCcsIGFydGljbGUuZGVzY3JpcHRpb24pLFxuXHRcdFx0XHRtKCdzcGFuJywgJ1JlYWQgbW9yZS4uLicpLFxuXHRcdFx0XHRtKCd1bC50YWctbGlzdCcsIGFydGljbGUudGFnTGlzdC5tYXAoZnVuY3Rpb24gKHRhZykge1xuXHRcdFx0XHRcdHJldHVybiBtKCdsaS50YWctZGVmYXVsdCB0YWctcGlsbCB0YWctb3V0bGluZScsIHsga2V5OiB0YWcgfSwgdGFnKTtcblx0XHRcdFx0fSkpXG5cdFx0XHRdKVxuXG5cdFx0XSlcblx0KTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuXHRyZXR1cm4gW1xuXHRcdG0oJ3NwYW4nLFxuXHRcdFx0bSgnYnV0dG9uLmJ0bi5idG4tb3V0bGluZS1zZWNvbmRhcnkuYnRuLXNtJywgeyBvbmNsaWNrOiB2bm9kZS5hdHRycy5hY3Rpb24gfSwgW1xuXHRcdFx0XHRtKCdpLmlvbi1lZGl0JyksIG0oJ3NwYW4nLCAnIEVkaXQgQXJ0aWNsZScpXG5cdFx0XHRdKVxuXHRcdClcblx0XTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuXHR2YXIgY29udGVudCA9IFtcblx0XHRtKCdoMS5sb2dvLWZvbnQnLCAnY29uZHVpdCcpLFxuXHRcdG0oJ3AnLCAnQSBwbGFjZSB0byBzaGFyZSB5b3VyIGtub3dsZWRnZS4nKVxuXHRdO1xuXG5cdGlmICh2bm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG5cdFx0Y29udGVudCA9IHZub2RlLmNoaWxkcmVuO1xuXHR9XG5cblx0cmV0dXJuIG0oJy5iYW5uZXInLFxuXHRcdG0oJy5jb250YWluZXInLCBjb250ZW50KVxuXHQpO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0dmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgTGluayA9IHJlcXVpcmUoJy4vTGluaycpO1xuXG5cbmZ1bmN0aW9uIHZpZXcodm5vZGUpIHtcblx0dmFyIGNvbW1lbnQgPSB2bm9kZS5hdHRycy5jb21tZW50O1xuXG5cdHJldHVybiBtKCdkaXYuY2FyZCcsIFtcblx0XHRtKCdkaXYuY2FyZC1ibG9jaycsXG5cdFx0XHRtKCdkaXYuY2FyZC10ZXh0JywgbS50cnVzdCh1dGlscy5mb3JtYXRBcnRpY2xlQ29tbWVudEJvZHlUZXh0KGNvbW1lbnQuYm9keSkpKVxuXHRcdCksXG5cdFx0bSgnZGl2LmNhcmQtZm9vdGVyJywgW1xuXHRcdFx0bShMaW5rLCB7IGNsYXNzTmFtZTogJ2NvbW1lbnQtYXV0aG9yJywgdG86IHV0aWxzLmdldExpbmtUb1VzZXJQcm9maWxlKGNvbW1lbnQuYXV0aG9yLnVzZXJuYW1lKSB9LFxuXHRcdFx0XHRtKCdpbWcuY29tbWVudC1hdXRob3ItaW1nJywgeyBzcmM6IGNvbW1lbnQuYXV0aG9yLmltYWdlIH0pXG5cdFx0XHQpLFxuXHRcdFx0bSgnc3BhbicsIG0udHJ1c3QoJyZuYnNwOyAnKSksXG5cdFx0XHRtKExpbmssIHsgY2xhc3NOYW1lOiAnY29tbWVudC1hdXRob3InLCB0bzogdXRpbHMuZ2V0TGlua1RvVXNlclByb2ZpbGUoY29tbWVudC5hdXRob3IudXNlcm5hbWUpIH0sXG5cdFx0XHRcdGNvbW1lbnQuYXV0aG9yLnVzZXJuYW1lXG5cdFx0XHQpLFxuXHRcdFx0bSgnc3Bhbi5kYXRlLXBvc3RlZCcsIHV0aWxzLmZvcm1hdERhdGUoY29tbWVudC5jcmVhdGVkQXQsIHV0aWxzLmRhdGVGb3JtYXRzLkRFRkFVTFRfV0lUSF9USU1FKSlcblx0XHRdKVxuXHRdKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIExpbmsgPSByZXF1aXJlKCcuL0xpbmsnKTtcbnZhciBOZXdDb21tZW50Rm9ybSA9IHJlcXVpcmUoJy4vTmV3Q29tbWVudEZvcm0nKTtcbnZhciBDb21tZW50ID0gcmVxdWlyZSgnLi9Db21tZW50Jyk7XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuXHR2YXIgY29tbWVudHMgPSB2bm9kZS5hdHRycy5jb21tZW50cy5kYXRhIHx8IFtdO1xuXHR2YXIgaGVhZGVyID0gbSgncCcsIFtcblx0XHRtKExpbmssIHsgdG86ICcvbG9naW4nIH0sICdTaWduIGluJyksXG5cdFx0bSgnc3BhbicsICcgb3IgJyksXG5cdFx0bShMaW5rLCB7IHRvOiAnL3JlZ2lzdGVyJyB9LCAnU2lnbiB1cCcpLFxuXHRcdG0oJ3NwYW4nLCAnIHRvIGFkZCBjb21tZW50cyBvbiB0aGlzIGFydGljbGUuJylcblx0XSk7XG5cdHZhciBib2R5ID0gbnVsbDtcblxuXHRpZiAodm5vZGUuYXR0cnMuY3VycmVudFVzZXIpIHtcblx0XHRoZWFkZXIgPSBtKE5ld0NvbW1lbnRGb3JtKTtcblx0fVxuXG5cdGlmICh2bm9kZS5hdHRycy5jb21tZW50cy5pc0xvYWRpbmcpIHtcblx0XHRib2R5ID0gbSgnZGl2JywgJ0xvYWRpbmcuLi4nKTtcblx0fVxuXG5cdGlmIChjb21tZW50cykge1xuXHRcdGJvZHkgPSBjb21tZW50cy5tYXAoZnVuY3Rpb24gKGNvbW1lbnQpIHtcblx0XHRcdHJldHVybiBtKENvbW1lbnQsIHsgY29tbWVudDogY29tbWVudCwga2V5OiBjb21tZW50LmlkIH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIG0oJ2Rpdi5jb21tZW50cycsIFtcblx0XHRoZWFkZXIsXG5cdFx0Ym9keVxuXHRdKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIGRvbWFpbiA9IHJlcXVpcmUoJy4vLi4vLi4vZG9tYWluJyk7XG5cblxuZnVuY3Rpb24gc2V0Q3VycmVudGx5QWN0aXZlQXJ0aWNsZXModm5vZGUsIHR5cGUpIHtcblx0dmFyIHBheWxvYWQgPSB7XG5cdFx0dHlwZTogdHlwZVxuXHR9O1xuXG5cdHN3aXRjaCAodHlwZS5uYW1lKSB7XG5cdFx0Y2FzZSBkb21haW4uc3RvcmUuYXJ0aWNsZUxpc3RUeXBlcy5VU0VSX0ZBVk9SSVRFRC5uYW1lOlxuXHRcdFx0cGF5bG9hZC5hdXRob3IgPSAnJztcblx0XHRcdHBheWxvYWQuZmF2b3JpdGVkID0gdm5vZGUuc3RhdGUudXNlcm5hbWU7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgZG9tYWluLnN0b3JlLmFydGljbGVMaXN0VHlwZXMuVVNFUl9PV05FRC5uYW1lOlxuXHRcdFx0cGF5bG9hZC5hdXRob3IgPSB2bm9kZS5zdGF0ZS51c2VybmFtZTtcblx0XHRcdHBheWxvYWQuZmF2b3JpdGVkID0gJyc7XG5cdFx0XHRicmVhaztcblx0fVxuXG5cdGRvbWFpbi5hY3Rpb25zLnNldEN1cnJlbnRseUFjdGl2ZUFydGljbGVzKHBheWxvYWQpO1xufVxuXG5cbmZ1bmN0aW9uIG9uTGlua0NsaWNrKHZub2RlLCB0eXBlLCBlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRzZXRDdXJyZW50bHlBY3RpdmVBcnRpY2xlcyh2bm9kZSwgdHlwZSk7XG59XG5cblxuZnVuY3Rpb24gYnVpbGRMaW5rKHZub2RlLCBsaW5rVHlwZSwgY3VycmVudFR5cGUpIHtcblx0dmFyIGxpbmtDbGFzc05hbWUgPSBsaW5rVHlwZS5uYW1lID09PSBjdXJyZW50VHlwZS5uYW1lID8gJy5hY3RpdmUnIDogJyc7XG5cblx0cmV0dXJuIG0oJ2xpLm5hdi1pdGVtJyxcblx0XHRtKCdhLm5hdi1saW5rJyArIGxpbmtDbGFzc05hbWUsIHtcblx0XHRcdGhyZWY6ICcnLCBvbmNsaWNrOiBvbkxpbmtDbGljay5iaW5kKG51bGwsIHZub2RlLCBsaW5rVHlwZSlcblx0XHR9LCBsaW5rVHlwZS5sYWJlbClcblx0KTtcbn1cblxuXG5mdW5jdGlvbiBvbmluaXQodm5vZGUpIHtcblx0Y29uc29sZS5sb2coJ3Zub2RlLmF0dHJzLmN1cnJlbnRUeXBlJywgdm5vZGUuYXR0cnMuY3VycmVudFR5cGUpO1xuXHRzZXRDdXJyZW50bHlBY3RpdmVBcnRpY2xlcyh2bm9kZSwgdm5vZGUuYXR0cnMubGlua1R5cGVzWzBdKTtcbn1cblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG5cdHZhciBjdXJyZW50VHlwZSA9IHZub2RlLmF0dHJzLmN1cnJlbnRUeXBlID8gdm5vZGUuYXR0cnMuY3VycmVudFR5cGUgOiAnJztcblx0dmFyIGxpbmtUeXBlcyA9IHZub2RlLmF0dHJzLmxpbmtUeXBlcyA/IHZub2RlLmF0dHJzLmxpbmtUeXBlcyA6IFtdO1xuXHR2bm9kZS5zdGF0ZS51c2VybmFtZSA9IHZub2RlLmF0dHJzLnVzZXJuYW1lID8gdm5vZGUuYXR0cnMudXNlcm5hbWUgOiAnJztcblxuXHRyZXR1cm4gbSgnZGl2LmZlZWQtdG9nZ2xlJyxcblx0XHRtKCd1bC5uYXYubmF2LXBpbGxzLm91dGxpbmUtYWN0aXZlJywgbGlua1R5cGVzLm1hcChmdW5jdGlvbiAobGlua1R5cGUpIHtcblx0XHRcdHJldHVybiBidWlsZExpbmsodm5vZGUsIGxpbmtUeXBlLCBjdXJyZW50VHlwZSk7XG5cdFx0fSkpXG5cdCk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRvbmluaXQ6IG9uaW5pdCxcblx0dmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG5cdHZhciBvbmNsaWNrID0gdm5vZGUuYXR0cnMub25jbGljayA/IHZub2RlLmF0dHJzLm9uY2xpY2sgOiBudWxsO1xuXG5cdHJldHVybiBtKCdhJywgeyBjbGFzc05hbWU6IHZub2RlLmF0dHJzLmNsYXNzTmFtZSwgaHJlZjogdm5vZGUuYXR0cnMudG8sIG9uY3JlYXRlOiBtLnJvdXRlLmxpbmssIG9udXBkYXRlOiBtLnJvdXRlLmxpbmssIG9uY2xpY2s6IG9uY2xpY2sgfSwgdm5vZGUuY2hpbGRyZW4pO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0dmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG5cdHZhciBlcnJvcnMgPSB2bm9kZS5hdHRycy5lcnJvcnM7XG5cblx0aWYgKGVycm9ycykge1xuXHRcdHJldHVybiBtKCd1bC5lcnJvci1tZXNzYWdlcycsXG5cdFx0XHRPYmplY3Qua2V5cyhlcnJvcnMpLm1hcChmdW5jdGlvbiAoZXJyb3JLZXkpIHtcblx0XHRcdFx0cmV0dXJuIG0oJ2xpJywge2tleTogZXJyb3JLZXl9LCBlcnJvcktleSArICcgJyArIGVycm9yc1tlcnJvcktleV0pO1xuXHRcdFx0fSlcblx0XHQpO1xuXHR9XG5cblxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIExpbmsgPSByZXF1aXJlKCcuL0xpbmsnKTtcblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG5cdHZhciBjdXJyZW50VXNlciA9IHZub2RlLmF0dHJzLmN1cnJlbnRVc2VyID8gdm5vZGUuYXR0cnMuY3VycmVudFVzZXIgOiB7XG5cdFx0dXNlcm5hbWU6ICcnXG5cdH07XG5cblx0dmFyIGFsbExpbmtzID0ge1xuXHRcdGhvbWU6IHsgcm91dGU6ICcvJywgbGFiZWw6ICdIb21lJyB9LFxuXHRcdGxvZ2luOiB7IHJvdXRlOiAnL2xvZ2luJywgbGFiZWw6ICdTaWduIGluJyB9LFxuXHRcdHJlZ2lzdGVyOiB7IHJvdXRlOiAnL3JlZ2lzdGVyJywgbGFiZWw6ICdTaWduIHVwJyB9LFxuXHRcdGVkaXRvcjogeyByb3V0ZTogJy9lZGl0b3InLCBsYWJlbDogJzxpIGNsYXNzPVwiaW9uLWNvbXBvc2VcIj48L2k+IE5ldyBBcnRpY2xlJyB9LFxuXHRcdHNldHRpbmdzOiB7IHJvdXRlOiAnL3NldHRpbmdzJywgbGFiZWw6ICc8aSBjbGFzcz1cImlvbi1nZWFyLWFcIj48L2k+IFNldHRpbmdzJyB9LFxuXHRcdHVzZXI6IHsgcm91dGU6ICcvQCcgKyBjdXJyZW50VXNlci51c2VybmFtZSwgbGFiZWw6ICc8aW1nIGNsYXNzPVwidXNlci1waWNcIiBzcmM9XCInICsgdXRpbHMuZ2V0VXNlckltYWdlT3JEZWZhdWx0KGN1cnJlbnRVc2VyKSArICdcIiAvPiAnICsgY3VycmVudFVzZXIudXNlcm5hbWUgfVxuXHR9O1xuXG5cdHZhciBsaW5rc0Zvckd1ZXN0ID0gW1xuXHRcdGFsbExpbmtzLmhvbWUsXG5cdFx0YWxsTGlua3MubG9naW4sXG5cdFx0YWxsTGlua3MucmVnaXN0ZXJcblx0XTtcblxuXHR2YXIgbGlua3NGb3JNZW1iZXIgPSBbXG5cdFx0YWxsTGlua3MuaG9tZSxcblx0XHRhbGxMaW5rcy5lZGl0b3IsXG5cdFx0YWxsTGlua3Muc2V0dGluZ3MsXG5cdFx0YWxsTGlua3MudXNlclxuXHRdO1xuXG5cblx0dmFyIGxpbmtzVG9EaXNwbGF5ID0gbGlua3NGb3JHdWVzdDtcblx0aWYgKGN1cnJlbnRVc2VyLnVzZXJuYW1lKSB7XG5cdFx0bGlua3NUb0Rpc3BsYXkgPSBsaW5rc0Zvck1lbWJlcjtcblx0fVxuXG5cdHJldHVybiBtKCd1bCcsIHsgY2xhc3NOYW1lOiB2bm9kZS5hdHRycy5jbGFzc05hbWUgfSxcblx0XHRsaW5rc1RvRGlzcGxheS5tYXAoZnVuY3Rpb24gKGxpbmspIHtcblx0XHRcdHZhciBjbGFzc05hbWUgPSAnbmF2LWxpbmsnO1xuXG5cdFx0XHRpZiAobS5yb3V0ZS5nZXQoKSA9PT0gbGluay5yb3V0ZSkge1xuXHRcdFx0XHRjbGFzc05hbWUgKz0gJyBhY3RpdmUnO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbSgnbGkubmF2LWl0ZW0nLCBtKExpbmssIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUsIHRvOiBsaW5rLnJvdXRlIH0sIG0udHJ1c3QobGluay5sYWJlbCkpKTtcblx0XHR9KVxuXHQpO1xuXG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHR2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBzdGF0ZSA9IHtcblx0Zm5fc3VibWl0OiBudWxsLFxuXHRmb3JtRGF0YToge31cbn07XG5cblxuZnVuY3Rpb24gc2V0SW5wdXRWYWx1ZShuYW1lLCB2YWx1ZSkge1xuXHRzdGF0ZS5mb3JtRGF0YVtuYW1lXSA9IHZhbHVlO1xufVxuXG5cbmZ1bmN0aW9uIG9uU3VibWl0QnV0dG9uQ2xpY2soZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0c3RhdGUuZm5fc3VibWl0KHN0YXRlLmZvcm1EYXRhKTtcbn1cblxuXG5mdW5jdGlvbiBvbmluaXQodm5vZGUpIHtcblx0c2V0dXBGb3JtRGF0YSh2bm9kZS5hdHRycy5hcnRpY2xlKTtcblxuXHRzdGF0ZS5mbl9zdWJtaXQgPSB2bm9kZS5hdHRycy5mbl9zdWJtaXQ7XG59XG5cblxuZnVuY3Rpb24gc2V0dXBGb3JtRGF0YShkYXRhKSB7XG5cdHZhciBhcnRpY2xlRGF0YSA9IGRhdGEgPyBkYXRhIDoge1xuXHRcdHRpdGxlOiAnJyxcblx0XHRkZXNjcmlwdGlvbjogJycsXG5cdFx0Ym9keTogJycsXG5cdFx0dGFnTGlzdDogJydcblx0fTtcblxuXHRzdGF0ZS5mb3JtRGF0YSA9IHtcblx0XHR0aXRsZTogYXJ0aWNsZURhdGEudGl0bGUsXG5cdFx0ZGVzY3JpcHRpb246IGFydGljbGVEYXRhLmRlc2NyaXB0aW9uLFxuXHRcdGJvZHk6IGFydGljbGVEYXRhLmJvZHksXG5cdFx0dGFnTGlzdDogYXJ0aWNsZURhdGEudGFnTGlzdFxuXHR9O1xufVxuXG5cbmZ1bmN0aW9uIG9uYmVmb3JldXBkYXRlKHZub2RlLCB2bm9kZU9sZCkge1xuXHRpZiAodm5vZGVPbGQuYXR0cnMuYXJ0aWNsZSAhPT0gdm5vZGUuYXR0cnMuYXJ0aWNsZSkge1xuXHRcdHNldHVwRm9ybURhdGEodm5vZGUuYXR0cnMuYXJ0aWNsZSk7XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG5cblx0cmV0dXJuIG0oJ2Zvcm0nLFxuXHRcdG0oJ2ZpZWxkc2V0Jyxcblx0XHRcdFtcblx0XHRcdFx0bSgnZmllbGRzZXQuZm9ybS1ncm91cCcsXG5cdFx0XHRcdFx0bSgnaW5wdXQuZm9ybS1jb250cm9sLmZvcm0tY29udHJvbC1sZycsIHsgb25pbnB1dDogbS53aXRoQXR0cigndmFsdWUnLCBzZXRJbnB1dFZhbHVlLmJpbmQobnVsbCwgJ3RpdGxlJykpLCB2YWx1ZTogc3RhdGUuZm9ybURhdGEudGl0bGUsIHR5cGU6ICd0ZXh0JywgYXV0b2NvbXBsZXRlOiAnb2ZmJywgcGxhY2Vob2xkZXI6ICdBcnRpY2xlIFRpdGxlJywgZGlzYWJsZWQ6IHZub2RlLmF0dHJzLmlzU3VibWl0QnVzeSB9KVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRtKCdmaWVsZHNldC5mb3JtLWdyb3VwJyxcblx0XHRcdFx0XHRtKCdpbnB1dC5mb3JtLWNvbnRyb2wnLCB7IG9uaW5wdXQ6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgc2V0SW5wdXRWYWx1ZS5iaW5kKG51bGwsICdkZXNjcmlwdGlvbicpKSwgdmFsdWU6IHN0YXRlLmZvcm1EYXRhLmRlc2NyaXB0aW9uLCB0eXBlOiAndGV4dCcsIGF1dG9jb21wbGV0ZTogJ29mZicsIHBsYWNlaG9sZGVyOiAnV2hhdFxcJ3MgdGhpcyBhcnRpY2xlIGFib3V0PycsIGRpc2FibGVkOiB2bm9kZS5hdHRycy5pc1N1Ym1pdEJ1c3kgfSlcblx0XHRcdFx0KSxcblx0XHRcdFx0bSgnZmllbGRzZXQuZm9ybS1ncm91cCcsXG5cdFx0XHRcdFx0bSgndGV4dGFyZWEuZm9ybS1jb250cm9sJywgeyBvbmlucHV0OiBtLndpdGhBdHRyKCd2YWx1ZScsIHNldElucHV0VmFsdWUuYmluZChudWxsLCAnYm9keScpKSwgdmFsdWU6IHN0YXRlLmZvcm1EYXRhLmJvZHksIGF1dG9jb21wbGV0ZTogJ29mZicsIHJvd3M6ICc4JywgcGxhY2Vob2xkZXI6ICdXcml0ZSB5b3VyIGFydGljbGUgKGluIG1hcmtkb3duKScsIGRpc2FibGVkOiB2bm9kZS5hdHRycy5pc1N1Ym1pdEJ1c3kgfSlcblx0XHRcdFx0KSxcblx0XHRcdFx0bSgnZmllbGRzZXQuZm9ybS1ncm91cCcsXG5cdFx0XHRcdFx0bSgnaW5wdXQuZm9ybS1jb250cm9sJywgeyBvbmlucHV0OiBtLndpdGhBdHRyKCd2YWx1ZScsIHNldElucHV0VmFsdWUuYmluZChudWxsLCAndGFnTGlzdCcpKSwgdmFsdWU6IHN0YXRlLmZvcm1EYXRhLnRhZ0xpc3QsIHR5cGU6ICd0ZXh0JywgYXV0b2NvbXBsZXRlOiAnb2ZmJywgcGxhY2Vob2xkZXI6ICdFbnRlciB0YWdzJywgZGlzYWJsZWQ6IHZub2RlLmF0dHJzLmlzU3VibWl0QnVzeSB9KVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRtKCdidXR0b24uYnRuLmJ0bi1sZy5idG4tcHJpbWFyeS5wdWxsLXhzLXJpZ2h0JywgeyBvbmNsaWNrOiBvblN1Ym1pdEJ1dHRvbkNsaWNrLCBkaXNhYmxlZDogdm5vZGUuYXR0cnMuaXNTdWJtaXRCdXN5IH0sICdQdWJsaXNoIEFydGljbGUnKVxuXHRcdFx0XVxuXHRcdClcblx0KTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdG9uaW5pdDogb25pbml0LFxuXHRvbmJlZm9yZXVwZGF0ZTogb25iZWZvcmV1cGRhdGUsXG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIGRvbWFpbiA9IHJlcXVpcmUoJy4vLi4vLi4vZG9tYWluJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cblxudmFyIHN0YXRlID0ge1xuXHRmb3JtRGF0YToge1xuXHRcdGFydGljbGVTbHVnOiAnJyxcblx0XHRib2R5OiAnJ1xuXHR9XG59O1xuXG5cbmZ1bmN0aW9uIHNldElucHV0VmFsdWUobmFtZSwgdmFsdWUpIHtcblx0c3RhdGUuZm9ybURhdGFbbmFtZV0gPSB2YWx1ZTtcbn1cblxuXG5mdW5jdGlvbiBpc0Zvcm1TdWJtaXNzaW9uQnVzeSgpIHtcblx0cmV0dXJuIGRvbWFpbi5zdG9yZS5pc0FydGljbGVDb21tZW50Q3JlYXRpb25CdXN5O1xufVxuXG5mdW5jdGlvbiBpc0Zvcm1TdWJtaXREaXNhYmxlZCgpIHtcblx0cmV0dXJuIHN0YXRlLmZvcm1EYXRhLmJvZHkgPT09ICcnIHx8IGRvbWFpbi5zdG9yZS5zZWxlY3RlZEFydGljbGUuZGF0YSA9PT0gbnVsbCB8fCBpc0Zvcm1TdWJtaXNzaW9uQnVzeSgpID09PSB0cnVlO1xufVxuXG5cbmZ1bmN0aW9uIG9uRm9ybVN1Ym1pdChlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRzZXRJbnB1dFZhbHVlKCdhcnRpY2xlU2x1ZycsIGRvbWFpbi5zdG9yZS5zZWxlY3RlZEFydGljbGUuZGF0YS5zbHVnKTtcblx0ZG9tYWluLmFjdGlvbnMuY3JlYXRlQXJ0aWNsZUNvbW1lbnQoc3RhdGUuZm9ybURhdGEpO1xuXHRzZXRJbnB1dFZhbHVlKCdib2R5JywgJycpO1xufVxuXG5cbmZ1bmN0aW9uIHZpZXcoKSB7XG5cdHJldHVybiBtKCdkaXYnLCBbXG5cdFx0bSgnZm9ybS5jYXJkIGNvbW1lbnQtZm9ybScsIHsgZGlzYWJsZWQ6IGlzRm9ybVN1Ym1pc3Npb25CdXN5KCksIG9uc3VibWl0OiBvbkZvcm1TdWJtaXQgfSxcblx0XHRcdG0oJ2Rpdi5jYXJkLWJsb2NrJyxcblx0XHRcdFx0bSgndGV4dGFyZWEuZm9ybS1jb250cm9sJywgeyBvbmlucHV0OiBtLndpdGhBdHRyKCd2YWx1ZScsIHNldElucHV0VmFsdWUuYmluZChudWxsLCAnYm9keScpKSwgdmFsdWU6IHN0YXRlLmZvcm1EYXRhLmJvZHksIGF1dG9jb21wbGV0ZTogJ29mZicsIGRpc2FibGVkOiBpc0Zvcm1TdWJtaXNzaW9uQnVzeSgpLCByb3dzOiAnMycsIHBsYWNlaG9sZGVyOiAnV3JpdGUgYSBjb21tZW50Li4uJyB9KVxuXHRcdFx0KSxcblx0XHRcdG0oJ2Rpdi5jYXJkLWZvb3RlcicsIFtcblx0XHRcdFx0bSgnaW1nLmNvbW1lbnQtYXV0aG9yLWltZycsIHsgc3JjOiB1dGlscy5nZXRVc2VySW1hZ2VPckRlZmF1bHQoZG9tYWluLnN0b3JlLnVzZXIpIH0pLFxuXHRcdFx0XHRtKCdidXR0b24uYnRuLmJ0bi1zbS5idG4tcHJpbWFyeScsIHsgdHlwZTogJ3N1Ym1pdCcsIGRpc2FibGVkOiBpc0Zvcm1TdWJtaXREaXNhYmxlZCgpIH0sICdQb3N0IENvbW1lbnQnKVxuXHRcdFx0XSlcblx0XHQpXG5cdF0pO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0dmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgTGluayA9IHJlcXVpcmUoJy4vTGluaycpO1xuXG5cbmZ1bmN0aW9uIHZpZXcodm5vZGUpIHtcblx0dmFyIHRvdGFsUGFnZXMgPSB2bm9kZS5hdHRycy50b3RhbFBhZ2VzIHx8IDE7XG5cdHZhciBjdXJyZW50UGFnZSA9IHZub2RlLmF0dHJzLmN1cnJlbnRQYWdlIHx8IDE7XG5cdHZhciBwYWdlTGlzdCA9IEFycmF5LmFwcGx5KG51bGwsIEFycmF5KHRvdGFsUGFnZXMpKTtcblxuXHQvLyBjb25zb2xlLmxvZyh2bm9kZS5hdHRycyk7XG5cblx0cmV0dXJuIG0oJ25hdicsXG5cdFx0bSgndWwucGFnaW5hdGlvbicsXG5cdFx0XHRwYWdlTGlzdC5tYXAoZnVuY3Rpb24gKHRhZywgaSkge1xuXHRcdFx0XHR2YXIgYWN0aXZlQ2xhc3NOYW1lID0gJyc7XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRQYWdlID09PSAoaSArIDEpKSB7XG5cdFx0XHRcdFx0YWN0aXZlQ2xhc3NOYW1lID0gJy5hY3RpdmUnO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG0oJ2xpLnBhZ2UtaXRlbScgKyBhY3RpdmVDbGFzc05hbWUsIHsga2V5OiBpIH0sXG5cdFx0XHRcdFx0bShMaW5rLCB7XG5cdFx0XHRcdFx0XHRjbGFzc05hbWU6ICdwYWdlLWxpbmsnLFxuXHRcdFx0XHRcdFx0dG86ICcnLFxuXHRcdFx0XHRcdFx0b25jbGljazogZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdFx0XHR2bm9kZS5hdHRycy5mbl9vbkl0ZW1DbGljayhpICsgMSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSwgU3RyaW5nKGkgKyAxKSlcblx0XHRcdFx0KTtcblx0XHRcdH0pXG5cdFx0KVxuXHQpO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0dmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgVGFnTGlzdCA9IHJlcXVpcmUoJy4vVGFnTGlzdCcpO1xuXG5cbmZ1bmN0aW9uIHZpZXcodm5vZGUpIHtcblx0dmFyIHRhZ3NDb250ZW50ID0gbSgnZGl2JywgJ0xvYWRpbmcgVGFncy4uLicpO1xuXG5cdGlmICh2bm9kZS5hdHRycy5pc0xvYWRpbmcgPT09IGZhbHNlKSB7XG5cdFx0dGFnc0NvbnRlbnQgPSBtKFRhZ0xpc3QsIHsgbGlzdDogdm5vZGUuYXR0cnMubGlzdCB9KTtcblx0fVxuXG5cdHJldHVybiBtKCdkaXYnLCBbXG5cdFx0bSgncCcsICdQb3B1bGFyIFRhZ3MnKSxcblx0XHR0YWdzQ29udGVudFxuXHRdKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuXHRyZXR1cm4gbSgnc2VjdGlvbicsIHZub2RlLmNoaWxkcmVuKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIExpbmsgPSByZXF1aXJlKCcuL0xpbmsnKTtcbnZhciBzdHlsZXMgPSB7XG5cdE9VVExJTkU6ICdPVVRMSU5FJ1xufTtcblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG5cdHZhciBsaXN0ID0gdm5vZGUuYXR0cnMubGlzdCA/IHZub2RlLmF0dHJzLmxpc3QgOiBbXTtcblx0dmFyIGxpbmtDbGFzc05hbWUgPSAndGFnLWRlZmF1bHQgdGFnLXBpbGwnO1xuXG5cdGlmICh2bm9kZS5hdHRycy5zdHlsZSA9PT0gc3R5bGVzLk9VVExJTkUpIHtcblx0XHRsaW5rQ2xhc3NOYW1lICs9ICcgdGFnLW91dGxpbmUnO1xuXHR9XG5cblx0cmV0dXJuIG0oJ3VsLnRhZy1saXN0Jyxcblx0XHRsaXN0Lm1hcChmdW5jdGlvbiAodGFnKSB7XG5cdFx0XHRyZXR1cm4gbSgnbGknLFxuXHRcdFx0XHRtKExpbmssIHtcblx0XHRcdFx0XHRjbGFzc05hbWU6IGxpbmtDbGFzc05hbWUsIGtleTogdGFnLCB0bzogJycsIG9uY2xpY2s6IGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LCB0YWcpXG5cdFx0XHQpO1xuXHRcdH0pXG5cdCk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRzdHlsZXM6IHN0eWxlcyxcblx0dmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgZG9tYWluID0gcmVxdWlyZSgnLi8uLi8uLi9kb21haW4nKTtcblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG5cdHZhciBhY3Rpb24gPSB2bm9kZS5hdHRycy5hY3Rpb24gfHwgZG9tYWluLmFjdGlvbnMuZm9sbG93VXNlci5iaW5kKG51bGwsIHZub2RlLmF0dHJzLnVzZXJuYW1lKTtcblx0dmFyIGxhYmVsID0gdm5vZGUuYXR0cnMudXNlcm5hbWUgPyAnIEZvbGxvdyAnICsgdm5vZGUuYXR0cnMudXNlcm5hbWUgOiAnJztcblxuXHRyZXR1cm4gW1xuXHRcdG0oJ3NwYW4nLFxuXHRcdFx0bSgnYnV0dG9uLmJ0bi5idG4tc20uYnRuLXNlY29uZGFyeScsIHsgb25jbGljazogZnVuY3Rpb24gKCkgeyBhY3Rpb24oKTsgfSB9LCBbXG5cdFx0XHRcdG0oJ2kuaW9uLXBsdXMtcm91bmQnKSwgbSgnc3BhbicsIGxhYmVsKVxuXHRcdFx0XSlcblx0XHQpXG5cdF07XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHR2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBVc2VyRm9sbG93QnV0dG9uID0gcmVxdWlyZSgnLi9Vc2VyRm9sbG93QnV0dG9uJyk7XG52YXIgVXNlclVuZm9sbG93QnV0dG9uID0gcmVxdWlyZSgnLi9Vc2VyVW5mb2xsb3dCdXR0b24nKTtcblxuXG5mdW5jdGlvbiBnZXRBY3Rpb25CdXR0b24oaXNGb2xsb3dpbmcsIHVzZXJuYW1lLCBsb2dnZWRJblVzZXJuYW1lKSB7XG5cblx0aWYgKCFsb2dnZWRJblVzZXJuYW1lKSB7XG5cdFx0cmV0dXJuIG0oVXNlckZvbGxvd0J1dHRvbiwgeyB1c2VybmFtZTogdXNlcm5hbWUsIGFjdGlvbjogbS5yb3V0ZS5zZXQuYmluZChudWxsLCAnL3JlZ2lzdGVyJykgfSk7XG5cdH1cblxuXHRpZiAodXNlcm5hbWUgPT09IGxvZ2dlZEluVXNlcm5hbWUpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGlmIChpc0ZvbGxvd2luZyA9PT0gdHJ1ZSkge1xuXHRcdHJldHVybiBtKFVzZXJVbmZvbGxvd0J1dHRvbiwgeyB1c2VybmFtZTogdXNlcm5hbWUgfSk7XG5cdH1cblxuXHRyZXR1cm4gbShVc2VyRm9sbG93QnV0dG9uLCB7IHVzZXJuYW1lOiB1c2VybmFtZSB9KTtcbn1cblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG5cdHJldHVybiBnZXRBY3Rpb25CdXR0b24odm5vZGUuYXR0cnMuaXNGb2xsb3dpbmcsIHZub2RlLmF0dHJzLnVzZXJuYW1lLCB2bm9kZS5hdHRycy5sb2dnZWRJblVzZXJuYW1lKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIFVzZXJGb2xsb3dVbmZvbGxvd0J1dHRvbiA9IHJlcXVpcmUoJy4vVXNlckZvbGxvd1VuZm9sbG93QnV0dG9uJyk7XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuXHR2YXIgc2VsZWN0ZWRVc2VyID0gdm5vZGUuYXR0cnMuc2VsZWN0ZWRVc2VyID8gdm5vZGUuYXR0cnMuc2VsZWN0ZWRVc2VyIDoge1xuXHRcdGJpbzogJycsXG5cdFx0aW1hZ2U6ICcnLFxuXHRcdHVzZXJuYW1lOiAnJ1xuXHR9O1xuXG5cdHZhciBsb2dnZWRJblVzZXIgPSB2bm9kZS5hdHRycy5sb2dnZWRJblVzZXIgPyB2bm9kZS5hdHRycy5sb2dnZWRJblVzZXIgOiB7XG5cdFx0dXNlcm5hbWU6ICcnXG5cdH07XG5cblx0cmV0dXJuIG0oJy51c2VyLWluZm8nLFxuXHRcdG0oJy5jb250YWluZXInLFxuXHRcdFx0W1xuXHRcdFx0XHRtKCcucm93Jyxcblx0XHRcdFx0XHRbXG5cdFx0XHRcdFx0XHRtKCcuY29sLXhzLTEyIGNvbC1tZC0xMCBvZmZzZXQtbWQtMScsIFtcblx0XHRcdFx0XHRcdFx0bSgnaW1nLnVzZXItaW1nJywgeyBzcmM6IHNlbGVjdGVkVXNlci5pbWFnZSB9KSxcblx0XHRcdFx0XHRcdFx0bSgnaDQnLCBzZWxlY3RlZFVzZXIudXNlcm5hbWUgfHwgJy4uLicpLFxuXHRcdFx0XHRcdFx0XHRtKCdwJywgc2VsZWN0ZWRVc2VyLmJpbyksXG5cdFx0XHRcdFx0XHRcdG0oVXNlckZvbGxvd1VuZm9sbG93QnV0dG9uLCB7IGlzRm9sbG93aW5nOiBzZWxlY3RlZFVzZXIuZm9sbG93aW5nLCB1c2VybmFtZTogc2VsZWN0ZWRVc2VyLnVzZXJuYW1lLCBsb2dnZWRJblVzZXJuYW1lOiBsb2dnZWRJblVzZXIudXNlcm5hbWUgfSlcblx0XHRcdFx0XHRcdF0pLFxuXHRcdFx0XHRcdF1cblx0XHRcdFx0KVxuXHRcdFx0XVxuXHRcdClcblx0KTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIGRvbWFpbiA9IHJlcXVpcmUoJy4vLi4vLi4vZG9tYWluJyk7XG5cblxudmFyIHN0YXRlID0ge1xuXHRlbWFpbDogJycsXG5cdHBhc3N3b3JkOiAnJyxcblx0c2V0RW1haWw6IGZ1bmN0aW9uICh2KSB7IHN0YXRlLmVtYWlsID0gdjsgfSxcblx0c2V0UGFzc3dvcmQ6IGZ1bmN0aW9uICh2KSB7IHN0YXRlLnBhc3N3b3JkID0gdjsgfVxufTtcblxuXG5mdW5jdGlvbiBvbkxvZ2luQnV0dG9uQ2xpY2soZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0ZG9tYWluLmFjdGlvbnMuYXR0ZW1wdFVzZXJMb2dpbihzdGF0ZS5lbWFpbCwgc3RhdGUucGFzc3dvcmQpO1xufVxuXG5cbmZ1bmN0aW9uIHZpZXcodm5vZGUpIHtcblx0cmV0dXJuIG0oJ2Zvcm0nLFxuXHRcdG0oJ2ZpZWxkc2V0Jyxcblx0XHRcdFtcblx0XHRcdFx0bSgnZmllbGRzZXQuZm9ybS1ncm91cCcsXG5cdFx0XHRcdFx0bSgnaW5wdXQuZm9ybS1jb250cm9sLmZvcm0tY29udHJvbC1sZycsIHsgb25pbnB1dDogbS53aXRoQXR0cigndmFsdWUnLCBzdGF0ZS5zZXRFbWFpbCksIHZhbHVlOiBzdGF0ZS5lbWFpbCwgdHlwZTogJ2VtYWlsJywgYXV0b2NvbXBsZXRlOiAnb2ZmJywgcGxhY2Vob2xkZXI6ICdFbWFpbCcsIGRpc2FibGVkOiB2bm9kZS5hdHRycy5pc1VzZXJMb2dpbkJ1c3kgfSlcblx0XHRcdFx0KSxcblx0XHRcdFx0bSgnZmllbGRzZXQuZm9ybS1ncm91cCcsXG5cdFx0XHRcdFx0bSgnaW5wdXQuZm9ybS1jb250cm9sLmZvcm0tY29udHJvbC1sZycsIHsgb25pbnB1dDogbS53aXRoQXR0cigndmFsdWUnLCBzdGF0ZS5zZXRQYXNzd29yZCksIHZhbHVlOiBzdGF0ZS5wYXNzd29yZCwgdHlwZTogJ3Bhc3N3b3JkJywgYXV0b2NvbXBsZXRlOiAnb2ZmJywgcGxhY2Vob2xkZXI6ICdQYXNzd29yZCcsIGRpc2FibGVkOiB2bm9kZS5hdHRycy5pc1VzZXJMb2dpbkJ1c3kgfSlcblx0XHRcdFx0KSxcblx0XHRcdFx0bSgnYnV0dG9uLmJ0bi5idG4tbGcuYnRuLXByaW1hcnkucHVsbC14cy1yaWdodCcsIHsgb25jbGljazogb25Mb2dpbkJ1dHRvbkNsaWNrLCBkaXNhYmxlZDogdm5vZGUuYXR0cnMuaXNVc2VyTG9naW5CdXN5IH0sICdTaWduIEluJylcblx0XHRcdF1cblx0XHQpXG5cdCk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHR2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBzdGF0ZSA9IHtcblx0Zm5fcmVnaXN0ZXJVc2VyOiBudWxsLFxuXHRmb3JtRGF0YToge31cbn07XG5cblxuZnVuY3Rpb24gc2V0SW5wdXRWYWx1ZShuYW1lLCB2YWx1ZSkge1xuXHRzdGF0ZS5mb3JtRGF0YVtuYW1lXSA9IHZhbHVlO1xufVxuXG5cbmZ1bmN0aW9uIG9uUmVnaXN0ZXJCdXR0b25DbGljayhlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRzdGF0ZS5mbl9yZWdpc3RlclVzZXIoc3RhdGUuZm9ybURhdGEpO1xufVxuXG5cbmZ1bmN0aW9uIG9uaW5pdCh2bm9kZSkge1xuXHRzdGF0ZS5mb3JtRGF0YSA9IHtcblx0XHRlbWFpbDogJycsXG5cdFx0cGFzc3dvcmQ6ICcnLFxuXHRcdHVzZXJuYW1lOiAnJ1xuXHR9O1xuXG5cdHN0YXRlLmZuX3JlZ2lzdGVyVXNlciA9IHZub2RlLmF0dHJzLmZuX3JlZ2lzdGVyVXNlcjtcbn1cblxuXG5cbmZ1bmN0aW9uIHZpZXcodm5vZGUpIHtcblx0cmV0dXJuIG0oJ2Zvcm0nLFxuXHRcdG0oJ2ZpZWxkc2V0Jyxcblx0XHRcdFtcblx0XHRcdFx0bSgnZmllbGRzZXQuZm9ybS1ncm91cCcsXG5cdFx0XHRcdFx0bSgnaW5wdXQuZm9ybS1jb250cm9sLmZvcm0tY29udHJvbC1sZycsIHsgb25pbnB1dDogbS53aXRoQXR0cigndmFsdWUnLCBzZXRJbnB1dFZhbHVlLmJpbmQobnVsbCwgJ3VzZXJuYW1lJykpLCB2YWx1ZTogc3RhdGUuZm9ybURhdGEudXNlcm5hbWUsIHR5cGU6ICd0ZXh0JywgYXV0b2NvbXBsZXRlOiAnb2ZmJywgcGxhY2Vob2xkZXI6ICdVc2VybmFtZScsIGRpc2FibGVkOiB2bm9kZS5hdHRycy5pc1VzZXJSZWdpc3RyYXRpb25CdXN5IH0pXG5cdFx0XHRcdCksXG5cdFx0XHRcdG0oJ2ZpZWxkc2V0LmZvcm0tZ3JvdXAnLFxuXHRcdFx0XHRcdG0oJ2lucHV0LmZvcm0tY29udHJvbC5mb3JtLWNvbnRyb2wtbGcnLCB7IG9uaW5wdXQ6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgc2V0SW5wdXRWYWx1ZS5iaW5kKG51bGwsICdlbWFpbCcpKSwgdmFsdWU6IHN0YXRlLmZvcm1EYXRhLmVtYWlsLCB0eXBlOiAnZW1haWwnLCBhdXRvY29tcGxldGU6ICdvZmYnLCBwbGFjZWhvbGRlcjogJ0VtYWlsJywgZGlzYWJsZWQ6IHZub2RlLmF0dHJzLmlzVXNlclJlZ2lzdHJhdGlvbkJ1c3kgfSlcblx0XHRcdFx0KSxcblx0XHRcdFx0bSgnZmllbGRzZXQuZm9ybS1ncm91cCcsXG5cdFx0XHRcdFx0bSgnaW5wdXQuZm9ybS1jb250cm9sLmZvcm0tY29udHJvbC1sZycsIHsgb25pbnB1dDogbS53aXRoQXR0cigndmFsdWUnLCBzZXRJbnB1dFZhbHVlLmJpbmQobnVsbCwgJ3Bhc3N3b3JkJykpLCB2YWx1ZTogc3RhdGUuZm9ybURhdGEucGFzc3dvcmQsIHR5cGU6ICdwYXNzd29yZCcsIGF1dG9jb21wbGV0ZTogJ29mZicsIHBsYWNlaG9sZGVyOiAnUGFzc3dvcmQnLCBkaXNhYmxlZDogdm5vZGUuYXR0cnMuaXNVc2VyUmVnaXN0cmF0aW9uQnVzeSB9KVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRtKCdidXR0b24uYnRuLmJ0bi1sZy5idG4tcHJpbWFyeS5wdWxsLXhzLXJpZ2h0JywgeyBvbmNsaWNrOiBvblJlZ2lzdGVyQnV0dG9uQ2xpY2ssIGRpc2FibGVkOiB2bm9kZS5hdHRycy5pc1VzZXJSZWdpc3RyYXRpb25CdXN5IH0sICdTaWduIHVwJylcblx0XHRcdF1cblx0XHQpXG5cdCk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRvbmluaXQ6IG9uaW5pdCxcblx0dmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgc3RhdGUgPSB7XG5cdGZuX3VwZGF0ZVVzZXJTZXR0aW5nczogbnVsbCxcblx0Zm5fbG9nVXNlck91dDogbnVsbCxcblx0Zm9ybURhdGE6IHt9XG59O1xuXG5cbmZ1bmN0aW9uIHNldElucHV0VmFsdWUobmFtZSwgdmFsdWUpIHtcblx0c3RhdGUuZm9ybURhdGFbbmFtZV0gPSB2YWx1ZTtcbn1cblxuXG5mdW5jdGlvbiBvblN1Ym1pdEJ1dHRvbkNsaWNrKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdHN0YXRlLmZuX3VwZGF0ZVVzZXJTZXR0aW5ncyhzdGF0ZS5mb3JtRGF0YSk7XG59XG5cblxuZnVuY3Rpb24gb25Mb2dvdXRCdXR0b25DbGljayhlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRzdGF0ZS5mbl9sb2dVc2VyT3V0KCk7XG59XG5cblxuZnVuY3Rpb24gb25pbml0KHZub2RlKSB7XG5cdHNldHVwRm9ybURhdGEodm5vZGUuYXR0cnMuY3VycmVudFVzZXIpO1xuXG5cdHN0YXRlLmZuX3VwZGF0ZVVzZXJTZXR0aW5ncyA9IHZub2RlLmF0dHJzLmZuX3VwZGF0ZVVzZXJTZXR0aW5ncztcblx0c3RhdGUuZm5fbG9nVXNlck91dCA9IHZub2RlLmF0dHJzLmZuX2xvZ1VzZXJPdXQ7XG59XG5cblxuZnVuY3Rpb24gc2V0dXBGb3JtRGF0YShkYXRhKSB7XG5cdHZhciB1c2VyRGF0YSA9IGRhdGEgPyBkYXRhIDoge1xuXHRcdGJpbzogJycsXG5cdFx0ZW1haWw6ICcnLFxuXHRcdGltYWdlOiAnJyxcblx0XHR1c2VybmFtZTogJydcblx0fTtcblxuXHRzdGF0ZS5mb3JtRGF0YSA9IHtcblx0XHRiaW86IHVzZXJEYXRhLmJpbyxcblx0XHRlbWFpbDogdXNlckRhdGEuZW1haWwsXG5cdFx0aW1hZ2U6IHVzZXJEYXRhLmltYWdlLFxuXHRcdHVzZXJuYW1lOiB1c2VyRGF0YS51c2VybmFtZVxuXHR9O1xufVxuXG5cbmZ1bmN0aW9uIG9uYmVmb3JldXBkYXRlKHZub2RlLCB2bm9kZU9sZCkge1xuXHRpZiAodm5vZGVPbGQuYXR0cnMuY3VycmVudFVzZXIgIT09IHZub2RlLmF0dHJzLmN1cnJlbnRVc2VyKSB7XG5cdFx0c2V0dXBGb3JtRGF0YSh2bm9kZS5hdHRycy5jdXJyZW50VXNlcik7XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuXG5mdW5jdGlvbiB2aWV3KHZub2RlKSB7XG5cblx0cmV0dXJuIG0oJ2RpdicsIFtcblx0XHRtKCdmb3JtJyxcblx0XHRcdG0oJ2ZpZWxkc2V0Jyxcblx0XHRcdFx0W1xuXHRcdFx0XHRcdG0oJ2ZpZWxkc2V0LmZvcm0tZ3JvdXAnLFxuXHRcdFx0XHRcdFx0bSgnaW5wdXQuZm9ybS1jb250cm9sJywgeyBvbmlucHV0OiBtLndpdGhBdHRyKCd2YWx1ZScsIHNldElucHV0VmFsdWUuYmluZChudWxsLCAnaW1hZ2UnKSksIHZhbHVlOiBzdGF0ZS5mb3JtRGF0YS5pbWFnZSwgdHlwZTogJ3RleHQnLCBhdXRvY29tcGxldGU6ICdvZmYnLCBwbGFjZWhvbGRlcjogJ1VSTCBvZiBwcm9maWxlIHBpY3R1cmUnLCBkaXNhYmxlZDogdm5vZGUuYXR0cnMuaXNVc2VyU2V0dGluZ3NVcGRhdGVCdXN5IH0pXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRtKCdmaWVsZHNldC5mb3JtLWdyb3VwJyxcblx0XHRcdFx0XHRcdG0oJ2lucHV0LmZvcm0tY29udHJvbC5mb3JtLWNvbnRyb2wtbGcnLCB7IG9uaW5wdXQ6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgc2V0SW5wdXRWYWx1ZS5iaW5kKG51bGwsICd1c2VybmFtZScpKSwgdmFsdWU6IHN0YXRlLmZvcm1EYXRhLnVzZXJuYW1lLCB0eXBlOiAnZW1haWwnLCBhdXRvY29tcGxldGU6ICdvZmYnLCBwbGFjZWhvbGRlcjogJ1VzZXJuYW1lJywgZGlzYWJsZWQ6IHZub2RlLmF0dHJzLmlzVXNlclNldHRpbmdzVXBkYXRlQnVzeSB9KVxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0bSgnZmllbGRzZXQuZm9ybS1ncm91cCcsXG5cdFx0XHRcdFx0XHRtKCd0ZXh0YXJlYS5mb3JtLWNvbnRyb2wuZm9ybS1jb250cm9sLWxnJywgeyBvbmlucHV0OiBtLndpdGhBdHRyKCd2YWx1ZScsIHNldElucHV0VmFsdWUuYmluZChudWxsLCAnYmlvJykpLCB2YWx1ZTogc3RhdGUuZm9ybURhdGEuYmlvLCBhdXRvY29tcGxldGU6ICdvZmYnLCByb3dzOiAnOCcsIHBsYWNlaG9sZGVyOiAnU2hvcnQgYmlvIGFib3V0IHlvdScsIGRpc2FibGVkOiB2bm9kZS5hdHRycy5pc1VzZXJTZXR0aW5nc1VwZGF0ZUJ1c3kgfSlcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdG0oJ2ZpZWxkc2V0LmZvcm0tZ3JvdXAnLFxuXHRcdFx0XHRcdFx0bSgnaW5wdXQuZm9ybS1jb250cm9sLmZvcm0tY29udHJvbC1sZycsIHsgb25pbnB1dDogbS53aXRoQXR0cigndmFsdWUnLCBzZXRJbnB1dFZhbHVlLmJpbmQobnVsbCwgJ2VtYWlsJykpLCB2YWx1ZTogc3RhdGUuZm9ybURhdGEuZW1haWwsIHR5cGU6ICdlbWFpbCcsIGF1dG9jb21wbGV0ZTogJ29mZicsIHBsYWNlaG9sZGVyOiAnRW1haWwnLCBkaXNhYmxlZDogdm5vZGUuYXR0cnMuaXNVc2VyU2V0dGluZ3NVcGRhdGVCdXN5IH0pXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRtKCdmaWVsZHNldC5mb3JtLWdyb3VwJyxcblx0XHRcdFx0XHRcdG0oJ2lucHV0LmZvcm0tY29udHJvbC5mb3JtLWNvbnRyb2wtbGcnLCB7IG9uaW5wdXQ6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgc2V0SW5wdXRWYWx1ZS5iaW5kKG51bGwsICdwYXNzd29yZCcpKSwgdmFsdWU6IHN0YXRlLmZvcm1EYXRhLnBhc3N3b3JkLCB0eXBlOiAncGFzc3dvcmQnLCBhdXRvY29tcGxldGU6ICdvZmYnLCBwbGFjZWhvbGRlcjogJ1Bhc3N3b3JkJywgZGlzYWJsZWQ6IHZub2RlLmF0dHJzLmlzVXNlclNldHRpbmdzVXBkYXRlQnVzeSB9KVxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0bSgnYnV0dG9uLmJ0bi5idG4tbGcuYnRuLXByaW1hcnkucHVsbC14cy1yaWdodCcsIHsgb25jbGljazogb25TdWJtaXRCdXR0b25DbGljaywgZGlzYWJsZWQ6IHZub2RlLmF0dHJzLmlzVXNlclNldHRpbmdzVXBkYXRlQnVzeSB9LCAnVXBkYXRlIFNldHRpbmdzJylcblx0XHRcdFx0XVxuXHRcdFx0KVxuXHRcdCksXG5cdFx0bSgnaHInKSxcblx0XHRtKCdidXR0b24uYnRuLmJ0bi1vdXRsaW5lLWRhbmdlcicsIHsgb25jbGljazogb25Mb2dvdXRCdXR0b25DbGljaywgZGlzYWJsZWQ6IHZub2RlLmF0dHJzLmlzVXNlclNldHRpbmdzVXBkYXRlQnVzeSB9LCAnT3IgY2xpY2sgaGVyZSB0byBsb2dvdXQnKVxuXHRdKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdG9uaW5pdDogb25pbml0LFxuXHRvbmJlZm9yZXVwZGF0ZTogb25iZWZvcmV1cGRhdGUsXG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIGRvbWFpbiA9IHJlcXVpcmUoJy4vLi4vLi4vZG9tYWluJyk7XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuXHR2YXIgYWN0aW9uID0gZG9tYWluLmFjdGlvbnMudW5mb2xsb3dVc2VyLmJpbmQobnVsbCwgdm5vZGUuYXR0cnMudXNlcm5hbWUpO1xuXHR2YXIgbGFiZWwgPSB2bm9kZS5hdHRycy51c2VybmFtZSA/ICcgVW5mb2xsb3cgJyArIHZub2RlLmF0dHJzLnVzZXJuYW1lIDogJyc7XG5cblx0cmV0dXJuIFtcblx0XHRtKCdzcGFuJyxcblx0XHRcdG0oJ2J1dHRvbi5idG4uYnRuLXNtLmJ0bi1zZWNvbmRhcnknLCB7IG9uY2xpY2s6IGZ1bmN0aW9uICgpIHsgYWN0aW9uKCk7IH0gfSwgW1xuXHRcdFx0XHRtKCdpLmlvbi1taW51cy1yb3VuZCcpLCBtKCdzcGFuJywgbGFiZWwpXG5cdFx0XHRdKVxuXHRcdClcblx0XTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIG5hbWUgPSAnTGF5b3V0RGVmYXVsdCc7XG5cblxudmFyIEFwcEhlYWRlciA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9BcHBIZWFkZXInKTtcbnZhciBTY3JlZW5Db250ZW50ID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL1NjcmVlbkNvbnRlbnQnKTtcbnZhciBBcHBGb290ZXIgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvQXBwRm9vdGVyJyk7XG5cblxuZnVuY3Rpb24gdmlldyh2bm9kZSkge1xuXHRyZXR1cm4gbSgnZGl2JywgeyBjbGFzc05hbWU6IG5hbWUgfSxcblx0XHRbXG5cdFx0XHRtKEFwcEhlYWRlciksXG5cdFx0XHRtKFNjcmVlbkNvbnRlbnQsIHt9LCB2bm9kZS5jaGlsZHJlbiksXG5cdFx0XHRtKEFwcEZvb3Rlcilcblx0XHRdXG5cdCk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIExheW91dERlZmF1bHQgPSByZXF1aXJlKCcuL2xheW91dHMvTGF5b3V0RGVmYXVsdCcpO1xuXG5cbnZhciBTY3JlZW5Ib21lID0gcmVxdWlyZSgnLi9zY3JlZW5zL1NjcmVlbkhvbWUnKTtcbnZhciBTY3JlZW5BcnRpY2xlID0gcmVxdWlyZSgnLi9zY3JlZW5zL1NjcmVlbkFydGljbGUnKTtcbnZhciBTY3JlZW5Vc2VyTG9naW4gPSByZXF1aXJlKCcuL3NjcmVlbnMvU2NyZWVuVXNlckxvZ2luJyk7XG52YXIgU2NyZWVuVXNlclJlZ2lzdGVyID0gcmVxdWlyZSgnLi9zY3JlZW5zL1NjcmVlblVzZXJSZWdpc3RlcicpO1xudmFyIFNjcmVlblVzZXJQcm9maWxlID0gcmVxdWlyZSgnLi9zY3JlZW5zL1NjcmVlblVzZXJQcm9maWxlJyk7XG52YXIgU2NyZWVuVXNlclNldHRpbmdzID0gcmVxdWlyZSgnLi9zY3JlZW5zL1NjcmVlblVzZXJTZXR0aW5ncycpO1xudmFyIFNjcmVlblVzZXJGYXZvcml0ZXMgPSByZXF1aXJlKCcuL3NjcmVlbnMvU2NyZWVuVXNlckZhdm9yaXRlcycpO1xudmFyIFNjcmVlbkVkaXRvciA9IHJlcXVpcmUoJy4vc2NyZWVucy9TY3JlZW5FZGl0b3InKTtcblxuXG52YXIgcm91dGVzID0ge1xuXHQnLyc6IGJ1aWxkUm91dGUoU2NyZWVuSG9tZSksXG5cdCcvYXJ0aWNsZS86c2x1Zyc6IGJ1aWxkUm91dGUoU2NyZWVuQXJ0aWNsZSksXG5cdCcvcmVnaXN0ZXInOiBidWlsZFJvdXRlKFNjcmVlblVzZXJSZWdpc3RlciksXG5cdCcvbG9naW4nOiBidWlsZFJvdXRlKFNjcmVlblVzZXJMb2dpbiksXG5cdCcvQDp1c2VybmFtZSc6IGJ1aWxkUm91dGUoU2NyZWVuVXNlclByb2ZpbGUpLFxuXHQnL0A6dXNlcm5hbWUvZmF2b3JpdGVzJzogYnVpbGRSb3V0ZShTY3JlZW5Vc2VyRmF2b3JpdGVzKSxcblx0Jy9zZXR0aW5ncyc6IGJ1aWxkUm91dGUoU2NyZWVuVXNlclNldHRpbmdzKSxcblx0Jy9lZGl0b3InOiBidWlsZFJvdXRlKFNjcmVlbkVkaXRvciksXG5cdCcvZWRpdG9yLzpzbHVnJzogYnVpbGRSb3V0ZShTY3JlZW5FZGl0b3IpXG59O1xuXG5cbmZ1bmN0aW9uIGJ1aWxkUm91dGUoc2NyZWVuLCBsYXlvdXQpIHtcblx0bGF5b3V0ID0gbGF5b3V0IHx8IExheW91dERlZmF1bHQ7XG5cblx0cmV0dXJuIHtcblx0XHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBtKGxheW91dCwgbShzY3JlZW4pKTtcblx0XHR9XG5cdH07XG59XG5cblxuZnVuY3Rpb24gaW5pdCgpIHtcblx0bS5yb3V0ZS5wcmVmaXgoJz8nKTtcblx0bS5yb3V0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJyksICcvJywgcm91dGVzKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0aW5pdDogaW5pdFxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgZG9tYWluID0gcmVxdWlyZSgnLi8uLi8uLi9kb21haW4nKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBCYW5uZXIgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvQmFubmVyJyk7XG52YXIgQXJ0aWNsZUJhbm5lciA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9BcnRpY2xlQmFubmVyJyk7XG52YXIgQXJ0aWNsZUNvbnRlbnQgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvQXJ0aWNsZUNvbnRlbnQnKTtcbnZhciBBcnRpY2xlTWV0YUFuZEFjdGlvbnMgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvQXJ0aWNsZU1ldGFBbmRBY3Rpb25zJyk7XG52YXIgQ29tbWVudHMgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvQ29tbWVudHMnKTtcblxuXG52YXIgc3RhdGUgPSB7XG5cdHNsdWc6ICcnXG59O1xuXG5cbmZ1bmN0aW9uIGdldEFydGljbGUoKSB7XG5cdHN0YXRlLnNsdWcgPSBtLnJvdXRlLnBhcmFtKCdzbHVnJyk7XG5cdGRvbWFpbi5hY3Rpb25zLnNldFNlbGVjdGVkQXJ0aWNsZShzdGF0ZS5zbHVnKTtcblx0ZG9tYWluLmFjdGlvbnMuc2V0U2VsZWN0ZWRBcnRpY2xlQ29tbWVudHMoc3RhdGUuc2x1Zyk7XG5cdGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wID0gMDtcbn1cblxuXG5mdW5jdGlvbiBvbmluaXQoKSB7XG5cdGdldEFydGljbGUoKTtcbn1cblxuXG5mdW5jdGlvbiBvbmJlZm9yZXVwZGF0ZSgpIHtcblx0aWYgKHN0YXRlLnNsdWcgIT09IG0ucm91dGUucGFyYW0oJ3NsdWcnKSkge1xuXHRcdGdldEFydGljbGUoKTtcblx0fVxuXG5cdHJldHVybiB0cnVlO1xufVxuXG5cbmZ1bmN0aW9uIG9udXBkYXRlKCkge1xuXHRpZiAoZG9tYWluLnN0b3JlLnNlbGVjdGVkQXJ0aWNsZS5kYXRhKSB7XG5cdFx0dXRpbHMudXBkYXRlRG9jdW1lbnRUaXRsZShkb21haW4uc3RvcmUuc2VsZWN0ZWRBcnRpY2xlLmRhdGEudGl0bGUpO1xuXHR9XG59XG5cblxuZnVuY3Rpb24gdmlldygpIHtcblx0cmV0dXJuIG0oJ2Rpdi5hcnRpY2xlLXBhZ2UnLFxuXHRcdFtcblx0XHRcdG0oQmFubmVyLFxuXHRcdFx0XHRtKEFydGljbGVCYW5uZXIsIHsgYXJ0aWNsZTogZG9tYWluLnN0b3JlLnNlbGVjdGVkQXJ0aWNsZSB9KVxuXHRcdFx0KSxcblx0XHRcdG0oJ2Rpdi5jb250YWluZXInLCBbXG5cdFx0XHRcdG0oJ2Rpdi5yb3cnLCBbXG5cdFx0XHRcdFx0bShBcnRpY2xlQ29udGVudCwgeyBhcnRpY2xlOiBkb21haW4uc3RvcmUuc2VsZWN0ZWRBcnRpY2xlIH0pLFxuXHRcdFx0XHRdKSxcblx0XHRcdFx0bSgnaHInKSxcblx0XHRcdFx0bSgnZGl2LmFydGljbGUtYWN0aW9ucycsIFtcblx0XHRcdFx0XHRtKEFydGljbGVNZXRhQW5kQWN0aW9ucywgeyBhcnRpY2xlOiBkb21haW4uc3RvcmUuc2VsZWN0ZWRBcnRpY2xlIH0pXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRtKCdkaXYucm93Jyxcblx0XHRcdFx0XHRtKCdkaXYuY29sLXhzLTEyLmNvbC1tZC04Lm9mZnNldC1tZC0yJyxcblx0XHRcdFx0XHRcdG0oQ29tbWVudHMsIHsgY29tbWVudHM6IGRvbWFpbi5zdG9yZS5zZWxlY3RlZEFydGljbGVDb21tZW50cywgY3VycmVudFVzZXI6IGRvbWFpbi5zdG9yZS51c2VyIH0pXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHRdKVxuXHRcdF1cblx0KTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdG9uaW5pdDogb25pbml0LFxuXHRvbmJlZm9yZXVwZGF0ZTogb25iZWZvcmV1cGRhdGUsXG5cdG9udXBkYXRlOiBvbnVwZGF0ZSxcblx0dmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgZG9tYWluID0gcmVxdWlyZSgnLi8uLi8uLi9kb21haW4nKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBOZXdBcnRpY2xlRm9ybSA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9OZXdBcnRpY2xlRm9ybScpO1xudmFyIExpc3RFcnJvcnMgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvTGlzdEVycm9ycycpO1xuXG5cbmZ1bmN0aW9uIG9uaW5pdCgpIHtcblx0dXRpbHMudXBkYXRlRG9jdW1lbnRUaXRsZSgnRWRpdG9yJyk7XG59XG5cblxuZnVuY3Rpb24gdmlldygpIHtcblx0cmV0dXJuIG0oJy5jb250YWluZXIucGFnZScsIFtcblx0XHRtKCcucm93JywgW1xuXHRcdFx0bSgnLmNvbC1tZC0xMC5vZmZzZXQtbWQtMS5jb2wteHMtMTInLCBbXG5cdFx0XHRcdG0oTGlzdEVycm9ycywgeyBlcnJvcnM6IGRvbWFpbi5zdG9yZS5jcmVhdGVBcnRpY2xlRXJyb3JzIH0pLFxuXHRcdFx0XHRtKE5ld0FydGljbGVGb3JtLCB7IGlzU3VibWl0QnVzeTogZG9tYWluLnN0b3JlLmlzQ3JlYXRlQXJ0aWNsZUJ1c3ksIGZuX3N1Ym1pdDogZG9tYWluLmFjdGlvbnMuY3JlYXRlQXJ0aWNsZSB9KVxuXHRcdFx0XSlcblx0XHRdKVxuXHRdKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdG9uaW5pdDogb25pbml0LFxuXHR2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBkb21haW4gPSByZXF1aXJlKCcuLy4uLy4uL2RvbWFpbicpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIEJhbm5lciA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9CYW5uZXInKTtcbnZhciBBcnRpY2xlTGlzdCA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9BcnRpY2xlTGlzdCcpO1xudmFyIEZlZWRUb2dnbGUgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvRmVlZFRvZ2dsZScpO1xudmFyIFBvcHVsYXJUYWdMaXN0ID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL1BvcHVsYXJUYWdMaXN0Jyk7XG5cblxuZnVuY3Rpb24gb25UYWdJdGVtQ2xpY2sodGFnKSB7XG5cdGRvbWFpbi5hY3Rpb25zLmdldEFydGljbGVzQnlUYWcodGFnKTtcbn1cblxuXG5mdW5jdGlvbiBvbmluaXQoKSB7XG5cdHV0aWxzLnVwZGF0ZURvY3VtZW50VGl0bGUoJ0hvbWUnKTtcblx0ZG9tYWluLmFjdGlvbnMuZ2V0VGFncygpO1xufVxuXG5cbmZ1bmN0aW9uIHZpZXcoKSB7XG5cdHZhciBiYW5uZXIgPSBtKEJhbm5lcik7XG5cblx0aWYgKGRvbWFpbi5zdG9yZS51c2VyKSB7XG5cdFx0YmFubmVyID0gbnVsbDtcblx0fVxuXG5cdHJldHVybiBtKCdkaXYuaG9tZS1wYWdlJyxcblx0XHRbXG5cdFx0XHRiYW5uZXIsXG5cdFx0XHRtKCcuY29udGFpbmVyLnBhZ2UnLCBbXG5cdFx0XHRcdG0oJy5yb3cnLCBbXG5cdFx0XHRcdFx0bSgnLmNvbC1tZC05JywgW1xuXHRcdFx0XHRcdFx0bShGZWVkVG9nZ2xlLCB7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRUeXBlOiBkb21haW4uc3RvcmUuc2VsZWN0ZWRBcnRpY2xlcy50eXBlLCB1c2VybmFtZTogZG9tYWluLnN0b3JlLnVzZXIgPyBkb21haW4uc3RvcmUudXNlci51c2VybmFtZSA6ICcnLCBsaW5rVHlwZXM6IFtcblx0XHRcdFx0XHRcdFx0XHRkb21haW4uc3RvcmUuYXJ0aWNsZUxpc3RUeXBlcy5VU0VSX0ZBVk9SSVRFRCxcblx0XHRcdFx0XHRcdFx0XHRkb21haW4uc3RvcmUuYXJ0aWNsZUxpc3RUeXBlcy5HTE9CQUwsXG5cdFx0XHRcdFx0XHRcdFx0ZG9tYWluLnN0b3JlLmFydGljbGVMaXN0VHlwZXMuVVNFUl9PV05FRFxuXHRcdFx0XHRcdFx0XHRdXG5cdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdG0oQXJ0aWNsZUxpc3QsIHsgbGltaXQ6IDEwIH0pXG5cdFx0XHRcdFx0XSksXG5cdFx0XHRcdFx0bSgnLmNvbC1tZC0zJywgW1xuXHRcdFx0XHRcdFx0bSgnLnNpZGViYXInLCBtKFBvcHVsYXJUYWdMaXN0LCB7IGZuX29uVGFnSXRlbUNsaWNrOiBvblRhZ0l0ZW1DbGljaywgaXNMb2FkaW5nOiBkb21haW4uc3RvcmUudGFncy5pc0xvYWRpbmcsIGxpc3Q6IGRvbWFpbi5zdG9yZS50YWdzLmxpc3QgfSkpXG5cdFx0XHRcdFx0XSlcblx0XHRcdFx0XSlcblx0XHRcdF0pXG5cdFx0XVxuXHQpO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0b25pbml0OiBvbmluaXQsXG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIGRvbWFpbiA9IHJlcXVpcmUoJy4vLi4vLi4vZG9tYWluJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgQmFubmVyID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL0Jhbm5lcicpO1xuXG5cbnZhciBzdGF0ZSA9IHtcblx0dXNlcm5hbWU6ICcnXG59O1xuXG5cbmZ1bmN0aW9uIGdldFVzZXJQcm9maWxlKCkge1xuXHRzdGF0ZS51c2VybmFtZSA9IG0ucm91dGUucGFyYW0oJ3VzZXJuYW1lJyk7XG5cdGRvbWFpbi5hY3Rpb25zLmdldFVzZXJQcm9maWxlKHN0YXRlLnVzZXJuYW1lKTtcblx0ZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgPSAwO1xufVxuXG5cbmZ1bmN0aW9uIG9uaW5pdCgpIHtcblx0Z2V0VXNlclByb2ZpbGUoKTtcbn1cblxuXG5mdW5jdGlvbiBvbmJlZm9yZXVwZGF0ZSgpIHtcblx0aWYgKHN0YXRlLnVzZXJuYW1lICE9PSBtLnJvdXRlLnBhcmFtKCd1c2VybmFtZScpKSB7XG5cdFx0Z2V0VXNlclByb2ZpbGUoKTtcblx0fVxuXG5cdHJldHVybiB0cnVlO1xufVxuXG5cbmZ1bmN0aW9uIG9udXBkYXRlKCkge1xuXHR1dGlscy51cGRhdGVEb2N1bWVudFRpdGxlKCdBcnRpY2xlcyBmYXZvdXJpdGVkIGJ5ICcgKyBzdGF0ZS51c2VybmFtZSk7XG59XG5cblxuZnVuY3Rpb24gdmlldygpIHtcblx0cmV0dXJuIG0oJ2RpdicsXG5cdFx0W1xuXHRcdFx0bShCYW5uZXIpLFxuXHRcdFx0bSgnaDEnLCAnU2NyZWVuVXNlckZhdm9yaXRlcycpXG5cdFx0XVxuXHQpO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0b25pbml0OiBvbmluaXQsXG5cdG9uYmVmb3JldXBkYXRlOiBvbmJlZm9yZXVwZGF0ZSxcblx0b251cGRhdGU6IG9udXBkYXRlLFxuXHR2aWV3OiB2aWV3XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBkb21haW4gPSByZXF1aXJlKCcuLy4uLy4uL2RvbWFpbicpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIExpbmsgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvTGluaycpO1xudmFyIFVzZXJMb2dpbkZvcm0gPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvVXNlckxvZ2luRm9ybScpO1xudmFyIExpc3RFcnJvcnMgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvTGlzdEVycm9ycycpO1xuXG5cbmZ1bmN0aW9uIHJlZGlyZWN0SWZVc2VyTG9nZ2VkSW4oKSB7XG5cdGlmIChkb21haW4uc3RvcmUudXNlcikge1xuXHRcdGRvbWFpbi5hY3Rpb25zLnJlZGlyZWN0QWZ0ZXJVc2VyTG9naW5TdWNjZXNzKCk7XG5cdH1cbn1cblxuXG5mdW5jdGlvbiBvbmluaXQoKSB7XG5cdHV0aWxzLnVwZGF0ZURvY3VtZW50VGl0bGUoJ1NpZ24gaW4nKTtcblxuXHRyZWRpcmVjdElmVXNlckxvZ2dlZEluKCk7XG59XG5cblxuZnVuY3Rpb24gb251cGRhdGUoKSB7XG5cdHJlZGlyZWN0SWZVc2VyTG9nZ2VkSW4oKTtcbn1cblxuXG5mdW5jdGlvbiB2aWV3KCkge1xuXHRyZXR1cm4gbSgnZGl2Jyxcblx0XHRbXG5cdFx0XHRtKCcuY29udGFpbmVyLnBhZ2UnLCBbXG5cdFx0XHRcdG0oJy5yb3cnLCBbXG5cdFx0XHRcdFx0bSgnLmNvbC1tZC02Lm9mZnNldC1tZC0zLmNvbC14cy0xMicsIFtcblx0XHRcdFx0XHRcdG0oJ2gxLnRleHQteHMtY2VudGVyJywgJ1NpZ24gaW4nKSxcblx0XHRcdFx0XHRcdG0oJ3AudGV4dC14cy1jZW50ZXInLFxuXHRcdFx0XHRcdFx0XHRtKExpbmssIHsgdG86ICcvcmVnaXN0ZXInIH0sICdOZWVkIGFuIGFjY291bnQ/Jylcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRtKExpc3RFcnJvcnMsIHsgZXJyb3JzOiBkb21haW4uc3RvcmUudXNlckxvZ2luRXJyb3JzIH0pLFxuXHRcdFx0XHRcdFx0bShVc2VyTG9naW5Gb3JtLCB7IGlzVXNlckxvZ2luQnVzeTogZG9tYWluLnN0b3JlLmlzVXNlckxvZ2luQnVzeSB9KVxuXHRcdFx0XHRcdF0pXG5cdFx0XHRcdF0pXG5cdFx0XHRdKVxuXHRcdF1cblx0KTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdG9uaW5pdDogb25pbml0LFxuXHRvbnVwZGF0ZTogb251cGRhdGUsXG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIGRvbWFpbiA9IHJlcXVpcmUoJy4vLi4vLi4vZG9tYWluJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgVXNlckluZm9CYW5uZXIgPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvVXNlckluZm9CYW5uZXInKTtcbnZhciBGZWVkVG9nZ2xlID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL0ZlZWRUb2dnbGUnKTtcbnZhciBBcnRpY2xlTGlzdCA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9BcnRpY2xlTGlzdCcpO1xuXG5cbnZhciBzdGF0ZSA9IHtcblx0dXNlcm5hbWU6ICcnXG59O1xuXG5cbmZ1bmN0aW9uIGdldFVzZXJQcm9maWxlKCkge1xuXHRzdGF0ZS51c2VybmFtZSA9IG0ucm91dGUucGFyYW0oJ3VzZXJuYW1lJyk7XG5cdGRvbWFpbi5hY3Rpb25zLmdldFVzZXJQcm9maWxlKHN0YXRlLnVzZXJuYW1lKTtcblx0ZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgPSAwO1xufVxuXG5cbmZ1bmN0aW9uIG9uaW5pdCgpIHtcblx0Z2V0VXNlclByb2ZpbGUoKTtcbn1cblxuXG5mdW5jdGlvbiBvbmJlZm9yZXVwZGF0ZSgpIHtcblx0aWYgKHN0YXRlLnVzZXJuYW1lICE9PSBtLnJvdXRlLnBhcmFtKCd1c2VybmFtZScpKSB7XG5cdFx0Z2V0VXNlclByb2ZpbGUoKTtcblx0fVxuXG5cdHJldHVybiB0cnVlO1xufVxuXG5cbmZ1bmN0aW9uIG9udXBkYXRlKCkge1xuXHR1dGlscy51cGRhdGVEb2N1bWVudFRpdGxlKCdAJyArIHN0YXRlLnVzZXJuYW1lKTtcbn1cblxuXG5mdW5jdGlvbiB2aWV3KCkge1xuXHR2YXIgdXNlcm5hbWUgPSBtLnJvdXRlLnBhcmFtKCd1c2VybmFtZScpIHx8ICcnO1xuXG5cdHJldHVybiBtKCcucHJvZmlsZS1wYWdlJyxcblx0XHRbXG5cdFx0XHRtKFVzZXJJbmZvQmFubmVyLCB7IGxvZ2dlZEluVXNlcjogZG9tYWluLnN0b3JlLnVzZXIsIHNlbGVjdGVkVXNlcjogZG9tYWluLnN0b3JlLnNlbGVjdGVkVXNlclByb2ZpbGUuZGF0YSwgaXNMb2FkaW5nOiBkb21haW4uc3RvcmUuc2VsZWN0ZWRVc2VyUHJvZmlsZS5pc0xvYWRpbmcgfSksXG5cdFx0XHRtKCcuY29udGFpbmVyJywgW1xuXHRcdFx0XHRtKCcucm93JywgW1xuXHRcdFx0XHRcdG0oJy5jb2wtbWQtMTInLCBbXG5cdFx0XHRcdFx0XHRtKEZlZWRUb2dnbGUsIHtcblx0XHRcdFx0XHRcdFx0Y3VycmVudFR5cGU6IGRvbWFpbi5zdG9yZS5zZWxlY3RlZEFydGljbGVzLnR5cGUsIHVzZXJuYW1lOiB1c2VybmFtZSwgbGlua1R5cGVzOiBbXG5cdFx0XHRcdFx0XHRcdFx0ZG9tYWluLnN0b3JlLmFydGljbGVMaXN0VHlwZXMuVVNFUl9PV05FRCxcblx0XHRcdFx0XHRcdFx0XHRkb21haW4uc3RvcmUuYXJ0aWNsZUxpc3RUeXBlcy5VU0VSX0ZBVk9SSVRFRFxuXHRcdFx0XHRcdFx0XHRdXG5cdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdG0oQXJ0aWNsZUxpc3QsIHsgbGltaXQ6IDUgfSlcblx0XHRcdFx0XHRdKVxuXHRcdFx0XHRdKVxuXHRcdFx0XSlcblx0XHRdXG5cdCk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRvbmluaXQ6IG9uaW5pdCxcblx0b25iZWZvcmV1cGRhdGU6IG9uYmVmb3JldXBkYXRlLFxuXHRvbnVwZGF0ZTogb251cGRhdGUsXG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIGRvbWFpbiA9IHJlcXVpcmUoJy4vLi4vLi4vZG9tYWluJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgTGluayA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9MaW5rJyk7XG52YXIgTGlzdEVycm9ycyA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9MaXN0RXJyb3JzJyk7XG52YXIgVXNlclJlZ2lzdHJhdGlvbkZvcm0gPSByZXF1aXJlKCcuLy4uL2NvbXBvbmVudHMvVXNlclJlZ2lzdHJhdGlvbkZvcm0nKTtcblxuXG5mdW5jdGlvbiBvbmluaXQoKSB7XG5cdHV0aWxzLnVwZGF0ZURvY3VtZW50VGl0bGUoJ1NpZ24gdXAnKTtcbn1cblxuXG5mdW5jdGlvbiBvbnVwZGF0ZSgpIHtcblx0aWYgKGRvbWFpbi5zdG9yZS51c2VyKSB7XG5cdFx0ZG9tYWluLmFjdGlvbnMucmVkaXJlY3RBZnRlclVzZXJSZWdpc3RyYXRpb25TdWNjZXNzKCk7XG5cdH1cbn1cblxuXG5mdW5jdGlvbiB2aWV3KCkge1xuXHRyZXR1cm4gbSgnZGl2Jyxcblx0XHRbXG5cdFx0XHRtKCcuY29udGFpbmVyLnBhZ2UnLCBbXG5cdFx0XHRcdG0oJy5yb3cnLCBbXG5cdFx0XHRcdFx0bSgnLmNvbC1tZC02Lm9mZnNldC1tZC0zLmNvbC14cy0xMicsIFtcblx0XHRcdFx0XHRcdG0oJ2gxLnRleHQteHMtY2VudGVyJywgJ1NpZ24gdXAnKSxcblx0XHRcdFx0XHRcdG0oJ3AudGV4dC14cy1jZW50ZXInLFxuXHRcdFx0XHRcdFx0XHRtKExpbmssIHsgdG86ICcvbG9naW4nIH0sICdIYXZlIGFuIGFjY291bnQ/Jylcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRtKExpc3RFcnJvcnMsIHsgZXJyb3JzOiBkb21haW4uc3RvcmUudXNlclJlZ2lzdHJhdGlvbkVycm9ycyB9KSxcblx0XHRcdFx0XHRcdG0oVXNlclJlZ2lzdHJhdGlvbkZvcm0sIHsgaXNVc2VyUmVnaXN0cmF0aW9uQnVzeTogZG9tYWluLnN0b3JlLmlzVXNlclJlZ2lzdHJhdGlvbkJ1c3ksIGZuX3JlZ2lzdGVyVXNlcjogZG9tYWluLmFjdGlvbnMucmVnaXN0ZXJOZXdVc2VyIH0pXG5cdFx0XHRcdFx0XSlcblx0XHRcdFx0XSlcblx0XHRcdF0pXG5cdFx0XVxuXHQpO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0b25pbml0OiBvbmluaXQsXG5cdG9udXBkYXRlOiBvbnVwZGF0ZSxcblx0dmlldzogdmlld1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuXG52YXIgZG9tYWluID0gcmVxdWlyZSgnLi8uLi8uLi9kb21haW4nKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBMaXN0RXJyb3JzID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL0xpc3RFcnJvcnMnKTtcbnZhciBVc2VyU2V0dGluZ3NGb3JtID0gcmVxdWlyZSgnLi8uLi9jb21wb25lbnRzL1VzZXJTZXR0aW5nc0Zvcm0nKTtcblxuXG5mdW5jdGlvbiBvbmluaXQoKSB7XG5cdHV0aWxzLnVwZGF0ZURvY3VtZW50VGl0bGUoJ1NldHRpbmdzJyk7XG59XG5cblxuZnVuY3Rpb24gdmlldygpIHtcblx0cmV0dXJuIG0oJy5jb250YWluZXIucGFnZScsIFtcblx0XHRtKCcucm93JywgW1xuXHRcdFx0bSgnLmNvbC1tZC02Lm9mZnNldC1tZC0zLmNvbC14cy0xMicsIFtcblx0XHRcdFx0bSgnaDEudGV4dC14cy1jZW50ZXInLCAnWW91ciBTZXR0aW5ncycpLFxuXHRcdFx0XHRtKExpc3RFcnJvcnMsIHsgZXJyb3JzOiBkb21haW4uc3RvcmUudXNlclVwZGF0ZVNldHRpbmdzRXJyb3JzIH0pLFxuXHRcdFx0XHRtKFVzZXJTZXR0aW5nc0Zvcm0sIHsgY3VycmVudFVzZXI6IGRvbWFpbi5zdG9yZS51c2VyLCBpc1VzZXJTZXR0aW5nc1VwZGF0ZUJ1c3k6IGRvbWFpbi5zdG9yZS5pc1VzZXJTZXR0aW5nc1VwZGF0ZUJ1c3ksIGZuX3VwZGF0ZVVzZXJTZXR0aW5nczogZG9tYWluLmFjdGlvbnMudXBkYXRlVXNlclNldHRpbmdzLCBmbl9sb2dVc2VyT3V0OiBkb21haW4uYWN0aW9ucy5sb2dVc2VyT3V0IH0pXG5cdFx0XHRdKVxuXHRcdF0pXG5cdF0pO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0b25pbml0OiBvbmluaXQsXG5cdHZpZXc6IHZpZXdcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cblxudmFyIGRvbWFpbiA9IHJlcXVpcmUoJy4vLi4vZG9tYWluJyk7XG5cblxudmFyIHhzc0ZpbHRlcnMgPSByZXF1aXJlKCd4c3MtZmlsdGVycycpO1xudmFyIGRhdGVGb3JtYXRUeXBlcyA9IHtcblx0REVGQVVMVDogJ21tbW0gZCwgeXl5eScsXG5cdERFRkFVTFRfV0lUSF9USU1FOiAnbW1tbSBkLCB5eXl5IEAgSEg6TU06c3MnXG59O1xuXG5cbmZ1bmN0aW9uIHVwZGF0ZURvY3VtZW50VGl0bGUodGV4dCkge1xuXHRkb2N1bWVudC50aXRsZSA9IHRleHQgKyAnIOKAlCAnICsgZG9tYWluLnN0b3JlLmFwcFRpdGxlO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdERhdGUoZGF0ZVN0cmluZywgZm9ybWF0KSB7XG5cdC8vIENvdWxkIHVzZSBEYXRlLnRvTG9jYWxlU3RyaW5nKCkgaW4gZnV0dXJlLCBidXQgY3VycmVudGx5IG1vYmlsZSBzdXBwb3J0IGlzIHRlcnJpYmxlXG5cdHZhciBkYXRlRm9ybWF0ID0gcmVxdWlyZSgnZGF0ZWZvcm1hdCcpO1xuXG5cdGlmICghZm9ybWF0KSB7XG5cdFx0Zm9ybWF0ID0gZGF0ZUZvcm1hdFR5cGVzLkRFRkFVTFQ7XG5cdH1cblxuXHR0cnkge1xuXHRcdHZhciBkYXRlID0gbmV3IERhdGUoZGF0ZVN0cmluZyk7XG5cdFx0cmV0dXJuIGRhdGVGb3JtYXQoZGF0ZSwgZm9ybWF0KTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdHJldHVybiBkYXRlU3RyaW5nO1xuXHR9XG59XG5cblxuZnVuY3Rpb24gY29udmVydE1hcmtkb3duVG9IVE1MKGNvbnRlbnQpIHtcblx0dmFyIG1hcmtlZCA9IHJlcXVpcmUoJ21hcmtlZCcpO1xuXG5cdHJldHVybiBtYXJrZWQoY29udGVudCk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJ0aWNsZUNvbW1lbnRCb2R5VGV4dChjb250ZW50KSB7XG5cdHJldHVybiBjb252ZXJ0TWFya2Rvd25Ub0hUTUwoeHNzRmlsdGVycy5pblNpbmdsZVF1b3RlZEF0dHIoY29udGVudCkpO1xufVxuXG5cbmZ1bmN0aW9uIGdldExpbmtUb1VzZXJQcm9maWxlKHVzZXJuYW1lKSB7XG5cdHJldHVybiAnL0AnICsgdXNlcm5hbWU7XG59XG5cblxuZnVuY3Rpb24gZ2V0VXNlckltYWdlT3JEZWZhdWx0KHVzZXIpIHtcblx0aWYgKHVzZXIgJiYgKHVzZXIuaW1hZ2UpKSB7XG5cdFx0cmV0dXJuIHVzZXIuaW1hZ2U7XG5cdH1cblxuXHRyZXR1cm4gJ2h0dHBzOi8vc3RhdGljLnByb2R1Y3Rpb25yZWFkeS5pby9pbWFnZXMvc21pbGV5LWN5cnVzLmpwZyc7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHVwZGF0ZURvY3VtZW50VGl0bGU6IHVwZGF0ZURvY3VtZW50VGl0bGUsXG5cdGRhdGVGb3JtYXRzOiBkYXRlRm9ybWF0VHlwZXMsXG5cdGZvcm1hdERhdGU6IGZvcm1hdERhdGUsXG5cdGZvcm1hdEFydGljbGVDb21tZW50Qm9keVRleHQ6IGZvcm1hdEFydGljbGVDb21tZW50Qm9keVRleHQsXG5cdGNvbnZlcnRNYXJrZG93blRvSFRNTDogY29udmVydE1hcmtkb3duVG9IVE1MLFxuXHRnZXRMaW5rVG9Vc2VyUHJvZmlsZTogZ2V0TGlua1RvVXNlclByb2ZpbGUsXG5cdGdldFVzZXJJbWFnZU9yRGVmYXVsdDogZ2V0VXNlckltYWdlT3JEZWZhdWx0XG59O1xuIl19
