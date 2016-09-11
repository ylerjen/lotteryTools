(function(window, document, undefined) {
    'use strict';

    var gridNb = 0;
    var service = "resultsservice.asmx/GetResultsForDate";
    var host = "http://resultsservice.lottery.ie/";
    var param = {
        drawType : "EuroMillions",
        drawDate : "2015-09-22"
    };
    var ws = host+service;
    var formSelector = '#checkNbrs';
    var xmlResponse;
    var $tpl = $('#tpl-grid');
    var $gridsContainer = $('#grids');

    /**
     * Show a notification
     */
    function notify(type, msg) {
        var notify = $('#notify');
        var msgBox = notify.find('.msg');
        if(msg){
            notify.show('fast').addClass('alert-' + type);
            msgBox.html(msg);
        } else {
            notify.hide('fast').removeClass('alert-danger alert-info alert-warning alert-success');
            msgBox.html('');
        }
    }
    /**
     * Add a grid to fill in the played numbers
     */
    function addGrid() {
        var template = $tpl.html();
        Mustache.parse(template);
        var data = {idx: ++gridNb};
        var rendered = Mustache.render(template, data);
        $gridsContainer.append(rendered);
    }
    /**
     * Get the date filled by the user
     */
    function getChoosenDate() {        
        var $dateField = $('#tirageDate')
        var choosenDate = $dateField.val();
        var dateArray = choosenDate.split('/');
        dateArray.reverse();
        return dateArray.join('-');
    }
    /**
     * Show the official numbers
     * @param {object} lotteryNumbers - the numbers of the draw
     */
    var displayLotteryNb = function(lotteryNumbers) {
        var $container = $('#lotteryNb');
        var content = '<p class="tirage text-center">';
        for(var i=0; i<lotteryNumbers.nbList.length;i++){
            content += '<span class="label label-default">' + lotteryNumbers.nbList[i] + '</span>';
        }
        for(var j= 0; j<lotteryNumbers.stList.length;j++) {
            content += '<span class="label label-primary"><i class="glyphicon glyphicon-star"></i> ' + lotteryNumbers.stList[j] + '</span>';
        }
        content += '</p>';
        $container.html(content);
    }
    /**
     * Display the played numbers and highlight the correct one
     * @params {object} playedGrids - the played numbers
     * @params {object} lotteryNumbers - the lottery draw result
     */
    var displayResult = function(playedGrids, lotteryNumbers) {
        var $result = $('#myResults');
        var classnames, grid, $content;
        var result = {grid:0, star:0};
        var $gridsResult = $('<p/>');

        for (var gridName in playedGrids) {
            grid = playedGrids[gridName];
            $content = $('<p/>', {"class": "tirage text-center"});
            $gridsResult.append($content);

            // check the grid numbers
            for (var i = 0, iMax = grid.nbList.length; i < iMax; i++) {
                if ($.inArray(grid.nbList[i], lotteryNumbers.nbList) >= 0) {
                    classnames = 'label label-primary';
                    result.grid++;
                } else {
                    classnames = 'label label-default';
                }
                var $spanNb = $('<span/>', {"class": classnames});
                $spanNb.html(grid.nbList[i]);
                $content.append($spanNb);
            }
            // check the star numbers
            for (var j = 0, jMax = grid.stList.length; j<jMax; j++) {
                if ($.inArray(grid.stList[j], lotteryNumbers.stList) >= 0) {
                    classnames = 'label label-primary';
                    result.star++;
                } else {
                    classnames = 'label label-default';
                }
                var $spanNb = $('<span/>', {"class": classnames});
                var $starIcon = $('<i/>', {"class": "glyphicon glyphicon-star"});
                $spanNb.append($starIcon, grid.stList[j]);
                $content.append($spanNb);
            }
            // Add the winned amount
            var $amount = $('<span/>').html('0 CHF');
            var winKey = result.grid.toString();
            if (result.star) winKey += '+' + result.star;
            var winRecords = $(xmlResponse).find('Structure>Tier');
            for (var k=0, kMax=winRecords.length; k < kMax; k++) {
                var $tier = $(winRecords[k]);
                var recordWinKey = $tier.find("Match").html();
                if (recordWinKey === winKey) {
                    var prize = $tier.find("Prize").html();
                    $amount.html(winKey + ' => ' + prize + " €");
                }
            }
            $content.append($amount);
        }
        $result.html($gridsResult);
        $('#result').removeClass('hidden');
    }

    /**
     * Fetch the lottery numbers and display them
     * @param {function} callback - the function passed to display the played numbers
     */
    var getLotteryNbrs = function(callback) {
        $.ajax({
            url: ws,
            data: param,
            type: 'POST'
        }).done(function(xml) {
            xmlResponse = xml;
            var numbers = {            
                nbList : [],
                stList : []
            };

            var xmlNumbers = $(xml).find('Numbers>DrawNumber');
            if (xmlNumbers[0]) {
                $.each(xmlNumbers, function(i, el) {
                    el = $(el);
                    var typeVal = el.find('Type').text();
                    var numberVal = el.find('Number').text();

                    if ( typeVal === 'Standard') {
                        numbers.nbList.push(numberVal);
                    } else {
                        numbers.stList.push(numberVal);
                    }
                });

                var playedNumbers = getPlayedNbrs();
                displayLotteryNb(numbers);
                callback(playedNumbers,numbers);
            } else {
                notify('danger', 'No draw on ' + param.drawDate);
            }
        });
    };

    /**
     * Get the user numbers from the grids
     * @returns {object} - get my played numbers
     */
    var getPlayedNbrs = function() {
        var grids = {};
        var inputs = $(formSelector).find('input[type=number]');

        $.each(inputs, function(i,el) {
            var inputEl = el.name.split('_');
            grids[inputEl[2]] = grids[inputEl[2]] || {nbList : [],stList : []};
            if(inputEl[0]==='st') {
                grids[inputEl[2]].stList.push(el.value);
            } else {                
                grids[inputEl[2]].nbList.push(el.value);
            }
        });
        return grids;
    }
    /**
     * Init the draw date as today's date
     */
    var initDate = function() {
        var now = new Date();
        var day = ("0" + now.getDate()).slice(-2);
        var month = ("0" + (now.getMonth() + 1)).slice(-2);
        var today = now.getFullYear()+"-"+(month)+"-"+(day) ;
        $('#tirageDate').val(today);
    }

    initDate();
    addGrid();

    $(formSelector).on('submit', function(event) {
        event.preventDefault();
        notify();
        param.drawDate = getChoosenDate();
        getLotteryNbrs(displayResult);
    });

    $('#addGrid').on('click', function() {
        addGrid();
    });

})(window, document);