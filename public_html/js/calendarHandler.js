/**
 * Created by piyush on 5/9/16.
 */
var date, month, year;
var today = new Date();
var today_date = today.getDate();
var today_month = month = today.getMonth();
var today_year = year = today.getFullYear();

function fillCalendar(month, year) {
    $('.week').html('');
    var monthFirstDate, monthLastDate, calenderColNumber;
    monthFirstDate = new Date(year, month, 1);
    monthLastDate = new Date(year, month + 1, 0);
    var months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

    calenderColNumber = monthFirstDate.getDay();
    var monthLastDate_date = monthLastDate.getDate();
    var dateToFill = 1;

    $('#cal_Month').html(months[month] + ' ' + year);
    for (var i = 0; i < calenderColNumber; i++) {
        $('#week0').append('<td></td>');
    }
    for (var week = 0; week < 6 && dateToFill <= monthLastDate_date; week++) {
        for (; calenderColNumber < 7 && dateToFill <= monthLastDate_date; calenderColNumber++, dateToFill++) {

            $('#week' + week).append('<td><div class="cal_date">' + dateToFill + '</div></td>');

            if (dateToFill == today_date && month == today_month && year == today_year)
                $('#week' + week + ' td').last().addClass('today');
        }
        calenderColNumber = 0;
    }
}

$('#calendarContainer').on('click tap', '#cal_RightButton',function () {
    if(month == 11)
    {
        year++;
        month = 0;
    }
    else
        month++;
    fillCalendar(month, year);
});

$('#calendarContainer').on('click tap', '#cal_LeftButton',function () {
    if(month == 0)
    {
        year--;
        month = 11;
    }
    else
        month--;
    fillCalendar(month, year);
});
