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
        if ( typeof id != 'undefined' )
        {
            return '#' + id + path;
        }
        else
        {
            // Add any classes.
            if ( typeof cssclass != 'undefined' )
                cur += '.' + cssclass.split(/[\s\n]+/).join('.');
            
            // Recurse up the DOM.
            return this.parent().getPath( ' > ' + cur + path );
        }
    }
});

window.odalisk = new odaliskHelper();

function odaliskHelper() {
    
    this.nbQuery = 0;
    
    $("*").click(function() {
        window.odalisk.addQuery($(this).getPath());
        return false;
    });
    
    
    //Fields keeper
    this.$fieldsKeeper = $('<div  id="fields-keeper" class="form-inline"></div>');
    
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
    
    //generate button
    this.$generateButton = $('<div class="btn btn-wide">Generate code</div>');
    
    this.$odaliskHelper = $('<div id="odalisk-helper"><h2>Odalisk Helper</h2></div>');
    this.$odaliskHelper.append(this.$fieldsKeeper).append(this.$nextQuery).append(this.$generateButton);
    
    $("body").append(this.$odaliskHelper);
    
    this.$nextButton.click(function() {
        window.odalisk.storeQuery();
    });
    
    this.$generateButton.click(function() {
        window.odalisk.generateCode();
    });
    
    this.$odaliskHelper.click(function() { return false; });
    
    this.addQuery = function(newQuery) {
        
        $(this.$nextValue.val()).css({background:$(this.$nextValue.val()).attr("data-old-bckg")});
        this.$nextValue.val(newQuery);
        $(newQuery).attr("data-old-bckg", $(newQuery).css("background"));
        $(newQuery).css({background:"red"});
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
            this.$fieldsKeeper.append(newHtml);
            this.$nextKey.val('');
            this.$nextValue.val('');
            this.$nextKey.focus();
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
                return;
            }
        }
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
    
}




