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
    var root=document.getElementById("checkout-root");
    if(!root) return;
    if(root.dataset.configured!=="1") return;
    var btn=document.getElementById("rzp-button");
    var msg=document.getElementById("razorpay-status");
    btn.classList.remove("d-none");
    function failed(text){ msg.textContent=text; msg.classList.remove("d-none"); }
    btn.addEventListener("click",function(){
        msg.classList.add("d-none");
        fetch("/bookings/"+root.dataset.bookingId+"/pay/order",{method:"POST"})
            .then(function(r){ return r.json(); })
            .then(function(data){
                if(!data.order_id){ failed("Could not create payment order."); return; }
                var rzp=new Razorpay({
                    key:data.key_id,
                    amount:data.amount,
                    currency:data.currency,
                    name:"Wanderlust",
                    description:root.dataset.name,
                    order_id:data.order_id,
                    handler:function(resp){
                        fetch("/bookings/"+root.dataset.bookingId+"/pay/verify",{
                            method:"POST",
                            headers:{"Content-Type":"application/json"},
                            body:JSON.stringify({
                                razorpay_order_id:resp.razorpay_order_id,
                                razorpay_payment_id:resp.razorpay_payment_id,
                                razorpay_signature:resp.razorpay_signature
                            })
                        }).then(function(r){ return r.json(); })
                          .then(function(result){
                              if(result.ok){ window.location.href="/bookings/my"; }
                              else{ failed("Verification failed: "+(result.error||"unknown")); }
                          });
                    },
                    modal:{ ondismiss:function(){ failed("Payment window closed. No charge made."); } }
                });
                rzp.open();
            })
            .catch(function(){ failed("Could not reach the payment service."); });
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