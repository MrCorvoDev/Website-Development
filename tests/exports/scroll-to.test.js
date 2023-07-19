//=======================================================================================================================================================================================================================================================
const content = document.body.querySelector(".content");

content.innerHTML = `<section id='target' style='top:${window.g.SIZES[1]}px;'></section>`;
const element = document.getElementById("target");

const header = document.getElementById("js_e-header");
const menu = document.querySelector(".menu");
if (menu) menu.lastElementChild.lastElementChild.innerHTML = "<li id='li-item'></li>";
const elementListItem = document.querySelector("#li-item");

/* global scrollY:writable */
jest.mock("gsap", () => ({ // Добавить реализацию для gsap.to
   to: (element, obj) => {
      // Реализовать для JSDOM
      obj.onStart();

      (typeof element.scrollY !== "undefined") ? scrollY = obj.scrollTo : element.scrollTop = obj.scrollTo; // Установить в верное место значение

      obj.onComplete();
   },
   registerPlugin: () => null
}));
const _scrollTo = async element => {
   const duration = await require("../../src/js/exports/scroll-to.js").default(element);
   jest.runAllTimers();

   return duration;
};
/** Открыть меню */
const toggleMenu = () => {
   menu._app_.menu.toggle();
   jest.runAllTimers();
};

/** Проверить что меню открыто */
const isMenuOpened = () => {
   expect(menu.classList.contains("js_s-act-menu")).toBeTruthy();
   expect(menu._app_.menu.is).toBeTruthy();
   expect(document.body.classList.contains("js_s-lock")).toBeTruthy();
   expect(document.body.style.getPropertyValue("--lp")).toBe(innerWidth - document.body.offsetWidth + "px");
};
/** Проверить что меню закрыто */
const isMenuClosed = () => {
   expect(menu.classList.contains("js_s-act-menu")).toBeFalsy();
   expect(menu._app_.menu.is).toBeFalsy();
   expect(document.body.classList.contains("js_s-lock")).toBeFalsy();
   expect(document.body.style.getPropertyValue("--lp")).toBe("0");
};
/**
 * Проверить что верно прокручен
 * @param {boolean} isSticky Должна ли шапка быть sticky
 * @param {number} duration Длительность анимации
 * @param {number} expectY Ожидаемый ScrollY
 */
const isScrolledCorrect = (isSticky, duration, expectY) => {
   const hasSticky = document.body.classList.contains("js_s-sticky");
   expect(isSticky ? hasSticky : !hasSticky).toBeTruthy(); // Шапка в положении sticky
   expect(duration).toBeTruthy(); // Длительность
   expect(scrollY).toBe(expectY);
};
/**
 * Проверить что не прокручивалось
 * @param {number} duration Длительность анимации
 * @param {number} expectY Ожидаемый ScrollY
 */
const itDidNotScroll = (duration, expectY) => {
   expect(duration).toBe(0); // Прокрутка не выполнялась
   expect(scrollY).toBe(expectY); // Положение прокрутки после выполнения в положении sticky
};

jest.useFakeTimers();

describe("Тестирование _scrollTo", () => {
   beforeEach(() => { // Восстановить значение
      jest.resetModules();
      window.removeEventListeners();
      scrollY = 0;
      element.style.top = window.g.SIZES[1] + "px";
      document.body.classList.remove("js_s-sticky");
      if (header) require("../../src/js/modules/menu/burger.js");
      if (header) require("../../src/js/modules/sticky.js");
   });

   test("Простейшая прокрутка", async () => {
      if (header) header.classList.remove("js_e-lp"); // Использовать простую шапку
      jest.resetModules();
      window.removeEventListeners();
      scrollY = 0;
      element.style.top = window.g.SIZES[1] + "px";
      document.body.classList.remove("js_s-sticky");
      if (header) require("../../src/js/modules/menu/burger.js");
      if (header) require("../../src/js/modules/sticky.js");

      await _scrollTo(element);
      expect(scrollY).toBe(window.g.SIZES[1]); // Положение прокрутки после выполнения

      if (header) header.classList.add("js_e-lp"); // Вернуть sticky header
   });
   if (header) {
      test("Прокрутка вниз", async () => {
         const duration = await _scrollTo(element);

         isScrolledCorrect(true, duration, window.g.SIZES[1] - window.g.HEIGHT_HEADER.StickyPC);
      });
      test("Прокрутка вверх", async () => {
         scrollY = window.g.SIZES[1] + window.g.HEIGHT_HEADER.PC;
         element.style.top = -window.g.SIZES[1] + "px"; // Эмулировать положения элемента выше положения прокрутки
         const duration = await _scrollTo(element);

         isScrolledCorrect(false, duration, 0);
      });
      test("Прокрутка full-screen headerH", async () => {
         element.classList.add("js_e-vh");
         element.setAttribute("data-vh", "group, 100, headerH");

         const duration = await _scrollTo(element);

         isScrolledCorrect(false, duration, window.g.SIZES[1] - window.g.HEIGHT_HEADER.PC);
         element.classList.remove("js_e-vh");
         element.removeAttribute("data-vh");
      });
      test("Закрытие меню и последующая прокрутка вниз", async () => {
         toggleMenu();
         const duration = await _scrollTo(element);

         isMenuClosed();
         isScrolledCorrect(true, duration, window.g.SIZES[1] - window.g.HEIGHT_HEADER.StickyPC);
      });
      test("Прокрутка в меню(Sticky)", async () => {
         toggleMenu();
         header._app_.sticky.makeSticky();
         elementListItem.style.top = window.g.SIZES[1] + "px";
         await _scrollTo(elementListItem);

         isMenuOpened();
         expect(document.body.classList.contains("js_s-sticky")).toBeTruthy(); // Шапка в положении sticky
         expect(menu.lastElementChild.scrollTop).toBe(window.g.SIZES[1] - window.g.HEIGHT_HEADER.StickyPC); // Положение прокрутки с шапкой в положении sticky
         toggleMenu();
      });
      test("Прокрутка в меню(No Sticky)", async () => {
         toggleMenu();
         menu.lastElementChild.scrollTop = 760;
         elementListItem.style.top = -(window.g.SIZES[1] - window.g.HEIGHT_HEADER.StickyPC - window.g.HEIGHT_HEADER.PC) + "px";
         await _scrollTo(elementListItem);

         isMenuOpened();
         expect(document.body.classList.contains("js_s-sticky")).toBeFalsy(); // Шапка в обычном положении
         expect(menu.lastElementChild.scrollTop).toBe(0); // Положение прокрутки с шапкой в обычном положении
         toggleMenu();
      });
      describe("Не прокручивается если на том же месте", () => {
         beforeEach(() => scrollY = 1000);
         test("Обычная форма", async () => {
            element.style.top = window.g.HEIGHT_HEADER.PC + "px";
            header._app_.sticky.makeNonSticky();

            itDidNotScroll(await _scrollTo(element), 1000);
         });
         test("Sticky форма", async () => {
            element.style.top = window.g.HEIGHT_HEADER.StickyPC + "px";
            header._app_.sticky.makeSticky();

            itDidNotScroll(await _scrollTo(element), 1000);
         });
      });
   }
});
//=======================================================================================================================================================================================================================================================