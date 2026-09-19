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

(function(){
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll(".reveal").forEach(function(el){
        if(reduce){ el.classList.add("reveal-visible"); return; }
        var io = new IntersectionObserver(function(entries){
            entries.forEach(function(e){
                if(e.isIntersecting){ el.classList.add("reveal-visible"); io.unobserve(el); }
            });
        }, { threshold: 0.15 });
        io.observe(el);
    });
})();

(function(){
    if(!document.getElementById("landing-hero")) return;

    function animateCounter(el){
        var target = Number(el.dataset.target) || 0;
        var dur = 1200;
        var start = null;
        function tick(now){
            if(!start) start = now;
            var p = Math.min((now - start) / dur, 1);
            el.textContent = Math.floor(p * target).toLocaleString("en-IN");
            if(p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll(".counter").forEach(function(el){
        var run = function(){ animateCounter(el); };
        if(reduce){ run(); return; }
        var io = new IntersectionObserver(function(entries){
            entries.forEach(function(e){
                if(e.isIntersecting){ run(); io.unobserve(e.target); }
            });
        }, { threshold: 0.5 });
        io.observe(el);
    });

    var rotor = document.querySelector(".rotor");
    if(rotor){
        var words = ["Stay", "Escape", "Celebrate", "Recharge"];
        var i = 0;
        setInterval(function(){
            i = (i + 1) % words.length;
            rotor.style.opacity = "0";
            setTimeout(function(){
                rotor.textContent = words[i];
                rotor.style.opacity = "1";
            }, 300);
        }, 2200);
    }
})();