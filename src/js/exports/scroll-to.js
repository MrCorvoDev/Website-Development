//=======================================================================================================================================================================================================================================================
import _dom from "./dom.js";
import _header from "./header.js";
import _lock from "./lock.js";
import _number from "./number.js";
//=======================================================================================================================================================================================================================================================
const debug = false && process.env.NODE_ENV === "development";
/**
 * Прокрутить до элемента
 * @async
 * @param  {Element} target Элемент
 * @returns {number} Длительность анимации(ms)
 */
async function _scrollTo(target) {
   const isOutsideMenu = !target.closest(".js_e-menu-bd");
   const scrollY = isOutsideMenu ? window.scrollY : _header.menuBD.scrollTop;
   if (!_lock.is && _header.self && _header.menu._app_.menu.is && isOutsideMenu) _header.menu._app_.menu.toggle();

   const targetOffset = _dom.el.offset(target, !isOutsideMenu && _header.menuBD).top;
   const durationOffset = Math.abs(scrollY - targetOffset); // Если отрицательное перевести в положительное
   const DURATION_POINT = 2500; // Подобранное значение для нормальной скорости
   const duration = Math.min(2, _number.round((durationOffset / DURATION_POINT), 3)); // Длительность анимации. Максимальная длина анимации 2s

   async function animateScroll(hType) {
      const scrollElement = isOutsideMenu ? window : _header.menuBD;
      if (!isOutsideMenu) hType = _header.self._app_?.sticky?.is ? _header.sh : _header.h;

      const {default: gsap} = await import(/* webpackPrefetch: true */ "gsap");
      const {default: ScrollToPlugin} = await import(/* webpackPrefetch: true */ "gsap/ScrollToPlugin.js");
      gsap.registerPlugin(ScrollToPlugin);

      gsap.to(scrollElement, {
         duration: duration,
         scrollTo: targetOffset - (hType || 0),
         ease: "power4",
         onStart: function () {
            if (!hType) return;

            _header.self._app_?.sticky?.destroy();
            (hType === _header.sh) ? _header.self._app_?.sticky?.makeSticky() : _header.self._app_?.sticky?.makeNonSticky();
         },
         onComplete: function () {
            if (!hType) return;

            setTimeout(() => _header.self._app_?.sticky?.init(), 650);
         },
      });

      if (debug) console.log("smooth", targetOffset, hType);
   }
   if ((!_header.isLP && (scrollY === Math.floor(targetOffset))) || (_header.self && !_header.self._app_?.sticky?.is && (scrollY === Math.floor(targetOffset - _header.h))) || (_header.self && (scrollY === Math.floor(targetOffset - _header.sh)))) {
      if (debug) console.log("тут");
      return 0;
   }
   if (_header.isLP && ((scrollY + _header.sh > targetOffset && !_dom.el.has("vh", target, 1)) || (_dom.el.has("vh", target, 4) && _dom.el.attr.get("vh", target).indexOf("headerH") !== -1))) {
      if (debug) console.log("выше");
      await animateScroll(_header.h);
   } else if (_header.isLP) {
      if (debug) console.log("ниже");
      await animateScroll(_header.sh);
   } else {
      if (debug) console.log("без");
      await animateScroll();
   }
   return (duration * 1000); // Перевести миллисекунды
}
//=======================================================================================================================================================================================================================================================
export default _scrollTo;
//=======================================================================================================================================================================================================================================================