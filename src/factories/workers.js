    
    //
    // workers factories
    if ( isWorker )
    {
    
        var window = this;
        onmessage = function(e) {
            var msg = e.data;
            if (msg.load && msg.ace_worker_base) 
            {        
                // import an ace base worker with needed dependencies ??
                importScripts(msg.ace_worker_base);
                Init.call(window);
            } 
        };
    }
    function Init()
    {
        if ( isWorker )
        {
        ace.define('ace/grammar_worker', ['require', 'exports', 'module' , 'ace/worker/mirror'], function(require, exports, module) {

            var AceMirror = require("./worker/mirror").Mirror, AceGrammarWorker;
            exports.AceGrammarWorker = AceGrammarWorker = function AceGrammarWorker( sender ) {
                var ayto = this;
                AceMirror.call(ayto, sender);
                ayto.setTimeout( 500 );
            };
            // extends require("./worker/mirror").Mirror
            AceGrammarWorker[PROTO] = Merge(Extend(AceMirror[PROTO]), {
                constructor: AceGrammarWorker,
                
                parser: null,
                
                
                Init: function( grammar, id ) {
                    var ayto = this;
                    //console.log('Init called '+id);
                    //console.log(grammar);
                    ayto.parser = new Parser( parseGrammar( grammar ), { DEFAULT: DEFAULTSTYLE, ERROR: DEFAULTERROR } );
                    ayto.sender.callback(1, id);
                },
                
                
                onUpdate: function() {
                    var ayto = this, sender = ayto.sender, parser = ayto.parser,
                        code, linetokens, tokens, errors,
                        line, lines, t, token, column, errorFound = 0
                    ;
                    
                    if ( !parser )
                    {
                        sender.emit("ok", null);
                        return;
                    }
                    
                    code = ayto.doc.getValue();
                    if ( !code || !code.length ) 
                    {
                        sender.emit("ok", null);
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
                    
                    if (errorFound)  sender.emit("error", errors);
                    else  sender.emit("ok", null);
                }
            });
        });
        }
    }
  