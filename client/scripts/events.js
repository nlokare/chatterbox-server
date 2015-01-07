$(document).ready(function () {

  if (window.username === undefined) {
    $('#myModal').modal('show');
  }

  $('body').on('click', '.setname', function (e) {
    e.preventDefault();
    var name = $('.myname').val();
    $('#myModal').modal('hide');
    window.username = name;
  });

  $('.submit').on('click', app.handleSubmit);

  $('.tabber a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  });

  $('body').on('click', '#roomMenu .roomName', function (e) {
    e.preventDefault();
    app.fetch($(this).text());
    app.room = $(this).text();
    $('h1').text(app.room);
  });

  $('h1').text(app.room);

  $('body').on('click', '.username', function (e) {
    e.preventDefault();
    if (app.friends.indexOf($(this).text()) === -1) {
      app.addFriend($(this).text());
      $('table').append("<tr><td>" + $(this).text() + "</td></tr>");
    }
  });

});
