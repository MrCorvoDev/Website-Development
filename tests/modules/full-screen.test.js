//=======================================================================================================================================================================================================================================================
const header = document.body.querySelector("#js_e-header");
const content = document.body.querySelector(".content");

/**
 * Получить высоту группы
 * @param {string} group Название Группы
 * @returns {string} Высота Группы
 */
const getHeight = group => document.body.style.getPropertyValue(`--${group}`);
/**
 * Проверить что высота устанавливается верно
 * @param {string} group Имя группы
 * @param {number} height Ожидаемая высота после инициализации
 * @param {number} resizedHeight Ожидаемая высота после resize
 */
const isHeightRight = (group, height, resizedHeight) => {
   expect(getHeight(group)).toBe(`${height}px`);

   window.innerHeight = window.g.SIZES[1] / 2;
   dispatchEvent(new Event("resize")); // Вызвать события

   expect(getHeight(group)).toBe(`${resizedHeight}px`);
};
/**
 * Создать Full-Screen
 * @param {string} settings Настройки full-screen
 */
const createVH = settings => `<div class="js_e-vh" ${settings ? `data-vh="${settings}"` : ""}></div>`;
/**
 * Инициализировать Full-Screen
 * @param {string} HTML HTML который будет вставлен в content
 */
const init = HTML => {
   content.innerHTML = HTML;

   require("../../src/js/modules/full-screen.js");
};

describe("Тестирование full-screen", () => {
   beforeEach(() => {
      jest.resetModules();
      window.innerHeight = window.g.SIZES[1];
      window.removeEventListeners();
   });

   describe("Переменная по умолчанию устанавливается", () => {
      if (header && header.classList.contains("js_e-lp")) {
         test("Переменная по умолчанию устанавливается(header lp)", () => {
            init(createVH());
            isHeightRight("vh", window.g.SIZES[1] - window.g.HEIGHT_HEADER.StickyPC, (window.g.SIZES[1] / 2) - window.g.HEIGHT_HEADER.StickyPC);
         });
      }
      test("Переменная по умолчанию устанавливается(простая header)", () => {
         if (header) header.classList.remove("js_e-lp");
         init(createVH());

         isHeightRight("vh", window.g.SIZES[1], window.g.SIZES[1] / 2);
         if (header) header.classList.add("js_e-lp");
      });
   });
   describe("Настройки", () => {
      test("Высота 50% от окна", () => {
         const mockFn = jest.fn();
         const expectedDetails = {name: "half", selectors: undefined, dataVh: "50"};
         addEventListener("_app_.fullScreen.onChange", mockFn);
         expect(mockFn).toHaveBeenCalledTimes(0);

         init(createVH("half, 50"));
         expect(mockFn).toHaveBeenCalledTimes(2);
         expect(mockFn.mock.calls[1][0].detail).toEqual(expectedDetails);

         isHeightRight("vh-half", window.g.SIZES[1] / 2, window.g.SIZES[1] / 4);
         expect(mockFn).toHaveBeenCalledTimes(4);
         expect(mockFn.mock.calls[3][0].detail).toEqual(expectedDetails);
      });
      if (header) {
         test.each([
            ["px:143", window.g.SIZES[1] - 143, (window.g.SIZES[1] / 2) - 143],
            ["headerH", window.g.SIZES[1] - window.g.HEIGHT_HEADER.PC, (window.g.SIZES[1] / 2) - window.g.HEIGHT_HEADER.PC],
            ["headerSH", window.g.SIZES[1] - window.g.HEIGHT_HEADER.StickyPC, (window.g.SIZES[1] / 2) - window.g.HEIGHT_HEADER.StickyPC],
            ["strong.dude", window.g.SIZES[1] - 36, (window.g.SIZES[1] / 2) - 36],
            ["strong.dude & headerSH & px:19", window.g.SIZES[1] - 36 - 19 - window.g.HEIGHT_HEADER.StickyPC, (window.g.SIZES[1] / 2) - 36 - 19 - window.g.HEIGHT_HEADER.StickyPC],
            ["strong.dude & headerSH & px:19", (window.g.SIZES[1] / 2) - 36 - 19 - window.g.HEIGHT_HEADER.StickyPC, (window.g.SIZES[1] / 4) - 36 - 19 - window.g.HEIGHT_HEADER.StickyPC, 50],
         ])("Вычитаемая высота в пикселях(%#)", (setting, height, resizedHeight, screenPart = 100) => {
            init(
               createVH(`subtraction, ${screenPart}, ${setting}`) +
               "<strong class=\"dude\" style=\"height:36px\"></strong>"
            );
            isHeightRight("vh-subtraction", height, resizedHeight);
         });
      } else {
         test.each([
            ["px:143", window.g.SIZES[1] - 143, (window.g.SIZES[1] / 2) - 143],
            ["strong.dude", window.g.SIZES[1] - 36, (window.g.SIZES[1] / 2) - 36],
            ["strong.dude & px:19", window.g.SIZES[1] - 36 - 19, (window.g.SIZES[1] / 2) - 36 - 19],
            ["strong.dude & px:19", (window.g.SIZES[1] / 2) - 36 - 19, (window.g.SIZES[1] / 4) - 36 - 19, 50],
         ])("Вычитаемая высота в пикселях(%#)", (setting, height, resizedHeight, screenPart = 100) => {
            init(
               createVH(`subtraction, ${screenPart}, ${setting}`) +
               "<strong class=\"dude\" style=\"height:36px\"></strong>"
            );
            isHeightRight("vh-subtraction", height, resizedHeight);
         });
      }
   });
});
//=======================================================================================================================================================================================================================================================