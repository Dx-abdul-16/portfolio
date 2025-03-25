$(function () {
  $("#contactForm input,#contactForm textarea").jqBootstrapValidation({
    preventSubmit: true,
    submitError: function () {
      // additional error messages or events
    },
    submitSuccess: function (event) {
      event.preventDefault(); // prevent default submit behaviour
      // get values from FORM
      var name = $("input#name").val();
      var email = $("input#email").val();
      var phone = $("input#phone").val();
      var message = $("textarea#message").val();
      var firstName = name; // For Success/Failure Message
      // Check for white space in name for Success/Fail message
      if (firstName.indexOf(" ") >= 0) {
        firstName = name.split(" ").slice(0, -1).join(" ");
      }
      $this = $("#sendMessageButton");
      $this.prop("disabled", true); // Disable submit button until AJAX call is complete to prevent duplicate messages

      // Send data to the server
      $.ajax({
        url: "/path/to/your/server/endpoint", // Replace with your server endpoint
        type: "POST",
        data: {
          name: name,
          email: email,
          phone: phone,
          message: message,
        },
        success: function () {
          // Simulate AJAX success
          $("#success").html("<div class='alert alert-success'>");
          $("#success > .alert-success")
            .html(
              "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;"
            )
            .append("</button>");
          $("#success > .alert-success").append(
            "<strong>Your message has been sent successfully. </strong>"
          );
          $("#success > .alert-success").append("</div>");
          // Clear all fields
          $("#contactForm").trigger("reset");
        },
        error: function () {
          // Simulate AJAX error
          $("#success").html("<div class='alert alert-danger'>");
          $("#success > .alert-danger")
            .html(
              "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;"
            )
            .append("</button>");
          $("#success > .alert-danger").append(
            "<strong>Sorry, it seems that my mail server is not responding. Please try again later!</strong>"
          );
          $("#success > .alert-danger").append("</div>");
        },
        complete: function () {
          $this.prop("disabled", false); // Re-enable submit button
        },
      });
    },
    filter: function () {
      return $(this).is(":visible");
    },
  });

  $('a[data-toggle="tab"]').click(function (e) {
    e.preventDefault();
    $(this).tab("show");
  });
});

/*When clicking on Full hide fail/success boxes */
$("#name").focus(function () {
  $("#success").html("");
});
