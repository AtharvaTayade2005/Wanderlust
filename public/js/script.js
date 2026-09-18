(function(){
    var saved = null;
    try { saved = localStorage.getItem("theme"); } catch(e){}
    if(saved === "dark" || saved === "light"){
        document.documentElement.setAttribute("data-bs-theme", saved);
    }

    var toggle = document.getElementById("theme-toggle");
    if(toggle){
        var icon = toggle.querySelector("i");
        function updateIcon(){
            var dark = document.documentElement.getAttribute("data-bs-theme") === "dark";
            icon.className = dark ? "fa-solid fa-sun" : "fa-solid fa-moon";
        }
        updateIcon();
        toggle.addEventListener("click", function(){
            var dark = document.documentElement.getAttribute("data-bs-theme") === "dark";
            document.documentElement.setAttribute("data-bs-theme", dark ? "light" : "dark");
            try { localStorage.setItem("theme", dark ? "light" : "dark"); } catch(e){}
            updateIcon();
        });
    }

    document.querySelectorAll("[data-tolang]").forEach(function(a){
        a.addEventListener("click", function(e){
            e.preventDefault();
            var url = new URL(window.location.href);
            url.searchParams.set("lang", a.dataset.tolang);
            window.location.href = url.toString();
        });
    });
})();