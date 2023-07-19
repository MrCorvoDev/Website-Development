//=======================================================================================================================================================================================================================================================
describe("Тестирование define-device", () => {
   beforeEach(() => {
      document.body.classList.remove("js_s-touch", "js_s-mouse");

      jest.resetModules();
   });

   test.each([
      "Android",
      "BlackBerry",
      "iPhone",
      "iPad",
      "iPod",
      "Opera Mini",
      "IEMobile",
   ])("Устройство определяется как touch(%#)", type => {
      Object.defineProperty(navigator, "userAgent", {configurable: true, value: `Mozilla/5.0 (Linux; ${type}; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36`});
      const module = require("../../src/js/modules/define-device.js");

      expect(document.body.classList.contains("js_s-touch")).toBeTruthy();
      expect(module.__get__("_is").touch).toBeTruthy();
      expect(document._app_.defineDevice.isBot).toBeFalsy();
   });
   test.each([
      "Googlebot",
      "YandexBot",
      "DuckDuckBot",
      "Bingbot",
   ])("Устройство определяется как bot", type => {
      Object.defineProperty(navigator, "userAgent", {configurable: true, value: `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ${type}/2.1; +http://www.google.com/bot.html) Chrome/113.0.5672.127 Safari/537.36`});
      require("../../src/js/modules/define-device.js");

      expect(document._app_.defineDevice.isBot).toBeTruthy();
   });
   test("Устройство определяется как mouse", () => {
      Object.defineProperty(navigator, "userAgent", {configurable: true, value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"});
      const module = require("../../src/js/modules/define-device.js");

      expect(document.body.classList.contains("js_s-touch")).toBeFalsy();
      expect(module.__get__("_is").touch).toBeFalsy();
   });
   test("Событие onInit", () => {
      Object.defineProperty(navigator, "userAgent", {configurable: true, value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"});
      const mockFn = jest.fn();
      addEventListener("_app_.defineDevice.onInit", mockFn);
      expect(mockFn).toHaveBeenCalledTimes(0);
      const module = require("../../src/js/modules/define-device.js");

      expect(document.body.classList.contains("js_s-touch")).toBeFalsy();
      expect(module.__get__("_is").touch).toBeFalsy();
      expect(mockFn).toHaveBeenCalledTimes(1);
   });
});
//=======================================================================================================================================================================================================================================================