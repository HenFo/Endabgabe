$(document).ready(function () {
    $("#submit").click(function () {
        var subject = "Kontakt";
        var body = $("subject").val();
        window.open('mailto:h_fock01@wwu.de?subject='+subject+'&body='+body);
    })
})
