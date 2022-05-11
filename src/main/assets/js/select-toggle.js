/*
  Select Menu Toggle for expandable panel
   - Wrap select menu an panel in a DIV with class 'select-toggle'.
   - Use class 'panel' and 'panel-border-narrow' (optional) for left border.

  Example :
  --------------------
  <div class="select-toggle">
    {{ govukSelect({
        .....
    });
    <div class="panel panel-border-narrow govuk-visually-hidden">
      ..... Panel Content Here ....
    </div>
  </div>

*/
import $ from 'jquery';
window.$ = $;

(function () {
  const settings = {
    parent: '.select-toggle',
    child: '.govuk-select',
    panel: '.panel',
    hiddenClass: 'govuk-visually-hidden',
    mojAddAnotherBTN: '.moj-add-another__add-button',
  };

  const mojAddAnotherBTN = $(settings.parent + ' ' + settings.mojAddAnotherBTN);

  const toggleDetails = (panel, optionIndex) => {
    const details = panel.find('span');
    details.each(function (index) {
      $(details[index]).addClass(settings.hiddenClass);
    });
    $(details[optionIndex - 1]).removeClass(settings.hiddenClass);
  };

  const togglePanel = (optionVal, panel) => {
    optionVal ? panel.removeClass(settings.hiddenClass) : panel.addClass(settings.hiddenClass);
  };

  const setSelectToggle = (params) => {
    const selectMenu = $(params.parent + ' ' + params.child);
    selectMenu.each(function () {
      $(this).on('change', function () {
        const optionVal = $(this).find(':selected').val();
        const optionIndex = $(this).find(':selected').index();
        const panel = $(this).parentsUntil(params.parent).find(params.panel);
        togglePanel(optionVal, panel);
        if (optionVal) toggleDetails(panel, optionIndex);
      });
    });
  };

  const init = (_settings) => {
    const settings = _settings;
    $(mojAddAnotherBTN).on('click', function () {
      setTimeout(() => {
        setSelectToggle(settings);
        $(settings.panel).last().addClass(settings.hiddenClass);
      }, 0);
    });

    setSelectToggle(settings);
  };

  init(settings);
})();
