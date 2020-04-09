var checkPassword = function() {
  if (document.getElementById('password').value ==
    document.getElementById('conf_password').value) {
    document.getElementById('pass_icon').innerHTML = 'check';
    document.getElementById('pass_icon').style.color = 'green';
    document.getElementById('pass_message').style.color = 'green';
    document.getElementById('pass_message').innerHTML = '';
  } else {
    document.getElementById('pass_icon').innerHTML = 'clear';
    document.getElementById('pass_icon').style.color = 'red';
    document.getElementById('pass_message').style.color = 'red';
    document.getElementById('pass_message').innerHTML = 'not matching';
  }
}