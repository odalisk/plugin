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

window.keys = [
    'name',
    'summary',
    'category',
    'released_on',
    'last_updated_on',
    'owner',
    'maintainer',
    'license'
];

jQuery.fn.extend({
    getXPath: function( path, first) {
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
            index = this.index() + 1,
            content = this.text();
        
        var arg = new Array();
        var result = '';
        var args = '';
        
        if(first)
        {
            arg.push(".='"+content+"'");
        }
        
        if ( typeof id != 'undefined' )
        {
            arg.push('@id="'+id+'"');
        }
        
        if ( typeof cssclass != 'undefined' )
        {
            arg.push('@class="'+cssclass+'"');
        }
        
        for(var i in arg)
        {
            if(i < 1)
            {
                args = arg[i];
            }
            else
            {
                args += ' and '+arg[i];
            }
        }
        
        if(args != '')
        {
            result = '/' + cur + '['+args+']' + path;
        }
        else
        {
            result = '/' + cur + path;
        }
        
        if(window.odalisk.countElem('/'+result) == 1)
        {
            return '/' + result;
        }
        else
        {
            return this.parent().getXPath(result, false);
        }
        
    }
});

window.odalisk = new odaliskHelper();

function odaliskHelper() {
    
    this.nbQuery = 0;
    this.status = false;
    this.value = true;
    this.currentValue = null;
    this.keyToSelect = null;
    this.queries = new Object();
    
    $("*").click(function() {
        
        if(window.odalisk.status || !window.odalisk.value) {
            window.odalisk.status = false;
            if(window.odalisk.value)
            {
                window.odalisk.addQuery($(this).getXPath('', false),$(this));
            }
            else
            {
                window.odalisk.addKey(window.odalisk.findQueryForKey($(this),'', true),$(this));
                window.odalisk.value = true;
                window.odalisk.status = true;
            }
            
            return false;
        }
    });
    
    this.generateFieldsKeeper = function() {
        this.$fieldsKeeper.html('');
        for(i in window.keys)
        {
            if(this.queries[window.keys[i]])
            {
                statusString = "Fait";
            }
            else
            {
                statusString = "A faire";
            }
            
            
            this.$fieldsKeeper.append($('<tr><td class="labelxpathquery">'+window.keys[i]+'</td><td class="querystatus">'+statusString+'</td><td class="btncolon"><span class="managequery btn btn-mini" data-label="'+window.keys[i]+'" data-id="'+i+'">Selectioner l\'élément</span></td></tr>'));

        }

        $('.managequery').click(function() {
            window.odalisk.selectElem($(this).attr('data-label'));
        });
    }
    
    //Fields keeper
    this.$fieldsKeeper = $('<table id="fields-keeper" class="form-inline"></table>');
    
    this.generateFieldsKeeper();
    
    //switch
    //this.$checkbox = $('<input type="checkbox" class="toSwitch"/>');
    this.$checkbox = $('<span id="helper-status"></span>');
    
    //generate button
    this.$generateButton = $('<div class="btn btn-wide">Generate code</div>');
    
    this.$odaliskHelper = $('<div id="odalisk-helper"><h2>Odalisk Helper</h2></div>');
    
    this.$odaliskDisplay = $('<div id="odalisk-display"></div>');
    this.$odaliskHelper.append(this.$checkbox).append($('<div style="clear:both;"></div>')).append(this.$fieldsKeeper).append(this.$nextQuery).append(this.$generateButton).append(this.$odaliskDisplay);
    
    $("body").append(this.$odaliskHelper);
    
    $('.managequery').click(function() {
        window.odalisk.selectElem($(this).attr('data-label'));
    });
    
    this.$generateButton.click(function() {
        window.odalisk.generateCode();
    });
    
    this.$odaliskHelper.click(function() { return false; });
    
    this.findElem = function(newQuery) {
        var result = document.evaluate( newQuery, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null );
        return result.singleNodeValue;
    }
    
    this.countElem = function(query) {
        var count = document.evaluate('count('+query+')', document, null, XPathResult.ANY_TYPE, null );
        return count.numberValue;
    }
    
    this.addQuery = function(newQuery, elem) {
        if(window.odalisk.countElem(newQuery) > 1)
        {
            this.getKeyForValue(elem);
            return;
        }
        
        this.save(newQuery);
    }
    
    this.addKey = function(query, elem)
    {
        this.save(this.getRelativeQuery(query, elem, ''));
    }
    
    this.selectElem = function(key)
    {
        window.odalisk.status = true;
        window.odalisk.keyToSelect = key;
        $('#helper-status').html('Sélection de l\'attribut '+this.keyToSelect);
        window.odalisk.hide();
    }
    
    this.getRelativeQuery = function(keyQuery, keyElem, result)
    {
        var key = keyElem;
        var value = this.currentValue[0];
        var children = key.parent().children();
        
        var child = this.findChildren(children,value)
        $('*[analyzed="done"]').attr('analyzed','no');
        if(child != 0)
        {
            return keyQuery + '/../' + child;
        }
        else
        {
            return this.getRelativeQuery(keyQuery+'/..',keyElem.parent(),result);
        }
    }
    
    this.findChildren = function(children, value) {
        var arrayIndex = new Array();
        
        for(var i = 0; i < children.length; i++)
        {
            arrayIndex[children[i].nodeName.toLowerCase()] = (arrayIndex[children[i].nodeName.toLowerCase()]) ? arrayIndex[children[i].nodeName.toLowerCase()] + 1 : 1;
            if($(children[i]).attr('analyzed') != 'done')
            {
                $(children[i]).attr('analyzed', 'done');
                if(children[i] === value)
                {
                    
                    return children[i].nodeName.toLowerCase() + '['+arrayIndex[children[i].nodeName.toLowerCase()]+']';
                }
                
                childs = $(children[i]).children();
                
                if(childs.length > 0)
                {
                    var j = i;
                    var deeper = this.findChildren(childs,value);
                    if(deeper != 0)
                    {
                        return children[j].nodeName.toLowerCase() + '['+arrayIndex[children[i].nodeName.toLowerCase()]+']/' + deeper;
                    }
                }
                
            }
        }
        
        return 0;
    }
    
    this.findQueryForKey = function(elem, path, first) {
        // The first time this function is called, path won't be defined.
        if ( typeof path == 'undefined' ) path = '';
        
        // If this element is <html> we've reached the end of the path.
        if ( elem.is('html') )
            return '/html' + path;

        // Add the element name.
        var cur = elem.get(0).nodeName.toLowerCase();

        // Determine the IDs and path.
        var id    = elem.attr('id'),
            cssclass = elem.attr('class'),
            index = elem.index() + 1,
            content = elem.text();
        
        var arg = new Array();
        var result = '';
        var args = '';
        
        if(first)
        {
            arg.push(".='"+content+"'");
        }
        
        if ( typeof id != 'undefined' )
        {
            arg.push('@id="'+id+'"');
        }
        
        if ( typeof cssclass != 'undefined' )
        {
            arg.push('@class="'+cssclass+'"');
        }
        
        for(var i in arg)
        {
            if(i < 1)
            {
                args = arg[i];
            }
            else
            {
                args += ' and '+arg[i];
            }
        }
        
        if(args != '')
        {
            result = '/' + cur + '['+args+']' + path;
        }
        else
        {
            result = '/' + cur + path;
        }
        
        
        if(window.odalisk.countElem(result) == 1)
        {
            return '/' + result;
        }
        else
        {
            return this.findQueryForKey(elem.parent(),result, false);
        }
    }
    
    this.getKeyForValue = function(elem)
    {
        alert('You have to select a key for the value');
        $('#helper-status').html('Sélection d\'une clé pour l\'attribut '+this.keyToSelect);
        window.odalisk.value = false;
        this.currentValue = elem;
    }
    
    this.generateCode = function() {
        var php = "array(";
        var j = 0;
        for(i in this.queries)
        {
            
            var query = this.queries[i];
            if(j != 0) { php += ','; }
            j++;
            php += '\n\t \'' + i + '\' => \'' + this.queries[i] + '\'';
        }
        
        php += '\n);';
        alert(php);
    }
    
    this.generateDisplay = function() {
        var result = '';
        for(i in this.queries)
        {
            var query = this.queries[i];
            result += '<span class="display-key">[' + i + ']</span> ' + $(this.findElem(this.queries[i])).html() + '<br/>';
        }
        $('#odalisk-display').html(result);
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
        //var imgURL = './img/switch.png';
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
    
    
    
    this.save = function(query) {
        console.log(this.keyToSelect);
        this.queries[this.keyToSelect] = query;
        window.odalisk.show();
        this.generateFieldsKeeper();
        this.generateDisplay();
        console.log(this.queries);
        this.status = false;
    }
    
    this.show = function() {
        this.$odaliskHelper.animate({bottom:'10px'});
        this.$odaliskDisplay.animate({bottom:'10px'});
        $('#helper-status').html('');
    }
    
    this.hide = function() {
        var height = this.$odaliskHelper.height();
        this.$odaliskHelper.animate({bottom:($('#odalisk-helper h2').height() - height)+'px'});
        var height = this.$odaliskDisplay.height();
        this.$odaliskDisplay.animate({bottom:(-(height + 20))+'px'});
        
    }
}

console.log(window.odalisk.findElem("//td[.='Department' and @class='package_label']/../td[2]/div[1]"));



