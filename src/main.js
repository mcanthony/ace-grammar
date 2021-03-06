/**
*
*   AceGrammar
*   @version: @@VERSION@@
*
*   Transform a grammar specification in JSON format, into an ACE syntax-highlight parser mode
*   https://github.com/foo123/ace-grammar
*
**/


// ace supposed to be available
var _ace = (typeof ace !== 'undefined') ? ace : { require: function() { return { }; }, config: {} }, 
    
    ace_require = _ace.require, ace_config = _ace.config,

    isNode = !!(("undefined" !== typeof global) && ("[object global]" === toString.call(global))),
    isBrowser = !!(!isNode && ("undefined" !== typeof navigator)),
    isWorker = !!(isBrowser && ("function" === typeof importScripts) && (navigator instanceof WorkerNavigator)),
    
    // Get current filename/path
    get_current_path = function( ) {
        var file = null, path, base, scripts;
        if ( isNode ) 
        {
            // http://nodejs.org/docs/latest/api/globals.html#globals_filename
            // this should hold the current file in node
            file = __filename;
            return { path: __dirname, file: __filename, base: __dirname };
        }
        else if ( isWorker )
        {
            // https://developer.mozilla.org/en-US/docs/Web/API/WorkerLocation
            // this should hold the current url in a web worker
            file = self.location.href;
        }
        else if ( isBrowser )
        {
            // get last script (should be the current one) in browser
            base = document.location.href.split('#')[0].split('?')[0].split('/').slice(0, -1).join('/');
            if ((scripts = document.getElementsByTagName('script')) && scripts.length) 
                file = scripts[scripts.length - 1].src;
        }
        
        if ( file )
            return { path: file.split('/').slice(0, -1).join('/'), file: file, base: base };
        return { path: null, file: null, base: null };
    },
    
    this_path = get_current_path( )
;

//
// parser factories
// extends ace_require("ace/worker/worker_client").WorkerClient
var WorkerClient = Class(ace_require("ace/worker/worker_client").WorkerClient, {
    constructor: function WorkerClient( topLevelNamespaces, mod, classname ) {
        var self = this, require = ace_require, config = ace_config;
        self.$sendDeltaQueue = self.$sendDeltaQueue.bind(self);
        self.changeListener = self.changeListener.bind(self);
        self.onMessage = self.onMessage.bind(self);
        if (require.nameToUrl && !require.toUrl) require.toUrl = require.nameToUrl;

        var workerUrl;
        if (config.get("packaged") || !require.toUrl) {
            workerUrl = config.moduleUrl(mod, "worker");
        } else {
            var normalizePath = self.$normalizePath;
            workerUrl = normalizePath(require.toUrl("ace/worker/worker.js", null, "_"));

            var tlns = {};
            topLevelNamespaces.forEach(function(ns) {
                tlns[ns] = normalizePath(require.toUrl(ns, null, "_").replace(/(\.js)?(\?.*)?$/, ""));
            });
        }
        
        self.$worker = new Worker( workerUrl );
        
        self.$worker.postMessage({
            load: true,
            ace_worker_base: this_path.base + '/' + ace_config.moduleUrl("ace/worker/json")
        });

        self.$worker.postMessage({
            init : true,
            tlns: tlns,
            module: mod,
            classname: classname
        });

        self.callbackId = 1;
        self.callbacks = {};

        self.$worker.onmessage = self.onMessage;
    }
});
    
DEFAULTSTYLE = "text";
DEFAULTERROR = "invalid";
// extends ace_require('ace/tokenizer').Tokenizer
var Parser = Class(ace_require('ace/tokenizer').Tokenizer, {
    constructor: function Parser( grammar, LOC ) {
        var self = this, rxLine;
        // support comments toggle
        self.LC = grammar.Comments.line || null;
        self.BC = grammar.Comments.block ? { start: grammar.Comments.block[0][0], end: grammar.Comments.block[0][1] } : null;
        if ( self.LC )
        {
            if ( T_ARRAY & get_type(self.LC) ) 
                rxLine = self.LC.map( esc_re ).join( "|" );
            
            else 
                rxLine = esc_re( self.LC );
            
            self.rxLine = new RegExp("^(\\s*)(?:" + rxLine + ") ?");
        }
        if ( self.BC )
        {
            self.rxStart = new RegExp("^(\\s*)(?:" + esc_re(self.BC.start) + ")");
            self.rxEnd = new RegExp("(?:" + esc_re(self.BC.end) + ")\\s*$");
        }

        self.DEF = LOC.DEFAULT;
        self.ERR = grammar.Style.error || LOC.ERROR;
        
        // support keyword autocompletion
        self.Keywords = grammar.Keywords.autocomplete || null;
        
        self.Tokens = grammar.Parser || [];
        self.cTokens = grammar.cTokens.length ? grammar.cTokens : null;
        self.Style = grammar.Style;
    }
    
    ,ERR: null
    ,DEF: null
    ,LC: null
    ,BC: null
    ,rxLine: null
    ,rxStart: null
    ,rxEnd: null
    ,Keywords: null
    ,cTokens: null
    ,Tokens: null
    ,Style: null

    ,dispose: function( ) {
        var self = this;
        self.ERR = null;
        self.DEF = null;
        self.LC = null;
        self.BC = null;
        self.rxLine = null;
        self.rxStart = null;
        self.rxEnd = null;
        self.Keywords = null;
        self.cTokens = null;
        self.Tokens = null;
        self.Style = null;
        return self;
    }
    
    ,parse: function( code ) {
        code = code || "";
        var self = this, lines = code.split(newline_re), l = lines.length, i, tokens = [], data;
        data = { state: new State( ), tokens: null };
        
        for (i=0; i<l; i++)
        {
            data = self.getLineTokens(lines[i], data.state, i);
            tokens.push(data.tokens);
        }
        return tokens;
    }
    
    // ACE Tokenizer compatible
    ,getLineTokens: function( line, state, row ) {
        
        var self = this, i, rewind, rewind2, ci,
            tokenizer, interleavedCommentTokens = self.cTokens, tokens = self.Tokens, numTokens = tokens.length, 
            aceTokens, token, type, style, currentError = null,
            stream, stack, DEFAULT = self.DEF, ERROR = self.ERR, Style = self.Style
        ;
        
        aceTokens = []; 
        stream = new Stream( line );
        state = state ? state.clone( 1 ) : new State( 1, 1 );
        state.l = 1+row;
        stack = state.stack;
        token = { type: null, value: "", error: null };
        type = null;
        style = null;
        
        // if EOL tokenizer is left on stack, pop it now
        if ( stream.sol() && !stack.isEmpty() && T_EOL === stack.peek().tt ) 
        {
            stack.pop();
        }
        
        while ( !stream.eol() )
        {
            rewind = 0;
            
            if ( style && style !== token.type )
            {
                if ( token.type ) aceTokens.push( token );
                token = { type: style, value: stream.cur(1), error: currentError };
                currentError = null;
            }
            else if ( token.type )
            {
                token.value += stream.cur(1);
            }
            style = false;
            
            // check for non-space tokenizer before parsing space
            if ( (stack.isEmpty() || (T_NONSPACE !== stack.peek().tt)) && stream.spc() )
            {
                state.t = type = DEFAULT;
                style = DEFAULT;
                continue;
            }
            
            while ( !stack.isEmpty() && !stream.eol() )
            {
                if ( interleavedCommentTokens )
                {
                    ci = 0; rewind2 = 0;
                    while ( ci < interleavedCommentTokens.length )
                    {
                        tokenizer = interleavedCommentTokens[ci++];
                        state.t = type = tokenizer.get(stream, state);
                        if ( false !== type )
                        {
                            style = Style[type] || DEFAULT;
                            rewind2 = 1;
                            break;
                        }
                    }
                    if ( rewind2 )
                    {
                        rewind = 1;
                        break;
                    }
                }
            
                tokenizer = stack.pop();
                state.t = type = tokenizer.get(stream, state);
            
                // match failed
                if ( false === type )
                {
                    // error
                    if ( tokenizer.ERR || tokenizer.REQ )
                    {
                        // empty the stack
                        stack.empty('sID', tokenizer.sID);
                        // skip this character
                        stream.nxt();
                        // generate error
                        state.t = type = ERROR;
                        style = ERROR;
                        currentError = tokenizer.err();
                        rewind = 1;
                        break;
                    }
                    // optional
                    else
                    {
                        style = false;
                        continue;
                    }
                }
                // found token (not empty)
                else if ( true !== type )
                {
                    style = Style[type] || DEFAULT;
                    // action error
                    if ( tokenizer.ACTER )
                    {
                        // empty the stack
                        stack.empty('sID', tokenizer.sID);
                        // generate error
                        state.t = type = ERROR;
                        style = ERROR;
                        currentError = tokenizer.err();
                    }
                    rewind = 1;
                    break;
                }
            }
            
            if ( rewind ) continue;
            if ( stream.eol() ) break;
            
            for (i=0; i<numTokens; i++)
            {
                tokenizer = tokens[i];
                state.t = type = tokenizer.get(stream, state);
                
                // match failed
                if ( false === type )
                {
                    // error
                    if ( tokenizer.ERR || tokenizer.REQ )
                    {
                        // empty the stack
                        stack.empty('sID', tokenizer.sID);
                        // skip this character
                        stream.nxt();
                        // generate error
                        state.t = type = ERROR;
                        style = ERROR;
                        currentError = tokenizer.err();
                        rewind = 1;
                        break;
                    }
                    // optional
                    else
                    {
                        style = false;
                        continue;
                    }
                }
                // found token (not empty)
                else if ( true !== type )
                {
                    style = Style[type] || DEFAULT;
                    // action error
                    if ( tokenizer.ACTER )
                    {
                        // empty the stack
                        stack.empty('sID', tokenizer.sID);
                        // generate error
                        state.t = type = ERROR;
                        style = ERROR;
                        currentError = tokenizer.err();
                    }
                    rewind = 1;
                    break;
                }
            }
            
            if ( rewind ) continue;
            if ( stream.eol() ) break;
            
            // unknown, bypass
            stream.nxt();
            state.t = type = DEFAULT;
            style = DEFAULT;
        }
        
        if ( style && style !== token.type )
        {
            if ( token.type ) aceTokens.push( token );
            aceTokens.push( { type: style, value: stream.cur(1), error: currentError } );
            currentError = null;
        }
        else if ( token.type )
        {
            token.value += stream.cur(1);
            aceTokens.push( token );
        }
        token = null;
        
        //console.log(aceTokens);
        
        // ACE Tokenizer compatible
        return { state: state, tokens: aceTokens };
    }
    
    ,tCL: function( state, session, startRow, endRow ) {
        var self = this,
            doc = session.doc,
            ignoreBlankLines = true,
            shouldRemove = true,
            minIndent = Infinity,
            tabSize = session.getTabSize(),
            insertAtTabStop = false,
            iterate, comment, uncomment, testRemove, shouldInsertSpace
        ;
        
        if ( !self.LC ) 
        {
            if ( !self.BC ) return false;
            
            var lineCommentStart = self.BC.start,
                lineCommentEnd = self.BC.end,
                regexpStart = self.rxStart,
                regexpEnd = self.rxEnd
            ;

            comment = function(line, i) {
                if (testRemove(line, i)) return;
                if (!ignoreBlankLines || /\S/.test(line)) 
                {
                    doc.insertInLine({row: i, column: line.length}, lineCommentEnd);
                    doc.insertInLine({row: i, column: minIndent}, lineCommentStart);
                }
            };

            uncomment = function(line, i) {
                var m;
                if (m = line.match(regexpEnd))
                    doc.removeInLine(i, line.length - m[0].length, line.length);
                if (m = line.match(regexpStart))
                    doc.removeInLine(i, m[1].length, m[0].length);
            };

            testRemove = function(line, row) {
                if (regexpStart.test(line)) return true;
                var tokens = session.getTokens(row);
                for (var i = 0; i < tokens.length; i++) 
                {
                    if (tokens[i].type === 'comment') return true;
                }
            };
        } 
        else 
        {
            var lineCommentStart = (T_ARRAY === get_type(self.LC)) ? self.LC[0] : self.LC,
                regexpLine = self.rxLine,
                commentWithSpace = lineCommentStart + " ",
                minEmptyLength
            ;
            
            insertAtTabStop = session.getUseSoftTabs();

            uncomment = function(line, i) {
                var m = line.match(regexpLine), start, end;
                if (!m) return;
                start = m[1].length; end = m[0].length;
                if (!shouldInsertSpace(line, start, end) && m[0][end - 1] == " ")  end--;
                doc.removeInLine(i, start, end);
            };
            
            comment = function(line, i) {
                if (!ignoreBlankLines || /\S/.test(line)) 
                {
                    if (shouldInsertSpace(line, minIndent, minIndent))
                        doc.insertInLine({row: i, column: minIndent}, commentWithSpace);
                    else
                        doc.insertInLine({row: i, column: minIndent}, lineCommentStart);
                }
            };
            
            testRemove = function(line, i) {
                return regexpLine.test(line);
            };

            shouldInsertSpace = function(line, before, after) {
                var spaces = 0;
                while (before-- && line.charAt(before) == " ") spaces++;
                if (spaces % tabSize != 0) return false;
                spaces = 0;
                while (line.charAt(after++) == " ") spaces++;
                if (tabSize > 2)  return spaces % tabSize != tabSize - 1;
                else  return spaces % tabSize == 0;
                return true;
            };
        }

        iterate = function( applyMethod ) { 
            for (var i=startRow; i<=endRow; i++) 
                applyMethod( doc.getLine(i), i ); 
        };


        minEmptyLength = Infinity;
        
        iterate(function(line, i) {
            var indent = line.search(/\S/);
            if (indent !== -1) 
            {
                if (indent < minIndent)  minIndent = indent;
                if (shouldRemove && !testRemove(line, i)) shouldRemove = false;
            } 
            else if (minEmptyLength > line.length)
            {
                minEmptyLength = line.length;
            }
        });

        if (Infinity == minIndent) 
        {
            minIndent = minEmptyLength;
            ignoreBlankLines = false;
            shouldRemove = false;
        }

        if (insertAtTabStop && minIndent % tabSize != 0)
            minIndent = Math.floor(minIndent / tabSize) * tabSize;

        iterate(shouldRemove ? uncomment : comment);
    }

    ,tBC: function( state, session, range, cursor ) {
        var self = this, 
            TokenIterator = ace_require('ace/token_iterator').TokenIterator,
            Range = ace_require('ace/range').Range,
            comment = self.BC, iterator, token, sel,
            initialRange, startRow, colDiff,
            startRange, endRange, i, row, column,
            comment_re = /comment/
        ;
        if (!comment) return;

        iterator = new TokenIterator(session, cursor.row, cursor.column);
        token = iterator.getCurrentToken();

        sel = session.selection;
        initialRange = sel.toOrientedRange();

        if (token && comment_re.test(token.type)) 
        {
            while (token && comment_re.test(token.type)) 
            {
                i = token.value.indexOf(comment.start);
                if (i != -1) 
                {
                    row = iterator.getCurrentTokenRow();
                    column = iterator.getCurrentTokenColumn() + i;
                    startRange = new Range(row, column, row, column + comment.start.length);
                    break;
                }
                token = iterator.stepBackward();
            };

            iterator = new TokenIterator(session, cursor.row, cursor.column);
            token = iterator.getCurrentToken();
            while (token && comment_re.test(token.type)) 
            {
                i = token.value.indexOf(comment.end);
                if (i != -1) 
                {
                    row = iterator.getCurrentTokenRow();
                    column = iterator.getCurrentTokenColumn() + i;
                    endRange = new Range(row, column, row, column + comment.end.length);
                    break;
                }
                token = iterator.stepForward();
            }
            if (endRange)
                session.remove(endRange);
            if (startRange) 
            {
                session.remove(startRange);
                startRow = startRange.start.row;
                colDiff = -comment.start.length;
            }
        } 
        else 
        {
            colDiff = comment.start.length;
            startRow = range.start.row;
            session.insert(range.end, comment.end);
            session.insert(range.start, comment.start);
        }
        if (initialRange.start.row == startRow)
            initialRange.start.column += colDiff;
        if (initialRange.end.row == startRow)
            initialRange.end.column += colDiff;
        session.selection.fromOrientedRange(initialRange);
    }
    
    // Default indentation, TODO
    ,indent: function( line ) { 
        return line.match(/^\s*/)[0]; 
    }
    
    ,getNextLineIndent: function( state, line, tab ) { 
        return line.match(/^\s*/)[0];
    }
});

//
// workers factories
function worker_init( )
{
    ace.define('ace/grammar_worker', 
        ['require', 'exports', 'module' , 'ace/worker/mirror'], 
        function( require, exports, module ) {
        var WorkerMirror = require("./worker/mirror").Mirror, AceGrammarWorker;
        
        // extends require("./worker/mirror").Mirror
        exports.AceGrammarWorker = AceGrammarWorker = Class(WorkerMirror, {
            constructor: function AceGrammarWorker( sender ) {
                var self = this;
                WorkerMirror.call( self, sender );
                self.setTimeout( 500 );
            }
            
            ,parser: null
            
            
            ,Init: function( grammar, id ) {
                var self = this;
                //console.log('Init called '+id);
                //console.log(grammar);
                self.parser = new Parser( parse_grammar( grammar ), { 
                    DEFAULT: DEFAULTSTYLE, 
                    ERROR: DEFAULTERROR 
                });
                self.sender.callback( 1, id );
            }
            
            
            ,onUpdate: function( ) {
                var self = this, sender = self.sender, parser = self.parser,
                    code, linetokens, tokens, errors,
                    line, lines, t, token, column, errorFound = 0
                ;
                
                if ( !parser )
                {
                    sender.emit( "ok", null );
                    return;
                }
                
                code = self.doc.getValue( );
                if ( !code || !code.length ) 
                {
                    sender.emit( "ok", null );
                    return;
                }
                
                errors = [];
                linetokens = parser.parse( code );
                lines = linetokens.length;
                
                for (line=0; line<lines; line++) 
                {
                    tokens = linetokens[ line ];
                    if ( !tokens || !tokens.length )  continue;
                    
                    column = 0;
                    for (t=0; t<tokens.length; t++)
                    {
                        token = tokens[t];
                        
                        if ( parser.ERR == token.type )
                        {
                            errors.push({
                                row: line,
                                column: column,
                                text: token.error || "Syntax Error",
                                type: "error",
                                raw: token.error || "Syntax Error"
                            });
                            
                            errorFound = 1;
                        }
                        column += token.value.length;
                    }
                }
                
                if ( errorFound )  sender.emit("error", errors);
                else  sender.emit("ok", null);
            }
        });
    });
}
if ( isWorker )
{
    onmessage = function( e ) {
        var msg = e.data;
        if ( msg.load && msg.ace_worker_base ) 
        {        
            // import an ace base worker with needed dependencies ??
            importScripts( msg.ace_worker_base );
            worker_init( );
        } 
    };
}

function get_mode( grammar, DEFAULT ) 
{
    var grammar_copy = clone( grammar ),
        parser = new Parser( parse_grammar( grammar ), { 
        // default return code for skipped or not-styled tokens
        // 'text' should be used in most cases
        DEFAULT: DEFAULT || DEFAULTSTYLE,
        ERROR: DEFAULTERROR
    }), mode;
    
    // ACE-compatible Mode
    mode = {
        /*
        // Maybe needed in later versions..
        
        createModeDelegates: function (mapping) { },

        $delegator: function(method, args, defaultHandler) { },
        */
        
        // the custom Parser/Tokenizer
        getTokenizer: function( ) { 
            return parser; 
        },
        
        supportGrammarAnnotations: false,
        
        //HighlightRules: null,
        //$behaviour: parser.$behaviour || null,

        createWorker: function( session ) {
            
            if ( !mode.supportGrammarAnnotations ) 
            {
                session.clearAnnotations( );
                return null;
            }
            
            // add this worker as an ace custom module
            ace_config.setModuleUrl("ace/grammar_worker", this_path.file);
            var worker = new WorkerClient(['ace'], "ace/grammar_worker", 'AceGrammarWorker');
            worker.attachToDocument( session.getDocument( ) );
            // create a worker for this grammar
            worker.call('Init', [grammar_copy], function( ){
                //console.log('Init returned');
                // hook worker to enable error annotations
                worker.on("error", function( e ) {
                    //console.log(e.data);
                    session.setAnnotations( e.data );
                });

                worker.on("ok", function() {
                    session.clearAnnotations( );
                });
            });
            return worker;
        },
        
        transformAction: function( state, action, editor, session, param ) { 
        },
        
        //lineCommentStart: parser.LC,
        //blockComment: parser.BC,
        toggleCommentLines: function( state, session, startRow, endRow ) { 
            return parser.tCL( state, session, startRow, endRow ); 
        },
        toggleBlockComment: function( state, session, range, cursor ) { 
            return parser.tBC( state, session, range, cursor ); 
        },

        //$getIndent: function(line) { return parser.indent(line); },
        getNextLineIndent: function( state, line, tab ) { 
            return parser.getNextLineIndent( state, line, tab ); 
        },
        checkOutdent: function( state, line, input ) { 
            return false; 
        },
        autoOutdent: function( state, doc, row ) { 
        },

        //$createKeywordList: function() { return parser.$createKeywordList(); },
        getKeywords: function( append ) { 
            var keywords = parser.Keywords;
            if ( !keywords ) return [ ];
            return keywords.map(function(word) {
                var w = word.word, wm = word.meta;
                return {
                    name: w,
                    value: w,
                    score: 1000,
                    meta: wm
                };
            });
        },
        getCompletions: function( state, session, pos, prefix ) {
            var keywords = parser.Keywords;
            if ( !keywords ) return [ ];
            var len = prefix.length;
            return keywords.map(function(word) {
                var w = word.word, wm = word.meta, wl = w.length;
                var match = (wl >= len) && (prefix === w.substr(0, len));
                return {
                    name: w,
                    value: w,
                    score: match ? (1000 - wl) : 0,
                    meta: wm
                };
            });
        }
    };
    return mode;
}


//
//  Ace Grammar main class
/**[DOC_MARKDOWN]
*
* ###AceGrammar Methods
*
* __For node:__
*
* ```javascript
* var AceGrammar = require('build/ace_grammar.js').AceGrammar;
* ```
*
* __For browser:__
*
* ```html
* <script src="build/ace_grammar.js"></script>
* ```
*
[/DOC_MARKDOWN]**/
var AceGrammar = exports['@@MODULE_NAME@@'] = {
    
    VERSION: "@@VERSION@@",
    
    // clone a grammar
    /**[DOC_MARKDOWN]
    * __Method__: `clone`
    *
    * ```javascript
    * cloned = AceGrammar.clone( grammar [, deep=true] );
    * ```
    *
    * Clone (deep) a `grammar`
    *
    * Utility to clone objects efficiently
    [/DOC_MARKDOWN]**/
    clone: clone,
    
    // extend a grammar using another base grammar
    /**[DOC_MARKDOWN]
    * __Method__: `extend`
    *
    * ```javascript
    * extendedgrammar = AceGrammar.extend( grammar, basegrammar1 [, basegrammar2, ..] );
    * ```
    *
    * Extend a `grammar` with `basegrammar1`, `basegrammar2`, etc..
    *
    * This way arbitrary `dialects` and `variations` can be handled more easily
    [/DOC_MARKDOWN]**/
    extend: extend,
    
    // parse a grammar
    /**[DOC_MARKDOWN]
    * __Method__: `parse`
    *
    * ```javascript
    * parsedgrammar = AceGrammar.parse( grammar );
    * ```
    *
    * This is used internally by the `AceGrammar` Class
    * In order to parse a `JSON grammar` to a form suitable to be used by the syntax-highlight parser.
    * However user can use this method to cache a `parsedgrammar` to be used later.
    * Already parsed grammars are NOT re-parsed when passed through the parse method again
    [/DOC_MARKDOWN]**/
    parse: parse_grammar,
    
    // get an ACE-compatible syntax-highlight mode from a grammar
    /**[DOC_MARKDOWN]
    * __Method__: `getMode`
    *
    * ```javascript
    * mode = AceGrammar.getMode( grammar, [, DEFAULT] );
    * ```
    *
    * This is the main method which transforms a `JSON grammar` into an `ACE` syntax-highlight parser.
    * `DEFAULT` is the default return value (`"text"` by default) for things that are skipped or not styled
    * In general there is no need to set this value, unless you need to return something else
    [/DOC_MARKDOWN]**/
    getMode: get_mode
};
