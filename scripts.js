$(document).ready(function() {
    var satoshi = 100000000;
    if (document.referrer.indexOf('cryptodev') !== -1) {alert('It appears you got here from Cryptodev. If you are a member of that site, I recommend leaving - it will be a waste of your time. Why? Because Cryptodev appear to help the community by creating a group of developers. Fine, but what they DON\'T do is help the rest of the community. For example, somebody came onto their IRC and asked about altcoins. They were not a developer. That person was given a hard pushoff, and so was I (whiskers75) for defending that member. Do you want this in a developing community? -whiskers75')}
    var sells = 0;
    var sellbtc = 0;
    var low = 0;
    var mult = 1;
    var high = 0;
    var showall = false;
    var last = 0;
    var tfrom = 0;
    var tto = 0;
    var ticks = 2100;
    var lastarray = [];
    var buys = 0;
    var currencyS = 'USD';
    var symbol = '$';
    var thrown = false;
    var buybtc = 0;
    var hidden = false;
    var DELAY_CAP = 1000;
    var difference = function (a, b) { return Math.abs(a - b) }
    $( document ).on( 'keydown', function ( e ) {
	if (e.keyCode == 82) {
	    tfrom = 0;
	    tto = 0;
	    log('Reset graph!');
	    plot();
	}
        if ( e.keyCode === 27 ) { // ESC
	    if (!hidden) {
		$('.container').hide();
		hidden = true;
                log('HIDING ticker - show/hide with ESC', ' background-color: #fff; color: #000;');
	    }
	    else {
		$('.container').show();
		hidden = false;
		log('Showing ticker');
	    }
        }
    });
    function setCookie(c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
        document.cookie = c_name + "=" + c_value;
    }
    function getCookie(c_name) {
        var c_value = document.cookie;
        var c_start = c_value.indexOf(" " + c_name + "=");
        if (c_start == -1) {
            c_start = c_value.indexOf(c_name + "=");
        }
        if (c_start == -1) {
            c_value = null;
        } else {
            c_start = c_value.indexOf("=", c_start) + 1;
            var c_end = c_value.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = c_value.length;
            }
            c_value = unescape(c_value.substring(c_start, c_end));
        }
        return c_value;
    }
    function plot() {	
        var buya = [];
	var lasta = [];
	var sella = [];
	if (getCookie('ticks')) {
	    ticks = getCookie('ticks');
	}
        var l = lastarray.length - lastarray.length;
	if (l < 0) {
	    ticks = Number(ticks) + Number(l);
	}
	if (tto == 0) {
	    $('.custom').hide();
	    tto = lastarray.length;
	}
	else {
	    $('.custom').show();
	}
        var arrayclone = lastarray.slice(tfrom, tto);
	if (tto == lastarray.length) {
	    tto = 0;
	}
        arrayclone.forEach(function(p, i) {
	    if (p.type == "bid") {
		buya.push([i, p.price]);
	    }
	    else {
		if (p.type == "last") {
		    lasta.push([i, p.price]);
		}
		else {
		    sella.push([i, p.price]);
		}
	    }
	});
        
        $.plot($('#chart'), [{label: 'Bid (buying price)', data: buya, hoverable: true, clickable: true, color: "#090"}, {label: 'Ask (selling price)', data: sella, hoverable: true, clickable: true, color: "#e00"}, {label: 'Average price', data: lasta, hoverable: true, clickable: true, color: "#428bca"}], {selection: {mode: "x"}});
	$('#chart').bind('plotselected', function(event, ranges) {
	    tfrom = ranges.xaxis.from;
	    tto = ranges.xaxis.to;
	    plot();
	});
    }
    function log(msg, styles) {
	console.log(msg);
	if (!styles) {
	    styles = '';
	}
	document.getElementById('console').innerHTML = '<p style="margin: 0 0 0px;' + styles + '"> > ' + msg + '</p>' + document.getElementById('console').innerHTML
    }
    var lastBlockHeight = 0;
    log('Starting kittenco.in v2...');
    $('#hilo').hide();
    if (getCookie('currency') && getCookie('symbol')) {
	currencyS = getCookie('currency');
	symbol = getCookie('symbol');
    }
    if ('WebSocket' in window) {
        log('Websockets are supported! \\o/');
        log('Connecting to MtGox...');
        document.getElementById('btc').innerHTML = "Connecting to MtGox..."
        var connection = new ReconnectingWebSocket('ws://websocket.mtgox.com:80/mtgox?Currency=' + currencyS);
	$('#showall').click(function() {
	    showall = !showall;
	});
	$('#darktheme').click(function() {
	    $('#darktheme').hide();
            $('body').css('background', "url('http://farm9.staticflickr.com/8109/8632995866_16c19e5510_o.jpg')");
	});
	$('#opts').click(function() {
	    if (getCookie('ticks')) {
		ticks = getCookie('ticks');
	    }
	    setCookie('currency', prompt('Enter your currency 3-letter name [USD, GBP, EUR]:', currencyS));
	    if (getCookie('currency') == 'USD') {
		setCookie('symbol', '$');
            }
	    if (getCookie('currency') == 'GBP') {
		setCookie('symbol', '£');
            }
	    if (getCookie('currency') == 'EUR') {
                setCookie('symbol', '€');
            }
            if (getCookie('currency') !== 'EUR' && getCookie('currency') !== 'USD' && getCookie('currency') !== 'GBP') {
		setCookie('symbol', prompt('Unknown currency - please enter its symbol [$, €, etc]:', symbol));
	    }
	    alert('Options set. Press OK to refresh!');
	    window.location.reload(true);
	});
	connection.onopen = function() {
            log('Connected to MtGox!');
	    log('Now streaming price data...');
	    log('Now streaming trades...');
            log('Getting old trades from MtGox');
            $.getJSON('http://data.mtgox.com/api/1/BTC' + currencyS + '/trades/fetch', function(trades1) {
		lastarray = [];
                trades1.return.forEach(function(o) {
                    lastarray.push({price: o.price, type: o.trade_type, date: o.date});
                });
                log('kittenco.in started! Using ' + currencyS + ', fetched ' + lastarray.length + ' prior trades from MtGox!', ' background-color: #4dd710; color: #000;');
                document.getElementById('btc').innerHTML = symbol + Number(lastarray[lastarray.length - 1].price).toFixed(2)
                plot();
            });
	    if (getCookie('ticks')) {
		ticks = getCookie('ticks');
	    }
	    $('#setticks').click(function() {
		var t = prompt('How many ticks should I plot on the graph? (tick = trade):', ticks);
		setCookie('ticks', t);
		ticks = t;
                log('Displaying ' + ticks + ' ticks');
                plot();
	    });
            var unsubDepth = {
		"op" : "unsubscribe",
		"channel" : "24e67e0d-1cad-4cc0-9e7a-f8523ef460fe"
            }
            
	}
	
	connection.onclose = function() {
            console.log('Mt.Gox: Connection closed');
            log('DISCONNECTED.', ' background-color: #e00;');
            document.getElementById('btc').innerHTML = '<span style="color: #e00;">Disconnected</span>';
	    window.location.reload(true);
	}
	
	connection.onerror = function(error) {
            console.log('Mt.Gox: Connection Error: ' + error);
            log('CONNECTION ERROR.', ' background-color: #e00;');
            document.getElementById('btc').innerHTML = '<span style="color: #e00;">Error</span>';
	}
	
	connection.onmessage = function(e) {
            var message = JSON.parse(e.data);
            //console.log(message);
	    if (message.message) {
		log('Server message: ' + message.message);
	    }
            if (message.ticker) {
		if (message.ticker.last.value !== last) {
		    $('#hilo').show();
		    log('Latest price [via ticker]: ' + message.ticker.last.display + ' [high: ' + message.ticker.high.display + ', low: ' + message.ticker.low.display + ', avg: ' + message.ticker.avg.display + ', vol: ' + message.ticker.vol.value + ']');
		    $('#hilo').show();
                    document.getElementById('btc').innerHTML = symbol + (message.ticker.last.value * mult).toFixed(2);
                    document.getElementById('high').innerHTML = "High: " + symbol + Number(message.ticker.high.value).toFixed(2);
                    document.getElementById('low').innerHTML = "Low: " + symbol + Number(message.ticker.low.value).toFixed(2);
                    document.getElementById('avg').innerHTML = "Avg: " + symbol + Number(message.ticker.avg.value).toFixed(2);
                    document.getElementById('vol').innerHTML = "Vol: " + Number(message.ticker.vol.value).toFixed(2) + ' BTC';
                    high = message.ticker.high.value;
                    low = message.ticker.low.value;
		    last = message.ticker.last.value;
		    lastarray.push({price: Number(message.ticker.buy.value), type: "bid"});
                    lastarray.push({price: Number(message.ticker.sell.value), type: "ask"});
                    window.document.title = symbol + (message.ticker.last.value * mult).toFixed(2) + ' [' + (sellbtc > buybtc ? 'FALLING' : 'RISING') + '] - Bitcoin'
		    plot();
		}
	    }
	    if (message.trade) {
		var bitcoins = message.trade.amount_int / satoshi;
		var currency = (message.trade.price * message.trade.amount_int / satoshi);
		var currencyName = message.trade.price_currency;
		if (message.trade.price_currency == currencyS) {
		    if (message.trade.trade_type == "ask") {
			sells++;
			sellbtc = sellbtc + bitcoins;
			$('.well').css("background-color", "#FDA7A7");
		    }
		    else {
			buys++;
			buybtc = buybtc + bitcoins;
			$('.well').css("background-color", "#BCFABF");
		    }
		    
		    document.getElementById('latestrade').innerHTML = ("<p><span class='label label-" + (message.trade.trade_type == 'ask' ? "danger'>SELL" : "success'>BUY") + " of " + bitcoins.toFixed(2) + " BTC at " + message.trade.price +  " " + currencyName + "/BTC [" + sellbtc.toFixed(2) + " BTC sold, " + buybtc.toFixed(2) + " BTC bought so far]</span></p>");
		    $('#latestrade').addClass('animated pulse');
		    setTimeout(function() {
			$('#latestrade').removeClass('animated pulse');
		    }, 1000);
                    log((message.trade.trade_type == 'ask' ? "SELL" : "BUY") + " of " + bitcoins.toFixed(2) + " BTC at " + message.trade.price +  " " + currencyName + "/BTC (<span style='color: #" + ((message.trade.price - last) >= 0 ? "090'>+": "e00'>") + (message.trade.price - last).toFixed(2) + '</span> USD)');
                    if (message.trade.price > high || high == 0) {
			document.getElementById('high').innerHTML = "High: " + symbol + message.trade.price.toFixed(2);
			high = message.trade.price;
                    }
                    if (message.trade.price < low || low == 0) {
			document.getElementById('low').innerHTML = "Low: " + symbol + message.trade.price.toFixed(2);
			low = message.trade.price;
		    }
		    
		    $('#btc').addClass('animated bounce');
		    setTimeout(function() {
                        $('#btc').removeClass('animated bounce');
		    }, 1000);
                    lastarray.push({price: Number(message.trade.price), type: message.trade.trade_type, date: message.trade.date});
		    document.getElementById('btc').innerHTML = symbol + (message.trade.price * mult).toFixed(2);
		    window.document.title = symbol + (message.trade.price* mult).toFixed(2) + ' [' + (sellbtc > buybtc ? 'FALLING' : 'RISING') + '] - Bitcoin'
		    last = message.trade.price;
		    plot();
		}
            }
	}
    } else {
	//WebSockets are not supported.
        document.getElementById('btc').innerHTML = "Unsupported!"
        log('Error: No WebSockets support.', ' background-color: #e00;');
    }
});    
