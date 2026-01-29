(function() {
    document.addEventListener('DOMContentLoaded', function() {
        var header = document.getElementById('header');
        if (!header) return;

        var isFixed = false;

        window.onscroll = function() {
            var y = window.pageYOffset || document.documentElement.scrollTop;
            
            if (!isFixed && y > 40) {
                isFixed = true;
                header.className += ' fixed';
            } else if (isFixed && y < 10) {
                isFixed = false;
                header.className = header.className.replace(' fixed', '');
            }
        };

        var btnMenu = document.querySelector('.btn-menu');
        var aside = document.querySelector('aside');
        
        if (btnMenu && aside) {
            btnMenu.onclick = function() {
                if (btnMenu.className.indexOf('active') > -1) {
                    btnMenu.className = btnMenu.className.replace(' active', '');
                    aside.className = aside.className.replace(' open', '');
                } else {
                    btnMenu.className += ' active';
                    aside.className += ' open';
                }
            };
        }

        var btnLang = document.querySelector('.btn-lang');
        var langDepth = document.querySelector('.lang-depth');
        var lang = document.querySelector('.lang');
        
        if (btnLang && langDepth) {
            btnLang.onclick = function(e) {
                e.stopPropagation();
                if (langDepth.className.indexOf('open') > -1) {
                    langDepth.className = langDepth.className.replace(' open', '');
                } else {
                    langDepth.className += ' open';
                }
            };
        
            document.onclick = function(e) {
                if (!lang.contains(e.target)) {
                    langDepth.className = langDepth.className.replace(' open', '');
                }
            };
        }
        
        
    });
})();
