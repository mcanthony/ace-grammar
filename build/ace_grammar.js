/**
*
*   AceGrammar
*   @version: 0.4.2
*   Transform a grammar specification in JSON format,
*   into an ACE syntax-highlight parser mode
*
*   https://github.com/foo123/ace-grammar
*
**/
!function ( root, name, deps, factory ) {

    //
    // export the module in a umd-style generic way
    deps = ( deps ) ? [].concat(deps) : [];
    var i, dl = deps.length, ids = new Array( dl ), paths = new Array( dl ), mods = new Array( dl );
    for (i=0; i<dl; i++) { ids[i] = deps[i][0]; paths[i] = deps[i][1]; }
    
    // node, commonjs, etc..
    if ( 'object' == typeof( module ) && module.exports ) 
    {
        if ( 'undefined' == typeof(module.exports[name]) )
        {
            for (i=0; i<dl; i++)
                mods[i] = module.exports[ ids[i] ] || require( paths[i] )[ ids[i] ];
            module.exports[ name ] = factory.apply(root, mods );
        }
    }
    
    // amd, etc..
    else if ( 'function' == typeof( define ) && define.amd ) 
    {
        define( ['exports'].concat( paths ), function( exports ) {
            if ( 'undefined' == typeof(exports[name]) )
            {
                var args = Array.prototype.slice.call( arguments, 1 );
                for (var i=0, dl=args.length; i<dl; i++)
                    mods[i] = exports[ ids[i] ];
                exports[name] = factory.apply(root, mods );
            }
        });
    }
    
    // browsers, other loaders, etc..
    else 
    {
        if ( 'undefined' == typeof(root[name]) )
        {
            for (i=0; i<dl; i++)
                mods[i] = root[ ids[i] ];
            root[name] = factory.apply(root, mods );
        }
    }


}( this, "AceGrammar",
    // dependencies
    [
        ["Classy", "./classy"],  ["RegExAnalyzer", "./regexanalyzer"]
    ], 
    // module factory
    function( Classy, RegexAnalyzer, undef ) {
    
    var Class = Classy.Class;
    var VERSION = "0.4.2";
        
    //
    // parser types
    var    
        DEFAULTTYPE,
        
        //
        // javascript variable types
        T_NUM = 2,
        T_BOOL = 4,
        T_STR = 8,
        T_CHAR= 9,
        T_REGEX = 16,
        T_ARRAY = 32,
        T_OBJ = 64,
        T_NULL = 128,
        T_UNDEF = 256,
        T_UNKNOWN = 512,
        
        //
        // matcher types
        T_SIMPLEMATCHER = 32,
        T_CHARMATCHER = 33,
        T_STRMATCHER = 34,
        T_REGEXMATCHER = 36,
        T_EOLMATCHER = 40,
        T_DUMMYMATCHER = 48,
        T_COMPOSITEMATCHER = 64,
        T_BLOCKMATCHER = 128,
        
        //
        // token types
        T_OPTIONAL = 1,
        T_REQUIRED = 2,
        T_ERROR = 4,
        T_DEFAULT = 8,
        T_SIMPLE = 16,
        T_ESCBLOCK = 32,
        T_BLOCK = 64,
        T_COMMENT = 65,
        T_EITHER = 128,
        T_ALL = 256,
        T_ZEROORONE = 512,
        T_ZEROORMORE = 1024,
        T_ONEORMORE = 2048,
        T_GROUP = 4096,
        T_NGRAM = 8192,
        
        //
        // tokenizer types
        groupTypes = {
            "ONEOF" : T_EITHER, "EITHER" : T_EITHER, "ALL" : T_ALL, "ALLOF" : T_ALL, "ZEROORONE" : T_ZEROORONE, "ZEROORMORE" : T_ZEROORMORE, "ONEORMORE" : T_ONEORMORE
        },
        
        tokenTypes = {
            "BLOCK" : T_BLOCK, "COMMENT" : T_COMMENT, "ESCAPED-BLOCK" : T_ESCBLOCK, "SIMPLE" : T_SIMPLE, "GROUP" : T_GROUP, "NGRAM" : T_NGRAM, "N-GRAM" : T_NGRAM
        }
    ;
    
    var slice = Array.prototype.slice, splice = Array.prototype.splice, concat = Array.prototype.concat, 
        hasKey = Object.prototype.hasOwnProperty, Str = Object.prototype.toString,
        
        get_type = function(v) {
            var type_of = typeof(v), to_string = Str.call(v);
            
            if ('number' == type_of || v instanceof Number)  return T_NUM;
            
            else if (true === v || false === v)  return T_BOOL;
            
            else if (v && ('string' == type_of || v instanceof String))  return (1 == v.length) ? T_CHAR : T_STR;
            
            else if (v && ("[object RegExp]" == to_string || v instanceof RegExp))  return T_REGEX;
            
            else if (v && ("[object Array]" == to_string || v instanceof Array))  return T_ARRAY;
            
            else if (v && "[object Object]" == to_string)  return T_OBJ;
            
            else if (null === v)  return T_NULL;
            
            else if (undef === v)  return T_UNDEF;
            
            // unkown type
            return T_UNKNOWN;
        },
        
        make_array = function(a, force) {
            return ( force || T_ARRAY != get_type( a ) ) ? [ a ] : a;
        },
        
        make_array_2 = function(a, force) {
            a = make_array( a, force );
            if ( force || T_ARRAY != get_type( a[0] ) ) a = [ a ]; // array of arrays
            return a;
        },
        
        clone = function(o) {
            var T = get_type( o ), T2;
            
            if (T_OBJ != T && T_ARRAY != T) return o;
            
            var co = {}, k;
            for (k in o) 
            {
                if ( hasKey.call(o, k) ) 
                { 
                    T2 = get_type( o[k] );
                    
                    if (T_OBJ == T2)  co[k] = clone(o[k]);
                    
                    else if (T_ARRAY == T2)  co[k] = o[k].slice();
                    
                    else  co[k] = o[k]; 
                }
            }
            return co;
        },
        
        extend = function() {
            var args = slice.call(arguments), argslen = args.length;
            
            if ( argslen<1 ) return null;
            else if ( argslen<2 ) return clone( args[0] );
            
            var o1 = args.shift(), o2, o = clone(o1), i, k, T; 
            argslen--;            
            
            for (i=0; i<argslen; i++)
            {
                o2 = args.shift();
                if ( !o2 ) continue;
                
                for (k in o2) 
                { 
                    if ( hasKey.call(o2, k) )
                    {
                        if ( hasKey.call(o1, k) ) 
                        { 
                            T = get_type( o1[k] );
                            
                            if ( (T_OBJ & ~T_STR) & T)  o[k] = extend( o1[k], o2[k] );
                            
                            //else if (T_ARRAY == T)  o[k] = o1[k].slice();
                            
                            //else  o[k] = o1[k];
                        }
                        else
                        {
                            o[k] = clone( o2[k] );
                        }
                    }
                }
            }
            return o;
        },
        
        ESC = /([\-\.\*\+\?\^\$\{\}\(\)\|\[\]\/\\])/g,
        
        byLength = function(a, b) { return b.length - a.length },
        
        hasPrefix = function(s, id) {
            return (
                (T_STR & get_type(id)) && (T_STR & get_type(s)) && id.length &&
                id.length <= s.length && id == s.substr(0, id.length)
            );
        },
        
        getRegexp = function(r, rid, parsedRegexes)  {
            if ( !r || (T_NUM == get_type(r)) ) return r;
            
            var l = (rid) ? (rid.length||0) : 0;
            
            if ( l && rid == r.substr(0, l) ) 
            {
                var regexID = "^(" + r.substr(l) + ")", regex, peek, analyzer;
                
                if ( !parsedRegexes[ regexID ] )
                {
                    regex = new RegExp( regexID );
                    analyzer = new RegexAnalyzer( regex ).analyze();
                    peek = analyzer.getPeekChars();
                    if ( !Object.keys(peek.peek).length )  peek.peek = null;
                    if ( !Object.keys(peek.negativepeek).length )  peek.negativepeek = null;
                    
                    // shared, light-weight
                    parsedRegexes[ regexID ] = [ regex, peek ];
                }
                
                return parsedRegexes[ regexID ];
            }
            else
            {
                return r;
            }
        },
        
        getCombinedRegexp = function(tokens, boundary)  {
            var peek = { }, i, l, b = "";
            if ( T_STR == get_type(boundary)) b = boundary;
            for (i=0, l=tokens.length; i<l; i++) 
            {
                peek[ tokens[i].charAt(0) ] = 1;
                tokens[i] = tokens[i].replace(ESC, '\\$1');
            }
            return [ new RegExp("^(" + tokens.sort( byLength ).join( "|" ) + ")"+b), { peek: peek, negativepeek: null }, 1 ];
        }
    ;
    
    //
    // Stream Class
    var
        // a wrapper-class to manipulate a string as a stream, based on Codemirror's StringStream
        ParserStream = Class({
            
            constructor: function( line ) {
                this.string = (line) ? ''+line : '';
                this.start = this.pos = 0;
                this.stream = null;
            },
            
            stream: null,
            string: '',
            start: 0,
            pos: 0,
            
            fromStream: function( stream ) {
                this.stream = stream;
                this.string = ''+stream.string;
                this.start = stream.start;
                this.pos = stream.pos;
                return this;
            },
            
            toString: function() { return this.string; },
            
            // abbreviations used for optimal minification
            
            // string start?
            sol: function( ) { 
                return 0 == this.pos; 
            },
            
            // string ended?
            eol: function( ) { 
                return this.pos >= this.string.length; 
            },
            
            // char match
            chr : function(pattern, eat) {
                eat = (false !== eat);
                var ch = this.string.charAt(this.pos) || '';
                
                if (pattern == ch) 
                {
                    if (eat) 
                    {
                        this.pos += 1;
                        if ( this.stream )
                            this.stream.pos = this.pos;
                    }
                    return ch;
                }
                return false;
            },
            
            // string match
            str : function(pattern, chars, eat) {
                eat = (false !== eat);
                var pos = this.pos, ch = this.string.charAt(pos);
                
                if ( chars.peek[ ch ] )
                {
                    var len = pattern.length, str = this.string.substr(pos, len);
                    if (pattern == str) 
                    {
                        if (eat) 
                        {
                            this.pos += len;
                            if ( this.stream )
                                this.stream.pos = this.pos;
                        }
                        return str;
                    }
                }
                return false;
            },
            
            // regex match
            rex : function(pattern, chars, eat, group) {
                eat = (false !== eat);
                group = group || 0;
                var pos = this.pos, ch = this.string.charAt(pos);
                
                if ( ( chars.peek && chars.peek[ ch ] ) || ( chars.negativepeek && !chars.negativepeek[ ch ] ) )
                {
                    var match = this.string.slice(pos).match(pattern);
                    if (!match || match.index > 0) return false;
                    if (eat)
                    {
                        this.pos += match[group].length;
                        if ( this.stream )
                            this.stream.pos = this.pos;
                    }
                    return match;
                }
                return false;
            },
            
            // general pattern match
            mch: function(pattern, eat, caseInsensitive, group) {
                if (typeof pattern == "string") 
                {
                    var cased = function(str) {return caseInsensitive ? str.toLowerCase() : str;};
                    var substr = this.string.substr(this.pos, pattern.length);
                    if (cased(substr) == cased(pattern)) 
                    {
                        if (eat !== false) this.pos += pattern.length;
                        return true;
                    }
                } 
                else 
                {
                    group = group || 0;
                    var match = this.string.slice(this.pos).match(pattern);
                    if (match && match.index > 0) return null;
                    if (match && eat !== false) this.pos += match[group].length;
                    return match;
                }
            },
            
            // skip to end
            end: function() {
                this.pos = this.string.length;
                if ( this.stream )
                    this.stream.pos = this.pos;
                return this;
            },
            
            // peek next char
            pk: function( ) { 
                return this.string.charAt(this.pos); 
            },
            
            // get next char
            nxt: function( ) {
                if (this.pos < this.string.length)
                {
                    var ch = this.string.charAt(this.pos++);
                    if ( this.stream )
                        this.stream.pos = this.pos;
                    return ch;
                }
            },
            
            // back-up n steps
            bck: function( n ) {
                this.pos -= n;
                if ( this.stream )
                    this.stream.pos = this.pos;
                return this;
            },
            
            // back-track to pos
            bck2: function( pos ) {
                this.pos = pos;
                if ( this.stream )
                    this.stream.pos = this.pos;
                return this;
            },
            
            // eat space
            spc: function( ) {
                var start = this.pos, pos = this.pos;
                while (/[\s\u00a0]/.test(this.string.charAt(pos))) ++pos;
                this.pos = pos;
                if ( this.stream )
                    this.stream.pos = this.pos;
                return this.pos > start;
            },
            
            // current stream selection
            cur: function( ) {
                return this.string.slice(this.start, this.pos);
            },
            
            // move/shift stream
            sft: function( ) {
                this.start = this.pos;
                return this;
            }
        })
    ;
        
    //
    // ParserState Class
    var
        ParserState = Class({
            
            constructor: function( id ) {
                this.id = id || 0;
                this.stack = [];
                this.t = T_DEFAULT;
                this.inBlock = null;
                this.endBlock = null;
            },
            
            id: 0,
            stack: null,
            t: null,
            inBlock: null,
            endBlock: null,
            
            clone: function() {
                var copy = new this.$class();
                copy.id = this.id;
                copy.stack = this.stack.slice();
                copy.inBlock = this.inBlock;
                copy.endBlock = this.endBlock;
                copy.t = this.t;
                return copy;
            },
            
            // used mostly for ACE which treats states as strings
            toString: function() {
                //return "_" + this.id + "_" + (this.inBlock);
                return "_" + this.id + "_" + (this.t) + "_" + (this.inBlock);
            }
        })
    ;
        
    //
    // matcher factories
    var 
        // get a fast customized matcher for < pattern >
        CharMatcher = Class({
            
            constructor : function(name, pattern, key) {
                this.type = T_CHARMATCHER;
                this.name = name;
                this.t = pattern;
                this.k = key || 0;
                this.p = null;
            },
            
            // token type
            type: null,
            // token name
            name: null,
            // token pattern
            t: null,
            // key
            k: 0,
            // peek chars
            p: null,
            
            toString : function() {
                var s = '[';
                s += 'Matcher: ' + this.name;
                s += ', Type: ' + this.type;
                s += ', Pattern: ' + ((this.t) ? this.t.toString() : null);
                s += ']';
                return s;
            },
            
            get : function(stream, eat) {
                var match;    
                if ( match = stream.chr(this.t, eat) )
                    return [ this.k, match ];
                return false;
            }
        }),
        
        StrMatcher = Class(CharMatcher, {
            
            constructor : function(name, pattern, key) {
                this.$super('constructor', name, pattern, key);
                this.type = T_STRMATCHER;
                this.p = { peek: {}, negativepeek: null };
                this.p.peek[ '' + pattern.charAt(0) ] = 1;
            },
            
            get : function(stream, eat) {
                var match;    
                if ( match = stream.str(this.t, this.p, eat) )
                    return [ this.k, match ];
                return false;
            }
        }),
        
        RegexMatcher = Class(CharMatcher, {
            
            constructor : function(name, pattern, key) {
                this.$super('constructor', name, pattern, key);
                this.type = T_REGEXMATCHER;
                this.t = pattern[ 0 ];
                this.p = pattern[ 1 ];
                this.g = pattern[ 2 ] || 0;
            },
            
            g : 0,
            
            get : function(stream, eat) {
                var match;    
                if ( match = stream.rex(this.t, this.p, eat, this.g) )
                    return [ this.k, match ];
                return false;
            }
        }),
        
        EolMatcher = Class(CharMatcher, {
            
            constructor : function(name, pattern, key) {
                this.$super('constructor', name, pattern, key);
                this.type = T_EOLMATCHER;
                this.t = null;
            },
            
            get : function(stream, eat) { 
                if (false !== eat) stream.end(); // skipToEnd
                return [ this.k, "" ];
            }
        }),
        
        CompositeMatcher = Class(CharMatcher, {
            
            constructor : function(name, matchers, useOwnKey) {
                this.type = T_COMPOSITEMATCHER;
                this.name = name;
                this.ms = matchers;
                this.ownKey = (false!==useOwnKey);
            },
            
            // group of matchers
            ms : null,
            ownKey : true,
            
            get : function(stream, eat) {
                var i, m, matchers = this.ms, l = matchers.length;
                for (i=0; i<l; i++)
                {
                    // each one is a custom matcher in its own
                    m = matchers[i].get(stream, eat);
                    if ( m ) return ( this.ownKey ) ? [ i, m[1] ] : m;
                }
                return false;
            }
        }),
        
        BlockMatcher = Class(CharMatcher, {
            
            constructor : function(name, start, end) {
                this.type = T_BLOCKMATCHER;
                this.name = name;
                this.s = new CompositeMatcher(this.name + '_StartMatcher', start, false);
                this.t = this.s.t || null;
                this.e = end;
            },
            
            // start block matcher
            s : null,
            // end block matcher
            e : null,
            
            get : function(stream, eat) {
                    
                var token = this.s.get(stream, eat);
                
                if ( token )
                {
                    var endMatcher = this.e[ token[0] ];
                    
                    // regex given, get the matched group for the ending of this block
                    if ( T_NUM == get_type( endMatcher ) )
                    {
                        // the regex is wrapped in an additional group, 
                        // add 1 to the requested regex group transparently
                        endMatcher = new StrMatcher( this.name + '_EndMatcher', token[1][ endMatcher+1 ] );
                    }
                    
                    return endMatcher;
                }
                
                return false;
            }
        }),
        
        getSimpleMatcher = function(tokenID, pattern, key, parsedMatchers) {
            // get a fast customized matcher for < pattern >
            
            key = key || 0;
            
            var name = tokenID + '_SimpleMatcher', matcher;
            
            var T = get_type( pattern );
            
            if ( T_NUM == T ) return pattern;
            
            if ( !parsedMatchers[ name ] )
            {
                //if ( T_BOOL == T ) matcher = new DummyMatcher(name, pattern, key);
                
                /*else */if ( T_NULL == T ) matcher = new EolMatcher(name, pattern, key);
                
                else if ( T_CHAR == T ) matcher = new CharMatcher(name, pattern, key);
                
                else if ( T_STR == T ) matcher = new StrMatcher(name, pattern, key);
                
                else if ( /*T_REGEX*/T_ARRAY == T ) matcher = new RegexMatcher(name, pattern, key);
                
                // unknown
                else matcher = pattern;
                
                parsedMatchers[ name ] = matcher;
            }
            
            return parsedMatchers[ name ];
        },
        
        getCompositeMatcher = function(tokenID, tokens, RegExpID, isRegExpGroup, parsedRegexes, parsedMatchers) {
            
            var tmp, i, l, l2, array_of_arrays = false, has_regexs = false;
            
            var name = tokenID + '_CompoMatcher', matcher;
            
            if ( !parsedMatchers[ name ] )
            {
                tmp = make_array( tokens );
                l = tmp.length;
                
                if ( isRegExpGroup )
                {   
                    l2 = (l>>1) + 1;
                    // check if tokens can be combined in one regular expression
                    // if they do not contain sub-arrays or regular expressions
                    for (i=0; i<=l2; i++)
                    {
                        if ( (T_ARRAY == get_type( tmp[i] )) || (T_ARRAY == get_type( tmp[l-1-i] )) ) 
                        {
                            array_of_arrays = true;
                            break;
                        }
                        else if ( hasPrefix( tmp[i], RegExpID ) || hasPrefix( tmp[l-1-i], RegExpID ) )
                        {
                            has_regexs = true;
                            break;
                        }
                    }
                }
                
                if ( isRegExpGroup && !(array_of_arrays || has_regexs) )
                {   
                    matcher = getSimpleMatcher( name, getCombinedRegexp( tmp, isRegExpGroup ), 0, parsedMatchers );
                }
                else
                {
                    for (i=0; i<l; i++)
                    {
                        if ( T_ARRAY == get_type( tmp[i] ) )
                            tmp[i] = getCompositeMatcher( name + '_' + i, tmp[i], RegExpID, isRegExpGroup, parsedRegexes, parsedMatchers );
                        else
                            tmp[i] = getSimpleMatcher( name + '_' + i, getRegexp( tmp[i], RegExpID, parsedRegexes ), i, parsedMatchers );
                    }
                    
                    matcher = (tmp.length > 1) ? new CompositeMatcher( name, tmp ) : tmp[0];
                }
                
                parsedMatchers[ name ] = matcher;
            }
            
            return parsedMatchers[ name ];
        },
        
        getBlockMatcher = function(tokenID, tokens, RegExpID, parsedRegexes, parsedMatchers) {
            var tmp, i, l, start, end, t1, t2;
            
            var name = tokenID + '_BlockMatcher';
            
            if ( !parsedMatchers[ name ] )
            {
                // build start/end mappings
                start=[]; end=[];
                tmp = make_array_2(tokens); // array of arrays
                for (i=0, l=tmp.length; i<l; i++)
                {
                    t1 = getSimpleMatcher( name + '_0_' + i, getRegexp( tmp[i][0], RegExpID, parsedRegexes ), i, parsedMatchers );
                    t2 = (tmp[i].length>1) ? getSimpleMatcher( name + '_1_' + i, getRegexp( tmp[i][1], RegExpID, parsedRegexes ), i, parsedMatchers ) : t1;
                    start.push( t1 );  end.push( t2 );
                }
                
                parsedMatchers[ name ] = new BlockMatcher(name, start, end);
            }
            
            return parsedMatchers[ name ];
        }
    ;
    
    //
    // tokenizer factories
    var
        SimpleTokenizer = Class({
            
            constructor : function(name, token, type, style) {
                this.type = type || null;
                this.name = name || null;
                this.t = token || null;
                this.v = style || null;
            },
            
            name : null,
            type : null,
            t : null,
            v : null,
            isRequired : false,
            ERROR : false,
            streamPos : null,
            stackPos : null,
            actionBefore : null,
            actionAfter : null,
            
            toString : function() {
                var s = '[';
                s += 'Tokenizer: ' + this.name;
                s += ', Type: ' + this.type;
                s += ', Token: ' + ((this.t) ? this.t.toString() : null);
                s += ']';
                return s;
            },
            
            required : function(bool) { 
                this.isRequired = (bool) ? true : false;
                return this;
            },
            
            push : function(stack, token, i) {
                if ( this.stackPos )
                    stack.splice( this.stackPos+(i||0), 0, token );
                else
                    stack.push( token );
                return this;
            },
            
            clone : function(/* variable args here.. */) {
                
                var t, i, args = slice.call(arguments), argslen = args.length;
                
                t = new this.$class();
                t.type = this.type;
                t.name = this.name;
                t.t = this.t;
                t.v = this.v;
                t.isRequired = this.isRequired;
                t.ERROR = this.ERROR;
                t.streamPos = this.streamPos;
                t.stackPos = this.stackPos;
                t.actionBefore = this.actionBefore;
                t.actionAfter = this.actionAfter;
                
                for (i=0; i<argslen; i++)   
                    t[ args[i] ] = this[ args[i] ];
                
                return t;
            },
            
            get : function( stream, state, LOCALS ) {
                
                if ( this.t.get(stream) )
                {
                    state.t = this.type;
                    return this.v;
                }
                return false;
            }
        }),
        
        BlockTokenizer = Class(SimpleTokenizer, {
            
            constructor : function(name, token, type, style, multiline) {
                this.$super('constructor', name, token, type, style);
                this.multiline = (false!==multiline);
                this.e = null;
            },    
            
            multiline : false,
            e : null,
            
            get : function( stream, state, LOCALS ) {
            
                var ended = false, found = false;
                
                if ( state.inBlock == this.name )
                {
                    found = true;
                    this.e = state.endBlock;
                }    
                else if ( !state.inBlock && (this.e = this.t.get(stream)) )
                {
                    found = true;
                    state.inBlock = this.name;
                    state.endBlock = this.e;
                }    
                
                if ( found )
                {
                    this.stackPos = state.stack.length;
                    ended = this.e.get(stream);
                    
                    while ( !ended && !stream.eol() ) 
                    {
                        if ( this.e.get(stream) ) 
                        {
                            ended = true;
                            break;
                        }
                        else  
                        {
                            stream.nxt();
                        }
                    }
                    
                    ended = ( ended || ( !this.multiline && stream.eol() ) );
                    
                    if ( !ended )
                    {
                        this.push( state.stack, this );
                    }
                    else
                    {
                        state.inBlock = null;
                        state.endBlock = null;
                    }
                    
                    state.t = this.type;
                    return this.v;
                }
                
                state.inBlock = null;
                state.endBlock = null;
                return false;
            }
        }),
                
        EscBlockTokenizer = Class(BlockTokenizer, {
            
            constructor : function(name, token, type, style, escape, multiline) {
                this.$super('constructor', name, token, type, style);
                this.esc = escape || "\\";
                this.multiline = multiline || false;
                this.e = null;
            },    
            
            esc : "\\",
            
            get : function( stream, state, LOCALS ) {
            
                var next = "", ended = false, found = false, isEscaped = false;
                
                if ( state.inBlock == this.name )
                {
                    found = true;
                    this.e = state.endBlock;
                }    
                else if ( !state.inBlock && (this.e = this.t.get(stream)) )
                {
                    found = true;
                    state.inBlock = this.name;
                    state.endBlock = this.e;
                }    
                
                if ( found )
                {
                    this.stackPos = state.stack.length;
                    ended = this.e.get(stream);
                    
                    while ( !ended && !stream.eol() ) 
                    {
                        if ( !isEscaped && this.e.get(stream) ) 
                        {
                            ended = true; 
                            break;
                        }
                        else  
                        {
                            next = stream.nxt();
                        }
                        isEscaped = !isEscaped && next == this.esc;
                    }
                    
                    ended = ended || !(isEscaped && this.multiline);
                    
                    if ( !ended )
                    {
                        this.push( state.stack, this );
                    }
                    else
                    {
                        state.inBlock = null;
                        state.endBlock = null;
                    }
                    
                    state.t = this.type;
                    return this.v;
                }
                
                state.inBlock = null;
                state.endBlock = null;
                return false;
            }
        }),
                
        CompositeTokenizer = Class(SimpleTokenizer, {
            
            constructor : function(name, type) {
                this.$super('constructor', name, type);
                this.ts = null;
            },
            
            ts : null,
            
            makeToks : function( tokens ) {
                if ( tokens )
                {
                    this.ts = make_array( tokens );
                    this.t = this.ts[0];
                }
                return this;
            }
        }),
        
        ZeroOrOneTokens = Class(CompositeTokenizer, {
                
            constructor : function( name, tokens ) {
                this.type = T_ZEROORONE;
                this.name = name || null;
                if (tokens) this.makeToks( tokens );
            },
            
            get : function( stream, state, LOCALS ) {
                
                // this is optional
                this.isRequired = false;
                this.ERROR = false;
                this.streamPos = stream.pos;
                var tok = this.t;
                var style = tok.get(stream, state);
                
                if ( tok.ERROR ) stream.bck2( this.streamPos );
                
                return style;
            }
        }),
        
        ZeroOrMoreTokens = Class(CompositeTokenizer, {
                
            constructor : function( name, tokens ) {
                this.type = T_ZEROORMORE;
                this.name = name || null;
                if (tokens) this.makeToks( tokens );
            },
            
            get : function( stream, state, LOCALS ) {
            
                var i, token, style, tokens = this.ts, n = tokens.length, tokensErr = 0, ret = false;
                
                // this is optional
                this.isRequired = false;
                this.ERROR = false;
                this.streamPos = stream.pos;
                this.stackPos = state.stack.length;
                
                for (i=0; i<n; i++)
                {
                    token = tokens[i];
                    style = token.get(stream, state, LOCALS);
                    
                    if ( false !== style )
                    {
                        // push it to the stack for more
                        this.push( state.stack, this );
                        return style;
                    }
                    else if ( token.ERROR )
                    {
                        tokensErr++;
                        stream.bck2( this.streamPos );
                    }
                }
                
                //this.ERROR = (n == tokensErr) ? true : false;
                return false;
            }
        }),
        
        OneOrMoreTokens = Class(CompositeTokenizer, {
                
            constructor : function( name, tokens ) {
                this.type = T_ONEORMORE;
                this.name = name || null;
                if (tokens) this.makeToks( tokens );
                this.foundOne = false;
            },
            
            foundOne : false,
            
            get : function( stream, state, LOCALS ) {
        
                var style, token, i, tokens = this.ts, n = tokens.length, tokensRequired = 0, tokensErr = 0;
                
                this.isRequired = !this.foundOne;
                this.ERROR = false;
                this.streamPos = stream.pos;
                this.stackPos = state.stack.length;
                
                for (i=0; i<n; i++)
                {
                    token = tokens[i];
                    style = token.get(stream, state, LOCALS);
                    
                    tokensRequired += (token.isRequired) ? 1 : 0;
                    
                    if ( false !== style )
                    {
                        this.foundOne = true;
                        this.isRequired = false;
                        this.ERROR = false;
                        // push it to the stack for more
                        this.push( state.stack, this.clone("ts", "foundOne") );
                        this.foundOne = false;
                        
                        return style;
                    }
                    else if ( token.ERROR )
                    {
                        tokensErr++;
                        stream.bck2( this.streamPos );
                    }
                }
                
                this.ERROR = (!this.foundOne /*|| n == tokensErr*/) ? true : false;
                return false;
            }
        }),
        
        EitherTokens = Class(CompositeTokenizer, {
                
            constructor : function( name, tokens ) {
                this.type = T_EITHER;
                this.name = name || null;
                if (tokens) this.makeToks( tokens );
            },
            
            get : function( stream, state, LOCALS ) {
            
                var style, token, i, tokens = this.ts, n = tokens.length, tokensRequired = 0, tokensErr = 0;
                
                this.isRequired = true;
                this.ERROR = false;
                this.streamPos = stream.pos;
                
                for (i=0; i<n; i++)
                {
                    token = tokens[i];
                    style = token.get(stream, state, LOCALS);
                    
                    tokensRequired += (token.isRequired) ? 1 : 0;
                    
                    if ( false !== style )
                    {
                        return style;
                    }
                    else if ( token.ERROR )
                    {
                        tokensErr++;
                        stream.bck2( this.streamPos );
                    }
                }
                
                this.isRequired = (tokensRequired > 0) ? true : false;
                this.ERROR = (n == tokensErr && tokensRequired > 0) ? true : false;
                return false;
            }
        }),
                
        AllTokens = Class(CompositeTokenizer, {
                
            constructor : function( name, tokens ) {
                this.type = T_ALL;
                this.name = name || null;
                if (tokens) this.makeToks( tokens );
            },
            
            get : function( stream, state, LOCALS ) {
                
                var token, style, tokens = this.ts, n = tokens.length, ret = false;
                
                this.isRequired = true;
                this.ERROR = false;
                this.streamPos = stream.pos;
                this.stackPos = state.stack.length;
                
                
                token = tokens[ 0 ];
                style = token.required(true).get(stream, state, LOCALS);
                
                if ( false !== style )
                {
                    this.stackPos = state.stack.length;
                    for (var i=n-1; i>0; i--)
                        this.push( state.stack, tokens[i].required(true), n-i );
                    
                    ret = style;
                    
                }
                else if ( token.ERROR )
                {
                    this.ERROR = true;
                    stream.bck2( this.streamPos );
                }
                else if ( token.isRequired )
                {
                    this.ERROR = true;
                }
                
                return ret;
            }
        }),
                
        NGramTokenizer = Class(CompositeTokenizer, {
                
            constructor : function( name, tokens ) {
                this.type = T_NGRAM;
                this.name = name || null;
                if (tokens) this.makeToks( tokens );
            },
            
            get : function( stream, state, LOCALS ) {
                
                var token, style, tokens = this.ts, n = tokens.length, ret = false;
                
                this.isRequired = false;
                this.ERROR = false;
                this.streamPos = stream.pos;
                this.stackPos = state.stack.length;
                
                
                token = tokens[ 0 ];
                style = token.required(false).get(stream, state, LOCALS);
                
                if ( false !== style )
                {
                    this.stackPos = state.stack.length;
                    for (var i=n-1; i>0; i--)
                        this.push( state.stack, tokens[i].required(true), n-i );
                    
                    ret = style;
                }
                else if ( token.ERROR )
                {
                    //this.ERROR = true;
                    stream.bck2( this.streamPos );
                }
                
                return ret;
            }
        }),
                
        getComments = function(tok, comments) {
            // build start/end mappings
            var tmp = make_array_2(tok.tokens.slice()); // array of arrays
            var start, end, lead;
            for (i=0, l=tmp.length; i<l; i++)
            {
                start = tmp[i][0];
                end = (tmp[i].length>1) ? tmp[i][1] : tmp[i][0];
                lead = (tmp[i].length>2) ? tmp[i][2] : "";
                
                if ( null === end )
                {
                    // line comment
                    comments.line = comments.line || [];
                    comments.line.push( start );
                }
                else
                {
                    // block comment
                    comments.block = comments.block || [];
                    comments.block.push( [start, end, lead] );
                }
            }
        },
        
        getTokenizer = function(tokenID, RegExpID, RegExpGroups, Lex, Syntax, Style, parsedRegexes, parsedMatchers, parsedTokens, comments) {
            
            var tok, token = null, type, matchType, tokens, action;
            
            if ( !parsedTokens[ tokenID ] )
            {
                tok = Lex[ tokenID ] || Syntax[ tokenID ] || null;
                
                if ( tok )
                {
                    type = tok.type || "simple";
                    type = tokenTypes[ type.toUpperCase() ];
                    action = tok.action || null;
                    
                    if ( T_BLOCK == type || T_COMMENT == type )
                    {
                        if ( T_COMMENT == type ) getComments(tok, comments);
                            
                        token = new BlockTokenizer( 
                                    tokenID,
                                    getBlockMatcher( tokenID, tok.tokens.slice(), RegExpID, parsedRegexes, parsedMatchers ), 
                                    type, 
                                    Style[ tokenID ] || DEFAULTTYPE,
                                    tok.multiline
                                );
                    }
                    
                    else if ( T_ESCBLOCK == type )
                    {
                        token = new EscBlockTokenizer( 
                                    tokenID,
                                    getBlockMatcher( tokenID, tok.tokens.slice(), RegExpID, parsedRegexes, parsedMatchers ), 
                                    type, 
                                    Style[ tokenID ] || DEFAULTTYPE,
                                    tok.escape || "\\",
                                    tok.multiline || false
                                );
                    }
                    
                    else if ( T_SIMPLE == type )
                    {
                        token = new SimpleTokenizer( 
                                    tokenID,
                                    getCompositeMatcher( tokenID, tok.tokens.slice(), RegExpID, RegExpGroups[ tokenID ], parsedRegexes, parsedMatchers ), 
                                    type, 
                                    Style[ tokenID ] || DEFAULTTYPE
                                );
                    }
                    
                    else if ( T_GROUP == type )
                    {
                        matchType = groupTypes[ tok.match.toUpperCase() ]; 
                        tokens = make_array( tok.tokens ).slice();
                        
                        for (var i=0, l=tokens.length; i<l; i++)
                            tokens[i] = getTokenizer(tokens[i], RegExpID, RegExpGroups, Lex, Syntax, Style, parsedRegexes, parsedMatchers, parsedTokens, comments);
                        
                        if (T_ZEROORONE == matchType) 
                            token = new ZeroOrOneTokens(tokenID, tokens);
                        
                        else if (T_ZEROORMORE == matchType) 
                            token = new ZeroOrMoreTokens(tokenID, tokens);
                        
                        else if (T_ONEORMORE == matchType) 
                            token = new OneOrMoreTokens(tokenID, tokens);
                        
                        else if (T_EITHER == matchType) 
                            token = new EitherTokens(tokenID, tokens);
                        
                        else //if (T_ALL == matchType)
                            token = new AllTokens(tokenID, tokens);
                    }
                    
                    else if ( T_NGRAM == type )
                    {
                        // get n-gram tokenizer
                        token = make_array_2( make_array( tok.tokens ).slice() ).slice(); // array of arrays
                        
                        for (var i=0, l=token.length; i<l; i++)
                        {
                            // get tokenizers for each ngram part
                            var ngram = token[i];
                            
                            for (var j=0, l2=ngram.length; j<l2; j++)
                                ngram[j] = getTokenizer( ngram[j], RegExpID, RegExpGroups, Lex, Syntax, Style, parsedRegexes, parsedMatchers, parsedTokens, comments );
                            
                            // get a tokenizer for whole ngram
                            token[i] = new NGramTokenizer( tokenID + '_NGRAM_' + i, ngram );
                        }
                    }
                }
                parsedTokens[ tokenID ] = token;
            }
            
            return parsedTokens[ tokenID ];
        }
    ;
      
    //
    // parser factories
    var
        AceParser = Class({
            
            constructor: function(grammar, LOCALS) {
                this.LOC = LOCALS;
                this.Grammar = grammar;
                this.Comments = grammar.Comments || {};
                this.Tokens = grammar.Parser || [];
                this.DEF = this.LOC.DEFAULT;
                this.ERR = (grammar.Style && grammar.Style.error) ? grammar.Style.error : this.LOC.ERROR;
            },
            
            LOC: null,
            ERR: null,
            DEF: null,
            Grammar: null,
            Comments: null,
            Tokens: null,
            
            // ACE Tokenizer compatible
            getLineTokens: function(line, state, row) {
                
                var i, rewind, 
                    t, tokens = this.Tokens, numTokens = tokens.length, 
                    aceTokens, token, type, 
                    stream, stack,
                    LOC = this.LOC,
                    DEFAULT = this.DEF,
                    ERROR = this.ERR
                ;
                
                aceTokens = []; 
                stream = new ParserStream( line );
                state = state || new ParserState( );
                state = state.clone();
                state.id = 1+row;
                stack = state.stack;
                token = { type: null, value: "" };
                type = null;
                
                while ( !stream.eol() )
                {
                    rewind = false;
                    
                    if ( type && type !== token.type )
                    {
                        if ( token.type ) aceTokens.push( token );
                        token = { type: type, value: stream.cur() };
                        stream.sft();
                    }
                    else if ( token.type )
                    {
                        token.value += stream.cur();
                        stream.sft();
                    }
                    
                    if ( stream.spc() ) 
                    {
                        state.t = T_DEFAULT;
                        type = DEFAULT;
                        continue;
                    }
                    
                    while ( stack.length && !stream.eol() )
                    {
                        t = stack.pop();
                        type = t.get(stream, state, LOC);
                        
                        // match failed
                        if ( false === type )
                        {
                            // error
                            if ( t.ERROR || t.isRequired )
                            {
                                // empty the stack
                                stack.length = 0;
                                // skip this character
                                stream.nxt();
                                // generate error
                                state.t = T_ERROR;
                                type = ERROR;
                                rewind = true;
                                break;
                            }
                            // optional
                            else
                            {
                                continue;
                            }
                        }
                        // found token
                        else
                        {
                            rewind = true;
                            break;
                        }
                    }
                    
                    if ( rewind ) continue;
                    if ( stream.eol() ) break;
                    
                    for (i=0; i<numTokens; i++)
                    {
                        t = tokens[i];
                        type = t.get(stream, state, LOC);
                        
                        // match failed
                        if ( false === type )
                        {
                            // error
                            if ( t.ERROR || t.isRequired )
                            {
                                // empty the stack
                                stack.length = 0;
                                // skip this character
                                stream.nxt();
                                // generate error
                                state.t = T_ERROR;
                                type = ERROR;
                                rewind = true;
                                break;
                            }
                            // optional
                            else
                            {
                                continue;
                            }
                        }
                        // found token
                        else
                        {
                            rewind = true;
                            break;
                        }
                    }
                    
                    if ( rewind ) continue;
                    if ( stream.eol() ) break;
                    
                    // unknown, bypass
                    stream.nxt();
                    state.t = T_DEFAULT;
                    type = DEFAULT;
                }
                
                if ( type && type !== token.type )
                {
                    if ( token.type ) aceTokens.push( token );
                    aceTokens.push( { type: type, value: stream.cur() } );
                }
                else if ( token.type )
                {
                    token.value += stream.cur();
                    aceTokens.push( token );
                }
                token = { type: null, value: "" };
                //console.log(aceTokens);
                
                // ACE Tokenizer compatible
                return { state: state, tokens: aceTokens };
            },
            
            $getIndent : function(line) { return line.match(/^\s*/)[0];  },
            
            // TODO
            getNextLineIndent : function(state, line, tab) { return line.match(/^\s*/)[0]; },
            
            getKeywords : function( append ) { return []; },
            
            $createKeywordList : function() { return []; },

            // TODO
            getCompletions : function(state, session, pos, prefix) { return []; }
        }),
        
        getParser = function(grammar, LOCALS) {
            return new AceParser(grammar, LOCALS);
        },
        
        getAceMode = function(parser) {
            
            // ACE-compatible Mode
            return {
                // the custom Parser/Tokenizer
                getTokenizer: function() { return parser; },
                
                lineCommentStart: (parser.Comments.line) ? parser.Comments.line[0] : null,
                blockComment: (parser.Comments.block) ? { start: parser.Comments.block[0][0], end: parser.Comments.block[0][1] } : null,

                toggleCommentLines: function(state, session, startRow, endRow) { return false; },

                toggleBlockComment: function(state, session, range, cursor) {  },

                getNextLineIndent: function(state, line, tab) { return parser.getNextLineIndent(state, line, tab); },

                checkOutdent: function(state, line, input) { return false; },

                autoOutdent: function(state, doc, row) { },

                $getIndent: function(line) { return parser.$getIndent(line); },

                getKeywords: function( append ) { return parser.getKeywords(append); },
                
                $createKeywordList: function() { return parser.$createKeywordList(); },

                getCompletions: function(state, session, pos, prefix) { return parser.getCompletions(state, session, pos, prefix); },
                
                /*
                *   Maybe needed in later versions..
                */
                
                HighlightRules: null,
                $behaviour: null, //new Behaviour(),

                createWorker: function(session) { return null; },

                createModeDelegates: function (mapping) { },

                $delegator: function(method, args, defaultHandler) { },

                transformAction: function(state, action, editor, session, param) { }
                
            };
        }
    ;
      
    var 
        //
        // default grammar settings
        defaultGrammar = {
            
            // prefix ID for regular expressions used in the grammar
            "RegExpID" : null,
            
            // lists of (simple/string) tokens to be grouped into one regular expression,
            // else matched one by one, 
            // this is usefull for speed fine-tuning the parser
            "RegExpGroups" : null,
            
            //
            // Style model
            "Style" : {
                
                // lang token type  -> ACE (style) tag
                "error":                "invalid"
            },

            //
            // Lexical model
            "Lex" : null,
            
            //
            // Syntax model and context-specific rules (optional)
            "Syntax" : null,
            
            // what to parse and in what order
            "Parser" : null
        },
        
        parse = function(grammar) {
            var RegExpID, RegExpGroups, tokens, numTokens, _tokens, 
                Style, Lex, Syntax, t, tokenID, token, tok,
                parsedRegexes = {}, parsedMatchers = {}, parsedTokens = {}, comments = {};
            
            // grammar is parsed, return it
            // avoid reparsing already parsed grammars
            if ( grammar.__parsed )  return grammar;
            
            grammar = extend(grammar, defaultGrammar);
            
            RegExpID = grammar.RegExpID || null;
            grammar.RegExpID = null;
            delete grammar.RegExpID;
            
            RegExpGroups = grammar.RegExpGroups || {};
            grammar.RegExpGroups = null;
            delete grammar.RegExpGroups;
            
            Lex = grammar.Lex || {};
            grammar.Lex = null;
            delete grammar.Lex;
            
            Syntax = grammar.Syntax || {};
            grammar.Syntax = null;
            delete grammar.Syntax;
            
            Style = grammar.Style || {};
            
            _tokens = grammar.Parser || [];
            numTokens = _tokens.length;
            tokens = [];
            
            
            // build tokens
            for (t=0; t<numTokens; t++)
            {
                tokenID = _tokens[ t ];
                
                token = getTokenizer( tokenID, RegExpID, RegExpGroups, Lex, Syntax, Style, parsedRegexes, parsedMatchers, parsedTokens, comments ) || null;
                
                if ( token )
                {
                    if ( T_ARRAY == get_type( token ) )
                        tokens = tokens.concat( token );
                    
                    else
                        tokens.push( token );
                }
            }
            
            grammar.Parser = tokens;
            grammar.Style = Style;
            grammar.Comments = comments;
            
            // this grammar is parsed
            grammar.__parsed = true;
            
            return grammar;
        }
    ;
    
    //
    //  Ace Grammar main class
    /**[DOC_MARKDOWN]
    *
    * ###AceGrammar Methods
    *
    * __For node with dependencies:__
    *
    * ```javascript
    * AceGrammar = require('build/ace_grammar.js').AceGrammar;
    * // or
    * AceGrammar = require('build/ace_grammar.bundle.js').AceGrammar;
    * ```
    *
    * __For browser with dependencies:__
    *
    * ```html
    * <script src="../build/ace_grammar.bundle.js"></script>
    * <!-- or -->
    * <script src="../build/classy.js"></script>
    * <script src="../build/regexanalyzer.js"></script>
    * <script src="../build/ace_grammar.js"></script>
    * <script> // AceGrammar.getMode(..) , etc.. </script>
    * ```
    *
    [/DOC_MARKDOWN]**/
    var self = {
        
        VERSION : VERSION,
        
        // extend a grammar using another base grammar
        /**[DOC_MARKDOWN]
        * __Method__: *extend*
        *
        * ```javascript
        * extendedgrammar = AceGrammar.extend(grammar, basegrammar1 [, basegrammar2, ..]);
        * ```
        *
        * Extend a grammar with basegrammar1, basegrammar2, etc..
        *
        * This way arbitrary dialects and variations can be handled more easily
        [/DOC_MARKDOWN]**/
        extend : extend,
        
        // parse a grammar
        /**[DOC_MARKDOWN]
        * __Method__: *parse*
        *
        * ```javascript
        * parsedgrammar = AceGrammar.parse(grammar);
        * ```
        *
        * This is used internally by the AceGrammar Class
        * In order to parse a JSON grammar to a form suitable to be used by the syntax-highlight parser.
        * However user can use this method to cache a parsedgrammar to be used later.
        * Already parsed grammars are NOT re-parsed when passed through the parse method again
        [/DOC_MARKDOWN]**/
        parse : parse,
        
        // get an ACE-compatible syntax-highlight mode from a grammar
        /**[DOC_MARKDOWN]
        * __Method__: *getMode*
        *
        * ```javascript
        * mode = AceGrammar.getMode(grammar, [, DEFAULT]);
        * ```
        *
        * This is the main method which transforms a JSON grammar into an ACE syntax-highlight parser.
        * DEFAULT is the default return value ("text" by default) for things that are skipped or not styled
        * In general there is no need to set this value, unlees you need to return something else
        [/DOC_MARKDOWN]**/
        getMode : function(grammar, DEFAULT) {
            
            DEFAULTTYPE = "text";
            
            // build the grammar
            grammar = parse( grammar );
            
            //console.log(grammar);
            
            var 
                LOCALS = { 
                    // default return code, when no match or empty found
                    // 'text' should be used in most cases
                    DEFAULT: DEFAULT || DEFAULTTYPE,
                    ERROR: defaultGrammar.Style.error
                }
            ;
            
            return getAceMode( getParser( grammar, LOCALS ) );
        }
    };
    
    // export it
    return self;
});