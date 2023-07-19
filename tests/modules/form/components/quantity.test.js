//=======================================================================================================================================================================================================================================================
const content = document.body.querySelector(".content");

content.innerHTML = "<div><button type=\"button\" data-quant=\"+\" class=\"js_e-quant\"></button><input tabindex=\"-1\" readonly=\"readonly\" type=\"number\" name=\"quantity\" value=\"1\"><button type=\"button\" data-quant=\"-\" class=\"js_e-quant\"></button></div>";
require("../../../../src/js/modules/form/components/quantity.js");
const buttons = content.getElementsByTagName("button");
const input = document.querySelector("input");

describe("Тестирование quantity", () => {
   test.each([
      "2",
      "3",
      "4",
   ])("Увеличивает, результат: %i", i => {
      buttons[0].click();
      expect(input.value).toBe(i);
   });
   test.each([
      "4",
      "3",
      "2",
      "1",
      "1",
      "1",
   ])("Уменьшает, результат: %i", i => {
      if (i === "4") input.value = "5";

      buttons[1].click();
      expect(input.value).toBe(i);
   });
});
//=======================================================================================================================================================================================================================================================