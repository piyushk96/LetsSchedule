/**
 * Created by piyush on 9/9/16.
 */
var lastTodoId = 0;   ///id of last todo in list for giving new id to new todo
var currentTodoId = 0;
var currentTodoList = 'list0';
var requestPath = 'inbox';
var oldTodo;
var tooltipName = '', topPosition = 0, leftPosition = 0;
var menuAddReminderSelected = false;
var editWindowOpened = false;
var clientId = 0;



function getClientId() {
    var userId = localStorage.getItem('todolistClient');
    if(userId == '')
        window.location.href = '/login';
    else
        return userId;
}

function addTodo(newTodo) {
    $.post('/todos/addtodo', newTodo, function (data, status) {
        console.log('Todo add status: ' + status);
        $('#closeButton').trigger('click');
        var top = $('#contentInner').scrollTop();
        $(window).trigger('hashchange');
        $('#contentInner').scrollTop(top);
        lastTodoId++;
    });
}

function showTodos(title) {
    $.get('/todos/fetchtodos?title=' + title + '&id=' + clientId, function(data, status) {
        var source = $('#contentTemplate').html();
        var template = Handlebars.compile(source);
        $('#contentInner').html('');
        if(requestPath == 'next7days'){
            var day = (new Date).getDay();
            for(var i=0; i < 7; i++, day++){
                var context = {
                    todolistId: 'list' + i,
                    headingDate: data[i].headingDate,
                    headingTimestamp: data[i].headingTimestamp,
                    todolist: data[i].list
                };
                if(i == 0)
                    context.heading = 'today';
                else if(i == 1)
                    context.heading = 'tomorrow';
                else{
                    var week = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    context.heading = week[day];
                }
                $('#contentInner').append(template(context));
                if(day == 6)
                    day = -1;
            }
        }
        else {
            var context = {
                todolistId: 'list0',
                headingDate: data.headingDate,
                headingTimestamp: data.headingTimestamp,
                heading: title,
                todolist: data.list
            };
            $('#contentInner').html(template(context));
            if (title == 'completed') {
                if ((data.list).length == 0)
                    $('#noCompletedTodoLeft').show();
                else
                    $('#deleteAllCompleted').show();

                $('.task').css('text-decoration', 'line-through');
                $('.contentAddTodoButton').hide();
            }
        }
    });
}

function showAddTodoWindow() {
    $('#addTodoWindow').show();
    $('#newTodo').val('').focus();
    $('#schedule').val('');
    $('#schedule').attr('data-selecteddate','');
    $('#page').addClass('makeBlur');
    $('#schedule').hide();
    $('#newTodo').css('border-radius', '5px');
    $(window).scrollTop(0);
}

function getRequestPath() {
    var hash = location.hash;
    var hashArr = hash.split('/');
    return hashArr[hashArr.length-1];
}

function showTooltip(tooltipName, top, left) {
    $('#tooltip').html(tooltipName);
    $('#tooltip').css({
        'display': 'block',
        'top': top,
        'left': left
    });
}

function showOptionsMenu(top, left) {
    var el = $('#optionsMenu');
    el.addClass('optionDisplayed');
    var extraHeight = el.height() + top - $(window).height();
    if(extraHeight > 0)
        top = top - extraHeight - 50;
    var extraWidth = el.width() + left - $(window).width();
    if(extraWidth > 0)
        left = left - extraWidth - 50;
    $('#optionsMenu').css({
        'top': top,
        'left': left
    });
}

function showOptionsMenuItems() {
    $('.optionsMenuItem').css('display', 'flex');
    if(requestPath == 'completed'){
        $('.separator, .editTodo, .addReminder, .dueToday, .dueTomorrow').css('display', 'none');
    }

    if($('#' + currentTodoId + ' .checkBox').attr('data-done') == 'true')
        $('.markCompleted').hide();
    else
        $('.markNotCompleted').hide();

    if($('#' + currentTodoId + ' .star').attr('data-important') == 'true')
        $('.markImportant').hide();
    else
        $('.markNotImportant').hide();

}

///////////////////////////////  Hashchange////////////////////////////////////////
$(window).on('hashchange',function () {
    clientId = getClientId();
    $('#pageNotFound').hide();
    $('#noCompletedTodoLeft').hide();
    $('#headerAddTodoButton').show();
    requestPath = getRequestPath();
    switch (requestPath){
        case 'inbox':
        case 'today':
        case 'tomorrow':
        case 'completed':
        case 'important':
        case 'next7days':showTodos(requestPath);
            break;
        default: $('#contentInner').html("");
            $('#pageNotFound').show();
            $('#headerAddTodoButton').hide();
            break;
    }
});

$(document).ready(function () {
    $("#calendarContainer").load("../calendar.html", function () {
        fillCalendar(month, year);
    });

    $.get('/todos/findmaxtodoid', function (data, status) {
        lastTodoId = data[0].id;
        if(location.hash == '#/inbox')
            $(window).trigger('hashchange');
        else
            window.location.href = '/todos/#/inbox';
    });

    clientId = getClientId();
    $.get('/todos/emailandusername?clientId=' + clientId, function (data, status) {
        $('#username').html(data[0].username);
        $('#emailId').html(data[0].email);
    });

    /////////////////////////////Keypress Events/////////////////////////////////
    $(document).keyup(function(e) {
        if (e.keyCode == 27) {
            $('#optionsMenu').removeClass('optionDisplayed');
            if($('#addTodoWindow').css('display') == 'block')
                $('#page').toggleClass('makeBlur');
            $('#addTodoWindow').hide();
            $('#calendarContainer').hide();
            $('#accountMenu').hide();
        }
        else if(e.keyCode == 13 && $('#addTodoWindow').css('display') == 'block')
            $('#addTask').trigger('click');
        else if(e.keyCode == 13 && editWindowOpened == true)
            $('#saveEditedTodo').trigger('click');
    });


    ////////////////////////////Click Events//////////////////////////////////////

    $('#contentInner').on('click tap', '.todoListItem', function () {
        currentTodoId = $(this).attr('id');
    });

    $('#contentInner').on('contextmenu', '.todoListItem', function (e) {  //Right Click Event
        currentTodoId = $(this).attr('id');
        e.preventDefault();
        topPosition = event.pageY + 30;
        showOptionsMenu(topPosition, leftPosition);
        showOptionsMenuItems();
    });

    $('#page').on('click tap', function (el) {      ////options menu open close
        $('#tooltip').hide();
        if(el.target.className == 'optionsDotIcon' || el.target.classList[1] == 'fa-ellipsis-v'){
            topPosition = event.clientY + 30;
            showOptionsMenu(topPosition, '70%');
            showOptionsMenuItems();
        }
        else if(el.target.className == 'userAvatar'){}
        else{
            $('#optionsMenu').removeClass('optionDisplayed');
            $('#calendarContainer').hide();
            $('#accountMenu').hide();
        }
    });

    $('.userAvatar').on('click tap', function () {
        var topPos = $(this).position().top;
        var leftPos = $(this).position().left;
        $('#accountMenu').show();
        if($(this).attr('id') == 'headerAvatarButton')
            leftPos -= $('#accountMenu').width();
        $('#accountMenu').css({
            'top': topPos + 70,
            'left': leftPos + 40
        })
    });

    $('#signout').on('click tap', function () {
        $('#accountMenu').hide();
        console.log(localStorage.getItem('todolistClient'));
        localStorage.setItem('todolistClient', '');
        window.location.href = '/login';
    });

    $('.navLinks').on('click tap', function () {
        $('.navLinks').removeClass('clicked');
        $(this).addClass('clicked');
        $('nav').removeClass('menuDisplayed');
    });

    $('#printList').on('click tap', function () {
        window.print();
    });

    $('.optionsMenuItem').on('click tap', function () {
        if( $(this).attr('class') != "optionsMenuItem addReminder")
            $('#optionsMenu').removeClass('optionDisplayed');
    });

    $('#menu').on('click tap', function () {
        $('nav').toggleClass('menuDisplayed');
    });

    $('#closeButton').on('click tap', function () {
        $('#addTodoWindow').hide();
        $('#page').removeClass('makeBlur');
        $('#calendarContainer').hide();
    });

    $('#addTask').on('click tap', function () {
        var task = $('#newTodo').val();
        var date = $('#schedule').attr('data-selecteddate');
        var important = false;
        if(requestPath == 'important')
            important = true;
        if(task != '') {
            let newTodo = {
                id: lastTodoId + 1,
                task: task,
                date: date,
                important: important,
                clientId: clientId
            };
            addTodo(newTodo);
        }
        else{
            $("#newTodo").css("border","2px solid red");
            setTimeout(function () {
                $("#newTodo").css("border","1px solid black");
            },1000);
        }
    });

    $('#addReminder').on('click tap', function () {
        $('#schedule').show();
        $('#newTodo').css('border-radius', '5px 0 0 5px');
        $('#schedule').trigger('click');
    });

    $('#schedule').on('click tap', function () {
        $('#calendarContainer').show();
        var top = $('#schedule').offset().top;
        var left = $('#schedule').offset().left;
        $('#calendarContainer').css({
            'top': top + 40,
            'left': left - $('#calendarContainer').width()/2
        });
    });

    $('#headerAddTodoButton').on('click tap', function () {
        $('#addReminder').show();
    });

    $("#contentInner").on('click tap', '.checkBox', function () {
        currentTodoId = $(this).parent().parent().attr('id');
        var done;
        if( $(this).attr('data-done') == 'false')
            done = false;
        else
            done = true;
        $.get('/todos/modifydonestatus?id=' + currentTodoId + '&done=' + done + '&clientId=' + clientId, function (data, status) {
            $('#'+currentTodoId).remove();
        });
    });

    $('#contentInner').on('click tap', '.star', function () {
        currentTodoId = $(this).parent().parent().attr('id');
        var imp;
        if( $(this).attr('data-important') == 'false')
            imp = false;
        else
            imp = true;
        var thisStar = $(this);
        $.get('/todos/modifyimportantstatus?id=' + currentTodoId + '&imp=' + imp + '&clientId=' + clientId, function (data, status) {
            if(requestPath == 'important')
                $('#'+currentTodoId).remove();
            else {
                if(thisStar.attr('data-important') == 'true')
                    thisStar.attr('data-important', 'false');
                else
                    thisStar.attr('data-important', 'true');
                thisStar.children().toggleClass('fa-star fa-star-o');
            }
        });
    });

    $("#contentInner").on('click tap', '.contentAddTodoButton', function () {
        currentTodoList = $(this).parent().attr('id');
        $('#addReminder').show();
        if(requestPath != 'inbox' && requestPath != 'important'){
            $('#addReminder').trigger('click');                     //// to display reminder input box
            $('#addReminder').hide();                   //hides add reminder button

            var dateTimestamp = parseInt( $('#'+currentTodoList +' h1').children().attr('data-timestamp') );
            var date = new Date(dateTimestamp);
            console.log(date);
            $('#schedule').attr('data-selectedDate', date);
            $('#schedule').val(date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
        }

    });

    $("#contentInner").on('click tap','#deleteAllCompleted', function () {
        $.get('/todos/deletetodos?id=0&clientId=' + clientId, function (data, status) {
            $('#contentInner').html('<h1>Completed</h1>');
            $('#noCompletedTodoLeft').show();
        });
    });

    $('.markCompleted').on('click tap', function () {
        $.get('/todos/modifydonestatus?id=' + currentTodoId + '&done=false&clientId=' + clientId, function (data, status) {
            $('#'+currentTodoId).remove();
        });
    });

    $('.markNotCompleted').on('click tap', function () {
        $.get('/todos/modifydonestatus?id=' + currentTodoId + '&done=true&clientId=' + clientId, function (data, status) {
            $('#'+currentTodoId).remove();
        });
    });

    $('.markImportant').on('click tap', function () {
        var thisStar = $('#' + currentTodoId + ' .star');
        $.get('/todos/modifyimportantstatus?id=' + currentTodoId + '&imp=false&clientId=' + clientId, function (data, status) {
            if(thisStar.attr('data-important') == 'true')
                thisStar.attr('data-important', 'false');
            else
                thisStar.attr('data-important', 'true');
            thisStar.children().toggleClass('fa-star fa-star-o');
        });
    });

    $('.markNotImportant').on('click tap', function () {
        var thisStar = $('#' + currentTodoId + ' .star');
        $.get('/todos/modifyimportantstatus?id=' + currentTodoId + '&imp=true&clientId=' + clientId, function (data, status) {
            if(requestPath == 'important')
                $('#'+currentTodoId).remove();
            else {
                if(thisStar.attr('data-important') == 'true')
                    thisStar.attr('data-important', 'false');
                else
                    thisStar.attr('data-important', 'true');
                thisStar.children().toggleClass('fa-star fa-star-o');
            }
        });
    });

    $(".deleteOneTodo").on('click tap', function () {
        $.get('/todos/deletetodos?id=' + currentTodoId + '&clientId=' + clientId, function (data, status) {
            $('#'+currentTodoId).remove();
        });
    });

    $('.dueToday').on('click tap', function () {
        $.get('/todos/updatetododate?id=' + currentTodoId + '&date=today&clientId=' + clientId, function (data, status) {
            showTodos(requestPath)
        });
    });

    $('.dueTomorrow').on('click tap', function () {
        $.get('/todos/updatetododate?id=' + currentTodoId + '&date=tomorrow&clientId=' + clientId, function (data, status) {
            showTodos(requestPath)
        });
    });

    $('.addReminder').on('click tap', function () {
        menuAddReminderSelected = true;
        var el = $('#calendarContainer');
        el.show();

        var top = $(this).offset().top;
        var extraHeight = el.height() + top - $(window).height();
        if(extraHeight > 0)
            top = top - extraHeight - 70;

        $('#calendarContainer').css({
            'top': top,
            'left': $(this).offset().left
        });
    });

    $(".editTodo").on('click tap', function () {
        if(requestPath == 'completed')
            return;
        if(editWindowOpened) {                //remove previous opened window
            $('#cancelEditedTodo').css('background-color', 'blue');
            setTimeout(function () {
                $('#cancelEditedTodo').css('background-color', '#3d3d3d');
            },500);
            return;
        }

        editWindowOpened = true;        //for this opened window
        oldTodo = $('#'+currentTodoId+ ' .task').html();
        $('#'+currentTodoId).html(
            '<div id="editWindow">' +
            '<input autofocus type="text">' +
            '<button id="saveEditedTodo" type="button">Save</button>' +
            '<button id="cancelEditedTodo" type="button">Cancel</button>' +
            '</div>'
        );
        $('#editWindow input').val(oldTodo).focus();
    });

    $('#contentInner').on('click tap', '#saveEditedTodo', function () {
        var todo = $('#editWindow input').val();
        if( todo == '' )
        {
            $("#editWindow input").attr("placeholder","Enter Task").css("border","2px solid red");
            setTimeout(function () {
                $("#editWindow input").css("border","1px solid black");
            },1000);
        }
        else{
            if(oldTodo != todo){
                var obj = {
                    id: $('#editWindow').parent().attr('id'),
                    task: todo,
                    clientId: clientId
                };
                $.post('/todos/updatetodotask', obj, function (data, status) {
                    showTodos(requestPath);
                });
            }
            else
                showTodos(requestPath);
            editWindowOpened = false;
        }
    });

    $('#contentInner').on('click tap', '#cancelEditedTodo', function () {
        editWindowOpened = false;
        showTodos(requestPath);
    });

    ///////////////////////////Calendar Date Click///////////////////////////////////
    $('#calendarContainer').on('click tap', '.cal_date', function () {
        date = $(this).html();
        var selectedDate = new Date(year, month, date);
        if(menuAddReminderSelected == true){
            $.get('/todos/updatetododate?id=' + currentTodoId + '&date=' + selectedDate + '&clientId=' + clientId, function (data, status) {
                menuAddReminderSelected = false;
                showTodos(requestPath);
            });
        }
        else{
            $('#schedule').attr('data-selectedDate', selectedDate);
            $('#schedule').val(date + '/' + (month+1) + '/' + year);
        }
        $('#calendarContainer').hide();
        $('#optionsMenu').removeClass('optionDisplayed');
    });

    /////////////////////// Hover Events///////////////////////////////////////
    $('#contentInner').on('mouseenter', '.checkBox', function () {
        if( $(this).attr('data-done') == 'false')
            tooltipName = "Mark As Completed";
        else
            tooltipName = "Mark As Not Completed";
        var position = $(this).position();
        topPosition = position.top + 25;
        leftPosition = position.left;
        showTooltip(tooltipName, topPosition, leftPosition);
    });

    $('#contentInner').on('mouseenter', '.star', function () {
        if( $(this).attr('data-important') == 'false')
            tooltipName = "Mark As Not Important";
        else
            tooltipName = "Mark As Important";
        var position = $(this).position();
        topPosition =  position.top + 25;
        leftPosition =  position.left - 100;
        showTooltip(tooltipName, topPosition, leftPosition);
    });

    $('#contentInner').on('mouseenter', '.optionsDotIcon', function () {
        tooltipName = "Options";
        var position = $(this).position();
        topPosition =  position.top + 25;
        leftPosition =  position.left - 45;
        showTooltip(tooltipName, topPosition, leftPosition);
    });

    $('#contentInner').on('mouseenter', '.taskDate', function () {
        var oneDay = 24 * 60 * 60 * 1000;         // hrs*min*sec*millisec
        var today = (new Date()).getTime();
        var tasktimestamp = $(this).attr('data-timestamp');
        var diffDays = Math.round((today - tasktimestamp)/(oneDay));
        if(diffDays < 0)
            tooltipName = Math.abs(diffDays) + " day(s) left";
        else if(diffDays > 0)
            tooltipName = diffDays + " day(s) ago";
        else
            tooltipName = "Today";

        var position = $(this).position();
        topPosition =  position.top + 25;
        leftPosition =  position.left - 20;
        showTooltip(tooltipName, topPosition, leftPosition);
    });

    $('#headerAddTodoButton').on('mouseenter', function () {
        tooltipName = "Quick Add Task";
        var position = $(this).position();
        topPosition =  position.top + 35;
        leftPosition =  position.left - 85;
        showTooltip(tooltipName, topPosition, leftPosition);
    });

    $('#schedule').on('mouseenter', function () {
        tooltipName = "Schedule";
        var position = $(this).offset();
        topPosition =  position.top + 35;
        leftPosition =  position.left + 30;
        showTooltip(tooltipName, topPosition, leftPosition);
    });

    $('#schedule').on('mouseleave', function () {
        $('#tooltip').hide();
    });

    $('#contentInner').on('mouseleave', '.checkBox, .star, .optionsDotIcon, .taskDate', function () {
        $('#tooltip').hide();
    });

    $('#headerAddTodoButton').on('mouseleave', function () {
        $('#tooltip').hide();
    });
});

