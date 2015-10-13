(function(window,document,undefined){
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
    var $tpl = $('#tpl-grid');
    var $gridsContainer = $('#grids');

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

    function addGrid () {
        var template = $tpl.html();
        Mustache.parse(template);
        var data = {idx: ++gridNb};
        var rendered = Mustache.render(template, data);
        $gridsContainer.append(rendered);
    }

    function getChoosenDate () {        
        var $dateField = $('#tirageDate')
        var choosenDate = $dateField.val();
        var dateArray = choosenDate.split('/');
        dateArray.reverse();
        return dateArray.join('-');
    }

    var displayLotteryNb = function (lotteryNumbers) {
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

    var displayResult = function (playedGrids, lotteryNumbers, hide) {
        var $result = $('#myResults');
        var classnames,grid;
        var content = '';
        for(var gridName in playedGrids){
            grid = playedGrids[gridName];
            content += '<p class="tirage text-center">';
            for(var i=0; i<grid.nbList.length;i++){
                if($.inArray(grid.nbList[i], lotteryNumbers.nbList) >= 0){
                    classnames = 'label label-primary';
                } else {
                    classnames = 'label label-default';
                }
                content += '<span class="' + classnames + '">' + grid.nbList[i] + '</span>';
            }
            for(var j= 0; j<grid.stList.length;j++) {
                if($.inArray(grid.stList[j], lotteryNumbers.stList) >= 0){
                    classnames = 'label label-primary';
                } else {
                    classnames = 'label label-default';
                }
                content += '<span class="' + classnames + '"><i class="glyphicon glyphicon-star"></i> ' + grid.stList[j] + '</span>';
            }
            content += '</p>';
        }
        $result.html(content);

        $('#result').removeClass('hidden');
    }


    var getLotteryNbrs = function (callback) {
        $.ajax({
            url: ws,
            data: param,
            type: 'POST'
        }).done(function(xml){
            var numbers = {            
                nbList : [],
                stList : []
            };

            var xmlNumbers = $(xml).find('Numbers>DrawNumber');
            if(xmlNumbers[0]){
                $.each(xmlNumbers, function (i,el) {
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

    var getPlayedNbrs = function () {
        var grids = {};
        var inputs = $(formSelector).find('input[type=number]');

        $.each(inputs, function(i,el){
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

    var initDate = function () {
        var now = new Date();
        var day = ("0" + now.getDate()).slice(-2);
        var month = ("0" + (now.getMonth() + 1)).slice(-2);
        var today = now.getFullYear()+"-"+(month)+"-"+(day) ;
        $('#tirageDate').val(today);
    }

    initDate();
    addGrid();

    $(formSelector).on('submit',function (event) {
        event.preventDefault();
        notify();
        param.drawDate = getChoosenDate();
        getLotteryNbrs(displayResult);
    });

    $('#addGrid').on('click',function(){
        addGrid();
    });

})(window, document);