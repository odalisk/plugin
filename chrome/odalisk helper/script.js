/* Author:
    Julien Sanchez
*/


/*
    jQuery-GetPath v0.01, by Dave Cardwell. (2007-04-27)

    http://davecardwell.co.uk/javascript/jquery/plugins/jquery-getpath/

    Copyright (c)2007 Dave Cardwell. All rights reserved.
    Released under the MIT License.


    Usage:
    var path = $('#foo').getPath();
*/

jQuery.fn.extend({
    getPath: function( path ) {
        
        // The first time this function is called, path won't be defined.
        if ( typeof path == 'undefined' ) path = '';

        // If this element is <html> we've reached the end of the path.
        if ( this.is('html') )
            return 'html' + path;

        // Add the element name.
        var cur = this.get(0).nodeName.toLowerCase();

        // Determine the IDs and path.
        var id    = this.attr('id'),
            cssclass = this.attr('class');


        // Add the #id if there is one.
        
        if($(cur + path).length == 1)
        {
            return cur + path;
        }
        else if ( typeof id != 'undefined' )
        {
            return '#' + id + path;
        }
        else
        {
            // Add any classes.
            if ( typeof cssclass != 'undefined' )
                cur += '.' + cssclass.split(/[\s\n]+/).join('.');
            
            console.log(cur + path);
            
            
            // Recurse up the DOM.
            return this.parent().getPath( ' > ' + cur + path );
        }
    }
});

jQuery.fn.extend({
    getXPath: function( path ) {
        // The first time this function is called, path won't be defined.
        if ( typeof path == 'undefined' ) path = '';

        // If this element is <html> we've reached the end of the path.
        if ( this.is('html') )
            return '/html' + path;

        // Add the element name.
        var cur = this.get(0).nodeName.toLowerCase();

        // Determine the IDs and path.
        var id    = this.attr('id'),
            cssclass = this.attr('class'),
            index = this.index()+1;


        // Add the #id if there is one.
        if ( typeof id != 'undefined' )
        {
            return '//'+cur+'[@id=\''+id+'\']' + path;
        }
        else
        {
            // Add any classes.
            //if ( typeof cssclass != 'undefined' )
                
            cur += '['+index+']';
            
            // Recurse up the DOM.
            
            return this.parent().getXPath( '/' + cur + path );
        }
    }
});

window.odalisk = new odaliskHelper();

function odaliskHelper() {
    
    this.nbQuery = 0;
    this.status = false;
    
    $("*").click(function() {
        
        if(window.odalisk.status) {
            window.odalisk.status = false;
            window.odalisk.addQuery($(this).getXPath());
            window.odalisk.status = true;
            return false;
        }
        //return false;
    });
    
    
    
    
    //Fields keeper
    this.$fieldsKeeper = $('<div id="fields-keeper" class="form-inline">Commencez par ajouter un sélecteur css</div>');
    
    //next query
    this.$nextKey = $('<input class="input-small" placeholder="key" type="text"/>');
    this.$nextKey.keypress(function(e)
    {
        code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13)  {
            window.odalisk.storeQuery();
            e.preventDefault();
        }
    });
    
    this.$nextValue = $('<input class="input-perso2" placeholder="css query" type="text"/>');
    
    this.$nextValue.keypress(function(e)
    {
        code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13)  {
            window.odalisk.storeQuery();
            e.preventDefault();
        }
    });
    
    this.$nextButton = $('<button class="btn">Add</button>');
    
    this.$nextQuery = $('<div class="form-inline" id="next-query"></div>');
    this.$nextQuery.append(this.$nextKey).append(this.$nextValue).append(this.$nextButton);
    
    //switch
    
    this.$checkbox = $('<input type="checkbox" onclick="concole.log(\'coucou\')" class="toSwitch"/>');
    
    
    
    
    //generate button
    this.$generateButton = $('<div class="btn btn-wide">Generate code</div>');
    
    this.$odaliskHelper = $('<div id="odalisk-helper"><h2>Odalisk Helper</h2></div>');
    
    
   
   this.$odaliskDisplay = $('<div id="odalisk-display"></div>');
    this.$odaliskHelper.append(this.$checkbox).append($('<div style="clear:both;"></div>')).append(this.$fieldsKeeper).append(this.$nextQuery).append(this.$generateButton).append(this.$odaliskDisplay);
    
    
    
    $("body").append(this.$odaliskHelper);
    
    
    this.$nextButton.click(function() {
        window.odalisk.storeQuery();
    });
    
    this.$generateButton.click(function() {
        window.odalisk.generateCode();
    });
    
    this.$odaliskHelper.click(function() { return false; });
    
    this.findElem = function(newQuery) {
        var result = document.evaluate( newQuery, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null );
        return result.singleNodeValue;
    }
    
    this.addQuery = function(newQuery) {
        if(this.$nextValue.val() != '')
        {
            var old = $(this.findElem(this.$nextValue.val()));
            old.css({background:old.attr("data-old-bckg")});
        }
        
        this.$nextValue.val(newQuery);
        var targeted = $(this.findElem(newQuery));
        
        targeted.attr("data-old-bckg", targeted.css("background"));
        targeted.css({background:"red"});
        
        this.$nextKey.focus();
    }
    
    this.storeQuery = function() {
        var key = this.$nextKey.val();
        var value = this.$nextValue.val();
        var button = $('<button class="btn btn-danger" data-id="'+this.nbQuery+'">X</button>');
        
        button.click(function() {
           window.odalisk.deleteQuery(parseInt($(this).attr("data-id"))); 
        });
        
        
        var newHtml = $('<div class="odalisk-query"><input class="key input-small" placeholder="key" value="'+key+'" type="text"/><input class="value input-perso1" placeholder="css query" type="text" value="'+value+'"/></div>');
        
        newHtml.append(button);
        
        if(value != "")
        {
            console.log(this);
                $(this.findElem(this.$nextValue.val())).css({background:$(this.findElem(this.$nextValue.val())).attr("data-old-bckg")});
            
            
            this.$fieldsKeeper.append(newHtml);
            this.$nextKey.val('');
            this.$nextValue.val('');
            this.$nextKey.focus();
            
            this.$odaliskDisplay.html(this.getResult());
        }
        else
        {
            alert("La requète ne doit pas être vide");
        }
    }
    
    this.deleteQuery = function(queryId) {
        var queries = $("#fields-keeper").children();
        
        for(var i in queries)
        {
            if(i == queryId)
            {
                
                $(queries[i]).remove();
                this.nbQuery--;
                this.$odaliskDisplay.html(this.getResult());
                
                if(this.nbQuery == 0)
                {
                    this.$fieldsKeeper.text('Commencez par ajouter un sélecteur css');
                }
                return;
            }
        }
        
        this.$odaliskDisplay.html(this.getResult());
    }
    
    this.generateCode = function() {
        var php = "array(";
        var newQueries = $('#fields-keeper').children('.odalisk-query');
        console.log($(newQueries[0]).children('.key'));
        for(i in newQueries.toArray())
        {
            var query = $(newQueries[i]);
            console.log(i);
            if(i != 0) { php += ','; }
            php += '\n\t \'' +query.children('.key').val() + '\' => \'' + query.children('.value').val() + '\'';
        }
        
        php += '\n);';
        alert(php);
    }
    
    this.getResult = function() {
        var result = '';
        var newQueries = $('#fields-keeper').children('.odalisk-query');
        for(i in newQueries.toArray())
        {
            var query = $(newQueries[i]);
            result += '<span class="display-key">[' + query.children('.key').val() + ']</span> ' + $(query.children('.value').val()).html() + '<br/>';
        }
        return result;
    }
    
    this.enableOdaliskHelper = function(elem) {
        window.odalisk.status = (window.odalisk.status) ? 1 : 0 ;
    }
    
    this.initCheckBox = function(chkbx) {
        var newCheckBox = document.createElement("div");
        var newSwitch = document.createElement("div");
        var $newSwitch = $(newSwitch);
        var $newCheckBox = $(newCheckBox);
        $newSwitch.attr("class","newSwitch");
        $newSwitch.attr("draggable",true);
        $newSwitch.attr("ondrag","dragStart(this)");
        
        $newCheckBox.attr("class","newCheckBox");
        $newCheckBox.append(chkbx.clone());
        $newCheckBox.append($(newSwitch));
        var imgURL = chrome.extension.getURL("switch.png");
        $newSwitch.css({ background : 'url("'+imgURL+'") center center' });
        
        
        if(chkbx.attr('checked') != "checked")
        {
            chkbx.parent().parent().addClass("disable");
        }

        $newCheckBox.click(function(){
            
            var checkBox = chkbx;
            var newSwitch = $newCheckBox.children(".newSwitch");
            window.odalisk.status = false;
            if(checkBox.attr('checked') == "checked")
            {
                checkBox.attr('checked', false);
                newSwitch.animate({left:"0px"},100);
                $newCheckBox.css({backgroundColor:"#ddd"});
            }
            else
            {
                checkBox.attr('checked', 'checked');
                newSwitch.animate({left:"14px"},100);
                $newCheckBox.css({backgroundColor:"green"});
                window.odalisk.status = true;
            }

            if(chkbx.children(".toSwitch").attr("onclick") == undefined)
            {
                window.odalisk.enableOdaliskHelper(chkbx);
            }
            else
            { eval(chkbx.children("input[type=\"checkbox\"]").attr("onclick"));
            }

        });

        
        if(chkbx.attr('checked') != "checked")
        {
            $(newSwitch).css({left:"0px"});
            $(newCheckBox).css({backgroundColor:"#ddd"});
        }
        else
        {
            $(newSwitch).css({left:"14px"});
            $(newCheckBox).css({backgroundColor:"#B28C57"});
        }

        if(window.isIE)
        {
            offset = chkbx.offset();
            $(newCheckBox).css({display:"block",position:"absolute",left:offset.left+"px",top:(offset.top+2)+"px"});
        }

        chkbx.replaceWith($(newCheckBox));
    };
        
    this.initCheckBox(this.$checkbox);
}

console.log(window.odalisk.findElem("//table[@id='dataset_contact']/tbody[1]/tr[1]/td[2]/div[1]"));



