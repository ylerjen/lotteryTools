(function(window,document,undefined){
    'use strict';

    var service = "resultsservice.asmx/GetResultsForDate";
    var host = "http://resultsservice.lottery.ie/";
    var param = {
            drawType : "EuroMillions",
            drawDate : "2015-09-22"
        };
    var mock = "data/mock.xml";

    var ws = host+service;
    //ws = mock;
    var formSelector = '#checkNbrs';

    function getChoosenDate () {        
        var $dateField = $('#tirageDate')
        var choosenDate = $dateField.val();
        var dateArray = choosenDate.split('/');
        dateArray.reverse();
        return dateArray.join('-');
    }

    var displayLotteryNb = function (lotteryNumbers) {
        var $container = $('#lotteryNb');
        var content = '';
        for(var i=0; i<lotteryNumbers.nbList.length;i++){
            content += '<span class="label label-default">' + lotteryNumbers.nbList[i] + '</span>';
        }
        for(var j= 0; j<lotteryNumbers.stList.length;j++) {
            content += '<span class="label label-default">' + lotteryNumbers.stList[j] + '</span>';
        }
        $container.html(content);
    }

    var displayResult = function (playedNumbers, lotteryNumbers, hide) {
        var $result = $('#myResults');
        var classnames;
        var content = '';
        for(var i=0; i<playedNumbers.nbList.length;i++){
            if($.inArray(playedNumbers.nbList[i], lotteryNumbers.nbList) >= 0){
                classnames = 'label label-primary';
            } else {
                classnames = 'label label-default';
            }
            content += '<span class="' + classnames + '">' + playedNumbers.nbList[i] + '</span>';
        }
        for(var j= 0; j<playedNumbers.stList.length;j++) {
            if($.inArray(playedNumbers.stList[j], lotteryNumbers.stList) >= 0){
                classnames = 'label label-primary';
            } else {
                classnames = 'label label-default';
            }
            content += '<span class="' + classnames + '">' + playedNumbers.stList[j] + '</span>';
        }
        $result.html(content);

        $('#result').removeClass('hidden');
    }


    var getLotteryNbrs = function (callback) {
        console.info(ws);
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
        });
    };

    var getPlayedNbrs = function () {
        var numbers = {            
            nbList : [],
            stList : []
        };
        var inputs = $(formSelector).find('input[type=number]');
        $.each(inputs, function(i,el){
            if(el.name.indexOf('st')>=0){
                numbers.stList.push(el.value);
            } else {                
                numbers.nbList.push(el.value);
            }
        });
        return numbers;
    }

    var initDate = function () {
        var now = new Date();
        var day = ("0" + now.getDate()).slice(-2);
        var month = ("0" + (now.getMonth() + 1)).slice(-2);
        var today = now.getFullYear()+"-"+(month)+"-"+(day) ;
        $('#tirageDate').val(today);
    }

    initDate();

    $(formSelector).on('submit',function (event) {
        event.preventDefault();
        param.drawDate = getChoosenDate();
        getLotteryNbrs(displayResult);
    });

})(window, document);