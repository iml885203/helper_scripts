// ==UserScript==
// @name         wuwow_g_calendar_event
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  generate google calendar event button
// @author       Long
// @match        https://taichi.wuwow.tw/dojo/book_class
// @icon         https://www.google.com/s2/favicons?domain=wuwow.tw
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // handle table dom updated
  const targetNode = $(".fc-view-container")[0];
  const config = { childList: true, subtree: true };
  const debounceCreateButtons = _.debounce(createButtons, 100);
  const callback = function (mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        debounceCreateButtons();
      }
    }
  };
  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);

  function whichChild(elem) {
    var i = 0;
    while ((elem = elem.previousSibling) != null) ++i;
    return i;
  }

  function createButtons() {
    $(".create-google-calendar-event").remove();
    $(".fc-day-grid-event").each(function (index, ele) {
      // console.log(ele);
      let $ele = $(ele);

      // general url
      let rowIndex = whichChild(ele.parentElement);
      let $dateEle = $("thead td", $ele.closest("table")).eq(rowIndex);
      let date = $dateEle.data("date");
      let time = $ele.text().trim();
      let datetime = moment(`${date} ${time}`);
      let title = `👩🏼‍🏫 ${time}`;
      let queryString = $.param({
        action: "TEMPLATE",
        ctz: "Asia/Taipei",
        text: title,
        dates: datetime.format("YYYYMMDDTHHmmssZ") + "/" + datetime.add(25, "minutes").format("YYYYMMDDTHHmmssZ"),
      });
      let url = `https://www.google.com/calendar/render?${queryString}`;
      // console.log(url);

      // append calendar button
      let posX = $ele.offset().left + $ele.width() - 5;
      let posY = $ele.offset().top + $ele.height() / 2;
      // console.log(posX, posY);
      let calendarBtn = document.createElement("a");
      calendarBtn.setAttribute("target", "_blank");
      calendarBtn.setAttribute("href", url);
      calendarBtn.setAttribute("class", "create-google-calendar-event");
      calendarBtn.setAttribute("data-toggle", "tooltip");
      calendarBtn.setAttribute("title", "新增行程到Google行事曆");
      calendarBtn.setAttribute(
        "style",
        `position: absolute; left: ${posX}px; top: ${posY}px; z-index: 1; transform: translateX(-50%) translateY(-50%); color: white;`
      );
      let btnIcon = document.createElement("i");
      btnIcon.setAttribute("class", "fas fa-calendar");
      calendarBtn.appendChild(btnIcon);
      document.body.append(calendarBtn);

      console.log("createButtons done");
    });
    $(".create-google-calendar-event").tooltip();
  }
})();
