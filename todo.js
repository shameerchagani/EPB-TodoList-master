var currentuser;

$(function () {
   
    // ......Script for Add Button...........

    $("#add").submit(event => {
        event.preventDefault();
       // console.log(event);
        //console.log(event.target);
        let form = $(event.target);
        let item = $("#adding").val();
        //console.log(item);
        if (currentuser) {
            let ref = database.ref("/todo/" + currentuser.uid).push();

            // createTodo(item, false, ref);
            $("#adding").val("");
            ref.set({
                text: item,
                done: false
            });
        }
    });

    //-----------Signup Script----------------
    $('#confirm-signup').click(event => {
        let email = $('#signup-email').val();
        let pwd = $('#signup-pwd').val();
        let confirm = $('#signup-pwd-confirm').val();
        if (pwd !== confirm) {
            alert('Passwords do not match');
            return;
        }
        auth.createUserWithEmailAndPassword(email, pwd).then(function (result) {
           // console.log(result);
            $('#modal').modal('hide');
        }).catch(function (error) {
            alert(error.message);
        })
    });

    //--------Check for current user login
    auth.onAuthStateChanged(function (user) {
        if (user) {
            // console.log('you are signed in');                 
            $('#signout-form').show();
            $('#signin-form').hide();
            $('#login-message').hide();
            $('#list').show();
            $('#add').show();

            let ref = database.ref("/todo/" + user.uid);
            ref.on('child_added', function (snapshot) {
                let item = snapshot.val();
               // console.log("realtime", item);
                createTodo(item.text, item.done, ref.child(snapshot.key));
            });
            // database.ref("/todo").off('child_added');

            ref.on('child_removed', function (snapshot) {
                let id = snapshot.key;
                $("#" + id).parent().parent().remove();
            });

            ref.on('child_changed', function (snapshot) {
                // console.log("change", snapshot.val());
                // console.log("id", snapshot.key);
                let checked = snapshot.val().done;
                $("#" + snapshot.key).attr("checked", checked);
            });
        } else {
           // console.log('no one logged in');
            $('#signout-form').hide();
            $('#signin-form').show();
            $('#login-message').show();
            $('#list').hide().empty();
            $('#add').hide();

            let ref = database.ref("/todo/" + currentuser.uid);
            ref.off('child_added');
            ref.off('child_removed');
            ref.off('child_changed');

            //console.log(user);
        }
        currentuser = user;
    });
//-----XXX--------End of Script Check current user login and show his data------XXX----------

//-----------Signout Button functionality------------
    $('#signout-btn').click(event => {
        auth.signOut();
        
    })

//-----------Login Button Functionality---------------    
    $('#confirm-login').click(event => {
        let email = $('#email').val();
        let password = $('#pwd').val();
        auth.signInWithEmailAndPassword(email, password).then(function (result) {
            //console.log(result);
            $('#modal-login').modal('hide');
        }).catch(function (error) {
            alert(error.message);
        });
    });

//------------Login/Signin With Google------------------
   
    $('#google').click(event => {
        auth.signInWithPopup(google).then(function(result){
            //console.log(result);
            $('#modal-login').modal('hide');
        }).catch(function(error){
            alert(error);
        });
    });

//------------Login/Signin With Facebook------------------
    $('#facebook').click(event => {
        auth.signInWithPopup(facebook).then(function(result){
            console.log(result);
            $('#modal-login').modal('hide');
        }).catch(function(error){
            alert(error);
        });
    })

});


function createTodo(item, checked, ref) {
    let li = $("<li class='form-row form-inline justify-content-between mt-2 light-color bdr-sq'></li>");
    let col1 = $("<div class='custom-control custom-checkbox'></div>");
    li.append(col1);

    let id = ref.key;
    let input = $("<input type='checkbox' class='custom-control-input check' id='" + id + "' />")
    input.change(function (e) {
        ref.set({
            text: item,
            done: e.target.checked
        });
        //console.log(e.target.checked);
    });
    input.attr('checked', checked);
    col1.append(input);

    let label = $("<label class='custom-control-label ml-1'></label>");
    label.attr("for", id);
    label.text(item);
    col1.append(label);

    let col2 = $("<div class='col-2'></div>");
    li.append(col2);

    let button = $("<i class='fa fa-minus-square'></i>");
    button.click(event => {
        // console.log("deleting");
        console.log(event.target);
        // $(event.target).parent().parent().remove();
        ref.remove();
    });
    col2.append(button);

    $("#list").append(li);
    $('li').sortable();
}