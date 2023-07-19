//=======================================================================================================================================================================================================================================================
const content = document.body.querySelector(".content");

jest.mock("autosize");
const autosize = require("autosize");

describe("Тестирование autosize-textarea", () => {
   test("Autosize верно получает элементы", async () => {
      content.innerHTML = "<textarea id=\"first\" class=\"js_e-autosize\"></textarea><textarea id=\"second\" class=\"js_e-autosize\"></textarea>";
      require("../../../../src/js/modules/form/components/autosize-textarea.js");

      await window.Promise.resolve();
      await window.Promise.resolve();

      expect(autosize).toHaveBeenNthCalledWith(1, content.firstElementChild);
      expect(autosize).toHaveBeenNthCalledWith(2, content.lastElementChild);
   });
});
//=======================================================================================================================================================================================================================================================