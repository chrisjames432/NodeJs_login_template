$(document).ready(function() {
    let formState = 0;

    function signUp() {
        const email = $("#email").val();
        const password = $("#password").val();
        const repeatPassword = $("#repeatPassword").val();

        if (password !== repeatPassword) {
            $("#message").text("Passwords do not match");
            return;
        }

        const data = {
            email: email,
            password: password,
            confirmPassword: repeatPassword
        };

        $.ajax({
            type: "POST",
            url: "/signup",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function(response) {
                if (!response.error) {
                    $("#message").text(response.message);
                } else {
                    $("#message").text(response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error("Error:", error);
                $("#message").text("An error occurred. Please try again.");
            }
        });
    }

    function login() {
        const email = $("#email").val();
        const password = $("#password").val();
    
        const data = {
            email: email,
            password: password
        };
    
        $.ajax({
            type: "POST",
            url: "/login",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function(response) {
                if (!response.error) {
                    window.location.href = response.redirectTo;  // Redirect to dashboard
                } else {
                    $("#message").text(response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error("Error:", error);
                $("#message").text("An error occurred. Please try again.");
            }
        });
    }
    
  

    function toggleFormState() {
        formState = 1 - formState;
        if (formState === 1) {
            $("#submit").text("Sign Up");
            $("#messagediv").html("Please Sign Up, or <a id='toggleLink' href='#'>Log In</a>");
            $("#toggleLink").click(renderLogin);
            $("#repeatPasswordDiv").show();
        } else {
            $("#submit").text("Log In");
            $("#messagediv").html("Please Log In, or <a id='toggleLink' href='#'>Sign Up</a>");
            $("#toggleLink").click(renderSignUp);
            $("#repeatPasswordDiv").hide();
        }
    }

    function renderInitial() {
        // Check if the user is already logged in
        $.ajax({
            type: "GET",
            url: "/user",
            contentType: "application/json",
            success: function(response) {
                if (!response.error) {
                    renderDash();
                } else {
                    $("#form1").hide();
                    $(".center-container").show();
                    $("#messagediv").html("Please Log In, or <a id='toggleLink' href='#'>Sign Up</a>");
                    $("#toggleLink").click(renderSignUp);
                }
            },
            error: function(xhr, status, error) {
                console.error("Error:", error);
                $("#form1").hide();
                $(".center-container").show();
                $("#messagediv").html("Please Log In, or <a id='toggleLink' href='#'>Sign Up</a>");
                $("#toggleLink").click(renderSignUp);
            }
        });
    }

    function renderSignUp() {
        $("#form1").show();
        $(".center-container").hide();
        $("#repeatPasswordDiv").show();
        $("#messagediv").html("Please Sign Up, or <a id='toggleLink' href='#'>Log In</a>");
        $("#toggleLink").click(renderLogin);
        $("#submit").text("Sign Up");
        $("#submit").off("click").click(signUp);
    }

    function renderLogin() {
        $("#form1").show();
        $(".center-container").hide();
        $("#repeatPasswordDiv").hide();
        $("#messagediv").html("Please Log In, or <a id='toggleLink' href='#'>Sign Up</a>");
        $("#toggleLink").click(renderSignUp);
        $("#submit").text("Log In");
        $("#submit").off("click").click(login);
    }

    function renderResetPasswordRequest() {
        $("#form1").show();
        $(".center-container").hide();
        $("#repeatPasswordDiv").hide();
        $("#form1").html(`
            <center><h3 id='messagediv'>Reset Password</h3></center>
            <hr>
            <form role="form" class="bdr">
                <div class="form-group">
                    <label for="inputEmail">Email</label>
                    <input type="email" class="form-control" id="email" required>
                </div>
                <button type="button" id='submitReset' class="btn btn-primary">Send Reset Link</button>
            </form>
            <div id="message" style="padding: 10px;">
                message
            </div>
        `);

        $("#submitReset").click(function() {
            const email = $("#email").val();
            $.ajax({
                type: "POST",
                url: "/request-password-reset",
                contentType: "application/json",
                data: JSON.stringify({ email }),
                success: function(response) {
                    $("#message").text(response.message);
                },
                error: function(xhr, status, error) {
                    console.error("Error:", error);
                    $("#message").text("An error occurred. Please try again.");
                }
            });
        });
    }

    $("#login").click(renderLogin);
    $("#signup").click(renderSignUp);
    $("#resetPassword").click(renderResetPasswordRequest);

    renderInitial();

    $("#about").click(function() {
        // Add your code here for About link click event
    });
});
